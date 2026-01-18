// Generated from PredicateLogic.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


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
 * This interface defines a complete listener for a parse tree produced by
 * `PredicateLogicParser`.
 */
export class PredicateLogicListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `PredicateLogicParser.sequent`.
     * @param ctx the parse tree
     */
    enterSequent?: (ctx: SequentContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.sequent`.
     * @param ctx the parse tree
     */
    exitSequent?: (ctx: SequentContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.assumptions`.
     * @param ctx the parse tree
     */
    enterAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.assumptions`.
     * @param ctx the parse tree
     */
    exitAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.conclusion`.
     * @param ctx the parse tree
     */
    enterConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.conclusion`.
     * @param ctx the parse tree
     */
    exitConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.formula`.
     * @param ctx the parse tree
     */
    enterFormula?: (ctx: FormulaContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.formula`.
     * @param ctx the parse tree
     */
    exitFormula?: (ctx: FormulaContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.forall`.
     * @param ctx the parse tree
     */
    enterForall?: (ctx: ForallContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.forall`.
     * @param ctx the parse tree
     */
    exitForall?: (ctx: ForallContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.exists`.
     * @param ctx the parse tree
     */
    enterExists?: (ctx: ExistsContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.exists`.
     * @param ctx the parse tree
     */
    exitExists?: (ctx: ExistsContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.implication`.
     * @param ctx the parse tree
     */
    enterImplication?: (ctx: ImplicationContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.implication`.
     * @param ctx the parse tree
     */
    exitImplication?: (ctx: ImplicationContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.disjunction`.
     * @param ctx the parse tree
     */
    enterDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.disjunction`.
     * @param ctx the parse tree
     */
    exitDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.conjunction`.
     * @param ctx the parse tree
     */
    enterConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.conjunction`.
     * @param ctx the parse tree
     */
    exitConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.negation`.
     * @param ctx the parse tree
     */
    enterNegation?: (ctx: NegationContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.negation`.
     * @param ctx the parse tree
     */
    exitNegation?: (ctx: NegationContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.atom`.
     * @param ctx the parse tree
     */
    enterAtom?: (ctx: AtomContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.atom`.
     * @param ctx the parse tree
     */
    exitAtom?: (ctx: AtomContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.predicate`.
     * @param ctx the parse tree
     */
    enterPredicate?: (ctx: PredicateContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.predicate`.
     * @param ctx the parse tree
     */
    exitPredicate?: (ctx: PredicateContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.termList`.
     * @param ctx the parse tree
     */
    enterTermList?: (ctx: TermListContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.termList`.
     * @param ctx the parse tree
     */
    exitTermList?: (ctx: TermListContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.term`.
     * @param ctx the parse tree
     */
    enterTerm?: (ctx: TermContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.term`.
     * @param ctx the parse tree
     */
    exitTerm?: (ctx: TermContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.variable`.
     * @param ctx the parse tree
     */
    enterVariable?: (ctx: VariableContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.variable`.
     * @param ctx the parse tree
     */
    exitVariable?: (ctx: VariableContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.constant`.
     * @param ctx the parse tree
     */
    enterConstant?: (ctx: ConstantContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.constant`.
     * @param ctx the parse tree
     */
    exitConstant?: (ctx: ConstantContext) => void;
    /**
     * Enter a parse tree produced by `PredicateLogicParser.functionApp`.
     * @param ctx the parse tree
     */
    enterFunctionApp?: (ctx: FunctionAppContext) => void;
    /**
     * Exit a parse tree produced by `PredicateLogicParser.functionApp`.
     * @param ctx the parse tree
     */
    exitFunctionApp?: (ctx: FunctionAppContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

