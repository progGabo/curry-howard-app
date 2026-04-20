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


caseExpr
  : CASE term OF INL VAR COLON type FATARROW term BAR INTR VAR COLON type FATARROW term
  ;


appExpr
  : atom+
  ;


atom
  : VAR
  | LPAREN term RPAREN
  | LPAREN term COMMA term RPAREN           
  | LANGLE term (COLON type)? COMMA term (COLON type)? RANGLE   
  | INL atom AS type                         
  | INTR atom AS type                       
  ;

// -------------- Types --------------

type
  : LPAREN VAR COLON type RPAREN ARROW type   // dependent function type: (x: T) -> P(x)
  | sumType (ARROW type)?
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

CASE    : 'case';
OF      : 'of';
INL     : 'inl';
INTR    : 'inr';
AS      : 'as';


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
VAR     : [a-z_] [A-Za-z0-9_]* ;

WS              : [ \t\r\n\u000C]+ -> skip ;
LINE_COMMENT    : '//' ~[\r\n]* -> skip ;
BLOCK_COMMENT   : '/*' .*? '*/' -> skip ;
