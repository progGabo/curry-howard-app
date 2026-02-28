import { FormulaNode } from './formula-node';

export interface NdHypothesis {
  id: string;
  label: string;
  formula: FormulaNode;
  introducedAtNodeId: string;
  dischargedAtNodeId?: string;
}

export interface NdDischarge {
  hypothesisId: string;
  label: string;
}

export type NdBranchStatus = 'open' | 'closed-hypothesis' | 'stuck';
