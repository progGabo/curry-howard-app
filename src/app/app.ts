import { Component, ChangeDetectorRef, ElementRef, Inject, Injector, ViewChild } from '@angular/core';
import { LogicParserService } from '../services/logic-parser-service';
import { ProofTreeBuilderService } from '../services/proof-tree-builder';
import { DerivationNode, SequentNode, FormulaNode } from '../models/formula-node';
import { LambdaParserService } from '../services/lambda-parser-service';
import { LambdaToExpressionService } from '../services/lambda-to-expression-service';
import { TypeInferenceService, TypeInferenceNode } from '../services/type-inference-service';
import { NaturalDeductionBuilderService } from '../services/natural-deduction-builder.service';
import { NdLambdaBuilderService } from '../services/nd-lambda-builder.service';
import { I18nService, AppTranslations } from '@services/i18n.service';
import { NotificationService } from '../services/notification.service';
import { TreeHistoryService } from '../services/tree-history.service';
import { RuleFilterService } from '../services/rule-filter.service';
import { RuleFormulaService } from '../services/rule-formula.service';
import { FormulaRenderService } from '../services/formula-render.service';
import { FormulaTypeService } from '../services/formula-type-service';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { NdNode } from '../models/nd-node';
import { NdRule, NdRuleApplicationOptions } from '../models/nd-rule';
import { Equality } from '../utils/equality';
import { parseTerm, freeVarsFormula } from '../utils/quantifier-utils';
import { SplitterResizeEndEvent } from 'primeng/splitter';
import { AppParseFacadeService } from '../services/app-parse-facade.service';
import { AppPopupFacadeService } from '../services/app-popup-facade.service';
import {
  CONCLUSION_RULES,
  ASSUMPTION_RULES,
  SPECIAL_RULES,
  ND_INTRO_RULES,
  ND_ELIM_RULES,
  ND_QUANTIFIER_RULES,
  BASIC_RULES,
  ABS_RULES,
  APP_RULES,
  PAIR_RULES,
  DEPENDENT_RULES,
  SUM_RULES,
  LET_RULES
} from '../constants/rules';

type HeaderSection = 'curry-howard' | 'proofs';
type HeaderOption = 'ch-expression-to-lambda' | 'ch-lambda-to-expression' | 'proofs-sequent' | 'proofs-natural-deduction';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: false,
})
export class App {
  code: string = '';
  proofTree: DerivationNode | null = null;
  naturalDeductionTree: NdNode | null = null;
  sequent: SequentNode | null = null;
  mode: 'auto' | 'interactive' = 'auto';
  interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  lambdaExpr: string = '';
  lambdaExprNode: ExprNode | null = null; 
  headerSection: HeaderSection = 'curry-howard';
  headerOption: HeaderOption = 'ch-expression-to-lambda';
  conversionMode: 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction' = 'natural-deduction';
  resultExpression: string = '';
  rawType: string = '';
  letBindings: string[] = [];
  typeInferenceTree: TypeInferenceNode | null = null;
  activeExpressionLambdaTab: 'proof' | 'type' = 'proof';
  isPredicateLogic: boolean = false;

  helpVisible: boolean = false;
  slidePanelVisible: boolean = false;
  currentLanguage: 'sk' | 'en' = 'sk';
  currentYear: number = new Date().getFullYear();
  panelSizes: number[] = [33, 67];
  private readonly typeInferenceSidebarFullRowRules = new Set([
    'ABS',
    'APP',
    'LETPAIR',
    'CASE',
    'LETDEPENDENTPAIR',
    'LET'
  ]);

  get t() {
    return this.i18n.t(this.currentLanguage);
  }

  expressionExamples = [
    { label: 'p ⇒ q ⇒ p ∧ q', code: 'p ⇒ q ⇒ p ∧ q' },
    { label: '(p ⇒ q) ⇒ (¬q ⇒ ¬p)', code: '(p ⇒ q) ⇒ (¬q ⇒ ¬p)' },
    { label: 'p ∧ q ⇒ p', code: '(p ∧ q) ⇒ p' },
    { label: 'p ⇒ p ∨ q', code: 'p ⇒ (p ∨ q)' },
    { label: '∀x:T. P(x) ⇒ P(t)', code: '∀x:T. P(x) ⇒ P(t)' }
  ];
  lambdaExamples = [
    { label: 'λx:A. λy:A. x', code: 'λx:A. λy:A. x' },
    { label: 'λf:(A⇒B). λx:A. f x', code: 'λf:(A->B). λx:A. f x' },
    { label: 'λx:A. x', code: 'λx:A. x' },
    { label: 'λx:A. λy:B. ⟨x,y⟩', code: 'λx:A. λy:B. <x,y>' },
    { label: 'λx: T. λp: P(x). p', code: 'λx: T. λp: P(x). p' },
  ];

  selectedNode: DerivationNode | null = null;
  selectedNdNode: NdNode | null = null;
  selectedTypeNode: TypeInferenceNode | null = null;
  ruleError: string | null = null;
  private predictionRuleRequestId = 0;
  private predictionTypeRuleRequestId = 0;

  predictionRuleRequest: { node: DerivationNode, rule: string, requestId: number } | null = null;
  predictionTypeRuleRequest: { node: TypeInferenceNode, rule: string, requestId: number } | null = null;
  ndPredictionRequest: {
    node: NdNode;
    rule: NdRule;
    ruleOptions?: NdRuleApplicationOptions;
    expectedGoals: FormulaNode[];
    userPredictions: string[];
  } | null = null;

  sequentQuantifierRequest: {
    node: DerivationNode;
    rule: string;
    isVariable: boolean;
    freeVars: string[];
    placeholder: string;
    label: string;
  } | null = null;
  sequentQuantifierInputValue = '';
  ndQuantifierRequest: {
    node: NdNode;
    rule: NdRule;
    isVariable: boolean;
    freeVars: string[];
    placeholder: string;
    label: string;
  } | null = null;

  ndFreeFormulaRequest: {
    node: NdNode;
    rule: NdRule;
    placeholder: string;
    label: string;
  } | null = null;

  conclusionRules = [...CONCLUSION_RULES];
  assumptionRules = [...ASSUMPTION_RULES];
  specialRules = [...SPECIAL_RULES];
  seqSidebarIdentityCutRules = ['id'];
  seqSidebarNegationRules = ['¬L', '¬R'];
  seqSidebarConjunctionRules = ['∧L1', '∧L2', '∧R'];
  seqSidebarDisjunctionRules = ['∨R1', '∨R2', '∨L'];
  seqSidebarImplicationRules = ['→R', '→L'];
  seqSidebarQuantifierRules = ['∀L', '∀R', '∃L', '∃R'];
  seqSidebarWeakeningRules = ['WL'];
  ndIntroRules = [...ND_INTRO_RULES];
  ndElimRules = [...ND_ELIM_RULES];
  ndQuantifierRules = [...ND_QUANTIFIER_RULES];
  ndSidebarCoreRules = ['⊥E1', '⊤I'];
  ndSidebarNegationRules = ['¬I', '¬E'];
  ndSidebarConjunctionRules = ['∧I', '∧E1', '∧E2'];
  ndSidebarDisjunctionRules = ['∨I1', '∨I2', '∨E'];
  ndSidebarImplicationRules = ['→I', '→E'];
  ndSidebarQuantifierRules = ['∃I', '∀I', '∀E', '∃E'];
  basicRules = [...BASIC_RULES];
  absRules = [...ABS_RULES];
  appRules = [...APP_RULES];
  pairRules = [...PAIR_RULES];
  dependentRules = [...DEPENDENT_RULES];
  sumRules = [...SUM_RULES];
  letRules = [...LET_RULES];

  treeCanvasResetTrigger: number = 0;

  constructor(
    private logicParser: LogicParserService,
    private proofBuilder: ProofTreeBuilderService,
    private lambdaParser: LambdaParserService,
    private lambdaToExpression: LambdaToExpressionService,
    private typeInference: TypeInferenceService,
    private naturalDeductionBuilder: NaturalDeductionBuilderService,
    private ndLambdaBuilder: NdLambdaBuilderService,
    private parseFacade: AppParseFacadeService,
    public popup: AppPopupFacadeService,
    @Inject(I18nService) private i18n: I18nService,
    private notification: NotificationService,
    private treeHistory: TreeHistoryService,
    private ruleFilter: RuleFilterService,
    private ruleFormula: RuleFormulaService,
    private formulaRender: FormulaRenderService,
    private formulaType: FormulaTypeService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}

  onSplitterResizeEnd(e?: SplitterResizeEndEvent): void {
    const rawSizes = e?.sizes ?? this.panelSizes;
    const sizes = Array.isArray(rawSizes)
      ? rawSizes.map((value) => typeof value === 'string' ? Number(value) : value).filter((value) => Number.isFinite(value))
      : this.panelSizes;

    if (Array.isArray(sizes) && sizes.length >= 2 && sizes[0] > 50) {
      this.panelSizes = [50, 50];
      this.cdr.detectChanges();
    } else if (Array.isArray(sizes) && sizes.length >= 2) {
      this.panelSizes = [...sizes];
      this.cdr.detectChanges();
    }
  }

  private showError(key: keyof AppTranslations, params?: { [key: string]: string | number }) {
    const message = this.i18n.translate(this.currentLanguage, key, params);
    this.notification.showError(message, {
      summary: this.i18n.errorSummary(this.currentLanguage),
      life: 7000
    });
  }
  
  onInputChanged(newCode: string) {
    this.code = newCode;
    this.isPredicateLogic = false;
  }

  applyExample(exampleCode: string) {
    if (!exampleCode) return;
    this.code = exampleCode;
  }

  get examplesPlaceholder(): string {
    return this.isLambdaToExpressionWorkflow ? this.t.chooseExampleLambda : this.t.chooseExampleExpr;
  }

  get currentExamples(): Array<{ label: string; code: string }> {
    return this.isLambdaToExpressionWorkflow ? this.lambdaExamples : this.expressionExamples;
  }

  isTypeInferenceSidebarFullRow(rule: string): boolean {
    return this.typeInferenceSidebarFullRowRules.has((rule || '').toUpperCase());
  }

  switchMode(newMode: 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction') {
    this.conversionMode = newMode;
    if (newMode === 'lambda-to-expression') {
      this.headerSection = 'curry-howard';
      this.headerOption = 'ch-lambda-to-expression';
    } else if (newMode === 'natural-deduction') {
      this.headerSection = 'proofs';
      this.headerOption = 'proofs-natural-deduction';
    } else {
      this.headerSection = 'proofs';
      this.headerOption = 'proofs-sequent';
    }
    this.resetWorkspaceState();
  }

  onHeaderSectionChange(section: HeaderSection): void {
    this.headerSection = section;
  }

  onHeaderOptionChange(option: HeaderOption): void {
    this.headerOption = option;
    this.headerSection = option.startsWith('proofs') ? 'proofs' : 'curry-howard';
    this.conversionMode = this.deriveConversionMode(option);
    this.activeExpressionLambdaTab = 'proof';
    this.resetWorkspaceState();
  }

  get isLambdaToExpressionWorkflow(): boolean {
    return this.headerOption === 'ch-lambda-to-expression';
  }

  get isNaturalDeductionWorkflow(): boolean {
    return this.headerOption === 'ch-expression-to-lambda' || this.headerOption === 'proofs-natural-deduction';
  }

  get isSequentWorkflow(): boolean {
    return this.headerOption === 'proofs-sequent';
  }

  get shouldGenerateLambdaFromProof(): boolean {
    return this.headerOption === 'ch-expression-to-lambda';
  }

  private deriveConversionMode(option: HeaderOption): 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction' {
    if (option === 'ch-lambda-to-expression') {
      return 'lambda-to-expression';
    }
    if (option === 'proofs-sequent') {
      return 'expression-to-lambda';
    }
    return 'natural-deduction';
  }

  @ViewChild('examplesSelect') examplesSelect?: ElementRef<HTMLSelectElement>;

  private resetWorkspaceState(): void {
    this.code = '';
    if (this.examplesSelect) {
      this.examplesSelect.nativeElement.selectedIndex = 0;
    }
    this.proofTree = null;
    this.naturalDeductionTree = null;
    this.sequent = null;
    this.lambdaExpr = '';
    this.lambdaExprNode = null;
    this.isPredicateLogic = false;
    this.resultExpression = '';
    this.rawType = '';
    this.letBindings = [];
    this.typeInferenceTree = null;
    this.selectedNdNode = null;
    this.selectedTypeNode = null;
    this.ruleError = null;
    this.ndPredictionRequest = null;
    this.ndQuantifierRequest = null;
    this.ndFreeFormulaRequest = null;
    this.activeExpressionLambdaTab = 'proof';
    this.treeHistory.clear();
  }

  get showExpressionLambdaTypeTab(): boolean {
    return this.shouldGenerateLambdaFromProof && !!this.typeInferenceTree;
  }

  setExpressionLambdaTab(tab: 'proof' | 'type'): void {
    this.activeExpressionLambdaTab = tab;
  }

  onNodeClicked(node: DerivationNode) {
    if (this.selectedNode === node) {
      this.selectedNode = null; 
      this.popup.close();
    } else {
      this.selectedNode = node;
    }
  }

  onProofPlusButtonClicked(event: { node: DerivationNode, x: number, y: number }) {
    this.selectedNode = event.node;
    this.popup.open(event.node, event.x, event.y);
  }

  onNdNodeClicked(node: NdNode) {
    if (this.selectedNdNode === node) {
      this.selectedNdNode = null;
      this.popup.close();
    } else {
      this.selectedNdNode = node;
    }
  }

  onNdPlusButtonClicked(event: { node: NdNode, x: number, y: number }) {
    this.selectedNdNode = event.node;
    this.popup.open(event.node, event.x, event.y);
  }

  onTypePlusButtonClicked(event: { node: TypeInferenceNode, x: number, y: number }) {
    this.selectedTypeNode = event.node;
    this.popup.open(event.node, event.x, event.y);
  }

  onHeaderModeChange(mode: 'auto' | 'interactive') {
    this.mode = mode;
    if (this.code && this.code.trim() !== '') {
      this.parseAndBuild();
    }
  }

  filterRules(rules: readonly string[], type: 'proof' | 'nd' | 'type'): string[] {
    const filters = {
      proof: () => this.ruleFilter.filterProofRules(rules, this.popup.node, this.interactiveSubmode),
      nd: () => this.ruleFilter.filterNdRules(rules, this.popup.node, this.interactiveSubmode),
      type: () => this.ruleFilter.filterTypeRules(rules, this.popup.node, this.interactiveSubmode),
    };
    return filters[type]();
  }

  async onProofRuleClick(rule: string) {
    if (!this.popup.node) return;
    const popupNode = this.popup.node;
    this.popup.close();

    if (this.conversionMode === 'natural-deduction') {
      if (!('judgement' in popupNode)) return;
      const ndNode = popupNode as NdNode;
      const ndRule = rule as NdRule;

      this.ndQuantifierRequest = null;
      this.ndFreeFormulaRequest = null;
      this.ndPredictionRequest = null;

      if (this.isNdQuantifierRule(ndRule)) {
        this.beginNdQuantifierInput(ndNode, ndRule);
        return;
      }

      if (this.isNdFreeFormulaRule(ndRule)) {
        if (!this.naturalDeductionBuilder.canApply(ndNode, ndRule)) {
          this.beginNdFreeFormulaInput(ndNode, ndRule);
          return;
        }
      }

      if (this.interactiveSubmode === 'predict') {
        await this.beginNdPrediction(ndNode, ndRule);
        return;
      }
      this.applyNdRuleToNode({ node: ndNode, rule: ndRule });
      return;
    }

    if (!('sequent' in popupNode)) return;
    const node = popupNode as DerivationNode;

    const quantifierInfo = this.proofBuilder.getQuantifierInfo(node.sequent, rule, this.currentLanguage);
    if (quantifierInfo) {
      this.sequentQuantifierInputValue = '';
      this.sequentQuantifierRequest = {
        node,
        rule,
        isVariable: quantifierInfo.isVariable,
        freeVars: quantifierInfo.freeVars,
        placeholder: quantifierInfo.placeholder,
        label: quantifierInfo.label
      };
      this.selectedNode = null;
      return;
    }
    
    if (this.interactiveSubmode === 'predict') {
      this.predictionRuleRequest = {
        node,
        rule,
        requestId: ++this.predictionRuleRequestId
      };
    } else {
      this.applyRuleToNode({ node, rule });
    }
  }

  onTypeRuleClick(rule: string) {
    if (!this.popup.node || !('expression' in this.popup.node)) return;
    const node = this.popup.node as TypeInferenceNode;
    this.popup.close();
    
    if (this.interactiveSubmode === 'predict') {
      this.predictionTypeRuleRequest = {
        node,
        rule,
        requestId: ++this.predictionTypeRuleRequestId
      };
    } else {
      this.applyTypeRuleToNode({ node, rule });
    }
  }

  onTypeNodeClicked(node: TypeInferenceNode) {
    if (this.selectedTypeNode === node) {
      this.selectedTypeNode = null;
      this.popup.close();
    } else {
      this.selectedTypeNode = node;
    }
  }

  applyTypeRuleToNode(event: { node: TypeInferenceNode; rule: string }) {
    const { node, rule } = event;
    
    if (this.typeInferenceTree) {
      this.treeHistory.pushTypeInferenceState(this.typeInferenceTree);
    }
    
    try {
      const applied = this.typeInference.applyRuleManually(node.expression, node.assumptions, rule);
      
      if (applied) {
        node.rule = applied.rule;
        node.children = applied.children;
        node.inferredType = applied.inferredType;
        this.ruleError = null;
        
        this.propagateTypesUpward(node);
        
        if (this.typeInferenceTree) {
          this.resultExpression = this.lambdaToExpression.convertLambdaToExpression(this.typeInferenceTree.expression, this.typeInferenceTree.inferredType);
        }
      } else {
        this.treeHistory.popTypeInferenceState();
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      this.treeHistory.popTypeInferenceState();
      this.showError('errorApplyingRule', { rule, message: error.message });
    }

    this.selectedTypeNode = null;
  }

  private propagateTypesUpward(changedNode: TypeInferenceNode) {
    if (!this.typeInferenceTree) return;
    
    const updateParents = (current: TypeInferenceNode, target: TypeInferenceNode): boolean => {
      if (current === target) return true;
      
      if (current.children) {
        for (const child of current.children) {
          if (updateParents(child, target)) {
            this.typeInference.updateNodeTypeFromChildren(current);
            return true;
          }
        }
      }
      return false;
    };
    
    updateParents(this.typeInferenceTree, changedNode);
  }

  private buildNdLambda(): void {
    if (!this.naturalDeductionTree) {
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
      this.typeInferenceTree = null;
      return;
    }

    const ndLambda = this.ndLambdaBuilder.buildLambda(this.naturalDeductionTree);
    if (!ndLambda) {
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
      this.typeInferenceTree = null;
      return;
    }

    this.lambdaExprNode = ndLambda;
    this.lambdaExpr = this.lambdaParser.formatLambdaExpression(ndLambda);

    if (!this.shouldGenerateLambdaFromProof) {
      this.typeInferenceTree = null;
      return;
    }

    try {
      const initialAssumptions = this.buildNdTypeAssumptions();
      this.typeInferenceTree = this.typeInference.buildTypeInferenceTree(ndLambda, initialAssumptions);
    } catch {
      this.typeInferenceTree = null;
    }
  }

  private buildNdTypeAssumptions(): Map<string, TypeNode> | undefined {
    if (!this.naturalDeductionTree) {
      return undefined;
    }

    const rootHypotheses = this.naturalDeductionTree.openHypotheses ?? [];
    if (!rootHypotheses.length) {
      return undefined;
    }

    const assumptions = new Map<string, TypeNode>();
    rootHypotheses.forEach((hypothesis, index) => {
      const variableName = this.alphaName(index);
      assumptions.set(variableName, this.formulaType.formulaToType(hypothesis.formula));
    });

    return assumptions;
  }

  private alphaName(index: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let value = index;
    let suffix = '';

    do {
      suffix = alphabet[value % 26] + suffix;
      value = Math.floor(value / 26) - 1;
    } while (value >= 0);

    return suffix;
  }


  async applyRuleToNode(event: { node: DerivationNode; rule: string }) {
    const { node, rule } = event;
    
    if (this.proofTree) {
      this.treeHistory.pushProofState(this.proofTree);
    }
    
    try {
      const applied = await this.proofBuilder.applyRuleManually(node.sequent, rule, true, this.currentLanguage);

      if (applied) {
        node.rule = applied.rule;
        node.children = applied.children;
        node.usedFormula = applied.usedFormula;
        node.metadata = applied.metadata;
        this.lambdaExpr = '';
        this.lambdaExprNode = null;
      } else {
        this.treeHistory.popProofState();
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      this.treeHistory.popProofState();
      const errorMsg = error?.message || 'Rule application failed';
      this.notification.showError(errorMsg, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 5000
      });
    }

    this.selectedNode = null;
  }

  cancelSequentQuantifierInput(): void {
    this.sequentQuantifierRequest = null;
    this.sequentQuantifierInputValue = '';
  }

  async confirmSequentQuantifierInput(value: string): Promise<void> {
    if (!this.sequentQuantifierRequest) return;
    const { node, rule, isVariable, freeVars } = this.sequentQuantifierRequest;
    const trimmed = value.trim();

    if (!trimmed) {
      this.showError('errorFillAllFields');
      return;
    }

    if (isVariable) {
      if (!/^[a-z][a-zA-Z0-9_]*$/.test(trimmed)) {
        this.showError('errorQuantifierVariableInvalid', { rule });
        return;
      }
      if (freeVars.includes(trimmed)) {
        this.showError('errorQuantifierVariableInvalid', { rule });
        return;
      }
    }

    this.sequentQuantifierRequest = null;

    if (this.proofTree) {
      this.treeHistory.pushProofState(this.proofTree);
    }

    try {
      const applied = await this.proofBuilder.applyRuleManually(node.sequent, rule, true, this.currentLanguage, trimmed);
      if (applied) {
        node.rule = applied.rule;
        node.children = applied.children;
        node.usedFormula = applied.usedFormula;
        node.metadata = applied.metadata;
        this.lambdaExpr = '';
        this.lambdaExprNode = null;
      } else {
        this.treeHistory.popProofState();
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      this.treeHistory.popProofState();
      const errorMsg = error?.message || 'Rule application failed';
      this.notification.showError(errorMsg, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 5000
      });
    }
    this.selectedNode = null;
  }

  private isNdQuantifierRule(rule: NdRule): boolean {
    return rule === '∀I' || rule === '∀E' || rule === '∃I' || rule === '∃E';
  }

  private isNdFreeFormulaRule(rule: NdRule): boolean {
    return rule === '∧E1' || rule === '∧E2' || rule === '→E' || rule === '¬E';
  }

  private beginNdQuantifierInput(node: NdNode, rule: NdRule): void {
    const collectFreeVars = (formulas: FormulaNode[]): string[] => {
      const vars = new Set<string>();
      for (const formula of formulas) {
        for (const variable of freeVarsFormula(formula)) {
          vars.add(variable);
        }
      }
      return [...vars].sort((left, right) => left.localeCompare(right));
    };

    let isVariable = true;
    let freeVars: string[] = [];
    let ruleType: string;

    switch (rule) {
      case '∀I':
        isVariable = true;
        freeVars = collectFreeVars(node.judgement.context);
        ruleType = 'forall-intro';
        break;
      case '∃E':
        isVariable = true;
        freeVars = collectFreeVars([...node.judgement.context, node.judgement.goal]);
        ruleType = 'exists-elim';
        break;
      case '∀E':
        isVariable = false;
        ruleType = 'forall-elim';
        break;
      case '∃I':
        isVariable = false;
        ruleType = 'exists-intro';
        break;
      default:
        return;
    }

    const labels = this.i18n.quantifierRuleLabels(this.currentLanguage, ruleType);
    this.ndQuantifierRequest = {
      node,
      rule,
      isVariable,
      freeVars,
      placeholder: labels.placeholder,
      label: labels.title
    };
    this.selectedNdNode = null;
  }

  cancelNdQuantifierInput(): void {
    this.ndQuantifierRequest = null;
  }

  private beginNdFreeFormulaInput(node: NdNode, rule: NdRule): void {
    const ruleTypeMap: Record<string, string> = {
      '∧E1': 'and-elim1',
      '∧E2': 'and-elim2',
      '→E': 'impl-elim',
      '¬E': 'neg-elim',
    };
    const ruleType = ruleTypeMap[rule];
    if (!ruleType) return;

    const labels = this.i18n.quantifierRuleLabels(this.currentLanguage, ruleType);
    this.ndFreeFormulaRequest = {
      node,
      rule,
      placeholder: labels.placeholder,
      label: labels.title
    };
    this.selectedNdNode = null;
  }

  cancelNdFreeFormulaInput(): void {
    this.ndFreeFormulaRequest = null;
  }

  async confirmNdFreeFormulaInput(value: string): Promise<void> {
    if (!this.ndFreeFormulaRequest) return;
    const { node, rule } = this.ndFreeFormulaRequest;
    const trimmed = value.trim();

    if (!trimmed) {
      this.showError('errorFillAllFields');
      return;
    }

    let parsedFormula: FormulaNode;
    try {
      const sequent = this.logicParser.parseFormula(trimmed);
      if (sequent.conclusions.length !== 1 || sequent.assumptions.length > 0) {
        this.showError('errorFormulaInvalid');
        return;
      }
      parsedFormula = sequent.conclusions[0];
    } catch {
      this.showError('errorFormulaInvalid');
      return;
    }

    const goal = node.judgement.goal;
    let freeFormula: FormulaNode;

    switch (rule) {
      case '∧E1':
        if (parsedFormula.kind !== 'And' || !Equality.formulasEqual(parsedFormula.left, goal)) {
          this.showError('errorFormulaStructureMismatch', { rule });
          return;
        }
        freeFormula = parsedFormula.right;
        break;
      case '∧E2':
        if (parsedFormula.kind !== 'And' || !Equality.formulasEqual(parsedFormula.right, goal)) {
          this.showError('errorFormulaStructureMismatch', { rule });
          return;
        }
        freeFormula = parsedFormula.left;
        break;
      case '→E':
        if (parsedFormula.kind !== 'Implies' || !Equality.formulasEqual(parsedFormula.right, goal)) {
          this.showError('errorFormulaStructureMismatch', { rule });
          return;
        }
        freeFormula = parsedFormula.left;
        break;
      case '¬E':
        freeFormula = parsedFormula;
        break;
      default:
        this.showError('errorFormulaInvalid');
        return;
    }

    const ruleOptions: NdRuleApplicationOptions = { freeFormula };

    if (!this.naturalDeductionBuilder.canApply(node, rule, ruleOptions)) {
      this.showError('errorRuleCannotBeApplied', { rule });
      return;
    }

    this.ndFreeFormulaRequest = null;
    await this.applyNdRuleWithResolvedOptions(node, rule, ruleOptions);
  }

  async confirmNdQuantifierInput(value: string): Promise<void> {
    if (!this.ndQuantifierRequest) return;
    const { node, rule, isVariable, freeVars } = this.ndQuantifierRequest;
    const trimmed = value.trim();

    if (!trimmed) {
      this.showError('errorFillAllFields');
      return;
    }

    let ruleOptions: NdRuleApplicationOptions | undefined;

    if (isVariable) {
      if (!/^[a-z][a-zA-Z0-9_]*$/.test(trimmed)) {
        this.showError('errorQuantifierVariableInvalid', { rule });
        return;
      }
      if (freeVars.includes(trimmed)) {
        this.showError('errorQuantifierVariableInvalid', { rule });
        return;
      }
      ruleOptions = { eigenVariable: trimmed };
      if (!this.naturalDeductionBuilder.canApply(node, rule, ruleOptions)) {
        this.showError('errorQuantifierVariableInvalid', { rule });
        return;
      }
    } else {
      const parsedTerm = parseTerm(trimmed);
      if (!parsedTerm) {
        this.showError('errorInvalidQuantifierTerm');
        return;
      }
      ruleOptions = { instantiationTerm: parsedTerm };
      if (!this.naturalDeductionBuilder.canApply(node, rule, ruleOptions)) {
        this.showError('errorQuantifierTermMismatch', { rule });
        return;
      }
    }

    this.ndQuantifierRequest = null;
    await this.applyNdRuleWithResolvedOptions(node, rule, ruleOptions);
  }

  async applyNdRuleToNode(event: { node: NdNode; rule: NdRule }) {
    const { node, rule } = event;
    await this.applyNdRuleWithResolvedOptions(node, rule);
  }

  private async applyNdRuleWithResolvedOptions(
    node: NdNode,
    rule: NdRule,
    ruleOptions?: NdRuleApplicationOptions
  ): Promise<void> {

    if (this.naturalDeductionTree) {
      this.treeHistory.pushNdState(this.naturalDeductionTree);
    }

    try {
      const applied = await this.naturalDeductionBuilder.applyRuleManually(node, rule, ruleOptions ?? undefined);

      if (applied) {
        Object.assign(node, applied);
        if (this.naturalDeductionTree) {
          this.naturalDeductionBuilder.reannotateTree(this.naturalDeductionTree);
        }
        this.ruleError = null;
        if (this.shouldGenerateLambdaFromProof) {
          this.buildNdLambda();
        } else {
          this.lambdaExpr = '';
          this.lambdaExprNode = null;
        }
      } else {
        this.treeHistory.popNdState();
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      this.treeHistory.popNdState();
      const errorMsg = error?.message || 'Rule application failed';
      this.notification.showError(errorMsg, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 5000
      });
    }

    this.selectedNdNode = null;
    this.ndPredictionRequest = null;
  }

  private async beginNdPrediction(node: NdNode, rule: NdRule, providedOptions?: NdRuleApplicationOptions): Promise<void> {
    const ruleOptions = providedOptions;

    const previewNode = this.cloneNdNode(node);
    const previewApplied = await this.naturalDeductionBuilder.applyRuleManually(previewNode, rule, ruleOptions ?? undefined);
    if (!previewApplied) {
      this.showError('errorRuleCannotBeApplied', { rule });
      this.selectedNdNode = null;
      return;
    }

    const expectedPremises = previewApplied.premises ?? [];
    const expectedGoals = expectedPremises.map((premise) => premise.judgement.goal);

    if (expectedGoals.length === 0) {
      await this.applyNdRuleWithResolvedOptions(node, rule, ruleOptions ?? undefined);
      return;
    }

    this.ndPredictionRequest = {
      node,
      rule,
      ruleOptions: ruleOptions ?? undefined,
      expectedGoals,
      userPredictions: new Array(expectedGoals.length).fill('')
    };
    this.selectedNdNode = null;
  }

  onNdPredictionKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelNdPrediction();
    }
  }

  cancelNdPrediction(): void {
    this.ndPredictionRequest = null;
  }

  async confirmNdPrediction(predictedValues?: string[]): Promise<void> {
    if (!this.ndPredictionRequest) return;

    const { expectedGoals, userPredictions, node, rule, ruleOptions } = this.ndPredictionRequest;
    const predictions = predictedValues && predictedValues.length ? predictedValues : userPredictions;

    if (predictions.some((prediction) => !prediction.trim())) {
      this.showError('errorFillAllFields');
      return;
    }

    for (let index = 0; index < expectedGoals.length; index++) {
      const parsedFormula = this.parseSingleFormulaInput(predictions[index]);
      if (!parsedFormula) {
        const message = this.currentLanguage === 'sk'
          ? 'Neplatný vstup formuly pre režim predikcie.'
          : 'Invalid formula input for prediction mode.';
        this.notification.showError(message, {
          summary: this.i18n.errorSummary(this.currentLanguage),
          life: 5000
        });
        return;
      }

      if (!Equality.formulasEqual(parsedFormula, expectedGoals[index])) {
        const message = this.currentLanguage === 'sk'
          ? `Nesprávna predikcia na pozícii ${index + 1}.`
          : `Incorrect prediction at position ${index + 1}.`;
        this.notification.showError(message, {
          summary: this.i18n.errorSummary(this.currentLanguage),
          life: 6000
        });
        return;
      }
    }

    await this.applyNdRuleWithResolvedOptions(node, rule, ruleOptions);
  }

  private parseSingleFormulaInput(input: string): FormulaNode | null {
    try {
      const parsed = this.logicParser.parseFormula(input);
      return parsed.conclusions[0] ?? null;
    } catch {
      return null;
    }
  }

  private cloneNdNode(node: NdNode): NdNode {
    if (typeof structuredClone === 'function') {
      return structuredClone(node);
    }
    return JSON.parse(JSON.stringify(node)) as NdNode;
  }

  async parseAndBuild() {
    if (!this.code || this.code.trim() === '') {
      this.notification.showError(this.t.errorNothingTyped, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 5000
      });
      return;
    }

    this.treeHistory.clear();
    this.treeCanvasResetTrigger++;
    this.ndPredictionRequest = null;
    this.isPredicateLogic = false;
    
    try {
      if (this.conversionMode === 'expression-to-lambda') {
        await this.parseExpressionToLambda();
      } else if (this.isNaturalDeductionWorkflow) {
        await this.parseNaturalDeduction(this.shouldGenerateLambdaFromProof);
      } else {
        this.parseLambdaToExpression();
      }
    } catch (e: unknown) {
      this.proofTree = null;
      this.sequent = null;
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
      this.naturalDeductionTree = null;
      this.typeInferenceTree = null;
      this.resultExpression = '';
      const errorMsg = e instanceof Error ? `: ${e.message}` : '';
      const fullMessage = this.t.errorParsing + errorMsg;
      this.notification.showError(fullMessage, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 7000
      });
    }
  }

  private async parseExpressionToLambda() {
    const parsed = await this.parseFacade.parseSequentInput(this.code, this.mode);
    this.sequent = parsed.sequent;
    this.proofTree = parsed.proofTree;
    this.isPredicateLogic = parsed.isPredicateLogic;
    this.mode = parsed.nextMode;
    this.naturalDeductionTree = null;
    this.typeInferenceTree = null;
    this.lambdaExpr = '';
    this.lambdaExprNode = null;

    if (parsed.notProvable) {
      this.proofTree = null;
      const message = this.currentLanguage === 'sk'
        ? 'Výrok nie je dokázateľný v sekventovom kalkule.'
        : 'Formula is not provable in sequent calculus.';
      this.notification.showError(message, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 7000
      });
    }
  }

  private async parseNaturalDeduction(generateLambdaFromProof: boolean = false) {
    const parsed = await this.parseFacade.parseNaturalDeductionInput(this.code, this.mode);
    this.isPredicateLogic = parsed.isPredicateLogic;
    this.mode = parsed.nextMode;

    this.sequent = null;
    this.proofTree = null;
    this.lambdaExpr = '';
    this.lambdaExprNode = null;
    this.typeInferenceTree = null;

    this.naturalDeductionTree = parsed.naturalDeductionTree;
    if (parsed.notProvable) {
      const message = this.currentLanguage === 'sk'
        ? 'Výrok nie je dokázateľný v intuicionistickej prirodzenej dedukcii.'
        : 'Formula is not provable in intuitionistic natural deduction.';
      this.notification.showError(message, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 7000
      });
    }

    if (generateLambdaFromProof) {
      this.buildNdLambda();
    } else {
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
    }
  }

  private parseLambdaToExpression() {
    try {
      this.naturalDeductionTree = null;
      const parsed = this.parseFacade.parseLambdaInput(this.code, this.mode);
      this.typeInferenceTree = parsed.typeInferenceTree;
      this.resultExpression = parsed.resultExpression;
      this.rawType = parsed.rawType;
      this.letBindings = parsed.letBindings;
      this.lambdaExpr = parsed.lambdaExpr;
    } catch (error: unknown) {
      this.resultExpression = '';
      this.rawType = '';
      this.letBindings = [];
      this.lambdaExpr = this.code;
      this.typeInferenceTree = null;
      const errorMsg = error instanceof Error ? `: ${error.message}` : '';
      const fullMessage = this.t.errorLambdaConversion + errorMsg;
      this.notification.showError(fullMessage, {
        summary: this.i18n.errorSummary(this.currentLanguage),
        life: 7000
      });
    }
  }

  stepBack() {
    if (this.conversionMode === 'expression-to-lambda') {
      const restored = this.treeHistory.popProofState();
      if (restored) {
        this.proofTree = restored;
        this.lambdaExpr = '';
        this.lambdaExprNode = null;
        this.selectedNode = null;
        this.ruleError = null;
      }
    } else if (this.conversionMode === 'natural-deduction') {
      const restored = this.treeHistory.popNdState();
      if (restored) {
        this.naturalDeductionTree = restored;
        if (this.shouldGenerateLambdaFromProof) {
          this.buildNdLambda();
        }
        this.selectedNdNode = null;
        this.ruleError = null;
      }
    } else if (this.conversionMode === 'lambda-to-expression') {
      const restored = this.treeHistory.popTypeInferenceState();
      if (restored) {
        this.typeInferenceTree = restored;
        if (this.typeInferenceTree) {
          this.resultExpression = this.lambdaToExpression.convertLambdaToExpression(this.typeInferenceTree.expression, this.typeInferenceTree.inferredType);
        }
        this.selectedTypeNode = null;
        this.ruleError = null;
      }
    }
  }

  get canStepBack(): boolean {
    return this.treeHistory.canStepBack(this.conversionMode);
  }

  get ndHypotheses(): Array<{ label: string; formulaLatex: string; isClosed: boolean }> {
    if (!this.naturalDeductionTree) return [];

    const entries = new Map<string, { label: string; formulaLatex: string; isClosed: boolean }>();
    const closedHypothesisIds = new Set<string>();

    const collect = (node: NdNode): void => {
      if ((node.premises?.length ?? 0) === 0 && node.branchStatus === 'closed-hypothesis') {
        for (const hypothesis of node.openHypotheses ?? []) {
          if (Equality.formulasEqual(hypothesis.formula, node.judgement.goal)) {
            closedHypothesisIds.add(hypothesis.id);
          }
        }
      }

      for (const hypothesis of node.openHypotheses ?? []) {
        if (hypothesis.label && !entries.has(hypothesis.id)) {
          entries.set(hypothesis.id, {
            label: hypothesis.label,
            formulaLatex: this.formulaRender.formulaToLatex(hypothesis.formula),
            isClosed: false
          });
        }
      }
      for (const premise of node.premises ?? []) {
        collect(premise);
      }
    };

    collect(this.naturalDeductionTree);

    for (const hypothesisId of closedHypothesisIds) {
      const entry = entries.get(hypothesisId);
      if (entry) {
        entry.isClosed = true;
      }
    }

    return [...entries.values()]
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  getRuleFormula(ruleName: string): string {
    const language = this.currentLanguage === 'sk' ? 'sk' : 'en';
    const formula = this.ruleFormula.getFormula(ruleName, language);
    return formula ? formula.formula : '';
  }
}