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

const SK: AppTranslations = {
  curryHoward: 'Curry-Howard',
  proofs: 'Dôkazy',
  sequentCalculus: 'Sekvenčný kalkul',
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
};

const QUANTIFIER_LABELS_SK: Record<string, QuantifierRuleLabels> = {
  'forall-right': { title: '∀R – eigenvariable', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'forall-left': { title: '∀L – inštancia', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-right': { title: '∃R – svedok', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
  'exists-left': { title: '∃L – eigenvariable', labelVariable: 'Premenná', placeholder: 'napr. x', btnCancel: 'Zrušiť', btnConfirm: 'OK' },
};

const QUANTIFIER_LABELS_EN: Record<string, QuantifierRuleLabels> = {
  'forall-right': { title: '∀R – eigenvariable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'forall-left': { title: '∀L – instantiation', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-right': { title: '∃R – witness', labelTerm: 'Term', placeholder: 'term', btnCancel: 'Cancel', btnConfirm: 'OK' },
  'exists-left': { title: '∃L – eigenvariable', labelVariable: 'Variable', placeholder: 'e.g. x', btnCancel: 'Cancel', btnConfirm: 'OK' },
};

const QUANTIFIER_ERRORS_SK: QuantifierErrors = {
  empty: 'Pole nesmie byť prázdne.',
  invalidVar: 'Neplatná premenná (začnite písmenom).',
  notFresh: 'Premenná {var} už bola použitá. Zvoľte inú.',
  emptyTerm: 'Term nesmie byť prázdny.',
};

const QUANTIFIER_ERRORS_EN: QuantifierErrors = {
  empty: 'Field cannot be empty.',
  invalidVar: 'Invalid variable (must start with a letter).',
  notFresh: 'Variable {var} is already in use. Choose another.',
  emptyTerm: 'Term cannot be empty.',
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
}
