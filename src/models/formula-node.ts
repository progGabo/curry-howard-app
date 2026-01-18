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
  | { kind: 'Forall'; variable: string; body: FormulaNode }
  | { kind: 'Exists'; variable: string; body: FormulaNode }
  | { kind: 'Predicate'; name: string; args: TermNode[] };

// Sequent (Γ ⊢ A)
export interface SequentNode {
  assumptions: FormulaNode[];
  conclusions: FormulaNode[];
  // Optional: Direct mapping of assumptions to their lambda variable names
  // This makes lambda generation simpler by avoiding searches
  assumptionVars?: WeakMap<FormulaNode, string>;
}

// Derivation tree node (dôkaz)
export interface DerivationNode {
  rule: string;
  sequent: SequentNode;
  children: DerivationNode[];
  usedFormula?: FormulaNode;
  // Metadata for lambda generation
  metadata?: {
    substitution?: { variable: string; term: TermNode }; // For ∀L, ∃R
    witness?: TermNode; // For ∃R
    branchChoice?: 'left' | 'right'; // For ∨R
    renamedVariable?: { old: string; new: string }; // For freshness
    // Lambda context: maps formulas to their variable names for this node
    // This simplifies lambda generation by providing direct lookups
    formulaToVar?: WeakMap<FormulaNode, string>;
  };
  id?: string;
  ui?: {
    selected: boolean;
    expanded: boolean;
    userEdited?: boolean;
  };
}