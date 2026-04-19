// Generated from Logic.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { LogicListener } from "./LogicListener.js";
import { LogicVisitor } from "./LogicVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class LogicParser extends antlr.Parser {
    public static readonly TURNSTILE = 1;
    public static readonly IMPL = 2;
    public static readonly AND = 3;
    public static readonly OR = 4;
    public static readonly NOT = 5;
    public static readonly TOP = 6;
    public static readonly BOT = 7;
    public static readonly FORALL = 8;
    public static readonly EXISTS = 9;
    public static readonly DOT = 10;
    public static readonly LPAREN = 11;
    public static readonly RPAREN = 12;
    public static readonly COMMA = 13;
    public static readonly PRED = 14;
    public static readonly LOWERID = 15;
    public static readonly WS = 16;
    public static readonly RULE_sequent = 0;
    public static readonly RULE_assumptions = 1;
    public static readonly RULE_conclusion = 2;
    public static readonly RULE_formula = 3;
    public static readonly RULE_implication = 4;
    public static readonly RULE_quantifiedExpr = 5;
    public static readonly RULE_forall = 6;
    public static readonly RULE_exists = 7;
    public static readonly RULE_disjunction = 8;
    public static readonly RULE_conjunction = 9;
    public static readonly RULE_negation = 10;
    public static readonly RULE_atom = 11;
    public static readonly RULE_predicate = 12;
    public static readonly RULE_termList = 13;
    public static readonly RULE_term = 14;
    public static readonly RULE_variable = 15;
    public static readonly RULE_constant = 16;
    public static readonly RULE_functionApp = 17;

    public static readonly literalNames = [
        null, null, null, null, null, null, null, null, null, null, "'.'", 
        "'('", "')'", "','"
    ];

    public static readonly symbolicNames = [
        null, "TURNSTILE", "IMPL", "AND", "OR", "NOT", "TOP", "BOT", "FORALL", 
        "EXISTS", "DOT", "LPAREN", "RPAREN", "COMMA", "PRED", "LOWERID", 
        "WS"
    ];
    public static readonly ruleNames = [
        "sequent", "assumptions", "conclusion", "formula", "implication", 
        "quantifiedExpr", "forall", "exists", "disjunction", "conjunction", 
        "negation", "atom", "predicate", "termList", "term", "variable", 
        "constant", "functionApp",
    ];

    public get grammarFileName(): string { return "Logic.g4"; }
    public get literalNames(): (string | null)[] { return LogicParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return LogicParser.symbolicNames; }
    public get ruleNames(): string[] { return LogicParser.ruleNames; }
    public get serializedATN(): number[] { return LogicParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, LogicParser._ATN, LogicParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public sequent(): SequentContext {
        let localContext = new SequentContext(this.context, this.state);
        this.enterRule(localContext, 0, LogicParser.RULE_sequent);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 37;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 52192) !== 0)) {
                {
                this.state = 36;
                this.assumptions();
                }
            }

            this.state = 39;
            this.match(LogicParser.TURNSTILE);
            this.state = 41;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 52192) !== 0)) {
                {
                this.state = 40;
                this.conclusion();
                }
            }

            this.state = 43;
            this.match(LogicParser.EOF);
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
        this.enterRule(localContext, 2, LogicParser.RULE_assumptions);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 45;
            this.formula();
            this.state = 50;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 13) {
                {
                {
                this.state = 46;
                this.match(LogicParser.COMMA);
                this.state = 47;
                this.formula();
                }
                }
                this.state = 52;
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
        this.enterRule(localContext, 4, LogicParser.RULE_conclusion);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 53;
            this.formula();
            this.state = 58;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 13) {
                {
                {
                this.state = 54;
                this.match(LogicParser.COMMA);
                this.state = 55;
                this.formula();
                }
                }
                this.state = 60;
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
        this.enterRule(localContext, 6, LogicParser.RULE_formula);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 61;
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
        this.enterRule(localContext, 8, LogicParser.RULE_implication);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 63;
            this.quantifiedExpr();
            this.state = 66;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 64;
                this.match(LogicParser.IMPL);
                this.state = 65;
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
    public quantifiedExpr(): QuantifiedExprContext {
        let localContext = new QuantifiedExprContext(this.context, this.state);
        this.enterRule(localContext, 10, LogicParser.RULE_quantifiedExpr);
        try {
            this.state = 71;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case LogicParser.FORALL:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 68;
                this.forall();
                }
                break;
            case LogicParser.EXISTS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 69;
                this.exists();
                }
                break;
            case LogicParser.NOT:
            case LogicParser.TOP:
            case LogicParser.BOT:
            case LogicParser.LPAREN:
            case LogicParser.PRED:
            case LogicParser.LOWERID:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 70;
                this.disjunction();
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
    public forall(): ForallContext {
        let localContext = new ForallContext(this.context, this.state);
        this.enterRule(localContext, 12, LogicParser.RULE_forall);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 73;
            this.match(LogicParser.FORALL);
            this.state = 74;
            this.variable();
            this.state = 75;
            this.match(LogicParser.DOT);
            this.state = 76;
            this.quantifiedExpr();
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
    public exists(): ExistsContext {
        let localContext = new ExistsContext(this.context, this.state);
        this.enterRule(localContext, 14, LogicParser.RULE_exists);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 78;
            this.match(LogicParser.EXISTS);
            this.state = 79;
            this.variable();
            this.state = 80;
            this.match(LogicParser.DOT);
            this.state = 81;
            this.quantifiedExpr();
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
        this.enterRule(localContext, 16, LogicParser.RULE_disjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 83;
            this.conjunction();
            this.state = 88;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 84;
                this.match(LogicParser.OR);
                this.state = 85;
                this.conjunction();
                }
                }
                this.state = 90;
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
        this.enterRule(localContext, 18, LogicParser.RULE_conjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 91;
            this.negation();
            this.state = 96;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 3) {
                {
                {
                this.state = 92;
                this.match(LogicParser.AND);
                this.state = 93;
                this.negation();
                }
                }
                this.state = 98;
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
        this.enterRule(localContext, 20, LogicParser.RULE_negation);
        try {
            this.state = 102;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case LogicParser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 99;
                this.match(LogicParser.NOT);
                this.state = 100;
                this.negation();
                }
                break;
            case LogicParser.TOP:
            case LogicParser.BOT:
            case LogicParser.LPAREN:
            case LogicParser.PRED:
            case LogicParser.LOWERID:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 101;
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
        this.enterRule(localContext, 22, LogicParser.RULE_atom);
        try {
            this.state = 113;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 104;
                this.match(LogicParser.LPAREN);
                this.state = 105;
                this.formula();
                this.state = 106;
                this.match(LogicParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 108;
                this.predicate();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 109;
                this.match(LogicParser.TOP);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 110;
                this.match(LogicParser.BOT);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 111;
                this.match(LogicParser.LOWERID);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 112;
                this.match(LogicParser.PRED);
                }
                break;
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
    public predicate(): PredicateContext {
        let localContext = new PredicateContext(this.context, this.state);
        this.enterRule(localContext, 24, LogicParser.RULE_predicate);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 115;
            this.match(LogicParser.PRED);
            this.state = 116;
            this.match(LogicParser.LPAREN);
            this.state = 118;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11 || _la === 15) {
                {
                this.state = 117;
                this.termList();
                }
            }

            this.state = 120;
            this.match(LogicParser.RPAREN);
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
    public termList(): TermListContext {
        let localContext = new TermListContext(this.context, this.state);
        this.enterRule(localContext, 26, LogicParser.RULE_termList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 122;
            this.term();
            this.state = 127;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 13) {
                {
                {
                this.state = 123;
                this.match(LogicParser.COMMA);
                this.state = 124;
                this.term();
                }
                }
                this.state = 129;
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
    public term(): TermContext {
        let localContext = new TermContext(this.context, this.state);
        this.enterRule(localContext, 28, LogicParser.RULE_term);
        try {
            this.state = 137;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 12, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 130;
                this.variable();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 131;
                this.constant();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 132;
                this.functionApp();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 133;
                this.match(LogicParser.LPAREN);
                this.state = 134;
                this.term();
                this.state = 135;
                this.match(LogicParser.RPAREN);
                }
                break;
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
    public variable(): VariableContext {
        let localContext = new VariableContext(this.context, this.state);
        this.enterRule(localContext, 30, LogicParser.RULE_variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 139;
            this.match(LogicParser.LOWERID);
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
    public constant(): ConstantContext {
        let localContext = new ConstantContext(this.context, this.state);
        this.enterRule(localContext, 32, LogicParser.RULE_constant);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 141;
            this.match(LogicParser.LOWERID);
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
    public functionApp(): FunctionAppContext {
        let localContext = new FunctionAppContext(this.context, this.state);
        this.enterRule(localContext, 34, LogicParser.RULE_functionApp);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 143;
            this.match(LogicParser.LOWERID);
            this.state = 144;
            this.match(LogicParser.LPAREN);
            this.state = 146;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 11 || _la === 15) {
                {
                this.state = 145;
                this.termList();
                }
            }

            this.state = 148;
            this.match(LogicParser.RPAREN);
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
        4,1,16,151,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,1,0,3,0,38,8,0,1,0,1,0,3,
        0,42,8,0,1,0,1,0,1,1,1,1,1,1,5,1,49,8,1,10,1,12,1,52,9,1,1,2,1,2,
        1,2,5,2,57,8,2,10,2,12,2,60,9,2,1,3,1,3,1,4,1,4,1,4,3,4,67,8,4,1,
        5,1,5,1,5,3,5,72,8,5,1,6,1,6,1,6,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,8,
        1,8,1,8,5,8,87,8,8,10,8,12,8,90,9,8,1,9,1,9,1,9,5,9,95,8,9,10,9,
        12,9,98,9,9,1,10,1,10,1,10,3,10,103,8,10,1,11,1,11,1,11,1,11,1,11,
        1,11,1,11,1,11,1,11,3,11,114,8,11,1,12,1,12,1,12,3,12,119,8,12,1,
        12,1,12,1,13,1,13,1,13,5,13,126,8,13,10,13,12,13,129,9,13,1,14,1,
        14,1,14,1,14,1,14,1,14,1,14,3,14,138,8,14,1,15,1,15,1,16,1,16,1,
        17,1,17,1,17,3,17,147,8,17,1,17,1,17,1,17,0,0,18,0,2,4,6,8,10,12,
        14,16,18,20,22,24,26,28,30,32,34,0,0,153,0,37,1,0,0,0,2,45,1,0,0,
        0,4,53,1,0,0,0,6,61,1,0,0,0,8,63,1,0,0,0,10,71,1,0,0,0,12,73,1,0,
        0,0,14,78,1,0,0,0,16,83,1,0,0,0,18,91,1,0,0,0,20,102,1,0,0,0,22,
        113,1,0,0,0,24,115,1,0,0,0,26,122,1,0,0,0,28,137,1,0,0,0,30,139,
        1,0,0,0,32,141,1,0,0,0,34,143,1,0,0,0,36,38,3,2,1,0,37,36,1,0,0,
        0,37,38,1,0,0,0,38,39,1,0,0,0,39,41,5,1,0,0,40,42,3,4,2,0,41,40,
        1,0,0,0,41,42,1,0,0,0,42,43,1,0,0,0,43,44,5,0,0,1,44,1,1,0,0,0,45,
        50,3,6,3,0,46,47,5,13,0,0,47,49,3,6,3,0,48,46,1,0,0,0,49,52,1,0,
        0,0,50,48,1,0,0,0,50,51,1,0,0,0,51,3,1,0,0,0,52,50,1,0,0,0,53,58,
        3,6,3,0,54,55,5,13,0,0,55,57,3,6,3,0,56,54,1,0,0,0,57,60,1,0,0,0,
        58,56,1,0,0,0,58,59,1,0,0,0,59,5,1,0,0,0,60,58,1,0,0,0,61,62,3,8,
        4,0,62,7,1,0,0,0,63,66,3,10,5,0,64,65,5,2,0,0,65,67,3,8,4,0,66,64,
        1,0,0,0,66,67,1,0,0,0,67,9,1,0,0,0,68,72,3,12,6,0,69,72,3,14,7,0,
        70,72,3,16,8,0,71,68,1,0,0,0,71,69,1,0,0,0,71,70,1,0,0,0,72,11,1,
        0,0,0,73,74,5,8,0,0,74,75,3,30,15,0,75,76,5,10,0,0,76,77,3,10,5,
        0,77,13,1,0,0,0,78,79,5,9,0,0,79,80,3,30,15,0,80,81,5,10,0,0,81,
        82,3,10,5,0,82,15,1,0,0,0,83,88,3,18,9,0,84,85,5,4,0,0,85,87,3,18,
        9,0,86,84,1,0,0,0,87,90,1,0,0,0,88,86,1,0,0,0,88,89,1,0,0,0,89,17,
        1,0,0,0,90,88,1,0,0,0,91,96,3,20,10,0,92,93,5,3,0,0,93,95,3,20,10,
        0,94,92,1,0,0,0,95,98,1,0,0,0,96,94,1,0,0,0,96,97,1,0,0,0,97,19,
        1,0,0,0,98,96,1,0,0,0,99,100,5,5,0,0,100,103,3,20,10,0,101,103,3,
        22,11,0,102,99,1,0,0,0,102,101,1,0,0,0,103,21,1,0,0,0,104,105,5,
        11,0,0,105,106,3,6,3,0,106,107,5,12,0,0,107,114,1,0,0,0,108,114,
        3,24,12,0,109,114,5,6,0,0,110,114,5,7,0,0,111,114,5,15,0,0,112,114,
        5,14,0,0,113,104,1,0,0,0,113,108,1,0,0,0,113,109,1,0,0,0,113,110,
        1,0,0,0,113,111,1,0,0,0,113,112,1,0,0,0,114,23,1,0,0,0,115,116,5,
        14,0,0,116,118,5,11,0,0,117,119,3,26,13,0,118,117,1,0,0,0,118,119,
        1,0,0,0,119,120,1,0,0,0,120,121,5,12,0,0,121,25,1,0,0,0,122,127,
        3,28,14,0,123,124,5,13,0,0,124,126,3,28,14,0,125,123,1,0,0,0,126,
        129,1,0,0,0,127,125,1,0,0,0,127,128,1,0,0,0,128,27,1,0,0,0,129,127,
        1,0,0,0,130,138,3,30,15,0,131,138,3,32,16,0,132,138,3,34,17,0,133,
        134,5,11,0,0,134,135,3,28,14,0,135,136,5,12,0,0,136,138,1,0,0,0,
        137,130,1,0,0,0,137,131,1,0,0,0,137,132,1,0,0,0,137,133,1,0,0,0,
        138,29,1,0,0,0,139,140,5,15,0,0,140,31,1,0,0,0,141,142,5,15,0,0,
        142,33,1,0,0,0,143,144,5,15,0,0,144,146,5,11,0,0,145,147,3,26,13,
        0,146,145,1,0,0,0,146,147,1,0,0,0,147,148,1,0,0,0,148,149,5,12,0,
        0,149,35,1,0,0,0,14,37,41,50,58,66,71,88,96,102,113,118,127,137,
        146
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!LogicParser.__ATN) {
            LogicParser.__ATN = new antlr.ATNDeserializer().deserialize(LogicParser._serializedATN);
        }

        return LogicParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(LogicParser.literalNames, LogicParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return LogicParser.vocabulary;
    }

    private static readonly decisionsToDFA = LogicParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class SequentContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TURNSTILE(): antlr.TerminalNode {
        return this.getToken(LogicParser.TURNSTILE, 0)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(LogicParser.EOF, 0)!;
    }
    public assumptions(): AssumptionsContext | null {
        return this.getRuleContext(0, AssumptionsContext);
    }
    public conclusion(): ConclusionContext | null {
        return this.getRuleContext(0, ConclusionContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_sequent;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterSequent) {
             listener.enterSequent(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitSequent) {
             listener.exitSequent(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LogicParser.COMMA);
    	} else {
    		return this.getToken(LogicParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_assumptions;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterAssumptions) {
             listener.enterAssumptions(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitAssumptions) {
             listener.exitAssumptions(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LogicParser.COMMA);
    	} else {
    		return this.getToken(LogicParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_conclusion;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterConclusion) {
             listener.enterConclusion(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitConclusion) {
             listener.exitConclusion(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
        return LogicParser.RULE_formula;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterFormula) {
             listener.enterFormula(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitFormula) {
             listener.exitFormula(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
    public quantifiedExpr(): QuantifiedExprContext {
        return this.getRuleContext(0, QuantifiedExprContext)!;
    }
    public IMPL(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.IMPL, 0);
    }
    public implication(): ImplicationContext | null {
        return this.getRuleContext(0, ImplicationContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_implication;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterImplication) {
             listener.enterImplication(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitImplication) {
             listener.exitImplication(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitImplication) {
            return visitor.visitImplication(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class QuantifiedExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public forall(): ForallContext | null {
        return this.getRuleContext(0, ForallContext);
    }
    public exists(): ExistsContext | null {
        return this.getRuleContext(0, ExistsContext);
    }
    public disjunction(): DisjunctionContext | null {
        return this.getRuleContext(0, DisjunctionContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_quantifiedExpr;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterQuantifiedExpr) {
             listener.enterQuantifiedExpr(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitQuantifiedExpr) {
             listener.exitQuantifiedExpr(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitQuantifiedExpr) {
            return visitor.visitQuantifiedExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FORALL(): antlr.TerminalNode {
        return this.getToken(LogicParser.FORALL, 0)!;
    }
    public variable(): VariableContext {
        return this.getRuleContext(0, VariableContext)!;
    }
    public DOT(): antlr.TerminalNode {
        return this.getToken(LogicParser.DOT, 0)!;
    }
    public quantifiedExpr(): QuantifiedExprContext {
        return this.getRuleContext(0, QuantifiedExprContext)!;
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_forall;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterForall) {
             listener.enterForall(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitForall) {
             listener.exitForall(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitForall) {
            return visitor.visitForall(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExistsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EXISTS(): antlr.TerminalNode {
        return this.getToken(LogicParser.EXISTS, 0)!;
    }
    public variable(): VariableContext {
        return this.getRuleContext(0, VariableContext)!;
    }
    public DOT(): antlr.TerminalNode {
        return this.getToken(LogicParser.DOT, 0)!;
    }
    public quantifiedExpr(): QuantifiedExprContext {
        return this.getRuleContext(0, QuantifiedExprContext)!;
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_exists;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterExists) {
             listener.enterExists(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitExists) {
             listener.exitExists(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitExists) {
            return visitor.visitExists(this);
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
    		return this.getTokens(LogicParser.OR);
    	} else {
    		return this.getToken(LogicParser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_disjunction;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterDisjunction) {
             listener.enterDisjunction(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitDisjunction) {
             listener.exitDisjunction(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
    		return this.getTokens(LogicParser.AND);
    	} else {
    		return this.getToken(LogicParser.AND, i);
    	}
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_conjunction;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterConjunction) {
             listener.enterConjunction(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitConjunction) {
             listener.exitConjunction(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
        return this.getToken(LogicParser.NOT, 0);
    }
    public negation(): NegationContext | null {
        return this.getRuleContext(0, NegationContext);
    }
    public atom(): AtomContext | null {
        return this.getRuleContext(0, AtomContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_negation;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterNegation) {
             listener.enterNegation(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitNegation) {
             listener.exitNegation(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
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
        return this.getToken(LogicParser.LPAREN, 0);
    }
    public formula(): FormulaContext | null {
        return this.getRuleContext(0, FormulaContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.RPAREN, 0);
    }
    public predicate(): PredicateContext | null {
        return this.getRuleContext(0, PredicateContext);
    }
    public TOP(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.TOP, 0);
    }
    public BOT(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.BOT, 0);
    }
    public LOWERID(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.LOWERID, 0);
    }
    public PRED(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.PRED, 0);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_atom;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterAtom) {
             listener.enterAtom(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitAtom) {
             listener.exitAtom(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitAtom) {
            return visitor.visitAtom(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PredicateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PRED(): antlr.TerminalNode {
        return this.getToken(LogicParser.PRED, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(LogicParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(LogicParser.RPAREN, 0)!;
    }
    public termList(): TermListContext | null {
        return this.getRuleContext(0, TermListContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_predicate;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterPredicate) {
             listener.enterPredicate(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitPredicate) {
             listener.exitPredicate(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitPredicate) {
            return visitor.visitPredicate(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TermListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LogicParser.COMMA);
    	} else {
    		return this.getToken(LogicParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_termList;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterTermList) {
             listener.enterTermList(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitTermList) {
             listener.exitTermList(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitTermList) {
            return visitor.visitTermList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TermContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public variable(): VariableContext | null {
        return this.getRuleContext(0, VariableContext);
    }
    public constant(): ConstantContext | null {
        return this.getRuleContext(0, ConstantContext);
    }
    public functionApp(): FunctionAppContext | null {
        return this.getRuleContext(0, FunctionAppContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.LPAREN, 0);
    }
    public term(): TermContext | null {
        return this.getRuleContext(0, TermContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(LogicParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_term;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterTerm) {
             listener.enterTerm(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitTerm) {
             listener.exitTerm(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitTerm) {
            return visitor.visitTerm(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class VariableContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOWERID(): antlr.TerminalNode {
        return this.getToken(LogicParser.LOWERID, 0)!;
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_variable;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterVariable) {
             listener.enterVariable(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitVariable) {
             listener.exitVariable(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitVariable) {
            return visitor.visitVariable(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ConstantContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOWERID(): antlr.TerminalNode {
        return this.getToken(LogicParser.LOWERID, 0)!;
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_constant;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterConstant) {
             listener.enterConstant(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitConstant) {
             listener.exitConstant(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitConstant) {
            return visitor.visitConstant(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FunctionAppContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOWERID(): antlr.TerminalNode {
        return this.getToken(LogicParser.LOWERID, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(LogicParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(LogicParser.RPAREN, 0)!;
    }
    public termList(): TermListContext | null {
        return this.getRuleContext(0, TermListContext);
    }
    public override get ruleIndex(): number {
        return LogicParser.RULE_functionApp;
    }
    public override enterRule(listener: LogicListener): void {
        if(listener.enterFunctionApp) {
             listener.enterFunctionApp(this);
        }
    }
    public override exitRule(listener: LogicListener): void {
        if(listener.exitFunctionApp) {
             listener.exitFunctionApp(this);
        }
    }
    public override accept<Result>(visitor: LogicVisitor<Result>): Result | null {
        if (visitor.visitFunctionApp) {
            return visitor.visitFunctionApp(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
