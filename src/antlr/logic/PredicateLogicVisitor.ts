// Generated from PredicateLogic.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { SequentContext } from "./PredicateLogicParser.js";
import { AssumptionsContext } from "./PredicateLogicParser.js";
import { ConclusionContext } from "./PredicateLogicParser.js";
import { FormulaContext } from "./PredicateLogicParser.js";
import { ForallContext } from "./PredicateLogicParser.js";
import { ExistsContext } from "./PredicateLogicParser.js";
import { ImplicationContext } from "./PredicateLogicParser.js";
import { DisjunctionContext } from "./PredicateLogicParser.js";
import { ConjunctionContext } from "./PredicateLogicParser.js";
import { NegationContext } from "./PredicateLogicParser.js";
import { AtomContext } from "./PredicateLogicParser.js";
import { PredicateContext } from "./PredicateLogicParser.js";
import { TermListContext } from "./PredicateLogicParser.js";
import { TermContext } from "./PredicateLogicParser.js";
import { VariableContext } from "./PredicateLogicParser.js";
import { ConstantContext } from "./PredicateLogicParser.js";
import { FunctionAppContext } from "./PredicateLogicParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `PredicateLogicParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class PredicateLogicVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `PredicateLogicParser.sequent`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSequent?: (ctx: SequentContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.assumptions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssumptions?: (ctx: AssumptionsContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.conclusion`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConclusion?: (ctx: ConclusionContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.formula`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormula?: (ctx: FormulaContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.forall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForall?: (ctx: ForallContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.exists`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExists?: (ctx: ExistsContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.implication`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImplication?: (ctx: ImplicationContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.disjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDisjunction?: (ctx: DisjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.conjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConjunction?: (ctx: ConjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.negation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNegation?: (ctx: NegationContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPredicate?: (ctx: PredicateContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.termList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTermList?: (ctx: TermListContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.term`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerm?: (ctx: TermContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.variable`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariable?: (ctx: VariableContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.constant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstant?: (ctx: ConstantContext) => Result;
    /**
     * Visit a parse tree produced by `PredicateLogicParser.functionApp`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionApp?: (ctx: FunctionAppContext) => Result;
}

