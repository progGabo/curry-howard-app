import { FormulaNode, TermNode } from './formula-node';

export type NdRule =
  | 'Ax'
  | '⊤I'
  | '⊥E1'
  | '¬I'
  | '¬E'
  | '∧I'
  | '∧E1'
  | '∧E2'
  | '∨I1'
  | '∨I2'
  | '∨E'
  | '→I'
  | '→E'
  | '∀I'
  | '∀E'
  | '∃I'
  | '∃E'
  | '∅';

export interface NdRuleSpec {
  rule: NdRule;
  group: 'intro' | 'elim' | 'special';
  premiseCount: number;
  introducesHypothesis?: boolean;
  dischargesHypothesis?: boolean;
}

export interface NdRuleApplicationOptions {
  termInput?: string;
  eigenVariable?: string;
  instantiationTerm?: TermNode;
  freeFormula?: FormulaNode;
}
