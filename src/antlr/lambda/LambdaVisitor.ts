// Generated from src/antlr/lambda/Lambda.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { ProgramContext } from "./LambdaParser.js";
import { TermContext } from "./LambdaParser.js";
import { LamExprContext } from "./LambdaParser.js";
import { LetExprContext } from "./LambdaParser.js";
import { LetPairExprContext } from "./LambdaParser.js";
import { LetDependentPairExprContext } from "./LambdaParser.js";
import { IfExprContext } from "./LambdaParser.js";
import { CaseExprContext } from "./LambdaParser.js";
import { AppExprContext } from "./LambdaParser.js";
import { AtomContext } from "./LambdaParser.js";
import { TypeContext } from "./LambdaParser.js";
import { SumTypeContext } from "./LambdaParser.js";
import { ProdTypeContext } from "./LambdaParser.js";
import { AtomicTypeContext } from "./LambdaParser.js";
import { PredicateTypeContext } from "./LambdaParser.js";
import { TypeListContext } from "./LambdaParser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LambdaParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class LambdaVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `LambdaParser.program`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProgram?: (ctx: ProgramContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.term`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerm?: (ctx: TermContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.lamExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLamExpr?: (ctx: LamExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.letExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetExpr?: (ctx: LetExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.letPairExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetPairExpr?: (ctx: LetPairExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.letDependentPairExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLetDependentPairExpr?: (ctx: LetDependentPairExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.ifExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfExpr?: (ctx: IfExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.caseExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCaseExpr?: (ctx: CaseExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.appExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAppExpr?: (ctx: AppExprContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.type`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitType?: (ctx: TypeContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.sumType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSumType?: (ctx: SumTypeContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.prodType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProdType?: (ctx: ProdTypeContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.atomicType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtomicType?: (ctx: AtomicTypeContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.predicateType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPredicateType?: (ctx: PredicateTypeContext) => Result;
    /**
     * Visit a parse tree produced by `LambdaParser.typeList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeList?: (ctx: TypeListContext) => Result;
}

