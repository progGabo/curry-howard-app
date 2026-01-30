import { ExprNode } from '../models/lambda-node';
import { FormulaNode } from '../models/formula-node';

// Tree traversal utilities
export class TreeUtils {
  // Map over all nodes in a tree
  static mapExpr(
    expr: ExprNode,
    fn: (node: ExprNode) => ExprNode
  ): ExprNode {
    const mapped = fn(expr);
    switch (mapped.kind) {
      case 'Abs':
        return { ...mapped, body: this.mapExpr(mapped.body, fn) };
      case 'App':
        return { ...mapped, fn: this.mapExpr(mapped.fn, fn), arg: this.mapExpr(mapped.arg, fn) };
      case 'Pair':
        return { ...mapped, left: this.mapExpr(mapped.left, fn), right: this.mapExpr(mapped.right, fn) };
      case 'LetPair':
        return { ...mapped, pair: this.mapExpr(mapped.pair, fn), inExpr: this.mapExpr(mapped.inExpr, fn) };
      case 'Inl':
      case 'Inr':
        return { ...mapped, expr: this.mapExpr(mapped.expr, fn) };
      case 'Case':
        return {
          ...mapped,
          expr: this.mapExpr(mapped.expr, fn),
          leftBranch: this.mapExpr(mapped.leftBranch, fn),
          rightBranch: this.mapExpr(mapped.rightBranch, fn)
        };
      case 'Let':
        return { ...mapped, value: this.mapExpr(mapped.value, fn), inExpr: this.mapExpr(mapped.inExpr, fn) };
      case 'If':
        return {
          ...mapped,
          cond: this.mapExpr(mapped.cond, fn),
          thenBranch: this.mapExpr(mapped.thenBranch, fn),
          elseBranch: this.mapExpr(mapped.elseBranch, fn)
        };
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        return { ...mapped, expr: this.mapExpr(mapped.expr, fn) };
      default:
        return mapped;
    }
  }

  // Find all nodes matching a predicate
  static findExpr(
    expr: ExprNode,
    predicate: (node: ExprNode) => boolean
  ): ExprNode | null {
    if (predicate(expr)) return expr;
    
    switch (expr.kind) {
      case 'Abs':
        return this.findExpr(expr.body, predicate);
      case 'App':
        return this.findExpr(expr.fn, predicate) || this.findExpr(expr.arg, predicate);
      case 'Pair':
        return this.findExpr(expr.left, predicate) || this.findExpr(expr.right, predicate);
      case 'LetPair':
        return this.findExpr(expr.pair, predicate) || this.findExpr(expr.inExpr, predicate);
      case 'Inl':
      case 'Inr':
        return this.findExpr(expr.expr, predicate);
      case 'Case':
        return this.findExpr(expr.expr, predicate) ||
               this.findExpr(expr.leftBranch, predicate) ||
               this.findExpr(expr.rightBranch, predicate);
      case 'Let':
        return this.findExpr(expr.value, predicate) || this.findExpr(expr.inExpr, predicate);
      case 'If':
        return this.findExpr(expr.cond, predicate) ||
               this.findExpr(expr.thenBranch, predicate) ||
               this.findExpr(expr.elseBranch, predicate);
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        return this.findExpr(expr.expr, predicate);
      default:
        return null;
    }
  }

  // Count nodes
  static countNodes(expr: ExprNode): number {
    let count = 1;
    switch (expr.kind) {
      case 'Abs':
        count += this.countNodes(expr.body);
        break;
      case 'App':
        count += this.countNodes(expr.fn) + this.countNodes(expr.arg);
        break;
      case 'Pair':
        count += this.countNodes(expr.left) + this.countNodes(expr.right);
        break;
      case 'LetPair':
        count += this.countNodes(expr.pair) + this.countNodes(expr.inExpr);
        break;
      case 'Inl':
      case 'Inr':
        count += this.countNodes(expr.expr);
        break;
      case 'Case':
        count += this.countNodes(expr.expr) +
                 this.countNodes(expr.leftBranch) +
                 this.countNodes(expr.rightBranch);
        break;
      case 'Let':
        count += this.countNodes(expr.value) + this.countNodes(expr.inExpr);
        break;
      case 'If':
        count += this.countNodes(expr.cond) +
                 this.countNodes(expr.thenBranch) +
                 this.countNodes(expr.elseBranch);
        break;
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        count += this.countNodes(expr.expr);
        break;
    }
    return count;
  }

  // Get all free variables (covers all ExprNode kinds including DependentAbs, DependentPair, LetDependentPair)
  static getFreeVars(expr: ExprNode, bound: Set<string> = new Set()): Set<string> {
    switch (expr.kind) {
      case 'Var':
        return bound.has(expr.name) ? new Set() : new Set([expr.name]);
      case 'Abs':
        return this.getFreeVars(expr.body, new Set([...bound, expr.param]));
      case 'DependentAbs':
        return this.getFreeVars(expr.body, new Set([...bound, expr.param]));
      case 'App':
        return new Set([
          ...this.getFreeVars(expr.fn, bound),
          ...this.getFreeVars(expr.arg, bound)
        ]);
      case 'Pair':
        return new Set([
          ...this.getFreeVars(expr.left, bound),
          ...this.getFreeVars(expr.right, bound)
        ]);
      case 'LetPair':
        return new Set([
          ...this.getFreeVars(expr.pair, bound),
          ...this.getFreeVars(expr.inExpr, new Set([...bound, expr.x, expr.y]))
        ]);
      case 'DependentPair':
        return new Set([
          ...this.getFreeVars(expr.witness, bound),
          ...this.getFreeVars(expr.proof, bound)
        ]);
      case 'LetDependentPair':
        return new Set([
          ...this.getFreeVars(expr.pair, bound),
          ...this.getFreeVars(expr.inExpr, new Set([...bound, expr.x, expr.p]))
        ]);
      case 'Inl':
      case 'Inr':
        return this.getFreeVars(expr.expr, bound);
      case 'Case':
        return new Set([
          ...this.getFreeVars(expr.expr, bound),
          ...this.getFreeVars(expr.leftBranch, new Set([...bound, expr.leftVar])),
          ...this.getFreeVars(expr.rightBranch, new Set([...bound, expr.rightVar]))
        ]);
      case 'Let':
        return new Set([
          ...this.getFreeVars(expr.value, bound),
          ...this.getFreeVars(expr.inExpr, new Set([...bound, expr.name]))
        ]);
      case 'If':
        return new Set([
          ...this.getFreeVars(expr.cond, bound),
          ...this.getFreeVars(expr.thenBranch, bound),
          ...this.getFreeVars(expr.elseBranch, bound)
        ]);
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        return this.getFreeVars(expr.expr, bound);
      case 'True':
      case 'False':
      case 'Zero':
        return new Set();
      default:
        return new Set();
    }
  }

  // Map over all formulas in a tree
  static mapFormula(
    formula: FormulaNode,
    fn: (node: FormulaNode) => FormulaNode
  ): FormulaNode {
    const mapped = fn(formula);
    switch (mapped.kind) {
      case 'Implies':
      case 'And':
      case 'Or':
        return {
          ...mapped,
          left: this.mapFormula(mapped.left, fn),
          right: this.mapFormula(mapped.right, fn)
        };
      case 'Not':
        return { ...mapped, inner: this.mapFormula(mapped.inner, fn) };
      case 'Forall':
      case 'Exists':
        return { ...mapped, body: this.mapFormula(mapped.body, fn) };
      case 'Predicate':
        // Predicates don't contain formulas, just terms
        return mapped;
      default:
        return mapped;
    }
  }
}

