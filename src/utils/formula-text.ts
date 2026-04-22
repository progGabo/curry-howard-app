import { FormulaNode, TermNode } from '../models/formula-node';

export function formulaPrecedence(formula: FormulaNode): number {
  switch (formula.kind) {
    case 'Var':
    case 'Predicate':
    case 'True':
    case 'False':
      return 5;
    case 'Paren':
      return 6;
    case 'Forall':
    case 'Exists':
      return 4;
    case 'Not':
      return 3;
    case 'And':
      return 2;
    case 'Or':
      return 1;
    case 'Implies':
      return 0;
    default:
      return -1;
  }
}

export function formulaToText(formula: FormulaNode): string {
  switch (formula.kind) {
    case 'Var':
      return formula.name;
    case 'Predicate':
      return `${formula.name}(${formula.args.map(termToText).join(', ')})`;
    case 'Not':
      return formula.inner ? `¬${parenthesizeFormula(formula.inner, formula)}` : '¬‹missing›';
    case 'And':
      return formula.left && formula.right
        ? `${parenthesizeFormula(formula.left, formula)} ∧ ${parenthesizeFormula(formula.right, formula)}`
        : '‹∧ error›';
    case 'Or':
      return formula.left && formula.right
        ? `${parenthesizeFormula(formula.left, formula)} ∨ ${parenthesizeFormula(formula.right, formula)}`
        : '‹∨ error›';
    case 'Implies':
      return formula.left && formula.right
        ? `${parenthesizeFormula(formula.left, formula)} → ${parenthesizeFormula(formula.right, formula)}`
        : '‹→ error›';
    case 'Forall':
      if (formula.domain) {
        return `∀${formula.variable}:${formulaToText(formula.domain)}. ${formulaToText(formula.body)}`;
      }
      return `∀${formula.variable}. ${formulaToText(formula.body)}`;
    case 'Exists':
      if (formula.domain) {
        return `∃${formula.variable}:${formulaToText(formula.domain)}. ${formulaToText(formula.body)}`;
      }
      return `∃${formula.variable}. ${formulaToText(formula.body)}`;
    case 'Paren':
      return formula.inner ? `(${formulaToText(formula.inner)})` : '()';
    case 'True':
      return '⊤';
    case 'False':
      return '⊥';
    default:
      return '';
  }
}

export function termToText(term: TermNode): string {
  switch (term.kind) {
    case 'TermVar':
    case 'TermConst':
      return term.name;
    case 'TermFunc':
      return `${term.name}(${term.args.map(termToText).join(', ')})`;
    default:
      return '';
  }
}

export function parenthesizeFormula(child: FormulaNode, parent: FormulaNode): string {
  if (!child) return '‹undefined›';
  const text = formulaToText(child);
  return formulaPrecedence(child) < formulaPrecedence(parent) ? `(${text})` : text;
}

export function sequentToText(sequent: { assumptions: FormulaNode[];  }): string {
  const assumptions = sequent.assumptions.map(formulaToText).join(', ');
  const conclusion = sequent.conclusions[0] ? formulaToText(sequent.conclusions[0]) : '';
  return `${assumptions} ⊢ ${conclusion}`;
}
