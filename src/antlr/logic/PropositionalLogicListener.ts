// Generated from PropositionalLogic.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


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
 * This interface defines a complete listener for a parse tree produced by
 * `PropositionalLogicParser`.
 */
export class PropositionalLogicListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.sequent`.
     * @param ctx the parse tree
     */
    enterSequent?: (ctx: SequentContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.sequent`.
     * @param ctx the parse tree
     */
    exitSequent?: (ctx: SequentContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.assumptions`.
     * @param ctx the parse tree
     */
    enterAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.assumptions`.
     * @param ctx the parse tree
     */
    exitAssumptions?: (ctx: AssumptionsContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.conclusion`.
     * @param ctx the parse tree
     */
    enterConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.conclusion`.
     * @param ctx the parse tree
     */
    exitConclusion?: (ctx: ConclusionContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.formula`.
     * @param ctx the parse tree
     */
    enterFormula?: (ctx: FormulaContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.formula`.
     * @param ctx the parse tree
     */
    exitFormula?: (ctx: FormulaContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.implication`.
     * @param ctx the parse tree
     */
    enterImplication?: (ctx: ImplicationContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.implication`.
     * @param ctx the parse tree
     */
    exitImplication?: (ctx: ImplicationContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.disjunction`.
     * @param ctx the parse tree
     */
    enterDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.disjunction`.
     * @param ctx the parse tree
     */
    exitDisjunction?: (ctx: DisjunctionContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.conjunction`.
     * @param ctx the parse tree
     */
    enterConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.conjunction`.
     * @param ctx the parse tree
     */
    exitConjunction?: (ctx: ConjunctionContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.negation`.
     * @param ctx the parse tree
     */
    enterNegation?: (ctx: NegationContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.negation`.
     * @param ctx the parse tree
     */
    exitNegation?: (ctx: NegationContext) => void;
    /**
     * Enter a parse tree produced by `PropositionalLogicParser.atom`.
     * @param ctx the parse tree
     */
    enterAtom?: (ctx: AtomContext) => void;
    /**
     * Exit a parse tree produced by `PropositionalLogicParser.atom`.
     * @param ctx the parse tree
     */
    exitAtom?: (ctx: AtomContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

