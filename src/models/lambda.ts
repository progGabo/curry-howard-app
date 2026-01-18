import { FormulaNode } from "./formula-node";

export type Lambda =
  | { kind: 'Var', name: string }
  | { kind: 'Abs', param: string, paramType: FormulaNode, body: Lambda }
  | { kind: 'App', func: Lambda, arg: Lambda }
  | { kind: 'Pair', fst: Lambda, snd: Lambda }
  | { kind: 'Inl', value: Lambda, type: FormulaNode }
  | { kind: 'Inr', value: Lambda, type: FormulaNode }
  | { kind: 'Case', expr: Lambda, leftCase: [string, Lambda], rightCase: [string, Lambda] }
  | { kind: 'Let', pair: string[], value: Lambda, body: Lambda }
  | { kind: 'Absurd', value: Lambda };