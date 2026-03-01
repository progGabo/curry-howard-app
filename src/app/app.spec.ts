import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { LogicParserService } from '../services/logic-parser-service';
import { ProofTreeBuilderService } from '../services/proof-tree-builder';
import { LambdaParserService } from '../services/lambda-parser-service';
import { LambdaToExpressionService } from '../services/lambda-to-expression-service';
import { TypeInferenceService } from '../services/type-inference-service';
import { NaturalDeductionBuilderService } from '../services/natural-deduction-builder.service';
import { NdLambdaBuilderService } from '../services/nd-lambda-builder.service';
import { I18nService } from '../services/i18n.service';
import { NotificationService } from '../services/notification.service';
import { TreeHistoryService } from '../services/tree-history.service';
import { RuleFilterService } from '../services/rule-filter.service';
import { RuleFormulaService } from '../services/rule-formula.service';
import { FormulaRenderService } from '../services/formula-render.service';
import { AppParseFacadeService } from '../services/app-parse-facade.service';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  const logicParserMock = {
    parseFormula: jasmine.createSpy('parseFormula').and.returnValue({
      assumptions: [],
      conclusions: [],
      assumptionVars: new Map()
    })
  };

  const proofBuilderMock = {
    buildProof: jasmine.createSpy('buildProof').and.resolveTo(null),
    buildInteractiveRoot: jasmine.createSpy('buildInteractiveRoot').and.returnValue(null),
    applyRuleManually: jasmine.createSpy('applyRuleManually').and.resolveTo(null)
  };

  const lambdaParserMock = {
    parseLambdaExpression: jasmine.createSpy('parseLambdaExpression').and.returnValue({}),
    formatLambdaExpression: jasmine.createSpy('formatLambdaExpression').and.returnValue('')
  };

  const lambdaToExpressionMock = {
    convertLambdaToExpression: jasmine.createSpy('convertLambdaToExpression').and.returnValue('')
  };

  const typeInferenceMock = {
    buildTypeInferenceTree: jasmine.createSpy('buildTypeInferenceTree').and.returnValue(null),
    buildInteractiveRoot: jasmine.createSpy('buildInteractiveRoot').and.returnValue(null),
    applyRuleManually: jasmine.createSpy('applyRuleManually').and.returnValue(null),
    updateNodeTypeFromChildren: jasmine.createSpy('updateNodeTypeFromChildren')
  };

  const naturalDeductionBuilderMock = {
    buildProof: jasmine.createSpy('buildProof').and.resolveTo(null),
    buildInteractiveRoot: jasmine.createSpy('buildInteractiveRoot').and.returnValue(null),
    applyRuleManually: jasmine.createSpy('applyRuleManually').and.resolveTo(null)
  };

  const ndLambdaBuilderMock = {
    buildLambda: jasmine.createSpy('buildLambda').and.returnValue(null)
  };

  const i18nMock = {
    t: jasmine.createSpy('t').and.callFake((lang: 'sk' | 'en') => ({
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
      footerText: 'Footer',
      helpTitle: 'Help',
      close: 'Close',
      errorRuleCannotBeApplied: 'Rule {rule} cannot be applied.',
      errorRuleCannotBeAppliedToSequent: 'Rule cannot be applied to this sequent.',
      errorApplyingRule: 'Error applying rule {rule}: {message}',
      errorParsing: 'Parsing error:',
      errorLambdaConversion: 'Lambda conversion error:',
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
      seqIdentityCut: 'Identity and cut rule:',
      seqLogicalNegation: 'Logical rules: Negation',
      negation: 'Negation',
      conjunction: 'Conjunction',
      disjunction: 'Disjunction',
      implication: 'Implication',
      quantifiers: 'Quantifiers',
      seqWeakening: 'Weakening rules',
      constants: 'Constants',
      hypotheses: 'Hypotheses'
    })),
    translate: jasmine.createSpy('translate').and.returnValue(''),
    errorSummary: jasmine.createSpy('errorSummary').and.returnValue('Error')
  };

  const notificationMock = {
    showError: jasmine.createSpy('showError')
  };

  const treeHistoryMock = {
    clear: jasmine.createSpy('clear'),
    canStepBack: jasmine.createSpy('canStepBack').and.returnValue(false),
    pushProofState: jasmine.createSpy('pushProofState'),
    popProofState: jasmine.createSpy('popProofState').and.returnValue(null),
    pushNdState: jasmine.createSpy('pushNdState'),
    popNdState: jasmine.createSpy('popNdState').and.returnValue(null),
    pushTypeInferenceState: jasmine.createSpy('pushTypeInferenceState'),
    popTypeInferenceState: jasmine.createSpy('popTypeInferenceState').and.returnValue(null)
  };

  const ruleFilterMock = {
    filterProofRules: jasmine.createSpy('filterProofRules').and.callFake((rules: string[]) => rules),
    filterNdRules: jasmine.createSpy('filterNdRules').and.callFake((rules: string[]) => rules),
    filterTypeRules: jasmine.createSpy('filterTypeRules').and.callFake((rules: string[]) => rules)
  };

  const ruleFormulaMock = {
    getFormula: jasmine.createSpy('getFormula').and.returnValue({ formula: '' })
  };

  const formulaRenderMock = {
    formulaToLatex: jasmine.createSpy('formulaToLatex').and.returnValue(''),
    sequentToLatex: jasmine.createSpy('sequentToLatex').and.returnValue('')
  };

  const parseFacadeMock = {
    parseSequentInput: jasmine.createSpy('parseSequentInput').and.resolveTo({
      sequent: { assumptions: [], conclusions: [] },
      proofTree: null,
      isPredicateLogic: false,
      nextMode: 'auto'
    }),
    parseNaturalDeductionInput: jasmine.createSpy('parseNaturalDeductionInput').and.resolveTo({
      naturalDeductionTree: null,
      isPredicateLogic: false,
      nextMode: 'auto',
      notProvable: false
    }),
    parseLambdaInput: jasmine.createSpy('parseLambdaInput').and.returnValue({
      typeInferenceTree: null,
      resultExpression: '',
      lambdaExpr: ''
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [App],
      providers: [
        { provide: LogicParserService, useValue: logicParserMock },
        { provide: ProofTreeBuilderService, useValue: proofBuilderMock },
        { provide: LambdaParserService, useValue: lambdaParserMock },
        { provide: LambdaToExpressionService, useValue: lambdaToExpressionMock },
        { provide: TypeInferenceService, useValue: typeInferenceMock },
        { provide: NaturalDeductionBuilderService, useValue: naturalDeductionBuilderMock },
        { provide: NdLambdaBuilderService, useValue: ndLambdaBuilderMock },
        { provide: I18nService, useValue: i18nMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: TreeHistoryService, useValue: treeHistoryMock },
        { provide: RuleFilterService, useValue: ruleFilterMock },
        { provide: RuleFormulaService, useValue: ruleFormulaMock },
        { provide: FormulaRenderService, useValue: formulaRenderMock },
        { provide: AppParseFacadeService, useValue: parseFacadeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('maps workflow option to sequent mode', () => {
    component.onHeaderOptionChange('proofs-sequent');
    expect(component.conversionMode).toBe('expression-to-lambda');
    expect(component.isSequentWorkflow).toBeTrue();
    expect(component.shouldGenerateLambdaFromProof).toBeFalse();
  });

  it('maps curry-howard expression option to natural deduction + lambda generation', () => {
    component.onHeaderOptionChange('ch-expression-to-lambda');
    expect(component.conversionMode).toBe('natural-deduction');
    expect(component.isNaturalDeductionWorkflow).toBeTrue();
    expect(component.shouldGenerateLambdaFromProof).toBeTrue();
  });
});
