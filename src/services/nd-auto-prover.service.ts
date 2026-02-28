import { Injectable } from '@angular/core';
import { FormulaNode } from '../models/formula-node';
import { NdHypothesis, NdDischarge } from '../models/nd-hypothesis';
import { NdJudgement } from '../models/nd-judgement';
import { NdNode } from '../models/nd-node';
import { NdRule } from '../models/nd-rule';
import { Equality } from '../utils/equality';
import { FormulaFactories } from '../utils/ast-factories';

@Injectable({ providedIn: 'root' })
export class NdAutoProverService {
  private nodeSeq = 0;
  private hypSeq = 0;
  private failedStates = new Set<string>();
  private activeStates = new Set<string>();

  buildAutoTree(judgement: NdJudgement, depthLimit = 28): NdNode | null {
    this.nodeSeq = 0;
    this.hypSeq = 0;
    this.failedStates.clear();
    this.activeStates.clear();

    const normalizedJudgement = {
      context: judgement.context.map((formula) => this.normalizeFormula(formula)),
      goal: this.normalizeFormula(judgement.goal)
    };

    const initialHypotheses = normalizedJudgement.context.map((formula) => this.createHypothesis(formula, 'root'));
    return this.prove(normalizedJudgement.context, normalizedJudgement.goal, initialHypotheses, depthLimit);
  }

  private prove(context: FormulaNode[], goal: FormulaNode, openHypotheses: NdHypothesis[], fuel: number): NdNode | null {
    if (fuel <= 0) {
      return null;
    }

    const stateKey = this.buildStateKey(context, goal, fuel, 'prove');
    if (this.failedStates.has(stateKey) || this.activeStates.has(stateKey)) {
      return null;
    }
    this.activeStates.add(stateKey);

    const result = this.proveInternal(context, goal, openHypotheses, fuel);

    this.activeStates.delete(stateKey);
    if (!result) {
      this.failedStates.add(stateKey);
    }
    return result;
  }

  private proveInternal(context: FormulaNode[], goal: FormulaNode, openHypotheses: NdHypothesis[], fuel: number): NdNode | null {
    const direct = this.proveDirect(context, goal, openHypotheses, fuel);
    if (direct) return direct;

    switch (goal.kind) {
      case 'Implies': {
        const introduced = this.createHypothesis(goal.left, '');
        const bodyProof = this.prove([...context, goal.left], goal.right, [...openHypotheses, introduced], fuel - 1);
        if (!bodyProof) break;
        return this.createNode('→I', context, goal, [bodyProof], openHypotheses, [
          { hypothesisId: introduced.id, label: introduced.label }
        ]);
      }
      case 'And': {
        const leftProof = this.prove(context, goal.left, openHypotheses, fuel - 1);
        if (!leftProof) break;
        const rightProof = this.prove(context, goal.right, openHypotheses, fuel - 1);
        if (!rightProof) break;
        return this.createNode('∧I', context, goal, [leftProof, rightProof], openHypotheses, []);
      }
      case 'Or': {
        const leftSize = this.formulaSize(goal.left);
        const rightSize = this.formulaSize(goal.right);
        const first = leftSize <= rightSize
          ? { branch: goal.left, rule: '∨I1' as NdRule }
          : { branch: goal.right, rule: '∨I2' as NdRule };
        const second = first.rule === '∨I1'
          ? { branch: goal.right, rule: '∨I2' as NdRule }
          : { branch: goal.left, rule: '∨I1' as NdRule };

        const firstProof = this.prove(context, first.branch, openHypotheses, fuel - 1);
        if (firstProof) {
          return this.createNode(first.rule, context, goal, [firstProof], openHypotheses, []);
        }

        const secondProof = this.prove(context, second.branch, openHypotheses, fuel - 1);
        if (secondProof) {
          return this.createNode(second.rule, context, goal, [secondProof], openHypotheses, []);
        }
        break;
      }
      case 'True':
        return this.createNode('⊤I', context, goal, [], openHypotheses, []);
      default:
        break;
    }

    return this.synthesize(context, goal, openHypotheses, fuel - 1);
  }

  private synthesize(context: FormulaNode[], target: FormulaNode, openHypotheses: NdHypothesis[], fuel: number): NdNode | null {
    if (fuel <= 0) {
      return null;
    }

    const stateKey = this.buildStateKey(context, target, fuel, 'synth');
    if (this.failedStates.has(stateKey) || this.activeStates.has(stateKey)) {
      return null;
    }
    this.activeStates.add(stateKey);

    const result = this.synthesizeInternal(context, target, openHypotheses, fuel);

    this.activeStates.delete(stateKey);
    if (!result) {
      this.failedStates.add(stateKey);
    }
    return result;
  }

  private synthesizeInternal(context: FormulaNode[], target: FormulaNode, openHypotheses: NdHypothesis[], fuel: number): NdNode | null {
    const direct = this.proveDirect(context, target, openHypotheses, fuel);
    if (direct) return direct;

    const derived = this.deriveByConjunction(context, openHypotheses);

    const implications = derived
      .filter((entry): entry is { formula: Extract<FormulaNode, { kind: 'Implies' }>; proof: NdNode } => entry.formula.kind === 'Implies')
      .sort((left, right) => this.formulaSize(left.formula.left) - this.formulaSize(right.formula.left));

    for (const implicationEntry of implications) {
      const implication = implicationEntry.formula;
      const implicationProof = implicationEntry.proof;

      if (!Equality.formulasEqual(implication.right, target)) {
        if (
          implication.right.kind === 'And' &&
          !Equality.formulasEqual(implication.right.left, target) &&
          !Equality.formulasEqual(implication.right.right, target)
        ) {
          continue;
        }
      }

      const antecedentProof = this.prove(context, implication.left, openHypotheses, fuel - 1);
      if (!antecedentProof) continue;

      const derivedConsequent = this.createNode('→E', context, implication.right, [implicationProof, antecedentProof], openHypotheses, []);

      if (Equality.formulasEqual(implication.right, target)) {
        return this.createNode('→E', context, target, [implicationProof, antecedentProof], openHypotheses, []);
      }

      if (implication.right.kind === 'And') {
        if (Equality.formulasEqual(implication.right.left, target)) {
          return this.createNode('∧E1', context, target, [derivedConsequent], openHypotheses, []);
        }
        if (Equality.formulasEqual(implication.right.right, target)) {
          return this.createNode('∧E2', context, target, [derivedConsequent], openHypotheses, []);
        }
      }
    }

    const disjunctions = derived.filter((entry): entry is { formula: Extract<FormulaNode, { kind: 'Or' }>; proof: NdNode } => entry.formula.kind === 'Or');
    for (const disjunctionEntry of disjunctions) {
      const disjunction = disjunctionEntry.formula;
      const disjunctionProof = disjunctionEntry.proof;

      const leftHypothesis = this.createHypothesis(disjunction.left, '');
      const rightHypothesis = this.createHypothesis(disjunction.right, '');

      const leftProof = this.prove(
        [...context, disjunction.left],
        target,
        [...openHypotheses, leftHypothesis],
        fuel - 1
      );
      if (!leftProof) continue;

      const rightProof = this.prove(
        [...context, disjunction.right],
        target,
        [...openHypotheses, rightHypothesis],
        fuel - 1
      );
      if (!rightProof) continue;

      const discharges: NdDischarge[] = [
        { hypothesisId: leftHypothesis.id, label: leftHypothesis.label },
        { hypothesisId: rightHypothesis.id, label: rightHypothesis.label }
      ];

      return this.createNode('∨E', context, target, [disjunctionProof, leftProof, rightProof], openHypotheses, discharges);
    }

    return null;
  }

  private proveDirect(context: FormulaNode[], goal: FormulaNode, openHypotheses: NdHypothesis[], fuel: number): NdNode | null {
    if (context.some((formula) => Equality.formulasEqual(formula, goal))) {
      return this.createNode('∅', context, goal, [], openHypotheses, []);
    }

    const derivedByAnd = this.deriveByConjunction(context, openHypotheses)
      .find((entry) => Equality.formulasEqual(entry.formula, goal));
    if (derivedByAnd) {
      return derivedByAnd.proof;
    }

    const bottom = FormulaFactories.false();
    const bottomProof = this.deriveByConjunction(context, openHypotheses)
      .find((entry) => Equality.formulasEqual(entry.formula, bottom))?.proof;
    if (bottomProof && fuel > 0) {
      return this.createNode('⊥E', context, goal, [bottomProof], openHypotheses, []);
    }

    return null;
  }

  private axForAssumption(context: FormulaNode[], formula: FormulaNode, openHypotheses: NdHypothesis[]): NdNode | null {
    if (!context.some((entry) => Equality.formulasEqual(entry, formula))) {
      return null;
    }
    return this.createNode('∅', context, formula, [], openHypotheses, []);
  }

  private normalizeFormula(formula: FormulaNode): FormulaNode {
    switch (formula.kind) {
      case 'Paren':
        return this.normalizeFormula(formula.inner);
      case 'Not':
        return {
          kind: 'Implies',
          left: this.normalizeFormula(formula.inner),
          right: { kind: 'False' }
        };
      case 'Implies':
        return {
          kind: 'Implies',
          left: this.normalizeFormula(formula.left),
          right: this.normalizeFormula(formula.right)
        };
      case 'And':
        return {
          kind: 'And',
          left: this.normalizeFormula(formula.left),
          right: this.normalizeFormula(formula.right)
        };
      case 'Or':
        return {
          kind: 'Or',
          left: this.normalizeFormula(formula.left),
          right: this.normalizeFormula(formula.right)
        };
      default:
        return formula;
    }
  }

  private formulaSize(formula: FormulaNode): number {
    switch (formula.kind) {
      case 'Implies':
      case 'And':
      case 'Or':
        return 1 + this.formulaSize(formula.left) + this.formulaSize(formula.right);
      case 'Not':
      case 'Paren':
        return 1 + this.formulaSize(formula.inner);
      default:
        return 1;
    }
  }

  private formulaKey(formula: FormulaNode): string {
    switch (formula.kind) {
      case 'Var':
        return `v:${formula.name}`;
      case 'True':
        return '⊤';
      case 'False':
        return '⊥';
      case 'Implies':
        return `(${this.formulaKey(formula.left)}→${this.formulaKey(formula.right)})`;
      case 'And':
        return `(${this.formulaKey(formula.left)}∧${this.formulaKey(formula.right)})`;
      case 'Or':
        return `(${this.formulaKey(formula.left)}∨${this.formulaKey(formula.right)})`;
      case 'Not':
        return `¬${this.formulaKey(formula.inner)}`;
      case 'Paren':
        return this.formulaKey(formula.inner);
      case 'Forall':
        return `∀${formula.variable}.${this.formulaKey(formula.body)}`;
      case 'Exists':
        return `∃${formula.variable}.${this.formulaKey(formula.body)}`;
      case 'Predicate':
        return `${formula.name}(${formula.args.map((arg) => JSON.stringify(arg)).join(',')})`;
      default:
        return JSON.stringify(formula);
    }
  }

  private contextKey(context: FormulaNode[]): string {
    return [...new Set(context.map((formula) => this.formulaKey(formula)))].sort().join('|');
  }

  private deriveByConjunction(context: FormulaNode[], openHypotheses: NdHypothesis[]): Array<{ formula: FormulaNode; proof: NdNode }> {
    const result: Array<{ formula: FormulaNode; proof: NdNode }> = [];
    const queue: Array<{ formula: FormulaNode; proof: NdNode }> = [];

    const add = (formula: FormulaNode, proof: NdNode): void => {
      if (result.some((entry) => Equality.formulasEqual(entry.formula, formula))) {
        return;
      }
      const entry = { formula, proof };
      result.push(entry);
      queue.push(entry);
    };

    for (const formula of context) {
      add(formula, this.createNode('∅', context, formula, [], openHypotheses, []));
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.formula.kind !== 'And') continue;

      add(
        current.formula.left,
        this.createNode('∧E1', context, current.formula.left, [current.proof], openHypotheses, [])
      );
      add(
        current.formula.right,
        this.createNode('∧E2', context, current.formula.right, [current.proof], openHypotheses, [])
      );
    }

    return result;
  }

  private buildStateKey(context: FormulaNode[], goal: FormulaNode, fuel: number, mode: 'prove' | 'synth'): string {
    return `${mode}::${this.contextKey(context)}⊢${this.formulaKey(goal)}::${fuel}`;
  }

  private createNode(
    rule: NdRule,
    context: FormulaNode[],
    goal: FormulaNode,
    premises: NdNode[],
    openHypotheses: NdHypothesis[],
    discharges: NdDischarge[]
  ): NdNode {
    const id = `nd-node-${++this.nodeSeq}`;
    return {
      id,
      rule,
      judgement: {
        context: [...context],
        goal
      },
      premises,
      openHypotheses: [...openHypotheses],
      discharges,
      branchStatus: 'open'
    };
  }

  private createHypothesis(formula: FormulaNode, parentNodeId: string): NdHypothesis {
    const index = ++this.hypSeq;
    return {
      id: `nd-hyp-${index}`,
      label: String.fromCharCode(96 + ((index - 1) % 26) + 1),
      formula,
      introducedAtNodeId: parentNodeId
    };
  }
}
