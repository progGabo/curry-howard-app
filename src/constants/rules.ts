/**
 * Centralized rule names for proof tree and type inference tree.
 * Single source of truth used by App, proof-tree, and type-inference-tree.
 */

/** Conclusion rules for sequent calculus (right side) */
export const CONCLUSION_RULES = ['→R', '∧R', '∨R1', '∨R2', '¬R', '∀R', '∃R'] as const;

/** Assumption rules for sequent calculus (left side) */
export const ASSUMPTION_RULES = ['→L', '∧L1', '∧L2', '∨L', '¬L', '∀L', '∃L'] as const;

/** Special rules (weakening, identity) */
export const SPECIAL_RULES = ['WL', 'id'] as const;

/** Natural deduction introduction rules */
export const ND_INTRO_RULES = ['⊤I', '¬I', '∧I', '∨I1', '∨I2', '→I'] as const;

/** Natural deduction elimination rules */
export const ND_ELIM_RULES = ['⊥E1', '¬E', '∧E1', '∧E2', '∨E', '→E'] as const;

/** Natural deduction quantifier rules */
export const ND_QUANTIFIER_RULES = ['∀I', '∀E', '∃I', '∃E'] as const;

/** Type inference: basic constants */
export const BASIC_RULES = ['Var'] as const;

/** Type inference: abstraction */
export const ABS_RULES = ['Abs'] as const;

/** Type inference: application */
export const APP_RULES = ['App'] as const;

/** Type inference: pairs */
export const PAIR_RULES = ['Pair', 'Fst', 'Snd', 'LetPair'] as const;

/** Type inference: dependent types (∀ / ∃) */
export const DEPENDENT_RULES = ['DependentAbs', 'DependentPair', 'LetDependentPair'] as const;

/** Type inference: sum types */
export const SUM_RULES = ['Inl', 'Inr', 'Case'] as const;

/** Type inference: let binding */
export const LET_RULES = ['Let'] as const;
