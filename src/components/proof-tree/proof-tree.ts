import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DerivationNode, FormulaNode, SequentNode, TermNode } from '../../models/formula-node';
import { I18nService } from '../../services/i18n.service';
import { NotificationService } from '../../services/notification.service';
import { FormulaRenderService } from '../../services/formula-render.service';
import type { AppTranslations } from '../../services/i18n.service';
import { getElementCenter } from '../../utils/dom-position';
import { applyPredictionShortcut, isEscapeCancel } from '../../utils/prediction-input';
import { scheduleLineMeasure as sharedScheduleLineMeasure } from '../../utils/line-measurement';
import { sequentToText } from '../../utils/formula-text';
import type { TreeRenderNode } from '../tree-renderer/tree-renderer';

@Component({
  selector: 'app-proof-tree',
  templateUrl: './proof-tree.html',
  styleUrls: ['./proof-tree.scss'],
  standalone: false,
})
export class ProofTree implements AfterViewChecked {
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() predictionActive = false;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Output() nodeClicked = new EventEmitter<DerivationNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: DerivationNode, x: number, y: number }>();
  @Input() root!: DerivationNode | null;

  @Output() ruleSelected = new EventEmitter<{ node: DerivationNode, rule: string }>();
  @Input() selectedNode: DerivationNode | null = null;
  @Input() predictionRuleRequest: { node: DerivationNode, rule: string, requestId: number } | null = null;
  @Input() quantifierInputRequest: {
    node: DerivationNode;
    rule: string;
    isVariable: boolean;
    freeVars: string[];
    placeholder: string;
    label: string;
  } | null = null;
  @Output() quantifierInputConfirm = new EventEmitter<string>();
  @Output() quantifierInputCancel = new EventEmitter<void>();
  @ViewChild('conclusionEl') conclusionEl?: ElementRef<HTMLElement>;
  @ViewChild('childrenEl') childrenEl?: ElementRef<HTMLElement>;

  pendingRule: string | null = null;
  pendingRuleNode: DerivationNode | null = null;
  userPredictions: string[] = [];
  predictError: string | null = null;
  lineWidthPx: number | null = null;
  lineOffsetPx = 0;
  measureScheduled = false;
  quantifierInputValue = '';

  rendererSequentLatex = (sequent: SequentNode): string => this.sequentToLatex(sequent);
  rendererRuleLabel = (node: TreeRenderNode): string => this.displayRuleLabel((node as DerivationNode).rule);

  canShowPlusButton = (node: TreeRenderNode): boolean => {
    const proofNode = node as DerivationNode;
    if (this.mode !== 'interactive') return false;
    return !proofNode.children?.length && proofNode.rule !== 'Ax' && proofNode.rule !== 'id' && proofNode.rule !== 'ID';
  };

  canShowRule = (node: TreeRenderNode): boolean => {
    const proofNode = node as DerivationNode;
    return !!proofNode.children?.length || proofNode.rule === 'Ax' || proofNode.rule === 'id' || proofNode.rule === 'ID';
  };

  onRendererNodeClicked(node: TreeRenderNode): void {
    this.handleNodeClicked(node as DerivationNode);
  }

  handleNodeClicked(node: DerivationNode): void {
    if (this.hasPendingPrediction && node.sequent) {
      const text = sequentToText(node.sequent);
      for (let i = 0; i < this.userPredictions.length; i++) {
        this.userPredictions[i] = text;
      }
      return;
    }
    this.nodeClicked.emit(node);
  }

  onRendererPlusButtonClicked(event: { node: TreeRenderNode; x: number; y: number }): void {
    this.plusButtonClicked.emit({
      node: event.node as DerivationNode,
      x: event.x,
      y: event.y
    });
  }

  constructor(
    private i18n: I18nService,
    private notification: NotificationService,
    private formulaRender: FormulaRenderService
  ) {}

  get t() {
    return this.i18n.t(this.currentLanguage);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!(this.mode === 'interactive' && this.interactiveSubmode === 'predict')) return;
    this.scheduleLineMeasure();
  }

  ngAfterViewChecked(): void {
    if (!(this.mode === 'interactive' && this.interactiveSubmode === 'predict')) return;
    this.scheduleLineMeasure();
  }

  private showError(key: keyof AppTranslations, params?: { [key: string]: string | number }) {
    const message = this.i18n.translate(this.currentLanguage, key, params);
    this.notification.showError(message, {
      summary: this.i18n.errorSummary(this.currentLanguage),
      life: 7000
    });
  }

  onRuleClick(rule: string) {
    if (this.interactiveSubmode === 'predict') {
      if (rule === 'Ax' || rule === 'id' || rule === 'ID') {
        if (this.root && this.isAxiom(this.root.sequent)) {
          this.apply(rule);
          if (this.root) {
            this.nodeClicked.emit(this.root);
          }
          return;
        } else {
          this.showError('errorRuleCannotBeAppliedToSequent');
          this.pendingRule = null;
          this.pendingRuleNode = null;
          this.userPredictions = [];
          return;
        }
      }
      
      const expectedCount = this.getExpectedSequentsCount(rule);
      
      if (expectedCount === 0) {
        this.showError('errorRuleCannotBeAppliedToSequent');
        this.pendingRule = null;
        this.pendingRuleNode = null;
        this.userPredictions = [];
        return;
      }
      
      this.pendingRule = rule;
      this.pendingRuleNode = this.root;
      this.userPredictions = new Array(expectedCount).fill('');
      this.predictError = null;
      
      if (this.root) {
        this.nodeClicked.emit(this.root);
      }
      return;
    }
    this.apply(rule);
  }

  getExpectedSequentsCount(rule: string): number {
    if (!this.root) return 0;
    const expected = this.computeExpectedSequents(this.root.sequent, rule);
    return expected ? expected.length : 0;
  }

  get hasPendingPrediction(): boolean {
    return this.pendingRule !== null && this.pendingRuleNode === this.root;
  }

  trackByIndex(index: number, item: any): number {
    return index;
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
    this.predictError = null;
  }

  get hasQuantifierInput(): boolean {
    return !!this.quantifierInputRequest && this.quantifierInputRequest.node === this.root;
  }

  onQuantifierInput(event: Event): void {
    this.quantifierInputValue = applyPredictionShortcut(event);
  }

  onQuantifierKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.quantifierInputCancel.emit();
    }
  }

  onQuantifierConfirm(): void {
    this.quantifierInputConfirm.emit(this.quantifierInputValue);
  }

  onQuantifierCancel(): void {
    this.quantifierInputCancel.emit();
  }

  confirmPrediction() {
    if (!this.pendingRule || !this.root || !this.pendingRuleNode) return;
    
    const expectedSequents = this.computeExpectedSequents(this.root.sequent, this.pendingRule);
    if (!expectedSequents || expectedSequents.length === 0) {
      this.showError('errorCannotApplyRule');
      return;
    }
    
    if (this.userPredictions.some(p => !p.trim())) {
      this.showError('errorFillAllFields');
      return;
    }
    
    const userSequents: SequentNode[] = [];
    for (const prediction of this.userPredictions) {
      const parsed = this.parseUserPrediction(prediction);
      if (!parsed || parsed.length !== 1) {
        this.showError('errorInvalidSequentFormat');
        return;
      }
      userSequents.push(parsed[0]);
    }
    
    if (userSequents.length !== expectedSequents.length) {
      this.showError('errorExpectedSequents', { expected: expectedSequents.length, got: userSequents.length });
      return;
    }
    
    for (let i = 0; i < expectedSequents.length; i++) {
      if (!this.compareSequents([expectedSequents[i]], [userSequents[i]])) {
        this.showError('errorIncorrectAtPosition', { position: i + 1 });
        return;
      }
    }
    this.apply(this.pendingRule);
    this.pendingRule = null;
    this.pendingRuleNode = null;
    this.userPredictions = [];
  }

  get isSelected(): boolean {
    return this.selectedNode === this.root;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['predictionRuleRequest'] && this.predictionRuleRequest && this.root === this.predictionRuleRequest.node) {
      this.onRuleClick(this.predictionRuleRequest.rule);
    }
    if (changes['quantifierInputRequest']) {
      this.quantifierInputValue = '';
    }
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

  private scheduleLineMeasure(): void {
    sharedScheduleLineMeasure(this, '.sequent-content');
  }

  
  apply(rule: string) {
    if (this.root) {
      const normalizedRule = rule === 'id' || rule === 'ID' ? 'Ax' : rule;
      this.ruleSelected.emit({ node: this.root, rule: normalizedRule });
    }
  }

  displayRuleLabel(rule: string): string {
    return rule === 'Ax' || rule === 'id' ? 'ID' : rule;
  }

  sequentToLatex(sequent: SequentNode): string {
    return this.formulaRender.sequentToLatex(sequent);
  }


  private computeExpectedSequents(sequent: SequentNode, rule: string): SequentNode[] | null {
    const { assumptions, conclusions } = sequent;
    
    switch (rule) {
      case '→R': {
        const impl = conclusions.find((f: FormulaNode) => f.kind === 'Implies');
        if (!impl || impl.kind !== 'Implies') return null;
        return [{
          assumptions: [...assumptions, impl.left],
          conclusions: conclusions.map((c: FormulaNode) => 
            this.formulasEqual(c, impl) ? impl.right : c
          )
        }];
      }
      
      case '→L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'Implies');
        if (idx === -1) return null;
        const implF = assumptions[idx];
        if (implF.kind !== 'Implies') return null;
        const newAssumptions = [...assumptions.slice(0, idx), implF.right, ...assumptions.slice(idx + 1)];
        return [
          { assumptions, conclusions: [...conclusions, implF.left] },
          { assumptions: newAssumptions, conclusions }
        ];
      }
      
      case '∧R': {
        const and = conclusions.find((f: FormulaNode) => f.kind === 'And');
        if (!and || and.kind !== 'And') return null;
        const leftConclusions = conclusions.map((c: FormulaNode) => 
          this.formulasEqual(c, and) ? and.left : c
        );
        const rightConclusions = conclusions.map((c: FormulaNode) => 
          this.formulasEqual(c, and) ? and.right : c
        );
        return [
          { assumptions, conclusions: leftConclusions },
          { assumptions, conclusions: rightConclusions }
        ];
      }
      
      case '∧L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'And');
        if (idx === -1) return null;
        const andF = assumptions[idx];
        if (andF.kind !== 'And') return null;
        return [{
          assumptions: [
            ...assumptions.slice(0, idx),
            andF.left,
            andF.right,
            ...assumptions.slice(idx + 1)
          ],
          conclusions
        }];
      }
      
      case '∨R': {
        const or = conclusions.find((f: FormulaNode) => f.kind === 'Or');
        if (!or || or.kind !== 'Or') return null;
        return [{
          assumptions,
          conclusions: conclusions.map((c: FormulaNode) => 
            this.formulasEqual(c, or) ? or.left : c
          ).concat(conclusions.map((c: FormulaNode) => 
            this.formulasEqual(c, or) ? or.right : c
          ).filter((c, i, arr) => i === arr.findIndex(x => this.formulasEqual(x, c)) && !this.formulasEqual(c, or.left)))
        }];
      }
      
      case '∨L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'Or');
        if (idx === -1) return null;
        const orF = assumptions[idx];
        if (orF.kind !== 'Or') return null;
        const leftAssumptions = [...assumptions.slice(0, idx), orF.left, ...assumptions.slice(idx + 1)];
        const rightAssumptions = [...assumptions.slice(0, idx), orF.right, ...assumptions.slice(idx + 1)];
        return [
          { assumptions: leftAssumptions, conclusions },
          { assumptions: rightAssumptions, conclusions }
        ];
      }
      
      case '¬R': {
        const not = conclusions.find((f: FormulaNode) => f.kind === 'Not');
        if (!not || not.kind !== 'Not') return null;
        return [{
          assumptions: [...assumptions, not.inner],
          conclusions: conclusions.filter((c: FormulaNode) => !this.formulasEqual(c, not))
        }];
      }
      
      case '¬L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'Not');
        if (idx === -1) return null;
        const notF = assumptions[idx];
        if (notF.kind !== 'Not') return null;
        return [{
          assumptions: assumptions.filter((_: FormulaNode, i: number) => i !== idx),
          conclusions: [...conclusions, notF.inner]
        }];
      }
      
      case 'WL': {
        if (assumptions.length === 0) return null;
        return [{
          assumptions: assumptions.slice(1),
          conclusions
        }];
      }
      
      case 'WR': {
        if (conclusions.length === 0) return null;
        return [{
          assumptions,
          conclusions: conclusions.slice(1)
        }];
      }
      
      case '∀R': {
        const forall = conclusions.find((f: FormulaNode) => f.kind === 'Forall');
        if (!forall || forall.kind !== 'Forall') return null;
        return [{
          assumptions,
          conclusions: conclusions.map((c: FormulaNode) => 
            this.formulasEqual(c, forall) ? forall.body : c
          )
        }];
      }
      
      case '∀L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'Forall');
        if (idx === -1) return null;
        const forallF = assumptions[idx];
        if (forallF.kind !== 'Forall') return null;
        return [{
          assumptions: [
            ...assumptions.slice(0, idx),
            forallF.body,
            ...assumptions.slice(idx + 1)
          ],
          conclusions
        }];
      }
      
      case '∃R': {
        const exists = conclusions.find((f: FormulaNode) => f.kind === 'Exists');
        if (!exists || exists.kind !== 'Exists') return null;
        return [{
          assumptions,
          conclusions: conclusions.map((c: FormulaNode) => 
            this.formulasEqual(c, exists) ? exists.body : c
          )
        }];
      }
      
      case '∃L': {
        const idx = assumptions.findIndex((f: FormulaNode) => f.kind === 'Exists');
        if (idx === -1) return null;
        const existsF = assumptions[idx];
        if (existsF.kind !== 'Exists') return null;
        return [{
          assumptions: [
            ...assumptions.slice(0, idx),
            existsF.body,
            ...assumptions.slice(idx + 1)
          ],
          conclusions
        }];
      }
      
      case 'Ax':
      case 'id':
      case 'ID':
        return [];
      
      default:
        return null;
    }
  }

  private parseUserPrediction(input: string): SequentNode[] | null {
    try {
      const normalized = this.normalizeSymbols(input);
      const sequents = normalized.split('|').map(s => s.trim());
      const parsed: (SequentNode | null)[] = sequents.map(seqStr => {
        const parts = seqStr.split('⊢');
        if (parts.length !== 2) return null;
        
        const assumptionStrs = parts[0].trim() ? parts[0].split(',').map(f => this.parseFormula(f.trim())) : [];
        const conclusionStrs = parts[1].trim() ? parts[1].split(',').map(f => this.parseFormula(f.trim())) : [];
        
        if (assumptionStrs.some(f => !f) || conclusionStrs.some(f => !f)) return null;
        
        const assumptions = assumptionStrs.filter((f): f is FormulaNode => f !== null);
        const conclusions = conclusionStrs.filter((f): f is FormulaNode => f !== null);
        
        return { assumptions, conclusions };
      });
      
      const validSequents = parsed.filter((s): s is SequentNode => s !== null);
      return validSequents.length === parsed.length ? validSequents : null;
    } catch {
      return null;
    }
  }

  private normalizeSymbols(input: string): string {
    let result = input
      .replace(/\|\|/g, '∨')      // || → ∨
      .replace(/&&/g, '∧')        // && → ∧
      .replace(/=>/g, '→')        // => → →
      .replace(/->/g, '→')        // -> → →
      .replace(/\|\-/g, '⊢');     // |- → ⊢
    
    result = result.replace(/!(?!=)/g, '¬');
    
    return result;
  }

  private parseFormula(str: string): FormulaNode | null {
    str = str.trim();
    if (!str) return null;
    
    str = this.normalizeSymbols(str);
    
    const parseImpl = (s: string): FormulaNode | null => {
      const parts = this.splitByOp(s, '→');
      if (parts.length > 1) {
        const left = parseOr(parts[0]);
        const right = parseImpl(parts.slice(1).join('→'));
        return left && right ? { kind: 'Implies', left, right } : null;
      }
      return parseOr(s);
    };
    
    const parseOr = (s: string): FormulaNode | null => {
      const parts = this.splitByOp(s, '∨');
      if (parts.length > 1) {
        const left = parseAnd(parts[0]);
        const right = parseOr(parts.slice(1).join('∨'));
        return left && right ? { kind: 'Or', left, right } : null;
      }
      return parseAnd(s);
    };
    
    const parseAnd = (s: string): FormulaNode | null => {
      const parts = this.splitByOp(s, '∧');
      if (parts.length > 1) {
        const left = parseNot(parts[0]);
        const right = parseAnd(parts.slice(1).join('∧'));
        return left && right ? { kind: 'And', left, right } : null;
      }
      return parseNot(s);
    };
    
    const parseNot = (s: string): FormulaNode | null => {
      s = s.trim();
      if (s.startsWith('¬')) {
        const inner = parseAtom(s.substring(1));
        return inner ? { kind: 'Not', inner } : null;
      }
      return parseAtom(s);
    };
    
    const parseAtom = (s: string): FormulaNode | null => {
      s = s.trim();
      
      if (s.startsWith('∀')) {
        const match = s.match(/^∀\s*([a-z_][a-zA-Z0-9_]*)(?:\s*:\s*(.+?))?\s*\.\s*(.+)$/);
        if (match) {
          const variable = match[1];
          const domain = match[2] ? parseImpl(match[2]) : null;
          const body = parseImpl(match[3]);
          if (!body) return null;
          if (match[2] && !domain) return null;
          return { kind: 'Forall', variable, domain: domain ?? undefined, body };
        }
      }
      
      if (s.startsWith('∃')) {
        const match = s.match(/^∃\s*([a-z_][a-zA-Z0-9_]*)(?:\s*:\s*(.+?))?\s*\.\s*(.+)$/);
        if (match) {
          const variable = match[1];
          const domain = match[2] ? parseImpl(match[2]) : null;
          const body = parseImpl(match[3]);
          if (!body) return null;
          if (match[2] && !domain) return null;
          return { kind: 'Exists', variable, domain: domain ?? undefined, body };
        }
      }
      
      const predMatch = s.match(/^([A-Z][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
      if (predMatch) {
        const name = predMatch[1];
        const argsStr = predMatch[2].trim();
        const args: TermNode[] = argsStr ? argsStr.split(',').map(a => this.parseTerm(a.trim())).filter((t): t is TermNode => t !== null) : [];
        return { kind: 'Predicate', name, args };
      }
      if (s.startsWith('(') && s.endsWith(')')) {
        return parseImpl(s.substring(1, s.length - 1));
      }
      return s ? { kind: 'Var', name: s } : null;
    };
    
    return parseImpl(str);
  }

  private parseTerm(str: string): TermNode | null {
    str = str.trim();
    if (!str) return null;
    
    const funcMatch = str.match(/^([a-z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
    if (funcMatch) {
      const name = funcMatch[1];
      const argsStr = funcMatch[2].trim();
      const args: TermNode[] = argsStr ? argsStr.split(',').map(a => this.parseTerm(a.trim())).filter((t): t is TermNode => t !== null) : [];
      return { kind: 'TermFunc', name, args };
    }

    if (/^[a-z_][a-zA-Z0-9_]*$/.test(str)) {
      return { kind: 'TermVar', name: str };
    }
    
    return null;
  }

  private splitByOp(str: string, op: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (depth === 0 && str.substring(i, i + op.length) === op) {
        parts.push(current.trim());
        current = '';
        i += op.length - 1;
        continue;
      }
      current += char;
    }
    
    if (current.trim()) parts.push(current.trim());
    return parts.length > 0 ? parts : [str];
  }

  private compareSequents(expected: SequentNode[], user: SequentNode[]): boolean {
    if (expected.length !== user.length) return false;
    
    for (let i = 0; i < expected.length; i++) {
      if (!this.sequentsEqual(expected[i], user[i])) {
        return false;
      }
    }
    return true;
  }

  private sequentsEqual(s1: SequentNode, s2: SequentNode): boolean {
    if (s1.assumptions.length !== s2.assumptions.length) return false;
    if (s1.conclusions.length !== s2.conclusions.length) return false;
    
    for (const a1 of s1.assumptions) {
      if (!s2.assumptions.some((a2: FormulaNode) => this.formulasEqual(a1, a2))) {
        return false;
      }
    }
    
    for (const c1 of s1.conclusions) {
      if (!s2.conclusions.some((c2: FormulaNode) => this.formulasEqual(c1, c2))) {
        return false;
      }
    }
    
    return true;
  }

  private formulasEqual(f1: FormulaNode, f2: FormulaNode): boolean {
    if (f1.kind !== f2.kind) return false;
    
    switch (f1.kind) {
      case 'Var':
        return f1.name === (f2 as any).name;
      case 'Not':
        return this.formulasEqual(f1.inner, (f2 as any).inner);
      case 'And':
      case 'Or':
      case 'Implies':
        return this.formulasEqual(f1.left, (f2 as any).left) && 
               this.formulasEqual(f1.right, (f2 as any).right);
      case 'Forall':
      case 'Exists':
        return f1.variable === (f2 as any).variable && 
               this.optionalFormulaEqual(f1.domain, (f2 as any).domain) &&
               this.formulasEqual(f1.body, (f2 as any).body);
      case 'Predicate':
        if (f1.name !== (f2 as any).name || f1.args.length !== (f2 as any).args.length) {
          return false;
        }
        return f1.args.every((arg, i) => this.termsEqual(arg, (f2 as any).args[i]));
      case 'Paren':
        return this.formulasEqual(f1.inner, (f2 as any).inner);
      case 'True':
      case 'False':
        return true;
      default:
        return false;
    }
  }

  private termsEqual(t1: TermNode, t2: TermNode): boolean {
    if (t1.kind !== t2.kind) return false;
    
    switch (t1.kind) {
      case 'TermVar':
      case 'TermConst':
        return t1.name === (t2 as any).name;
      case 'TermFunc':
        if (t1.name !== (t2 as any).name || t1.args.length !== (t2 as any).args.length) {
          return false;
        }
        return t1.args.every((arg, i) => this.termsEqual(arg, (t2 as any).args[i]));
      default:
        return false;
    }
  }

  private optionalFormulaEqual(a?: FormulaNode, b?: FormulaNode): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return this.formulasEqual(a, b);
  }

  private isAxiom(sequent: SequentNode): boolean {
    return sequent.assumptions.some(a =>
      sequent.conclusions.some(c => this.formulasEqual(a, c))
    );
  }
}
