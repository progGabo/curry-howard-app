import { Injectable } from '@angular/core';

export interface RuleFormula {
  name: string;
  formula: string;
  description?: string;
  type: 'conclusion' | 'assumption' | 'special' | 'basic' | 'other';
}

@Injectable({
  providedIn: 'root'
})
export class RuleFormulaService {
  private rulFormulasEN: Record<string, RuleFormula> = {
    'id': {
      name: 'ID (Identity)',
      formula: '\\frac{}{\\Gamma, \\varphi \\vdash \\varphi}\\; (ID)',
      description: 'Identity rule',
      type: 'special'
    },
    'cut': {
      name: 'cut (Cut)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\varphi, \\Delta \\vdash \\psi}{\\Gamma, \\Delta \\vdash \\psi}\\; (cut)',
      description: 'Cut rule',
      type: 'special'
    },
    '→R': {
      name: '→R (Implication Right)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash \\psi}{\\Gamma \\vdash \\varphi \\Rightarrow \\psi}\\; (⇒R)',
      description: 'Introduce implication on the right side',
      type: 'conclusion'
    },
    '∧R': {
      name: '∧R (Conjunction Right)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\Gamma \\vdash \\psi}{\\Gamma \\vdash \\varphi \\land \\psi}\\; (∧R)',
      description: 'Introduce conjunction on the right side',
      type: 'conclusion'
    },
    '∨R1': {
      name: '∨R1 (Disjunction Right 1)',
      formula: '\\frac{\\Gamma \\vdash \\varphi}{\\Gamma \\vdash \\varphi \\lor \\psi}\\; (∨R1)',
      description: 'Introduce disjunction on the right side (left disjunct)',
      type: 'conclusion'
    },
    '∨R2': {
      name: '∨R2 (Disjunction Right 2)',
      formula: '\\frac{\\Gamma \\vdash \\psi}{\\Gamma \\vdash \\varphi \\lor \\psi}\\; (∨R2)',
      description: 'Introduce disjunction on the right side (right disjunct)',
      type: 'conclusion'
    },
    '¬R': {
      name: '¬R (Negation Right)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash \\bot}{\\Gamma \\vdash \\neg \\varphi}\\; (¬R)',
      description: 'Introduce negation on the right side',
      type: 'conclusion'
    },
    '∀R': {
      name: '∀R (Forall Right)',
      formula: '\\frac{\\Gamma \\vdash \\varphi[y/x]}{\\Gamma \\vdash (\\forall x)\\varphi}\\; (∀R)',
      description: 'Introduce universal quantifier (y must be fresh/new)',
      type: 'conclusion'
    },
    '∃R': {
      name: '∃R (Exists Right)',
      formula: '\\frac{\\Gamma \\vdash \\varphi[t/x]}{\\Gamma \\vdash (\\exists x)\\varphi}\\; (∃R)',
      description: 'Introduce existential quantifier',
      type: 'conclusion'
    },
    // Assumption rules
    '→L': {
      name: '→L (Implication Left)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\Delta, \\psi \\vdash \\theta}{\\Gamma, \\Delta, \\varphi \\Rightarrow \\psi \\vdash \\theta}\\; (⇒L)',
      description: 'Eliminate implication on the left side',
      type: 'assumption'
    },
    '∧L1': {
      name: '∧L1 (Conjunction Left 1)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash A}{\\Gamma, \\varphi \\land \\psi \\vdash A}\\; (∧L1)',
      description: 'Eliminate conjunction on the left side (left conjunct)',
      type: 'assumption'
    },
    '∧L2': {
      name: '∧L2 (Conjunction Left 2)',
      formula: '\\frac{\\Gamma, \\psi \\vdash A}{\\Gamma, \\varphi \\land \\psi \\vdash A}\\; (∧L2)',
      description: 'Eliminate conjunction on the left side (right conjunct)',
      type: 'assumption'
    },
    '∨L': {
      name: '∨L (Disjunction Left)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash A \\quad \\Gamma, \\psi \\vdash A}{\\Gamma, \\varphi \\lor \\psi \\vdash A}\\; (∨L)',
      description: 'Eliminate disjunction on the left side',
      type: 'assumption'
    },
    '¬L': {
      name: '¬L (Negation Left)',
      formula: '\\frac{\\Gamma \\vdash \\varphi}{\\Gamma, \\neg \\varphi \\vdash A}\\; (¬L)',
      description: 'Eliminate negation on the left side',
      type: 'assumption'
    },
    '∀L': {
      name: '∀L (Forall Left)',
      formula: '\\frac{\\Gamma, \\varphi[t/x] \\vdash A}{\\Gamma, (\\forall x)\\varphi \\vdash A}\\; (∀L)',
      description: 'Instantiate universal quantifier',
      type: 'assumption'
    },
    '∃L': {
      name: '∃L (Exists Left)',
      formula: '\\frac{\\Gamma, \\varphi[y/x] \\vdash A}{\\Gamma, (\\exists x)\\varphi \\vdash A}\\; (∃L)',
      description: 'Eliminate existential quantifier (y must be fresh/new)',
      type: 'assumption'
    },
    // Special rules
    'WL': {
      name: 'WL (Weakening Left)',
      formula: '\\frac{\\Gamma \\vdash A}{\\Gamma, \\varphi \\vdash A}\\; (WL)',
      description: 'Add an extra assumption formula.',
      type: 'special'
    },
    'Ax': {
      name: 'Ax (Axiom)',
      formula: '\\frac{}{p \\vdash p}\\; (Ax)',
      description: 'Axiom rule',
      type: 'special'
    },
    'Hyp': {
      name: 'Hyp (Hypothesis)',
      formula: '\\frac{}{A}\\;\\text{(assumption)}',
      description: 'Hypothesis rule',
      type: 'special'
    },
    '⊤I': {
      name: '⊤I (Truth Introduction)',
      formula: '\\frac{}{\\top}\\; (\\top I)',
      description: 'Introduce truth',
      type: 'conclusion'
    },
    '⊥E1': {
      name: '⊥E1 (Explosion 1)',
      formula: '\\frac{\\bot}{\\varphi}\\; (\\bot E1)',
      description: 'Explosion from falsity',
      type: 'assumption'
    },
    '¬I': {
      name: '¬I (Negation Introduction)',
      formula: '\\frac{\\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\bot\\end{array}}{\\neg \\varphi}\\; (\\neg I)',
      description: 'Negation introduction by contradiction',
      type: 'conclusion'
    },
    '¬E': {
      name: '¬E (Negation Elimination)',
      formula: '\\frac{\\varphi \\quad \\neg \\varphi}{\\bot}\\; (\\neg E)',
      description: 'Negation elimination',
      type: 'assumption'
    },
    '∧I': {
      name: '∧I (Conjunction Introduction)',
      formula: '\\frac{\\varphi \\quad \\psi}{\\varphi \\wedge \\psi}\\; (\\land I)',
      description: 'Conjunction introduction',
      type: 'conclusion'
    },
    '∧E1': {
      name: '∧E1 (Conjunction Elimination 1)',
      formula: '\\frac{\\varphi \\wedge \\psi}{\\varphi}\\; (\\land E1)',
      description: 'Conjunction elimination (left)',
      type: 'assumption'
    },
    '∧E2': {
      name: '∧E2 (Conjunction Elimination 2)',
      formula: '\\frac{\\varphi \\wedge \\psi}{\\psi}\\; (\\land E2)',
      description: 'Conjunction elimination (right)',
      type: 'assumption'
    },
    '∨I1': {
      name: '∨I1 (Disjunction Introduction 1)',
      formula: '\\frac{\\varphi}{\\varphi \\vee \\psi}\\; (\\vee I1)',
      description: 'Disjunction introduction (left)',
      type: 'conclusion'
    },
    '∨I2': {
      name: '∨I2 (Disjunction Introduction 2)',
      formula: '\\frac{\\psi}{\\varphi \\vee \\psi}\\; (\\vee I2)',
      description: 'Disjunction introduction (right)',
      type: 'conclusion'
    },
    '∨E': {
      name: '∨E (Disjunction Elimination)',
      formula: '\\frac{\\varphi \\vee \\psi \\quad \\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\theta\\end{array} \\quad \\begin{array}{c}[\\psi]\\\\ \\vdots \\\\ \\theta\\end{array}}{\\theta}\\; (\\vee E)',
      description: 'Disjunction elimination',
      type: 'assumption'
    },
    '→I': {
      name: '→I (Implication Introduction)',
      formula: '\\frac{\\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\psi\\end{array}}{\\varphi \\Rightarrow \\psi}\\; (\\Rightarrow I)',
      description: 'Implication introduction',
      type: 'conclusion'
    },
    '→E': {
      name: '→E (Implication Elimination)',
      formula: '\\frac{\\varphi \\quad \\varphi \\Rightarrow \\psi}{\\psi}\\; (\\Rightarrow E)',
      description: 'Implication elimination (modus ponens)',
      type: 'assumption'
    },
    '∀I': {
      name: '∀I (Universal Introduction)',
      formula: '\\frac{\\varphi[t/x]}{(\\forall x)\\varphi}\\; (\\forall I)\\;\\; t\\;fresh',
      description: 'Universal introduction',
      type: 'conclusion'
    },
    '∀E': {
      name: '∀E (Universal Elimination)',
      formula: '\\frac{(\\forall x)\\varphi}{\\varphi[t/x]}\\; (\\forall E)',
      description: 'Universal elimination',
      type: 'assumption'
    },
    '∃I': {
      name: '∃I (Existential Introduction)',
      formula: '\\frac{\\varphi[t/x]}{(\\exists x)\\varphi}\\; (\\exists I)',
      description: 'Existential introduction',
      type: 'conclusion'
    },
    '∃E': {
      name: '∃E (Existential Elimination)',
      formula: '\\frac{(\\exists x)\\varphi \\quad \\begin{array}{c}[\\varphi[t/x]]\\\\ \\vdots \\\\ \\psi\\end{array}}{\\psi}\\; (\\exists E)\\;\\; t\\;fresh',
      description: 'Existential elimination',
      type: 'assumption'
    },
    'Var': {
      name: 'Var (Variable)',
      formula: '\\frac{x : \\tau \\in \\Gamma}{\\Gamma \\vdash x : \\tau}',
      description: 'Variable type inference',
      type: 'basic'
    },
    'Abs': {
      name: 'Abs (Abstraction)',
      formula: '\\frac{\\Gamma, x : \\tau_1 \\vdash e : \\tau_2}{\\Gamma \\vdash \\lambda x:\\tau_1. e : \\tau_1 \\to \\tau_2}',
      description: 'Lambda abstraction',
      type: 'other'
    },
    'App': {
      name: 'App (Application)',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau_1 \\to \\tau_2 \\quad \\Gamma \\vdash e_2 : \\tau_1}{\\Gamma \\vdash e_1\\,e_2 : \\tau_2}',
      description: 'Function application',
      type: 'other'
    },
    'Pair': {
      name: 'Pair',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau_1 \\quad \\Gamma \\vdash e_2 : \\tau_2}{\\Gamma \\vdash \\langle e_1, e_2 \\rangle : \\tau_1 \\times \\tau_2}',
      description: 'Pair construction',
      type: 'other'
    },
    'Fst': {
      name: 'Fst',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2}{\\Gamma \\vdash \\mathrm{fst}(e) : \\tau_1}',
      description: 'First projection',
      type: 'other'
    },
    'Snd': {
      name: 'Snd',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2}{\\Gamma \\vdash \\mathrm{snd}(e) : \\tau_2}',
      description: 'Second projection',
      type: 'other'
    },
    'LetPair': {
      name: 'LetPair',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2 \\quad \\Gamma, x:\\tau_1, y:\\tau_2 \\vdash e\\prime : \\tau}{\\Gamma \\vdash \\text{let} \\langle x,y\\rangle = e \\text{ in } e\\prime : \\tau}',
      description: 'Pair pattern matching',
      type: 'other'
    },
    'DependentAbs': {
      name: 'DependentAbs',
      formula: '\\frac{\\Gamma, x : \\tau \\vdash e : P(x)}{\\Gamma \\vdash \\lambda x:\\tau. e : \\forall x:\\tau. P(x)}',
      description: 'Dependent abstraction',
      type: 'other'
    },
    'DependentPair': {
      name: 'DependentPair',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau \\quad \\Gamma \\vdash e_2 : P(e_1)}{\\Gamma \\vdash \\langle e_1, e_2 \\rangle : \\exists x:\\tau.\\, P(x)}',
      description: 'Dependent pair',
      type: 'other'
    },
    'LetDependentPair': {
      name: 'LetDependentPair',
      formula: '\\frac{\\Gamma \\vdash e : \\exists x:\\tau.\\, P(x) \\quad \\Gamma, x:\\tau, p:P(x) \\vdash e\\prime : Q(x,p)}{\\Gamma \\vdash \\text{let}\\, \\langle x,p\\rangle = e\\, \\text{in}\\, e\\prime : Q(\\mathrm{fst}(e),\\mathrm{snd}(e))}',
      description: 'Dependent pair elimination',
      type: 'other'
    },
    'Inl': {
      name: 'Inl (Inject Left)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1}{\\Gamma \\vdash \\text{inl} \\, e : \\tau_1 + \\tau_2}',
      description: 'Left injection',
      type: 'other'
    },
    'Inr': {
      name: 'Inr (Inject Right)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_2}{\\Gamma \\vdash \\text{inr} \\, e : \\tau_1 + \\tau_2}',
      description: 'Right injection',
      type: 'other'
    },
    'Case': {
      name: 'Case',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 + \\tau_2 \\quad \\Gamma, x:\\tau_1 \\vdash e_1 : \\tau \\quad \\Gamma, y:\\tau_2 \\vdash e_2 : \\tau}{\\Gamma \\vdash \\text{case}\\, e \\text{ of } (\\text{inl}\\,x \\to e_1 \\mid \\text{inr}\\,y \\to e_2) : \\tau}',
      description: 'Case analysis on sum',
      type: 'other'
    },
    'Let': {
      name: 'Let (Local binding)',
      formula: '\\frac{\\Gamma \\vdash t_1 : T_1 \\qquad \\Gamma, x : \\mathrm{gen}(\\Gamma,T_1) \\vdash t_2 : T_2}{\\Gamma \\vdash \\mathrm{let}\\; x = t_1\\; \\mathrm{in}\\; t_2 : T_2}',
      description: 'Local variable binding',
      type: 'other'
    }
  };

  private ruleFormulasSK: Record<string, RuleFormula> = {
    'id': {
      name: 'ID (Identita)',
      formula: '\\frac{}{\\Gamma, \\varphi \\vdash \\varphi}\\; (ID)',
      description: 'Pravidlo identity',
      type: 'special'
    },
    'cut': {
      name: 'cut (Rez)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\varphi, \\Delta \\vdash \\psi}{\\Gamma, \\Delta \\vdash \\psi}\\; (cut)',
      description: 'Pravidlo rezu',
      type: 'special'
    },
    '→R': {
      name: '→R (Implikácia vpravo)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash \\psi}{\\Gamma \\vdash \\varphi \\Rightarrow \\psi}\\; (⇒R)',
      description: 'Reprezentácia implikácie na pravej strane',
      type: 'conclusion'
    },
    '∧R': {
      name: '∧R (Konjunkcia vpravo)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\Gamma \\vdash \\psi}{\\Gamma \\vdash \\varphi \\land \\psi}\\; (∧R)',
      description: 'Reprezentácia konjunkcie na pravej strane',
      type: 'conclusion'
    },
    '∨R1': {
      name: '∨R1 (Disjunkcia vpravo 1)',
      formula: '\\frac{\\Gamma \\vdash \\varphi}{\\Gamma \\vdash \\varphi \\lor \\psi}\\; (∨R1)',
      description: 'Reprezentácia disjunkcie na pravej strane (ľavý disjunkt)',
      type: 'conclusion'
    },
    '∨R2': {
      name: '∨R2 (Disjunkcia vpravo 2)',
      formula: '\\frac{\\Gamma \\vdash \\psi}{\\Gamma \\vdash \\varphi \\lor \\psi}\\; (∨R2)',
      description: 'Reprezentácia disjunkcie na pravej strane (pravý disjunkt)',
      type: 'conclusion'
    },
    '¬R': {
      name: '¬R (Negácia vpravo)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash \\bot}{\\Gamma \\vdash \\neg \\varphi}\\; (¬R)',
      description: 'Reprezentácia negácie na pravej strane',
      type: 'conclusion'
    },
    '∀R': {
      name: '∀R (Všetkých vpravo)',
      formula: '\\frac{\\Gamma \\vdash \\varphi[y/x]}{\\Gamma \\vdash (\\forall x)\\varphi}\\; (∀R)',
      description: 'Reprezentácia univerzálneho kvantifikátora',
      type: 'conclusion'
    },
    '∃R': {
      name: '∃R (Existuje vpravo)',
      formula: '\\frac{\\Gamma \\vdash \\varphi[t/x]}{\\Gamma \\vdash (\\exists x)\\varphi}\\; (∃R)',
      description: 'Reprezentácia existenciálneho kvantifikátora',
      type: 'conclusion'
    },
    '→L': {
      name: '→L (Implikácia vľavo)',
      formula: '\\frac{\\Gamma \\vdash \\varphi \\quad \\Delta, \\psi \\vdash \\theta}{\\Gamma, \\Delta, \\varphi \\Rightarrow \\psi \\vdash \\theta}\\; (⇒L)',
      description: 'Eliminácia implikácie na ľavej strane',
      type: 'assumption'
    },
    '∧L1': {
      name: '∧L1 (Konjunkcia vľavo 1)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash A}{\\Gamma, \\varphi \\land \\psi \\vdash A}\\; (∧L1)',
      description: 'Eliminácia konjunkcie na ľavej strane (ľavá zložka)',
      type: 'assumption'
    },
    '∧L2': {
      name: '∧L2 (Konjunkcia vľavo 2)',
      formula: '\\frac{\\Gamma, \\psi \\vdash A}{\\Gamma, \\varphi \\land \\psi \\vdash A}\\; (∧L2)',
      description: 'Eliminácia konjunkcie na ľavej strane (pravá zložka)',
      type: 'assumption'
    },
    '∨L': {
      name: '∨L (Disjunkcia vľavo)',
      formula: '\\frac{\\Gamma, \\varphi \\vdash A \\quad \\Gamma, \\psi \\vdash A}{\\Gamma, \\varphi \\lor \\psi \\vdash A}\\; (∨L)',
      description: 'Eliminácia disjunkcie na ľavej strane',
      type: 'assumption'
    },
    '¬L': {
      name: '¬L (Negácia vľavo)',
      formula: '\\frac{\\Gamma \\vdash \\varphi}{\\Gamma, \\neg \\varphi \\vdash A}\\; (¬L)',
      description: 'Eliminácia negácie na ľavej strane',
      type: 'assumption'
    },
    '∀L': {
      name: '∀L (Všetkých vľavo)',
      formula: '\\frac{\\Gamma, \\varphi[t/x] \\vdash A}{\\Gamma, (\\forall x)\\varphi \\vdash A}\\; (∀L)',
      description: 'Inštancia univerzálneho kvantifikátora',
      type: 'assumption'
    },
    '∃L': {
      name: '∃L (Existuje vľavo)',
      formula: '\\frac{\\Gamma, \\varphi[y/x] \\vdash A}{\\Gamma, (\\exists x)\\varphi \\vdash A}\\; (∃L)',
      description: 'Eliminácia existenciálneho kvantifikátora',
      type: 'assumption'
    },
    'WL': {
      name: 'WL (Zoslabenie vľavo)',
      formula: '\\frac{\\Gamma \\vdash A}{\\Gamma, \\varphi \\vdash A}\\; (WL)',
      description: 'Pridaj ďalší predpoklad.',
      type: 'special'
    },
    'Ax': {
      name: 'Ax (Axióma)',
      formula: '\\frac{\\Gamma, p, q \\vdash \\Delta}{\\Gamma, p \\land q \\vdash \\Delta}\\; (\\land L)',
      description: 'Axióm pravidlo',
      type: 'special'
    },
    'Hyp': {
      name: 'Hyp (Hypotéza)',
      formula: '\\frac{}{A}\\;\\text{(predpoklad)}',
      description: 'Pravidlo hypotézy',
      type: 'special'
    },
    '⊤I': {
      name: '⊤I (Zavedenie pravdy)',
      formula: '\\frac{}{\\top}\\; (⊤I)',
      description: 'Zavedenie pravdy',
      type: 'conclusion'
    },
    '⊥E1': {
      name: '⊥E1 (Eliminácia sporu 1)',
      formula: '\\frac{\\bot}{\\varphi}\\; (⊥E1)',
      description: 'Odvodenie formuly zo sporu',
      type: 'assumption'
    },
    '¬I': {
      name: '¬I (Zavedenie negácie)',
      formula: '\\frac{\\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\bot\\end{array}}{\\neg \\varphi}\\; (¬I)',
      description: 'Zavedenie negácie sporom',
      type: 'conclusion'
    },
    '¬E': {
      name: '¬E (Eliminácia negácie)',
      formula: '\\frac{\\varphi \\quad \\neg \\varphi}{\\bot}\\; (¬E)',
      description: 'Eliminácia negácie',
      type: 'assumption'
    },
    '∧I': {
      name: '∧I (Zavedenie konjunkcie)',
      formula: '\\frac{\\varphi \\quad \\psi}{\\varphi \\wedge \\psi}\\; (∧I)',
      description: 'Zavedenie konjunkcie',
      type: 'conclusion'
    },
    '∧E1': {
      name: '∧E1 (Eliminácia konjunkcie 1)',
      formula: '\\frac{\\varphi \\wedge \\psi}{\\varphi}\\; (∧E1)',
      description: 'Eliminácia konjunkcie (ľavá zložka)',
      type: 'assumption'
    },
    '∧E2': {
      name: '∧E2 (Eliminácia konjunkcie 2)',
      formula: '\\frac{\\varphi \\wedge \\psi}{\\psi}\\; (∧E2)',
      description: 'Eliminácia konjunkcie (pravá zložka)',
      type: 'assumption'
    },
    '∨I1': {
      name: '∨I1 (Zavedenie disjunkcie 1)',
      formula: '\\frac{\\varphi}{\\varphi \\vee \\psi}\\; (∨I1)',
      description: 'Zavedenie disjunkcie (ľavá strana)',
      type: 'conclusion'
    },
    '∨I2': {
      name: '∨I2 (Zavedenie disjunkcie 2)',
      formula: '\\frac{\\psi}{\\varphi \\vee \\psi}\\; (∨I2)',
      description: 'Zavedenie disjunkcie (pravá strana)',
      type: 'conclusion'
    },
    '∨E': {
      name: '∨E (Eliminácia disjunkcie)',
      formula: '\\frac{\\varphi \\vee \\psi \\quad \\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\theta\\end{array} \\quad \\begin{array}{c}[\\psi]\\\\ \\vdots \\\\ \\theta\\end{array}}{\\theta}\\; (∨E)',
      description: 'Eliminácia disjunkcie',
      type: 'assumption'
    },
    '→I': {
      name: '→I (Zavedenie implikácie)',
      formula: '\\frac{\\begin{array}{c}[\\varphi]\\\\ \\vdots \\\\ \\psi\\end{array}}{\\varphi \\Rightarrow \\psi}\\; (→I)',
      description: 'Zavedenie implikácie',
      type: 'conclusion'
    },
    '→E': {
      name: '→E (Eliminácia implikácie)',
      formula: '\\frac{\\varphi \\quad \\varphi \\Rightarrow \\psi}{\\psi}\\; (→E)',
      description: 'Eliminácia implikácie (modus ponens)',
      type: 'assumption'
    },
    '∀I': {
      name: '∀I (Zavedenie univerzálu)',
      formula: '\\frac{\\varphi[t/x]}{(\\forall x)\\varphi}\\; (∀I)\\;\\; t\\;fresh',
      description: 'Zavedenie univerzálneho kvantifikátora',
      type: 'conclusion'
    },
    '∀E': {
      name: '∀E (Eliminácia univerzálu)',
      formula: '\\frac{(\\forall x)\\varphi}{\\varphi[t/x]}\\; (∀E)',
      description: 'Eliminácia univerzálneho kvantifikátora',
      type: 'assumption'
    },
    '∃I': {
      name: '∃I (Zavedenie existenciálu)',
      formula: '\\frac{\\varphi[t/x]}{(\\exists x)\\varphi}\\; (∃I)',
      description: 'Zavedenie existenčného kvantifikátora',
      type: 'conclusion'
    },
    '∃E': {
      name: '∃E (Eliminácia existenciálu)',
      formula: '\\frac{(\\exists x)\\varphi \\quad \\begin{array}{c}[\\varphi[t/x]]\\\\ \\vdots \\\\ \\psi\\end{array}}{\\psi}\\; (∃E)\\;\\; t\\;fresh',
      description: 'Eliminácia existenčného kvantifikátora',
      type: 'assumption'
    },
    'Var': {
      name: 'Var (Premenná)',
      formula: '\\frac{x : \\tau \\in \\Gamma}{\\Gamma \\vdash x : \\tau}',
      description: 'Odvodenie typu premennej',
      type: 'basic'
    },
    'Abs': {
      name: 'Abs (Abstrakcia)',
      formula: '\\frac{\\Gamma, x : \\tau_1 \\vdash e : \\tau_2}{\\Gamma \\vdash \\lambda x:\\tau_1. e : \\tau_1 \\to \\tau_2}',
      description: 'Lambda abstrakcia',
      type: 'other'
    },
    'App': {
      name: 'App (Aplikácia)',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau_1 \\to \\tau_2 \\quad \\Gamma \\vdash e_2 : \\tau_1}{\\Gamma \\vdash e_1\\,e_2 : \\tau_2}',
      description: 'Aplikácia funkcie',
      type: 'other'
    },
    'Pair': {
      name: 'Pair (Pár)',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau_1 \\quad \\Gamma \\vdash e_2 : \\tau_2}{\\Gamma \\vdash \\langle e_1, e_2 \\rangle : \\tau_1 \\times \\tau_2}',
      description: 'Konštrukcia páru',
      type: 'other'
    },
    'Fst': {
      name: 'Fst (Prvá projekcia)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2}{\\Gamma \\vdash \\mathrm{fst}(e) : \\tau_1}',
      description: 'Prvá projekcia páru',
      type: 'other'
    },
    'Snd': {
      name: 'Snd (Druhá projekcia)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2}{\\Gamma \\vdash \\mathrm{snd}(e) : \\tau_2}',
      description: 'Druhá projekcia páru',
      type: 'other'
    },
    'LetPair': {
      name: 'LetPair (Pár rozklad)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 \\times \\tau_2 \\quad \\Gamma, x:\\tau_1, y:\\tau_2 \\vdash e\\prime : \\tau}{\\Gamma \\vdash \\text{let} \\langle x,y\\rangle = e \\text{ in } e\\prime : \\tau}',
      description: 'Rozklad páru pomocou vzorov',
      type: 'other'
    },
    'DependentAbs': {
      name: 'DependentAbs',
      formula: '\\frac{\\Gamma, x : \\tau \\vdash e : P(x)}{\\Gamma \\vdash \\lambda x:\\tau. e : \\forall x:\\tau. P(x)}',
      description: 'Závislá abstrakcia',
      type: 'other'
    },
    'DependentPair': {
      name: 'DependentPair',
      formula: '\\frac{\\Gamma \\vdash e_1 : \\tau \\quad \\Gamma \\vdash e_2 : P(e_1)}{\\Gamma \\vdash \\langle e_1, e_2 \\rangle : \\exists x:\\tau.\\, P(x)}',
      description: 'Závislý pár',
      type: 'other'
    },
    'LetDependentPair': {
      name: 'LetDependentPair',
      formula: '\\frac{\\Gamma \\vdash e : \\exists x:\\tau.\\, P(x) \\quad \\Gamma, x:\\tau, p:P(x) \\vdash e\\prime : Q(x,p)}{\\Gamma \\vdash \\text{let}\\, \\langle x,p\\rangle = e\\, \\text{in}\\, e\\prime : Q(\\mathrm{fst}(e),\\mathrm{snd}(e))}',
      description: 'Eliminácia závislého páru',
      type: 'other'
    },
    'Inl': {
      name: 'Inl (Ľavá injekcia)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1}{\\Gamma \\vdash \\text{inl} \\, e : \\tau_1 + \\tau_2}',
      description: 'Ľavá injekcia',
      type: 'other'
    },
    'Inr': {
      name: 'Inr (Pravá injekcia)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_2}{\\Gamma \\vdash \\text{inr} \\, e : \\tau_1 + \\tau_2}',
      description: 'Pravá injekcia',
      type: 'other'
    },
    'Case': {
      name: 'Case (Prípad)',
      formula: '\\frac{\\Gamma \\vdash e : \\tau_1 + \\tau_2 \\quad \\Gamma, x:\\tau_1 \\vdash e_1 : \\tau \\quad \\Gamma, y:\\tau_2 \\vdash e_2 : \\tau}{\\Gamma \\vdash \\text{case}\\, e \\text{ of } (\\text{inl}\\,x \\to e_1 \\mid \\text{inr}\\,y \\to e_2) : \\tau}',
      description: 'Analýza prípadov na sume',
      type: 'other'
    },
    'Let': {
      name: 'Let (Lokálne viazanie)',
      formula: '\\frac{\\Gamma \\vdash t_1 : T_1 \\qquad \\Gamma, x : \\mathrm{gen}(\\Gamma,T_1) \\vdash t_2 : T_2}{\\Gamma \\vdash \\mathrm{let}\\; x = t_1\\; \\mathrm{in}\\; t_2 : T_2}',
      description: 'Lokálne viazanie premennej',
      type: 'other'
    }
  };

  getFormula(ruleName: string, language: 'en' | 'sk'): RuleFormula | null {
    const formulas = language === 'sk' ? this.ruleFormulasSK : this.rulFormulasEN;
    return formulas[ruleName] || null;
  }

  getAllFormulas(language: 'en' | 'sk'): Record<string, RuleFormula> {
    return language === 'sk' ? this.ruleFormulasSK : this.rulFormulasEN;
  }
}
