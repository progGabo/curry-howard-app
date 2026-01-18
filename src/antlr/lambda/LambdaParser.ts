// Generated from Lambda.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { LambdaListener } from "./LambdaListener.js";
import { LambdaVisitor } from "./LambdaVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class LambdaParser extends antlr.Parser {
    public static readonly LET = 1;
    public static readonly IN = 2;
    public static readonly IF = 3;
    public static readonly THEN = 4;
    public static readonly ELSE = 5;
    public static readonly CASE = 6;
    public static readonly OF = 7;
    public static readonly INL = 8;
    public static readonly INTR = 9;
    public static readonly AS = 10;
    public static readonly BOOL = 11;
    public static readonly NAT = 12;
    public static readonly TRUE = 13;
    public static readonly FALSE = 14;
    public static readonly SUCC = 15;
    public static readonly PRED = 16;
    public static readonly ISZERO = 17;
    public static readonly LAMBDA = 18;
    public static readonly ARROW = 19;
    public static readonly FATARROW = 20;
    public static readonly TIMES = 21;
    public static readonly PLUS = 22;
    public static readonly ASSIGN = 23;
    public static readonly COLON = 24;
    public static readonly DOT = 25;
    public static readonly BAR = 26;
    public static readonly COMMA = 27;
    public static readonly LPAREN = 28;
    public static readonly RPAREN = 29;
    public static readonly LBRACK = 30;
    public static readonly RBRACK = 31;
    public static readonly LANGLE = 32;
    public static readonly RANGLE = 33;
    public static readonly TYPEID = 34;
    public static readonly ZERO = 35;
    public static readonly VAR = 36;
    public static readonly WS = 37;
    public static readonly LINE_COMMENT = 38;
    public static readonly BLOCK_COMMENT = 39;
    public static readonly RULE_program = 0;
    public static readonly RULE_term = 1;
    public static readonly RULE_lamExpr = 2;
    public static readonly RULE_letExpr = 3;
    public static readonly RULE_letPairExpr = 4;
    public static readonly RULE_ifExpr = 5;
    public static readonly RULE_caseExpr = 6;
    public static readonly RULE_appExpr = 7;
    public static readonly RULE_atom = 8;
    public static readonly RULE_type = 9;
    public static readonly RULE_sumType = 10;
    public static readonly RULE_prodType = 11;
    public static readonly RULE_atomicType = 12;
    public static readonly RULE_predicateType = 13;
    public static readonly RULE_typeList = 14;

    public static readonly literalNames = [
        null, "'let'", "'in'", "'if'", "'then'", "'else'", "'case'", "'of'", 
        "'inl'", "'inr'", "'as'", "'Bool'", "'Nat'", "'true'", "'false'", 
        "'succ'", "'pred'", "'iszero'", null, null, null, null, null, "'='", 
        "':'", "'.'", "'|'", "','", "'('", "')'", "'['", "']'", null, null, 
        null, "'0'"
    ];

    public static readonly symbolicNames = [
        null, "LET", "IN", "IF", "THEN", "ELSE", "CASE", "OF", "INL", "INTR", 
        "AS", "BOOL", "NAT", "TRUE", "FALSE", "SUCC", "PRED", "ISZERO", 
        "LAMBDA", "ARROW", "FATARROW", "TIMES", "PLUS", "ASSIGN", "COLON", 
        "DOT", "BAR", "COMMA", "LPAREN", "RPAREN", "LBRACK", "RBRACK", "LANGLE", 
        "RANGLE", "TYPEID", "ZERO", "VAR", "WS", "LINE_COMMENT", "BLOCK_COMMENT"
    ];
    public static readonly ruleNames = [
        "program", "term", "lamExpr", "letExpr", "letPairExpr", "ifExpr", 
        "caseExpr", "appExpr", "atom", "type", "sumType", "prodType", "atomicType", 
        "predicateType", "typeList",
    ];

    public get grammarFileName(): string { return "Lambda.g4"; }
    public get literalNames(): (string | null)[] { return LambdaParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return LambdaParser.symbolicNames; }
    public get ruleNames(): string[] { return LambdaParser.ruleNames; }
    public get serializedATN(): number[] { return LambdaParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, LambdaParser._ATN, LambdaParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public program(): ProgramContext {
        let localContext = new ProgramContext(this.context, this.state);
        this.enterRule(localContext, 0, LambdaParser.RULE_program);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 30;
            this.term();
            this.state = 31;
            this.match(LambdaParser.EOF);
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
        this.enterRule(localContext, 2, LambdaParser.RULE_term);
        try {
            this.state = 39;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 0, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 33;
                this.lamExpr();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 34;
                this.letPairExpr();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 35;
                this.letExpr();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 36;
                this.ifExpr();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 37;
                this.caseExpr();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 38;
                this.appExpr();
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
    public lamExpr(): LamExprContext {
        let localContext = new LamExprContext(this.context, this.state);
        this.enterRule(localContext, 4, LambdaParser.RULE_lamExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 41;
            this.match(LambdaParser.LAMBDA);
            this.state = 42;
            this.match(LambdaParser.VAR);
            this.state = 43;
            this.match(LambdaParser.COLON);
            this.state = 44;
            this.type_();
            this.state = 45;
            this.match(LambdaParser.DOT);
            this.state = 46;
            this.term();
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
    public letExpr(): LetExprContext {
        let localContext = new LetExprContext(this.context, this.state);
        this.enterRule(localContext, 6, LambdaParser.RULE_letExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 48;
            this.match(LambdaParser.LET);
            this.state = 49;
            this.match(LambdaParser.VAR);
            this.state = 50;
            this.match(LambdaParser.ASSIGN);
            this.state = 51;
            this.term();
            this.state = 52;
            this.match(LambdaParser.IN);
            this.state = 53;
            this.term();
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
    public letPairExpr(): LetPairExprContext {
        let localContext = new LetPairExprContext(this.context, this.state);
        this.enterRule(localContext, 8, LambdaParser.RULE_letPairExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 55;
            this.match(LambdaParser.LET);
            this.state = 56;
            this.match(LambdaParser.LBRACK);
            this.state = 57;
            this.match(LambdaParser.VAR);
            this.state = 58;
            this.match(LambdaParser.COMMA);
            this.state = 59;
            this.match(LambdaParser.VAR);
            this.state = 60;
            this.match(LambdaParser.RBRACK);
            this.state = 61;
            this.match(LambdaParser.ASSIGN);
            this.state = 62;
            this.term();
            this.state = 63;
            this.match(LambdaParser.IN);
            this.state = 64;
            this.term();
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
    public ifExpr(): IfExprContext {
        let localContext = new IfExprContext(this.context, this.state);
        this.enterRule(localContext, 10, LambdaParser.RULE_ifExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 66;
            this.match(LambdaParser.IF);
            this.state = 67;
            this.term();
            this.state = 68;
            this.match(LambdaParser.THEN);
            this.state = 69;
            this.term();
            this.state = 70;
            this.match(LambdaParser.ELSE);
            this.state = 71;
            this.term();
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
    public caseExpr(): CaseExprContext {
        let localContext = new CaseExprContext(this.context, this.state);
        this.enterRule(localContext, 12, LambdaParser.RULE_caseExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 73;
            this.match(LambdaParser.CASE);
            this.state = 74;
            this.term();
            this.state = 75;
            this.match(LambdaParser.OF);
            this.state = 76;
            this.match(LambdaParser.INL);
            this.state = 77;
            this.match(LambdaParser.VAR);
            this.state = 78;
            this.match(LambdaParser.COLON);
            this.state = 79;
            this.type_();
            this.state = 80;
            this.match(LambdaParser.FATARROW);
            this.state = 81;
            this.term();
            this.state = 82;
            this.match(LambdaParser.BAR);
            this.state = 83;
            this.match(LambdaParser.INTR);
            this.state = 84;
            this.match(LambdaParser.VAR);
            this.state = 85;
            this.match(LambdaParser.COLON);
            this.state = 86;
            this.type_();
            this.state = 87;
            this.match(LambdaParser.FATARROW);
            this.state = 88;
            this.term();
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
    public appExpr(): AppExprContext {
        let localContext = new AppExprContext(this.context, this.state);
        this.enterRule(localContext, 14, LambdaParser.RULE_appExpr);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 91;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 90;
                this.atom();
                }
                }
                this.state = 93;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (((((_la - 8)) & ~0x1F) === 0 && ((1 << (_la - 8)) & 420479971) !== 0));
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
        this.enterRule(localContext, 16, LambdaParser.RULE_atom);
        try {
            this.state = 131;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 2, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 95;
                this.match(LambdaParser.VAR);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 96;
                this.match(LambdaParser.TRUE);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 97;
                this.match(LambdaParser.FALSE);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 98;
                this.match(LambdaParser.ZERO);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 99;
                this.match(LambdaParser.SUCC);
                this.state = 100;
                this.atom();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 101;
                this.match(LambdaParser.PRED);
                this.state = 102;
                this.atom();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 103;
                this.match(LambdaParser.ISZERO);
                this.state = 104;
                this.atom();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 105;
                this.match(LambdaParser.LPAREN);
                this.state = 106;
                this.term();
                this.state = 107;
                this.match(LambdaParser.RPAREN);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 109;
                this.match(LambdaParser.LPAREN);
                this.state = 110;
                this.term();
                this.state = 111;
                this.match(LambdaParser.COMMA);
                this.state = 112;
                this.term();
                this.state = 113;
                this.match(LambdaParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 115;
                this.match(LambdaParser.LANGLE);
                this.state = 116;
                this.term();
                this.state = 117;
                this.match(LambdaParser.COMMA);
                this.state = 118;
                this.term();
                this.state = 119;
                this.match(LambdaParser.RANGLE);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 121;
                this.match(LambdaParser.INL);
                this.state = 122;
                this.atom();
                this.state = 123;
                this.match(LambdaParser.AS);
                this.state = 124;
                this.type_();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 126;
                this.match(LambdaParser.INTR);
                this.state = 127;
                this.atom();
                this.state = 128;
                this.match(LambdaParser.AS);
                this.state = 129;
                this.type_();
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
    public type_(): TypeContext {
        let localContext = new TypeContext(this.context, this.state);
        this.enterRule(localContext, 18, LambdaParser.RULE_type);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 133;
            this.sumType();
            this.state = 136;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 19) {
                {
                this.state = 134;
                this.match(LambdaParser.ARROW);
                this.state = 135;
                this.type_();
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
    public sumType(): SumTypeContext {
        let localContext = new SumTypeContext(this.context, this.state);
        this.enterRule(localContext, 20, LambdaParser.RULE_sumType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 138;
            this.prodType();
            this.state = 143;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 22) {
                {
                {
                this.state = 139;
                this.match(LambdaParser.PLUS);
                this.state = 140;
                this.prodType();
                }
                }
                this.state = 145;
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
    public prodType(): ProdTypeContext {
        let localContext = new ProdTypeContext(this.context, this.state);
        this.enterRule(localContext, 22, LambdaParser.RULE_prodType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.atomicType();
            this.state = 151;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 21) {
                {
                {
                this.state = 147;
                this.match(LambdaParser.TIMES);
                this.state = 148;
                this.atomicType();
                }
                }
                this.state = 153;
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
    public atomicType(): AtomicTypeContext {
        let localContext = new AtomicTypeContext(this.context, this.state);
        this.enterRule(localContext, 24, LambdaParser.RULE_atomicType);
        try {
            this.state = 162;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 6, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 154;
                this.match(LambdaParser.TYPEID);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 155;
                this.match(LambdaParser.BOOL);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 156;
                this.match(LambdaParser.NAT);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 157;
                this.predicateType();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 158;
                this.match(LambdaParser.LPAREN);
                this.state = 159;
                this.type_();
                this.state = 160;
                this.match(LambdaParser.RPAREN);
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
    public predicateType(): PredicateTypeContext {
        let localContext = new PredicateTypeContext(this.context, this.state);
        this.enterRule(localContext, 26, LambdaParser.RULE_predicateType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 164;
            this.match(LambdaParser.TYPEID);
            this.state = 165;
            this.match(LambdaParser.LPAREN);
            this.state = 167;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 11)) & ~0x1F) === 0 && ((1 << (_la - 11)) & 8519683) !== 0)) {
                {
                this.state = 166;
                this.typeList();
                }
            }

            this.state = 169;
            this.match(LambdaParser.RPAREN);
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
    public typeList(): TypeListContext {
        let localContext = new TypeListContext(this.context, this.state);
        this.enterRule(localContext, 28, LambdaParser.RULE_typeList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 171;
            this.type_();
            this.state = 176;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 27) {
                {
                {
                this.state = 172;
                this.match(LambdaParser.COMMA);
                this.state = 173;
                this.type_();
                }
                }
                this.state = 178;
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

    public static readonly _serializedATN: number[] = [
        4,1,39,180,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,3,1,40,8,1,1,2,1,2,
        1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,4,1,4,1,4,1,4,
        1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,6,1,6,
        1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,7,
        4,7,92,8,7,11,7,12,7,93,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,
        1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,
        1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,132,8,8,1,9,1,9,1,9,
        3,9,137,8,9,1,10,1,10,1,10,5,10,142,8,10,10,10,12,10,145,9,10,1,
        11,1,11,1,11,5,11,150,8,11,10,11,12,11,153,9,11,1,12,1,12,1,12,1,
        12,1,12,1,12,1,12,1,12,3,12,163,8,12,1,13,1,13,1,13,3,13,168,8,13,
        1,13,1,13,1,14,1,14,1,14,5,14,175,8,14,10,14,12,14,178,9,14,1,14,
        0,0,15,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,0,0,190,0,30,1,0,
        0,0,2,39,1,0,0,0,4,41,1,0,0,0,6,48,1,0,0,0,8,55,1,0,0,0,10,66,1,
        0,0,0,12,73,1,0,0,0,14,91,1,0,0,0,16,131,1,0,0,0,18,133,1,0,0,0,
        20,138,1,0,0,0,22,146,1,0,0,0,24,162,1,0,0,0,26,164,1,0,0,0,28,171,
        1,0,0,0,30,31,3,2,1,0,31,32,5,0,0,1,32,1,1,0,0,0,33,40,3,4,2,0,34,
        40,3,8,4,0,35,40,3,6,3,0,36,40,3,10,5,0,37,40,3,12,6,0,38,40,3,14,
        7,0,39,33,1,0,0,0,39,34,1,0,0,0,39,35,1,0,0,0,39,36,1,0,0,0,39,37,
        1,0,0,0,39,38,1,0,0,0,40,3,1,0,0,0,41,42,5,18,0,0,42,43,5,36,0,0,
        43,44,5,24,0,0,44,45,3,18,9,0,45,46,5,25,0,0,46,47,3,2,1,0,47,5,
        1,0,0,0,48,49,5,1,0,0,49,50,5,36,0,0,50,51,5,23,0,0,51,52,3,2,1,
        0,52,53,5,2,0,0,53,54,3,2,1,0,54,7,1,0,0,0,55,56,5,1,0,0,56,57,5,
        30,0,0,57,58,5,36,0,0,58,59,5,27,0,0,59,60,5,36,0,0,60,61,5,31,0,
        0,61,62,5,23,0,0,62,63,3,2,1,0,63,64,5,2,0,0,64,65,3,2,1,0,65,9,
        1,0,0,0,66,67,5,3,0,0,67,68,3,2,1,0,68,69,5,4,0,0,69,70,3,2,1,0,
        70,71,5,5,0,0,71,72,3,2,1,0,72,11,1,0,0,0,73,74,5,6,0,0,74,75,3,
        2,1,0,75,76,5,7,0,0,76,77,5,8,0,0,77,78,5,36,0,0,78,79,5,24,0,0,
        79,80,3,18,9,0,80,81,5,20,0,0,81,82,3,2,1,0,82,83,5,26,0,0,83,84,
        5,9,0,0,84,85,5,36,0,0,85,86,5,24,0,0,86,87,3,18,9,0,87,88,5,20,
        0,0,88,89,3,2,1,0,89,13,1,0,0,0,90,92,3,16,8,0,91,90,1,0,0,0,92,
        93,1,0,0,0,93,91,1,0,0,0,93,94,1,0,0,0,94,15,1,0,0,0,95,132,5,36,
        0,0,96,132,5,13,0,0,97,132,5,14,0,0,98,132,5,35,0,0,99,100,5,15,
        0,0,100,132,3,16,8,0,101,102,5,16,0,0,102,132,3,16,8,0,103,104,5,
        17,0,0,104,132,3,16,8,0,105,106,5,28,0,0,106,107,3,2,1,0,107,108,
        5,29,0,0,108,132,1,0,0,0,109,110,5,28,0,0,110,111,3,2,1,0,111,112,
        5,27,0,0,112,113,3,2,1,0,113,114,5,29,0,0,114,132,1,0,0,0,115,116,
        5,32,0,0,116,117,3,2,1,0,117,118,5,27,0,0,118,119,3,2,1,0,119,120,
        5,33,0,0,120,132,1,0,0,0,121,122,5,8,0,0,122,123,3,16,8,0,123,124,
        5,10,0,0,124,125,3,18,9,0,125,132,1,0,0,0,126,127,5,9,0,0,127,128,
        3,16,8,0,128,129,5,10,0,0,129,130,3,18,9,0,130,132,1,0,0,0,131,95,
        1,0,0,0,131,96,1,0,0,0,131,97,1,0,0,0,131,98,1,0,0,0,131,99,1,0,
        0,0,131,101,1,0,0,0,131,103,1,0,0,0,131,105,1,0,0,0,131,109,1,0,
        0,0,131,115,1,0,0,0,131,121,1,0,0,0,131,126,1,0,0,0,132,17,1,0,0,
        0,133,136,3,20,10,0,134,135,5,19,0,0,135,137,3,18,9,0,136,134,1,
        0,0,0,136,137,1,0,0,0,137,19,1,0,0,0,138,143,3,22,11,0,139,140,5,
        22,0,0,140,142,3,22,11,0,141,139,1,0,0,0,142,145,1,0,0,0,143,141,
        1,0,0,0,143,144,1,0,0,0,144,21,1,0,0,0,145,143,1,0,0,0,146,151,3,
        24,12,0,147,148,5,21,0,0,148,150,3,24,12,0,149,147,1,0,0,0,150,153,
        1,0,0,0,151,149,1,0,0,0,151,152,1,0,0,0,152,23,1,0,0,0,153,151,1,
        0,0,0,154,163,5,34,0,0,155,163,5,11,0,0,156,163,5,12,0,0,157,163,
        3,26,13,0,158,159,5,28,0,0,159,160,3,18,9,0,160,161,5,29,0,0,161,
        163,1,0,0,0,162,154,1,0,0,0,162,155,1,0,0,0,162,156,1,0,0,0,162,
        157,1,0,0,0,162,158,1,0,0,0,163,25,1,0,0,0,164,165,5,34,0,0,165,
        167,5,28,0,0,166,168,3,28,14,0,167,166,1,0,0,0,167,168,1,0,0,0,168,
        169,1,0,0,0,169,170,5,29,0,0,170,27,1,0,0,0,171,176,3,18,9,0,172,
        173,5,27,0,0,173,175,3,18,9,0,174,172,1,0,0,0,175,178,1,0,0,0,176,
        174,1,0,0,0,176,177,1,0,0,0,177,29,1,0,0,0,178,176,1,0,0,0,9,39,
        93,131,136,143,151,162,167,176
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!LambdaParser.__ATN) {
            LambdaParser.__ATN = new antlr.ATNDeserializer().deserialize(LambdaParser._serializedATN);
        }

        return LambdaParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(LambdaParser.literalNames, LambdaParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return LambdaParser.vocabulary;
    }

    private static readonly decisionsToDFA = LambdaParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class ProgramContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public term(): TermContext {
        return this.getRuleContext(0, TermContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(LambdaParser.EOF, 0)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_program;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterProgram) {
             listener.enterProgram(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitProgram) {
             listener.exitProgram(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitProgram) {
            return visitor.visitProgram(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TermContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lamExpr(): LamExprContext | null {
        return this.getRuleContext(0, LamExprContext);
    }
    public letPairExpr(): LetPairExprContext | null {
        return this.getRuleContext(0, LetPairExprContext);
    }
    public letExpr(): LetExprContext | null {
        return this.getRuleContext(0, LetExprContext);
    }
    public ifExpr(): IfExprContext | null {
        return this.getRuleContext(0, IfExprContext);
    }
    public caseExpr(): CaseExprContext | null {
        return this.getRuleContext(0, CaseExprContext);
    }
    public appExpr(): AppExprContext | null {
        return this.getRuleContext(0, AppExprContext);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_term;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterTerm) {
             listener.enterTerm(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitTerm) {
             listener.exitTerm(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitTerm) {
            return visitor.visitTerm(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LamExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LAMBDA(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LAMBDA, 0)!;
    }
    public VAR(): antlr.TerminalNode {
        return this.getToken(LambdaParser.VAR, 0)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(LambdaParser.COLON, 0)!;
    }
    public type(): TypeContext {
        return this.getRuleContext(0, TypeContext)!;
    }
    public DOT(): antlr.TerminalNode {
        return this.getToken(LambdaParser.DOT, 0)!;
    }
    public term(): TermContext {
        return this.getRuleContext(0, TermContext)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_lamExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterLamExpr) {
             listener.enterLamExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitLamExpr) {
             listener.exitLamExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitLamExpr) {
            return visitor.visitLamExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LetExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LET(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LET, 0)!;
    }
    public VAR(): antlr.TerminalNode {
        return this.getToken(LambdaParser.VAR, 0)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.ASSIGN, 0)!;
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.IN, 0)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_letExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterLetExpr) {
             listener.enterLetExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitLetExpr) {
             listener.exitLetExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitLetExpr) {
            return visitor.visitLetExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LetPairExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LET(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LET, 0)!;
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LBRACK, 0)!;
    }
    public VAR(): antlr.TerminalNode[];
    public VAR(i: number): antlr.TerminalNode | null;
    public VAR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.VAR);
    	} else {
    		return this.getToken(LambdaParser.VAR, i);
    	}
    }
    public COMMA(): antlr.TerminalNode {
        return this.getToken(LambdaParser.COMMA, 0)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(LambdaParser.RBRACK, 0)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.ASSIGN, 0)!;
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public IN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.IN, 0)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_letPairExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterLetPairExpr) {
             listener.enterLetPairExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitLetPairExpr) {
             listener.exitLetPairExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitLetPairExpr) {
            return visitor.visitLetPairExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IfExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IF(): antlr.TerminalNode {
        return this.getToken(LambdaParser.IF, 0)!;
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public THEN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.THEN, 0)!;
    }
    public ELSE(): antlr.TerminalNode {
        return this.getToken(LambdaParser.ELSE, 0)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_ifExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterIfExpr) {
             listener.enterIfExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitIfExpr) {
             listener.exitIfExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitIfExpr) {
            return visitor.visitIfExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CaseExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CASE(): antlr.TerminalNode {
        return this.getToken(LambdaParser.CASE, 0)!;
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public OF(): antlr.TerminalNode {
        return this.getToken(LambdaParser.OF, 0)!;
    }
    public INL(): antlr.TerminalNode {
        return this.getToken(LambdaParser.INL, 0)!;
    }
    public VAR(): antlr.TerminalNode[];
    public VAR(i: number): antlr.TerminalNode | null;
    public VAR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.VAR);
    	} else {
    		return this.getToken(LambdaParser.VAR, i);
    	}
    }
    public COLON(): antlr.TerminalNode[];
    public COLON(i: number): antlr.TerminalNode | null;
    public COLON(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.COLON);
    	} else {
    		return this.getToken(LambdaParser.COLON, i);
    	}
    }
    public type_(): TypeContext[];
    public type_(i: number): TypeContext | null;
    public type_(i?: number): TypeContext[] | TypeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TypeContext);
        }

        return this.getRuleContext(i, TypeContext);
    }
    public FATARROW(): antlr.TerminalNode[];
    public FATARROW(i: number): antlr.TerminalNode | null;
    public FATARROW(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.FATARROW);
    	} else {
    		return this.getToken(LambdaParser.FATARROW, i);
    	}
    }
    public BAR(): antlr.TerminalNode {
        return this.getToken(LambdaParser.BAR, 0)!;
    }
    public INTR(): antlr.TerminalNode {
        return this.getToken(LambdaParser.INTR, 0)!;
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_caseExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterCaseExpr) {
             listener.enterCaseExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitCaseExpr) {
             listener.exitCaseExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitCaseExpr) {
            return visitor.visitCaseExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AppExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public atom(): AtomContext[];
    public atom(i: number): AtomContext | null;
    public atom(i?: number): AtomContext[] | AtomContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AtomContext);
        }

        return this.getRuleContext(i, AtomContext);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_appExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterAppExpr) {
             listener.enterAppExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitAppExpr) {
             listener.exitAppExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitAppExpr) {
            return visitor.visitAppExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AtomContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public VAR(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.VAR, 0);
    }
    public TRUE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.TRUE, 0);
    }
    public FALSE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.FALSE, 0);
    }
    public ZERO(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.ZERO, 0);
    }
    public SUCC(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.SUCC, 0);
    }
    public atom(): AtomContext | null {
        return this.getRuleContext(0, AtomContext);
    }
    public PRED(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.PRED, 0);
    }
    public ISZERO(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.ISZERO, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.LPAREN, 0);
    }
    public term(): TermContext[];
    public term(i: number): TermContext | null;
    public term(i?: number): TermContext[] | TermContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TermContext);
        }

        return this.getRuleContext(i, TermContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.RPAREN, 0);
    }
    public COMMA(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.COMMA, 0);
    }
    public LANGLE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.LANGLE, 0);
    }
    public RANGLE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.RANGLE, 0);
    }
    public INL(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.INL, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.AS, 0);
    }
    public type(): TypeContext | null {
        return this.getRuleContext(0, TypeContext);
    }
    public INTR(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.INTR, 0);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_atom;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterAtom) {
             listener.enterAtom(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitAtom) {
             listener.exitAtom(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitAtom) {
            return visitor.visitAtom(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public sumType(): SumTypeContext {
        return this.getRuleContext(0, SumTypeContext)!;
    }
    public ARROW(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.ARROW, 0);
    }
    public type(): TypeContext | null {
        return this.getRuleContext(0, TypeContext);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_type;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterType) {
             listener.enterType(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitType) {
             listener.exitType(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitType) {
            return visitor.visitType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SumTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public prodType(): ProdTypeContext[];
    public prodType(i: number): ProdTypeContext | null;
    public prodType(i?: number): ProdTypeContext[] | ProdTypeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ProdTypeContext);
        }

        return this.getRuleContext(i, ProdTypeContext);
    }
    public PLUS(): antlr.TerminalNode[];
    public PLUS(i: number): antlr.TerminalNode | null;
    public PLUS(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.PLUS);
    	} else {
    		return this.getToken(LambdaParser.PLUS, i);
    	}
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_sumType;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterSumType) {
             listener.enterSumType(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitSumType) {
             listener.exitSumType(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitSumType) {
            return visitor.visitSumType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ProdTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public atomicType(): AtomicTypeContext[];
    public atomicType(i: number): AtomicTypeContext | null;
    public atomicType(i?: number): AtomicTypeContext[] | AtomicTypeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AtomicTypeContext);
        }

        return this.getRuleContext(i, AtomicTypeContext);
    }
    public TIMES(): antlr.TerminalNode[];
    public TIMES(i: number): antlr.TerminalNode | null;
    public TIMES(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.TIMES);
    	} else {
    		return this.getToken(LambdaParser.TIMES, i);
    	}
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_prodType;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterProdType) {
             listener.enterProdType(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitProdType) {
             listener.exitProdType(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitProdType) {
            return visitor.visitProdType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AtomicTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TYPEID(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.TYPEID, 0);
    }
    public BOOL(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.BOOL, 0);
    }
    public NAT(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.NAT, 0);
    }
    public predicateType(): PredicateTypeContext | null {
        return this.getRuleContext(0, PredicateTypeContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.LPAREN, 0);
    }
    public type(): TypeContext | null {
        return this.getRuleContext(0, TypeContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_atomicType;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterAtomicType) {
             listener.enterAtomicType(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitAtomicType) {
             listener.exitAtomicType(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitAtomicType) {
            return visitor.visitAtomicType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PredicateTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TYPEID(): antlr.TerminalNode {
        return this.getToken(LambdaParser.TYPEID, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(LambdaParser.RPAREN, 0)!;
    }
    public typeList(): TypeListContext | null {
        return this.getRuleContext(0, TypeListContext);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_predicateType;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterPredicateType) {
             listener.enterPredicateType(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitPredicateType) {
             listener.exitPredicateType(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitPredicateType) {
            return visitor.visitPredicateType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public type_(): TypeContext[];
    public type_(i: number): TypeContext | null;
    public type_(i?: number): TypeContext[] | TypeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TypeContext);
        }

        return this.getRuleContext(i, TypeContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(LambdaParser.COMMA);
    	} else {
    		return this.getToken(LambdaParser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_typeList;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterTypeList) {
             listener.enterTypeList(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitTypeList) {
             listener.exitTypeList(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitTypeList) {
            return visitor.visitTypeList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
