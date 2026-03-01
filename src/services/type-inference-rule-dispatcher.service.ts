import { Injectable } from '@angular/core';
import { ExprNode, TypeNode } from '../models/lambda-node';

@Injectable({ providedIn: 'root' })
export class TypeInferenceRuleDispatcherService {
  getInitialInteractiveType(lambdaExpr: ExprNode): TypeNode {
    try {
      if (lambdaExpr.kind === 'Abs') {
        return { kind: 'Func', from: lambdaExpr.paramType, to: { kind: 'TypeVar', name: '?' } };
      }
      if (lambdaExpr.kind === 'DependentAbs') {
        return {
          kind: 'DependentFunc',
          param: lambdaExpr.param,
          paramType: lambdaExpr.paramType,
          bodyType: { kind: 'TypeVar', name: '?' }
        };
      }
      if (lambdaExpr.kind === 'DependentPair') {
        return {
          kind: 'DependentProd',
          param: 'x',
          paramType: lambdaExpr.witnessType,
          bodyType: { kind: 'TypeVar', name: '?' }
        };
      }
      return { kind: 'TypeVar', name: '?' };
    } catch {
      return { kind: 'TypeVar', name: '?' };
    }
  }

  applyManualRule<T>(
    expr: ExprNode,
    rule: string,
    handlers: {
      inferVar: () => T;
      inferAbs: () => T;
      inferApp: () => T;
      inferPair: () => T;
      inferLetPair: () => T;
      inferInl: () => T;
      inferInr: () => T;
      inferCase: () => T;
      inferIf: () => T;
      inferLet: () => T;
      inferTrue: () => T;
      inferFalse: () => T;
      inferZero: () => T;
      inferSucc: () => T;
      inferPred: () => T;
      inferIsZero: () => T;
      inferDependentAbs: () => T;
      inferDependentPair: () => T;
      inferLetDependentPair: () => T;
    }
  ): T | null {
    if (rule === 'Var' && expr.kind === 'Var') return handlers.inferVar();
    if (rule === 'Abs' && expr.kind === 'Abs') return handlers.inferAbs();
    if (rule === 'App' && expr.kind === 'App') return handlers.inferApp();
    if (rule === 'Pair' && expr.kind === 'Pair') return handlers.inferPair();
    if (rule === 'LetPair' && expr.kind === 'LetPair') return handlers.inferLetPair();
    if (rule === 'Inl' && expr.kind === 'Inl') return handlers.inferInl();
    if (rule === 'Inr' && expr.kind === 'Inr') return handlers.inferInr();
    if (rule === 'Case' && expr.kind === 'Case') return handlers.inferCase();
    if (rule === 'If' && expr.kind === 'If') return handlers.inferIf();
    if (rule === 'Let' && expr.kind === 'Let') return handlers.inferLet();
    if (rule === 'True' && expr.kind === 'True') return handlers.inferTrue();
    if (rule === 'False' && expr.kind === 'False') return handlers.inferFalse();
    if (rule === 'Zero' && expr.kind === 'Zero') return handlers.inferZero();
    if (rule === 'Succ' && expr.kind === 'Succ') return handlers.inferSucc();
    if (rule === 'Pred' && expr.kind === 'Pred') return handlers.inferPred();
    if (rule === 'IsZero' && expr.kind === 'IsZero') return handlers.inferIsZero();
    if (rule === 'DependentAbs' && expr.kind === 'DependentAbs') return handlers.inferDependentAbs();
    if (rule === 'DependentPair' && expr.kind === 'DependentPair') return handlers.inferDependentPair();
    if (rule === 'LetDependentPair' && expr.kind === 'LetDependentPair') return handlers.inferLetDependentPair();

    return null;
  }
}
