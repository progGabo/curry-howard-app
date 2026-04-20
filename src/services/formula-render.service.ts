import { Injectable } from '@angular/core';
import { FormulaNode, SequentNode, TermNode } from '../models/formula-node';

@Injectable({ providedIn: 'root' })
export class FormulaRenderService {
  sequentToLatex(sequent: SequentNode): string {
    const assumptions = sequent.assumptions.map((formula) => this.formulaToLatex(formula)).join(',\\, ');
    const conclusion = sequent.conclusions[0] ? this.formulaToLatex(sequent.conclusions[0]) : '';
    return `${assumptions} \\vdash ${conclusion}`;
  }

  formulaToLatex(formula: FormulaNode): string {
    switch (formula.kind) {
      case 'Var':
        return this.escapeIdentifier(formula.name);
      case 'Not':
        return `\\lnot ${this.parenthesize(formula.inner, formula)}`;
      case 'And':
        return `${this.parenthesize(formula.left, formula, 'left')} \\land ${this.parenthesize(formula.right, formula, 'right')}`;
      case 'Or':
        return `${this.parenthesize(formula.left, formula, 'left')} \\lor ${this.parenthesize(formula.right, formula, 'right')}`;
      case 'Implies':
        return `${this.parenthesize(formula.left, formula, 'left')} \\to ${this.parenthesize(formula.right, formula, 'right')}`;
      case 'Forall':
        if (formula.domain) {
          return `\\forall ${this.escapeIdentifier(formula.variable)}:${this.formulaToLatex(formula.domain)}.\\, ${this.parenthesize(formula.body, formula)}`;
        }
        return `\\forall ${this.escapeIdentifier(formula.variable)}.\\, ${this.parenthesize(formula.body, formula)}`;
      case 'Exists':
        if (formula.domain) {
          return `\\exists ${this.escapeIdentifier(formula.variable)}:${this.formulaToLatex(formula.domain)}.\\, ${this.parenthesize(formula.body, formula)}`;
        }
        return `\\exists ${this.escapeIdentifier(formula.variable)}.\\, ${this.parenthesize(formula.body, formula)}`;
      case 'Predicate': {
        const args = formula.args.map((term) => this.termToLatex(term)).join(',\\, ');
        return `\\mathrm{${this.escapeText(formula.name)}}(${args})`;
      }
      case 'Paren':
        return `(${this.formulaToLatex(formula.inner)})`;
      case 'True':
        return '\\top';
      case 'False':
        return '\\bot';
      default:
        return '\\text{unknown}';
    }
  }

  termToLatex(term: TermNode): string {
    switch (term.kind) {
      case 'TermVar':
        return this.escapeIdentifier(term.name);
      case 'TermConst':
        return `\\mathrm{${this.escapeText(term.name)}}`;
      case 'TermFunc': {
        const args = term.args.map((arg) => this.termToLatex(arg)).join(',\\, ');
        return `\\mathrm{${this.escapeText(term.name)}}(${args})`;
      }
      default:
        return '\\text{unknownTerm}';
    }
  }

  private precedence(formula: FormulaNode): number {
    switch (formula.kind) {
      case 'Var':
      case 'Predicate':
      case 'True':
      case 'False':
        return 6;
      case 'Not':
        return 5;
      case 'And':
        return 4;
      case 'Or':
        return 3;
      case 'Forall':
      case 'Exists':
        return 2;
      case 'Implies':
        return 1;
      case 'Paren':
        return 7;
      default:
        return -1;
    }
  }

  private parenthesize(child: FormulaNode, parent: FormulaNode, side: 'left' | 'right' | 'only' = 'only'): string {
    const childLatex = this.formulaToLatex(child);
    const cp = this.precedence(child);
    const pp = this.precedence(parent);

    if (cp < pp) return `(${childLatex})`;

    if (cp === pp) {
      if (parent.kind === 'Implies' && side === 'left' && child.kind === 'Implies') return `(${childLatex})`;
      if (parent.kind === 'And' && side === 'right' && child.kind === 'And') return `(${childLatex})`;
      if (parent.kind === 'Or' && side === 'right' && child.kind === 'Or') return `(${childLatex})`;
    }

    return childLatex;
  }

  private escapeIdentifier(value: string): string {
    return value.replace(/_/g, '\\_');
  }

  private escapeText(value: string): string {
    return value
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/([{}%$&#_^])/g, '\\$1');
  }
}