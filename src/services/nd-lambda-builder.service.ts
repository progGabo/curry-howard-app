import { Injectable } from '@angular/core';
import { NdNode } from '../models/nd-node';
import { ExprNode } from '../models/lambda-node';
import { ExprFactories } from '../utils/ast-factories';
import { FormulaTypeService } from './formula-type-service';
import { Equality } from '../utils/equality';
import { NdHypothesis } from '../models/nd-hypothesis';
import { TermNode } from '../models/formula-node';

@Injectable({ providedIn: 'root' })
export class NdLambdaBuilderService {
  private freshCounter = 0;

  constructor(private formulaType: FormulaTypeService) {}

  buildLambda(root: NdNode): ExprNode | null {
    this.freshCounter = 0;

    const env = new Map<string, string>();
    for (const hypothesis of root.openHypotheses ?? []) {
      env.set(hypothesis.id, this.freshName('x'));
    }

    return this.extract(root, env);
  }

  private extract(node: NdNode, env: Map<string, string>): ExprNode | null {
    if (!node) {
      return null;
    }

    if (!node.premises?.length) {
      return this.extractLeaf(node, env);
    }

    switch (node.rule) {
      case '→I': {
        const implication = node.judgement.goal;
        if (implication.kind !== 'Implies' || node.premises.length < 1) return null;

        const dischargedId = node.discharges?.[0]?.hypothesisId;
        if (!dischargedId) return null;

        const param = this.freshName('x');
        const childEnv = new Map(env);
        childEnv.set(dischargedId, param);

        const body = this.extract(node.premises[0], childEnv);
        if (!body) return null;

        return ExprFactories.abs(param, this.formulaType.formulaToType(implication.left), body);
      }

      case '→E': {
        if (node.premises.length < 2) return null;
        const fn = this.extract(node.premises[0], env);
        const arg = this.extract(node.premises[1], env);
        if (!fn || !arg) return null;
        return ExprFactories.app(fn, arg);
      }

      case '∧I': {
        if (node.premises.length < 2) return null;
        const left = this.extract(node.premises[0], env);
        const right = this.extract(node.premises[1], env);
        if (!left || !right) return null;
        return ExprFactories.pair(left, right);
      }

      case '∧E1': {
        if (node.premises.length < 1) return null;
        const pairExpr = this.extract(node.premises[0], env);
        if (!pairExpr) return null;
        return ExprFactories.fst(pairExpr);
      }

      case '∧E2': {
        if (node.premises.length < 1) return null;
        const pairExpr = this.extract(node.premises[0], env);
        if (!pairExpr) return null;
        return ExprFactories.snd(pairExpr);
      }

      case '∨I1':
      case '∨I2': {
        if (node.premises.length < 1) return null;
        const branch = this.extract(node.premises[0], env);
        if (!branch) return null;

        const goalType = this.formulaType.formulaToType(node.judgement.goal);
        return node.rule === '∨I1'
          ? ExprFactories.inl(branch, goalType)
          : ExprFactories.inr(branch, goalType);
      }

      case '∨E': {
        if (node.premises.length < 3) return null;
        const disjunctionExpr = this.extract(node.premises[0], env);
        if (!disjunctionExpr) return null;

        const disjunctionFormula = node.premises[0].judgement.goal;
        if (disjunctionFormula.kind !== 'Or') return null;

        const leftHypId = node.discharges?.[0]?.hypothesisId;
        const rightHypId = node.discharges?.[1]?.hypothesisId;
        if (!leftHypId || !rightHypId) return null;

        const leftVar = this.freshName('x');
        const rightVar = this.freshName('y');

        const leftEnv = new Map(env);
        leftEnv.set(leftHypId, leftVar);
        const rightEnv = new Map(env);
        rightEnv.set(rightHypId, rightVar);

        const leftBranch = this.extract(node.premises[1], leftEnv);
        const rightBranch = this.extract(node.premises[2], rightEnv);
        if (!leftBranch || !rightBranch) return null;

        const leftType = this.formulaType.formulaToType(disjunctionFormula.left);
        const rightType = this.formulaType.formulaToType(disjunctionFormula.right);

        return ExprFactories.case(
          disjunctionExpr,
          leftVar,
          leftType,
          leftBranch,
          rightVar,
          rightType,
          rightBranch
        );
      }

      case '¬I': {
        const goal = node.judgement.goal;
        if (goal.kind !== 'Not' || node.premises.length < 1) return null;

        const dischargedId = node.discharges?.[0]?.hypothesisId;
        if (!dischargedId) return null;

        const param = this.freshName('x');
        const childEnv = new Map(env);
        childEnv.set(dischargedId, param);

        const body = this.extract(node.premises[0], childEnv);
        if (!body) return null;

        return ExprFactories.abs(param, this.formulaType.formulaToType(goal.inner), body);
      }

      case '¬E': {
        if (node.premises.length < 2) return null;
        const left = this.extract(node.premises[0], env);
        const right = this.extract(node.premises[1], env);
        if (!left || !right) return null;
        return ExprFactories.app(right, left);
      }

      case '⊥E': {
        if (node.premises.length < 1) return null;
        const bottomProof = this.extract(node.premises[0], env);
        if (!bottomProof) return null;
        return ExprFactories.abort(bottomProof, this.formulaType.formulaToType(node.judgement.goal));
      }

      case '⊤I':
        return ExprFactories.true();

      case '∀I': {
        const goal = node.judgement.goal;
        if (goal.kind !== 'Forall' || node.premises.length < 1) return null;

        const param = this.pickBinderName(goal.variable || 'x');
        const paramType = this.formulaType.inferQuantifierParamType(goal);
        const bodyRaw = this.extract(node.premises[0], env);
        if (!bodyRaw) return null;

        const eigen = node.quantifierMeta?.eigenVariable;
        const body = eigen ? this.substituteFreeVariable(bodyRaw, eigen, param) : bodyRaw;
        if (!body) return null;

        return ExprFactories.dependentAbs(param, paramType, body);
      }

      case '∀E': {
        if (node.premises.length < 1) return null;
        const universal = this.extract(node.premises[0], env);
        if (!universal) return null;

        const forallFormula = node.premises[0].judgement.goal;
        if (forallFormula.kind !== 'Forall') return universal;

        const witnessTerm = node.quantifierMeta?.instantiationTerm ?? { kind: 'TermVar', name: forallFormula.variable };
        return ExprFactories.app(universal, this.termToExpr(witnessTerm));
      }

      case '∃I': {
        const goal = node.judgement.goal;
        if (goal.kind !== 'Exists' || node.premises.length < 1) return null;

        const proof = this.extract(node.premises[0], env);
        if (!proof) return null;

        const witnessType = this.formulaType.inferQuantifierParamType(goal);
        const witnessTerm = node.quantifierMeta?.instantiationTerm ?? { kind: 'TermVar', name: goal.variable };
        const witness = this.termToExpr(witnessTerm);
        return ExprFactories.dependentPair(witness, witnessType, proof);
      }

      case '∃E': {
        if (node.premises.length < 2) return null;
        const existential = this.extract(node.premises[0], env);
        if (!existential) return null;

        const existsFormula = node.premises[0].judgement.goal;
        if (existsFormula.kind !== 'Exists') return null;

        const dischargedId = node.discharges?.[0]?.hypothesisId;
        if (!dischargedId) return null;

        const x = this.pickBinderName(existsFormula.variable || 'x');
        const p = this.freshName('p');

        const childEnv = new Map(env);
        childEnv.set(dischargedId, p);
        const inExprRaw = this.extract(node.premises[1], childEnv);
        if (!inExprRaw) return null;

        const eigen = node.quantifierMeta?.eigenVariable;
        const inExpr = eigen ? this.substituteFreeVariable(inExprRaw, eigen, x) : inExprRaw;
        if (!inExpr) return null;

        const xType = this.formulaType.inferQuantifierParamType(existsFormula);
        const pType = this.formulaType.formulaToType(existsFormula.body);

        return ExprFactories.letDependentPair(x, xType, p, pType, existential, inExpr);
      }

      default:
        return null;
    }
  }

  private extractLeaf(node: NdNode, env: Map<string, string>): ExprNode | null {
    if (node.rule === '⊤I') {
      return ExprFactories.true();
    }

    if (node.rule === 'Ax' || node.branchStatus === 'closed-hypothesis') {
      const matchedHypothesis = this.matchLeafHypothesis(node, env);
      if (!matchedHypothesis) return null;
      const variable = env.get(matchedHypothesis.id);
      return variable ? ExprFactories.var(variable) : null;
    }

    return null;
  }

  private matchLeafHypothesis(node: NdNode, env: Map<string, string>): NdHypothesis | null {
    const candidates = (node.openHypotheses ?? [])
      .filter((hypothesis) => env.has(hypothesis.id) && Equality.formulasEqual(hypothesis.formula, node.judgement.goal))
      .sort((left, right) => left.id.localeCompare(right.id));

    return candidates[0] ?? null;
  }

  private freshName(_prefix: string): string {
    this.freshCounter += 1;
    return this.alphaSuffix(this.freshCounter - 1);
  }

  private alphaSuffix(index: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let value = index;
    let suffix = '';

    do {
      suffix = alphabet[value % 26] + suffix;
      value = Math.floor(value / 26) - 1;
    } while (value >= 0);

    return suffix;
  }

  private pickBinderName(preferred: string): string {
    const cleaned = preferred.replace(/[^a-zA-Z0-9_]/g, '') || 'x';
    return cleaned;
  }

  private termToExpr(term: TermNode): ExprNode {
    switch (term.kind) {
      case 'TermVar':
      case 'TermConst':
        return ExprFactories.var(term.name);
      case 'TermFunc': {
        let fn: ExprNode = ExprFactories.var(term.name);
        for (const arg of term.args) {
          fn = ExprFactories.app(fn, this.termToExpr(arg));
        }
        return fn;
      }
    }
  }

  private substituteFreeVariable(expr: ExprNode, from: string, to: string): ExprNode {
    if (from === to) return expr;

    const freeInExpr = this.collectFreeVariables(expr);
    const visit = (node: ExprNode, bound: Set<string>): ExprNode => {
      switch (node.kind) {
        case 'Var':
          if (node.name === from && !bound.has(from)) {
            return ExprFactories.var(to);
          }
          return node;

        case 'Abs':
          return this.visitUnaryBinder(node, 'param', 'body', visit, bound, from, to, freeInExpr);
        case 'DependentAbs':
          return this.visitUnaryBinder(node, 'param', 'body', visit, bound, from, to, freeInExpr);
        case 'Let':
          return {
            ...node,
            value: visit(node.value, bound),
            inExpr: this.visitWithBinder(node.inExpr, node.name, visit, bound, from, to, freeInExpr)
          };
        case 'LetPair': {
          const inWithX = this.visitWithBinder(node.inExpr, node.x, visit, bound, from, to, freeInExpr);
          return {
            ...node,
            pair: visit(node.pair, bound),
            inExpr: this.visitWithBinder(inWithX, node.y, visit, bound, from, to, freeInExpr)
          };
        }
        case 'LetDependentPair': {
          const inWithX = this.visitWithBinder(node.inExpr, node.x, visit, bound, from, to, freeInExpr);
          return {
            ...node,
            pair: visit(node.pair, bound),
            inExpr: this.visitWithBinder(inWithX, node.p, visit, bound, from, to, freeInExpr)
          };
        }
        case 'Case':
          return {
            ...node,
            expr: visit(node.expr, bound),
            leftBranch: this.visitWithBinder(node.leftBranch, node.leftVar, visit, bound, from, to, freeInExpr),
            rightBranch: this.visitWithBinder(node.rightBranch, node.rightVar, visit, bound, from, to, freeInExpr)
          };
        case 'App':
          return { ...node, fn: visit(node.fn, bound), arg: visit(node.arg, bound) };
        case 'Pair':
          return { ...node, left: visit(node.left, bound), right: visit(node.right, bound) };
        case 'Fst':
        case 'Snd':
          return { ...node, pair: visit(node.pair, bound) };
        case 'Inl':
        case 'Inr':
        case 'Succ':
        case 'Pred':
        case 'IsZero':
        case 'Abort':
          return { ...node, expr: visit(node.expr, bound) };
        case 'If':
          return {
            ...node,
            cond: visit(node.cond, bound),
            thenBranch: visit(node.thenBranch, bound),
            elseBranch: visit(node.elseBranch, bound)
          };
        case 'DependentPair':
          return {
            ...node,
            witness: visit(node.witness, bound),
            proof: visit(node.proof, bound)
          };
        case 'True':
        case 'False':
        case 'Zero':
          return node;
      }
    };

    return visit(expr, new Set());
  }

  private visitUnaryBinder<T extends ExprNode & { param: string; body: ExprNode }>(
    node: T,
    paramKey: 'param',
    bodyKey: 'body',
    visit: (node: ExprNode, bound: Set<string>) => ExprNode,
    bound: Set<string>,
    from: string,
    to: string,
    freeInExpr: Set<string>
  ): T {
    const param = node[paramKey];
    const body = this.visitWithBinder(node[bodyKey], param, visit, bound, from, to, freeInExpr);
    return { ...node, [bodyKey]: body } as T;
  }

  private visitWithBinder(
    body: ExprNode,
    binder: string,
    visit: (node: ExprNode, bound: Set<string>) => ExprNode,
    bound: Set<string>,
    from: string,
    to: string,
    freeInExpr: Set<string>
  ): ExprNode {
    const nextBound = new Set(bound);
    nextBound.add(binder);

    if (binder === from) {
      return visit(body, nextBound);
    }

    if (binder !== to) {
      return visit(body, nextBound);
    }

    if (!freeInExpr.has(from)) {
      return visit(body, nextBound);
    }

    const fresh = this.freshAvoiding(new Set([...this.collectFreeVariables(body), ...bound, from, to]));
    const renamedBody = this.renameBoundVariable(body, binder, fresh);
    const renamedBound = new Set(bound);
    renamedBound.add(fresh);
    return visit(renamedBody, renamedBound);
  }

  private renameBoundVariable(expr: ExprNode, oldName: string, newName: string): ExprNode {
    const visit = (node: ExprNode, active: boolean): ExprNode => {
      switch (node.kind) {
        case 'Var':
          return active && node.name === oldName ? ExprFactories.var(newName) : node;
        case 'Abs': {
          if (node.param === oldName) {
            if (active) {
              return { ...node, param: newName, body: visit(node.body, true) };
            }
            return node;
          }
          return { ...node, body: visit(node.body, active) };
        }
        case 'DependentAbs': {
          if (node.param === oldName) {
            if (active) {
              return { ...node, param: newName, body: visit(node.body, true) };
            }
            return node;
          }
          return { ...node, body: visit(node.body, active) };
        }
        case 'Let':
          return {
            ...node,
            value: visit(node.value, active),
            inExpr: node.name === oldName ? (active ? visit(node.inExpr, false) : node.inExpr) : visit(node.inExpr, active)
          };
        case 'LetPair':
          return {
            ...node,
            pair: visit(node.pair, active),
            inExpr: (node.x === oldName || node.y === oldName) ? (active ? visit(node.inExpr, false) : node.inExpr) : visit(node.inExpr, active)
          };
        case 'LetDependentPair':
          return {
            ...node,
            pair: visit(node.pair, active),
            inExpr: (node.x === oldName || node.p === oldName) ? (active ? visit(node.inExpr, false) : node.inExpr) : visit(node.inExpr, active)
          };
        case 'Case':
          return {
            ...node,
            expr: visit(node.expr, active),
            leftBranch: node.leftVar === oldName ? (active ? visit(node.leftBranch, false) : node.leftBranch) : visit(node.leftBranch, active),
            rightBranch: node.rightVar === oldName ? (active ? visit(node.rightBranch, false) : node.rightBranch) : visit(node.rightBranch, active)
          };
        case 'App':
          return { ...node, fn: visit(node.fn, active), arg: visit(node.arg, active) };
        case 'Pair':
          return { ...node, left: visit(node.left, active), right: visit(node.right, active) };
        case 'Fst':
        case 'Snd':
          return { ...node, pair: visit(node.pair, active) };
        case 'Inl':
        case 'Inr':
        case 'Succ':
        case 'Pred':
        case 'IsZero':
        case 'Abort':
          return { ...node, expr: visit(node.expr, active) };
        case 'If':
          return {
            ...node,
            cond: visit(node.cond, active),
            thenBranch: visit(node.thenBranch, active),
            elseBranch: visit(node.elseBranch, active)
          };
        case 'DependentPair':
          return {
            ...node,
            witness: visit(node.witness, active),
            proof: visit(node.proof, active)
          };
        case 'True':
        case 'False':
        case 'Zero':
          return node;
      }
    };

    return visit(expr, true);
  }

  private collectFreeVariables(expr: ExprNode, bound: Set<string> = new Set()): Set<string> {
    switch (expr.kind) {
      case 'Var':
        return bound.has(expr.name) ? new Set() : new Set([expr.name]);
      case 'Abs':
      case 'DependentAbs':
        return this.collectFreeVariables(expr.body, new Set([...bound, expr.param]));
      case 'App':
        return new Set([...this.collectFreeVariables(expr.fn, bound), ...this.collectFreeVariables(expr.arg, bound)]);
      case 'Pair':
        return new Set([...this.collectFreeVariables(expr.left, bound), ...this.collectFreeVariables(expr.right, bound)]);
      case 'Fst':
      case 'Snd':
        return this.collectFreeVariables(expr.pair, bound);
      case 'Inl':
      case 'Inr':
      case 'Succ':
      case 'Pred':
      case 'IsZero':
      case 'Abort':
        return this.collectFreeVariables(expr.expr, bound);
      case 'Case':
        return new Set([
          ...this.collectFreeVariables(expr.expr, bound),
          ...this.collectFreeVariables(expr.leftBranch, new Set([...bound, expr.leftVar])),
          ...this.collectFreeVariables(expr.rightBranch, new Set([...bound, expr.rightVar]))
        ]);
      case 'Let':
        return new Set([
          ...this.collectFreeVariables(expr.value, bound),
          ...this.collectFreeVariables(expr.inExpr, new Set([...bound, expr.name]))
        ]);
      case 'LetPair':
        return new Set([
          ...this.collectFreeVariables(expr.pair, bound),
          ...this.collectFreeVariables(expr.inExpr, new Set([...bound, expr.x, expr.y]))
        ]);
      case 'DependentPair':
        return new Set([
          ...this.collectFreeVariables(expr.witness, bound),
          ...this.collectFreeVariables(expr.proof, bound)
        ]);
      case 'LetDependentPair':
        return new Set([
          ...this.collectFreeVariables(expr.pair, bound),
          ...this.collectFreeVariables(expr.inExpr, new Set([...bound, expr.x, expr.p]))
        ]);
      case 'If':
        return new Set([
          ...this.collectFreeVariables(expr.cond, bound),
          ...this.collectFreeVariables(expr.thenBranch, bound),
          ...this.collectFreeVariables(expr.elseBranch, bound)
        ]);
      case 'True':
      case 'False':
      case 'Zero':
        return new Set();
    }
  }

  private freshAvoiding(avoid: Set<string>): string {
    let candidate = this.freshName('x');
    while (avoid.has(candidate)) {
      candidate = this.freshName('x');
    }
    return candidate;
  }
}
