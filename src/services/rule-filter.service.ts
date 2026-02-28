import { Injectable } from '@angular/core';
import { DerivationNode } from '../models/formula-node';
import { NdNode } from '../models/nd-node';
import { TypeInferenceNode } from './type-inference-service';

type InteractiveSubmode = 'applicable' | 'all' | 'predict';

@Injectable({ providedIn: 'root' })
export class RuleFilterService {
  /**
   * Filter proof rules by applicability to the current sequent when submode is 'applicable'.
   */
  filterProofRules(
    rules: readonly string[],
    popupNode: DerivationNode | NdNode | TypeInferenceNode | null,
    interactiveSubmode: InteractiveSubmode
  ): string[] {
    if (interactiveSubmode !== 'applicable' || !popupNode || !('sequent' in popupNode)) {
      return [...rules];
    }
    const node = popupNode as DerivationNode;
    const s = node.sequent;
    const hasInConcl = (k: string) => s.conclusions.some((f) => f.kind === (k as never));
    const hasInAssump = (k: string) => s.assumptions.some((f) => f.kind === (k as never));
    return rules.filter((r) => {
      switch (r) {
        case '→R':
          return hasInConcl('Implies');
        case '∧R':
          return hasInConcl('And');
        case '∨R':
          return hasInConcl('Or');
        case '¬R':
          return hasInConcl('Not');
        case '∀R':
          return hasInConcl('Forall');
        case '∃R':
          return hasInConcl('Exists');
        case '→L':
          return hasInAssump('Implies');
        case '∧L':
          return hasInAssump('And');
        case '∨L':
          return hasInAssump('Or');
        case '¬L':
          return hasInAssump('Not');
        case '∀L':
          return hasInAssump('Forall');
        case '∃L':
          return hasInAssump('Exists');
        case 'WL':
        case 'WR':
        case 'Ax':
          return true;
        default:
          return true;
      }
    });
  }

  filterNdRules(
    rules: readonly string[],
    popupNode: DerivationNode | NdNode | TypeInferenceNode | null,
    interactiveSubmode: InteractiveSubmode
  ): string[] {
    if (interactiveSubmode !== 'applicable' || !popupNode || !('judgement' in popupNode)) {
      return [...rules];
    }

    const node = popupNode as NdNode;
    const goal = node.judgement.goal;
    const context = node.judgement.context;
    const hasInContext = (k: string) => context.some((f) => f.kind === (k as never));

    return rules.filter((rule) => {
      switch (rule) {
        case '⊤I':
          return goal.kind === 'True';
        case '⊥E':
          return true;
        case '¬I':
          return goal.kind === 'Not';
        case '¬E':
          return goal.kind === 'False' && hasInContext('Not');
        case '∧I':
          return goal.kind === 'And';
        case '∧E1':
        case '∧E2':
          return hasInContext('And');
        case '∨I1':
        case '∨I2':
          return goal.kind === 'Or';
        case '∨E':
          return hasInContext('Or');
        case '→I':
          return goal.kind === 'Implies';
        case '→E':
          return hasInContext('Implies');
        case '∀I':
          return goal.kind === 'Forall';
        case '∀E':
          return hasInContext('Forall');
        case '∃I':
          return goal.kind === 'Exists';
        case '∃E':
          return hasInContext('Exists');
        default:
          return true;
      }
    });
  }

  /**
   * Filter type inference rules by applicability to the current expression when submode is 'applicable'.
   */
  filterTypeRules(
    rules: readonly string[],
    popupNode: DerivationNode | NdNode | TypeInferenceNode | null,
    interactiveSubmode: InteractiveSubmode
  ): string[] {
    if (interactiveSubmode !== 'applicable' || !popupNode || !('expression' in popupNode)) {
      return [...rules];
    }
    const node = popupNode as TypeInferenceNode;
    const expr = node.expression;
    return rules.filter((r) => {
      switch (r) {
        case 'Var':
          return expr.kind === 'Var';
        case 'Abs':
          return expr.kind === 'Abs';
        case 'App':
          return expr.kind === 'App';
        case 'Pair':
          return expr.kind === 'Pair';
        case 'LetPair':
          return expr.kind === 'LetPair';
        case 'Inl':
          return expr.kind === 'Inl';
        case 'Inr':
          return expr.kind === 'Inr';
        case 'Case':
          return expr.kind === 'Case';
        case 'If':
          return expr.kind === 'If';
        case 'Let':
          return expr.kind === 'Let';
        case 'True':
          return expr.kind === 'True';
        case 'False':
          return expr.kind === 'False';
        case 'Zero':
          return expr.kind === 'Zero';
        case 'Succ':
          return expr.kind === 'Succ';
        case 'Pred':
          return expr.kind === 'Pred';
        case 'IsZero':
          return expr.kind === 'IsZero';
        case 'DependentAbs':
          return expr.kind === 'DependentAbs';
        case 'DependentPair':
          return expr.kind === 'DependentPair';
        case 'LetDependentPair':
          return expr.kind === 'LetDependentPair';
        default:
          return true;
      }
    });
  }
}
