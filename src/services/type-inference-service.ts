import { Injectable } from '@angular/core';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { FormulaNode } from '../models/formula-node';

// Type inference tree node
export interface TypeInferenceNode {
  id?: string;
  rule: string;
  expression: ExprNode;
  inferredType: TypeNode;
  assumptions: Map<string, TypeNode>;
  children: TypeInferenceNode[];
  ui?: {
    selected: boolean;
    expanded: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class TypeInferenceService {

  buildTypeInferenceTree(lambdaExpr: ExprNode): TypeInferenceNode {
    const assumptions = new Map<string, TypeNode>();
    return this.inferType(lambdaExpr, assumptions);
  }

  private inferType(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    switch (expr.kind) {
      case 'Var':
        return this.inferVar(expr, assumptions);
      
      case 'Abs':
        return this.inferAbs(expr, assumptions);
      
      case 'App':
        return this.inferApp(expr, assumptions);
      
      case 'Pair':
        return this.inferPair(expr, assumptions);
      
      case 'Inl':
        return this.inferInl(expr, assumptions);
      
      case 'Inr':
        return this.inferInr(expr, assumptions);
      
      case 'Case':
        return this.inferCase(expr, assumptions);
      
      case 'Let':
        return this.inferLet(expr, assumptions);
      
      case 'LetPair':
        return this.inferLetPair(expr, assumptions);
      
      case 'If':
        return this.inferIf(expr, assumptions);
      
      case 'True':
      case 'False':
        return this.inferBool(expr);
      
      case 'Zero':
        return this.inferZero(expr);
      
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        return this.inferNatOp(expr, assumptions);
      
      default:
        throw new Error(`Unsupported expression kind: ${(expr as any).kind}`);
    }
  }

  private inferVar(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Var') throw new Error('Expected Var expression');
    
    const varType = assumptions.get(expr.name);
    if (!varType) {
      throw new Error(`Unbound variable: ${expr.name}`);
    }

    return {
      rule: 'Var',
      expression: expr,
      inferredType: varType,
      assumptions: new Map(assumptions),
      children: []
    };
  }

  private inferAbs(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Abs') throw new Error('Expected Abs expression');
    
    // Add parameter type to assumptions
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.param, expr.paramType);
    
    // Infer type of body
    const bodyInference = this.inferType(expr.body, newAssumptions);
    
    // Result type is paramType -> bodyType
    const resultType: TypeNode = {
      kind: 'Func',
      from: expr.paramType,
      to: bodyInference.inferredType
    };

    return {
      rule: 'Abs',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [bodyInference]
    };
  }

  private inferApp(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'App') throw new Error('Expected App expression');
    
    // Infer types of function and argument
    const fnInference = this.inferType(expr.fn, assumptions);
    const argInference = this.inferType(expr.arg, assumptions);
    
    // Check that function type is compatible
    if (fnInference.inferredType.kind !== 'Func') {
      throw new Error('Application of non-function type');
    }
    
    if (!this.typesEqual(fnInference.inferredType.from, argInference.inferredType)) {
      throw new Error('Type mismatch in application');
    }

    return {
      rule: 'App',
      expression: expr,
      inferredType: fnInference.inferredType.to,
      assumptions: new Map(assumptions),
      children: [fnInference, argInference]
    };
  }

  private inferPair(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Pair') throw new Error('Expected Pair expression');
    
    const leftInference = this.inferType(expr.left, assumptions);
    const rightInference = this.inferType(expr.right, assumptions);
    
    const resultType: TypeNode = {
      kind: 'Prod',
      left: leftInference.inferredType,
      right: rightInference.inferredType
    };

    return {
      rule: 'Pair',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [leftInference, rightInference]
    };
  }

  private inferInl(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Inl') throw new Error('Expected Inl expression');
    
    const innerInference = this.inferType(expr.expr, assumptions);
    
    // The result type is the sum type specified in the expression
    const resultType = expr.asType;

    return {
      rule: 'Inl',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [innerInference]
    };
  }

  private inferInr(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Inr') throw new Error('Expected Inr expression');
    
    const innerInference = this.inferType(expr.expr, assumptions);
    
    // The result type is the sum type specified in the expression
    const resultType = expr.asType;

    return {
      rule: 'Inr',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [innerInference]
    };
  }

  private inferCase(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Case') throw new Error('Expected Case expression');
    
    const exprInference = this.inferType(expr.expr, assumptions);
    
    // Infer types of both branches
    const leftAssumptions = new Map(assumptions);
    leftAssumptions.set(expr.leftVar, expr.leftType);
    const leftInference = this.inferType(expr.leftBranch, leftAssumptions);
    
    const rightAssumptions = new Map(assumptions);
    rightAssumptions.set(expr.rightVar, expr.rightType);
    const rightInference = this.inferType(expr.rightBranch, rightAssumptions);
    
    // Both branches must have the same type
    if (!this.typesEqual(leftInference.inferredType, rightInference.inferredType)) {
      throw new Error('Case branches must have the same type');
    }

    return {
      rule: 'Case',
      expression: expr,
      inferredType: leftInference.inferredType,
      assumptions: new Map(assumptions),
      children: [exprInference, leftInference, rightInference]
    };
  }

  private inferLet(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Let') throw new Error('Expected Let expression');
    
    const valueInference = this.inferType(expr.value, assumptions);
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.name, valueInference.inferredType);
    const bodyInference = this.inferType(expr.inExpr, newAssumptions);

    return {
      rule: 'Let',
      expression: expr,
      inferredType: bodyInference.inferredType,
      assumptions: new Map(assumptions),
      children: [valueInference, bodyInference]
    };
  }

  private inferLetPair(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'LetPair') throw new Error('Expected LetPair expression');
    
    const pairInference = this.inferType(expr.pair, assumptions);
    
    if (pairInference.inferredType.kind !== 'Prod') {
      throw new Error('LetPair requires a product type');
    }
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.x, pairInference.inferredType.left);
    newAssumptions.set(expr.y, pairInference.inferredType.right);
    const bodyInference = this.inferType(expr.inExpr, newAssumptions);

    return {
      rule: 'LetPair',
      expression: expr,
      inferredType: bodyInference.inferredType,
      assumptions: new Map(assumptions),
      children: [pairInference, bodyInference]
    };
  }

  private inferIf(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'If') throw new Error('Expected If expression');
    
    const condInference = this.inferType(expr.cond, assumptions);
    const thenInference = this.inferType(expr.thenBranch, assumptions);
    const elseInference = this.inferType(expr.elseBranch, assumptions);
    
    if (condInference.inferredType.kind !== 'Bool') {
      throw new Error('If condition must be boolean');
    }
    
    if (!this.typesEqual(thenInference.inferredType, elseInference.inferredType)) {
      throw new Error('If branches must have the same type');
    }

    return {
      rule: 'If',
      expression: expr,
      inferredType: thenInference.inferredType,
      assumptions: new Map(assumptions),
      children: [condInference, thenInference, elseInference]
    };
  }

  private inferBool(expr: ExprNode): TypeInferenceNode {
    return {
      rule: expr.kind,
      expression: expr,
      inferredType: { kind: 'Bool' },
      assumptions: new Map(),
      children: []
    };
  }

  private inferZero(expr: ExprNode): TypeInferenceNode {
    return {
      rule: 'Zero',
      expression: expr,
      inferredType: { kind: 'Nat' },
      assumptions: new Map(),
      children: []
    };
  }

  private inferNatOp(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Succ' && expr.kind !== 'Pred' && expr.kind !== 'IsZero') {
      throw new Error('Expected Succ, Pred, or IsZero expression');
    }
    
    const innerInference = this.inferType(expr.expr, assumptions);
    
    if (innerInference.inferredType.kind !== 'Nat') {
      throw new Error(`${expr.kind} requires natural number`);
    }
    
    let resultType: TypeNode;
    if (expr.kind === 'IsZero') {
      resultType = { kind: 'Bool' };
    } else {
      resultType = { kind: 'Nat' };
    }

    return {
      rule: expr.kind,
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [innerInference]
    };
  }

  private typesEqual(t1: TypeNode, t2: TypeNode): boolean {
    if (t1.kind !== t2.kind) return false;
    
    switch (t1.kind) {
      case 'TypeVar':
        return t1.name === (t2 as any).name;
      case 'Bool':
      case 'Nat':
        return true;
      case 'Func':
        return this.typesEqual(t1.from, (t2 as any).from) && 
               this.typesEqual(t1.to, (t2 as any).to);
      case 'Prod':
        return this.typesEqual(t1.left, (t2 as any).left) && 
               this.typesEqual(t1.right, (t2 as any).right);
      case 'Sum':
        return this.typesEqual(t1.left, (t2 as any).left) && 
               this.typesEqual(t1.right, (t2 as any).right);
      default:
        return false;
    }
  }

  formatType(type: TypeNode): string {
    switch (type.kind) {
      case 'TypeVar':
        return type.name;
      case 'Bool':
        return 'Bool';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const fromStr = this.formatType(type.from);
        const toStr = this.formatType(type.to);
        const fromNeedsParens = type.from.kind === 'Func' || type.from.kind === 'Prod' || type.from.kind === 'Sum';
        const toNeedsParens = type.to.kind === 'Func' || type.to.kind === 'Prod' || type.to.kind === 'Sum';
        return `${fromNeedsParens ? `(${fromStr})` : fromStr} → ${toNeedsParens ? `(${toStr})` : toStr}`;
      case 'Prod':
        const leftStr = this.formatType(type.left);
        const rightStr = this.formatType(type.right);
        return `${leftStr} × ${rightStr}`;
      case 'Sum':
        const sumLeftStr = this.formatType(type.left);
        const sumRightStr = this.formatType(type.right);
        return `${sumLeftStr} + ${sumRightStr}`;
      case 'PredicateType':
        const args = type.argTypes.map(arg => this.formatType(arg)).join(', ');
        return `${type.name}(${args})`;
      default:
        return `[${(type as any).kind}]`;
    }
  }

  buildInteractiveRoot(lambdaExpr: ExprNode): TypeInferenceNode {
    const assumptions = new Map<string, TypeNode>();
    
    let baseType: TypeNode;
    try {
      if (lambdaExpr.kind === 'Abs') {
        baseType = { kind: 'Func', from: lambdaExpr.paramType, to: { kind: 'TypeVar', name: '?' } };
      } else {
        baseType = { kind: 'TypeVar', name: '?' };
      }
    } catch {
      baseType = { kind: 'TypeVar', name: '?' };
    }
    
    return {
      rule: '∅',
      expression: lambdaExpr,
      inferredType: baseType,
      assumptions: assumptions,
      children: []
    };
  }

  applyRuleManually(expr: ExprNode, assumptions: Map<string, TypeNode>, rule: string): TypeInferenceNode | null {
    try {
      if (rule === 'Var' && expr.kind === 'Var') {
        return this.inferVarInteractive(expr, assumptions);
      }
      if (rule === 'Abs' && expr.kind === 'Abs') {
        return this.inferAbsInteractive(expr, assumptions);
      }
      if (rule === 'App' && expr.kind === 'App') {
        return this.inferAppInteractive(expr, assumptions);
      }
      if (rule === 'Pair' && expr.kind === 'Pair') {
        return this.inferPairInteractive(expr, assumptions);
      }
      if (rule === 'LetPair' && expr.kind === 'LetPair') {
        return this.inferLetPairInteractive(expr, assumptions);
      }
      if (rule === 'Inl' && expr.kind === 'Inl') {
        return this.inferInlInteractive(expr, assumptions);
      }
      if (rule === 'Inr' && expr.kind === 'Inr') {
        return this.inferInrInteractive(expr, assumptions);
      }
      if (rule === 'Case' && expr.kind === 'Case') {
        return this.inferCaseInteractive(expr, assumptions);
      }
      if (rule === 'If' && expr.kind === 'If') {
        return this.inferIfInteractive(expr, assumptions);
      }
      if (rule === 'Let' && expr.kind === 'Let') {
        return this.inferLetInteractive(expr, assumptions);
      }
      if (rule === 'True' && expr.kind === 'True') {
        return this.inferBool(expr);
      }
      if (rule === 'False' && expr.kind === 'False') {
        return this.inferBool(expr);
      }
      if (rule === 'Zero' && expr.kind === 'Zero') {
        return this.inferZero(expr);
      }
      if (rule === 'Succ' && expr.kind === 'Succ') {
        return this.inferNatOpInteractive(expr, assumptions);
      }
      if (rule === 'Pred' && expr.kind === 'Pred') {
        return this.inferNatOpInteractive(expr, assumptions);
      }
      if (rule === 'IsZero' && expr.kind === 'IsZero') {
        return this.inferNatOpInteractive(expr, assumptions);
      }
      
      return null;
    } catch (error) {
      console.error(`Error applying rule ${rule}:`, error);
      return null;
    }
  }

  updateNodeTypeFromChildren(node: TypeInferenceNode): void {
    if (!node.children || node.children.length === 0) return;
    
    const expr = node.expression;
    
    switch (expr.kind) {
      case 'Abs':
        if (node.children.length === 1) {
          const bodyType = node.children[0].inferredType;
          node.inferredType = { 
            kind: 'Func', 
            from: (expr as any).paramType, 
            to: bodyType 
          };
        }
        break;
        
      case 'App':
        if (node.children.length === 2) {
          const fnType = node.children[0].inferredType;
          if (fnType.kind === 'Func') {
            node.inferredType = fnType.to;
          } else if (fnType.kind !== 'TypeVar') {

            node.inferredType = { kind: 'TypeVar', name: '?' };
          }
        }
        break;
        
      case 'Pair':
        if (node.children.length === 2) {
          node.inferredType = {
            kind: 'Prod',
            left: node.children[0].inferredType,
            right: node.children[1].inferredType
          };
        }
        break;
        
      case 'Let':
      case 'LetPair':
        if (node.children.length >= 2) {
          node.inferredType = node.children[node.children.length - 1].inferredType;
        }
        break;
        
      case 'If':
        if (node.children.length >= 2) {
          node.inferredType = node.children[1].inferredType;
        }
        break;
        
      case 'Case':
        if (node.children.length >= 2) {
          node.inferredType = node.children[1].inferredType;
        }
        break;
    }
  }

  private inferVarInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    return this.inferVar(expr, assumptions);
  }

  private inferAbsInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Abs') throw new Error('Expected Abs expression');
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.param, expr.paramType);
    
    const bodyChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.body,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: newAssumptions,
      children: []
    };

    return {
      rule: 'Abs',
      expression: expr,
      inferredType: { kind: 'Func', from: expr.paramType, to: bodyChild.inferredType },
      assumptions: new Map(assumptions),
      children: [bodyChild]
    };
  }

  private inferAppInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'App') throw new Error('Expected App expression');
    
    const fnChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.fn,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const argChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.arg,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'App',
      expression: expr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: [fnChild, argChild]
    };
  }

  private inferPairInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Pair') throw new Error('Expected Pair expression');
    
    const leftChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.left,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const rightChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.right,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'Pair',
      expression: expr,
      inferredType: { kind: 'Prod', left: leftChild.inferredType, right: rightChild.inferredType },
      assumptions: new Map(assumptions),
      children: [leftChild, rightChild]
    };
  }

  private inferLetPairInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'LetPair') throw new Error('Expected LetPair expression');
    
    const pairChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.pair,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const newAssumptions = new Map(assumptions);
    const bodyChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.inExpr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: newAssumptions,
      children: []
    };

    return {
      rule: 'LetPair',
      expression: expr,
      inferredType: bodyChild.inferredType,
      assumptions: new Map(assumptions),
      children: [pairChild, bodyChild]
    };
  }

  private inferInlInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Inl') throw new Error('Expected Inl expression');
    
    const exprChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.expr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'Inl',
      expression: expr,
      inferredType: expr.asType,
      assumptions: new Map(assumptions),
      children: [exprChild]
    };
  }

  private inferInrInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Inr') throw new Error('Expected Inr expression');
    
    const exprChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.expr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'Inr',
      expression: expr,
      inferredType: expr.asType,
      assumptions: new Map(assumptions),
      children: [exprChild]
    };
  }

  private inferCaseInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Case') throw new Error('Expected Case expression');
    
    const exprChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.expr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const leftAssumptions = new Map(assumptions);
    leftAssumptions.set(expr.leftVar, expr.leftType);
    const leftChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.leftBranch,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: leftAssumptions,
      children: []
    };

    const rightAssumptions = new Map(assumptions);
    rightAssumptions.set(expr.rightVar, expr.rightType);
    const rightChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.rightBranch,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: rightAssumptions,
      children: []
    };

    return {
      rule: 'Case',
      expression: expr,
      inferredType: leftChild.inferredType,
      assumptions: new Map(assumptions),
      children: [exprChild, leftChild, rightChild]
    };
  }

  private inferIfInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'If') throw new Error('Expected If expression');
    
    const condChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.cond,
      inferredType: { kind: 'Bool' },
      assumptions: new Map(assumptions),
      children: []
    };

    const thenChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.thenBranch,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const elseChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.elseBranch,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'If',
      expression: expr,
      inferredType: thenChild.inferredType,
      assumptions: new Map(assumptions),
      children: [condChild, thenChild, elseChild]
    };
  }

  private inferLetInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Let') throw new Error('Expected Let expression');
    
    const valueChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.value,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    const newAssumptions = new Map(assumptions);
    const inChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.inExpr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: newAssumptions,
      children: []
    };

    return {
      rule: 'Let',
      expression: expr,
      inferredType: inChild.inferredType,
      assumptions: new Map(assumptions),
      children: [valueChild, inChild]
    };
  }

  private inferNatOpInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Succ' && expr.kind !== 'Pred' && expr.kind !== 'IsZero') {
      throw new Error('Expected Succ, Pred, or IsZero expression');
    }
    
    const innerChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.expr,
      inferredType: { kind: 'Nat' },
      assumptions: new Map(assumptions),
      children: []
    };

    const resultType = expr.kind === 'IsZero' ? { kind: 'Bool' as const } : { kind: 'Nat' as const };

    return {
      rule: expr.kind,
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [innerChild]
    };
  }
}
