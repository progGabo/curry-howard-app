import { Injectable } from '@angular/core';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { TypeFactories } from '../utils/ast-factories';
import { TreeUtils } from '../utils/tree-utils';
import { TypeInferenceRuleDispatcherService } from './type-inference-rule-dispatcher.service';

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

interface TypeScheme {
  quantified: string[];
  type: TypeNode;
}

@Injectable({ providedIn: 'root' })
export class TypeInferenceService {
  private polymorphicBindings = new Map<string, TypeScheme>();
  private polyVarCounter = 0;

  constructor(private ruleDispatcher: TypeInferenceRuleDispatcherService) {}

  buildTypeInferenceTree(lambdaExpr: ExprNode, initialAssumptions?: Map<string, TypeNode>): TypeInferenceNode {
    this.polymorphicBindings.clear();
    this.polyVarCounter = 0;
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

      case 'Fst':
        return this.inferFst(expr, assumptions);

      case 'Snd':
        return this.inferSnd(expr, assumptions);
      
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
      
      case 'Abort':
        return this.inferAbort(expr, assumptions);
      
      default:
        throw new Error(`Unsupported expression kind: ${(expr as any).kind}`);
    }
  }

  private inferAbort(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Abort') throw new Error('Expected Abort expression');

    const sourceInference = this.inferType(expr.expr, assumptions);
    const sourceType = sourceInference.inferredType;
    const isBottom = sourceType.kind === 'Bottom';
    const isPlaceholder = sourceType.kind === 'TypeVar' && sourceType.name === '?';

    if (!isBottom && !isPlaceholder) {
      throw new Error('Abort requires a proof of ⊥');
    }

    return {
      rule: 'Abort',
      expression: expr,
      inferredType: expr.targetType,
      assumptions: new Map(assumptions),
      children: [sourceInference]
    };
  }

  private inferVar(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Var') throw new Error('Expected Var expression');
    
    const varType = assumptions.get(expr.name);
    if (!varType) {
      throw new Error(`Unbound variable: ${expr.name}`);
    }

    const scheme = this.polymorphicBindings.get(expr.name);
    const inferredType = scheme ? this.instantiateScheme(scheme) : varType;

    return {
      rule: 'Var',
      expression: expr,
      inferredType,
      assumptions: new Map(assumptions),
      children: []
    };
  }

  private inferAbs(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Abs') throw new Error('Expected Abs expression');
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.param, expr.paramType);
    
    const bodyInference = this.withShadowedPolymorphism([expr.param], () => this.inferType(expr.body, newAssumptions));
    
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
    
    const fnInference = this.inferType(expr.fn, assumptions);
    const argInference = this.inferType(expr.arg, assumptions);
    
    const fnType = fnInference.inferredType;
    let resultType: TypeNode;

    if (fnType.kind === 'Func') {
      const substitutions = new Map<string, TypeNode>();
      if (!this.matchTypePattern(fnType.from, argInference.inferredType, substitutions)) {
        throw new Error('Type mismatch in application');
      }
      resultType = this.applyTypeSubstitutions(fnType.to, substitutions);
    } else if (fnType.kind === 'DependentFunc') {
      const substitutions = new Map<string, TypeNode>();
      if (!this.matchTypePattern(fnType.paramType, argInference.inferredType, substitutions)) {
        throw new Error('Type mismatch in application');
      }
      const witnessName = expr.arg.kind === 'Var' ? expr.arg.name : fnType.param;
      const instantiatedBody = this.applyTypeSubstitutions(fnType.bodyType, substitutions);
      resultType = this.substituteInType(instantiatedBody, fnType.param, TypeFactories.typeVar(witnessName));
    } else if (fnType.kind === 'TypeVar' && fnType.name === '?') {
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
        return type.name === paramName ? replacement : type;
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
        if (type.param === paramName) {
          return TypeFactories.dependentFunc(
            type.param,
            this.substituteInType(type.paramType, paramName, replacement),
            type.bodyType
          );
        }
        return TypeFactories.dependentFunc(
          type.param,
          this.substituteInType(type.paramType, paramName, replacement),
          this.substituteInType(type.bodyType, paramName, replacement)
        );
      case 'DependentProd':
        if (type.param === paramName) {
          return TypeFactories.dependentProd(
            type.param,
            this.substituteInType(type.paramType, paramName, replacement),
            type.bodyType
          );
        }
        return TypeFactories.dependentProd(
          type.param,
          this.substituteInType(type.paramType, paramName, replacement),
          this.substituteInType(type.bodyType, paramName, replacement)
        );
      case 'Bool':
      case 'Bottom':
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

  private inferFst(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Fst') throw new Error('Expected Fst expression');

    const pairInference = this.inferType(expr.pair, assumptions);
    const pairType = pairInference.inferredType;

    if (pairType.kind === 'Prod') {
      return {
        rule: 'Fst',
        expression: expr,
        inferredType: pairType.left,
        assumptions: new Map(assumptions),
        children: [pairInference]
      };
    }

    if (pairType.kind === 'TypeVar' && pairType.name === '?') {
      return {
        rule: 'Fst',
        expression: expr,
        inferredType: TypeFactories.typeVar('?'),
        assumptions: new Map(assumptions),
        children: [pairInference]
      };
    }

    throw new Error('fst requires a product type');
  }

  private inferSnd(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Snd') throw new Error('Expected Snd expression');

    const pairInference = this.inferType(expr.pair, assumptions);
    const pairType = pairInference.inferredType;

    if (pairType.kind === 'Prod') {
      return {
        rule: 'Snd',
        expression: expr,
        inferredType: pairType.right,
        assumptions: new Map(assumptions),
        children: [pairInference]
      };
    }

    if (pairType.kind === 'TypeVar' && pairType.name === '?') {
      return {
        rule: 'Snd',
        expression: expr,
        inferredType: TypeFactories.typeVar('?'),
        assumptions: new Map(assumptions),
        children: [pairInference]
      };
    }

    throw new Error('snd requires a product type');
  }

  private inferInl(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Inl') throw new Error('Expected Inl expression');
    
    const innerInference = this.inferType(expr.expr, assumptions);
    
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
    
    const leftAssumptions = new Map(assumptions);
    leftAssumptions.set(expr.leftVar, expr.leftType);
    const leftInference = this.withShadowedPolymorphism([expr.leftVar], () => this.inferType(expr.leftBranch, leftAssumptions));
    
    const rightAssumptions = new Map(assumptions);
    rightAssumptions.set(expr.rightVar, expr.rightType);
    const rightInference = this.withShadowedPolymorphism([expr.rightVar], () => this.inferType(expr.rightBranch, rightAssumptions));
    
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
    const quantified = this.generalizeType(valueInference.inferredType, assumptions);
    const scheme: TypeScheme = {
      quantified,
      type: valueInference.inferredType
    };
    
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.name, valueInference.inferredType);
    const bodyInference = this.withPolymorphicBinding(expr.name, scheme, () => this.inferType(expr.inExpr, newAssumptions));

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
    const bodyInference = this.withShadowedPolymorphism([expr.x, expr.y], () => this.inferType(expr.inExpr, newAssumptions));

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
    
    const bodyInference = this.withShadowedPolymorphism([expr.param], () => this.inferType(expr.body, newAssumptions));
    
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
    const witnessType = (expr.witnessType.kind === 'TypeVar' && expr.witnessType.name === '?')
      ? witnessInference.inferredType
      : expr.witnessType;
    const witnessMatches = this.typesEqual(witnessInference.inferredType, witnessType);
    if (!witnessMatches && !(witnessInference.inferredType.kind === 'TypeVar' && witnessInference.inferredType.name === '?')) {
      throw new Error('Witness type mismatch in dependent pair');
    }

    let proofAssumptions = new Map(assumptions);
    if (expr.proofType) {
      proofAssumptions = this.refineApplicationHeadForExpectedResult(expr.proof, proofAssumptions, expr.proofType);
    }

    const proofInference = this.inferType(expr.proof, proofAssumptions);
    if (expr.proofType) {
      const proofMatches = this.typesEqual(proofInference.inferredType, expr.proofType);
      if (!proofMatches && !(proofInference.inferredType.kind === 'TypeVar' && proofInference.inferredType.name === '?')) {
        throw new Error('Proof type mismatch in dependent pair');
      }
    }
    const paramName = expr.witness.kind === 'Var' ? expr.witness.name : 'x';
    const resultType: TypeNode = {
      kind: 'DependentProd',
      param: paramName,
      paramType: witnessType,
      bodyType: expr.proofType ?? proofInference.inferredType
    };

    return {
      rule: 'DependentPair',
      expression: expr,
      inferredType: resultType,
      assumptions: new Map(assumptions),
      children: [witnessInference, proofInference]
    };
  }

  private refineApplicationHeadForExpectedResult(expr: ExprNode, assumptions: Map<string, TypeNode>, expectedResult: TypeNode): Map<string, TypeNode> {
    const refined = new Map(assumptions);
    const args: ExprNode[] = [];
    let head: ExprNode = expr;

    while (head.kind === 'App') {
      args.unshift(head.arg);
      head = head.fn;
    }

    if (head.kind !== 'Var' || args.length === 0) {
      return refined;
    }

    const headType = refined.get(head.name);
    if (!(headType && headType.kind === 'TypeVar' && headType.name === '?')) {
      return refined;
    }

    const argTypes = args.map((arg) => this.inferType(arg, refined).inferredType);
    const inferredFnType = argTypes.reduceRight<TypeNode>(
      (resultType, argumentType) => TypeFactories.func(argumentType, resultType),
      expectedResult
    );

    refined.set(head.name, inferredFnType);
    return refined;
  }

  private inferLetDependentPair(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'LetDependentPair') throw new Error('Expected LetDependentPair expression');

    const expectedPairType: TypeNode = {
      kind: 'DependentProd',
      param: expr.x,
      paramType: expr.xType,
      bodyType: expr.pType
    };

    const pairAssumptions = new Map(assumptions);
    if (expr.pair.kind === 'Var') {
      const currentPairType = pairAssumptions.get(expr.pair.name);
      if (currentPairType && currentPairType.kind === 'TypeVar' && currentPairType.name === '?') {
        pairAssumptions.set(expr.pair.name, expectedPairType);
      }
    }

    const pairInference = this.inferType(expr.pair, pairAssumptions);
    const pairType = pairInference.inferredType;
    const isPlaceholder = pairType.kind === 'TypeVar' && pairType.name === '?';
    if (pairType.kind !== 'DependentProd' && !isPlaceholder) {
      throw new Error('LetDependentPair requires a dependent product type');
    }
    const newAssumptions = new Map(assumptions);
    newAssumptions.set(expr.x, expr.xType);
    newAssumptions.set(expr.p, expr.pType);
    const bodyInference = this.withShadowedPolymorphism([expr.x, expr.p], () => this.inferType(expr.inExpr, newAssumptions));
    const closedResultType = this.closeLetDependentPairResultType(expr, bodyInference.inferredType);

    return {
      rule: 'LetDependentPair',
      expression: expr,
      inferredType: closedResultType,
      assumptions: new Map(assumptions),
      children: [pairInference, bodyInference]
    };
  }

  private closeLetDependentPairResultType(expr: Extract<ExprNode, { kind: 'LetDependentPair' }>, bodyType: TypeNode): TypeNode {
    const projectionBase = this.getProjectionBaseName(expr.pair);
    const witnessProjection = TypeFactories.typeVar(`fst(${projectionBase})`);
    const proofProjectionType = this.substituteInType(expr.pType, expr.x, witnessProjection);

    const withoutProofBinder = this.substituteInType(bodyType, expr.p, proofProjectionType);
    return this.substituteInType(withoutProofBinder, expr.x, witnessProjection);
  }

  private getProjectionBaseName(expr: ExprNode): string {
    if (expr.kind === 'Var') {
      return expr.name;
    }
    return 'pair';
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
      case 'Bottom':
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

  private generalizeType(type: TypeNode, assumptions: Map<string, TypeNode>): string[] {
    const typeVars = this.collectTypeVariables(type);
    const envVars = this.collectTypeVariablesInAssumptions(assumptions);
    return [...typeVars].filter((name) => !envVars.has(name));
  }

  private instantiateScheme(scheme: TypeScheme): TypeNode {
    if (scheme.quantified.length === 0) {
      return scheme.type;
    }

    const substitutions = new Map<string, TypeNode>();
    for (const quantified of scheme.quantified) {
      substitutions.set(quantified, TypeFactories.typeVar(`__poly${++this.polyVarCounter}`));
    }
    return this.applyTypeSubstitutions(scheme.type, substitutions);
  }

  private applyTypeSubstitutions(type: TypeNode, substitutions: Map<string, TypeNode>): TypeNode {
    if (type.kind === 'TypeVar') {
      const replacement = substitutions.get(type.name);
      return replacement ?? type;
    }

    switch (type.kind) {
      case 'Func':
        return TypeFactories.func(
          this.applyTypeSubstitutions(type.from, substitutions),
          this.applyTypeSubstitutions(type.to, substitutions)
        );
      case 'Prod':
        return TypeFactories.prod(
          this.applyTypeSubstitutions(type.left, substitutions),
          this.applyTypeSubstitutions(type.right, substitutions)
        );
      case 'Sum':
        return TypeFactories.sum(
          this.applyTypeSubstitutions(type.left, substitutions),
          this.applyTypeSubstitutions(type.right, substitutions)
        );
      case 'PredicateType':
        return TypeFactories.predicate(
          type.name,
          type.argTypes.map((arg) => this.applyTypeSubstitutions(arg, substitutions))
        );
      case 'DependentFunc':
        return TypeFactories.dependentFunc(
          type.param,
          this.applyTypeSubstitutions(type.paramType, substitutions),
          this.applyTypeSubstitutions(type.bodyType, substitutions)
        );
      case 'DependentProd':
        return TypeFactories.dependentProd(
          type.param,
          this.applyTypeSubstitutions(type.paramType, substitutions),
          this.applyTypeSubstitutions(type.bodyType, substitutions)
        );
      case 'Bool':
      case 'Bottom':
      case 'Nat':
        return type;
      default:
        return type;
    }
  }

  private matchTypePattern(pattern: TypeNode, actual: TypeNode, substitutions: Map<string, TypeNode>): boolean {
    if (pattern.kind === 'TypeVar') {
      if (pattern.name === '?') {
        return true;
      }
      if (this.isPolymorphicTypeVar(pattern.name)) {
        const existing = substitutions.get(pattern.name);
        if (!existing) {
          substitutions.set(pattern.name, actual);
          return true;
        }
        return this.typesEqual(existing, actual);
      }
      return this.typesEqual(pattern, actual);
    }

    if (pattern.kind !== actual.kind) {
      return false;
    }

    switch (pattern.kind) {
      case 'Bool':
      case 'Bottom':
      case 'Nat':
        return true;
      case 'Func':
        return this.matchTypePattern(pattern.from, (actual as any).from, substitutions)
          && this.matchTypePattern(pattern.to, (actual as any).to, substitutions);
      case 'Prod':
        return this.matchTypePattern(pattern.left, (actual as any).left, substitutions)
          && this.matchTypePattern(pattern.right, (actual as any).right, substitutions);
      case 'Sum':
        return this.matchTypePattern(pattern.left, (actual as any).left, substitutions)
          && this.matchTypePattern(pattern.right, (actual as any).right, substitutions);
      case 'PredicateType':
        if (pattern.name !== (actual as any).name || pattern.argTypes.length !== (actual as any).argTypes.length) {
          return false;
        }
        return pattern.argTypes.every((arg, index) => this.matchTypePattern(arg, (actual as any).argTypes[index], substitutions));
      case 'DependentFunc':
        return pattern.param === (actual as any).param
          && this.matchTypePattern(pattern.paramType, (actual as any).paramType, substitutions)
          && this.matchTypePattern(pattern.bodyType, (actual as any).bodyType, substitutions);
      case 'DependentProd':
        return pattern.param === (actual as any).param
          && this.matchTypePattern(pattern.paramType, (actual as any).paramType, substitutions)
          && this.matchTypePattern(pattern.bodyType, (actual as any).bodyType, substitutions);
      default:
        return false;
    }
  }

  private collectTypeVariables(type: TypeNode, bucket: Set<string> = new Set<string>()): Set<string> {
    switch (type.kind) {
      case 'TypeVar':
        if (type.name !== '?') {
          bucket.add(type.name);
        }
        break;
      case 'Func':
        this.collectTypeVariables(type.from, bucket);
        this.collectTypeVariables(type.to, bucket);
        break;
      case 'Prod':
      case 'Sum':
        this.collectTypeVariables(type.left, bucket);
        this.collectTypeVariables(type.right, bucket);
        break;
      case 'PredicateType':
        type.argTypes.forEach((arg) => this.collectTypeVariables(arg, bucket));
        break;
      case 'DependentFunc':
      case 'DependentProd':
        this.collectTypeVariables(type.paramType, bucket);
        this.collectTypeVariables(type.bodyType, bucket);
        break;
      case 'Bool':
      case 'Bottom':
      case 'Nat':
        break;
    }
    return bucket;
  }

  private collectTypeVariablesInAssumptions(assumptions: Map<string, TypeNode>): Set<string> {
    const bucket = new Set<string>();
    assumptions.forEach((assumedType, variable) => {
      const scheme = this.polymorphicBindings.get(variable);
      const local = this.collectTypeVariables(assumedType);
      if (!scheme) {
        local.forEach((name) => bucket.add(name));
        return;
      }
      local.forEach((name) => {
        if (!scheme.quantified.includes(name)) {
          bucket.add(name);
        }
      });
    });
    return bucket;
  }

  private isPolymorphicTypeVar(typeName: string): boolean {
    return typeName.startsWith('__poly');
  }

  private withPolymorphicBinding<T>(name: string, scheme: TypeScheme, action: () => T): T {
    const previous = this.polymorphicBindings.has(name) ? this.polymorphicBindings.get(name) : undefined;
    this.polymorphicBindings.set(name, scheme);
    try {
      return action();
    } finally {
      if (previous) {
        this.polymorphicBindings.set(name, previous);
      } else {
        this.polymorphicBindings.delete(name);
      }
    }
  }

  private withShadowedPolymorphism<T>(names: string[], action: () => T): T {
    const previous = new Map<string, TypeScheme>();
    const hadEntry = new Set<string>();

    for (const name of names) {
      if (this.polymorphicBindings.has(name)) {
        hadEntry.add(name);
        previous.set(name, this.polymorphicBindings.get(name)!);
        this.polymorphicBindings.delete(name);
      }
    }

    try {
      return action();
    } finally {
      for (const name of names) {
        if (hadEntry.has(name)) {
          this.polymorphicBindings.set(name, previous.get(name)!);
        } else {
          this.polymorphicBindings.delete(name);
        }
      }
    }
  }

  formatType(type: TypeNode): string {
    if (type.kind === 'Func' && this.isNegationType(type)) {
      const inner = this.formatType(type.from);
      const wrappedInner = this.needsParensForNegation(type.from) ? `(${inner})` : inner;
      return `¬${wrappedInner}`;
    }

    switch (type.kind) {
      case 'TypeVar':
        return this.formatTypeVariableName(type.name);
      case 'Bool':
        return 'Bool';
      case 'Bottom':
        return '⊥';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const fromStr = this.formatType(type.from);
        const toStr = this.formatType(type.to);
        const fromNeedsParens = this.needsParensForArrowSide(type.from, 'left');
        const toNeedsParens = this.needsParensForArrowSide(type.to, 'right');
        return `${fromNeedsParens ? `(${fromStr})` : fromStr} → ${toNeedsParens ? `(${toStr})` : toStr}`;
      case 'Prod':
        const leftStr = this.formatType(type.left);
        const rightStr = this.formatType(type.right);
        const leftNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const rightNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${leftNeedsParens ? `(${leftStr})` : leftStr} × ${rightNeedsParens ? `(${rightStr})` : rightStr}`;
      case 'Sum':
        const sumLeftStr = this.formatType(type.left);
        const sumRightStr = this.formatType(type.right);
        const sumLeftNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const sumRightNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${sumLeftNeedsParens ? `(${sumLeftStr})` : sumLeftStr} + ${sumRightNeedsParens ? `(${sumRightStr})` : sumRightStr}`;
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
        return `∃${type.param}:${dpParamStr}. ${dpBodyStr}`;
      default:
        return `[${(type as any).kind}]`;
    }
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

  buildInteractiveRoot(lambdaExpr: ExprNode, initialAssumptions?: Map<string, TypeNode>): TypeInferenceNode {
    this.polymorphicBindings.clear();
    this.polyVarCounter = 0;
    const assumptions = initialAssumptions ? new Map(initialAssumptions) : new Map<string, TypeNode>();
    const freeVars = TreeUtils.getFreeVars(lambdaExpr);
    for (const v of freeVars) {
      if (!assumptions.has(v)) {
        assumptions.set(v, TypeFactories.typeVar('?'));
      }
    }

    const baseType = this.ruleDispatcher.getInitialInteractiveType(lambdaExpr);
    
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
      return this.ruleDispatcher.applyManualRule(expr, rule, {
        inferVar: () => this.inferVarInteractive(expr, assumptions),
        inferAbs: () => this.inferAbsInteractive(expr, assumptions),
        inferApp: () => this.inferAppInteractive(expr, assumptions),
        inferPair: () => this.inferPairInteractive(expr, assumptions),
        inferFst: () => this.inferFstInteractive(expr, assumptions),
        inferSnd: () => this.inferSndInteractive(expr, assumptions),
        inferLetPair: () => this.inferLetPairInteractive(expr, assumptions),
        inferInl: () => this.inferInlInteractive(expr, assumptions),
        inferInr: () => this.inferInrInteractive(expr, assumptions),
        inferCase: () => this.inferCaseInteractive(expr, assumptions),
        inferIf: () => this.inferIfInteractive(expr, assumptions),
        inferLet: () => this.inferLetInteractive(expr, assumptions),
        inferTrue: () => this.inferBool(expr),
        inferFalse: () => this.inferBool(expr),
        inferZero: () => this.inferZero(expr),
        inferSucc: () => this.inferNatOpInteractive(expr, assumptions),
        inferPred: () => this.inferNatOpInteractive(expr, assumptions),
        inferIsZero: () => this.inferNatOpInteractive(expr, assumptions),
        inferDependentAbs: () => this.inferDependentAbsInteractive(expr, assumptions),
        inferDependentPair: () => this.inferDependentPairInteractive(expr, assumptions),
        inferLetDependentPair: () => this.inferLetDependentPairInteractive(expr, assumptions)
      });
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
          const declaredWitnessType = (expr as any).witnessType as TypeNode;
          const childWitnessType = node.children[0].inferredType;
          const paramType = (declaredWitnessType.kind === 'TypeVar' && declaredWitnessType.name === '?')
            ? childWitnessType
            : declaredWitnessType;
          node.inferredType = {
            kind: 'DependentProd',
            param: paramName,
            paramType,
            bodyType: node.children[1].inferredType
          };
        }
        break;
        
      case 'LetPair':
        if (node.children.length >= 2) {
          node.inferredType = node.children[node.children.length - 1].inferredType;
        }
        break;

      case 'LetDependentPair':
        if (node.children.length >= 2 && expr.kind === 'LetDependentPair') {
          const bodyType = node.children[node.children.length - 1].inferredType;
          node.inferredType = this.closeLetDependentPairResultType(expr, bodyType);
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

      case 'Fst':
        if (node.children.length === 1) {
          const pairType = node.children[0].inferredType;
          node.inferredType = pairType.kind === 'Prod' ? pairType.left : { kind: 'TypeVar', name: '?' };
        }
        break;

      case 'Snd':
        if (node.children.length === 1) {
          const pairType = node.children[0].inferredType;
          node.inferredType = pairType.kind === 'Prod' ? pairType.right : { kind: 'TypeVar', name: '?' };
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

  private inferFstInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Fst') throw new Error('Expected Fst expression');

    const pairChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.pair,
      inferredType: {
        kind: 'Prod',
        left: { kind: 'TypeVar', name: '?' },
        right: { kind: 'TypeVar', name: '?' }
      },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'Fst',
      expression: expr,
      inferredType: pairChild.inferredType.kind === 'Prod' ? pairChild.inferredType.left : { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: [pairChild]
    };
  }

  private inferSndInteractive(expr: ExprNode, assumptions: Map<string, TypeNode>): TypeInferenceNode {
    if (expr.kind !== 'Snd') throw new Error('Expected Snd expression');

    const pairChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.pair,
      inferredType: {
        kind: 'Prod',
        left: { kind: 'TypeVar', name: '?' },
        right: { kind: 'TypeVar', name: '?' }
      },
      assumptions: new Map(assumptions),
      children: []
    };

    return {
      rule: 'Snd',
      expression: expr,
      inferredType: pairChild.inferredType.kind === 'Prod' ? pairChild.inferredType.right : { kind: 'TypeVar', name: '?' },
      assumptions: new Map(assumptions),
      children: [pairChild]
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

    const declaredWitnessType = expr.witnessType;
    const initialWitnessType =
      declaredWitnessType.kind === 'TypeVar' && declaredWitnessType.name === '?'
        ? { kind: 'TypeVar', name: '?' } as TypeNode
        : declaredWitnessType;
    
    const witnessChild: TypeInferenceNode = {
      rule: '∅',
      expression: expr.witness,
      inferredType: initialWitnessType,
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

    const paramType =
      declaredWitnessType.kind === 'TypeVar' && declaredWitnessType.name === '?'
        ? witnessChild.inferredType
        : declaredWitnessType;

    return {
      rule: 'DependentPair',
      expression: expr,
      inferredType: {
        kind: 'DependentProd',
        param: 'x',
        paramType,
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
