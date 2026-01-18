// Generated from PropositionalLogic.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { PropositionalLogicListener } from "./PropositionalLogicListener.js";
import { PropositionalLogicVisitor } from "./PropositionalLogicVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class PropositionalLogicParser extends antlr.Parser {
    public static readonly T__0 = 1;
    public static readonly TURNSTILE = 2;
    public static readonly IMPL = 3;
    public static readonly AND = 4;
    public static readonly OR = 5;
    public static readonly NOT = 6;
    public static readonly LPAREN = 7;
    public static readonly RPAREN = 8;
    public static readonly ATOM = 9;
    public static readonly WS = 10;
    public static readonly RULE_sequent = 0;
    public static readonly RULE_assumptions = 1;
    public static readonly RULE_conclusion = 2;
    public static readonly RULE_formula = 3;
    public static readonly RULE_implication = 4;
    public static readonly RULE_disjunction = 5;
    public static readonly RULE_conjunction = 6;
    public static readonly RULE_negation = 7;
    public static readonly RULE_atom = 8;

    public static readonly literalNames = [
        null, "','", null, null, null, null, null, "'('", "')'"
    ];

    public static readonly symbolicNames = [
        null, null, "TURNSTILE", "IMPL", "AND", "OR", "NOT", "LPAREN", "RPAREN", 
        "ATOM", "WS"
    ];
    public static readonly ruleNames = [
        "sequent", "assumptions", "conclusion", "formula", "implication", 
        "disjunction", "conjunction", "negation", "atom",
    ];

    public get grammarFileName(): string { return "PropositionalLogic.g4"; }
    public get literalNames(): (string | null)[] { return PropositionalLogicParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return PropositionalLogicParser.symbolicNames; }
    public get ruleNames(): string[] { return PropositionalLogicParser.ruleNames; }
    public get serializedATN(): number[] { return PropositionalLogicParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, PropositionalLogicParser._ATN, PropositionalLogicParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public sequent(): SequentContext {
        let localContext = new SequentContext(this.context, this.state);
        this.enterRule(localContext, 0, PropositionalLogicParser.RULE_sequent);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 19;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 704) !== 0)) {
                {
                this.state = 18;
                this.assumptions();
                }
            }

            this.state = 21;
            this.match(PropositionalLogicParser.TURNSTILE);
            this.state = 23;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 704) !== 0)) {
                {
                this.state = 22;
                this.conclusion();
                }
            }

            this.state = 25;
            this.match(PropositionalLogicParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public assumptions(): AssumptionsContext {
        let localContext = new AssumptionsContext(this.context, this.state);
        this.enterRule(localContext, 2, PropositionalLogicParser.RULE_assumptions);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 27;
            this.formula();
            this.state = 32;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1) {
                {
                {
                this.state = 28;
                this.match(PropositionalLogicParser.T__0);
                this.state = 29;
                this.formula();
                }
                }
                this.state = 34;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conclusion(): ConclusionContext {
        let localContext = new ConclusionContext(this.context, this.state);
        this.enterRule(localContext, 4, PropositionalLogicParser.RULE_conclusion);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 35;
            this.formula();
            this.state = 40;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1) {
                {
                {
                this.state = 36;
                this.match(PropositionalLogicParser.T__0);
                this.state = 37;
                this.formula();
                }
                }
                this.state = 42;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public formula(): FormulaContext {
        let localContext = new FormulaContext(this.context, this.state);
        this.enterRule(localContext, 6, PropositionalLogicParser.RULE_formula);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 43;
            this.implication();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public implication(): ImplicationContext {
        let localContext = new ImplicationContext(this.context, this.state);
        this.enterRule(localContext, 8, PropositionalLogicParser.RULE_implication);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 45;
            this.disjunction();
            this.state = 48;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 3) {
                {
                this.state = 46;
                this.match(PropositionalLogicParser.IMPL);
                this.state = 47;
                this.implication();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public disjunction(): DisjunctionContext {
        let localContext = new DisjunctionContext(this.context, this.state);
        this.enterRule(localContext, 10, PropositionalLogicParser.RULE_disjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 50;
            this.conjunction();
            this.state = 55;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 5) {
                {
                {
                this.state = 51;
                this.match(PropositionalLogicParser.OR);
                this.state = 52;
                this.conjunction();
                }
                }
                this.state = 57;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conjunction(): ConjunctionContext {
        let localContext = new ConjunctionContext(this.context, this.state);
        this.enterRule(localContext, 12, PropositionalLogicParser.RULE_conjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 58;
            this.negation();
            this.state = 63;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 59;
                this.match(PropositionalLogicParser.AND);
                this.state = 60;
                this.negation();
                }
                }
                this.state = 65;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public negation(): NegationContext {
        let localContext = new NegationContext(this.context, this.state);
        this.enterRule(localContext, 14, PropositionalLogicParser.RULE_negation);
        try {
            this.state = 69;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case PropositionalLogicParser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 66;
                this.match(PropositionalLogicParser.NOT);
                this.state = 67;
                this.negation();
                }
                break;
            case PropositionalLogicParser.LPAREN:
            case PropositionalLogicParser.ATOM:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 68;
                this.atom();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public atom(): AtomContext {
        let localContext = new AtomContext(this.context, this.state);
        this.enterRule(localContext, 16, PropositionalLogicParser.RULE_atom);
        try {
            this.state = 76;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case PropositionalLogicParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 71;
                this.match(PropositionalLogicParser.LPAREN);
                this.state = 72;
                this.formula();
                this.state = 73;
                this.match(PropositionalLogicParser.RPAREN);
                }
                break;
            case PropositionalLogicParser.ATOM:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 75;
                this.match(PropositionalLogicParser.ATOM);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,10,79,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,1,0,3,0,20,8,0,1,0,1,0,3,0,24,8,0,1,0,1,0,1,1,
        1,1,1,1,5,1,31,8,1,10,1,12,1,34,9,1,1,2,1,2,1,2,5,2,39,8,2,10,2,
        12,2,42,9,2,1,3,1,3,1,4,1,4,1,4,3,4,49,8,4,1,5,1,5,1,5,5,5,54,8,
        5,10,5,12,5,57,9,5,1,6,1,6,1,6,5,6,62,8,6,10,6,12,6,65,9,6,1,7,1,
        7,1,7,3,7,70,8,7,1,8,1,8,1,8,1,8,1,8,3,8,77,8,8,1,8,0,0,9,0,2,4,
        6,8,10,12,14,16,0,0,78,0,19,1,0,0,0,2,27,1,0,0,0,4,35,1,0,0,0,6,
        43,1,0,0,0,8,45,1,0,0,0,10,50,1,0,0,0,12,58,1,0,0,0,14,69,1,0,0,
        0,16,76,1,0,0,0,18,20,3,2,1,0,19,18,1,0,0,0,19,20,1,0,0,0,20,21,
        1,0,0,0,21,23,5,2,0,0,22,24,3,4,2,0,23,22,1,0,0,0,23,24,1,0,0,0,
        24,25,1,0,0,0,25,26,5,0,0,1,26,1,1,0,0,0,27,32,3,6,3,0,28,29,5,1,
        0,0,29,31,3,6,3,0,30,28,1,0,0,0,31,34,1,0,0,0,32,30,1,0,0,0,32,33,
        1,0,0,0,33,3,1,0,0,0,34,32,1,0,0,0,35,40,3,6,3,0,36,37,5,1,0,0,37,
        39,3,6,3,0,38,36,1,0,0,0,39,42,1,0,0,0,40,38,1,0,0,0,40,41,1,0,0,
        0,41,5,1,0,0,0,42,40,1,0,0,0,43,44,3,8,4,0,44,7,1,0,0,0,45,48,3,
        10,5,0,46,47,5,3,0,0,47,49,3,8,4,0,48,46,1,0,0,0,48,49,1,0,0,0,49,
        9,1,0,0,0,50,55,3,12,6,0,51,52,5,5,0,0,52,54,3,12,6,0,53,51,1,0,
        0,0,54,57,1,0,0,0,55,53,1,0,0,0,55,56,1,0,0,0,56,11,1,0,0,0,57,55,
        1,0,0,0,58,63,3,14,7,0,59,60,5,4,0,0,60,62,3,14,7,0,61,59,1,0,0,
        0,62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,64,13,1,0,0,0,65,63,
        1,0,0,0,66,67,5,6,0,0,67,70,3,14,7,0,68,70,3,16,8,0,69,66,1,0,0,
        0,69,68,1,0,0,0,70,15,1,0,0,0,71,72,5,7,0,0,72,73,3,6,3,0,73,74,
        5,8,0,0,74,77,1,0,0,0,75,77,5,9,0,0,76,71,1,0,0,0,76,75,1,0,0,0,
        77,17,1,0,0,0,9,19,23,32,40,48,55,63,69,76
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!PropositionalLogicParser.__ATN) {
            PropositionalLogicParser.__ATN = new antlr.ATNDeserializer().deserialize(PropositionalLogicParser._serializedATN);
        }

        return PropositionalLogicParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(PropositionalLogicParser.literalNames, PropositionalLogicParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return PropositionalLogicParser.vocabulary;
    }

    private static readonly decisionsToDFA = PropositionalLogicParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class SequentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TURNSTILE(): antlr.TerminalNode {
        return this.getToken(PropositionalLogicParser.TURNSTILE, 0)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(PropositionalLogicParser.EOF, 0)!;
    }
    public assumptions(): AssumptionsContext | null {
        return this.getRuleContext(0, AssumptionsContext);
    }
    public conclusion(): ConclusionContext | null {
        return this.getRuleContext(0, ConclusionContext);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_sequent;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterSequent) {
             listener.enterSequent(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitSequent) {
             listener.exitSequent(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitSequent) {
            return visitor.visitSequent(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AssumptionsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public formula(): FormulaContext[];
    public formula(i: number): FormulaContext | null;
    public formula(i?: number): FormulaContext[] | FormulaContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FormulaContext);
        }

        return this.getRuleContext(i, FormulaContext);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_assumptions;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterAssumptions) {
             listener.enterAssumptions(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitAssumptions) {
             listener.exitAssumptions(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitAssumptions) {
            return visitor.visitAssumptions(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ConclusionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public formula(): FormulaContext[];
    public formula(i: number): FormulaContext | null;
    public formula(i?: number): FormulaContext[] | FormulaContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FormulaContext);
        }

        return this.getRuleContext(i, FormulaContext);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_conclusion;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterConclusion) {
             listener.enterConclusion(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitConclusion) {
             listener.exitConclusion(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitConclusion) {
            return visitor.visitConclusion(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FormulaContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public implication(): ImplicationContext {
        return this.getRuleContext(0, ImplicationContext)!;
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_formula;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterFormula) {
             listener.enterFormula(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitFormula) {
             listener.exitFormula(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitFormula) {
            return visitor.visitFormula(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ImplicationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public disjunction(): DisjunctionContext {
        return this.getRuleContext(0, DisjunctionContext)!;
    }
    public IMPL(): antlr.TerminalNode | null {
        return this.getToken(PropositionalLogicParser.IMPL, 0);
    }
    public implication(): ImplicationContext | null {
        return this.getRuleContext(0, ImplicationContext);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_implication;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterImplication) {
             listener.enterImplication(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitImplication) {
             listener.exitImplication(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitImplication) {
            return visitor.visitImplication(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DisjunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public conjunction(): ConjunctionContext[];
    public conjunction(i: number): ConjunctionContext | null;
    public conjunction(i?: number): ConjunctionContext[] | ConjunctionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConjunctionContext);
        }

        return this.getRuleContext(i, ConjunctionContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(PropositionalLogicParser.OR);
    	} else {
    		return this.getToken(PropositionalLogicParser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_disjunction;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterDisjunction) {
             listener.enterDisjunction(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitDisjunction) {
             listener.exitDisjunction(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitDisjunction) {
            return visitor.visitDisjunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ConjunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public negation(): NegationContext[];
    public negation(i: number): NegationContext | null;
    public negation(i?: number): NegationContext[] | NegationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(NegationContext);
        }

        return this.getRuleContext(i, NegationContext);
    }
    public AND(): antlr.TerminalNode[];
    public AND(i: number): antlr.TerminalNode | null;
    public AND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(PropositionalLogicParser.AND);
    	} else {
    		return this.getToken(PropositionalLogicParser.AND, i);
    	}
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_conjunction;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterConjunction) {
             listener.enterConjunction(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitConjunction) {
             listener.exitConjunction(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitConjunction) {
            return visitor.visitConjunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NegationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(PropositionalLogicParser.NOT, 0);
    }
    public negation(): NegationContext | null {
        return this.getRuleContext(0, NegationContext);
    }
    public atom(): AtomContext | null {
        return this.getRuleContext(0, AtomContext);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_negation;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterNegation) {
             listener.enterNegation(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitNegation) {
             listener.exitNegation(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitNegation) {
            return visitor.visitNegation(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AtomContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(PropositionalLogicParser.LPAREN, 0);
    }
    public formula(): FormulaContext | null {
        return this.getRuleContext(0, FormulaContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(PropositionalLogicParser.RPAREN, 0);
    }
    public ATOM(): antlr.TerminalNode | null {
        return this.getToken(PropositionalLogicParser.ATOM, 0);
    }
    public override get ruleIndex(): number {
        return PropositionalLogicParser.RULE_atom;
    }
    public override enterRule(listener: PropositionalLogicListener): void {
        if(listener.enterAtom) {
             listener.enterAtom(this);
        }
    }
    public override exitRule(listener: PropositionalLogicListener): void {
        if(listener.exitAtom) {
             listener.exitAtom(this);
        }
    }
    public override accept<Result>(visitor: PropositionalLogicVisitor<Result>): Result | null {
        if (visitor.visitAtom) {
            return visitor.visitAtom(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
