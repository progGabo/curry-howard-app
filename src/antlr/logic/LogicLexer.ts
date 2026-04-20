// Generated from Logic.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class LogicLexer extends antlr.Lexer {
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

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
        null, null, null, null, null, null, null, null, null, null, "'.'", 
        "'('", "')'", "','"
    ];

    public static readonly symbolicNames = [
        null, "TURNSTILE", "IMPL", "AND", "OR", "NOT", "TOP", "BOT", "FORALL", 
        "EXISTS", "DOT", "LPAREN", "RPAREN", "COMMA", "PRED", "LOWERID", 
        "WS"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "TURNSTILE", "IMPL", "AND", "OR", "NOT", "TOP", "BOT", "FORALL", 
        "EXISTS", "DOT", "LPAREN", "RPAREN", "COMMA", "PRED", "LOWERID", 
        "WS",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, LogicLexer._ATN, LogicLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "Logic.g4"; }

    public get literalNames(): (string | null)[] { return LogicLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return LogicLexer.symbolicNames; }
    public get ruleNames(): string[] { return LogicLexer.ruleNames; }

    public get serializedATN(): number[] { return LogicLexer._serializedATN; }

    public get channelNames(): string[] { return LogicLexer.channelNames; }

    public get modeNames(): string[] { return LogicLexer.modeNames; }

    public static readonly _serializedATN: number[] = [
        4,0,16,166,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,
        2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
        13,7,13,2,14,7,14,2,15,7,15,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,0,
        42,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,52,8,1,1,2,1,2,1,2,1,
        2,1,2,1,2,1,2,1,2,3,2,62,8,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3,3,3,
        72,8,3,1,4,1,4,1,4,1,4,1,4,1,4,3,4,80,8,4,1,5,1,5,1,5,1,5,1,5,1,
        5,1,5,1,5,3,5,90,8,5,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,
        102,8,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,
        1,7,3,7,119,8,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,
        1,8,1,8,1,8,3,8,136,8,8,1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,
        13,1,13,5,13,148,8,13,10,13,12,13,151,9,13,1,14,1,14,5,14,155,8,
        14,10,14,12,14,158,9,14,1,15,4,15,161,8,15,11,15,12,15,162,1,15,
        1,15,0,0,16,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,
        23,12,25,13,27,14,29,15,31,16,1,0,5,2,0,33,33,126,126,1,0,65,90,
        4,0,48,57,65,90,95,95,97,122,1,0,97,122,3,0,9,10,13,13,32,32,184,
        0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,
        1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,
        1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,
        1,0,0,0,1,41,1,0,0,0,3,51,1,0,0,0,5,61,1,0,0,0,7,71,1,0,0,0,9,79,
        1,0,0,0,11,89,1,0,0,0,13,101,1,0,0,0,15,118,1,0,0,0,17,135,1,0,0,
        0,19,137,1,0,0,0,21,139,1,0,0,0,23,141,1,0,0,0,25,143,1,0,0,0,27,
        145,1,0,0,0,29,152,1,0,0,0,31,160,1,0,0,0,33,34,5,226,0,0,34,35,
        5,352,0,0,35,42,5,162,0,0,36,37,5,226,0,0,37,38,5,8221,0,0,38,42,
        5,339,0,0,39,40,5,124,0,0,40,42,5,45,0,0,41,33,1,0,0,0,41,36,1,0,
        0,0,41,39,1,0,0,0,42,2,1,0,0,0,43,44,5,226,0,0,44,45,5,8225,0,0,
        45,52,5,8217,0,0,46,47,5,226,0,0,47,48,5,8224,0,0,48,52,5,8217,0,
        0,49,50,5,61,0,0,50,52,5,62,0,0,51,43,1,0,0,0,51,46,1,0,0,0,51,49,
        1,0,0,0,52,4,1,0,0,0,53,54,5,226,0,0,54,55,5,710,0,0,55,62,5,167,
        0,0,56,57,5,226,0,0,57,58,5,8249,0,0,58,62,5,8364,0,0,59,60,5,38,
        0,0,60,62,5,38,0,0,61,53,1,0,0,0,61,56,1,0,0,0,61,59,1,0,0,0,62,
        6,1,0,0,0,63,64,5,226,0,0,64,65,5,710,0,0,65,72,5,168,0,0,66,67,
        5,226,0,0,67,68,5,8249,0,0,68,72,5,65533,0,0,69,70,5,124,0,0,70,
        72,5,124,0,0,71,63,1,0,0,0,71,66,1,0,0,0,71,69,1,0,0,0,72,8,1,0,
        0,0,73,74,5,194,0,0,74,80,5,172,0,0,75,76,5,226,0,0,76,77,5,710,
        0,0,77,80,5,188,0,0,78,80,7,0,0,0,79,73,1,0,0,0,79,75,1,0,0,0,79,
        78,1,0,0,0,80,10,1,0,0,0,81,82,5,84,0,0,82,83,5,114,0,0,83,84,5,
        117,0,0,84,90,5,101,0,0,85,86,5,116,0,0,86,87,5,114,0,0,87,88,5,
        117,0,0,88,90,5,101,0,0,89,81,1,0,0,0,89,85,1,0,0,0,90,12,1,0,0,
        0,91,92,5,70,0,0,92,93,5,97,0,0,93,94,5,108,0,0,94,95,5,115,0,0,
        95,102,5,101,0,0,96,97,5,102,0,0,97,98,5,97,0,0,98,99,5,108,0,0,
        99,100,5,115,0,0,100,102,5,101,0,0,101,91,1,0,0,0,101,96,1,0,0,0,
        102,14,1,0,0,0,103,104,5,226,0,0,104,105,5,710,0,0,105,119,5,8364,
        0,0,106,107,5,102,0,0,107,108,5,111,0,0,108,109,5,114,0,0,109,110,
        5,97,0,0,110,111,5,108,0,0,111,119,5,108,0,0,112,113,5,70,0,0,113,
        114,5,111,0,0,114,115,5,114,0,0,115,116,5,97,0,0,116,117,5,108,0,
        0,117,119,5,108,0,0,118,103,1,0,0,0,118,106,1,0,0,0,118,112,1,0,
        0,0,119,16,1,0,0,0,120,121,5,226,0,0,121,122,5,710,0,0,122,136,5,
        402,0,0,123,124,5,101,0,0,124,125,5,120,0,0,125,126,5,105,0,0,126,
        127,5,115,0,0,127,128,5,116,0,0,128,136,5,115,0,0,129,130,5,69,0,
        0,130,131,5,120,0,0,131,132,5,105,0,0,132,133,5,115,0,0,133,134,
        5,116,0,0,134,136,5,115,0,0,135,120,1,0,0,0,135,123,1,0,0,0,135,
        129,1,0,0,0,136,18,1,0,0,0,137,138,5,46,0,0,138,20,1,0,0,0,139,140,
        5,40,0,0,140,22,1,0,0,0,141,142,5,41,0,0,142,24,1,0,0,0,143,144,
        5,44,0,0,144,26,1,0,0,0,145,149,7,1,0,0,146,148,7,2,0,0,147,146,
        1,0,0,0,148,151,1,0,0,0,149,147,1,0,0,0,149,150,1,0,0,0,150,28,1,
        0,0,0,151,149,1,0,0,0,152,156,7,3,0,0,153,155,7,2,0,0,154,153,1,
        0,0,0,155,158,1,0,0,0,156,154,1,0,0,0,156,157,1,0,0,0,157,30,1,0,
        0,0,158,156,1,0,0,0,159,161,7,4,0,0,160,159,1,0,0,0,161,162,1,0,
        0,0,162,160,1,0,0,0,162,163,1,0,0,0,163,164,1,0,0,0,164,165,6,15,
        0,0,165,32,1,0,0,0,13,0,41,51,61,71,79,89,101,118,135,149,156,162,
        1,6,0,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!LogicLexer.__ATN) {
            LogicLexer.__ATN = new antlr.ATNDeserializer().deserialize(LogicLexer._serializedATN);
        }

        return LogicLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(LogicLexer.literalNames, LogicLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return LogicLexer.vocabulary;
    }

    private static readonly decisionsToDFA = LogicLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}