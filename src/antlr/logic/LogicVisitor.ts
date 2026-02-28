// Generated from Logic.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { SequentContext } from "./LogicParser.js";
import { AssumptionsContext } from "./LogicParser.js";
import { ConclusionContext } from "./LogicParser.js";
import { FormulaContext } from "./LogicParser.js";
import { ForallContext } from "./LogicParser.js";
import { ExistsContext } from "./LogicParser.js";
import { ImplicationContext } from "./LogicParser.js";
import { DisjunctionContext } from "./LogicParser.js";
import { ConjunctionContext } from "./LogicParser.js";
import { NegationContext } from "./LogicParser.js";
import { AtomContext } from "./LogicParser.js";
import { PredicateContext } from "./LogicParser.js";
import { TermListContext } from "./LogicParser.js";
import { TermContext } from "./LogicParser.js";
import { VariableContext } from "./LogicParser.js";
import { ConstantContext } from "./LogicParser.js";
import { FunctionAppContext } from "./LogicParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LogicParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class LogicVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `LogicParser.sequent`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSequent?: (ctx: SequentContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.assumptions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssumptions?: (ctx: AssumptionsContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.conclusion`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConclusion?: (ctx: ConclusionContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.formula`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormula?: (ctx: FormulaContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.forall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForall?: (ctx: ForallContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.exists`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExists?: (ctx: ExistsContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.implication`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImplication?: (ctx: ImplicationContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.disjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDisjunction?: (ctx: DisjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.conjunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConjunction?: (ctx: ConjunctionContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.negation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNegation?: (ctx: NegationContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.predicate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPredicate?: (ctx: PredicateContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.termList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTermList?: (ctx: TermListContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.term`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerm?: (ctx: TermContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.variable`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariable?: (ctx: VariableContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.constant`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstant?: (ctx: ConstantContext) => Result;
    /**
     * Visit a parse tree produced by `LogicParser.functionApp`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionApp?: (ctx: FunctionAppContext) => Result;
}

