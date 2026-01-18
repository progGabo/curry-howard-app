import { Injectable } from '@angular/core';
import { FormulaNode } from '../models/formula-node';

/**
 * Service for generating meaningful variable names for lambda expressions.
 * Provides context-aware naming based on formulas and their structure.
 */
@Injectable({ providedIn: 'root' })
export class VariableNamingService {
  private usedNames = new Set<string>();
  private formulaNames = new WeakMap<FormulaNode, string>();
  private counter = 0;

  /**
   * Reset the service state for a new proof
   */
  reset(): void {
    this.usedNames.clear();
    this.formulaNames = new WeakMap();
    this.counter = 0;
  }

  /**
   * Get or create a variable name for a formula
   */
  getVariableName(formula: FormulaNode, context?: 'assumption' | 'conclusion'): string {
    // Check if we already have a name for this formula
    const existing = this.formulaNames.get(formula);
    if (existing) {
      return existing;
    }

    // Generate a new name based on formula structure
    const name = this.generateName(formula, context);
    const uniqueName = this.ensureUnique(name);
    
    this.formulaNames.set(formula, uniqueName);
    this.usedNames.add(uniqueName);
    
    return uniqueName;
  }

  /**
   * Generate a base name for a formula
   * Uses actual variable names when available, otherwise simple alphabet letters
   */
  private generateName(formula: FormulaNode, context?: 'assumption' | 'conclusion'): string {
    switch (formula.kind) {
      case 'Var':
        // Use the actual variable name from the formula
        return formula.name;
      
      case 'Forall':
      case 'Exists':
        // For assumptions, use a simple letter (e.g., "e" for exists, "f" for forall)
        // For conclusions or when context is not specified, use the bound variable name
        if (context === 'assumption') {
          return formula.kind === 'Exists' ? 'e' : 'f';
        }
        // Use the bound variable name for conclusions
        return formula.variable;
      
      case 'Predicate':
        // Use the predicate name if it's a valid variable name, otherwise use simple letter
        return this.isValidVariableName(formula.name) ? formula.name : this.getNextSimpleName();
      
      case 'Paren':
        return this.generateName(formula.inner, context);
      
      default:
        // For complex formulas (Implies, And, Or, Not, etc.), use simple alphabet letters
        return this.getNextSimpleName();
    }
  }

  /**
   * Get the next simple alphabet letter (a, b, c, ..., z, then a0, b0, ...)
   * Note: counter is incremented in ensureUnique, so this just calculates the name
   */
  private getNextSimpleName(): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const currentCounter = this.counter;
    const index = currentCounter % alphabet.length;
    const letter = alphabet[index];
    const number = Math.floor(currentCounter / alphabet.length);
    return number === 0 ? letter : `${letter}${number}`;
  }

  /**
   * Check if a string is a valid variable name (starts with lowercase letter or underscore)
   */
  private isValidVariableName(name: string): boolean {
    return /^[a-z_][a-z0-9_]*$/i.test(name);
  }

  /**
   * Ensure the name is unique by appending a counter if needed
   */
  private ensureUnique(baseName: string): string {
    if (!this.usedNames.has(baseName)) {
      this.counter++;
      return baseName;
    }

    // If name is taken, append a number
    let suffix = 0;
    let candidate = `${baseName}${suffix}`;
    while (this.usedNames.has(candidate)) {
      suffix++;
      candidate = `${baseName}${suffix}`;
    }
    this.counter++;
    return candidate;
  }

  /**
   * Generate a fresh variable name (for bound variables, witnesses, etc.)
   */
  freshVariable(baseName: string, avoid: string[] = []): string {
    const avoidSet = new Set([...this.usedNames, ...avoid]);
    let candidate = baseName;
    let suffix = 0;
    
    while (avoidSet.has(candidate)) {
      candidate = `${baseName}${suffix}`;
      suffix++;
    }
    
    this.usedNames.add(candidate);
    return candidate;
  }

  /**
   * Generate a name for a proof variable (for assumptions)
   */
  proofVariable(formula: FormulaNode): string {
    return this.getVariableName(formula, 'assumption');
  }

  /**
   * Generate a name for a conclusion variable
   */
  conclusionVariable(formula: FormulaNode): string {
    return this.getVariableName(formula, 'conclusion');
  }

  /**
   * Generate a name for a witness (for ∃R)
   * Uses the variable name directly if available
   */
  witnessVariable(variable: string): string {
    return this.freshVariable(variable);
  }

  /**
   * Generate a name for a bound variable (for quantifiers)
   */
  boundVariable(variable: string): string {
    return this.freshVariable(variable);
  }
}

