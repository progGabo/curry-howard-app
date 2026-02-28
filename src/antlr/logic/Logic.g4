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
    : forall
    | exists
    | implication
    ;

forall
    : FORALL variable DOT formula
    ;

exists
    : EXISTS variable DOT formula
    ;

implication
    : disjunction (IMPL implication)?
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
FORALL: '∀' | 'forall' | 'Forall';
EXISTS: '∃' | 'exists' | 'Exists';
DOT: '.';
LPAREN: '(';
RPAREN: ')';
COMMA: ',';

PRED: [A-Z][a-zA-Z0-9_]*;
LOWERID: [a-z][a-zA-Z0-9_]*;

WS: [ \t\r\n]+ -> skip;