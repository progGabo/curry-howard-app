// Term (for predicate logic)
export type TermNode =
  | { kind: 'TermVar'; name: string }
  | { kind: 'TermConst'; name: string }
  | { kind: 'TermFunc'; name: string; args: TermNode[] };

// Formula (AST)
export type FormulaNode =
  | { kind: 'Var'; name: string }
  | { kind: 'Implies'; left: FormulaNode; right: FormulaNode }
  | { kind: 'And'; left: FormulaNode; right: FormulaNode }
  | { kind: 'Or'; left: FormulaNode; right: FormulaNode }
  | { kind: 'Not'; inner: FormulaNode }
  | { kind: 'Paren'; inner: FormulaNode }
  | { kind: 'True' }
  | { kind: 'False' }
  | { kind: 'Forall'; variable: string; domain?: FormulaNode; body: FormulaNode }
  | { kind: 'Exists'; variable: string; domain?: FormulaNode; body: FormulaNode }
  | { kind: 'Predicate'; name: string; args: TermNode[] };

// Sequent (Γ ⊢ A)
export interface SequentNode {
  assumptions: FormulaNode[];
  conclusions: FormulaNode[];
  assumptionVars?: WeakMap<FormulaNode, string>;
}

export interface DerivationNode {
  rule: string;
  sequent: SequentNode;
  sequentLatex?: string;
  children: DerivationNode[];
  usedFormula?: FormulaNode;
  metadata?: {
    substitution?: { variable: string; term: TermNode }; 
    witness?: TermNode;
    branchChoice?: 'left' | 'right'; 
    renamedVariable?: { old: string; new: string }; 
    formulaToVar?: WeakMap<FormulaNode, string>;
  };
  id?: string;
  ui?: {
    selected: boolean;
    expanded: boolean;
    userEdited?: boolean;
  };
}