import { Injectable } from '@angular/core';
import { FormulaNode, TermNode } from '../models/formula-node';
import { NdDischarge, NdHypothesis } from '../models/nd-hypothesis';
import { NdJudgement } from '../models/nd-judgement';
import { NdNode, NdQuantifierMeta } from '../models/nd-node';
import { NdRule, NdRuleApplicationOptions } from '../models/nd-rule';
import { Equality } from '../utils/equality';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { freeVarsFormula, substituteFormula } from '../utils/quantifier-utils';

@Injectable({ providedIn: 'root' })
export class NdRuleEngineService {
  private nodeSeq = 0;
  private hypSeq = 0;

  createRoot(judgement: NdJudgement): NdNode {
    this.hypSeq = 0;
    const initialHypotheses = judgement.context.map((formula) => this.createHypothesis(formula, 'root'));
    return this.createNode('∅', judgement, [], initialHypotheses, []);
  }

  applyRule(node: NdNode, rule: NdRule, options: NdRuleApplicationOptions = {}): NdNode | null {
    const { judgement } = node;
    const goal = judgement.goal;
    const context = judgement.context;

    if (this.isHypothesisLeaf(node)) {
      return null;
    }

    switch (rule) {
      case '⊤I':
        if (goal.kind !== 'True') return null;
        return this.createNode('⊤I', judgement, [], node.openHypotheses, []);

      case '⊥E': {
        const premise = this.createNode('∅', { context, goal: FormulaFactories.false() }, [], node.openHypotheses, []);
        return this.createNode('⊥E', judgement, [premise], node.openHypotheses, []);
      }

      case '∧I':
        if (goal.kind !== 'And') return null;
        return this.createNode('∧I', judgement, [
          this.createNode('∅', { context, goal: goal.left }, [], node.openHypotheses, []),
          this.createNode('∅', { context, goal: goal.right }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);

      case '∧E1': {
        const candidate = context.find((formula) => formula.kind === 'And' && Equality.formulasEqual(formula.left, goal));
        if (!candidate || candidate.kind !== 'And') return null;
        return this.createNode('∧E1', judgement, [
          this.createNode('∅', { context, goal: candidate }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);
      }

      case '∧E2': {
        const candidate = context.find((formula) => formula.kind === 'And' && Equality.formulasEqual(formula.right, goal));
        if (!candidate || candidate.kind !== 'And') return null;
        return this.createNode('∧E2', judgement, [
          this.createNode('∅', { context, goal: candidate }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);
      }

      case '∨I1':
        if (goal.kind !== 'Or') return null;
        return this.createNode('∨I1', judgement, [
          this.createNode('∅', { context, goal: goal.left }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);

      case '∨I2':
        if (goal.kind !== 'Or') return null;
        return this.createNode('∨I2', judgement, [
          this.createNode('∅', { context, goal: goal.right }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);

      case '∨E': {
        const disjunction = context.find((formula) => formula.kind === 'Or');
        if (!disjunction || disjunction.kind !== 'Or') return null;

        const leftHyp = this.createHypothesis(disjunction.left, node.id);
        const rightHyp = this.createHypothesis(disjunction.right, node.id);
        const discharges: NdDischarge[] = [
          { hypothesisId: leftHyp.id, label: leftHyp.label },
          { hypothesisId: rightHyp.id, label: rightHyp.label }
        ];

        return this.createNode('∨E', judgement, [
          this.createNode('∅', { context, goal: disjunction }, [], node.openHypotheses, []),
          this.createNode('∅', { context: [...context, disjunction.left], goal }, [], [...node.openHypotheses, leftHyp], []),
          this.createNode('∅', { context: [...context, disjunction.right], goal }, [], [...node.openHypotheses, rightHyp], [])
        ], node.openHypotheses, discharges);
      }

      case '→I':
        if (goal.kind !== 'Implies') return null;
        {
          const hyp = this.createHypothesis(goal.left, node.id);
          const discharge: NdDischarge[] = [{ hypothesisId: hyp.id, label: hyp.label }];
          return this.createNode('→I', judgement, [
            this.createNode('∅', { context: [...context, goal.left], goal: goal.right }, [], [...node.openHypotheses, hyp], [])
          ], node.openHypotheses, discharge);
        }

      case '→E': {
        const implication = context.find((formula) => formula.kind === 'Implies' && Equality.formulasEqual(formula.right, goal));
        if (!implication || implication.kind !== 'Implies') return null;
        return this.createNode('→E', judgement, [
          this.createNode('∅', { context, goal: implication }, [], node.openHypotheses, []),
          this.createNode('∅', { context, goal: implication.left }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);
      }

      case '¬I':
        if (goal.kind !== 'Not') return null;
        {
          const hyp = this.createHypothesis(goal.inner, node.id);
          const discharge: NdDischarge[] = [{ hypothesisId: hyp.id, label: hyp.label }];
          return this.createNode('¬I', judgement, [
            this.createNode('∅', { context: [...context, goal.inner], goal: FormulaFactories.false() }, [], [...node.openHypotheses, hyp], [])
          ], node.openHypotheses, discharge);
        }

      case '¬E': {
        const notCandidate = context.find((formula) => formula.kind === 'Not');
        if (!notCandidate || notCandidate.kind !== 'Not') return null;
        if (goal.kind !== 'False') return null;
        return this.createNode('¬E', judgement, [
          this.createNode('∅', { context, goal: notCandidate.inner }, [], node.openHypotheses, []),
          this.createNode('∅', { context, goal: notCandidate }, [], node.openHypotheses, [])
        ], node.openHypotheses, []);
      }

      case '∀I':
        if (goal.kind !== 'Forall') return null;
        {
          const eigenVariable = options.eigenVariable?.trim() || this.generateFreshVariable(node, goal.variable);
          if (!this.isValidVariableName(eigenVariable)) return null;
          if (!this.isFreshForAllIntro(node, eigenVariable)) return null;

          const instantiatedGoal = substituteFormula(goal.body, goal.variable, TermFactories.var(eigenVariable));
          const quantifierMeta: NdQuantifierMeta = {
            binderVariable: goal.variable,
            eigenVariable,
            sideCondition: 'fresh'
          };

          return this.createNode('∀I', judgement, [
            this.createNode('∅', { context, goal: instantiatedGoal }, [], node.openHypotheses, [])
          ], node.openHypotheses, [], quantifierMeta);
        }

      case '∀E': {
        const universals = context.filter((formula) => formula.kind === 'Forall');
        if (!universals.length) return null;

        const selectedTerm = options.instantiationTerm;

        for (const candidate of universals) {
          if (candidate.kind !== 'Forall') continue;
          const term = selectedTerm ?? this.inferInstantiationTerm(candidate.body, candidate.variable, goal);
          if (!term) continue;

          const instantiated = substituteFormula(candidate.body, candidate.variable, term);
          if (!Equality.formulasEqual(instantiated, goal)) continue;

          const quantifierMeta: NdQuantifierMeta = {
            binderVariable: candidate.variable,
            instantiationTerm: term
          };

          return this.createNode('∀E', judgement, [
            this.createNode('∅', { context, goal: candidate }, [], node.openHypotheses, [])
          ], node.openHypotheses, [], quantifierMeta);
        }

        return null;
      }

      case '∃I':
        if (goal.kind !== 'Exists') return null;
        {
          const witnessTerm = options.instantiationTerm ?? TermFactories.var(goal.variable);
          const witnessGoal = substituteFormula(goal.body, goal.variable, witnessTerm);
          const quantifierMeta: NdQuantifierMeta = {
            binderVariable: goal.variable,
            instantiationTerm: witnessTerm
          };

          return this.createNode('∃I', judgement, [
            this.createNode('∅', { context, goal: witnessGoal }, [], node.openHypotheses, [])
          ], node.openHypotheses, [], quantifierMeta);
        }

      case '∃E': {
        const existential = context.find((formula) => formula.kind === 'Exists');
        if (!existential || existential.kind !== 'Exists') return null;

        const eigenVariable = options.eigenVariable?.trim() || this.generateFreshVariable(node, existential.variable);
        if (!this.isValidVariableName(eigenVariable)) return null;
        if (!this.isFreshForExistsElim(node, eigenVariable)) return null;

        const instantiatedHypothesis = substituteFormula(
          existential.body,
          existential.variable,
          TermFactories.var(eigenVariable)
        );
        const hyp = this.createHypothesis(instantiatedHypothesis, node.id);
        const discharge: NdDischarge[] = [{ hypothesisId: hyp.id, label: hyp.label }];
        const quantifierMeta: NdQuantifierMeta = {
          binderVariable: existential.variable,
          eigenVariable,
          sideCondition: 'fresh'
        };

        return this.createNode('∃E', judgement, [
          this.createNode('∅', { context, goal: existential }, [], node.openHypotheses, []),
          this.createNode('∅', { context: [...context, instantiatedHypothesis], goal }, [], [...node.openHypotheses, hyp], [])
        ], node.openHypotheses, discharge, quantifierMeta);
      }

      default:
        return null;
    }
  }

  isHypothesisLeaf(node: NdNode): boolean {
    return node.judgement.context.some((formula) => Equality.formulasEqual(formula, node.judgement.goal));
  }

  private createNode(
    rule: NdRule,
    judgement: NdJudgement,
    premises: NdNode[],
    openHypotheses: NdHypothesis[],
    discharges: NdDischarge[],
    quantifierMeta?: NdQuantifierMeta
  ): NdNode {
    return {
      id: `nd-node-${++this.nodeSeq}`,
      rule,
      judgement: { context: [...judgement.context], goal: judgement.goal },
      premises,
      openHypotheses: [...openHypotheses],
      discharges,
      branchStatus: 'open',
      quantifierMeta
    };
  }

  private isValidVariableName(name: string): boolean {
    return /^[a-z][a-zA-Z0-9_]*$/.test(name);
  }

  private isFreshForAllIntro(node: NdNode, variable: string): boolean {
    return !node.judgement.context.some((formula) => freeVarsFormula(formula).has(variable));
  }

  private isFreshForExistsElim(node: NdNode, variable: string): boolean {
    if (node.judgement.context.some((formula) => freeVarsFormula(formula).has(variable))) {
      return false;
    }
    return !freeVarsFormula(node.judgement.goal).has(variable);
  }

  private generateFreshVariable(node: NdNode, base: string): string {
    const used = new Set<string>();

    for (const formula of node.judgement.context) {
      for (const symbol of freeVarsFormula(formula)) {
        used.add(symbol);
      }
    }
    for (const symbol of freeVarsFormula(node.judgement.goal)) {
      used.add(symbol);
    }

    let idx = 0;
    let candidate = base;
    while (used.has(candidate)) {
      idx += 1;
      candidate = `${base}${idx}`;
    }
    return candidate;
  }

  private inferInstantiationTerm(body: FormulaNode, variable: string, target: FormulaNode): TermNode | null {
    const candidates = this.collectTerms(target);
    candidates.push(TermFactories.var(variable));

    for (const candidate of candidates) {
      const instantiated = substituteFormula(body, variable, candidate);
      if (Equality.formulasEqual(instantiated, target)) {
        return candidate;
      }
    }

    return null;
  }

  private collectTerms(formula: FormulaNode): TermNode[] {
    const collected: TermNode[] = [];

    const visitTerm = (term: TermNode): void => {
      collected.push(term);
      if (term.kind === 'TermFunc') {
        term.args.forEach(visitTerm);
      }
    };

    const visitFormula = (current: FormulaNode): void => {
      switch (current.kind) {
        case 'Predicate':
          current.args.forEach(visitTerm);
          break;
        case 'Implies':
        case 'And':
        case 'Or':
          visitFormula(current.left);
          visitFormula(current.right);
          break;
        case 'Forall':
        case 'Exists':
          visitFormula(current.body);
          break;
        case 'Not':
        case 'Paren':
          visitFormula(current.inner);
          break;
        default:
          break;
      }
    };

    visitFormula(formula);
    return collected;
  }

  private createHypothesis(formula: FormulaNode, parentNodeId: string): NdHypothesis {
    const idx = ++this.hypSeq;
    return {
      id: `nd-hyp-${idx}`,
      label: String.fromCharCode(96 + ((idx - 1) % 26) + 1),
      formula,
      introducedAtNodeId: parentNodeId
    };
  }
}
