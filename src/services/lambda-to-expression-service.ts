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
    if (type.kind === 'Func' && this.isNegationType(type)) {
      const inner = this.convertTypeToLogicalFormula(type.from);
      const wrappedInner = this.needsParensForNegation(type.from) ? `(${inner})` : inner;
      return `¬${wrappedInner}`;
    }

    switch (type.kind) {
      case 'TypeVar':
        return this.formatTypeVariableName(type.name);
      case 'Bottom':
        return '⊥';
      case 'Func':
        const fromF = this.convertTypeToLogicalFormula(type.from);
        const toF = this.convertTypeToLogicalFormula(type.to);
        const fromParens = this.needsParensForArrowSide(type.from, 'left');
        const toParens = this.needsParensForArrowSide(type.to, 'right');
        return `${fromParens ? `(${fromF})` : fromF} → ${toParens ? `(${toF})` : toF}`;
      case 'Prod':
        const leftF = this.convertTypeToLogicalFormula(type.left);
        const rightF = this.convertTypeToLogicalFormula(type.right);
        const leftFNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const rightFNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${leftFNeedsParens ? `(${leftF})` : leftF} ∧ ${rightFNeedsParens ? `(${rightF})` : rightF}`;
      case 'Sum':
        const sumL = this.convertTypeToLogicalFormula(type.left);
        const sumR = this.convertTypeToLogicalFormula(type.right);
        const sumLNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const sumRNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${sumLNeedsParens ? `(${sumL})` : sumL} ∨ ${sumRNeedsParens ? `(${sumR})` : sumR}`;
      case 'PredicateType':
        const predArgs = type.argTypes.map(t => this.convertTypeToLogicalFormula(t)).join(', ');
        return `${type.name}(${predArgs})`;
      case 'DependentFunc':
        const dfParam = this.convertTypeToLogicalFormula(type.paramType);
        const dfBody = this.convertTypeToLogicalFormula(type.bodyType);
        return `∀${type.param}:${dfParam}. ${dfBody}`;
      case 'DependentProd':
        // ∃x:T. Q(x)
        const dpParamType = this.convertTypeToLogicalFormula(type.paramType);
        const dpBody = this.convertTypeToLogicalFormula(type.bodyType);
        return `∃${type.param}:${dpParamType}. ${dpBody}`;
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

      case 'Fst':
        return `fst(${this.convertExprToFormula(expr.pair)})`;

      case 'Snd':
        return `snd(${this.convertExprToFormula(expr.pair)})`;
      
      case 'Inl':
        const inlFormula = this.convertExprToFormula(expr.expr);
        const inlType = this.convertTypeToFormula(expr.asType);
        return `${inlFormula} ∨ ${inlType}`;
      
      case 'Inr':
        const inrFormula = this.convertExprToFormula(expr.expr);
        const inrType = this.convertTypeToFormula(expr.asType);
        return `${inrType} ∨ ${inrFormula}`;
      
      case 'Case':
        const caseExpr = this.convertExprToFormula(expr.expr);
        const leftCase = this.convertExprToFormula(expr.leftBranch);
        const rightCase = this.convertExprToFormula(expr.rightBranch);
        return `case ${caseExpr} of ${expr.leftVar} → ${leftCase} | ${expr.rightVar} → ${rightCase}`;
      
      case 'Let':
        const letValue = this.convertExprToFormula(expr.value);
        const letBody = this.convertExprToFormula(expr.inExpr);
        return `let ${expr.name} = ${letValue} in ${letBody}`;
      
      case 'LetPair':
        const pairValue = this.convertExprToFormula(expr.pair);
        const pairBody = this.convertExprToFormula(expr.inExpr);
        return `let [${expr.x}, ${expr.y}] = ${pairValue} in ${pairBody}`;
      
      case 'DependentAbs':
        const depParamType = this.convertTypeToFormula(expr.paramType);
        const depBodyFormula = this.convertExprToFormula(expr.body);
        return `∀${expr.param}:${depParamType}. ${depBodyFormula}`;
      
      case 'DependentPair':
        const witFormula = this.convertExprToFormula(expr.witness);
        const proofFormula = this.convertExprToFormula(expr.proof);
        return `⟨${witFormula}, ${proofFormula}⟩`;
      
      case 'LetDependentPair':
        const dpPair = this.convertExprToFormula(expr.pair);
        const dpBody = this.convertExprToFormula(expr.inExpr);
        return `let ⟨${expr.x}, ${expr.p}⟩ = ${dpPair} in ${dpBody}`;
      
      default:
        return `[${(expr as any).kind}]`;
    }
  }

  private convertTypeToFormula(type: TypeNode): string {
    if (type.kind === 'Func' && this.isNegationType(type)) {
      const inner = this.convertTypeToFormula(type.from);
      const wrappedInner = this.needsParensForNegation(type.from) ? `(${inner})` : inner;
      return `¬${wrappedInner}`;
    }

    switch (type.kind) {
      case 'TypeVar':
        return this.formatTypeVariableName(type.name);
      case 'Bottom':
        return '⊥';
      case 'Func':
        const fromFormula = this.convertTypeToFormula(type.from);
        const toFormula = this.convertTypeToFormula(type.to);
        const fromNeedsParens = this.needsParensForArrowSide(type.from, 'left');
        const toNeedsParens = this.needsParensForArrowSide(type.to, 'right');
        return `${fromNeedsParens ? `(${fromFormula})` : fromFormula} → ${toNeedsParens ? `(${toFormula})` : toFormula}`;
      case 'Prod':
        const leftFormula = this.convertTypeToFormula(type.left);
        const rightFormula = this.convertTypeToFormula(type.right);
        const leftFormulaNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const rightFormulaNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${leftFormulaNeedsParens ? `(${leftFormula})` : leftFormula} ∧ ${rightFormulaNeedsParens ? `(${rightFormula})` : rightFormula}`;
      case 'Sum':
        const sumLeft = this.convertTypeToFormula(type.left);
        const sumRight = this.convertTypeToFormula(type.right);
        const sumLeftNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const sumRightNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${sumLeftNeedsParens ? `(${sumLeft})` : sumLeft} ∨ ${sumRightNeedsParens ? `(${sumRight})` : sumRight}`;
      case 'PredicateType':
        const predArgs = type.argTypes.map(t => this.convertTypeToFormula(t)).join(', ');
        return `${type.name}(${predArgs})`;
      case 'DependentFunc':
        const dfFrom = this.convertTypeToFormula(type.paramType);
        const dfTo = this.convertTypeToFormula(type.bodyType);
        return `Π${type.param}:${dfFrom}. ${dfTo}`;
      case 'DependentProd':
        const dpFrom = this.convertTypeToFormula(type.paramType);
        const dpTo = this.convertTypeToFormula(type.bodyType);
        return `Σ${type.param}:${dpFrom}. ${dpTo}`;
      default:
        return `[${(type as any).kind}]`;
    }
  }

  private isNegationType(type: TypeNode): boolean {
    return type.kind === 'Func' && type.to.kind === 'Bottom';
  }

  private needsParensForNegation(type: TypeNode): boolean {
    return type.kind === 'Func' || type.kind === 'Prod' || type.kind === 'Sum' || type.kind === 'DependentFunc' || type.kind === 'DependentProd';
  }

  private needsParensForArrowSide(type: TypeNode, side: 'left' | 'right'): boolean {
    if (this.isNegationType(type)) return false;
    if (type.kind === 'Prod' || type.kind === 'Sum') return true;
    if (type.kind === 'DependentFunc' || type.kind === 'DependentProd') return true;
    if (type.kind === 'Func') return side === 'left' || side === 'right';
    return false;
  }

  private needsParensForProductOrSumOperand(type: TypeNode): boolean {
    return type.kind === 'Func' || type.kind === 'DependentFunc' || type.kind === 'DependentProd';
  }

  private formatTypeVariableName(name: string): string {
    const polyIndex = this.tryParsePolyIndex(name);
    if (polyIndex === null) {
      return name;
    }

    return this.polyIndexToGreek(polyIndex);
  }

  private tryParsePolyIndex(name: string): number | null {
    const match = /^__poly(\d+)$/.exec(name);
    if (!match) {
      return null;
    }
    const parsed = Number.parseInt(match[1], 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private polyIndexToGreek(index: number): string {
    const greek = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];
    const base = greek[(index - 1) % greek.length];
    const cycle = Math.floor((index - 1) / greek.length);
    return cycle === 0 ? base : `${base}${cycle + 1}`;
  }

  createSequentFromLambda(lambdaExpr: ExprNode): SequentNode {
    const formula = this.createFormulaFromLambda(lambdaExpr);
    
    return {
      assumptions: [],
      conclusions: [formula]
    };
  }

  private createFormulaFromLambda(expr: ExprNode): FormulaNode {
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
      case 'Fst':
      case 'Snd':
        return this.createFormulaFromLambda(expr.pair);
      case 'DependentPair':
        return {
          kind: 'Exists',
          variable: 'x',
          body: this.createFormulaFromLambda(expr.proof)
        };
      case 'LetDependentPair':
        return this.createFormulaFromLambda(expr.inExpr);
      default:
        return { kind: 'Var', name: 'Unknown' };
    }
  }
}
