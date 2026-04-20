import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { TypeInferenceNode } from '../../services/type-inference-service';
import { ExprNode } from '../../models/lambda-node';
import { LambdaParserService } from '../../services/lambda-parser-service';
import { I18nService } from '../../services/i18n.service';
import { NotificationService } from '../../services/notification.service';
import type { AppTranslations } from '../../services/i18n.service';
import { getElementCenter } from '../../utils/dom-position';
import { applyPredictionShortcut, isEscapeCancel } from '../../utils/prediction-input';
import { scheduleLineMeasure as sharedScheduleLineMeasure } from '../../utils/line-measurement';
import type { TreeRenderNode } from '../tree-renderer/tree-renderer';

@Component({
  selector: 'app-type-inference-tree',
  standalone: false,
  templateUrl: './type-inference-tree.html',
  styleUrl: './type-inference-tree.scss'
})
export class TypeInferenceTree implements AfterViewChecked {
  @Input() root: TypeInferenceNode | null = null;
  @Input() selectedNode: TypeInferenceNode | null = null;
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() predictionActive = false;
  @Input() predictionRuleRequest: { node: TypeInferenceNode, rule: string, requestId: number } | null = null;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Output() nodeClicked = new EventEmitter<TypeInferenceNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: TypeInferenceNode, x: number, y: number }>();
  @Output() ruleSelected = new EventEmitter<{ node: TypeInferenceNode, rule: string }>();
  @ViewChild('conclusionEl') conclusionEl?: ElementRef<HTMLElement>;
  @ViewChild('childrenEl') childrenEl?: ElementRef<HTMLElement>;

  rendererExpression = (expression: ExprNode): string => this.formatExpression(expression);
  rendererType = (type: any): string => this.formatType(type);

  canShowPlusButton = (node: TreeRenderNode): boolean => {
    const typeNode = node as TypeInferenceNode;
    if (this.mode !== 'interactive') return false;
    return !typeNode.children?.length && typeNode.rule !== 'Var';
  };

  canShowRule = (node: TreeRenderNode): boolean => {
    const typeNode = node as TypeInferenceNode;
    return !!typeNode.children?.length || typeNode.rule === 'Var';
  };

  onRendererNodeClicked(node: TreeRenderNode): void {
    this.handleNodeClicked(node as TypeInferenceNode);
  }

  handleNodeClicked(node: TypeInferenceNode): void {
    if (this.hasPendingPrediction && node.expression) {
      const text = this.formatExpression(node.expression);
      for (let i = 0; i < this.userPredictions.length; i++) {
        this.userPredictions[i] = text;
      }
      return;
    }
    this.nodeClicked.emit(node);
  }

  onRendererPlusButtonClicked(event: { node: TreeRenderNode; x: number; y: number }): void {
    this.plusButtonClicked.emit({
      node: event.node as TypeInferenceNode,
      x: event.x,
      y: event.y
    });
  }

  constructor(
    private lambdaParser: LambdaParserService,
    private i18n: I18nService,
    private notification: NotificationService
  ) {}

  get t() {
    return this.i18n.t(this.currentLanguage);
  }

  private showError(key: keyof AppTranslations, params?: { [key: string]: string | number }) {
    const message = this.i18n.translate(this.currentLanguage, key, params);
    this.notification.showError(message, {
      summary: this.i18n.errorSummary(this.currentLanguage),
      life: 5000
    });
  }


  get isSelected(): boolean {
    return this.selectedNode === this.root;
  }

  onPlusButtonClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.mode === 'interactive' && this.root) {
      const button = event.currentTarget as HTMLElement;
      const center = getElementCenter(button);
      this.plusButtonClicked.emit({ 
        node: this.root, 
        x: center.x,
        y: center.y
      });
    }
  }

  pendingRule: string | null = null;
  pendingRuleNode: TypeInferenceNode | null = null;
  userPredictions: string[] = [];
  lineWidthPx: number | null = null;
  lineOffsetPx = 0;
  measureScheduled = false;

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!(this.mode === 'interactive' && this.interactiveSubmode === 'predict')) return;
    this.scheduleLineMeasure();
  }

  ngAfterViewChecked(): void {
    if (!(this.mode === 'interactive' && this.interactiveSubmode === 'predict')) return;
    this.scheduleLineMeasure();
  }

  ngOnChanges(changes: any) {
    if (changes['predictionRuleRequest'] && this.predictionRuleRequest && this.root === this.predictionRuleRequest.node) {
      this.onRuleClick(this.predictionRuleRequest.rule);
    }
  }

  onRuleClick(rule: string) {
    if (this.interactiveSubmode === 'predict') {
      const expectedCount = this.getExpectedChildrenCount(rule);
      
      if (expectedCount === 0) {
        this.apply(rule);
        if (this.root) {
          this.nodeClicked.emit(this.root);
        }
        return;
      }
      
      this.pendingRule = rule;
      this.pendingRuleNode = this.root;
      this.userPredictions = new Array(expectedCount).fill('');
      
      if (this.root) {
        this.nodeClicked.emit(this.root);
      }
      return;
    }
    this.apply(rule);
  }

  getExpectedChildrenCount(rule: string): number {
    if (['Var'].includes(rule)) {
      return 0;
    }
    if (['Abs', 'DependentAbs', 'Inl', 'Inr', 'Fst', 'Snd'].includes(rule)) {
      return 1;
    }
    if (['App', 'Pair', 'Let', 'LetPair', 'DependentPair', 'LetDependentPair'].includes(rule)) {
      return 2;
    }
    if (['Case'].includes(rule)) {
      return 3;
    }
    return 1;
  }

  get hasPendingPrediction(): boolean {
    return this.pendingRule !== null && this.pendingRuleNode === this.root && this.userPredictions.length > 0;
  }

  onPredictionInput(event: Event, index: number) {
    this.userPredictions[index] = applyPredictionShortcut(event);
  }

  onKeyDown(event: KeyboardEvent) {
    if (isEscapeCancel(event)) {
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
    
    if (this.userPredictions.some(p => !p.trim())) {
      this.showError('errorFillAllFields');
      return;
    }
    
    const expectedExpressions = this.computeExpectedExpressions(this.root.expression, this.pendingRule);
    if (!expectedExpressions || expectedExpressions.length === 0) {
      this.showError('errorCannotApplyRule');
      return;
    }
    
    if (expectedExpressions.length !== this.userPredictions.length) {
      this.showError('errorExpectedCount', { expected: expectedExpressions.length, got: this.userPredictions.length });
      return;
    }
    
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
    
    for (let i = 0; i < expectedExpressions.length; i++) {
      if (!this.compareExpressions(expectedExpressions[i], userExpressions[i])) {
        this.showError('errorIncorrectAtPosition', { position: i + 1 });
        return;
      }
    }
    
    this.apply(this.pendingRule);
    
    this.pendingRule = null;
    this.pendingRuleNode = null;
    this.userPredictions = [];
  }

  private scheduleLineMeasure(): void {
    sharedScheduleLineMeasure(this, '.inference-content');
  }

  computeExpectedExpressions(expr: ExprNode, rule: string): ExprNode[] {
    switch (rule) {
      case 'Var':
        return []; 
      
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

      case 'Fst':
        if (expr.kind === 'Fst') {
          return [expr.pair];
        }
        break;

      case 'Snd':
        if (expr.kind === 'Snd') {
          return [expr.pair];
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
      
      case 'DependentAbs':
        if (expr.kind === 'DependentAbs') {
          return [expr.body];
        }
        break;
      
      case 'DependentPair':
        if (expr.kind === 'DependentPair') {
          return [expr.witness, expr.proof];
        }
        break;
      
      case 'LetDependentPair':
        if (expr.kind === 'LetDependentPair') {
          return [expr.pair, expr.inExpr];
        }
        break;
    }
    
    return [];
  }

  compareExpressions(expected: ExprNode, actual: ExprNode): boolean {
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

      case 'Fst':
        if (actual.kind === 'Fst') {
          return this.compareExpressions(expected.pair, actual.pair);
        }
        return false;

      case 'Snd':
        if (actual.kind === 'Snd') {
          return this.compareExpressions(expected.pair, actual.pair);
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
      
      case 'DependentAbs':
        if (actual.kind === 'DependentAbs') {
          return expected.param === actual.param &&
                 this.compareExpressions(expected.body, actual.body);
        }
        return false;
      
      case 'DependentPair':
        if (actual.kind === 'DependentPair') {
          return this.compareExpressions(expected.witness, actual.witness) &&
                 this.compareExpressions(expected.proof, actual.proof);
        }
        return false;
      
      case 'LetDependentPair':
        if (actual.kind === 'LetDependentPair') {
          return expected.x === actual.x &&
                 expected.p === actual.p &&
                 this.compareExpressions(expected.pair, actual.pair) &&
                 this.compareExpressions(expected.inExpr, actual.inExpr);
        }
        return false;
      
      default:
        return false;
    }
  }

  apply(rule: string) {
    if (this.root) {
      this.ruleSelected.emit({ node: this.root, rule });
    }
  }

  formatExpression(expr: any): string {
    return this.formatExpr(expr);
  }

  private formatExpr(expr: any): string {
    switch (expr.kind) {
      case 'Var':
        return expr.name;
      case 'Abs': {
        const typeStr = this.formatType(expr.paramType);
        const typeNeedsParens = expr.paramType.kind === 'DependentFunc' || expr.paramType.kind === 'DependentProd';
        return `λ${expr.param}:${typeNeedsParens ? `(${typeStr})` : typeStr}. ${this.formatExpr(expr.body)}`;
      }
      case 'App':
        const fnStr = this.formatExpr(expr.fn);
        const argStr = this.formatExpr(expr.arg);
        const needsParens = expr.arg.kind === 'Abs' || expr.arg.kind === 'DependentAbs' || expr.arg.kind === 'App';
        return `${fnStr} ${needsParens ? `(${argStr})` : argStr}`;
      case 'Pair':
        return `(${this.formatExpr(expr.left)}, ${this.formatExpr(expr.right)})`;
      case 'Fst':
        return `fst(${this.formatExpr(expr.pair)})`;
      case 'Snd':
        return `snd(${this.formatExpr(expr.pair)})`;
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
      case 'DependentAbs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      case 'DependentPair':
        return `⟨${this.formatExpr(expr.witness)}, ${this.formatExpr(expr.proof)}⟩`;
      case 'LetDependentPair':
        return `let ⟨${expr.x}, ${expr.p}⟩ = ${this.formatExpr(expr.pair)} in ${this.formatExpr(expr.inExpr)}`;
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
        return this.formatTypeVariableName(type.name);
      case 'Bottom':
        return '⊥';
      case 'Func':
        const fromStr = this.formatType(type.from);
        const toStr = this.formatType(type.to);
        const fromNeedsParens = this.needsParensForArrowSide(type.from, 'left');
        const toNeedsParens = this.needsParensForArrowSide(type.to, 'right');
        return `${fromNeedsParens ? `(${fromStr})` : fromStr} → ${toNeedsParens ? `(${toStr})` : toStr}`;
      case 'Prod':
        const leftStr = this.formatType(type.left);
        const rightStr = this.formatType(type.right);
        const leftNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const rightNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${leftNeedsParens ? `(${leftStr})` : leftStr} × ${rightNeedsParens ? `(${rightStr})` : rightStr}`;
      case 'Sum':
        const sumLeftStr = this.formatType(type.left);
        const sumRightStr = this.formatType(type.right);
        const sumLeftNeedsParens = this.needsParensForProductOrSumOperand(type.left);
        const sumRightNeedsParens = this.needsParensForProductOrSumOperand(type.right);
        return `${sumLeftNeedsParens ? `(${sumLeftStr})` : sumLeftStr} + ${sumRightNeedsParens ? `(${sumRightStr})` : sumRightStr}`;
      case 'PredicateType':
        const args = type.argTypes.map((t: any) => this.formatTermType(t)).join(', ');
        return `${type.name}(${args})`;
      case 'DependentFunc':
        return `Π${type.param}:${this.formatTermType(type.paramType)}. ${this.formatType(type.bodyType)}`;
      case 'DependentProd':
        return `Σ${type.param}:${this.formatTermType(type.paramType)}. ${this.formatType(type.bodyType)}`;
      default:
        return `[${type.kind}]`;
    }
  }

  private formatTypeVariableName(name: string): string {
    const polyIndex = this.tryParsePolyIndex(name);
    if (polyIndex !== null) {
      return this.polyIndexToGreek(polyIndex);
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private formatTermType(type: any): string {
    if (type.kind === 'TypeVar') {
      const polyIndex = this.tryParsePolyIndex(type.name);
      if (polyIndex !== null) {
        return this.polyIndexToGreek(polyIndex);
      }
      return type.name;
    }
    return this.formatType(type);
  }

  private tryParsePolyIndex(name: string): number | null {
    const match = /^__poly(\d+)$/.exec(name);
    if (!match) {
      return null;
    }
    const parsed = Number.parseInt(match[1], 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private polyIndexToGreek(index: number): string {
    const greek = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];
    const base = greek[(index - 1) % greek.length];
    const cycle = Math.floor((index - 1) / greek.length);
    return cycle === 0 ? base : `${base}${cycle + 1}`;
  }

  private isNegationType(type: any): boolean {
    return type?.kind === 'Func' && type?.to?.kind === 'Bottom';
  }

  private needsParensForNegation(type: any): boolean {
    return type?.kind === 'Func' || type?.kind === 'Prod' || type?.kind === 'Sum' || type?.kind === 'DependentFunc' || type?.kind === 'DependentProd';
  }

  private needsParensForArrowSide(type: any, side: 'left' | 'right'): boolean {
    if (type?.kind === 'Prod' || type?.kind === 'Sum') return true;
    if (type?.kind === 'DependentFunc' || type?.kind === 'DependentProd') return true;
    if (type?.kind === 'Func') return side === 'left' || side === 'right';
    return false;
  }

  private needsParensForProductOrSumOperand(type: any): boolean {
    return type?.kind === 'Func' || type?.kind === 'DependentFunc' || type?.kind === 'DependentProd';
  }

}
