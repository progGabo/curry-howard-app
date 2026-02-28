import { ExprNode, TypeNode, Span } from '../models/lambda-node';
import { FormulaNode, TermNode } from '../models/formula-node';

function assertIdentifier(value: string, label: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`${label} cannot be empty`);
  }
  return value;
}

export interface DependentPairFactoryOptions {
  witness: ExprNode;
  witnessType: TypeNode;
  proof: ExprNode;
  proofType?: TypeNode;
  span?: Span;
}

export interface LetDependentPairFactoryOptions {
  x: string;
  xType: TypeNode;
  p: string;
  pType: TypeNode;
  pair: ExprNode;
  inExpr: ExprNode;
  span?: Span;
}

export interface CaseFactoryOptions {
  expr: ExprNode;
  leftVar: string;
  leftType: TypeNode;
  leftBranch: ExprNode;
  rightVar: string;
  rightType: TypeNode;
  rightBranch: ExprNode;
  span?: Span;
}

// Lambda Expression Factories
export const ExprFactories = {
  var: (name: string, span?: Span): ExprNode => ({ kind: 'Var', name: assertIdentifier(name, 'Variable name'), span }),
  
  abs: (param: string, paramType: TypeNode, body: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Abs', param: assertIdentifier(param, 'Lambda parameter'), paramType, body, span }),
  
  app: (fn: ExprNode, arg: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'App', fn, arg, span }),
  
  pair: (left: ExprNode, right: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Pair', left, right, span }),

  fst: (pair: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'Fst', pair, span }),

  snd: (pair: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'Snd', pair, span }),
  
  letPair: (x: string, y: string, pair: ExprNode, inExpr: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'LetPair', x: assertIdentifier(x, 'LetPair left binder'), y: assertIdentifier(y, 'LetPair right binder'), pair, inExpr, span }),
  
  inl: (expr: ExprNode, asType: TypeNode, span?: Span): ExprNode => 
    ({ kind: 'Inl', expr, asType, span }),
  
  inr: (expr: ExprNode, asType: TypeNode, span?: Span): ExprNode => 
    ({ kind: 'Inr', expr, asType, span }),
  
  // Dependent types for quantifiers
  dependentAbs: (param: string, paramType: TypeNode, body: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'DependentAbs', param: assertIdentifier(param, 'Dependent lambda parameter'), paramType, body, span }),
  
  dependentPair: (witness: ExprNode, witnessType: TypeNode, proof: ExprNode, span?: Span, proofType?: TypeNode): ExprNode =>
    ({ kind: 'DependentPair', witness, witnessType, proof, span, proofType }),

  dependentPairWith: (options: DependentPairFactoryOptions): ExprNode =>
    ({
      kind: 'DependentPair',
      witness: options.witness,
      witnessType: options.witnessType,
      proof: options.proof,
      proofType: options.proofType,
      span: options.span
    }),
  
  letDependentPair: (x: string, xType: TypeNode, p: string, pType: TypeNode, pair: ExprNode, inExpr: ExprNode, span?: Span): ExprNode =>
    ({
      kind: 'LetDependentPair',
      x: assertIdentifier(x, 'LetDependentPair witness binder'),
      xType,
      p: assertIdentifier(p, 'LetDependentPair proof binder'),
      pType,
      pair,
      inExpr,
      span
    }),

  letDependentPairWith: (options: LetDependentPairFactoryOptions): ExprNode =>
    ({
      kind: 'LetDependentPair',
      x: assertIdentifier(options.x, 'LetDependentPair witness binder'),
      xType: options.xType,
      p: assertIdentifier(options.p, 'LetDependentPair proof binder'),
      pType: options.pType,
      pair: options.pair,
      inExpr: options.inExpr,
      span: options.span
    }),
  
  case: (
    expr: ExprNode,
    leftVar: string, leftType: TypeNode, leftBranch: ExprNode,
    rightVar: string, rightType: TypeNode, rightBranch: ExprNode,
    span?: Span
  ): ExprNode => ({
    kind: 'Case',
    expr,
    leftVar: assertIdentifier(leftVar, 'Case left binder'),
    leftType,
    leftBranch,
    rightVar: assertIdentifier(rightVar, 'Case right binder'),
    rightType,
    rightBranch,
    span
  }),

  caseWith: (options: CaseFactoryOptions): ExprNode => ({
    kind: 'Case',
    expr: options.expr,
    leftVar: assertIdentifier(options.leftVar, 'Case left binder'),
    leftType: options.leftType,
    leftBranch: options.leftBranch,
    rightVar: assertIdentifier(options.rightVar, 'Case right binder'),
    rightType: options.rightType,
    rightBranch: options.rightBranch,
    span: options.span
  }),
  
  let: (name: string, value: ExprNode, inExpr: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Let', name: assertIdentifier(name, 'Let binder'), value, inExpr, span }),
  
  if: (cond: ExprNode, thenBranch: ExprNode, elseBranch: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'If', cond, thenBranch, elseBranch, span }),
  
  true: (span?: Span): ExprNode => ({ kind: 'True', span }),
  false: (span?: Span): ExprNode => ({ kind: 'False', span }),
  zero: (span?: Span): ExprNode => ({ kind: 'Zero', span }),
  
  succ: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'Succ', expr, span }),
  pred: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'Pred', expr, span }),
  isZero: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'IsZero', expr, span }),

  abort: (expr: ExprNode, targetType: TypeNode, span?: Span): ExprNode =>
    ({ kind: 'Abort', expr, targetType, span }),
};

// Type Factories
export const TypeFactories = {
  typeVar: (name: string): TypeNode => ({ kind: 'TypeVar', name: assertIdentifier(name, 'Type variable name') }),
  bool: (): TypeNode => ({ kind: 'Bool' }),
  bottom: (): TypeNode => ({ kind: 'Bottom' }),
  nat: (): TypeNode => ({ kind: 'Nat' }),
  func: (from: TypeNode, to: TypeNode): TypeNode => ({ kind: 'Func', from, to }),
  prod: (left: TypeNode, right: TypeNode): TypeNode => ({ kind: 'Prod', left, right }),
  sum: (left: TypeNode, right: TypeNode): TypeNode => ({ kind: 'Sum', left, right }),
  predicate: (name: string, argTypes: TypeNode[]): TypeNode => 
    ({ kind: 'PredicateType', name: assertIdentifier(name, 'Predicate type name'), argTypes }),
  dependentFunc: (param: string, paramType: TypeNode, bodyType: TypeNode): TypeNode =>
    ({ kind: 'DependentFunc', param: assertIdentifier(param, 'Dependent function binder'), paramType, bodyType }),
  dependentProd: (param: string, paramType: TypeNode, bodyType: TypeNode): TypeNode =>
    ({ kind: 'DependentProd', param: assertIdentifier(param, 'Dependent product binder'), paramType, bodyType }),
};

// Formula Factories
export const FormulaFactories = {
  var: (name: string): FormulaNode => ({ kind: 'Var', name: assertIdentifier(name, 'Formula variable name') }),
  implies: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'Implies', left, right }),
  and: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'And', left, right }),
  or: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'Or', left, right }),
  not: (inner: FormulaNode): FormulaNode => ({ kind: 'Not', inner }),
  forall: (variable: string, body: FormulaNode): FormulaNode => 
    ({ kind: 'Forall', variable: assertIdentifier(variable, 'Forall binder'), body }),
  exists: (variable: string, body: FormulaNode): FormulaNode => 
    ({ kind: 'Exists', variable: assertIdentifier(variable, 'Exists binder'), body }),
  predicate: (name: string, args: TermNode[]): FormulaNode => 
    ({ kind: 'Predicate', name: assertIdentifier(name, 'Predicate name'), args }),
  true: (): FormulaNode => ({ kind: 'True' }),
  false: (): FormulaNode => ({ kind: 'False' }),
};

// Term Factories
export const TermFactories = {
  var: (name: string): TermNode => ({ kind: 'TermVar', name: assertIdentifier(name, 'Term variable name') }),
  const: (name: string): TermNode => ({ kind: 'TermConst', name: assertIdentifier(name, 'Term constant name') }),
  func: (name: string, args: TermNode[]): TermNode => ({ kind: 'TermFunc', name: assertIdentifier(name, 'Term function name'), args }),
};

