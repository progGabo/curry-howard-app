import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DerivationNode, FormulaNode, SequentNode, TermNode } from '../../models/formula-node';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-proof-tree',
  templateUrl: './proof-tree.html',
  styleUrls: ['./proof-tree.scss'],
  standalone: false,
})
export class ProofTree implements OnChanges {
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Output() nodeClicked = new EventEmitter<DerivationNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: DerivationNode, x: number, y: number }>();
  @Input() root!: DerivationNode | null;
  
  conclusionRules = ['→R', '∧R', '∨R', '¬R', '∀R', '∃R'];
  assumptionRules = ['→L', '∧L', '∨L', '¬L', '∀L', '∃L'];
  specialRules = ['WR', 'WL', 'Ax'];
  @Output() ruleSelected = new EventEmitter<{ node: DerivationNode, rule: string }>();  
  @Input() selectedNode: DerivationNode | null = null;
  @Input() predictionRuleRequest: { node: DerivationNode, rule: string } | null = null;

  pendingRule: string | null = null;
  pendingRuleNode: DerivationNode | null = null;
  userPredictions: string[] = [];
  predictError: string | null = null;

  private translations = {
    sk: {
      errorRuleCannotBeAppliedToSequent: 'Toto pravidlo sa nedá aplikovať na tento sekvent.',
      errorFillAllFields: 'Prosím vyplňte všetky polia.',
      errorInvalidSequentFormat: 'Neplatný formát sekventu. Použite formát: "A, B ⊢ C, D"',
      errorExpectedSequents: 'Očakávané {expected} sekvent(ov), získané {got}.',
      errorIncorrectAtPosition: 'Nesprávne na pozícii {position}! Očakávané: {expected}',
      errorCannotApplyRule: 'Toto pravidlo sa nedá aplikovať na aktuálny sekvent.'
    },
    en: {
      errorRuleCannotBeAppliedToSequent: 'This rule cannot be applied to this sequent.',
      errorFillAllFields: 'Please fill all prediction fields.',
      errorInvalidSequentFormat: 'Invalid sequent format. Use format: "A, B ⊢ C, D"',
      errorExpectedSequents: 'Expected {expected} sequent(s), got {got}.',
      errorIncorrectAtPosition: 'Incorrect at position {position}! Expected: {expected}',
      errorCannotApplyRule: 'Cannot apply this rule to the current sequent.'
    }
  };

  constructor(private messageService: MessageService) {}

  private showError(key: string, params?: { [key: string]: string | number }) {
    const t = this.translations[this.currentLanguage];
    let message = t[key as keyof typeof t] as string || key;
    
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

  onRuleClick(rule: string) {
    if (this.interactiveSubmode === 'predict') {
      // Special handling for Ax rule - it has 0 children, so apply directly if valid
      if (rule === 'Ax') {
        if (this.root && this.isAxiom(this.root.sequent)) {
          // Ax is valid, apply it directly (no prediction needed)
          this.apply(rule);
          if (this.root) {
            this.nodeClicked.emit(this.root);
          }
          return;
        } else {
          // Ax cannot be applied to this sequent
          this.showError('errorRuleCannotBeAppliedToSequent');
          this.pendingRule = null;
          this.pendingRuleNode = null;
          this.userPredictions = [];
          return;
        }
      }
      
      const expectedCount = this.getExpectedSequentsCount(rule);
      
      // If rule can't be applied, show error and don't open inputs
      if (expectedCount === 0) {
        this.showError('errorRuleCannotBeAppliedToSequent');
        this.pendingRule = null;
        this.pendingRuleNode = null;
        this.userPredictions = [];
        return;
      }
      
      // Rule can be applied, set up prediction inputs and close popup
      this.pendingRule = rule;
      this.pendingRuleNode = this.root;
      this.userPredictions = new Array(expectedCount).fill('');
      this.predictError = null;
      
      // Close the popup by deselecting the node
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
    this.predictError = null;
  }

  confirmPrediction() {
    if (!this.pendingRule || !this.root || !this.pendingRuleNode) return;
    
    const expectedSequents = this.computeExpectedSequents(this.root.sequent, this.pendingRule);
    if (!expectedSequents || expectedSequents.length === 0) {
      this.showError('errorCannotApplyRule');
      return;
    }
    
    // Check all inputs are filled
    if (this.userPredictions.some(p => !p.trim())) {
      this.showError('errorFillAllFields');
      return;
    }
    
    // Parse all user predictions
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
    
    // Compare each sequent
    for (let i = 0; i < expectedSequents.length; i++) {
      if (!this.compareSequents([expectedSequents[i]], [userSequents[i]])) {
        const expectedStr = this.formatSequent(expectedSequents[i]);
        this.showError('errorIncorrectAtPosition', { position: i + 1, expected: expectedStr });
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
  }

  onNodeClick(event: MouseEvent) {
    if (this.mode === 'interactive' && this.root) {
      if (this.selectedNode === this.root) {
        this.selectedNode = null;
      } else {
        this.nodeClicked.emit(this.root);
      }
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

  
  apply(rule: string) {
    if (this.root) {
      this.ruleSelected.emit({ node: this.root, rule });
    }
  }

  formatSequent(sequent: { assumptions: FormulaNode[]; conclusions: FormulaNode[] }): string {
    const safeFormat = (f: FormulaNode | undefined) => f ? this.formatFormula(f) : '‹undefined›';
    const assumptions = sequent.assumptions.map(safeFormat).join(', ');
    const conclusions = sequent.conclusions.map(safeFormat).join(', ');
    return `${assumptions} ⊢ ${conclusions}`;
  }

  formatFormula(f: FormulaNode): string {
    switch (f.kind) {
      case 'Var':
        return f.name;
      case 'Not':
        return f.inner ? `¬${this.parenthesize(f.inner, f)}` : '¬‹missing›';
      case 'And':
        return f.left && f.right
          ? `${this.parenthesize(f.left, f)} ∧ ${this.parenthesize(f.right, f)}`
          : '‹∧ error›';
      case 'Or':
        return f.left && f.right
          ? `${this.parenthesize(f.left, f)} ∨ ${this.parenthesize(f.right, f)}`
          : '‹∨ error›';
      case 'Implies':
        return f.left && f.right
          ? `${this.parenthesize(f.left, f)} → ${this.parenthesize(f.right, f)}`
          : '‹→ error›';
      case 'Forall':
        return `∀${f.variable}. ${this.formatFormula(f.body)}`;
      case 'Exists':
        return `∃${f.variable}. ${this.formatFormula(f.body)}`;
      case 'Predicate':
        const args = f.args.map(arg => this.formatTerm(arg)).join(', ');
        return `${f.name}(${args})`;
      case 'Paren':
        return f.inner ? `(${this.formatFormula(f.inner)})` : '()';
      case 'True':
        return '⊤';
      case 'False':
        return '⊥';
      default:
        return '‹unknown›';
    }
  }

  formatTerm(term: TermNode): string {
    switch (term.kind) {
      case 'TermVar':
        return term.name;
      case 'TermConst':
        return term.name;
      case 'TermFunc':
        const args = term.args.map(arg => this.formatTerm(arg)).join(', ');
        return `${term.name}(${args})`;
      default:
        return '‹unknown term›';
    }
  }

  private getPrecedence(f: FormulaNode): number {
    switch (f.kind) {
      case 'Var': return 5;
      case 'Predicate': return 5;
      case 'Forall': return 4;
      case 'Exists': return 4;
      case 'Not': return 3;
      case 'And': return 2;
      case 'Or':  return 1;
      case 'Implies': return 0;
      default: return -1;
    }
  }

  private parenthesize(child: FormulaNode | undefined, parent: FormulaNode): string {
    if (!child) return '‹undefined›';
    const childStr = this.formatFormula(child);
    return this.getPrecedence(child) < this.getPrecedence(parent) ? `(${childStr})` : childStr;
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
        // For ∀L, we substitute the bound variable with itself (simplified)
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
        return [];
      
      default:
        return null;
    }
  }

  private parseUserPrediction(input: string): SequentNode[] | null {
    try {
      // Normalize input: convert ASCII symbols to Unicode
      const normalized = this.normalizeSymbols(input);
      const sequents = normalized.split('|').map(s => s.trim());
      const parsed: (SequentNode | null)[] = sequents.map(seqStr => {
        // Handle both ⊢ and |- (though normalizeSymbols should have converted it)
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
    // Convert ASCII symbols to Unicode to match Monaco editor format
    let result = input
      .replace(/\|\|/g, '∨')      // || → ∨
      .replace(/&&/g, '∧')        // && → ∧
      .replace(/=>/g, '→')        // => → →
      .replace(/->/g, '→')        // -> → →
      .replace(/\|\-/g, '⊢');     // |- → ⊢
    
    // Handle ! separately to avoid replacing !=
    // Replace ! that's not followed by = (negative lookahead)
    result = result.replace(/!(?!=)/g, '¬');
    
    return result;
  }

  private parseFormula(str: string): FormulaNode | null {
    str = str.trim();
    if (!str) return null;
    
    // Normalize symbols in case they weren't normalized earlier
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
      
      // Parse quantifiers: ∀x. A or ∃x. A
      if (s.startsWith('∀')) {
        const match = s.match(/^∀\s*([a-z_][a-zA-Z0-9_]*)\s*\.\s*(.+)$/);
        if (match) {
          const variable = match[1];
          const body = parseImpl(match[2]);
          return body ? { kind: 'Forall', variable, body } : null;
        }
      }
      
      if (s.startsWith('∃')) {
        const match = s.match(/^∃\s*([a-z_][a-zA-Z0-9_]*)\s*\.\s*(.+)$/);
        if (match) {
          const variable = match[1];
          const body = parseImpl(match[2]);
          return body ? { kind: 'Exists', variable, body } : null;
        }
      }
      
      // Parse predicates: P(x, y) or P()
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
    
    // Parse function applications: f(x, y)
    const funcMatch = str.match(/^([a-z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
    if (funcMatch) {
      const name = funcMatch[1];
      const argsStr = funcMatch[2].trim();
      const args: TermNode[] = argsStr ? argsStr.split(',').map(a => this.parseTerm(a.trim())).filter((t): t is TermNode => t !== null) : [];
      return { kind: 'TermFunc', name, args };
    }
    
    // Parse variables and constants (lowercase identifiers)
    // For simplicity, we'll treat all lowercase identifiers as variables
    // In a full implementation, we'd distinguish based on context
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

  private isAxiom(sequent: SequentNode): boolean {
    return sequent.assumptions.some(a =>
      sequent.conclusions.some(c => this.formulasEqual(a, c))
    );
  }
}
