import { FormulaNode, TermNode } from '../models/formula-node';
import { TermFactories } from './ast-factories';

export function parseTerm(input: string): TermNode | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const funcMatch = trimmed.match(/^([a-z][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const argsStr = funcMatch[2].trim();
    if (argsStr === '') {
      return TermFactories.func(funcName, []);
    }
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

  const varMatch = trimmed.match(/^[a-z][a-zA-Z0-9_]*$/);
  if (varMatch) {
    return TermFactories.var(varMatch[0]);
  }

  return null;
}

export function collectTerms(formula: FormulaNode): TermNode[] {
  const terms: TermNode[] = [];

  const visitTerm = (term: TermNode): void => {
    terms.push(term);
    if (term.kind === 'TermFunc') {
      for (const arg of term.args) {
        visitTerm(arg);
      }
    }
  };

  const visitFormula = (current: FormulaNode): void => {
    switch (current.kind) {
      case 'Predicate':
        current.args.forEach(visitTerm);
        break;
      case 'Implies':
      case 'And':
      case 'Or':
        visitFormula(current.left);
        visitFormula(current.right);
        break;
      case 'Forall':
      case 'Exists':
        visitFormula(current.body);
        break;
      case 'Not':
      case 'Paren':
        visitFormula(current.inner);
        break;
      default:
        break;
    }
  };

  visitFormula(formula);
  return terms;
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
        if (f.domain) {
          collect(f.domain, bound);
        }
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

export function freeVarsTerm(t: TermNode): Set<string> {
  const freeVars = new Set<string>();
  
  function collect(t: TermNode) {
    switch (t.kind) {
      case 'TermVar':
        freeVars.add(t.name);
        break;
      case 'TermConst':
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
        if (f.domain) {
          visit(f.domain);
        }
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
            domain: formula.domain ? subst(formula.domain) : formula.domain,
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
          domain: formula.domain ? subst(formula.domain) : formula.domain,
          body: substituteFormula(alphaRenamedBody, x, t)
        };
      }
      default:
        return formula;
    }
  };

  return subst(f);
}

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

function renameVariableInFormula(f: FormulaNode, oldVar: string, newVar: string): FormulaNode {
  switch (f.kind) {
    case 'Var':
      return f.name === oldVar ? { ...f, name: newVar } : f;
      
    case 'Forall':
    case 'Exists': {
      const renamedBody = f.variable === oldVar 
        ? f.body
        : renameVariableInFormula(f.body, oldVar, newVar);
      return {
        ...f,
        domain: f.domain ? renameVariableInFormula(f.domain, oldVar, newVar) : f.domain,
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
          domain: f.domain ? renameBoundVariableInFormula(f.domain, oldVar, newVar) : f.domain,
          body: renameBoundVariableInFormula(f.body, oldVar, newVar)
        };
      }
      return {
        ...f,
        domain: f.domain ? renameBoundVariableInFormula(f.domain, oldVar, newVar) : f.domain,
        body: renameBoundVariableInFormula(f.body, oldVar, newVar)
      };
    default:
      return f;
  }
}

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

function generateFreshVar(base: string, existing: Set<string>): string {
  let suffix = 0;
  let candidate = `${base}${suffix}`;
  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

