import { Injectable } from '@angular/core';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { FormulaNode, SequentNode } from '../models/formula-node';

@Injectable({ providedIn: 'root' })
export class LambdaToExpressionService {

  /**
   * Convert a lambda term to its logical type (formula).
   * When inferredType is provided, returns the type as formula (e.g. Σ (x : T), Q(x) for ∃x Q(x)).
   * Otherwise returns a term-like string (legacy).
   */
  convertLambdaToExpression(lambdaExpr: ExprNode, inferredType?: TypeNode): string {
    try {
      if (inferredType) {
        return this.convertTypeToLogicalFormula(inferredType);
      }
      return this.convertExprToFormula(lambdaExpr);
    } catch (error) {
      console.error('Error converting lambda to expression:', error);
      throw new Error(`Failed to convert lambda expression: ${error}`);
    }
  }

  /**
   * Convert a type (e.g. from type inference) to a logical formula string.
   * DependentProd → Σ (x : T), Q(x) (existential); DependentFunc → ∀x:T. body.
   */
  convertTypeToLogicalFormula(type: TypeNode): string {
    switch (type.kind) {
      case 'TypeVar':
        return type.name;
      case 'Bool':
        return 'Bool';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const fromF = this.convertTypeToLogicalFormula(type.from);
        const toF = this.convertTypeToLogicalFormula(type.to);
        const fromParens = type.from.kind === 'Func' || type.from.kind === 'Prod' || type.from.kind === 'Sum';
        const toParens = type.to.kind === 'Func' || type.to.kind === 'Prod' || type.to.kind === 'Sum';
        return `${fromParens ? `(${fromF})` : fromF} → ${toParens ? `(${toF})` : toF}`;
      case 'Prod':
        const leftF = this.convertTypeToLogicalFormula(type.left);
        const rightF = this.convertTypeToLogicalFormula(type.right);
        return `${leftF} ∧ ${rightF}`;
      case 'Sum':
        const sumL = this.convertTypeToLogicalFormula(type.left);
        const sumR = this.convertTypeToLogicalFormula(type.right);
        return `${sumL} ∨ ${sumR}`;
      case 'PredicateType':
        const predArgs = type.argTypes.map(t => this.convertTypeToLogicalFormula(t)).join(', ');
        return `${type.name}(${predArgs})`;
      case 'DependentFunc':
        const dfParam = this.convertTypeToLogicalFormula(type.paramType);
        const dfBody = this.convertTypeToLogicalFormula(type.bodyType);
        return `∀${type.param}:${dfParam}. ${dfBody}`;
      case 'DependentProd':
        // ∃x Q(x)
        const dpBody = this.convertTypeToLogicalFormula(type.bodyType);
        return `∃${type.param}. ${dpBody}`;
      default:
        return `[${(type as any).kind}]`;
    }
  }

  private convertExprToFormula(expr: ExprNode): string {
    switch (expr.kind) {
      case 'Var':
        return expr.name;
      
      case 'Abs':
        const paramType = this.convertTypeToFormula(expr.paramType);
        const bodyFormula = this.convertExprToFormula(expr.body);
        return `${paramType} → ${bodyFormula}`;
      
      case 'App':
        const fnFormula = this.convertExprToFormula(expr.fn);
        const argFormula = this.convertExprToFormula(expr.arg);
        const needsParens = expr.fn.kind === 'Abs' || expr.fn.kind === 'DependentAbs' || expr.fn.kind === 'App';
        return needsParens ? `(${fnFormula}) ${argFormula}` : `${fnFormula} ${argFormula}`;
      
      case 'Pair':
        const leftFormula = this.convertExprToFormula(expr.left);
        const rightFormula = this.convertExprToFormula(expr.right);
        return `${leftFormula} ∧ ${rightFormula}`;
      
      case 'Inl':
        const inlFormula = this.convertExprToFormula(expr.expr);
        const inlType = this.convertTypeToFormula(expr.asType);
        return `${inlFormula} ∨ ${inlType}`;
      
      case 'Inr':
        const inrFormula = this.convertExprToFormula(expr.expr);
        const inrType = this.convertTypeToFormula(expr.asType);
        return `${inrType} ∨ ${inrFormula}`;
      
      case 'True':
        return '⊤';
      
      case 'False':
        return '⊥';
      
      case 'Zero':
        return '0';
      
      case 'Succ':
        return `succ(${this.convertExprToFormula(expr.expr)})`;
      
      case 'Pred':
        return `pred(${this.convertExprToFormula(expr.expr)})`;
      
      case 'IsZero':
        return `iszero(${this.convertExprToFormula(expr.expr)})`;
      
      case 'If':
        const condFormula = this.convertExprToFormula(expr.cond);
        const thenFormula = this.convertExprToFormula(expr.thenBranch);
        const elseFormula = this.convertExprToFormula(expr.elseBranch);
        return `if ${condFormula} then ${thenFormula} else ${elseFormula}`;
      
      case 'Case':
        const caseExpr = this.convertExprToFormula(expr.expr);
        const leftCase = this.convertExprToFormula(expr.leftBranch);
        const rightCase = this.convertExprToFormula(expr.rightBranch);
        return `case ${caseExpr} of ${expr.leftVar} → ${leftCase} | ${expr.rightVar} → ${rightCase}`;
      
      case 'Let':
        // Let binding corresponds to assumption introduction
        const letValue = this.convertExprToFormula(expr.value);
        const letBody = this.convertExprToFormula(expr.inExpr);
        return `let ${expr.name} = ${letValue} in ${letBody}`;
      
      case 'LetPair':
        // Let pair corresponds to conjunction elimination
        const pairValue = this.convertExprToFormula(expr.pair);
        const pairBody = this.convertExprToFormula(expr.inExpr);
        return `let [${expr.x}, ${expr.y}] = ${pairValue} in ${pairBody}`;
      
      case 'DependentAbs':
        // ∀x:T. body (predicate logic)
        const depParamType = this.convertTypeToFormula(expr.paramType);
        const depBodyFormula = this.convertExprToFormula(expr.body);
        return `∀${expr.param}:${depParamType}. ${depBodyFormula}`;
      
      case 'DependentPair':
        // ⟨witness, proof⟩ (∃ introduction)
        const witFormula = this.convertExprToFormula(expr.witness);
        const proofFormula = this.convertExprToFormula(expr.proof);
        return `⟨${witFormula}, ${proofFormula}⟩`;
      
      case 'LetDependentPair':
        // let ⟨x, p⟩ = pair in body (∃ elimination)
        const dpPair = this.convertExprToFormula(expr.pair);
        const dpBody = this.convertExprToFormula(expr.inExpr);
        return `let ⟨${expr.x}, ${expr.p}⟩ = ${dpPair} in ${dpBody}`;
      
      default:
        return `[${(expr as any).kind}]`;
    }
  }

  private convertTypeToFormula(type: TypeNode): string {
    switch (type.kind) {
      case 'TypeVar':
        return type.name;
      case 'Bool':
        return 'Bool';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const fromFormula = this.convertTypeToFormula(type.from);
        const toFormula = this.convertTypeToFormula(type.to);
        // Add parentheses for complex types
        const fromNeedsParens = type.from.kind === 'Func' || type.from.kind === 'Prod' || type.from.kind === 'Sum';
        const toNeedsParens = type.to.kind === 'Func' || type.to.kind === 'Prod' || type.to.kind === 'Sum';
        return `${fromNeedsParens ? `(${fromFormula})` : fromFormula} → ${toNeedsParens ? `(${toFormula})` : toFormula}`;
      case 'Prod':
        const leftFormula = this.convertTypeToFormula(type.left);
        const rightFormula = this.convertTypeToFormula(type.right);
        return `${leftFormula} ∧ ${rightFormula}`;
      case 'Sum':
        const sumLeft = this.convertTypeToFormula(type.left);
        const sumRight = this.convertTypeToFormula(type.right);
        return `${sumLeft} ∨ ${sumRight}`;
      case 'PredicateType':
        const predArgs = type.argTypes.map(t => this.convertTypeToFormula(t)).join(', ');
        return `${type.name}(${predArgs})`;
      case 'DependentFunc':
        const dfFrom = this.convertTypeToFormula(type.paramType);
        const dfTo = this.convertTypeToFormula(type.bodyType);
        return `(${type.param}: ${dfFrom}) → ${dfTo}`;
      case 'DependentProd':
        const dpFrom = this.convertTypeToFormula(type.paramType);
        const dpTo = this.convertTypeToFormula(type.bodyType);
        return `∃${type.param}. ${dpTo}`;
      default:
        return `[${(type as any).kind}]`;
    }
  }

  // Helper method to create a sequent from a lambda expression
  createSequentFromLambda(lambdaExpr: ExprNode): SequentNode {
    // This is a simplified implementation
    // In a full implementation, you'd need to analyze the lambda expression
    // and determine what assumptions and conclusions it represents
    
    const formula = this.createFormulaFromLambda(lambdaExpr);
    
    return {
      assumptions: [],
      conclusions: [formula]
    };
  }

  private createFormulaFromLambda(expr: ExprNode): FormulaNode {
    // Curry-Howard: lambda term ↔ proof, type ↔ formula
    switch (expr.kind) {
      case 'Var':
        return { kind: 'Var', name: expr.name };
      case 'Abs':
        return {
          kind: 'Implies',
          left: this.createFormulaFromLambda({ kind: 'Var', name: expr.param } as ExprNode),
          right: this.createFormulaFromLambda(expr.body)
        };
      case 'DependentAbs':
        // ∀x. body (predicate logic)
        return {
          kind: 'Forall',
          variable: expr.param,
          body: this.createFormulaFromLambda(expr.body)
        };
      case 'App':
        return {
          kind: 'Implies',
          left: this.createFormulaFromLambda(expr.fn),
          right: this.createFormulaFromLambda(expr.arg)
        };
      case 'Pair':
        return {
          kind: 'And',
          left: this.createFormulaFromLambda(expr.left),
          right: this.createFormulaFromLambda(expr.right)
        };
      case 'DependentPair':
        // ∃x. (proof type) — proof of existential
        return {
          kind: 'Exists',
          variable: 'x',
          body: this.createFormulaFromLambda(expr.proof)
        };
      case 'LetDependentPair':
        return this.createFormulaFromLambda(expr.inExpr);
      case 'True':
        return { kind: 'True' };
      case 'False':
        return { kind: 'False' };
      default:
        return { kind: 'Var', name: 'Unknown' };
    }
  }
}
