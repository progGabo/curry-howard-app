import { ExprNode, TypeNode, Span } from '../models/lambda-node';
import { FormulaNode, TermNode } from '../models/formula-node';

// Lambda Expression Factories
export const ExprFactories = {
  var: (name: string, span?: Span): ExprNode => ({ kind: 'Var', name, span }),
  
  abs: (param: string, paramType: TypeNode, body: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Abs', param, paramType, body, span }),
  
  app: (fn: ExprNode, arg: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'App', fn, arg, span }),
  
  pair: (left: ExprNode, right: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Pair', left, right, span }),
  
  letPair: (x: string, y: string, pair: ExprNode, inExpr: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'LetPair', x, y, pair, inExpr, span }),
  
  inl: (expr: ExprNode, asType: TypeNode, span?: Span): ExprNode => 
    ({ kind: 'Inl', expr, asType, span }),
  
  inr: (expr: ExprNode, asType: TypeNode, span?: Span): ExprNode => 
    ({ kind: 'Inr', expr, asType, span }),
  
  // Dependent types for quantifiers
  dependentAbs: (param: string, paramType: TypeNode, body: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'DependentAbs', param, paramType, body, span }),
  
  dependentPair: (witness: ExprNode, witnessType: TypeNode, proof: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'DependentPair', witness, witnessType, proof, span }),
  
  letDependentPair: (x: string, xType: TypeNode, p: string, pType: TypeNode, pair: ExprNode, inExpr: ExprNode, span?: Span): ExprNode =>
    ({ kind: 'LetDependentPair', x, xType, p, pType, pair, inExpr, span }),
  
  case: (
    expr: ExprNode,
    leftVar: string, leftType: TypeNode, leftBranch: ExprNode,
    rightVar: string, rightType: TypeNode, rightBranch: ExprNode,
    span?: Span
  ): ExprNode => ({
    kind: 'Case',
    expr, leftVar, leftType, leftBranch, rightVar, rightType, rightBranch, span
  }),
  
  let: (name: string, value: ExprNode, inExpr: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'Let', name, value, inExpr, span }),
  
  if: (cond: ExprNode, thenBranch: ExprNode, elseBranch: ExprNode, span?: Span): ExprNode => 
    ({ kind: 'If', cond, thenBranch, elseBranch, span }),
  
  true: (span?: Span): ExprNode => ({ kind: 'True', span }),
  false: (span?: Span): ExprNode => ({ kind: 'False', span }),
  zero: (span?: Span): ExprNode => ({ kind: 'Zero', span }),
  
  succ: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'Succ', expr, span }),
  pred: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'Pred', expr, span }),
  isZero: (expr: ExprNode, span?: Span): ExprNode => ({ kind: 'IsZero', expr, span }),
};

// Type Factories
export const TypeFactories = {
  typeVar: (name: string): TypeNode => ({ kind: 'TypeVar', name }),
  bool: (): TypeNode => ({ kind: 'Bool' }),
  nat: (): TypeNode => ({ kind: 'Nat' }),
  func: (from: TypeNode, to: TypeNode): TypeNode => ({ kind: 'Func', from, to }),
  prod: (left: TypeNode, right: TypeNode): TypeNode => ({ kind: 'Prod', left, right }),
  sum: (left: TypeNode, right: TypeNode): TypeNode => ({ kind: 'Sum', left, right }),
  predicate: (name: string, argTypes: TypeNode[]): TypeNode => 
    ({ kind: 'PredicateType', name, argTypes }),
  dependentFunc: (param: string, paramType: TypeNode, bodyType: TypeNode): TypeNode =>
    ({ kind: 'DependentFunc', param, paramType, bodyType }),
  dependentProd: (param: string, paramType: TypeNode, bodyType: TypeNode): TypeNode =>
    ({ kind: 'DependentProd', param, paramType, bodyType }),
};

// Formula Factories
export const FormulaFactories = {
  var: (name: string): FormulaNode => ({ kind: 'Var', name }),
  implies: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'Implies', left, right }),
  and: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'And', left, right }),
  or: (left: FormulaNode, right: FormulaNode): FormulaNode => 
    ({ kind: 'Or', left, right }),
  not: (inner: FormulaNode): FormulaNode => ({ kind: 'Not', inner }),
  forall: (variable: string, body: FormulaNode): FormulaNode => 
    ({ kind: 'Forall', variable, body }),
  exists: (variable: string, body: FormulaNode): FormulaNode => 
    ({ kind: 'Exists', variable, body }),
  predicate: (name: string, args: TermNode[]): FormulaNode => 
    ({ kind: 'Predicate', name, args }),
  true: (): FormulaNode => ({ kind: 'True' }),
  false: (): FormulaNode => ({ kind: 'False' }),
};

// Term Factories
export const TermFactories = {
  var: (name: string): TermNode => ({ kind: 'TermVar', name }),
  const: (name: string): TermNode => ({ kind: 'TermConst', name }),
  func: (name: string, args: TermNode[]): TermNode => ({ kind: 'TermFunc', name, args }),
};

