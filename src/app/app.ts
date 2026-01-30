import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { LogicParserService } from '../services/logic-parser-service';
import { ProofTreeBuilderService } from '../services/proof-tree-builder';
import { DerivationNode, SequentNode, FormulaNode } from '../models/formula-node';
import { LambdaBuilderService } from '../services/lambda-builder-service';
import { LambdaParserService } from '../services/lambda-parser-service';
import { LambdaToExpressionService } from '../services/lambda-to-expression-service';
import { TypeInferenceService, TypeInferenceNode } from '../services/type-inference-service';
import { FormulaTypeService } from '../services/formula-type-service';
import { I18nService, AppTranslations } from '@services/i18n.service';
import { NotificationService } from '../services/notification.service';
import { TreeHistoryService } from '../services/tree-history.service';
import { RuleFilterService } from '../services/rule-filter.service';
import { ExprNode, TypeNode } from '../models/lambda-node';
import {
  CONCLUSION_RULES,
  ASSUMPTION_RULES,
  SPECIAL_RULES,
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

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: false,
})
export class App {
  code: string = '';
  proofTree: DerivationNode | null = null;
  sequent: SequentNode | null = null;
  mode: 'auto' | 'interactive' = 'auto';
  interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  lambdaExpr: string = '';
  lambdaExprNode: ExprNode | null = null; // Store the ExprNode for type inference
  conversionMode: 'expression-to-lambda' | 'lambda-to-expression' = 'expression-to-lambda';
  resultExpression: string = '';
  typeInferenceTree: TypeInferenceNode | null = null;
  typeInferenceTreeForLambda: TypeInferenceNode | null = null;
  isPredicateLogic: boolean = false; // Track if predicate logic is detected
  activeTab: 'proof' | 'typeInference' = 'proof'; // Active tab in expression-to-lambda mode
  /** When user proves in expression→lambda, store assumption types so lambda→expression can use them for the generated lambda. */
  storedLambdaInitialAssumptions: Map<string, TypeNode> | null = null;

  // UI state (non-logic)
  helpVisible: boolean = false;
  slidePanelVisible: boolean = false;
  currentLanguage: 'sk' | 'en' = 'sk';
  currentYear: number = new Date().getFullYear();
  panelSizes: number[] = [33, 67];

  get t() {
    return this.i18n.t(this.currentLanguage);
  }

  expressionExamples = [
    { label: 'p ⇒ q ⇒ p ∧ q', code: 'p => q => p && q' },
    { label: '(p ⇒ q) ⇒ (¬q ⇒ ¬p)', code: '(p => q) => (!q => !p)' },
    { label: 'p ∧ q ⇒ p', code: '(p && q) => p' },
    { label: 'p ⇒ p ∨ q', code: 'p => (p || q)' },
    { label: '∀x. P(x) ⇒ P(x)', code: 'forall x. P(x) => P(x)' },
    { label: '∃x. P(x), ∀x. (P(x) → Q(x)) ⊢ ∃x. Q(x)', code: 'exists x. P(x), forall x. (P(x) => Q(x)) |- exists x. Q(x)' }
  ];
  lambdaExamples = [
    { label: '\\x:Bool. \\y:Bool. x', code: '\\x:Bool. \\y:Bool. x' },
    { label: '\\f:(A⇒B). \\x:A. f x', code: '\\f:(A->B). \\x:A. f x' },
    { label: '\\x:A. x', code: '\\x:A. x' },
    { label: '\\x:A. \\y:B. ⟨x,y⟩', code: '\\x:A. \\y:B. <x,y>' },
    { label: '\\x: T. \\p: P(x). p', code: '\\x: T. \\p: P(x). p' },
    { label: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, ((f x) p)⟩', code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, ((f x) p)⟩' },
  ];

  selectedNode: DerivationNode | null = null;
  selectedTypeNode: TypeInferenceNode | null = null;
  ruleError: string | null = null;

  // Popup state
  popupVisible: boolean = false;
  popupPosition: { top: string; left: string } = { top: '0px', left: '0px' };
  popupX: number = 0;
  popupY: number = 0;
  popupNode: DerivationNode | TypeInferenceNode | null = null;
  predictionRuleRequest: { node: DerivationNode, rule: string } | null = null;
  predictionTypeRuleRequest: { node: TypeInferenceNode, rule: string } | null = null;

  // Rule arrays (from constants)
  conclusionRules = [...CONCLUSION_RULES];
  assumptionRules = [...ASSUMPTION_RULES];
  specialRules = [...SPECIAL_RULES];
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
    private lambdaBuilder: LambdaBuilderService,
    private lambdaParser: LambdaParserService,
    private lambdaToExpression: LambdaToExpressionService,
    private typeInference: TypeInferenceService,
    private formulaType: FormulaTypeService,
    @Inject(I18nService) private i18n: I18nService,
    private notification: NotificationService,
    private treeHistory: TreeHistoryService,
    private ruleFilter: RuleFilterService,
    private cdr: ChangeDetectorRef
  ) {}

  onSplitterResizeEnd(e?: { sizes?: number[] }): void {
    const sizes = e?.sizes ?? this.panelSizes;
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

  switchMode(newMode: 'expression-to-lambda' | 'lambda-to-expression') {
    this.conversionMode = newMode;
    this.code = '';
    this.proofTree = null;
    this.sequent = null;
    this.lambdaExpr = '';
    this.lambdaExprNode = null;
    this.typeInferenceTreeForLambda = null;
    this.isPredicateLogic = false;
    this.activeTab = 'proof';
    this.resultExpression = '';
    this.typeInferenceTree = null;
    this.selectedNode = null;
    this.selectedTypeNode = null;
    this.ruleError = null;
    this.treeHistory.clear();
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

  onProofRuleClick(rule: string) {
    if (!this.popupNode || !('sequent' in this.popupNode)) return;
    const node = this.popupNode as DerivationNode;
    this.closePopup();
    
    if (this.interactiveSubmode === 'predict') {
      // For predict mode, trigger prediction setup in proof-tree component
      // Reset first to ensure change detection triggers
      this.predictionRuleRequest = null;
      // Use setTimeout to ensure change detection runs
      setTimeout(() => {
        // Create new object to ensure change detection
        this.predictionRuleRequest = { node, rule };
      }, 0);
    } else {
      this.applyRuleToNode({ node, rule });
    }
  }

  onTypeRuleClick(rule: string) {
    if (!this.popupNode || !('expression' in this.popupNode)) return;
    const node = this.popupNode as TypeInferenceNode;
    this.closePopup();
    
    if (this.interactiveSubmode === 'predict') {
      // For predict mode, trigger prediction setup in type-inference-tree component
      // Reset first to ensure change detection triggers
      this.predictionTypeRuleRequest = null;
      // Use setTimeout to ensure change detection runs
      setTimeout(() => {
        // Create new object to ensure change detection
        this.predictionTypeRuleRequest = { node, rule };
      }, 0);
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

  buildLambda() {
    if( this.proofTree && this.sequent){
      const lambda = this.lambdaBuilder.buildLambda(this.proofTree, this.sequent);
      this.lambdaExpr = this.lambdaBuilder.exprToString(lambda);
      this.lambdaExprNode = lambda; // Store the ExprNode for type inference
      // Build type inference tree for the lambda expression with initial assumptions from sequent
      if (lambda) {
        try {
          const initialAssumptions = this.buildInitialAssumptionsForLambda();
          this.storedLambdaInitialAssumptions = initialAssumptions;
          this.typeInferenceTreeForLambda = this.typeInference.buildTypeInferenceTree(lambda, initialAssumptions);
        } catch {
          this.typeInferenceTreeForLambda = null;
        }
      }
    }
  }

  /** Build map of free variable names to types from sequent assumptions (for proof-generated lambdas). */
  private buildInitialAssumptionsForLambda(): Map<string, TypeNode> {
    const assumptions = new Map<string, TypeNode>();
    if (!this.sequent?.assumptionVars) return assumptions;
    for (const formula of this.sequent.assumptions) {
      const varName = this.sequent.assumptionVars.get(formula);
      if (varName) {
        assumptions.set(varName, this.formulaType.formulaToType(formula));
      }
    }
    return assumptions;
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
        this.buildLambda();
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

  parseAndBuild() {
    this.treeHistory.clear();
    this.treeCanvasResetTrigger++;
    // Reset predicate logic flag (will be recalculated in parseExpressionToLambda)
    this.isPredicateLogic = false;
    
    try {
      if (this.conversionMode === 'expression-to-lambda') {
        this.parseExpressionToLambda();
      } else {
        this.parseLambdaToExpression();
      }
    } catch (e: unknown) {
      this.proofTree = null;
      this.sequent = null;
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
      this.typeInferenceTreeForLambda = null;
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
    this.sequent = this.logicParser.parseFormula(this.code);

    // Check if predicate logic is used
    this.isPredicateLogic = this.containsPredicateLogic(this.sequent);
    
    // If predicate logic is detected, automatically switch to interactive mode
    if (this.isPredicateLogic && this.mode === 'auto') {
      this.mode = 'interactive';
    }

    if (this.mode === 'auto' && !this.isPredicateLogic) {
      this.proofTree = await this.proofBuilder.buildProof(this.sequent);
    } else {
      this.proofTree = this.proofBuilder.buildInteractiveRoot(this.sequent);
    }

    this.buildLambda();
  }

  /**
   * Check if a sequent contains predicate logic (quantifiers or predicates)
   */
  private containsPredicateLogic(sequent: SequentNode | null): boolean {
    if (!sequent) return false;
    
    const checkFormula = (f: FormulaNode): boolean => {
      switch (f.kind) {
        case 'Forall':
        case 'Exists':
        case 'Predicate':
          return true;
        case 'Implies':
          return checkFormula(f.left) || checkFormula(f.right);
        case 'And':
        case 'Or':
          return checkFormula(f.left) || checkFormula(f.right);
        case 'Not':
        case 'Paren':
          return checkFormula(f.inner);
        default:
          return false;
      }
    };
    
    // Check assumptions and conclusions
    for (const assumption of sequent.assumptions) {
      if (checkFormula(assumption)) return true;
    }
    for (const conclusion of sequent.conclusions) {
      if (checkFormula(conclusion)) return true;
    }
    
    return false;
  }

  private parseLambdaToExpression() {
    try {
      const lambdaExpr = this.lambdaParser.parseLambdaExpression(this.code);
      // Use stored assumption types from expression→lambda when available (e.g. user pasted the generated lambda)
      const initialAssumptions = this.storedLambdaInitialAssumptions ?? undefined;

      if (this.mode === 'auto') {
        this.typeInferenceTree = this.typeInference.buildTypeInferenceTree(lambdaExpr, initialAssumptions);
      } else {
        this.typeInferenceTree = initialAssumptions
          ? this.typeInference.buildInteractiveRoot(lambdaExpr, initialAssumptions)
          : this.typeInference.buildInteractiveRoot(lambdaExpr);
      }
      
      if (this.typeInferenceTree) {
        this.resultExpression = this.lambdaToExpression.convertLambdaToExpression(lambdaExpr, this.typeInferenceTree.inferredType);
      }
      
      this.lambdaExpr = this.lambdaParser.formatLambdaExpression(lambdaExpr);
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
        this.buildLambda();
        this.selectedNode = null;
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
}