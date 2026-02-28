import {
  SequentContext,
  AssumptionsContext,
  ConclusionContext,
  FormulaContext,
  ForallContext,
  ExistsContext,
  ImplicationContext,
  DisjunctionContext,
  ConjunctionContext,
  NegationContext,
  AtomContext,
  PredicateContext,
  TermContext,
  VariableContext,
  ConstantContext,
  FunctionAppContext,
  TermListContext
} from './LogicParser';

import { LogicVisitor } from './LogicVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ng';
import { FormulaNode, SequentNode, TermNode } from '../../models/formula-node';

export class LogicAstVisitor
  extends AbstractParseTreeVisitor<any>
  implements LogicVisitor<any> {

  protected override defaultResult(): any {
    return undefined;
  }

  visitSequent(ctx: SequentContext): SequentNode {
    const assumptions = ctx.assumptions() ? this.visit(ctx.assumptions()!) : [];
    const conclusions = ctx.conclusion() ? this.visit(ctx.conclusion()!) : [];
    return { assumptions, conclusions };
  }

  visitAssumptions(ctx: AssumptionsContext): FormulaNode[] {
    return ctx.formula().map(f => this.visit(f));
  }

  visitConclusion(ctx: ConclusionContext): FormulaNode[] {
    return ctx.formula().map(f => this.visit(f));
  }

  visitFormula(ctx: FormulaContext): FormulaNode {
    if (ctx.forall()) {
      return this.visit(ctx.forall()!);
    } else if (ctx.exists()) {
      return this.visit(ctx.exists()!);
    } else {
      return this.visit(ctx.implication()!);
    }
  }

  visitForall(ctx: ForallContext): FormulaNode {
    const variable = this.visit(ctx.variable());
    const formulaCtx = ctx.formula();
    if (!formulaCtx) {
      throw new Error('Forall missing formula body');
    }
    const body = this.visit(formulaCtx);
    return {
      kind: 'Forall',
      variable: variable.name,
      body
    };
  }

  visitExists(ctx: ExistsContext): FormulaNode {
    const variable = this.visit(ctx.variable());
    const body = this.visit(ctx.formula());
    return {
      kind: 'Exists',
      variable: variable.name,
      body
    };
  }

  visitImplication(ctx: ImplicationContext): FormulaNode {
    const left = this.visit(ctx.disjunction());
    const rightCtx = ctx.implication();

    if (rightCtx) {
      const right = this.visit(rightCtx);
      return {
        kind: 'Implies',
        left,
        right
      };
    } else {
      return left;
    }
  }

  visitDisjunction(ctx: DisjunctionContext): FormulaNode {
    const parts = ctx.conjunction().map(c => this.visit(c));
    return parts.reduce((acc, curr) => {
      return acc
        ? { kind: 'Or', left: acc, right: curr }
        : curr;
    });
  }

  visitConjunction(ctx: ConjunctionContext): FormulaNode {
    const parts = ctx.negation().map(n => this.visit(n));
    return parts.reduce((acc, curr) => {
      return acc
        ? { kind: 'And', left: acc, right: curr }
        : curr;
    });
  }

  visitNegation(ctx: NegationContext): FormulaNode {
    if (ctx.NOT()) {
      return {
        kind: 'Not',
        inner: this.visit(ctx.negation()!)
      };
    } else {
      return this.visit(ctx.atom()!);
    }
  }

  visitAtom(ctx: AtomContext): FormulaNode {
    if (ctx.predicate()) {
      return this.visit(ctx.predicate()!);
    } else if (ctx.LOWERID()) {
      return {
        kind: 'Var',
        name: ctx.LOWERID()!.getText()
      };
    } else if (ctx.PRED()) {
      return {
        kind: 'Var',
        name: ctx.PRED()!.getText()
      };
    } else {
      return this.visit(ctx.formula()!);
    }
  }

  visitPredicate(ctx: PredicateContext): FormulaNode {
    const name = ctx.PRED()!.getText();
    const args = ctx.termList() ? this.visit(ctx.termList()!) : [];
    return {
      kind: 'Predicate',
      name,
      args
    };
  }

  visitTermList(ctx: TermListContext): TermNode[] {
    return ctx.term().map(t => this.visit(t));
  }

  visitTerm(ctx: TermContext): TermNode {
    if (ctx.variable()) {
      return this.visit(ctx.variable()!);
    } else if (ctx.constant()) {
      return this.visit(ctx.constant()!);
    } else if (ctx.functionApp()) {
      return this.visit(ctx.functionApp()!);
    } else {
      return this.visit(ctx.term()!);
    }
  }

  visitVariable(ctx: VariableContext): TermNode {
    return {
      kind: 'TermVar',
      name: ctx.LOWERID()!.getText()
    };
  }

  visitConstant(ctx: ConstantContext): TermNode {
    return {
      kind: 'TermConst',
      name: ctx.LOWERID()!.getText()
    };
  }

  visitFunctionApp(ctx: FunctionAppContext): TermNode {
    const name = ctx.LOWERID()!.getText();
    const args = ctx.termList() ? this.visit(ctx.termList()!) : [];
    return {
      kind: 'TermFunc',
      name,
      args
    };
  }
}