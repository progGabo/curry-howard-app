// Generated from src/antlr/lambda/Lambda.g4 by ANTLR 4.13.1

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
    public static readonly RULE_letDependentPairExpr = 5;
    public static readonly RULE_ifExpr = 6;
    public static readonly RULE_caseExpr = 7;
    public static readonly RULE_appExpr = 8;
    public static readonly RULE_atom = 9;
    public static readonly RULE_type = 10;
    public static readonly RULE_sumType = 11;
    public static readonly RULE_prodType = 12;
    public static readonly RULE_atomicType = 13;
    public static readonly RULE_predicateType = 14;
    public static readonly RULE_typeList = 15;

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
        "program", "term", "lamExpr", "letExpr", "letPairExpr", "letDependentPairExpr", 
        "ifExpr", "caseExpr", "appExpr", "atom", "type", "sumType", "prodType", 
        "atomicType", "predicateType", "typeList",
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
            this.state = 32;
            this.term();
            this.state = 33;
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
            this.state = 42;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 0, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 35;
                this.lamExpr();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 36;
                this.letDependentPairExpr();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 37;
                this.letPairExpr();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 38;
                this.letExpr();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 39;
                this.ifExpr();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 40;
                this.caseExpr();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 41;
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
            this.state = 44;
            this.match(LambdaParser.LAMBDA);
            this.state = 45;
            this.match(LambdaParser.VAR);
            this.state = 46;
            this.match(LambdaParser.COLON);
            this.state = 47;
            this.type_();
            this.state = 48;
            this.match(LambdaParser.DOT);
            this.state = 49;
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
            this.state = 51;
            this.match(LambdaParser.LET);
            this.state = 52;
            this.match(LambdaParser.VAR);
            this.state = 53;
            this.match(LambdaParser.ASSIGN);
            this.state = 54;
            this.term();
            this.state = 55;
            this.match(LambdaParser.IN);
            this.state = 56;
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
            this.state = 58;
            this.match(LambdaParser.LET);
            this.state = 59;
            this.match(LambdaParser.LBRACK);
            this.state = 60;
            this.match(LambdaParser.VAR);
            this.state = 61;
            this.match(LambdaParser.COMMA);
            this.state = 62;
            this.match(LambdaParser.VAR);
            this.state = 63;
            this.match(LambdaParser.RBRACK);
            this.state = 64;
            this.match(LambdaParser.ASSIGN);
            this.state = 65;
            this.term();
            this.state = 66;
            this.match(LambdaParser.IN);
            this.state = 67;
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
    public letDependentPairExpr(): LetDependentPairExprContext {
        let localContext = new LetDependentPairExprContext(this.context, this.state);
        this.enterRule(localContext, 10, LambdaParser.RULE_letDependentPairExpr);
        let _la: number;
        try {
            this.state = 107;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 5, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 69;
                this.match(LambdaParser.LET);
                this.state = 70;
                this.match(LambdaParser.LANGLE);
                this.state = 71;
                this.match(LambdaParser.VAR);
                this.state = 74;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 72;
                    this.match(LambdaParser.COLON);
                    this.state = 73;
                    this.type_();
                    }
                }

                this.state = 76;
                this.match(LambdaParser.COMMA);
                this.state = 77;
                this.match(LambdaParser.VAR);
                this.state = 80;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 78;
                    this.match(LambdaParser.COLON);
                    this.state = 79;
                    this.type_();
                    }
                }

                this.state = 82;
                this.match(LambdaParser.RANGLE);
                this.state = 83;
                this.match(LambdaParser.ASSIGN);
                this.state = 84;
                this.term();
                this.state = 85;
                this.match(LambdaParser.IN);
                this.state = 86;
                this.term();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 88;
                this.match(LambdaParser.LET);
                this.state = 89;
                this.match(LambdaParser.LPAREN);
                this.state = 90;
                this.match(LambdaParser.VAR);
                this.state = 93;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 91;
                    this.match(LambdaParser.COLON);
                    this.state = 92;
                    this.type_();
                    }
                }

                this.state = 95;
                this.match(LambdaParser.COMMA);
                this.state = 96;
                this.match(LambdaParser.VAR);
                this.state = 99;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 97;
                    this.match(LambdaParser.COLON);
                    this.state = 98;
                    this.type_();
                    }
                }

                this.state = 101;
                this.match(LambdaParser.RPAREN);
                this.state = 102;
                this.match(LambdaParser.ASSIGN);
                this.state = 103;
                this.term();
                this.state = 104;
                this.match(LambdaParser.IN);
                this.state = 105;
                this.term();
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
    public ifExpr(): IfExprContext {
        let localContext = new IfExprContext(this.context, this.state);
        this.enterRule(localContext, 12, LambdaParser.RULE_ifExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 109;
            this.match(LambdaParser.IF);
            this.state = 110;
            this.term();
            this.state = 111;
            this.match(LambdaParser.THEN);
            this.state = 112;
            this.term();
            this.state = 113;
            this.match(LambdaParser.ELSE);
            this.state = 114;
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
        this.enterRule(localContext, 14, LambdaParser.RULE_caseExpr);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 116;
            this.match(LambdaParser.CASE);
            this.state = 117;
            this.term();
            this.state = 118;
            this.match(LambdaParser.OF);
            this.state = 119;
            this.match(LambdaParser.INL);
            this.state = 120;
            this.match(LambdaParser.VAR);
            this.state = 121;
            this.match(LambdaParser.COLON);
            this.state = 122;
            this.type_();
            this.state = 123;
            this.match(LambdaParser.FATARROW);
            this.state = 124;
            this.term();
            this.state = 125;
            this.match(LambdaParser.BAR);
            this.state = 126;
            this.match(LambdaParser.INTR);
            this.state = 127;
            this.match(LambdaParser.VAR);
            this.state = 128;
            this.match(LambdaParser.COLON);
            this.state = 129;
            this.type_();
            this.state = 130;
            this.match(LambdaParser.FATARROW);
            this.state = 131;
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
        this.enterRule(localContext, 16, LambdaParser.RULE_appExpr);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 134;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 133;
                this.atom();
                }
                }
                this.state = 136;
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
        this.enterRule(localContext, 18, LambdaParser.RULE_atom);
        let _la: number;
        try {
            this.state = 182;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 138;
                this.match(LambdaParser.VAR);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 139;
                this.match(LambdaParser.TRUE);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 140;
                this.match(LambdaParser.FALSE);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 141;
                this.match(LambdaParser.ZERO);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 142;
                this.match(LambdaParser.SUCC);
                this.state = 143;
                this.atom();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 144;
                this.match(LambdaParser.PRED);
                this.state = 145;
                this.atom();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 146;
                this.match(LambdaParser.ISZERO);
                this.state = 147;
                this.atom();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 148;
                this.match(LambdaParser.LPAREN);
                this.state = 149;
                this.term();
                this.state = 150;
                this.match(LambdaParser.RPAREN);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 152;
                this.match(LambdaParser.LPAREN);
                this.state = 153;
                this.term();
                this.state = 154;
                this.match(LambdaParser.COMMA);
                this.state = 155;
                this.term();
                this.state = 156;
                this.match(LambdaParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 158;
                this.match(LambdaParser.LANGLE);
                this.state = 159;
                this.term();
                this.state = 162;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 160;
                    this.match(LambdaParser.COLON);
                    this.state = 161;
                    this.type_();
                    }
                }

                this.state = 164;
                this.match(LambdaParser.COMMA);
                this.state = 165;
                this.term();
                this.state = 168;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 24) {
                    {
                    this.state = 166;
                    this.match(LambdaParser.COLON);
                    this.state = 167;
                    this.type_();
                    }
                }

                this.state = 170;
                this.match(LambdaParser.RANGLE);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 172;
                this.match(LambdaParser.INL);
                this.state = 173;
                this.atom();
                this.state = 174;
                this.match(LambdaParser.AS);
                this.state = 175;
                this.type_();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 177;
                this.match(LambdaParser.INTR);
                this.state = 178;
                this.atom();
                this.state = 179;
                this.match(LambdaParser.AS);
                this.state = 180;
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
        this.enterRule(localContext, 20, LambdaParser.RULE_type);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 184;
            this.sumType();
            this.state = 187;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 19) {
                {
                this.state = 185;
                this.match(LambdaParser.ARROW);
                this.state = 186;
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
        this.enterRule(localContext, 22, LambdaParser.RULE_sumType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 189;
            this.prodType();
            this.state = 194;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 22) {
                {
                {
                this.state = 190;
                this.match(LambdaParser.PLUS);
                this.state = 191;
                this.prodType();
                }
                }
                this.state = 196;
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
        this.enterRule(localContext, 24, LambdaParser.RULE_prodType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 197;
            this.atomicType();
            this.state = 202;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 21) {
                {
                {
                this.state = 198;
                this.match(LambdaParser.TIMES);
                this.state = 199;
                this.atomicType();
                }
                }
                this.state = 204;
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
        this.enterRule(localContext, 26, LambdaParser.RULE_atomicType);
        try {
            this.state = 214;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 13, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 205;
                this.match(LambdaParser.TYPEID);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 206;
                this.match(LambdaParser.VAR);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 207;
                this.match(LambdaParser.BOOL);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 208;
                this.match(LambdaParser.NAT);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 209;
                this.predicateType();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 210;
                this.match(LambdaParser.LPAREN);
                this.state = 211;
                this.type_();
                this.state = 212;
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
        this.enterRule(localContext, 28, LambdaParser.RULE_predicateType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 216;
            this.match(LambdaParser.TYPEID);
            this.state = 217;
            this.match(LambdaParser.LPAREN);
            this.state = 219;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 11)) & ~0x1F) === 0 && ((1 << (_la - 11)) & 42074115) !== 0)) {
                {
                this.state = 218;
                this.typeList();
                }
            }

            this.state = 221;
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
        this.enterRule(localContext, 30, LambdaParser.RULE_typeList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 223;
            this.type_();
            this.state = 228;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 27) {
                {
                {
                this.state = 224;
                this.match(LambdaParser.COMMA);
                this.state = 225;
                this.type_();
                }
                }
                this.state = 230;
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
        4,1,39,232,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,
        43,8,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,
        4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,5,3,
        5,75,8,5,1,5,1,5,1,5,1,5,3,5,81,8,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,
        1,5,1,5,1,5,1,5,3,5,94,8,5,1,5,1,5,1,5,1,5,3,5,100,8,5,1,5,1,5,1,
        5,1,5,1,5,1,5,3,5,108,8,5,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,7,1,7,1,
        7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,8,4,
        8,135,8,8,11,8,12,8,136,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,
        1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,163,
        8,9,1,9,1,9,1,9,1,9,3,9,169,8,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,
        1,9,1,9,1,9,1,9,3,9,183,8,9,1,10,1,10,1,10,3,10,188,8,10,1,11,1,
        11,1,11,5,11,193,8,11,10,11,12,11,196,9,11,1,12,1,12,1,12,5,12,201,
        8,12,10,12,12,12,204,9,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,
        1,13,3,13,215,8,13,1,14,1,14,1,14,3,14,220,8,14,1,14,1,14,1,15,1,
        15,1,15,5,15,227,8,15,10,15,12,15,230,9,15,1,15,0,0,16,0,2,4,6,8,
        10,12,14,16,18,20,22,24,26,28,30,0,0,250,0,32,1,0,0,0,2,42,1,0,0,
        0,4,44,1,0,0,0,6,51,1,0,0,0,8,58,1,0,0,0,10,107,1,0,0,0,12,109,1,
        0,0,0,14,116,1,0,0,0,16,134,1,0,0,0,18,182,1,0,0,0,20,184,1,0,0,
        0,22,189,1,0,0,0,24,197,1,0,0,0,26,214,1,0,0,0,28,216,1,0,0,0,30,
        223,1,0,0,0,32,33,3,2,1,0,33,34,5,0,0,1,34,1,1,0,0,0,35,43,3,4,2,
        0,36,43,3,10,5,0,37,43,3,8,4,0,38,43,3,6,3,0,39,43,3,12,6,0,40,43,
        3,14,7,0,41,43,3,16,8,0,42,35,1,0,0,0,42,36,1,0,0,0,42,37,1,0,0,
        0,42,38,1,0,0,0,42,39,1,0,0,0,42,40,1,0,0,0,42,41,1,0,0,0,43,3,1,
        0,0,0,44,45,5,18,0,0,45,46,5,36,0,0,46,47,5,24,0,0,47,48,3,20,10,
        0,48,49,5,25,0,0,49,50,3,2,1,0,50,5,1,0,0,0,51,52,5,1,0,0,52,53,
        5,36,0,0,53,54,5,23,0,0,54,55,3,2,1,0,55,56,5,2,0,0,56,57,3,2,1,
        0,57,7,1,0,0,0,58,59,5,1,0,0,59,60,5,30,0,0,60,61,5,36,0,0,61,62,
        5,27,0,0,62,63,5,36,0,0,63,64,5,31,0,0,64,65,5,23,0,0,65,66,3,2,
        1,0,66,67,5,2,0,0,67,68,3,2,1,0,68,9,1,0,0,0,69,70,5,1,0,0,70,71,
        5,32,0,0,71,74,5,36,0,0,72,73,5,24,0,0,73,75,3,20,10,0,74,72,1,0,
        0,0,74,75,1,0,0,0,75,76,1,0,0,0,76,77,5,27,0,0,77,80,5,36,0,0,78,
        79,5,24,0,0,79,81,3,20,10,0,80,78,1,0,0,0,80,81,1,0,0,0,81,82,1,
        0,0,0,82,83,5,33,0,0,83,84,5,23,0,0,84,85,3,2,1,0,85,86,5,2,0,0,
        86,87,3,2,1,0,87,108,1,0,0,0,88,89,5,1,0,0,89,90,5,28,0,0,90,93,
        5,36,0,0,91,92,5,24,0,0,92,94,3,20,10,0,93,91,1,0,0,0,93,94,1,0,
        0,0,94,95,1,0,0,0,95,96,5,27,0,0,96,99,5,36,0,0,97,98,5,24,0,0,98,
        100,3,20,10,0,99,97,1,0,0,0,99,100,1,0,0,0,100,101,1,0,0,0,101,102,
        5,29,0,0,102,103,5,23,0,0,103,104,3,2,1,0,104,105,5,2,0,0,105,106,
        3,2,1,0,106,108,1,0,0,0,107,69,1,0,0,0,107,88,1,0,0,0,108,11,1,0,
        0,0,109,110,5,3,0,0,110,111,3,2,1,0,111,112,5,4,0,0,112,113,3,2,
        1,0,113,114,5,5,0,0,114,115,3,2,1,0,115,13,1,0,0,0,116,117,5,6,0,
        0,117,118,3,2,1,0,118,119,5,7,0,0,119,120,5,8,0,0,120,121,5,36,0,
        0,121,122,5,24,0,0,122,123,3,20,10,0,123,124,5,20,0,0,124,125,3,
        2,1,0,125,126,5,26,0,0,126,127,5,9,0,0,127,128,5,36,0,0,128,129,
        5,24,0,0,129,130,3,20,10,0,130,131,5,20,0,0,131,132,3,2,1,0,132,
        15,1,0,0,0,133,135,3,18,9,0,134,133,1,0,0,0,135,136,1,0,0,0,136,
        134,1,0,0,0,136,137,1,0,0,0,137,17,1,0,0,0,138,183,5,36,0,0,139,
        183,5,13,0,0,140,183,5,14,0,0,141,183,5,35,0,0,142,143,5,15,0,0,
        143,183,3,18,9,0,144,145,5,16,0,0,145,183,3,18,9,0,146,147,5,17,
        0,0,147,183,3,18,9,0,148,149,5,28,0,0,149,150,3,2,1,0,150,151,5,
        29,0,0,151,183,1,0,0,0,152,153,5,28,0,0,153,154,3,2,1,0,154,155,
        5,27,0,0,155,156,3,2,1,0,156,157,5,29,0,0,157,183,1,0,0,0,158,159,
        5,32,0,0,159,162,3,2,1,0,160,161,5,24,0,0,161,163,3,20,10,0,162,
        160,1,0,0,0,162,163,1,0,0,0,163,164,1,0,0,0,164,165,5,27,0,0,165,
        168,3,2,1,0,166,167,5,24,0,0,167,169,3,20,10,0,168,166,1,0,0,0,168,
        169,1,0,0,0,169,170,1,0,0,0,170,171,5,33,0,0,171,183,1,0,0,0,172,
        173,5,8,0,0,173,174,3,18,9,0,174,175,5,10,0,0,175,176,3,20,10,0,
        176,183,1,0,0,0,177,178,5,9,0,0,178,179,3,18,9,0,179,180,5,10,0,
        0,180,181,3,20,10,0,181,183,1,0,0,0,182,138,1,0,0,0,182,139,1,0,
        0,0,182,140,1,0,0,0,182,141,1,0,0,0,182,142,1,0,0,0,182,144,1,0,
        0,0,182,146,1,0,0,0,182,148,1,0,0,0,182,152,1,0,0,0,182,158,1,0,
        0,0,182,172,1,0,0,0,182,177,1,0,0,0,183,19,1,0,0,0,184,187,3,22,
        11,0,185,186,5,19,0,0,186,188,3,20,10,0,187,185,1,0,0,0,187,188,
        1,0,0,0,188,21,1,0,0,0,189,194,3,24,12,0,190,191,5,22,0,0,191,193,
        3,24,12,0,192,190,1,0,0,0,193,196,1,0,0,0,194,192,1,0,0,0,194,195,
        1,0,0,0,195,23,1,0,0,0,196,194,1,0,0,0,197,202,3,26,13,0,198,199,
        5,21,0,0,199,201,3,26,13,0,200,198,1,0,0,0,201,204,1,0,0,0,202,200,
        1,0,0,0,202,203,1,0,0,0,203,25,1,0,0,0,204,202,1,0,0,0,205,215,5,
        34,0,0,206,215,5,36,0,0,207,215,5,11,0,0,208,215,5,12,0,0,209,215,
        3,28,14,0,210,211,5,28,0,0,211,212,3,20,10,0,212,213,5,29,0,0,213,
        215,1,0,0,0,214,205,1,0,0,0,214,206,1,0,0,0,214,207,1,0,0,0,214,
        208,1,0,0,0,214,209,1,0,0,0,214,210,1,0,0,0,215,27,1,0,0,0,216,217,
        5,34,0,0,217,219,5,28,0,0,218,220,3,30,15,0,219,218,1,0,0,0,219,
        220,1,0,0,0,220,221,1,0,0,0,221,222,5,29,0,0,222,29,1,0,0,0,223,
        228,3,20,10,0,224,225,5,27,0,0,225,227,3,20,10,0,226,224,1,0,0,0,
        227,230,1,0,0,0,228,226,1,0,0,0,228,229,1,0,0,0,229,31,1,0,0,0,230,
        228,1,0,0,0,16,42,74,80,93,99,107,136,162,168,182,187,194,202,214,
        219,228
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
    public letDependentPairExpr(): LetDependentPairExprContext | null {
        return this.getRuleContext(0, LetDependentPairExprContext);
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


export class LetDependentPairExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LET(): antlr.TerminalNode {
        return this.getToken(LambdaParser.LET, 0)!;
    }
    public LANGLE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.LANGLE, 0);
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
    public RANGLE(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.RANGLE, 0);
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
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.LPAREN, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return LambdaParser.RULE_letDependentPairExpr;
    }
    public override enterRule(listener: LambdaListener): void {
        if(listener.enterLetDependentPairExpr) {
             listener.enterLetDependentPairExpr(this);
        }
    }
    public override exitRule(listener: LambdaListener): void {
        if(listener.exitLetDependentPairExpr) {
             listener.exitLetDependentPairExpr(this);
        }
    }
    public override accept<Result>(visitor: LambdaVisitor<Result>): Result | null {
        if (visitor.visitLetDependentPairExpr) {
            return visitor.visitLetDependentPairExpr(this);
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
    public INL(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.INL, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.AS, 0);
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
    public VAR(): antlr.TerminalNode | null {
        return this.getToken(LambdaParser.VAR, 0);
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
