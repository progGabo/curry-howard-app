import { Injectable } from '@angular/core';

/**
 * Centralized UI translations and error messages.
 */

export type AppLanguage = 'sk' | 'en';

export interface AppTranslations {
  // Header
  curryHoward: string;
  proofs: string;
  sequentCalculus: string;
  exprToLambda: string;
  lambdaToExpr: string;
  naturalDeduction: string;
  autoMode: string;
  interactiveMode: string;
  applicableOnly: string;
  allRules: string;
  predictNext: string;
  stepBack: string;
  help: string;
  darkMode: string;
  lightMode: string;
  // App / examples
  examples: string;
  chooseExampleExpr: string;
  chooseExampleLambda: string;
  generateProof: string;
  convertLambda: string;
  lambdaExpression: string;
  exprType: string;
  proofTree: string;
  typeInference: string;
  footerText: string;
  // Help modal
  helpTitle: string;
  close: string;
  // Error messages (used by translate())
  errorRuleCannotBeApplied: string;
  errorRuleCannotBeAppliedToSequent: string;
  errorApplyingRule: string;
  errorParsing: string;
  errorLambdaConversion: string;
  errorCannotApplyRule: string;
  errorFillAllFields: string;
  errorNothingTyped: string;
  errorInvalidSequentFormat: string;
  errorExpectedSequents: string;
  errorExpectedCount: string;
  errorInvalidExpressionAtPosition: string;
  errorIncorrectAtPosition: string;
  errorInvalidQuantifierTerm: string;
  errorQuantifierTermMismatch: string;
  errorQuantifierVariableInvalid: string;
  errorFormulaInvalid: string;
  errorFormulaStructureMismatch: string;
  // Sidebar translations
  ruleReference: string;
  conclusionRules: string;
  assumptionRules: string;
  specialRules: string;
  introRules: string;
  eliminationRules: string;
  quantifierRules: string;
  basicRules: string;
  functions: string;
  pairsAndSums: string;
  dependentTypes: string;
  controlFlow: string;
  naturals: string;
  addRule: string;
  predictSequent: string;
  predictExpression: string;
  predictFormula: string;
  seqIdentityCut: string;
  seqLogicalNegation: string;
  negation: string;
  conjunction: string;
  disjunction: string;
  implication: string;
  quantifiers: string;
  seqWeakening: string;
  constants: string;
  hypotheses: string;
}

export interface QuantifierRuleLabels {
  title: string;
  labelVariable?: string;
  labelTerm?: string;
  placeholder: string;
  btnCancel: string;
  btnConfirm: string;
}

export interface QuantifierErrors {
  empty: string;
  invalidVar: string;
  notFresh: string;
  emptyTerm: string;
}

export interface QuantifierRuntimeErrors {
  dialogOpenFailed: string;
  cancelled: string;
  invalidTerm: string;
  invalidVariable: string;
  notFreshInAssumptions: string;
  notFreshInAssumptionsConclusions: string;
}

const SK: AppTranslations = {
  curryHoward: 'Curry-Howard',
  proofs: 'Dôkazy',
  sequentCalculus: 'Sekventový kalkul',
  exprToLambda: 'Výraz → Lambda',
  lambdaToExpr: 'Lambda → Výraz',
  naturalDeduction: 'Prirodzená dedukcia',
  autoMode: 'Auto',
  interactiveMode: 'Interaktívny',
  applicableOnly: 'Len použiteľné',
  allRules: 'Všetky pravidlá',
  predictNext: 'Predikcia',
  stepBack: 'Krok späť',
  help: 'Pomoc',
  darkMode: 'Tmavý režim',
  lightMode: 'Svetlý režim',
  examples: 'Príklady',
  chooseExampleExpr: 'Vyberte príklad výrazu',
  chooseExampleLambda: 'Vyberte príklad λ',
  generateProof: 'Generovať dôkaz',
  convertLambda: 'Konvertovať',
  lambdaExpression: 'Lambda výraz',
  exprType: 'Typ výrazu',
  proofTree: 'Dôkazový strom',
  typeInference: 'Odvodenie typov',
  footerText: 'Curry-Howard – dôkazový asistent',
  helpTitle: 'Pomoc',
  close: 'Zavrieť',
  errorRuleCannotBeApplied: 'Pravidlo {rule} nie je možné použiť.',
  errorRuleCannotBeAppliedToSequent: 'Pravidlo nie je možné použiť na tento sekvent.',
  errorApplyingRule: 'Chyba pri aplikácii pravidla {rule}: {message}',
  errorParsing: 'Chyba parsovania: ',
  errorLambdaConversion: 'Chyba konverzie λ: ',
  errorCannotApplyRule: 'Pravidlo nie je možné použiť.',
  errorFillAllFields: 'Vyplňte všetky polia.',
  errorNothingTyped: 'Nebol zadaný žiadny vzorec.',
  errorInvalidSequentFormat: 'Neplatný formát sekventu.',
  errorExpectedSequents: 'Očakávaných sekventov: {expected}, zadaných: {got}.',
  errorExpectedCount: 'Očakávaných výrazov: {expected}, zadaných: {got}.',
  errorInvalidExpressionAtPosition: 'Neplatný výraz na pozícii {position}.',
  errorIncorrectAtPosition: 'Nesprávna hodnota na pozícii {position}.',
  errorInvalidQuantifierTerm: 'Neplatný term pre kvantifikačné pravidlo.',
  errorQuantifierTermMismatch: 'Zadaný term/svedok nie je vhodný pre pravidlo {rule} v aktuálnom cieli.',
  errorQuantifierVariableInvalid: 'Zadaná premenná nespĺňa podmienky pravidla {rule} (musí byť čerstvá a platná).',
  errorFormulaInvalid: 'Neplatný formát formuly.',
  errorFormulaStructureMismatch: 'Formula nemá správnu štruktúru pre pravidlo {rule}. Cieľ musí byť na správnej strane.',
  ruleReference: 'Pravidlá',
  conclusionRules: 'Pravidlá pre záver',
  assumptionRules: 'Pravidlá pre predpoklad',
  specialRules: 'Špeciálne pravidlá',
  introRules: 'Zavádzacie pravidlá',
  eliminationRules: 'Eliminačné pravidlá',
  quantifierRules: 'Kvantifikátorové pravidlá',
  basicRules: 'Základné',
  functions: 'Funkcie',
  pairsAndSums: 'Páry a sumy',
  dependentTypes: 'Závislé (∀ / ∃)',
  controlFlow: 'Riadenie toku',
  naturals: 'Prirodzené čísla',
  addRule: 'Pridať pravidlo',
  predictSequent: 'Predikuj sekvent',
  predictExpression: 'Predikuj výraz',
  predictFormula: 'Predikuj formulu',
  seqIdentityCut: 'Pravidlo identity a rezu:',
  seqLogicalNegation: 'Logické pravidlá: Negácia',
  negation: 'Negácia',
  conjunction: 'Konjunkcia',
  disjunction: 'Disjunkcia',
  implication: 'Implikácia',
  quantifiers: 'Kvantifikátory',
  seqWeakening: 'Pravidlá zoslabenia',
  constants: 'Konštanty',
  hypotheses: 'Hypotézy',
};

const EN: AppTranslations = {
  curryHoward: 'Curry-Howard',
  proofs: 'Proofs',
  sequentCalculus: 'Sequent calculus',
  exprToLambda: 'Expression → Lambda',
  lambdaToExpr: 'Lambda → Expression',
  naturalDeduction: 'Natural Deduction',
  autoMode: 'Auto',
  interactiveMode: 'Interactive',
  applicableOnly: 'Applicable only',
  allRules: 'All rules',
  predictNext: 'Predict',
  stepBack: 'Step back',
  help: 'Help',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  examples: 'Examples',
  chooseExampleExpr: 'Choose example expression',
  chooseExampleLambda: 'Choose example λ',
  generateProof: 'Generate proof',
  convertLambda: 'Convert',
  lambdaExpression: 'Lambda expression',
  exprType: 'Expression type',
  proofTree: 'Proof tree',
  typeInference: 'Type inference',
  footerText: 'Curry-Howard – proof assistant',
  helpTitle: 'Help',
  close: 'Close',
  errorRuleCannotBeApplied: 'Rule {rule} cannot be applied.',
  errorRuleCannotBeAppliedToSequent: 'Rule cannot be applied to this sequent.',
  errorApplyingRule: 'Error applying rule {rule}: {message}',
  errorParsing: 'Parsing error: ',
  errorLambdaConversion: 'Lambda conversion error: ',
  errorCannotApplyRule: 'Rule cannot be applied.',
  errorFillAllFields: 'Please fill all fields.',
  errorNothingTyped: 'No formula entered.',
  errorInvalidSequentFormat: 'Invalid sequent format.',
  errorExpectedSequents: 'Expected {expected} sequent(s), got {got}.',
  errorExpectedCount: 'Expected {expected} expression(s), got {got}.',
  errorInvalidExpressionAtPosition: 'Invalid expression at position {position}.',
  errorIncorrectAtPosition: 'Incorrect value at position {position}.',
  errorInvalidQuantifierTerm: 'Invalid term for quantifier rule.',
  errorQuantifierTermMismatch: 'The provided term/witness does not fit rule {rule} for the current goal.',
  errorQuantifierVariableInvalid: 'The provided variable does not satisfy rule {rule} side conditions (fresh and valid).',
  errorFormulaInvalid: 'Invalid formula format.',
  errorFormulaStructureMismatch: 'Formula does not have the correct structure for rule {rule}. The goal must be on the correct side.',
  ruleReference: 'Rules',
  conclusionRules: 'Conclusion Rules',
  assumptionRules: 'Assumption Rules',
  specialRules: 'Special Rules',
  introRules: 'Introduction Rules',
  eliminationRules: 'Elimination Rules',
  quantifierRules: 'Quantifier Rules',
  basicRules: 'Basic',
  functions: 'Functions',
  pairsAndSums: 'Pairs & Sums',
  dependentTypes: 'Dependent (∀ / ∃)',
  controlFlow: 'Control Flow',
  naturals: 'Naturals',
  addRule: 'Add rule',
  predictSequent: 'Predict sequent',
  predictExpression: 'Predict expression',
  predictFormula: 'Predict formula',
  seqIdentityCut: 'Identity and cut rule:',
  seqLogicalNegation: 'Logical rules: Negation',
  negation: 'Negation',
  conjunction: 'Conjunction',
  disjunction: 'Disjunction',
  implication: 'Implication',
  quantifiers: 'Quantifiers',
  seqWeakening: 'Weakening rules',
  constants: 'Constants',
  hypotheses: 'Hypotheses',
};

const QUANTIFIER_LABELS_SK: Record<string, QuantifierRuleLabels> = {
  'forall-right': { title: '∀R – voľná premenná', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'forall-left': { title: '∀L – term', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-right': { title: '∃R – svedok', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-left': { title: '∃L – voľná premenná', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'forall-intro': { title: '∀I – voľná premenná', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'forall-elim': { title: '∀E – term', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-intro': { title: '∃I – svedok', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-elim': { title: '∃E – voľná premenná', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'and-elim1': { title: '∧E1 – celá konjunkcia', labelTerm: 'Formula', placeholder: 'napr. A ∧ B (ľavá = cieľ)', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'and-elim2': { title: '∧E2 – celá konjunkcia', labelTerm: 'Formula', placeholder: 'napr. A ∧ B (pravá = cieľ)', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'impl-elim': { title: '→E – celá implikácia', labelTerm: 'Formula', placeholder: 'napr. A → B (pravá = cieľ)', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'neg-elim': { title: '¬E – formula φ', labelTerm: 'Formula', placeholder: 'napr. A (premisy: A, ¬A)', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
};

const QUANTIFIER_LABELS_EN: Record<string, QuantifierRuleLabels> = {
  'forall-right': { title: '∀R – free variable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'forall-left': { title: '∀L – term', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-right': { title: '∃R – witness', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-left': { title: '∃L – free variable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'forall-intro': { title: '∀I – free variable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'forall-elim': { title: '∀E – term', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-intro': { title: '∃I – witness', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-elim': { title: '∃E – free variable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'and-elim1': { title: '∧E1 – full conjunction', labelTerm: 'Formula', placeholder: 'e.g. A ∧ B (left = goal)', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'and-elim2': { title: '∧E2 – full conjunction', labelTerm: 'Formula', placeholder: 'e.g. A ∧ B (right = goal)', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'impl-elim': { title: '→E – full implication', labelTerm: 'Formula', placeholder: 'e.g. A → B (right = goal)', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'neg-elim': { title: '¬E – formula φ', labelTerm: 'Formula', placeholder: 'e.g. A (premises: A, ¬A)', btnCancel: 'Cancel', btnConfirm: 'OK' },
};

const QUANTIFIER_ERRORS_SK: QuantifierErrors = {
  empty: 'Pole nesmie byť prázdne.',
  invalidVar: 'Neplatná premenná (začnite malým písmenom).',
  notFresh: 'Premenná {var} už bola použitá. Zvoľte inú.',
  emptyTerm: 'Term nesmie byť prázdny.',
};

const QUANTIFIER_ERRORS_EN: QuantifierErrors = {
  empty: 'Field cannot be empty.',
  invalidVar: 'Invalid variable (must start with a lowercase letter).',
  notFresh: 'Variable {var} is already in use. Choose another.',
  emptyTerm: 'Term cannot be empty.',
};

const QUANTIFIER_RUNTIME_ERRORS_SK: QuantifierRuntimeErrors = {
  dialogOpenFailed: 'Nepodarilo sa otvoriť dialóg pre kvantifikátorové pravidlo.',
  cancelled: 'Používateľ zrušil aplikáciu kvantifikátorového pravidla.',
  invalidTerm: 'Neplatný term: {term}. Musí byť premenná, konštanta alebo aplikácia funkcie.',
  invalidVariable: 'Neplatný názov premennej: {var}. Musí byť identifikátor začínajúci malým písmenom.',
  notFreshInAssumptions: 'Premenná {var} nie je čerstvá: vyskytuje sa voľne v predpokladoch.',
  notFreshInAssumptionsConclusions: 'Premenná {var} nie je čerstvá: vyskytuje sa voľne v predpokladoch alebo záveroch.'
};

const QUANTIFIER_RUNTIME_ERRORS_EN: QuantifierRuntimeErrors = {
  dialogOpenFailed: 'Failed to open quantifier input dialog.',
  cancelled: 'User cancelled quantifier rule application.',
  invalidTerm: 'Invalid term: {term}. Must be a variable, constant, or function application.',
  invalidVariable: 'Invalid variable name: {var}. Must be a lowercase identifier.',
  notFreshInAssumptions: 'Variable {var} is not fresh: it occurs free in the assumptions.',
  notFreshInAssumptionsConclusions: 'Variable {var} is not fresh: it occurs free in the assumptions or conclusions.'
};

function interpolate(text: string, params?: { [key: string]: string | number }): string {
  if (!params) return text;
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  t(lang: AppLanguage): AppTranslations {
    return lang === 'sk' ? SK : EN;
  }

  translate(
    lang: AppLanguage,
    key: keyof AppTranslations,
    params?: { [key: string]: string | number }
  ): string {
    const text = (lang === 'sk' ? SK : EN)[key];
    return interpolate(text, params);
  }

  errorSummary(lang: AppLanguage): string {
    return lang === 'sk' ? 'Chyba' : 'Error';
  }

  quantifierRuleLabels(lang: AppLanguage, ruleType: string): QuantifierRuleLabels {
    const map = lang === 'sk' ? QUANTIFIER_LABELS_SK : QUANTIFIER_LABELS_EN;
    return map[ruleType] ?? map['forall-right']!;
  }

  quantifierErrors(lang: AppLanguage): QuantifierErrors {
    return lang === 'sk' ? QUANTIFIER_ERRORS_SK : QUANTIFIER_ERRORS_EN;
  }

  quantifierRuntimeErrors(lang: AppLanguage): QuantifierRuntimeErrors {
    return lang === 'sk' ? QUANTIFIER_RUNTIME_ERRORS_SK : QUANTIFIER_RUNTIME_ERRORS_EN;
  }
}
