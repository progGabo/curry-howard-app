import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TypeInferenceNode } from '../../services/type-inference-service';
import { ExprNode } from '../../models/lambda-node';
import { LambdaParserService } from '../../services/lambda-parser-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-type-inference-tree',
  standalone: false,
  templateUrl: './type-inference-tree.html',
  styleUrl: './type-inference-tree.scss'
})
export class TypeInferenceTree implements OnChanges {
  @Input() root: TypeInferenceNode | null = null;
  @Input() selectedNode: TypeInferenceNode | null = null;
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() predictionRuleRequest: { node: TypeInferenceNode, rule: string } | null = null;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Output() nodeClicked = new EventEmitter<TypeInferenceNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: TypeInferenceNode, x: number, y: number }>();
  @Output() ruleSelected = new EventEmitter<{ node: TypeInferenceNode, rule: string }>();

  private translations = {
    sk: {
      errorFillAllFields: 'Prosím vyplňte všetky polia.',
      errorInvalidExpression: 'Neplatný výraz',
      errorInvalidExpressionAtPosition: 'Neplatný výraz',
      errorIncorrectAtPosition: 'Neplatny výraz',
      errorCannotApplyRule: 'Toto pravidlo sa nedá aplikovať na tento výraz.',
      errorExpectedCount: 'Očakávané {expected} predikcií, získané {got}.'
    },
    en: {
      errorFillAllFields: 'Please fill all fields.',
      errorInvalidExpression: 'Invalid expression',
      errorInvalidExpressionAtPosition: 'Invalid expression',
      errorIncorrectAtPosition: 'Invalid expression',
      errorCannotApplyRule: 'This rule cannot be applied to this expression.',
      errorExpectedCount: 'Expected {expected} prediction(s), got {got}.'
    }
  };

  constructor(
    private lambdaParser: LambdaParserService,
    private messageService: MessageService
  ) {}

  private get t() {
    return this.translations[this.currentLanguage];
  }

  private showError(key: string, params?: { [key: string]: string | number }) {
    let message = this.t[key as keyof typeof this.t] || key;
    
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
      life: 5000
    });
  }

  basicRules = ['Var', 'True', 'False', 'Zero'];
  absRules = ['Abs'];
  appRules = ['App'];
  pairRules = ['Pair', 'LetPair'];
  sumRules = ['Inl', 'Inr', 'Case'];
  conditionalRules = ['If'];
  natRules = ['Succ', 'Pred', 'IsZero'];
  letRules = ['Let'];


  get isSelected(): boolean {
    return this.selectedNode === this.root;
  }

  onNodeClick(event: MouseEvent) {
    if (this.mode === 'interactive' && this.root) {
      this.nodeClicked.emit(this.root);
    }
  }

  onPlusButtonClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.mode === 'interactive' && this.root) {
      // Get the plus button's position
      const button = event.currentTarget as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      
      // Calculate center of the button
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;
      
      // Emit the position to parent component
      this.plusButtonClicked.emit({ 
        node: this.root, 
        x: buttonCenterX, 
        y: buttonCenterY 
      });
    }
  }

  pendingRule: string | null = null;
  pendingRuleNode: TypeInferenceNode | null = null;
  userPredictions: string[] = [];

  ngOnChanges(changes: any) {
    if (changes['predictionRuleRequest'] && this.predictionRuleRequest && this.root === this.predictionRuleRequest.node) {
      this.onRuleClick(this.predictionRuleRequest.rule);
    }
  }

  onRuleClick(rule: string) {
    if (this.interactiveSubmode === 'predict') {
      // For type inference, predict mode means predicting the resulting type
      // Most rules have 1 child, some have 0 (Var, True, False, Zero)
      const expectedCount = this.getExpectedChildrenCount(rule);
      
      if (expectedCount === 0) {
        // Rule with no children (Var, True, False, Zero) - apply directly
        this.apply(rule);
        if (this.root) {
          this.nodeClicked.emit(this.root);
        }
        return;
      }
      
      // Rule can be applied, set up prediction input
      this.pendingRule = rule;
      this.pendingRuleNode = this.root;
      this.userPredictions = new Array(expectedCount).fill('');
      
      // Close the popup by deselecting the node
      if (this.root) {
        this.nodeClicked.emit(this.root);
      }
      return;
    }
    this.apply(rule);
  }

  getExpectedChildrenCount(rule: string): number {
    // Rules with no children
    if (['Var', 'True', 'False', 'Zero'].includes(rule)) {
      return 0;
    }
    // Rules with 1 child
    if (['Abs', 'Succ', 'Pred', 'IsZero', 'Inl', 'Inr'].includes(rule)) {
      return 1;
    }
    // Rules with 2 children
    if (['App', 'Pair', 'Let', 'LetPair', 'If'].includes(rule)) {
      return 2;
    }
    // Rules with 3 children
    if (['Case'].includes(rule)) {
      return 3;
    }
    return 1; // Default
  }

  get hasPendingPrediction(): boolean {
    return this.pendingRule !== null && this.pendingRuleNode === this.root && this.userPredictions.length > 0;
  }

  onPredictionInput(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    this.userPredictions[index] = target.value;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.cancelPrediction();
    }
  }

  cancelPrediction() {
    this.pendingRule = null;
    this.pendingRuleNode = null;
    this.userPredictions = [];
  }

  confirmPrediction() {
    if (!this.pendingRule || !this.root) return;
    
    // Check all predictions are filled
    if (this.userPredictions.some(p => !p.trim())) {
      this.showError('errorFillAllFields');
      return;
    }
    
    // Compute expected child expressions
    const expectedExpressions = this.computeExpectedExpressions(this.root.expression, this.pendingRule);
    if (!expectedExpressions || expectedExpressions.length === 0) {
      this.showError('errorCannotApplyRule');
      return;
    }
    
    if (expectedExpressions.length !== this.userPredictions.length) {
      this.showError('errorExpectedCount', { expected: expectedExpressions.length, got: this.userPredictions.length });
      return;
    }
    
    // Parse all user predictions
    const userExpressions: ExprNode[] = [];
    for (let i = 0; i < this.userPredictions.length; i++) {
      const prediction = this.userPredictions[i];
      try {
        const parsed = this.lambdaParser.parseLambdaExpression(prediction);
        userExpressions.push(parsed);
      } catch (error: any) {
        this.showError('errorInvalidExpressionAtPosition', { position: i + 1 });
        return;
      }
    }
    
    // Compare expressions (only the expression part, not types)
    for (let i = 0; i < expectedExpressions.length; i++) {
      if (!this.compareExpressions(expectedExpressions[i], userExpressions[i])) {
        this.showError('errorIncorrectAtPosition', { position: i + 1 });
        return;
      }
    }
    
    // Validation passed, apply the rule
    this.apply(this.pendingRule);
    
    // Clear prediction state
    this.pendingRule = null;
    this.pendingRuleNode = null;
    this.userPredictions = [];
  }

  computeExpectedExpressions(expr: ExprNode, rule: string): ExprNode[] {
    switch (rule) {
      case 'Var':
      case 'True':
      case 'False':
      case 'Zero':
        return []; // No children
      
      case 'Abs':
        if (expr.kind === 'Abs') {
          return [expr.body];
        }
        break;
      
      case 'App':
        if (expr.kind === 'App') {
          return [expr.fn, expr.arg];
        }
        break;
      
      case 'Pair':
        if (expr.kind === 'Pair') {
          return [expr.left, expr.right];
        }
        break;
      
      case 'Let':
        if (expr.kind === 'Let') {
          return [expr.value, expr.inExpr];
        }
        break;
      
      case 'LetPair':
        if (expr.kind === 'LetPair') {
          return [expr.pair, expr.inExpr];
        }
        break;
      
      case 'If':
        if (expr.kind === 'If') {
          return [expr.cond, expr.thenBranch, expr.elseBranch];
        }
        break;
      
      case 'Case':
        if (expr.kind === 'Case') {
          return [expr.expr, expr.leftBranch, expr.rightBranch];
        }
        break;
      
      case 'Inl':
        if (expr.kind === 'Inl') {
          return [expr.expr];
        }
        break;
      
      case 'Inr':
        if (expr.kind === 'Inr') {
          return [expr.expr];
        }
        break;
      
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        if (expr.kind === 'Succ' || expr.kind === 'Pred' || expr.kind === 'IsZero') {
          return [expr.expr];
        }
        break;
    }
    
    return [];
  }

  compareExpressions(expected: ExprNode, actual: ExprNode): boolean {
    // Compare only the structure, not types
    if (expected.kind !== actual.kind) {
      return false;
    }
    
    switch (expected.kind) {
      case 'Var':
        return (actual.kind === 'Var' && expected.name === actual.name);
      
      case 'Abs':
        if (actual.kind === 'Abs') {
          return expected.param === actual.param && 
                 this.compareExpressions(expected.body, actual.body);
        }
        return false;
      
      case 'App':
        if (actual.kind === 'App') {
          return this.compareExpressions(expected.fn, actual.fn) &&
                 this.compareExpressions(expected.arg, actual.arg);
        }
        return false;
      
      case 'Pair':
        if (actual.kind === 'Pair') {
          return this.compareExpressions(expected.left, actual.left) &&
                 this.compareExpressions(expected.right, actual.right);
        }
        return false;
      
      case 'Let':
        if (actual.kind === 'Let') {
          return expected.name === actual.name &&
                 this.compareExpressions(expected.value, actual.value) &&
                 this.compareExpressions(expected.inExpr, actual.inExpr);
        }
        return false;
      
      case 'LetPair':
        if (actual.kind === 'LetPair') {
          return expected.x === actual.x &&
                 expected.y === actual.y &&
                 this.compareExpressions(expected.pair, actual.pair) &&
                 this.compareExpressions(expected.inExpr, actual.inExpr);
        }
        return false;
      
      case 'If':
        if (actual.kind === 'If') {
          return this.compareExpressions(expected.cond, actual.cond) &&
                 this.compareExpressions(expected.thenBranch, actual.thenBranch) &&
                 this.compareExpressions(expected.elseBranch, actual.elseBranch);
        }
        return false;
      
      case 'Case':
        if (actual.kind === 'Case') {
          return this.compareExpressions(expected.expr, actual.expr) &&
                 expected.leftVar === actual.leftVar &&
                 expected.rightVar === actual.rightVar &&
                 this.compareExpressions(expected.leftBranch, actual.leftBranch) &&
                 this.compareExpressions(expected.rightBranch, actual.rightBranch);
        }
        return false;
      
      case 'Inl':
        if (actual.kind === 'Inl') {
          return this.compareExpressions(expected.expr, actual.expr);
        }
        return false;
      
      case 'Inr':
        if (actual.kind === 'Inr') {
          return this.compareExpressions(expected.expr, actual.expr);
        }
        return false;
      
      case 'Succ':
      case 'Pred':
      case 'IsZero':
        if (actual.kind === expected.kind) {
          return this.compareExpressions(expected.expr, actual.expr);
        }
        return false;
      
      case 'True':
      case 'False':
      case 'Zero':
        return actual.kind === expected.kind;
      
      default:
        return false;
    }
  }

  apply(rule: string) {
    if (this.root) {
      this.ruleSelected.emit({ node: this.root, rule });
    }
  }

  onChildNodeClicked(node: TypeInferenceNode) {
    this.nodeClicked.emit(node);
  }

  onChildPlusButtonClicked(event: { node: TypeInferenceNode, x: number, y: number }) {
    this.plusButtonClicked.emit(event);
  }

  onChildRuleSelected(event: { node: TypeInferenceNode, rule: string }) {
    this.ruleSelected.emit(event);
  }



  formatExpression(expr: any): string {
    return this.formatExpr(expr);
  }

  private formatExpr(expr: any): string {
    switch (expr.kind) {
      case 'Var':
        return expr.name;
      case 'Abs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      case 'App':
        const fnStr = this.formatExpr(expr.fn);
        const argStr = this.formatExpr(expr.arg);
        const needsParens = expr.arg.kind === 'Abs' || expr.arg.kind === 'App';
        return `${fnStr} ${needsParens ? `(${argStr})` : argStr}`;
      case 'Pair':
        return `(${this.formatExpr(expr.left)}, ${this.formatExpr(expr.right)})`;
      case 'Inl':
        return `inl ${this.formatExpr(expr.expr)} as ${this.formatType(expr.asType)}`;
      case 'Inr':
        return `inr ${this.formatExpr(expr.expr)} as ${this.formatType(expr.asType)}`;
      case 'Case':
        return `case ${this.formatExpr(expr.expr)} of inl ${expr.leftVar}:${this.formatType(expr.leftType)} => ${this.formatExpr(expr.leftBranch)} | inr ${expr.rightVar}:${this.formatType(expr.rightType)} => ${this.formatExpr(expr.rightBranch)}`;
      case 'Let':
        return `let ${expr.name} = ${this.formatExpr(expr.value)} in ${this.formatExpr(expr.inExpr)}`;
      case 'LetPair':
        return `let [${expr.x}, ${expr.y}] = ${this.formatExpr(expr.pair)} in ${this.formatExpr(expr.inExpr)}`;
      case 'If':
        return `if ${this.formatExpr(expr.cond)} then ${this.formatExpr(expr.thenBranch)} else ${this.formatExpr(expr.elseBranch)}`;
      case 'True':
        return 'true';
      case 'False':
        return 'false';
      case 'Zero':
        return '0';
      case 'Succ':
        return `succ ${this.formatExpr(expr.expr)}`;
      case 'Pred':
        return `pred ${this.formatExpr(expr.expr)}`;
      case 'IsZero':
        return `iszero ${this.formatExpr(expr.expr)}`;
      case 'DependentAbs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      case 'DependentPair':
        return `⟨${this.formatExpr(expr.witness)}, ${this.formatExpr(expr.proof)}⟩`;
      case 'LetDependentPair':
        return `let (${expr.x}: ${this.formatType(expr.xType)}) = ${this.formatExpr(expr.pair)} in ${this.formatExpr(expr.inExpr)}`;
      default:
        return `[${expr.kind}]`;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  formatType(type: any): string {
    switch (type.kind) {
      case 'TypeVar':
        // Capitalize the first letter of type variable names
        return type.name.charAt(0).toUpperCase() + type.name.slice(1);
      case 'Bool':
        return 'Bool';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const fromStr = this.formatType(type.from);
        const toStr = this.formatType(type.to);
        const fromNeedsParens = type.from.kind === 'Func' || type.from.kind === 'Prod' || type.from.kind === 'Sum';
        const toNeedsParens = type.to.kind === 'Func' || type.to.kind === 'Prod' || type.to.kind === 'Sum';
        return `${fromNeedsParens ? `(${fromStr})` : fromStr} → ${toNeedsParens ? `(${toStr})` : toStr}`;
      case 'Prod':
        const leftStr = this.formatType(type.left);
        const rightStr = this.formatType(type.right);
        return `${leftStr} × ${rightStr}`;
      case 'Sum':
        const sumLeftStr = this.formatType(type.left);
        const sumRightStr = this.formatType(type.right);
        return `${sumLeftStr} + ${sumRightStr}`;
      case 'PredicateType':
        const args = type.argTypes.map((t: any) => this.formatType(t)).join(', ');
        return `${type.name}(${args})`;
      case 'DependentFunc':
        return `(${type.param}: ${this.formatType(type.paramType)}) -> ${this.formatType(type.bodyType)}`;
      case 'DependentProd':
        return `(${type.param}: ${this.formatType(type.paramType)}) * ${this.formatType(type.bodyType)}`;
      default:
        return `[${type.kind}]`;
    }
  }

}
