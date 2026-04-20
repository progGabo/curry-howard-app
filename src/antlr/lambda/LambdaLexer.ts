// Generated from src/antlr/lambda/Lambda.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class LambdaLexer extends antlr.Lexer {
    public static readonly LET = 1;
    public static readonly IN = 2;
    public static readonly CASE = 3;
    public static readonly OF = 4;
    public static readonly INL = 5;
    public static readonly INTR = 6;
    public static readonly AS = 7;
    public static readonly LAMBDA = 8;
    public static readonly ARROW = 9;
    public static readonly FATARROW = 10;
    public static readonly TIMES = 11;
    public static readonly PLUS = 12;
    public static readonly ASSIGN = 13;
    public static readonly COLON = 14;
    public static readonly DOT = 15;
    public static readonly BAR = 16;
    public static readonly COMMA = 17;
    public static readonly LPAREN = 18;
    public static readonly RPAREN = 19;
    public static readonly LBRACK = 20;
    public static readonly RBRACK = 21;
    public static readonly LANGLE = 22;
    public static readonly RANGLE = 23;
    public static readonly TYPEID = 24;
    public static readonly VAR = 25;
    public static readonly WS = 26;
    public static readonly LINE_COMMENT = 27;
    public static readonly BLOCK_COMMENT = 28;

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
        null, "'let'", "'in'", "'case'", "'of'", "'inl'", "'inr'", "'as'", 
        null, null, null, null, null, "'='", "':'", "'.'", "'|'", "','", 
        "'('", "')'", "'['", "']'"
    ];

    public static readonly symbolicNames = [
        null, "LET", "IN", "CASE", "OF", "INL", "INTR", "AS", "LAMBDA", 
        "ARROW", "FATARROW", "TIMES", "PLUS", "ASSIGN", "COLON", "DOT", 
        "BAR", "COMMA", "LPAREN", "RPAREN", "LBRACK", "RBRACK", "LANGLE", 
        "RANGLE", "TYPEID", "VAR", "WS", "LINE_COMMENT", "BLOCK_COMMENT"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "LET", "IN", "CASE", "OF", "INL", "INTR", "AS", "LAMBDA", "ARROW", 
        "FATARROW", "TIMES", "PLUS", "ASSIGN", "COLON", "DOT", "BAR", "COMMA", 
        "LPAREN", "RPAREN", "LBRACK", "RBRACK", "LANGLE", "RANGLE", "TYPEID", 
        "VAR", "WS", "LINE_COMMENT", "BLOCK_COMMENT",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, LambdaLexer._ATN, LambdaLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "Lambda.g4"; }

    public get literalNames(): (string | null)[] { return LambdaLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return LambdaLexer.symbolicNames; }
    public get ruleNames(): string[] { return LambdaLexer.ruleNames; }

    public get serializedATN(): number[] { return LambdaLexer._serializedATN; }

    public get channelNames(): string[] { return LambdaLexer.channelNames; }

    public get modeNames(): string[] { return LambdaLexer.modeNames; }

    public static readonly _serializedATN: number[] = [
        4,0,28,189,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,
        2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
        13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,
        19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,
        26,7,26,2,27,7,27,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,
        2,1,3,1,3,1,3,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,
        7,1,7,3,7,87,8,7,1,8,1,8,1,8,1,8,1,8,3,8,94,8,8,1,9,1,9,1,9,1,9,
        1,9,3,9,101,8,9,1,10,1,10,1,10,3,10,106,8,10,1,11,1,11,1,11,1,11,
        3,11,112,8,11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,
        1,17,1,17,1,18,1,18,1,19,1,19,1,20,1,20,1,21,1,21,1,21,1,21,3,21,
        136,8,21,1,22,1,22,1,22,1,22,3,22,142,8,22,1,23,1,23,5,23,146,8,
        23,10,23,12,23,149,9,23,1,24,1,24,5,24,153,8,24,10,24,12,24,156,
        9,24,1,25,4,25,159,8,25,11,25,12,25,160,1,25,1,25,1,26,1,26,1,26,
        1,26,5,26,169,8,26,10,26,12,26,172,9,26,1,26,1,26,1,27,1,27,1,27,
        1,27,5,27,180,8,27,10,27,12,27,183,9,27,1,27,1,27,1,27,1,27,1,27,
        1,181,0,28,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,
        12,25,13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,
        23,47,24,49,25,51,26,53,27,55,28,1,0,5,1,0,65,90,4,0,48,57,65,90,
        95,95,97,122,2,0,95,95,97,122,3,0,9,10,12,13,32,32,2,0,10,10,13,
        13,200,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,
        0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,
        0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,
        0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,
        0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,
        0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,1,57,1,0,0,0,3,61,1,0,0,
        0,5,64,1,0,0,0,7,69,1,0,0,0,9,72,1,0,0,0,11,76,1,0,0,0,13,80,1,0,
        0,0,15,86,1,0,0,0,17,93,1,0,0,0,19,100,1,0,0,0,21,105,1,0,0,0,23,
        111,1,0,0,0,25,113,1,0,0,0,27,115,1,0,0,0,29,117,1,0,0,0,31,119,
        1,0,0,0,33,121,1,0,0,0,35,123,1,0,0,0,37,125,1,0,0,0,39,127,1,0,
        0,0,41,129,1,0,0,0,43,135,1,0,0,0,45,141,1,0,0,0,47,143,1,0,0,0,
        49,150,1,0,0,0,51,158,1,0,0,0,53,164,1,0,0,0,55,175,1,0,0,0,57,58,
        5,108,0,0,58,59,5,101,0,0,59,60,5,116,0,0,60,2,1,0,0,0,61,62,5,105,
        0,0,62,63,5,110,0,0,63,4,1,0,0,0,64,65,5,99,0,0,65,66,5,97,0,0,66,
        67,5,115,0,0,67,68,5,101,0,0,68,6,1,0,0,0,69,70,5,111,0,0,70,71,
        5,102,0,0,71,8,1,0,0,0,72,73,5,105,0,0,73,74,5,110,0,0,74,75,5,108,
        0,0,75,10,1,0,0,0,76,77,5,105,0,0,77,78,5,110,0,0,78,79,5,114,0,
        0,79,12,1,0,0,0,80,81,5,97,0,0,81,82,5,115,0,0,82,14,1,0,0,0,83,
        84,5,206,0,0,84,87,5,187,0,0,85,87,5,92,0,0,86,83,1,0,0,0,86,85,
        1,0,0,0,87,16,1,0,0,0,88,89,5,45,0,0,89,94,5,62,0,0,90,91,5,226,
        0,0,91,92,5,8224,0,0,92,94,5,8217,0,0,93,88,1,0,0,0,93,90,1,0,0,
        0,94,18,1,0,0,0,95,96,5,61,0,0,96,101,5,62,0,0,97,98,5,226,0,0,98,
        99,5,8225,0,0,99,101,5,8217,0,0,100,95,1,0,0,0,100,97,1,0,0,0,101,
        20,1,0,0,0,102,106,5,42,0,0,103,104,5,195,0,0,104,106,5,8212,0,0,
        105,102,1,0,0,0,105,103,1,0,0,0,106,22,1,0,0,0,107,112,5,43,0,0,
        108,109,5,226,0,0,109,110,5,352,0,0,110,112,5,8226,0,0,111,107,1,
        0,0,0,111,108,1,0,0,0,112,24,1,0,0,0,113,114,5,61,0,0,114,26,1,0,
        0,0,115,116,5,58,0,0,116,28,1,0,0,0,117,118,5,46,0,0,118,30,1,0,
        0,0,119,120,5,124,0,0,120,32,1,0,0,0,121,122,5,44,0,0,122,34,1,0,
        0,0,123,124,5,40,0,0,124,36,1,0,0,0,125,126,5,41,0,0,126,38,1,0,
        0,0,127,128,5,91,0,0,128,40,1,0,0,0,129,130,5,93,0,0,130,42,1,0,
        0,0,131,136,5,60,0,0,132,133,5,226,0,0,133,134,5,376,0,0,134,136,
        5,168,0,0,135,131,1,0,0,0,135,132,1,0,0,0,136,44,1,0,0,0,137,142,
        5,62,0,0,138,139,5,226,0,0,139,140,5,376,0,0,140,142,5,169,0,0,141,
        137,1,0,0,0,141,138,1,0,0,0,142,46,1,0,0,0,143,147,7,0,0,0,144,146,
        7,1,0,0,145,144,1,0,0,0,146,149,1,0,0,0,147,145,1,0,0,0,147,148,
        1,0,0,0,148,48,1,0,0,0,149,147,1,0,0,0,150,154,7,2,0,0,151,153,7,
        1,0,0,152,151,1,0,0,0,153,156,1,0,0,0,154,152,1,0,0,0,154,155,1,
        0,0,0,155,50,1,0,0,0,156,154,1,0,0,0,157,159,7,3,0,0,158,157,1,0,
        0,0,159,160,1,0,0,0,160,158,1,0,0,0,160,161,1,0,0,0,161,162,1,0,
        0,0,162,163,6,25,0,0,163,52,1,0,0,0,164,165,5,47,0,0,165,166,5,47,
        0,0,166,170,1,0,0,0,167,169,8,4,0,0,168,167,1,0,0,0,169,172,1,0,
        0,0,170,168,1,0,0,0,170,171,1,0,0,0,171,173,1,0,0,0,172,170,1,0,
        0,0,173,174,6,26,0,0,174,54,1,0,0,0,175,176,5,47,0,0,176,177,5,42,
        0,0,177,181,1,0,0,0,178,180,9,0,0,0,179,178,1,0,0,0,180,183,1,0,
        0,0,181,182,1,0,0,0,181,179,1,0,0,0,182,184,1,0,0,0,183,181,1,0,
        0,0,184,185,5,42,0,0,185,186,5,47,0,0,186,187,1,0,0,0,187,188,6,
        27,0,0,188,56,1,0,0,0,13,0,86,93,100,105,111,135,141,147,154,160,
        170,181,1,6,0,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!LambdaLexer.__ATN) {
            LambdaLexer.__ATN = new antlr.ATNDeserializer().deserialize(LambdaLexer._serializedATN);
        }

        return LambdaLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(LambdaLexer.literalNames, LambdaLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return LambdaLexer.vocabulary;
    }

    private static readonly decisionsToDFA = LambdaLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}