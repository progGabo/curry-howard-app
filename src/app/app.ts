import { Component, ChangeDetectorRef } from '@angular/core';
import { LogicParserService } from '../services/logic-parser-service';
import { ProofTreeBuilderService } from '../services/proof-tree-builder'; 
import { DerivationNode, SequentNode, FormulaNode } from '../models/formula-node';
import { LambdaBuilderService } from '../services/lambda-builder-service';
import { LambdaParserService } from '../services/lambda-parser-service';
import { LambdaToExpressionService } from '../services/lambda-to-expression-service';
import { TypeInferenceService, TypeInferenceNode } from '../services/type-inference-service';
import { MessageService } from 'primeng/api';
import { ExprNode } from '../models/lambda-node';

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

  // UI state (non-logic)
  helpVisible: boolean = false;
  slidePanelVisible: boolean = false;
  currentLanguage: 'sk' | 'en' = 'sk';
  currentYear: number = new Date().getFullYear();
  panelSizes: number[] = [33, 67];

  // Translations
  translations = {
    sk: {
      appName: 'Curry–Howard Izomorfizmus',
      help: 'Help',
      exprToLambda: 'Výraz → Lambda',
      lambdaToExpr: 'Lambda → Výraz',
      examples: 'Príklady',
      chooseExampleExpr: 'Vyberte príklad (Výraz → Lambda)',
      chooseExampleLambda: 'Vyberte príklad (Lambda → Typ)',
      generateProof: 'Generovať dôkaz',
      convertLambda: 'Konvertuj lambda',
      autoMode: 'Auto mód',
      interactiveMode: 'Interaktívny mód',
      applicableOnly: 'Iba použiteľné',
      allRules: 'Všetky pravidlá',
      predictNext: 'Predpovedať ďalší',
      proofTree: 'Dôkazový strom',
      typeInferenceTree: 'Strom odvodenia typu',
      lambdaExpr: 'Lambda výraz:',
      lambdaExpression: 'Lambda-výraz',
      exprType: 'Typ výrazu:',
      helpTitle: 'Ako používať aplikáciu',
      helpLanguage: 'Jazyky môžete prepínať pomocou tlačidiel SK/EN v hlavičke.',
      close: 'Zavrieť',
      footerText: 'Curry-Howard Aplikácia',
      stepBack: 'Krok späť',
      // Error messages
      errorRuleCannotBeApplied: 'Pravidlo {rule} sa nedá aplikovať na tento uzol.',
      errorApplyingRule: 'Chyba pri aplikovaní pravidla {rule}: {message}',
      errorParsing: 'Chyba pri parsovaní',
      errorLambdaConversion: 'Chyba pri konverzii lambda výrazu',
      errorRuleCannotBeAppliedToSequent: 'Toto pravidlo sa nedá aplikovať na tento sekvent.',
      errorFillAllFields: 'Prosím vyplňte všetky polia.',
      errorInvalidSequentFormat: 'Neplatný formát sekventu. Použite formát: "A, B ⊢ C, D"',
      errorExpectedSequents: 'Očakávané {expected} sekvent(ov), získané {got}.',
      errorIncorrectAtPosition: 'Nesprávne na pozícii {position}! Očakávané: {expected}'
    },
    en: {
      appName: 'Curry–Howard Isomorphism',
      help: 'Help',
      exprToLambda: 'Expression → Lambda',
      lambdaToExpr: 'Lambda → Expression',
      examples: 'Examples',
      chooseExampleExpr: 'Choose example (Expr → Lambda)',
      chooseExampleLambda: 'Choose example (Lambda → Type)',
      generateProof: 'Generate proof',
      convertLambda: 'Convert lambda',
      autoMode: 'Auto mode',
      interactiveMode: 'Interactive mode',
      applicableOnly: 'Applicable only',
      allRules: 'All rules',
      predictNext: 'Predict next',
      proofTree: 'Proof Tree',
      typeInferenceTree: 'Type Inference Tree',
      lambdaExpr: 'Lambda expression:',
      lambdaExpression: 'Lambda Expression',
      exprType: 'Expression type:',
      helpTitle: 'How to use the app',
      helpLanguage: 'You can switch languages using the SK/EN buttons in the header.',
      close: 'Close',
      footerText: 'Curry–Howard App',
      stepBack: 'Step Back',
      // Error messages
      errorRuleCannotBeApplied: 'Rule {rule} cannot be applied to this node.',
      errorApplyingRule: 'Error applying rule {rule}: {message}',
      errorParsing: 'Error parsing',
      errorLambdaConversion: 'Error in lambda to expression conversion',
      errorRuleCannotBeAppliedToSequent: 'This rule cannot be applied to this sequent.',
      errorFillAllFields: 'Please fill all prediction fields.',
      errorInvalidSequentFormat: 'Invalid sequent format. Use format: "A, B ⊢ C, D"',
      errorExpectedSequents: 'Expected {expected} sequent(s), got {got}.',
      errorIncorrectAtPosition: 'Incorrect at position {position}! Expected: {expected}'
    }
  };

  get t() {
    return this.translations[this.currentLanguage];
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
  ];

  selectedNode: DerivationNode | null = null;
  selectedTypeNode: TypeInferenceNode | null = null;
  ruleError: string | null = null;

  // Popup state
  popupVisible: boolean = false;
  popupPosition: { top: string; left: string } = { top: '0px', left: '0px' };
  popupX: number = 0;
  popupY: number = 0;
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  popupNode: DerivationNode | TypeInferenceNode | null = null;
  predictionRuleRequest: { node: DerivationNode, rule: string } | null = null;
  predictionTypeRuleRequest: { node: TypeInferenceNode, rule: string } | null = null;

  // Rule arrays
  conclusionRules = ['→R', '∧R', '∨R', '¬R', '∀R', '∃R'];
  assumptionRules = ['→L', '∧L', '∨L', '¬L', '∀L', '∃L'];
  specialRules = ['WR', 'WL', 'Ax'];
  
  basicRules = ['Var', 'True', 'False', 'Zero'];
  absRules = ['Abs'];
  appRules = ['App'];
  pairRules = ['Pair', 'LetPair'];
  dependentRules = ['DependentAbs', 'DependentPair', 'LetDependentPair'];
  sumRules = ['Inl', 'Inr', 'Case'];
  conditionalRules = ['If'];
  natRules = ['Succ', 'Pred', 'IsZero'];
  letRules = ['Let'];

  // Tree canvas pan and zoom
  treePanX: number = 0;
  treePanY: number = 0;
  treeZoom: number = 1;
  isPanning: boolean = false;
  panStartX: number = 0;
  panStartY: number = 0;

  // History for step back functionality
  proofTreeHistory: DerivationNode[] = [];
  typeInferenceTreeHistory: TypeInferenceNode[] = [];

  constructor(
    private logicParser: LogicParserService,
    private proofBuilder: ProofTreeBuilderService,
    private lambdaBuilder: LambdaBuilderService,
    private lambdaParser: LambdaParserService,
    private lambdaToExpression: LambdaToExpressionService,
    private typeInference: TypeInferenceService,
    private messageService: MessageService,
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

  private showError(key: string, params?: { [key: string]: string | number }) {
    let message = (this.t as typeof this.translations.sk)[key as keyof typeof this.translations.sk] as string || key;
    
    // Replace parameters in message
    if (params) {
      Object.keys(params).forEach(param => {
        message = message.replace(`{${param}}`, String(params[param]));
      });
    }
    
    this.messageService.add({
      severity: 'error',
      summary: this.currentLanguage === 'sk' ? 'Chyba' : 'Error',
      detail: message,
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
    // Clear history when switching modes
    this.proofTreeHistory = [];
    this.typeInferenceTreeHistory = [];
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

  onPopupDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.popupX;
    this.dragStartY = event.clientY - this.popupY;
    event.preventDefault();
  }

  onPopupDragMove(event: MouseEvent) {
    if (this.isDragging) {
      this.popupX = event.clientX - this.dragStartX;
      this.popupY = event.clientY - this.dragStartY;
      this.popupPosition = {
        top: `${this.popupY}px`,
        left: `${this.popupX}px`
      };
    }
  }

  onPopupDragEnd() {
    this.isDragging = false;
  }

  // Rule filtering for proof tree
  get filteredConclusionRules(): string[] {
    return this.filterProofRules(this.conclusionRules, 'conclusion');
  }

  get filteredAssumptionRules(): string[] {
    return this.filterProofRules(this.assumptionRules, 'assumption');
  }

  get filteredSpecialRules(): string[] {
    return this.filterProofRules(this.specialRules, 'special');
  }

  private filterProofRules(rules: string[], kind: 'conclusion' | 'assumption' | 'special'): string[] {
    if (this.interactiveSubmode !== 'applicable' || !this.popupNode || !('sequent' in this.popupNode)) return rules;
    const node = this.popupNode as DerivationNode;
    const s = node.sequent;
    const hasInConcl = (k: string) => s.conclusions.some(f => f.kind === k as any);
    const hasInAssump = (k: string) => s.assumptions.some(f => f.kind === k as any);

    return rules.filter(r => {
      switch (r) {
        case '→R': return hasInConcl('Implies');
        case '∧R': return hasInConcl('And');
        case '∨R': return hasInConcl('Or');
        case '¬R': return hasInConcl('Not');
        case '∀R': return hasInConcl('Forall');
        case '∃R': return hasInConcl('Exists');
        case '→L': return hasInAssump('Implies');
        case '∧L': return hasInAssump('And');
        case '∨L': return hasInAssump('Or');
        case '¬L': return hasInAssump('Not');
        case '∀L': return hasInAssump('Forall');
        case '∃L': return hasInAssump('Exists');
        case 'WL':
        case 'WR':
          return true; // allow weakening heuristically
        case 'Ax':
          return true; // axiom always selectable
        default:
          return true;
      }
    });
  }

  // Rule filtering for type inference tree
  get filteredBasicRules(): string[] {
    return this.filterTypeRules(this.basicRules);
  }

  get filteredAbsRules(): string[] {
    return this.filterTypeRules(this.absRules);
  }

  get filteredAppRules(): string[] {
    return this.filterTypeRules(this.appRules);
  }

  get filteredPairRules(): string[] {
    return this.filterTypeRules(this.pairRules);
  }

  get filteredDependentRules(): string[] {
    return this.filterTypeRules(this.dependentRules);
  }

  get filteredSumRules(): string[] {
    return this.filterTypeRules(this.sumRules);
  }

  get filteredConditionalRules(): string[] {
    return this.filterTypeRules(this.conditionalRules);
  }

  get filteredNatRules(): string[] {
    return this.filterTypeRules(this.natRules);
  }

  get filteredLetRules(): string[] {
    return this.filterTypeRules(this.letRules);
  }

  private filterTypeRules(rules: string[]): string[] {
    if (this.interactiveSubmode !== 'applicable' || !this.popupNode || !('expression' in this.popupNode)) return rules;
    const node = this.popupNode as TypeInferenceNode;
    const expr = node.expression;
    return rules.filter(r => {
      switch (r) {
        case 'Var': return expr.kind === 'Var';
        case 'Abs': return expr.kind === 'Abs';
        case 'App': return expr.kind === 'App';
        case 'Pair': return expr.kind === 'Pair';
        case 'LetPair': return expr.kind === 'LetPair';
        case 'Inl': return expr.kind === 'Inl';
        case 'Inr': return expr.kind === 'Inr';
        case 'Case': return expr.kind === 'Case';
        case 'If': return expr.kind === 'If';
        case 'Let': return expr.kind === 'Let';
        case 'True': return expr.kind === 'True';
        case 'False': return expr.kind === 'False';
        case 'Zero': return expr.kind === 'Zero';
        case 'Succ': return expr.kind === 'Succ';
        case 'Pred': return expr.kind === 'Pred';
        case 'IsZero': return expr.kind === 'IsZero';
        case 'DependentAbs': return expr.kind === 'DependentAbs';
        case 'DependentPair': return expr.kind === 'DependentPair';
        case 'LetDependentPair': return expr.kind === 'LetDependentPair';
        default: return true;
      }
    });
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
    
    // Save current state to history before applying rule
    if (this.typeInferenceTree) {
      this.typeInferenceTreeHistory.push(this.deepCopyTypeInferenceNode(this.typeInferenceTree));
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
          this.resultExpression = this.typeInference.formatType(this.typeInferenceTree.inferredType);
        }
      } else {
        // If rule application failed, remove the last history entry
        if (this.typeInferenceTreeHistory.length > 0) {
          this.typeInferenceTreeHistory.pop();
        }
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      // If rule application failed, remove the last history entry
      if (this.typeInferenceTreeHistory.length > 0) {
        this.typeInferenceTreeHistory.pop();
      }
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
      // Build type inference tree for the lambda expression
      if (lambda) {
        try {
          this.typeInferenceTreeForLambda = this.typeInference.buildTypeInferenceTree(lambda);
        } catch (error) {
          console.error('Error building type inference tree:', error);
          this.typeInferenceTreeForLambda = null;
        }
      }
    }
  }


  async applyRuleToNode(event: { node: DerivationNode; rule: string }) {
    const { node, rule } = event;
    
    // Save current state to history before applying rule
    if (this.proofTree) {
      this.proofTreeHistory.push(this.deepCopyDerivationNode(this.proofTree));
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
        // If rule application failed, remove the last history entry
        if (this.proofTreeHistory.length > 0) {
          this.proofTreeHistory.pop();
        }
        this.showError('errorRuleCannotBeApplied', { rule });
      }
    } catch (error: any) {
      // If rule application failed (e.g., user cancelled or validation error), remove the last history entry
      if (this.proofTreeHistory.length > 0) {
        this.proofTreeHistory.pop();
      }
      const errorMsg = error?.message || 'Rule application failed';
      this.messageService.add({
        severity: 'error',
        summary: this.currentLanguage === 'sk' ? 'Chyba' : 'Error',
        detail: errorMsg,
        life: 5000
      });
    }

    this.selectedNode = null;
  }

  parseAndBuild() {
    // Clear history when rebuilding
    this.proofTreeHistory = [];
    this.typeInferenceTreeHistory = [];
    
    // Reset pan and zoom
    this.treePanX = 0;
    this.treePanY = 0;
    this.treeZoom = 1;
    
    // Reset predicate logic flag (will be recalculated in parseExpressionToLambda)
    this.isPredicateLogic = false;
    
    try {
      if (this.conversionMode === 'expression-to-lambda') {
        this.parseExpressionToLambda();
      } else {
        this.parseLambdaToExpression();
      }
    } catch (e: any) {
      console.error("Chyba pri parsovaní:", e);
      this.proofTree = null;
      this.sequent = null;
      this.lambdaExpr = '';
      this.lambdaExprNode = null;
      this.typeInferenceTreeForLambda = null;
      this.resultExpression = '';
      const errorMsg = e?.message ? `: ${e.message}` : '';
      const fullMessage = this.t.errorParsing + errorMsg;
      this.messageService.add({
        severity: 'error',
        summary: this.currentLanguage === 'sk' ? 'Chyba' : 'Error',
        detail: fullMessage,
        life: 7000
      });
    }
  }

  private async parseExpressionToLambda() {
    this.sequent = this.logicParser.parseFormula(this.code);
    console.log('Parsed Sequent:', this.sequent);

    // Check if predicate logic is used
    this.isPredicateLogic = this.containsPredicateLogic(this.sequent);
    
    // If predicate logic is detected, automatically switch to interactive mode
    if (this.isPredicateLogic && this.mode === 'auto') {
      this.mode = 'interactive';
    }

    if (this.mode === 'auto' && !this.isPredicateLogic) {
      this.proofTree = await this.proofBuilder.buildProof(this.sequent);
      console.log("Tree: ", this.proofTree);
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
      
      if (this.mode === 'auto') {
        this.typeInferenceTree = this.typeInference.buildTypeInferenceTree(lambdaExpr);
      } else {
        this.typeInferenceTree = this.typeInference.buildInteractiveRoot(lambdaExpr);
      }
      
      if (this.typeInferenceTree) {
        this.resultExpression = this.typeInference.formatType(this.typeInferenceTree.inferredType);
      }
      
      this.lambdaExpr = this.lambdaParser.formatLambdaExpression(lambdaExpr);
      
      console.log('Parsed Lambda:', lambdaExpr);
      console.log('Type Inference Tree:', this.typeInferenceTree);
      console.log('Inferred Type:', this.resultExpression);
    } catch (error: any) {
      console.error('Error in lambda to expression conversion:', error);
      this.resultExpression = '';
      this.lambdaExpr = this.code;
      this.typeInferenceTree = null;
      const errorMsg = error?.message ? `: ${error.message}` : '';
      const fullMessage = this.t.errorLambdaConversion + errorMsg;
      this.messageService.add({
        severity: 'error',
        summary: this.currentLanguage === 'sk' ? 'Chyba' : 'Error',
        detail: fullMessage,
        life: 7000
      });
    }
  }

  stepBack() {
    if (this.conversionMode === 'expression-to-lambda' && this.proofTreeHistory.length > 0) {
      // Restore previous proof tree state
      this.proofTree = this.proofTreeHistory.pop() || null;
      this.buildLambda();
      this.selectedNode = null;
      this.ruleError = null;
    } else if (this.conversionMode === 'lambda-to-expression' && this.typeInferenceTreeHistory.length > 0) {
      // Restore previous type inference tree state
      this.typeInferenceTree = this.typeInferenceTreeHistory.pop() || null;
      if (this.typeInferenceTree) {
        this.resultExpression = this.typeInference.formatType(this.typeInferenceTree.inferredType);
      }
      this.selectedTypeNode = null;
      this.ruleError = null;
    }
  }

  get canStepBack(): boolean {
    if (this.conversionMode === 'expression-to-lambda') {
      return this.proofTreeHistory.length > 0;
    } else {
      return this.typeInferenceTreeHistory.length > 0;
    }
  }

  // Deep copy functions for history
  private deepCopyDerivationNode(node: DerivationNode): DerivationNode {
    return {
      rule: node.rule,
      sequent: {
        assumptions: JSON.parse(JSON.stringify(node.sequent.assumptions)),
        conclusions: JSON.parse(JSON.stringify(node.sequent.conclusions))
      },
      children: node.children ? node.children.map(child => this.deepCopyDerivationNode(child)) : [],
      usedFormula: node.usedFormula ? JSON.parse(JSON.stringify(node.usedFormula)) : undefined,
      id: node.id,
      ui: node.ui ? { ...node.ui } : undefined
    };
  }

  private deepCopyTypeInferenceNode(node: TypeInferenceNode): TypeInferenceNode {
    // Deep copy assumptions Map
    const assumptionsCopy = new Map<string, any>();
    node.assumptions.forEach((value, key) => {
      assumptionsCopy.set(key, JSON.parse(JSON.stringify(value)));
    });
    
    return {
      id: node.id,
      expression: JSON.parse(JSON.stringify(node.expression)),
      assumptions: assumptionsCopy,
      inferredType: JSON.parse(JSON.stringify(node.inferredType)),
      rule: node.rule,
      children: node.children ? node.children.map(child => this.deepCopyTypeInferenceNode(child)) : [],
      ui: node.ui ? { ...node.ui } : undefined
    };
  }

  onTreeCanvasMouseDown(event: MouseEvent) {
    // Pan with middle mouse button, or Ctrl/Cmd + left click, or if clicking on canvas background
    const target = event.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('tree-canvas') || 
                               target.classList.contains('tree-canvas-container');
    const isMiddleButton = event.button === 1;
    const isModifierKey = (event.ctrlKey || event.metaKey) && event.button === 0;
    
    // Don't pan if clicking on interactive elements (buttons, inputs, popups, nodes)
    const isInteractiveElement = target.closest('button, input, .rule-menu-popup, .conclusion, .sequent-content, .rule-plus-btn, .prediction-inputs');
    
    if ((isMiddleButton || isModifierKey) && !isInteractiveElement) {
      this.isPanning = true;
      this.panStartX = event.clientX - this.treePanX;
      this.panStartY = event.clientY - this.treePanY;
      event.preventDefault();
      event.stopPropagation();
    } else if (isCanvasBackground && !isInteractiveElement) {
      // Only pan on background if no interactive element
      this.isPanning = true;
      this.panStartX = event.clientX - this.treePanX;
      this.panStartY = event.clientY - this.treePanY;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onTreeCanvasMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.treePanX = event.clientX - this.panStartX;
      this.treePanY = event.clientY - this.panStartY;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onTreeCanvasMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isPanning = false;
  }

  onTreeCanvasWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, this.treeZoom * delta));
    
    // Zoom towards mouse position
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate the point in the transformed coordinate system
    const worldX = (mouseX - this.treePanX) / this.treeZoom;
    const worldY = (mouseY - this.treePanY) / this.treeZoom;
    
    // Apply new zoom
    this.treeZoom = newZoom;
    
    // Adjust pan to keep the same point under the mouse
    this.treePanX = mouseX - worldX * this.treeZoom;
    this.treePanY = mouseY - worldY * this.treeZoom;
  }
}