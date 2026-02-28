import { FormulaNode, TermNode } from '../models/formula-node';
import { TermFactories } from './ast-factories';

/**
 * Utility functions for quantifier rules:
 * - Term parsing
 * - Free variable detection
 * - Capture-avoiding substitution
 */

/**
 * Parse a term from a string input.
 * Supports: variables (lowercase), constants (lowercase), function applications f(t1,...,tn)
 * 
 * Examples:
 * - "x" -> TermVar("x")
 * - "c" -> TermConst("c")
 * - "f(x, y)" -> TermFunc("f", [TermVar("x"), TermVar("y")])
 */
export function parseTerm(input: string): TermNode | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try to parse function application: f(t1,...,tn)
  const funcMatch = trimmed.match(/^([a-z][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const argsStr = funcMatch[2].trim();
    if (argsStr === '') {
      // Function with no arguments
      return TermFactories.func(funcName, []);
    }
    // Parse comma-separated arguments
    const args: TermNode[] = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === ',' && depth === 0) {
        const arg = parseTerm(current.trim());
        if (arg) args.push(arg);
        current = '';
        continue;
      }
      current += char;
    }
    if (current.trim()) {
      const arg = parseTerm(current.trim());
      if (arg) args.push(arg);
    }
    return TermFactories.func(funcName, args);
  }

  // Simple variable or constant (lowercase identifier)
  const varMatch = trimmed.match(/^[a-z][a-zA-Z0-9_]*$/);
  if (varMatch) {
    // By convention, we'll treat single lowercase identifiers as variables
    // Constants would typically be explicitly marked, but for simplicity we use TermVar
    return TermFactories.var(varMatch[0]);
  }

  return null;
}

export function termToText(term: TermNode): string {
  switch (term.kind) {
    case 'TermVar':
      return term.name;
    case 'TermConst':
      return term.name;
    case 'TermFunc':
      return `${term.name}(${term.args.map((arg) => termToText(arg)).join(',')})`;
  }
}

/**
 * Get all free variables in a formula.
 * Returns a Set of variable names that occur free in the formula.
 */
export function freeVarsFormula(f: FormulaNode): Set<string> {
  const freeVars = new Set<string>();
  
  function collect(f: FormulaNode, bound: Set<string>) {
    switch (f.kind) {
      case 'Var':
        if (!bound.has(f.name)) {
          freeVars.add(f.name);
        }
        break;
      case 'Forall':
      case 'Exists': {
        const newBound = new Set(bound);
        newBound.add(f.variable);
        collect(f.body, newBound);
        break;
      }
      case 'Implies':
      case 'And':
      case 'Or':
        collect(f.left, bound);
        collect(f.right, bound);
        break;
      case 'Not':
      case 'Paren':
        collect(f.inner, bound);
        break;
      case 'Predicate':
        f.args.forEach(arg => {
          const termVars = freeVarsTerm(arg);
          termVars.forEach(v => {
            if (!bound.has(v)) {
              freeVars.add(v);
            }
          });
        });
        break;
      case 'True':
      case 'False':
        break;
    }
  }
  
  collect(f, new Set());
  return freeVars;
}

/**
 * Get all free variables in a term.
 * Returns a Set of variable names that occur in the term.
 */
export function freeVarsTerm(t: TermNode): Set<string> {
  const freeVars = new Set<string>();
  
  function collect(t: TermNode) {
    switch (t.kind) {
      case 'TermVar':
        freeVars.add(t.name);
        break;
      case 'TermConst':
        // Constants don't contribute free variables
        break;
      case 'TermFunc':
        t.args.forEach(collect);
        break;
    }
  }
  
  collect(t);
  return freeVars;
}

export function freeTermSymbolsTerm(t: TermNode): Set<string> {
  const symbols = new Set<string>();

  const visit = (term: TermNode): void => {
    switch (term.kind) {
      case 'TermVar':
      case 'TermConst':
        symbols.add(term.name);
        break;
      case 'TermFunc':
        term.args.forEach(visit);
        break;
    }
  };

  visit(t);
  return symbols;
}

export function freeTermSymbolsFormula(formula: FormulaNode): Set<string> {
  const symbols = new Set<string>();

  const visit = (f: FormulaNode): void => {
    switch (f.kind) {
      case 'Predicate':
        f.args.forEach((arg) => {
          for (const symbol of freeTermSymbolsTerm(arg)) {
            symbols.add(symbol);
          }
        });
        break;
      case 'Implies':
      case 'And':
      case 'Or':
        visit(f.left);
        visit(f.right);
        break;
      case 'Forall':
      case 'Exists':
        visit(f.body);
        break;
      case 'Not':
      case 'Paren':
        visit(f.inner);
        break;
      default:
        break;
    }
  };

  visit(formula);
  return symbols;
}

export function freeTermSymbolsInFormulas(formulas: FormulaNode[]): Set<string> {
  const symbols = new Set<string>();
  for (const formula of formulas) {
    for (const symbol of freeTermSymbolsFormula(formula)) {
      symbols.add(symbol);
    }
  }
  return symbols;
}

/**
 * Capture-avoiding substitution: A[t/x]
 * Substitutes term t for variable x in formula A, avoiding variable capture.
 * 
 * If t contains variables that would be captured by binders in A,
 * we alpha-rename the bound variables first.
 */
export function substituteFormula(
  f: FormulaNode,
  x: string,
  t: TermNode
): FormulaNode {
  const tFreeVars = freeVarsTerm(t);

  const subst = (formula: FormulaNode): FormulaNode => {
    switch (formula.kind) {
      case 'Var':
      case 'True':
      case 'False':
        return formula;
      case 'Predicate':
        return {
          ...formula,
          args: formula.args.map((arg) => substituteTerm(arg, x, t))
        };
      case 'Implies':
      case 'And':
      case 'Or':
        return {
          ...formula,
          left: subst(formula.left),
          right: subst(formula.right)
        };
      case 'Not':
      case 'Paren':
        return {
          ...formula,
          inner: subst(formula.inner)
        };
      case 'Forall':
      case 'Exists': {
        const binder = formula.variable;

        if (binder === x) {
          return formula;
        }

        if (!tFreeVars.has(binder)) {
          return {
            ...formula,
            body: subst(formula.body)
          };
        }

        const used = new Set<string>([
          ...freeVarsFormula(formula.body),
          ...freeVarsTerm(t),
          x,
          binder
        ]);
        const fresh = generateFreshVar(`${binder}_`, used);
        const alphaRenamedBody = renameBoundVariableInFormula(formula.body, binder, fresh);

        return {
          ...formula,
          variable: fresh,
          body: substituteFormula(alphaRenamedBody, x, t)
        };
      }
      default:
        return formula;
    }
  };

  return subst(f);
}

/**
 * Substitute term t for variable x in term u.
 */
export function substituteTerm(u: TermNode, x: string, t: TermNode): TermNode {
  switch (u.kind) {
    case 'TermVar':
      if (u.name === x) {
        return t;
      }
      return u;
      
    case 'TermConst':
      return u;
      
    case 'TermFunc':
      return {
        ...u,
        args: u.args.map(arg => substituteTerm(arg, x, t))
      };
  }
}

/**
 * Rename a variable in a formula (simple renaming, not capture-avoiding substitution).
 * Used for alpha-renaming bound variables.
 */
function renameVariableInFormula(f: FormulaNode, oldVar: string, newVar: string): FormulaNode {
  switch (f.kind) {
    case 'Var':
      return f.name === oldVar ? { ...f, name: newVar } : f;
      
    case 'Forall':
    case 'Exists': {
      const renamedBody = f.variable === oldVar 
        ? f.body // Don't rename if it's the bound variable itself
        : renameVariableInFormula(f.body, oldVar, newVar);
      return {
        ...f,
        variable: f.variable === oldVar ? newVar : f.variable,
        body: renamedBody
      };
    }
    
    case 'Implies':
      return {
        ...f,
        left: renameVariableInFormula(f.left, oldVar, newVar),
        right: renameVariableInFormula(f.right, oldVar, newVar)
      };
      
    case 'And':
    case 'Or':
      return {
        ...f,
        left: renameVariableInFormula(f.left, oldVar, newVar),
        right: renameVariableInFormula(f.right, oldVar, newVar)
      };
      
    case 'Not':
    case 'Paren':
      return {
        ...f,
        inner: renameVariableInFormula(f.inner, oldVar, newVar)
      };
      
    case 'Predicate':
      return {
        ...f,
        args: f.args.map(arg => renameVariableInTerm(arg, oldVar, newVar))
      };
      
    case 'True':
    case 'False':
      return f;
  }
}

function renameBoundVariableInFormula(f: FormulaNode, oldVar: string, newVar: string): FormulaNode {
  switch (f.kind) {
    case 'Var':
    case 'True':
    case 'False':
      return f;
    case 'Predicate':
      return {
        ...f,
        args: f.args.map((arg) => renameVariableInTerm(arg, oldVar, newVar))
      };
    case 'Implies':
    case 'And':
    case 'Or':
      return {
        ...f,
        left: renameBoundVariableInFormula(f.left, oldVar, newVar),
        right: renameBoundVariableInFormula(f.right, oldVar, newVar)
      };
    case 'Not':
    case 'Paren':
      return {
        ...f,
        inner: renameBoundVariableInFormula(f.inner, oldVar, newVar)
      };
    case 'Forall':
    case 'Exists':
      if (f.variable === oldVar) {
        return {
          ...f,
          variable: newVar,
          body: renameBoundVariableInFormula(f.body, oldVar, newVar)
        };
      }
      return {
        ...f,
        body: renameBoundVariableInFormula(f.body, oldVar, newVar)
      };
    default:
      return f;
  }
}

/**
 * Rename a variable in a term.
 */
function renameVariableInTerm(t: TermNode, oldVar: string, newVar: string): TermNode {
  switch (t.kind) {
    case 'TermVar':
      return t.name === oldVar ? { ...t, name: newVar } : t;
      
    case 'TermConst':
      return t;
      
    case 'TermFunc':
      return {
        ...t,
        args: t.args.map(arg => renameVariableInTerm(arg, oldVar, newVar))
      };
  }
}

/**
 * Generate a fresh variable name that doesn't conflict with existing variables.
 */
function generateFreshVar(base: string, existing: Set<string>): string {
  let suffix = 0;
  let candidate = `${base}${suffix}`;
  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

