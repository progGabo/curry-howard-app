import { FormulaNode } from './formula-node';

export interface NdJudgement {
  context: FormulaNode[];
  goal: FormulaNode;
}
