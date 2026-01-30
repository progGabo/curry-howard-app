import { Injectable } from '@angular/core';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { FormulaNode } from '../models/formula-node';
import { TypeFactories } from '../utils/ast-factories';
import { TreeUtils } from '../utils/tree-utils';

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

  buildTypeInferenceTree(lambdaExpr: ExprNode, initialAssumptions?: Map<string, TypeNode>): TypeInferenceNode {
    let assumptions = initialAssumptions ? new Map(initialAssumptions) : new Map<string, TypeNode>();
    const freeVars = TreeUtils.getFreeVars(lambdaExpr);
    for (const v of freeVars) {
      if (!assumptions.has(v)) {
        assumptions.set(v, TypeFactories.typeVar('?'));
      }
    }
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
      
      case 'DependentAbs':
        return this.inferDependentAbs(expr, assumptions);
      
      case 'DependentPair':
        return this.inferDependentPair(expr, assumptions);
      
      case 'LetDependentPair':
        return this.inferLetDependentPair(expr, assumptions);
      
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
    
    const fnType = fnInference.inferredType;
    let resultType: TypeNode;

    if (fnType.kind === 'Func') {
      if (!this.typesEqual(fnType.from, argInference.inferredType)) {
        throw new Error('Type mismatch in application');
      }
      resultType = fnType.to;
    } else if (fnType.kind === 'DependentFunc') {
      if (!this.typesEqual(fnType.paramType, argInference.inferredType)) {
        throw new Error('Type mismatch in application');
      }
      // Substitute the bound variable with the witness in the body type (e.g. P(x)→Q(x) becomes P(a)→Q(a))
      const witnessName = expr.arg.kind === 'Var' ? expr.arg.name : fnType.param;
      resultType = this.substituteInType(fnType.bodyType, fnType.param, TypeFactories.typeVar(witnessName));
    } else if (fnType.kind === 'TypeVar' && fnType.name === '?') {
      // Placeholder for free variables in lambda→expression: allow application, result unknown
      resultType = TypeFactories.typeVar('?');
    } else {
      throw new Error('Application of non-function type');
    }

    return {
      rule: 'App',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [fnInference, argInference]
    };
  }

  /**
   * Substitute a type variable by name in a type (e.g. x → a so P(x)→Q(x) becomes P(a)→Q(a)).
   * Used when eliminating a universal quantifier with a witness.
   */
  private substituteInType(type: TypeNode, paramName: string, replacement: TypeNode): TypeNode {
    switch (type.kind) {
      case 'TypeVar':
        return type.name.toLowerCase() === paramName.toLowerCase() ? replacement : type;
      case 'Func':
        return TypeFactories.func(
          this.substituteInType(type.from, paramName, replacement),
          this.substituteInType(type.to, paramName, replacement)
        );
      case 'Prod':
        return TypeFactories.prod(
          this.substituteInType(type.left, paramName, replacement),
          this.substituteInType(type.right, paramName, replacement)
        );
      case 'Sum':
        return TypeFactories.sum(
          this.substituteInType(type.left, paramName, replacement),
          this.substituteInType(type.right, paramName, replacement)
        );
      case 'PredicateType':
        return TypeFactories.predicate(
          type.name,
          type.argTypes.map(t => this.substituteInType(t, paramName, replacement))
        );
      case 'DependentFunc':
        return TypeFactories.dependentFunc(
          type.param,
          this.substituteInType(type.paramType, paramName, replacement),
          this.substituteInType(type.bodyType, paramName, replacement)
        );
      case 'DependentProd':
        return TypeFactories.dependentProd(
          type.param,
          this.substituteInType(type.paramType, paramName, replacement),
          this.substituteInType(type.bodyType, paramName, replacement)
        );
      case 'Bool':
      case 'Nat':
        return type;
      default:
        return type;
    }
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

  private inferDependentAbs(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'DependentAbs') throw new Error('Expected DependentAbs expression');
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.param, expr.paramType);
    
    const bodyInference = this.inferType(expr.body, newAssumptions);
    
    const resultType: TypeNode = {
      kind: 'DependentFunc',
      param: expr.param,
      paramType: expr.paramType,
      bodyType: bodyInference.inferredType
    };

    return {
      rule: 'DependentAbs',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [bodyInference]
    };
  }

  private inferDependentPair(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'DependentPair') throw new Error('Expected DependentPair expression');
    
    const witnessInference = this.inferType(expr.witness, assumptions);
    const witnessMatches = this.typesEqual(witnessInference.inferredType, expr.witnessType);
    if (!witnessMatches && !(witnessInference.inferredType.kind === 'TypeVar' && witnessInference.inferredType.name === '?')) {
      throw new Error('Witness type mismatch in dependent pair');
    }
    
    const proofInference = this.inferType(expr.proof, assumptions);
    const paramName = expr.witness.kind === 'Var' ? expr.witness.name : 'x';
    const resultType: TypeNode = {
      kind: 'DependentProd',
      param: paramName,
      paramType: expr.witnessType,
      bodyType: proofInference.inferredType
    };

    return {
      rule: 'DependentPair',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [witnessInference, proofInference]
    };
  }

  private inferLetDependentPair(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'LetDependentPair') throw new Error('Expected LetDependentPair expression');
    
    const pairInference = this.inferType(expr.pair, assumptions);
    const pairType = pairInference.inferredType;
    const isPlaceholder = pairType.kind === 'TypeVar' && pairType.name === '?';
    if (pairType.kind !== 'DependentProd' && !isPlaceholder) {
      throw new Error('LetDependentPair requires a dependent product type');
    }
    // When pair has placeholder ? (free variable in lambda→expression), use let-binding types for body context
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.x, expr.xType);
    newAssumptions.set(expr.p, expr.pType);
    const bodyInference = this.inferType(expr.inExpr, newAssumptions);

    return {
      rule: 'LetDependentPair',
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
      case 'PredicateType':
        if (t1.name !== (t2 as any).name) return false;
        if (t1.argTypes.length !== (t2 as any).argTypes.length) return false;
        return t1.argTypes.every((a, i) => this.typesEqual(a, (t2 as any).argTypes[i]));
      case 'DependentFunc':
        return t1.param === (t2 as any).param &&
               this.typesEqual(t1.paramType, (t2 as any).paramType) &&
               this.typesEqual(t1.bodyType, (t2 as any).bodyType);
      case 'DependentProd':
        return t1.param === (t2 as any).param &&
               this.typesEqual(t1.paramType, (t2 as any).paramType) &&
               this.typesEqual(t1.bodyType, (t2 as any).bodyType);
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
      case 'DependentFunc':
        const dfParamStr = this.formatType(type.paramType);
        const dfBodyStr = this.formatType(type.bodyType);
        return `(${type.param}: ${dfParamStr}) → ${dfBodyStr}`;
      case 'DependentProd':
        const dpParamStr = this.formatType(type.paramType);
        const dpBodyStr = this.formatType(type.bodyType);
        return `(${type.param}: ${dpParamStr}) × ${dpBodyStr}`;
      default:
        return `[${(type as any).kind}]`;
    }
  }

  buildInteractiveRoot(lambdaExpr: ExprNode, initialAssumptions?: Map<string, TypeNode>): TypeInferenceNode {
    const assumptions = initialAssumptions ? new Map(initialAssumptions) : new Map<string, TypeNode>();
    const freeVars = TreeUtils.getFreeVars(lambdaExpr);
    for (const v of freeVars) {
      if (!assumptions.has(v)) {
        assumptions.set(v, TypeFactories.typeVar('?'));
      }
    }

    let baseType: TypeNode;
    try {
      if (lambdaExpr.kind === 'Abs') {
        baseType = { kind: 'Func', from: lambdaExpr.paramType, to: { kind: 'TypeVar', name: '?' } };
      } else if (lambdaExpr.kind === 'DependentAbs') {
        baseType = {
          kind: 'DependentFunc',
          param: lambdaExpr.param,
          paramType: lambdaExpr.paramType,
          bodyType: { kind: 'TypeVar', name: '?' }
        };
      } else if (lambdaExpr.kind === 'DependentPair') {
        baseType = {
          kind: 'DependentProd',
          param: 'x',
          paramType: lambdaExpr.witnessType,
          bodyType: { kind: 'TypeVar', name: '?' }
        };
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
      if (rule === 'DependentAbs' && expr.kind === 'DependentAbs') {
        return this.inferDependentAbsInteractive(expr, assumptions);
      }
      if (rule === 'DependentPair' && expr.kind === 'DependentPair') {
        return this.inferDependentPairInteractive(expr, assumptions);
      }
      if (rule === 'LetDependentPair' && expr.kind === 'LetDependentPair') {
        return this.inferLetDependentPairInteractive(expr, assumptions);
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
          } else if (fnType.kind === 'DependentFunc') {
            const witnessName = expr.arg.kind === 'Var' ? expr.arg.name : fnType.param;
            node.inferredType = this.substituteInType(fnType.bodyType, fnType.param, TypeFactories.typeVar(witnessName));
          } else if (fnType.kind !== 'TypeVar') {
            node.inferredType = { kind: 'TypeVar', name: '?' };
          }
        }
        break;
        
      case 'DependentAbs':
        if (node.children.length === 1) {
          const bodyType = node.children[0].inferredType;
          node.inferredType = {
            kind: 'DependentFunc',
            param: (expr as any).param,
            paramType: (expr as any).paramType,
            bodyType
          };
        }
        break;
        
      case 'DependentPair':
        if (node.children.length === 2) {
          const witness = (expr as any).witness;
          const paramName = witness.kind === 'Var' ? witness.name : 'x';
          node.inferredType = {
            kind: 'DependentProd',
            param: paramName,
            paramType: (expr as any).witnessType,
            bodyType: node.children[1].inferredType
          };
        }
        break;
        
      case 'LetPair':
      case 'LetDependentPair':
        if (node.children.length >= 2) {
          node.inferredType = node.children[node.children.length - 1].inferredType;
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

  private inferDependentAbsInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'DependentAbs') throw new Error('Expected DependentAbs expression');
    
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
      rule: 'DependentAbs',
      expression: expr,
      inferredType: {
        kind: 'DependentFunc',
        param: expr.param,
        paramType: expr.paramType,
        bodyType: bodyChild.inferredType
      },
      assumptions: new Map(assumptions),
      children: [bodyChild]
    };
  }

  private inferDependentPairInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'DependentPair') throw new Error('Expected DependentPair expression');
    
    const witnessChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.witness,
      inferredType: expr.witnessType,
      assumptions: new Map(assumptions),
      children: []
    };

    const proofChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.proof,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'DependentPair',
      expression: expr,
      inferredType: {
        kind: 'DependentProd',
        param: 'x',
        paramType: expr.witnessType,
        bodyType: proofChild.inferredType
      },
      assumptions: new Map(assumptions),
      children: [witnessChild, proofChild]
    };
  }

  private inferLetDependentPairInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'LetDependentPair') throw new Error('Expected LetDependentPair expression');
    
    const pairChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.pair,
      inferredType: {
        kind: 'DependentProd',
        param: 'x',
        paramType: expr.xType,
        bodyType: expr.pType
      },
      assumptions: new Map(assumptions),
      children: []
    };

    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.x, expr.xType);
    newAssumptions.set(expr.p, expr.pType);
    const bodyChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.inExpr,
      inferredType: { kind: 'TypeVar', name: '?' },
      assumptions: newAssumptions,
      children: []
    };

    return {
      rule: 'LetDependentPair',
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
