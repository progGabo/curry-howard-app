grammar PropositionalLogic;

sequent
    : assumptions? TURNSTILE conclusion? EOF
    ;

assumptions
    : formula (',' formula)*
    ;

conclusion
    : formula (',' formula)*
    ;

formula
    : implication
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
    | ATOM
    ;

TURNSTILE: '⊢' | '|-';
IMPL: '⇒' | '=>';
AND: '∧' | '&&';
OR: '∨' | '||';
NOT: '¬' | '!';
LPAREN: '(';
RPAREN: ')';
ATOM: [a-zA-Z][a-zA-Z0-9_]*;
WS: [ \t\r\n]+ -> skip;
