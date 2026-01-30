// Generated from src/antlr/lambda/Lambda.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


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
 * This interface defines a complete listener for a parse tree produced by
 * `LambdaParser`.
 */
export class LambdaListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `LambdaParser.program`.
     * @param ctx the parse tree
     */
    enterProgram?: (ctx: ProgramContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.program`.
     * @param ctx the parse tree
     */
    exitProgram?: (ctx: ProgramContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.term`.
     * @param ctx the parse tree
     */
    enterTerm?: (ctx: TermContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.term`.
     * @param ctx the parse tree
     */
    exitTerm?: (ctx: TermContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.lamExpr`.
     * @param ctx the parse tree
     */
    enterLamExpr?: (ctx: LamExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.lamExpr`.
     * @param ctx the parse tree
     */
    exitLamExpr?: (ctx: LamExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.letExpr`.
     * @param ctx the parse tree
     */
    enterLetExpr?: (ctx: LetExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.letExpr`.
     * @param ctx the parse tree
     */
    exitLetExpr?: (ctx: LetExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.letPairExpr`.
     * @param ctx the parse tree
     */
    enterLetPairExpr?: (ctx: LetPairExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.letPairExpr`.
     * @param ctx the parse tree
     */
    exitLetPairExpr?: (ctx: LetPairExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.letDependentPairExpr`.
     * @param ctx the parse tree
     */
    enterLetDependentPairExpr?: (ctx: LetDependentPairExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.letDependentPairExpr`.
     * @param ctx the parse tree
     */
    exitLetDependentPairExpr?: (ctx: LetDependentPairExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.ifExpr`.
     * @param ctx the parse tree
     */
    enterIfExpr?: (ctx: IfExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.ifExpr`.
     * @param ctx the parse tree
     */
    exitIfExpr?: (ctx: IfExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.caseExpr`.
     * @param ctx the parse tree
     */
    enterCaseExpr?: (ctx: CaseExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.caseExpr`.
     * @param ctx the parse tree
     */
    exitCaseExpr?: (ctx: CaseExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.appExpr`.
     * @param ctx the parse tree
     */
    enterAppExpr?: (ctx: AppExprContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.appExpr`.
     * @param ctx the parse tree
     */
    exitAppExpr?: (ctx: AppExprContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.atom`.
     * @param ctx the parse tree
     */
    enterAtom?: (ctx: AtomContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.atom`.
     * @param ctx the parse tree
     */
    exitAtom?: (ctx: AtomContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.type`.
     * @param ctx the parse tree
     */
    enterType?: (ctx: TypeContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.type`.
     * @param ctx the parse tree
     */
    exitType?: (ctx: TypeContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.sumType`.
     * @param ctx the parse tree
     */
    enterSumType?: (ctx: SumTypeContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.sumType`.
     * @param ctx the parse tree
     */
    exitSumType?: (ctx: SumTypeContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.prodType`.
     * @param ctx the parse tree
     */
    enterProdType?: (ctx: ProdTypeContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.prodType`.
     * @param ctx the parse tree
     */
    exitProdType?: (ctx: ProdTypeContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.atomicType`.
     * @param ctx the parse tree
     */
    enterAtomicType?: (ctx: AtomicTypeContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.atomicType`.
     * @param ctx the parse tree
     */
    exitAtomicType?: (ctx: AtomicTypeContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.predicateType`.
     * @param ctx the parse tree
     */
    enterPredicateType?: (ctx: PredicateTypeContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.predicateType`.
     * @param ctx the parse tree
     */
    exitPredicateType?: (ctx: PredicateTypeContext) => void;
    /**
     * Enter a parse tree produced by `LambdaParser.typeList`.
     * @param ctx the parse tree
     */
    enterTypeList?: (ctx: TypeListContext) => void;
    /**
     * Exit a parse tree produced by `LambdaParser.typeList`.
     * @param ctx the parse tree
     */
    exitTypeList?: (ctx: TypeListContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

