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
    public static readonly FORALL = 6;
    public static readonly EXISTS = 7;
    public static readonly DOT = 8;
    public static readonly LPAREN = 9;
    public static readonly RPAREN = 10;
    public static readonly COMMA = 11;
    public static readonly PRED = 12;
    public static readonly LOWERID = 13;
    public static readonly WS = 14;
    public static readonly RULE_sequent = 0;
    public static readonly RULE_assumptions = 1;
    public static readonly RULE_conclusion = 2;
    public static readonly RULE_formula = 3;
    public static readonly RULE_forall = 4;
    public static readonly RULE_exists = 5;
    public static readonly RULE_implication = 6;
    public static readonly RULE_disjunction = 7;
    public static readonly RULE_conjunction = 8;
    public static readonly RULE_negation = 9;
    public static readonly RULE_atom = 10;
    public static readonly RULE_predicate = 11;
    public static readonly RULE_termList = 12;
    public static readonly RULE_term = 13;
    public static readonly RULE_variable = 14;
    public static readonly RULE_constant = 15;
    public static readonly RULE_functionApp = 16;

    public static readonly literalNames = [
        null, null, null, null, null, null, null, null, "'.'", "'('", "')'", 
        "','"
    ];

    public static readonly symbolicNames = [
        null, "TURNSTILE", "IMPL", "AND", "OR", "NOT", "FORALL", "EXISTS", 
        "DOT", "LPAREN", "RPAREN", "COMMA", "PRED", "LOWERID", "WS"
    ];
    public static readonly ruleNames = [
        "sequent", "assumptions", "conclusion", "formula", "forall", "exists", 
        "implication", "disjunction", "conjunction", "negation", "atom", 
        "predicate", "termList", "term", "variable", "constant", "functionApp",
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
            this.state = 35;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 13024) !== 0)) {
                {
                this.state = 34;
                this.assumptions();
                }
            }

            this.state = 37;
            this.match(LogicParser.TURNSTILE);
            this.state = 39;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 13024) !== 0)) {
                {
                this.state = 38;
                this.conclusion();
                }
            }

            this.state = 41;
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
            this.state = 43;
            this.formula();
            this.state = 48;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 11) {
                {
                {
                this.state = 44;
                this.match(LogicParser.COMMA);
                this.state = 45;
                this.formula();
                }
                }
                this.state = 50;
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
            this.state = 51;
            this.formula();
            this.state = 56;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 11) {
                {
                {
                this.state = 52;
                this.match(LogicParser.COMMA);
                this.state = 53;
                this.formula();
                }
                }
                this.state = 58;
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
            this.state = 62;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case LogicParser.FORALL:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 59;
                this.forall();
                }
                break;
            case LogicParser.EXISTS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 60;
                this.exists();
                }
                break;
            case LogicParser.NOT:
            case LogicParser.LPAREN:
            case LogicParser.PRED:
            case LogicParser.LOWERID:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 61;
                this.implication();
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
        this.enterRule(localContext, 8, LogicParser.RULE_forall);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 64;
            this.match(LogicParser.FORALL);
            this.state = 65;
            this.variable();
            this.state = 66;
            this.match(LogicParser.DOT);
            this.state = 67;
            this.formula();
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
        this.enterRule(localContext, 10, LogicParser.RULE_exists);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 69;
            this.match(LogicParser.EXISTS);
            this.state = 70;
            this.variable();
            this.state = 71;
            this.match(LogicParser.DOT);
            this.state = 72;
            this.formula();
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
        this.enterRule(localContext, 12, LogicParser.RULE_implication);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 74;
            this.disjunction();
            this.state = 77;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 2) {
                {
                this.state = 75;
                this.match(LogicParser.IMPL);
                this.state = 76;
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
        this.enterRule(localContext, 14, LogicParser.RULE_disjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 79;
            this.conjunction();
            this.state = 84;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 4) {
                {
                {
                this.state = 80;
                this.match(LogicParser.OR);
                this.state = 81;
                this.conjunction();
                }
                }
                this.state = 86;
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
        this.enterRule(localContext, 16, LogicParser.RULE_conjunction);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 87;
            this.negation();
            this.state = 92;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 3) {
                {
                {
                this.state = 88;
                this.match(LogicParser.AND);
                this.state = 89;
                this.negation();
                }
                }
                this.state = 94;
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
        this.enterRule(localContext, 18, LogicParser.RULE_negation);
        try {
            this.state = 98;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case LogicParser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 95;
                this.match(LogicParser.NOT);
                this.state = 96;
                this.negation();
                }
                break;
            case LogicParser.LPAREN:
            case LogicParser.PRED:
            case LogicParser.LOWERID:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 97;
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
        this.enterRule(localContext, 20, LogicParser.RULE_atom);
        try {
            this.state = 107;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 100;
                this.match(LogicParser.LPAREN);
                this.state = 101;
                this.formula();
                this.state = 102;
                this.match(LogicParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 104;
                this.predicate();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 105;
                this.match(LogicParser.LOWERID);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 106;
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
        this.enterRule(localContext, 22, LogicParser.RULE_predicate);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 109;
            this.match(LogicParser.PRED);
            this.state = 110;
            this.match(LogicParser.LPAREN);
            this.state = 112;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9 || _la === 13) {
                {
                this.state = 111;
                this.termList();
                }
            }

            this.state = 114;
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
        this.enterRule(localContext, 24, LogicParser.RULE_termList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 116;
            this.term();
            this.state = 121;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 11) {
                {
                {
                this.state = 117;
                this.match(LogicParser.COMMA);
                this.state = 118;
                this.term();
                }
                }
                this.state = 123;
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
        this.enterRule(localContext, 26, LogicParser.RULE_term);
        try {
            this.state = 131;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 12, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 124;
                this.variable();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 125;
                this.constant();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 126;
                this.functionApp();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 127;
                this.match(LogicParser.LPAREN);
                this.state = 128;
                this.term();
                this.state = 129;
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
        this.enterRule(localContext, 28, LogicParser.RULE_variable);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 133;
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
        this.enterRule(localContext, 30, LogicParser.RULE_constant);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 135;
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
        this.enterRule(localContext, 32, LogicParser.RULE_functionApp);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 137;
            this.match(LogicParser.LOWERID);
            this.state = 138;
            this.match(LogicParser.LPAREN);
            this.state = 140;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 9 || _la === 13) {
                {
                this.state = 139;
                this.termList();
                }
            }

            this.state = 142;
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
        4,1,14,145,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,1,0,3,0,36,8,0,1,0,1,0,3,0,40,8,0,
        1,0,1,0,1,1,1,1,1,1,5,1,47,8,1,10,1,12,1,50,9,1,1,2,1,2,1,2,5,2,
        55,8,2,10,2,12,2,58,9,2,1,3,1,3,1,3,3,3,63,8,3,1,4,1,4,1,4,1,4,1,
        4,1,5,1,5,1,5,1,5,1,5,1,6,1,6,1,6,3,6,78,8,6,1,7,1,7,1,7,5,7,83,
        8,7,10,7,12,7,86,9,7,1,8,1,8,1,8,5,8,91,8,8,10,8,12,8,94,9,8,1,9,
        1,9,1,9,3,9,99,8,9,1,10,1,10,1,10,1,10,1,10,1,10,1,10,3,10,108,8,
        10,1,11,1,11,1,11,3,11,113,8,11,1,11,1,11,1,12,1,12,1,12,5,12,120,
        8,12,10,12,12,12,123,9,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,
        132,8,13,1,14,1,14,1,15,1,15,1,16,1,16,1,16,3,16,141,8,16,1,16,1,
        16,1,16,0,0,17,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,0,0,
        146,0,35,1,0,0,0,2,43,1,0,0,0,4,51,1,0,0,0,6,62,1,0,0,0,8,64,1,0,
        0,0,10,69,1,0,0,0,12,74,1,0,0,0,14,79,1,0,0,0,16,87,1,0,0,0,18,98,
        1,0,0,0,20,107,1,0,0,0,22,109,1,0,0,0,24,116,1,0,0,0,26,131,1,0,
        0,0,28,133,1,0,0,0,30,135,1,0,0,0,32,137,1,0,0,0,34,36,3,2,1,0,35,
        34,1,0,0,0,35,36,1,0,0,0,36,37,1,0,0,0,37,39,5,1,0,0,38,40,3,4,2,
        0,39,38,1,0,0,0,39,40,1,0,0,0,40,41,1,0,0,0,41,42,5,0,0,1,42,1,1,
        0,0,0,43,48,3,6,3,0,44,45,5,11,0,0,45,47,3,6,3,0,46,44,1,0,0,0,47,
        50,1,0,0,0,48,46,1,0,0,0,48,49,1,0,0,0,49,3,1,0,0,0,50,48,1,0,0,
        0,51,56,3,6,3,0,52,53,5,11,0,0,53,55,3,6,3,0,54,52,1,0,0,0,55,58,
        1,0,0,0,56,54,1,0,0,0,56,57,1,0,0,0,57,5,1,0,0,0,58,56,1,0,0,0,59,
        63,3,8,4,0,60,63,3,10,5,0,61,63,3,12,6,0,62,59,1,0,0,0,62,60,1,0,
        0,0,62,61,1,0,0,0,63,7,1,0,0,0,64,65,5,6,0,0,65,66,3,28,14,0,66,
        67,5,8,0,0,67,68,3,6,3,0,68,9,1,0,0,0,69,70,5,7,0,0,70,71,3,28,14,
        0,71,72,5,8,0,0,72,73,3,6,3,0,73,11,1,0,0,0,74,77,3,14,7,0,75,76,
        5,2,0,0,76,78,3,12,6,0,77,75,1,0,0,0,77,78,1,0,0,0,78,13,1,0,0,0,
        79,84,3,16,8,0,80,81,5,4,0,0,81,83,3,16,8,0,82,80,1,0,0,0,83,86,
        1,0,0,0,84,82,1,0,0,0,84,85,1,0,0,0,85,15,1,0,0,0,86,84,1,0,0,0,
        87,92,3,18,9,0,88,89,5,3,0,0,89,91,3,18,9,0,90,88,1,0,0,0,91,94,
        1,0,0,0,92,90,1,0,0,0,92,93,1,0,0,0,93,17,1,0,0,0,94,92,1,0,0,0,
        95,96,5,5,0,0,96,99,3,18,9,0,97,99,3,20,10,0,98,95,1,0,0,0,98,97,
        1,0,0,0,99,19,1,0,0,0,100,101,5,9,0,0,101,102,3,6,3,0,102,103,5,
        10,0,0,103,108,1,0,0,0,104,108,3,22,11,0,105,108,5,13,0,0,106,108,
        5,12,0,0,107,100,1,0,0,0,107,104,1,0,0,0,107,105,1,0,0,0,107,106,
        1,0,0,0,108,21,1,0,0,0,109,110,5,12,0,0,110,112,5,9,0,0,111,113,
        3,24,12,0,112,111,1,0,0,0,112,113,1,0,0,0,113,114,1,0,0,0,114,115,
        5,10,0,0,115,23,1,0,0,0,116,121,3,26,13,0,117,118,5,11,0,0,118,120,
        3,26,13,0,119,117,1,0,0,0,120,123,1,0,0,0,121,119,1,0,0,0,121,122,
        1,0,0,0,122,25,1,0,0,0,123,121,1,0,0,0,124,132,3,28,14,0,125,132,
        3,30,15,0,126,132,3,32,16,0,127,128,5,9,0,0,128,129,3,26,13,0,129,
        130,5,10,0,0,130,132,1,0,0,0,131,124,1,0,0,0,131,125,1,0,0,0,131,
        126,1,0,0,0,131,127,1,0,0,0,132,27,1,0,0,0,133,134,5,13,0,0,134,
        29,1,0,0,0,135,136,5,13,0,0,136,31,1,0,0,0,137,138,5,13,0,0,138,
        140,5,9,0,0,139,141,3,24,12,0,140,139,1,0,0,0,140,141,1,0,0,0,141,
        142,1,0,0,0,142,143,5,10,0,0,143,33,1,0,0,0,14,35,39,48,56,62,77,
        84,92,98,107,112,121,131,140
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
    public forall(): ForallContext | null {
        return this.getRuleContext(0, ForallContext);
    }
    public exists(): ExistsContext | null {
        return this.getRuleContext(0, ExistsContext);
    }
    public implication(): ImplicationContext | null {
        return this.getRuleContext(0, ImplicationContext);
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
    public formula(): FormulaContext {
        return this.getRuleContext(0, FormulaContext)!;
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
    public formula(): FormulaContext {
        return this.getRuleContext(0, FormulaContext)!;
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


export class ImplicationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public disjunction(): DisjunctionContext {
        return this.getRuleContext(0, DisjunctionContext)!;
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
