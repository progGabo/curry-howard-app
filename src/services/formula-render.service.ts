import { Injectable } from '@angular/core';
import { FormulaNode, SequentNode, TermNode } from '../models/formula-node';

@Injectable({ providedIn: 'root' })
export class FormulaRenderService {
  sequentToLatex(sequent: SequentNode): string {
    const assumptions = sequent.assumptions.map((formula) => this.formulaToLatex(formula)).join(',\\, ');
    const conclusions = sequent.conclusions.map((formula) => this.formulaToLatex(formula)).join(',\\, ');
    return `${assumptions} \\vdash ${conclusions}`;
  }

  formulaToLatex(formula: FormulaNode): string {
    switch (formula.kind) {
      case 'Var':
        return this.escapeIdentifier(formula.name);
      case 'Not':
        return `\\lnot ${this.parenthesize(formula.inner, formula)}`;
      case 'And':
        return `${this.parenthesize(formula.left, formula)} \\land ${this.parenthesize(formula.right, formula)}`;
      case 'Or':
        return `${this.parenthesize(formula.left, formula)} \\lor ${this.parenthesize(formula.right, formula)}`;
      case 'Implies':
        return `${this.parenthesize(formula.left, formula)} \\to ${this.parenthesize(formula.right, formula)}`;
      case 'Forall':
        return `\\forall ${this.escapeIdentifier(formula.variable)}.\\, ${this.formulaToLatex(formula.body)}`;
      case 'Exists':
        return `\\exists ${this.escapeIdentifier(formula.variable)}.\\, ${this.formulaToLatex(formula.body)}`;
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
        return 5;
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
      case 'Paren':
        return 6;
      default:
        return -1;
    }
  }

  private parenthesize(child: FormulaNode, parent: FormulaNode): string {
    const childLatex = this.formulaToLatex(child);
    return this.precedence(child) < this.precedence(parent) ? `(${childLatex})` : childLatex;
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