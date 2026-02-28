grammar Lambda;

// -------------- Parser rules --------------

program
  : term EOF
  ;


term
  : lamExpr
  | letDependentPairExpr
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

letDependentPairExpr
  : LET LANGLE VAR (COLON type)? COMMA VAR (COLON type)? RANGLE ASSIGN term IN term
  | LET LPAREN VAR (COLON type)? COMMA VAR (COLON type)? RPAREN ASSIGN term IN term
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
  | LPAREN term COMMA term RPAREN           
  | LANGLE term (COLON type)? COMMA term (COLON type)? RANGLE   
  | INL atom AS type                         
  | INTR atom AS type                       
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
  | VAR
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
