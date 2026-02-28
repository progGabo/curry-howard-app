import { NdJudgement } from './nd-judgement';
import { NdBranchStatus, NdDischarge, NdHypothesis } from './nd-hypothesis';
import { NdRule } from './nd-rule';
import { TermNode } from './formula-node';

export interface NdQuantifierMeta {
  binderVariable?: string;
  instantiationTerm?: TermNode;
  eigenVariable?: string;
  sideCondition?: 'fresh';
}

export interface NdNode {
  id: string;
  rule: NdRule;
  judgement: NdJudgement;
  premises: NdNode[];
  openHypotheses: NdHypothesis[];
  discharges: NdDischarge[];
  branchStatus: NdBranchStatus;
  quantifierMeta?: NdQuantifierMeta;
  formulaLatex?: string;
  assumptionsLatex?: string;
  ui?: {
    selected: boolean;
    expanded: boolean;
    userEdited?: boolean;
  };
}
