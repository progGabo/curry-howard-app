import { Injectable } from '@angular/core';
import { FormulaNode, TermNode } from '../models/formula-node';
import { TypeNode } from '../models/lambda-node';
import { TypeFactories } from '../utils/ast-factories';
import { isPredicate } from '../utils/type-guards';

/**
 * Service for converting formulas to types, with support for dependent types.
 * Handles proper type inference for quantifiers and predicates.
 */
@Injectable({ providedIn: 'root' })
export class FormulaTypeService {
  /**
   * Convert a formula to its corresponding type.
   * Uses dependent types for quantifiers when appropriate.
   */
  formulaToType(f: FormulaNode, useDependentTypes: boolean = true): TypeNode {
    switch (f.kind) {
      case 'Var':
        return TypeFactories.typeVar(f.name);
      
      case 'Implies':
        return TypeFactories.func(
          this.formulaToType(f.left, useDependentTypes),
          this.formulaToType(f.right, useDependentTypes)
        );
      
      case 'And':
        return TypeFactories.prod(
          this.formulaToType(f.left, useDependentTypes),
          this.formulaToType(f.right, useDependentTypes)
        );
      
      case 'Or':
        return TypeFactories.sum(
          this.formulaToType(f.left, useDependentTypes),
          this.formulaToType(f.right, useDependentTypes)
        );
      
      case 'Not':
        return TypeFactories.func(
          this.formulaToType(f.inner, useDependentTypes),
          TypeFactories.bottom()
        );
      
      case 'Paren':
        return this.formulaToType(f.inner, useDependentTypes);
      
      case 'Forall':
        if (useDependentTypes) {
          // ∀x. A maps to dependent function type (x: T) -> A
          const paramType = this.inferQuantifierParamType(f);
          const bodyType = this.formulaToType(f.body, useDependentTypes);
          return TypeFactories.dependentFunc(f.variable, paramType, bodyType);
        } else {
          // Fallback to non-dependent function type
          const paramType = this.inferQuantifierParamType(f);
          const bodyType = this.formulaToType(f.body, useDependentTypes);
          return TypeFactories.func(paramType, bodyType);
        }
      
      case 'Exists':
        if (useDependentTypes) {
          // ∃x. A maps to dependent pair type (x: T) * A
          const paramType = this.inferQuantifierParamType(f);
          const bodyType = this.formulaToType(f.body, useDependentTypes);
          return TypeFactories.dependentProd(f.variable, paramType, bodyType);
        } else {
          // Fallback to non-dependent product type
          const paramType = this.inferQuantifierParamType(f);
          const bodyType = this.formulaToType(f.body, useDependentTypes);
          return TypeFactories.prod(paramType, bodyType);
        }
      
      case 'Predicate':
        // Predicate P(x, y) maps to predicate type P(T1, T2, ...)
        const argTypes = this.inferPredicateArgTypes(f);
        return TypeFactories.predicate(f.name, argTypes);
      
      case 'True':
        return TypeFactories.bool();
      case 'False':
        return TypeFactories.bottom();
      
      default:
        throw new Error(`formulaToType: unsupported formula kind: ${(f as any).kind}`);
    }
  }

  /**
   * Infer the parameter type for a quantifier from its body.
   * Attempts to infer from predicate arguments, otherwise uses a generic type.
   */
  inferQuantifierParamType(quantifier: { variable: string; body: FormulaNode }): TypeNode {
    // If body is a predicate, try to infer from the first argument
    if (isPredicate(quantifier.body)) {
      const args = quantifier.body.args;
      if (args.length > 0) {
        // Try to find the variable in the predicate arguments
        const varIndex = args.findIndex(arg => 
          arg.kind === 'TermVar' && arg.name === quantifier.variable
        );
        if (varIndex >= 0) {
          // For now, use a generic type - could be enhanced to infer from context
          return TypeFactories.typeVar('T');
        }
      }
    }
    
    // Default: use a generic type variable
    // Could be enhanced to infer from context or user-provided type annotations
    return TypeFactories.typeVar('T');
  }

  /**
   * Infer argument types for a predicate.
   * Uses the term variable names when available, otherwise uses generic types.
   */
  private inferPredicateArgTypes(predicate: { args: TermNode[] }): TypeNode[] {
    return predicate.args.map(arg => this.inferTermType(arg));
  }

  /**
   * Infer the type of a term (for use in quantifier type inference).
   * This is a simplified version - could be enhanced.
   */
  inferTermType(term: TermNode): TypeNode {
    switch (term.kind) {
      case 'TermVar':
        return TypeFactories.typeVar(term.name);
      case 'TermConst':
        // Constants could have specific types - for now use generic
        return TypeFactories.typeVar('T');
      case 'TermFunc':
        // Function terms - could infer from signature
        return TypeFactories.typeVar('T');
      default:
        return TypeFactories.typeVar('T');
    }
  }
}

