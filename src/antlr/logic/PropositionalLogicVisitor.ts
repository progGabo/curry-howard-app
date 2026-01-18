// Generated from PropositionalLogic.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { SequentContext } from "./PropositionalLogicParser.js";
import { AssumptionsContext } from "./PropositionalLogicParser.js";
import { ConclusionContext } from "./PropositionalLogicParser.js";
import { FormulaContext } from "./PropositionalLogicParser.js";
import { ImplicationContext } from "./PropositionalLogicParser.js";
import { DisjunctionContext } from "./PropositionalLogicParser.js";
import { ConjunctionContext } from "./PropositionalLogicParser.js";
import { NegationContext } from "./PropositionalLogicParser.js";
import { AtomContext } from "./PropositionalLogicParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `PropositionalLogicParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class PropositionalLogicVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.sequent`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSequent?: (ctx: SequentContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.assumptions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssumptions?: (ctx: AssumptionsContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.conclusion`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConclusion?: (ctx: ConclusionContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.formula`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormula?: (ctx: FormulaContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.implication`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImplication?: (ctx: ImplicationContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.disjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDisjunction?: (ctx: DisjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.conjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConjunction?: (ctx: ConjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.negation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNegation?: (ctx: NegationContext) => Result;
    /**
     * Visit a parse tree produced by `PropositionalLogicParser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;
}

