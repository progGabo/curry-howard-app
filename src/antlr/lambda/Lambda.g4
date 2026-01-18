grammar Lambda;

// -------------- Parser rules --------------

program
  : term EOF
  ;


term
  : lamExpr
  | letPairExpr
  | letExpr
  | ifExpr
  | caseExpr
  | appExpr
  ;


lamExpr
  : LAMBDA VAR COLON type DOT term
  ;


letExpr
  : LET VAR ASSIGN term IN term
  ;


letPairExpr
  : LET LBRACK VAR COMMA VAR RBRACK ASSIGN term IN term
  ;


ifExpr
  : IF term THEN term ELSE term
  ;


caseExpr
  : CASE term OF INL VAR COLON type FATARROW term BAR INTR VAR COLON type FATARROW term
  ;


appExpr
  : atom+
  ;


atom
  : VAR
  | TRUE
  | FALSE
  | ZERO
  | SUCC atom
  | PRED atom
  | ISZERO atom
  | LPAREN term RPAREN
  | LPAREN term COMMA term RPAREN            // pair (t, u)
  | LANGLE term COMMA term RANGLE            // pair <t, u> or ⟨t, u⟩
  | INL atom AS type                         // inl t as T
  | INTR atom AS type                        // inr t as T
  ;

// -------------- Types --------------

type
  : sumType (ARROW type)?
  ;

sumType
  : prodType (PLUS prodType)*
  ;

prodType
  : atomicType (TIMES atomicType)*
  ;

atomicType
  : TYPEID
  | BOOL
  | NAT
  | predicateType
  | LPAREN type RPAREN
  ;

predicateType
  : TYPEID LPAREN typeList? RPAREN
  ;

typeList
  : type (COMMA type)*
  ;

// -------------- Lexer rules --------------

LET     : 'let';
IN      : 'in';
IF      : 'if';
THEN    : 'then';
ELSE    : 'else';
CASE    : 'case';
OF      : 'of';
INL     : 'inl';
INTR    : 'inr';
AS      : 'as';
BOOL    : 'Bool';
NAT     : 'Nat';
TRUE    : 'true';
FALSE   : 'false';
SUCC    : 'succ';
PRED    : 'pred';
ISZERO  : 'iszero';

LAMBDA  : 'λ' | '\\';
ARROW   : '->' | '→';
FATARROW: '=>' | '⇒';
TIMES   : '*' | '×';
PLUS    : '+' | '⊕';
ASSIGN  : '=';
COLON   : ':';
DOT     : '.';
BAR     : '|';
COMMA   : ',';
LPAREN  : '(';
RPAREN  : ')';
LBRACK  : '[';
RBRACK  : ']';
LANGLE  : '<' | '⟨';
RANGLE  : '>' | '⟩';

TYPEID  : [A-Z] [A-Za-z0-9_]* ;
ZERO    : '0';
VAR     : [a-z_] [A-Za-z0-9_]* ;

WS              : [ \t\r\n\u000C]+ -> skip ;
LINE_COMMENT    : '//' ~[\r\n]* -> skip ;
BLOCK_COMMENT   : '/*' .*? '*/' -> skip ;
