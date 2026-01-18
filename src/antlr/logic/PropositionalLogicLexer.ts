// Generated from PropositionalLogic.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class PropositionalLogicLexer extends antlr.Lexer {
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

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
        null, "','", null, null, null, null, null, "'('", "')'"
    ];

    public static readonly symbolicNames = [
        null, null, "TURNSTILE", "IMPL", "AND", "OR", "NOT", "LPAREN", "RPAREN", 
        "ATOM", "WS"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "T__0", "TURNSTILE", "IMPL", "AND", "OR", "NOT", "LPAREN", "RPAREN", 
        "ATOM", "WS",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, PropositionalLogicLexer._ATN, PropositionalLogicLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "PropositionalLogic.g4"; }

    public get literalNames(): (string | null)[] { return PropositionalLogicLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return PropositionalLogicLexer.symbolicNames; }
    public get ruleNames(): string[] { return PropositionalLogicLexer.ruleNames; }

    public get serializedATN(): number[] { return PropositionalLogicLexer._serializedATN; }

    public get channelNames(): string[] { return PropositionalLogicLexer.channelNames; }

    public get modeNames(): string[] { return PropositionalLogicLexer.modeNames; }

    public static readonly _serializedATN: number[] = [
        4,0,10,74,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,
        6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,1,0,1,0,1,1,1,1,1,1,1,1,1,1,3,1,29,
        8,1,1,2,1,2,1,2,1,2,1,2,3,2,36,8,2,1,3,1,3,1,3,1,3,1,3,3,3,43,8,
        3,1,4,1,4,1,4,1,4,1,4,3,4,50,8,4,1,5,1,5,1,5,3,5,55,8,5,1,6,1,6,
        1,7,1,7,1,8,1,8,5,8,63,8,8,10,8,12,8,66,9,8,1,9,4,9,69,8,9,11,9,
        12,9,70,1,9,1,9,0,0,10,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,
        10,1,0,3,2,0,65,90,97,122,4,0,48,57,65,90,95,95,97,122,3,0,9,10,
        13,13,32,32,80,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,
        9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,
        19,1,0,0,0,1,21,1,0,0,0,3,28,1,0,0,0,5,35,1,0,0,0,7,42,1,0,0,0,9,
        49,1,0,0,0,11,54,1,0,0,0,13,56,1,0,0,0,15,58,1,0,0,0,17,60,1,0,0,
        0,19,68,1,0,0,0,21,22,5,44,0,0,22,2,1,0,0,0,23,24,5,226,0,0,24,25,
        5,352,0,0,25,29,5,728,0,0,26,27,5,124,0,0,27,29,5,45,0,0,28,23,1,
        0,0,0,28,26,1,0,0,0,29,4,1,0,0,0,30,31,5,226,0,0,31,32,5,8225,0,
        0,32,36,5,8217,0,0,33,34,5,61,0,0,34,36,5,62,0,0,35,30,1,0,0,0,35,
        33,1,0,0,0,36,6,1,0,0,0,37,38,5,226,0,0,38,39,5,65533,0,0,39,43,
        5,167,0,0,40,41,5,38,0,0,41,43,5,38,0,0,42,37,1,0,0,0,42,40,1,0,
        0,0,43,8,1,0,0,0,44,45,5,226,0,0,45,46,5,65533,0,0,46,50,5,168,0,
        0,47,48,5,124,0,0,48,50,5,124,0,0,49,44,1,0,0,0,49,47,1,0,0,0,50,
        10,1,0,0,0,51,52,5,194,0,0,52,55,5,172,0,0,53,55,5,33,0,0,54,51,
        1,0,0,0,54,53,1,0,0,0,55,12,1,0,0,0,56,57,5,40,0,0,57,14,1,0,0,0,
        58,59,5,41,0,0,59,16,1,0,0,0,60,64,7,0,0,0,61,63,7,1,0,0,62,61,1,
        0,0,0,63,66,1,0,0,0,64,62,1,0,0,0,64,65,1,0,0,0,65,18,1,0,0,0,66,
        64,1,0,0,0,67,69,7,2,0,0,68,67,1,0,0,0,69,70,1,0,0,0,70,68,1,0,0,
        0,70,71,1,0,0,0,71,72,1,0,0,0,72,73,6,9,0,0,73,20,1,0,0,0,8,0,28,
        35,42,49,54,64,70,1,6,0,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!PropositionalLogicLexer.__ATN) {
            PropositionalLogicLexer.__ATN = new antlr.ATNDeserializer().deserialize(PropositionalLogicLexer._serializedATN);
        }

        return PropositionalLogicLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(PropositionalLogicLexer.literalNames, PropositionalLogicLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return PropositionalLogicLexer.vocabulary;
    }

    private static readonly decisionsToDFA = PropositionalLogicLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}