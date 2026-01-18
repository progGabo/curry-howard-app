grammar PredicateLogic;

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
    | forall
    | exists
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
    | LOWERID  // Propositional variables (atoms) - lowercase identifiers
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

TURNSTILE: '⊢' | '|-';
IMPL: '⇒' | '=>';
AND: '∧' | '&&';
OR: '∨' | '||';
NOT: '¬' | '!';
FORALL: '∀' | 'forall' | 'Forall';
EXISTS: '∃' | 'exists' | 'Exists';
DOT: '.';
LPAREN: '(';
RPAREN: ')';
COMMA: ',';

// Predicates: uppercase identifiers
PRED: [A-Z][a-zA-Z0-9_]*;

// Lowercase identifiers (propositional variables/atoms, term variables, constants, functions)
LOWERID: [a-z][a-zA-Z0-9_]*;

WS: [ \t\r\n]+ -> skip;

