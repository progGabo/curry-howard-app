grammar Logic;

sequent
    : assumptions? TURNSTILE conclusion? EOF
    ;

assumptions
    : formula (COMMA formula)*
    ;

conclusion
    : formula (COMMA formula)*
    ;

formula
    : implication
    ;

implication
    : quantifiedExpr (IMPL implication)?
    ;

quantifiedExpr
    : forall
    | exists
    | disjunction
    ;

forall
    : FORALL variable DOT quantifiedExpr
    ;

exists
    : EXISTS variable DOT quantifiedExpr
    ;

disjunction
    : conjunction (OR conjunction)*
    ;

conjunction
    : negation (AND negation)*
    ;

negation
    : NOT negation
    | atom
    ;

atom
    : LPAREN formula RPAREN
    | predicate
    | TOP
    | BOT
    | LOWERID
    | PRED
    ;

predicate
    : PRED LPAREN termList? RPAREN
    ;

termList
    : term (COMMA term)*
    ;

term
    : variable
    | constant
    | functionApp
    | LPAREN term RPAREN
    ;

variable
    : LOWERID
    ;

constant
    : LOWERID
    ;

functionApp
    : LOWERID LPAREN termList? RPAREN
    ;

TURNSTILE: '⊢' | '├' | '|-';
IMPL: '⇒' | '→' | '=>';
AND: '∧' | '⋀' | '&&';
OR: '∨' | '⋁' | '||';
NOT: '¬' | '∼' | '~' | '!';
TOP: 'T' | 'True' | 'true';
BOT: 'F' | 'False' | 'false';
FORALL: '∀' | 'forall' | 'Forall';
EXISTS: '∃' | 'exists' | 'Exists';
DOT: '.';
LPAREN: '(';
RPAREN: ')';
COMMA: ',';

PRED: [A-Z][a-zA-Z0-9_]*;
LOWERID: [a-z][a-zA-Z0-9_]*;

WS: [ \t\r\n]+ -> skip;