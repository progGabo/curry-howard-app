import { Component, ChangeDetectorRef, Inject, Injector } from '@angular/core';
import { LogicParserService } from '../services/logic-parser-service';
import { ProofTreeBuilderService } from '../services/proof-tree-builder';
import { DerivationNode, SequentNode, FormulaNode, TermNode } from '../models/formula-node';
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
import { KatexDirective } from '../directives/katex.directive';
import { ExprNode } from '../models/lambda-node';
import { NdNode } from '../models/nd-node';
import { NdRule, NdRuleApplicationOptions } from '../models/nd-rule';
import { Equality } from '../utils/equality';
import { parseTerm, freeVarsFormula } from '../utils/quantifier-utils';
import { QuantifierInputModalComponent } from '../components/quantifier-input-modal/quantifier-input-modal';
import { DialogService } from 'primeng/dynamicdialog';
import { SplitterResizeEndEvent } from 'primeng/splitter';
import { firstValueFrom } from 'rxjs';
import { AppParseFacadeService } from '../services/app-parse-facade.service';
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
  CONDITIONAL_RULES,
  NAT_RULES,
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
  private dialogService: DialogService | null = null;
  code: string = '';
  proofTree: DerivationNode | null = null;
  naturalDeductionTree: NdNode | null = null;
  sequent: SequentNode | null = null;
  mode: 'auto' | 'interactive' = 'auto';
  interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  lambdaExpr: string = '';
  lambdaExprNode: ExprNode | null = null; // Store the ExprNode for type inference
  headerSection: HeaderSection = 'curry-howard';
  headerOption: HeaderOption = 'ch-expression-to-lambda';
  conversionMode: 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction' = 'natural-deduction';
  resultExpression: string = '';
  typeInferenceTree: TypeInferenceNode | null = null;
  activeExpressionLambdaTab: 'proof' | 'type' = 'proof';
  isPredicateLogic: boolean = false; // Track if predicate logic is detected

  // UI state (non-logic)
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
    'IF',
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
    { label: '∀x. P(x) ⇒ P(x)', code: '∀x. P(x) ⇒ P(x)' },
    { label: '∃x. P(x), ∀x. (P(x) → Q(x)) ⊢ ∃x. Q(x)', code: '∃x. P(x), ∀x. (P(x) → Q(x)) ⊢ ∃x. Q(x)' }
  ];
  lambdaExamples = [
    { label: 'λx:Bool. λy:Bool. x', code: 'λx:Bool. λy:Bool. x' },
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

  // Popup state
  popupVisible: boolean = false;
  popupPosition: { top: string; left: string } = { top: '0px', left: '0px' };
  popupX: number = 0;
  popupY: number = 0;
  popupNode: DerivationNode | NdNode | TypeInferenceNode | null = null;
  predictionRuleRequest: { node: DerivationNode, rule: string, requestId: number } | null = null;
  predictionTypeRuleRequest: { node: TypeInferenceNode, rule: string, requestId: number } | null = null;
  ndPredictionRequest: {
    node: NdNode;
    rule: NdRule;
    ruleOptions?: NdRuleApplicationOptions;
    expectedGoals: FormulaNode[];
    userPredictions: string[];
  } | null = null;

  // Rule arrays (from constants)
  conclusionRules = [...CONCLUSION_RULES];
  assumptionRules = [...ASSUMPTION_RULES];
  specialRules = [...SPECIAL_RULES];
  seqSidebarIdentityCutRules = ['id'];
  seqSidebarNegationRules = ['¬L', '¬R'];
  seqSidebarConjunctionRules = ['∧L', '∧R'];
  seqSidebarDisjunctionRules = ['∨R', '∨L'];
  seqSidebarImplicationRules = ['→R', '→L'];
  seqSidebarQuantifierRules = ['∀L', '∀R', '∃L', '∃R'];
  seqSidebarWeakeningRules = ['WL', 'WR'];
  ndIntroRules = [...ND_INTRO_RULES];
  ndElimRules = [...ND_ELIM_RULES];
  ndQuantifierRules = [...ND_QUANTIFIER_RULES];
  ndSidebarCoreRules = ['⊥E1', '⊥E2', '⊤I'];
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
  conditionalRules = [...CONDITIONAL_RULES];
  natRules = [...NAT_RULES];
  letRules = [...LET_RULES];

  /** Incremented on parseAndBuild to reset tree canvas pan/zoom */
  treeCanvasResetTrigger: number = 0;

  // History for step back (managed by TreeHistoryService)

  constructor(
    private logicParser: LogicParserService,
    private proofBuilder: ProofTreeBuilderService,
    private lambdaParser: LambdaParserService,
    private lambdaToExpression: LambdaToExpressionService,
    private typeInference: TypeInferenceService,
    private naturalDeductionBuilder: NaturalDeductionBuilderService,
    private ndLambdaBuilder: NdLambdaBuilderService,
    private parseFacade: AppParseFacadeService,
    @Inject(I18nService) private i18n: I18nService,
    private notification: NotificationService,
    private treeHistory: TreeHistoryService,
    private ruleFilter: RuleFilterService,
    private ruleFormula: RuleFormulaService,
    private formulaRender: FormulaRenderService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}

  private getDialogService(): DialogService {
    if (!this.dialogService) {
      this.dialogService = this.injector.get(DialogService);
    }
    return this.dialogService;
  }

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
    // Reset predicate logic flag when input changes
    // It will be recalculated when parseAndBuild is called
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

  private resetWorkspaceState(): void {
    this.code = '';
    this.proofTree = null;
    this.naturalDeductionTree = null;
    this.sequent = null;
    this.lambdaExpr = '';
    this.lambdaExprNode = null;
    this.isPredicateLogic = false;
    this.resultExpression = '';
    this.typeInferenceTree = null;
    this.selectedNode = null;
    this.selectedNdNode = null;
    this.selectedTypeNode = null;
    this.ruleError = null;
    this.ndPredictionRequest = null;
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
      this.selectedNode = null; // zatvorí popup
      this.closePopup();
    } else {
      this.selectedNode = node; // otvorí popup
    }
  }

  onProofPlusButtonClicked(event: { node: DerivationNode, x: number, y: number }) {
    this.selectedNode = event.node;
    this.popupNode = event.node;
    this.popupX = event.x;
    this.popupY = event.y;
    this.popupPosition = {
      top: `${this.popupY}px`,
      left: `${this.popupX}px`
    };
    this.popupVisible = true;
  }

  onNdNodeClicked(node: NdNode) {
    if (this.selectedNdNode === node) {
      this.selectedNdNode = null;
      this.closePopup();
    } else {
      this.selectedNdNode = node;
    }
  }

  onNdPlusButtonClicked(event: { node: NdNode, x: number, y: number }) {
    this.selectedNdNode = event.node;
    this.popupNode = event.node;
    this.popupX = event.x;
    this.popupY = event.y;
    this.popupPosition = {
      top: `${this.popupY}px`,
      left: `${this.popupX}px`
    };
    this.popupVisible = true;
  }

  onTypePlusButtonClicked(event: { node: TypeInferenceNode, x: number, y: number }) {
    this.selectedTypeNode = event.node;
    this.popupNode = event.node;
    this.popupX = event.x;
    this.popupY = event.y;
    this.popupPosition = {
      top: `${this.popupY}px`,
      left: `${this.popupX}px`
    };
    this.popupVisible = true;
  }

  closePopup() {
    this.popupVisible = false;
    this.popupNode = null;
  }

  onPopupPositionChange(pos: { x: number; y: number }) {
    this.popupX = pos.x;
    this.popupY = pos.y;
    this.popupPosition = { top: `${pos.y}px`, left: `${pos.x}px` };
  }

  onHeaderModeChange(mode: 'auto' | 'interactive') {
    this.mode = mode;
    this.parseAndBuild();
  }

  get filteredConclusionRules(): string[] {
    return this.ruleFilter.filterProofRules(this.conclusionRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredAssumptionRules(): string[] {
    return this.ruleFilter.filterProofRules(this.assumptionRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredSpecialRules(): string[] {
    return this.ruleFilter.filterProofRules(this.specialRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredNdIntroRules(): string[] {
    return this.ruleFilter.filterNdRules(this.ndIntroRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredNdElimRules(): string[] {
    return this.ruleFilter.filterNdRules(this.ndElimRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredNdQuantifierRules(): string[] {
    return this.ruleFilter.filterNdRules(this.ndQuantifierRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredBasicRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.basicRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredAbsRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.absRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredAppRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.appRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredPairRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.pairRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredDependentRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.dependentRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredSumRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.sumRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredConditionalRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.conditionalRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredNatRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.natRules, this.popupNode, this.interactiveSubmode);
  }

  get filteredLetRules(): string[] {
    return this.ruleFilter.filterTypeRules(this.letRules, this.popupNode, this.interactiveSubmode);
  }

  async onProofRuleClick(rule: string) {
    if (!this.popupNode) return;
    const popupNode = this.popupNode;
    this.closePopup();

    if (this.conversionMode === 'natural-deduction') {
      if (!('judgement' in popupNode)) return;
      if (this.interactiveSubmode === 'predict') {
        await this.beginNdPrediction(popupNode as NdNode, rule as NdRule);
        return;
      }
      this.applyNdRuleToNode({ node: popupNode as NdNode, rule: rule as NdRule });
      return;
    }

    if (!('sequent' in popupNode)) return;
    const node = popupNode as DerivationNode;
    
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
    if (!this.popupNode || !('expression' in this.popupNode)) return;
    const node = this.popupNode as TypeInferenceNode;
    this.closePopup();
    
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
      this.closePopup();
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
      const initialAssumptions = undefined;
      this.typeInferenceTree = this.mode === 'auto'
        ? this.typeInference.buildTypeInferenceTree(ndLambda, initialAssumptions)
        : this.typeInference.buildInteractiveRoot(ndLambda, initialAssumptions);
    } catch {
      this.typeInferenceTree = null;
    }
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

  async applyNdRuleToNode(event: { node: NdNode; rule: NdRule }) {
    const { node, rule } = event;

    const ruleOptions = await this.resolveNdRuleOptions(node, rule);
    if (ruleOptions === null) {
      this.selectedNdNode = null;
      return;
    }

    await this.applyNdRuleWithResolvedOptions(node, rule, ruleOptions);
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

  private async beginNdPrediction(node: NdNode, rule: NdRule): Promise<void> {
    const ruleOptions = await this.resolveNdRuleOptions(node, rule);
    if (ruleOptions === null) {
      this.selectedNdNode = null;
      return;
    }

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
        const expectedText = this.formulaToPredictionText(expectedGoals[index]);
        const message = this.currentLanguage === 'sk'
          ? `Nesprávna predikcia na pozícii ${index + 1}. Očakávané: ${expectedText}`
          : `Incorrect prediction at position ${index + 1}. Expected: ${expectedText}`;
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

  private formulaToPredictionText(formula: FormulaNode): string {
    switch (formula.kind) {
      case 'Var':
        return formula.name;
      case 'Predicate':
        return `${formula.name}(${formula.args.map((arg) => this.termToPredictionText(arg)).join(', ')})`;
      case 'Not':
        return `¬${this.wrapIfNeeded(formula.inner, formula)}`;
      case 'And':
        return `${this.wrapIfNeeded(formula.left, formula)} ∧ ${this.wrapIfNeeded(formula.right, formula)}`;
      case 'Or':
        return `${this.wrapIfNeeded(formula.left, formula)} ∨ ${this.wrapIfNeeded(formula.right, formula)}`;
      case 'Implies':
        return `${this.wrapIfNeeded(formula.left, formula)} ⇒ ${this.wrapIfNeeded(formula.right, formula)}`;
      case 'Forall':
        return `∀${formula.variable}. ${this.formulaToPredictionText(formula.body)}`;
      case 'Exists':
        return `∃${formula.variable}. ${this.formulaToPredictionText(formula.body)}`;
      case 'Paren':
        return `(${this.formulaToPredictionText(formula.inner)})`;
      case 'True':
        return '⊤';
      case 'False':
        return '⊥';
      default:
        return '';
    }
  }

  private termToPredictionText(term: TermNode): string {
    switch (term.kind) {
      case 'TermVar':
      case 'TermConst':
        return term.name;
      case 'TermFunc':
        return `${term.name}(${term.args.map((arg) => this.termToPredictionText(arg)).join(', ')})`;
      default:
        return '';
    }
  }

  private wrapIfNeeded(child: FormulaNode, parent: FormulaNode): string {
    const childRank = this.formulaPrecedence(child);
    const parentRank = this.formulaPrecedence(parent);
    const rendered = this.formulaToPredictionText(child);
    return childRank < parentRank ? `(${rendered})` : rendered;
  }

  private formulaPrecedence(formula: FormulaNode): number {
    switch (formula.kind) {
      case 'Var':
      case 'Predicate':
      case 'True':
      case 'False':
        return 5;
      case 'Forall':
      case 'Exists':
        return 4;
      case 'Not':
        return 3;
      case 'And':
        return 2;
      case 'Or':
        return 1;
      case 'Implies':
        return 0;
      case 'Paren':
        return 6;
      default:
        return -1;
    }
  }

  private async resolveNdRuleOptions(node: NdNode, rule: NdRule): Promise<NdRuleApplicationOptions | null | undefined> {
    if (rule !== '∀I' && rule !== '∀E' && rule !== '∃I' && rule !== '∃E') {
      return undefined;
    }

    const language = this.currentLanguage;
    const collectFreeVars = (formulas: FormulaNode[]): string[] => {
      const vars = new Set<string>();
      for (const formula of formulas) {
        for (const variable of freeVarsFormula(formula)) {
          vars.add(variable);
        }
      }
      return [...vars].sort((left, right) => left.localeCompare(right));
    };

    if (rule === '∀I' || rule === '∃E') {
      const freeVars = rule === '∀I'
        ? collectFreeVars(node.judgement.context)
        : collectFreeVars([...node.judgement.context, node.judgement.goal]);

      const ruleType = rule === '∀I' ? 'forall-right' : 'exists-left';
      const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
        data: {
          ruleType,
          freeVars,
          language
        },
        width: '500px',
        modal: true
      });
      if (!dialogRef) return null;

      const result = await firstValueFrom(dialogRef.onClose);
      if (!result) return null;

      const value = String(result).trim();
      if (rule === '∀I') {
        return { eigenVariable: value };
      }
      return { eigenVariable: value };
    }

    const ruleType = rule === '∀E' ? 'forall-left' : 'exists-right';
    const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
      data: {
        ruleType,
        language
      },
      width: '500px',
      modal: true
    });
    if (!dialogRef) return null;

    const result = await firstValueFrom(dialogRef.onClose);
    if (!result) return null;

    const parsedTerm = parseTerm(String(result).trim());
    if (!parsedTerm) {
      throw new Error(
        this.currentLanguage === 'sk'
          ? 'Neplatný term pre kvantifikačné pravidlo.'
          : 'Invalid term for quantifier rule.'
      );
    }

    return { instantiationTerm: parsedTerm };
  }

  async parseAndBuild() {
    // Check if code is empty
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
    // Reset predicate logic flag (will be recalculated in parseExpressionToLambda)
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
        ? 'Vzorec nie je dokázateľný v intuicionistickej prirodzenej dedukcii.'
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
      this.lambdaExpr = parsed.lambdaExpr;
    } catch (error: unknown) {
      this.resultExpression = '';
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