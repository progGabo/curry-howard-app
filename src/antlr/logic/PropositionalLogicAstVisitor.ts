import {
  SequentContext,
  AssumptionsContext,
  ConclusionContext,
  FormulaContext,
  ImplicationContext,
  DisjunctionContext,
  ConjunctionContext,
  NegationContext,
  AtomContext
} from './PropositionalLogicParser';

import { PropositionalLogicVisitor } from './PropositionalLogicVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ng';
import { FormulaNode, SequentNode } from '../../models/formula-node';

export class PropositionalLogicAstVisitor
  extends AbstractParseTreeVisitor<any>
  implements PropositionalLogicVisitor<any> {

  protected override defaultResult(): any {
    return undefined;
  }

  visitSequent(ctx: SequentContext): SequentNode {
    const assumptions = ctx.assumptions() ? this.visit(ctx.assumptions()!) : [];
    const conclusions = ctx.conclusion() ? this.visit(ctx.conclusion()!) : [];
    return { assumptions, conclusions };
  }

  visitConclusion(ctx: ConclusionContext): FormulaNode[] {
    return ctx.formula().map(f => this.visit(f));
  }

  visitFormula(ctx: FormulaContext): FormulaNode {
    return this.visit(ctx.implication());
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
    if (ctx.ATOM()) {
      return {
        kind: 'Var',
        name: ctx.ATOM()!.getText()
      };
    } else {
      return this.visit(ctx.formula()!); // zátvorky
    }
  }
}
