import { ExprNode, TypeNode } from '../models/lambda-node';
import { FormulaNode, TermNode } from '../models/formula-node';

export class Equality {
  static formulasEqual(a: FormulaNode, b: FormulaNode): boolean {
    a = this.unwrapParen(a);
    b = this.unwrapParen(b);

    if (a.kind !== b.kind) return false;
    
    switch (a.kind) {
      case 'Var':
        return a.name === (b as typeof a).name;
      case 'Implies':
      case 'And':
      case 'Or':
        return this.formulasEqual(a.left, (b as typeof a).left) &&
               this.formulasEqual(a.right, (b as typeof a).right);
      case 'Not':
        return this.formulasEqual(a.inner, (b as typeof a).inner);
      case 'Forall':
      case 'Exists':
        return a.variable === (b as typeof a).variable &&
               this.formulasEqual(a.body, (b as typeof a).body);
      case 'Predicate':
        const bPred = b as typeof a;
        return a.name === bPred.name &&
               a.args.length === bPred.args.length &&
               a.args.every((arg, i) => this.termsEqual(arg, bPred.args[i]));
      case 'True':
      case 'False':
        return true;
      default:
        return false;
    }
  }

  private static unwrapParen(formula: FormulaNode): FormulaNode {
    let current = formula;
    while (current.kind === 'Paren') {
      current = current.inner;
    }
    return current;
  }

  static termsEqual(a: TermNode, b: TermNode): boolean {
    if (a.kind !== b.kind) return false;
    
    switch (a.kind) {
      case 'TermVar':
      case 'TermConst':
        return a.name === (b as typeof a).name;
      case 'TermFunc':
        const bFunc = b as typeof a;
        return a.name === bFunc.name &&
               a.args.length === bFunc.args.length &&
               a.args.every((arg, i) => this.termsEqual(arg, bFunc.args[i]));
    }
  }

  static typesEqual(a: TypeNode, b: TypeNode): boolean {
    if (a.kind !== b.kind) return false;
    
    switch (a.kind) {
      case 'TypeVar':
        return a.name === (b as typeof a).name;
      case 'Func':
        const bFunc = b as typeof a;
        return this.typesEqual(a.from, bFunc.from) && this.typesEqual(a.to, bFunc.to);
      case 'Prod':
      case 'Sum':
        const bProd = b as typeof a;
        return this.typesEqual(a.left, bProd.left) && this.typesEqual(a.right, bProd.right);
      case 'Bool':
      case 'Bottom':
      case 'Nat':
        return true;
      case 'PredicateType':
        const bPred = b as typeof a;
        return a.name === bPred.name &&
               a.argTypes.length === bPred.argTypes.length &&
               a.argTypes.every((t, i) => this.typesEqual(t, bPred.argTypes[i]));
      case 'DependentFunc':
        const bDepFunc = b as typeof a;
        return a.param === bDepFunc.param &&
               this.typesEqual(a.paramType, bDepFunc.paramType) &&
               this.typesEqual(a.bodyType, bDepFunc.bodyType);
      case 'DependentProd':
        const bDepProd = b as typeof a;
        return a.param === bDepProd.param &&
               this.typesEqual(a.paramType, bDepProd.paramType) &&
               this.typesEqual(a.bodyType, bDepProd.bodyType);
      default:
        return false;
    }
  }

  static exprsEqual(a: ExprNode, b: ExprNode): boolean {
    if (a.kind !== b.kind) return false;
    
    switch (a.kind) {
      case 'Var':
        return a.name === (b as typeof a).name;
      case 'Abs':
        const bAbs = b as typeof a;
        return a.param === bAbs.param &&
               this.typesEqual(a.paramType, bAbs.paramType) &&
               this.exprsEqual(a.body, bAbs.body);
      case 'App':
        const bApp = b as typeof a;
        return this.exprsEqual(a.fn, bApp.fn) && this.exprsEqual(a.arg, bApp.arg);
      case 'Pair':
        const bPair = b as typeof a;
        return this.exprsEqual(a.left, bPair.left) && this.exprsEqual(a.right, bPair.right);
      case 'LetPair':
        const bLetPair = b as typeof a;
        return a.x === bLetPair.x && a.y === bLetPair.y &&
               this.exprsEqual(a.pair, bLetPair.pair) &&
               this.exprsEqual(a.inExpr, bLetPair.inExpr);
      case 'Inl':
      case 'Inr':
        const bInl = b as typeof a;
        return this.exprsEqual(a.expr, bInl.expr) &&
               this.typesEqual(a.asType, bInl.asType);
      case 'Case':
        const bCase = b as typeof a;
        return this.exprsEqual(a.expr, bCase.expr) &&
               a.leftVar === bCase.leftVar && a.rightVar === bCase.rightVar &&
               this.typesEqual(a.leftType, bCase.leftType) &&
               this.typesEqual(a.rightType, bCase.rightType) &&
               this.exprsEqual(a.leftBranch, bCase.leftBranch) &&
               this.exprsEqual(a.rightBranch, bCase.rightBranch);
      case 'Let':
        const bLet = b as typeof a;
        return a.name === bLet.name &&
               this.exprsEqual(a.value, bLet.value) &&
               this.exprsEqual(a.inExpr, bLet.inExpr);
      case 'If':
        const bIf = b as typeof a;
        return this.exprsEqual(a.cond, bIf.cond) &&
               this.exprsEqual(a.thenBranch, bIf.thenBranch) &&
               this.exprsEqual(a.elseBranch, bIf.elseBranch);
      case 'True':
      case 'False':
      case 'Zero':
        return true;
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        return this.exprsEqual(a.expr, (b as typeof a).expr);
      case 'DependentAbs':
        const bDepAbs = b as typeof a;
        return a.param === bDepAbs.param &&
               this.typesEqual(a.paramType, bDepAbs.paramType) &&
               this.exprsEqual(a.body, bDepAbs.body);
      case 'DependentPair':
        const bDepPair = b as typeof a;
        return this.exprsEqual(a.witness, bDepPair.witness) &&
               this.typesEqual(a.witnessType, bDepPair.witnessType) &&
               this.exprsEqual(a.proof, bDepPair.proof) &&
               ((a.proofType && bDepPair.proofType)
                 ? this.typesEqual(a.proofType, bDepPair.proofType)
                 : a.proofType === bDepPair.proofType);
      case 'LetDependentPair':
        const bLetDepPair = b as typeof a;
        return a.x === bLetDepPair.x &&
               this.typesEqual(a.xType, bLetDepPair.xType) &&
               a.p === bLetDepPair.p &&
               this.typesEqual(a.pType, bLetDepPair.pType) &&
               this.exprsEqual(a.pair, bLetDepPair.pair) &&
               this.exprsEqual(a.inExpr, bLetDepPair.inExpr);
      default:
        return false;
    }
  }
}

