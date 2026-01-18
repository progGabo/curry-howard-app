export interface ProofNode {
  rule: string;
  conclusion: string;
  lambda?: string;
  children?: ProofNode[] | null;
}