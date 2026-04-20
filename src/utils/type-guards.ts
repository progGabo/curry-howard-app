import { ExprNode, TypeNode } from '../models/lambda-node';
import { FormulaNode, TermNode } from '../models/formula-node';

export function isVar(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Var' }> {
  return expr.kind === 'Var';
}

export function isAbs(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Abs' }> {
  return expr.kind === 'Abs';
}

export function isApp(expr: ExprNode): expr is Extract<ExprNode, { kind: 'App' }> {
  return expr.kind === 'App';
}

export function isPair(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Pair' }> {
  return expr.kind === 'Pair';
}

export function isLetPair(expr: ExprNode): expr is Extract<ExprNode, { kind: 'LetPair' }> {
  return expr.kind === 'LetPair';
}

export function isInl(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Inl' }> {
  return expr.kind === 'Inl';
}

export function isInr(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Inr' }> {
  return expr.kind === 'Inr';
}

export function isCase(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Case' }> {
  return expr.kind === 'Case';
}

export function isLet(expr: ExprNode): expr is Extract<ExprNode, { kind: 'Let' }> {
  return expr.kind === 'Let';
}

export function isTypeVar(type: TypeNode): type is Extract<TypeNode, { kind: 'TypeVar' }> {
  return type.kind === 'TypeVar';
}

export function isFuncType(type: TypeNode): type is Extract<TypeNode, { kind: 'Func' }> {
  return type.kind === 'Func';
}

export function isProdType(type: TypeNode): type is Extract<TypeNode, { kind: 'Prod' }> {
  return type.kind === 'Prod';
}

export function isSumType(type: TypeNode): type is Extract<TypeNode, { kind: 'Sum' }> {
  return type.kind === 'Sum';
}

export function isPredicateType(type: TypeNode): type is Extract<TypeNode, { kind: 'PredicateType' }> {
  return type.kind === 'PredicateType';
}

export function isDependentFuncType(type: TypeNode): type is Extract<TypeNode, { kind: 'DependentFunc' }> {
  return type.kind === 'DependentFunc';
}

export function isDependentProdType(type: TypeNode): type is Extract<TypeNode, { kind: 'DependentProd' }> {
  return type.kind === 'DependentProd';
}

export function isDependentAbs(expr: ExprNode): expr is Extract<ExprNode, { kind: 'DependentAbs' }> {
  return expr.kind === 'DependentAbs';
}

export function isDependentPair(expr: ExprNode): expr is Extract<ExprNode, { kind: 'DependentPair' }> {
  return expr.kind === 'DependentPair';
}

export function isLetDependentPair(expr: ExprNode): expr is Extract<ExprNode, { kind: 'LetDependentPair' }> {
  return expr.kind === 'LetDependentPair';
}

export function isVarFormula(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Var' }> {
  return f.kind === 'Var';
}

export function isImplies(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Implies' }> {
  return f.kind === 'Implies';
}

export function isAnd(f: FormulaNode): f is Extract<FormulaNode, { kind: 'And' }> {
  return f.kind === 'And';
}

export function isOr(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Or' }> {
  return f.kind === 'Or';
}

export function isNot(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Not' }> {
  return f.kind === 'Not';
}

export function isForall(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Forall' }> {
  return f.kind === 'Forall';
}

export function isExists(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Exists' }> {
  return f.kind === 'Exists';
}

export function isPredicate(f: FormulaNode): f is Extract<FormulaNode, { kind: 'Predicate' }> {
  return f.kind === 'Predicate';
}

export function isTrueFormula(f: FormulaNode): f is Extract<FormulaNode, { kind: 'True' }> {
  return f.kind === 'True';
}

export function isFalseFormula(f: FormulaNode): f is Extract<FormulaNode, { kind: 'False' }> {
  return f.kind === 'False';
}

export function isTermVar(term: TermNode): term is Extract<TermNode, { kind: 'TermVar' }> {
  return term.kind === 'TermVar';
}

export function isTermConst(term: TermNode): term is Extract<TermNode, { kind: 'TermConst' }> {
  return term.kind === 'TermConst';
}

export function isTermFunc(term: TermNode): term is Extract<TermNode, { kind: 'TermFunc' }> {
  return term.kind === 'TermFunc';
}

export function hasKind<T extends string>(
  node: { kind: string },
  kind: T
): node is { kind: T } {
  return node.kind === kind;
}

