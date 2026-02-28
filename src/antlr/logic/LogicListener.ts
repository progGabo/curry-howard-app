// Generated from Logic.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


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
 * This interface defines a complete listener for a parse tree produced by
 * `LogicParser`.
 */
export class LogicListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `LogicParser.sequent`.
     * @param ctx the parse tree
     */
    enterSequent?: (ctx: SequentContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.sequent`.
     * @param ctx the parse tree
     */
    exitSequent?: (ctx: SequentContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.assumptions`.
     * @param ctx the parse tree
     */
    enterAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.assumptions`.
     * @param ctx the parse tree
     */
    exitAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.conclusion`.
     * @param ctx the parse tree
     */
    enterConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.conclusion`.
     * @param ctx the parse tree
     */
    exitConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.formula`.
     * @param ctx the parse tree
     */
    enterFormula?: (ctx: FormulaContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.formula`.
     * @param ctx the parse tree
     */
    exitFormula?: (ctx: FormulaContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.forall`.
     * @param ctx the parse tree
     */
    enterForall?: (ctx: ForallContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.forall`.
     * @param ctx the parse tree
     */
    exitForall?: (ctx: ForallContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.exists`.
     * @param ctx the parse tree
     */
    enterExists?: (ctx: ExistsContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.exists`.
     * @param ctx the parse tree
     */
    exitExists?: (ctx: ExistsContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.implication`.
     * @param ctx the parse tree
     */
    enterImplication?: (ctx: ImplicationContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.implication`.
     * @param ctx the parse tree
     */
    exitImplication?: (ctx: ImplicationContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.disjunction`.
     * @param ctx the parse tree
     */
    enterDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.disjunction`.
     * @param ctx the parse tree
     */
    exitDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.conjunction`.
     * @param ctx the parse tree
     */
    enterConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.conjunction`.
     * @param ctx the parse tree
     */
    exitConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.negation`.
     * @param ctx the parse tree
     */
    enterNegation?: (ctx: NegationContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.negation`.
     * @param ctx the parse tree
     */
    exitNegation?: (ctx: NegationContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.atom`.
     * @param ctx the parse tree
     */
    enterAtom?: (ctx: AtomContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.atom`.
     * @param ctx the parse tree
     */
    exitAtom?: (ctx: AtomContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.predicate`.
     * @param ctx the parse tree
     */
    enterPredicate?: (ctx: PredicateContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.predicate`.
     * @param ctx the parse tree
     */
    exitPredicate?: (ctx: PredicateContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.termList`.
     * @param ctx the parse tree
     */
    enterTermList?: (ctx: TermListContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.termList`.
     * @param ctx the parse tree
     */
    exitTermList?: (ctx: TermListContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.term`.
     * @param ctx the parse tree
     */
    enterTerm?: (ctx: TermContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.term`.
     * @param ctx the parse tree
     */
    exitTerm?: (ctx: TermContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.variable`.
     * @param ctx the parse tree
     */
    enterVariable?: (ctx: VariableContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.variable`.
     * @param ctx the parse tree
     */
    exitVariable?: (ctx: VariableContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.constant`.
     * @param ctx the parse tree
     */
    enterConstant?: (ctx: ConstantContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.constant`.
     * @param ctx the parse tree
     */
    exitConstant?: (ctx: ConstantContext) => void;
    /**
     * Enter a parse tree produced by `LogicParser.functionApp`.
     * @param ctx the parse tree
     */
    enterFunctionApp?: (ctx: FunctionAppContext) => void;
    /**
     * Exit a parse tree produced by `LogicParser.functionApp`.
     * @param ctx the parse tree
     */
    exitFunctionApp?: (ctx: FunctionAppContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

