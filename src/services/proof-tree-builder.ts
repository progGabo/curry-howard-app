import { Injectable, Injector } from '@angular/core';
import { FormulaNode, SequentNode, DerivationNode, TermNode } from '../models/formula-node';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { Equality } from '../utils/equality';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantifierInputModalComponent } from '../components/quantifier-input-modal/quantifier-input-modal';
import { parseTerm, freeVarsFormula, freeVarsTerm, substituteFormula, substituteTerm } from '../utils/quantifier-utils';
import { FormulaRenderService } from './formula-render.service';
import { I18nService } from './i18n.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProofTreeBuilderService {
  private dialogService: DialogService | null = null;

  constructor(
    private injector: Injector,
    private formulaRender: FormulaRenderService,
    private i18n: I18nService
  ) {}

  private getDialogService(): DialogService {
    if (!this.dialogService) {
      this.dialogService = this.injector.get(DialogService);
    }
    return this.dialogService;
  }

  async buildProof(sequent: SequentNode): Promise<DerivationNode> {
    const root = await this.applyRules(sequent);
    return this.annotateLatex(root);
  }

  private annotateLatex(node: DerivationNode): DerivationNode {
    node.sequentLatex = this.formulaRender.sequentToLatex(node.sequent);
    if (node.children?.length) {
      node.children.forEach((child) => this.annotateLatex(child));
    }
    return node;
  }

  private unwrapSequent(sequent: SequentNode): SequentNode {
    return {
      assumptions: sequent.assumptions.map(f => this.unwrapParen(f)),
      conclusions: sequent.conclusions.map(f => this.unwrapParen(f))
    };
  }


  private unwrapParen(f: FormulaNode): FormulaNode {
    return f.kind === 'Paren' ? this.unwrapParen(f.inner) : f;
  }

  private async applyRules(sequent: SequentNode): Promise<DerivationNode> {
    const { assumptions, conclusions } = sequent;

    if (this.isAxiom(sequent)) {
      return { rule: 'Ax', sequent, children: [] };
    }

    // Right rules first (decompose the conclusion)
    const implRight = conclusions.find(f => f.kind === 'Implies');
    if (implRight) return this.applyImplRight(sequent, implRight, false);

    const andRight = conclusions.find(f => f.kind === 'And');
    if (andRight) return this.applyAndRight(sequent, andRight);

    const orRight = conclusions.find(f => f.kind === 'Or');
    if (orRight) return this.applyOrRight(sequent, orRight);

    const notRight = conclusions.find(f => f.kind === 'Not');
    if (notRight) return this.applyNotRight(sequent, notRight);

    const forallRight = conclusions.find(f => f.kind === 'Forall');
    if (forallRight) {
      const result = await this.applyForallRight(sequent, forallRight, false);
      return result;
    }

    const existsRight = conclusions.find(f => f.kind === 'Exists');
    if (existsRight) {
      const result = await this.applyExistsRight(sequent, existsRight, false);
      return result;
    }

    // Left rules (decompose assumptions)
    const implLeft = assumptions.findIndex(f => f.kind === 'Implies');
    if (implLeft !== -1) return this.applyImplLeft(sequent, implLeft);

    const andLeft = assumptions.findIndex(f => f.kind === 'And');
    if (andLeft !== -1) return this.applyAndLeft(sequent, andLeft);

    const orLeft = assumptions.findIndex(f => f.kind === 'Or');
    if (orLeft !== -1) return this.applyOrLeft(sequent, orLeft);

    const notLeft = assumptions.findIndex(f => f.kind === 'Not');
    if (notLeft !== -1) return this.applyNotLeft(sequent, notLeft);

    const forallLeft = assumptions.findIndex(f => f.kind === 'Forall');
    if (forallLeft !== -1) {
      const result = await this.applyForallLeft(sequent, forallLeft, false);
      return result;
    }

    const existsLeft = assumptions.findIndex(f => f.kind === 'Exists');
    if (existsLeft !== -1) {
      const result = await this.applyExistsLeft(sequent, existsLeft, false);
      return result;
    }

    const wl = await this.applyWeakeningLeft(sequent);
    if (wl) return wl;

    return { rule: 'error', sequent, children: [] };
  }

    private async applyImplRight(sequent: SequentNode, impl: FormulaNode, isInteractive = false): Promise<DerivationNode> {
    const implF = impl as any;

    const newSeq: SequentNode = {
      assumptions: [...sequent.assumptions, implF.left],
      conclusions: [implF.right]
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSeq) : await this.applyRules(newSeq);
    return {
      rule: '→R',
      sequent,
      usedFormula: impl,
      children: [child]
    };
  }

  private async applyImplLeft(sequent: SequentNode, idx: number, isInteractive = false): Promise<DerivationNode> {
    const impl = sequent.assumptions[idx];
    if (impl.kind !== 'Implies') throw new Error('Expected implication on the left');

    const gamma = sequent.assumptions.filter((_, i) => i !== idx);

    const leftPremise: SequentNode = {
      assumptions: [...gamma],
      conclusions: [impl.left]
    };

    const rightPremise: SequentNode = {
      assumptions: [...gamma, impl.right],
      conclusions: [...sequent.conclusions]
    };
    const leftChild = isInteractive ? this.buildInteractiveRoot(leftPremise) : await this.applyRules(leftPremise);
    const rightChild = isInteractive ? this.buildInteractiveRoot(rightPremise) : await this.applyRules(rightPremise);
    return {
      rule: '→L',
      sequent,
      usedFormula: impl,
      children: [leftChild, rightChild]
    };
  }

  private async applyAndRight(sequent: SequentNode, andF: FormulaNode, isInteractive = false): Promise<DerivationNode> {
    const and = andF as any;

    const left: SequentNode = {
      assumptions: [...sequent.assumptions],
      conclusions: [and.left]
    };

    const right: SequentNode = {
      assumptions: [...sequent.assumptions],
      conclusions: [and.right]
    };

    const leftChild = isInteractive ? this.buildInteractiveRoot(left) : await this.applyRules(left);
    const rightChild = isInteractive ? this.buildInteractiveRoot(right) : await this.applyRules(right);
    return {
      rule: '∧R',
      sequent,
      usedFormula: and,
      children: [leftChild, rightChild]
    };
  }

  private async applyAndLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false, side?: 'left' | 'right'): Promise<DerivationNode> {
    const and = sequent.assumptions[idx] as FormulaNode & { left: FormulaNode; right: FormulaNode };
    const gamma = sequent.assumptions.filter((_, i) => i !== idx);

    if (isInteractive) {
      const chosen = side === 'right' ? and.right : and.left;
      const ruleName = side === 'right' ? '∧L2' : '∧L1';
      const newSeq: SequentNode = {
        assumptions: [...gamma, chosen],
        conclusions: sequent.conclusions
      };
      const child = this.buildInteractiveRoot(newSeq);
      return { rule: ruleName, sequent, usedFormula: and, children: [child] };
    }

    // Automatic mode: try left conjunct first, then right
    const leftSeq: SequentNode = {
      assumptions: [...gamma, and.left],
      conclusions: sequent.conclusions
    };
    const leftResult = await this.applyRules(leftSeq);
    if (!this.hasError(leftResult)) {
      return { rule: '∧L1', sequent, usedFormula: and, children: [leftResult] };
    }

    const rightSeq: SequentNode = {
      assumptions: [...gamma, and.right],
      conclusions: sequent.conclusions
    };
    const rightResult = await this.applyRules(rightSeq);
    return { rule: '∧L2', sequent, usedFormula: and, children: [rightResult] };
  }

  private async applyOrRight(sequent: SequentNode, orFormula: FormulaNode, isInteractive: boolean = false, side?: 'left' | 'right'): Promise<DerivationNode> {
    if (orFormula.kind !== 'Or') throw new Error('Expected disjunction');

    if (isInteractive) {
      const chosenConclusion = side === 'right' ? orFormula.right : orFormula.left;
      const ruleName = side === 'right' ? '∨R2' : '∨R1';
      const newSeq: SequentNode = {
        assumptions: sequent.assumptions,
        conclusions: [chosenConclusion]
      };
      const child = this.buildInteractiveRoot(newSeq);
      return { rule: ruleName, sequent, usedFormula: orFormula, children: [child] };
    }

    // Automatic mode: try left disjunct first, then right
    const leftSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [orFormula.left]
    };
    const leftResult = await this.applyRules(leftSeq);
    if (!this.hasError(leftResult)) {
      return { rule: '∨R1', sequent, usedFormula: orFormula, children: [leftResult] };
    }

    const rightSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [orFormula.right]
    };
    const rightResult = await this.applyRules(rightSeq);
    return { rule: '∨R2', sequent, usedFormula: orFormula, children: [rightResult] };
  }

  private hasError(node: DerivationNode): boolean {
    if (node.rule === 'error') return true;
    return node.children?.some(c => this.hasError(c)) ?? false;
  }

  private async applyOrLeft(sequent: SequentNode, orIndex: number, isInteractive: boolean = false): Promise<DerivationNode> {
    const or = sequent.assumptions[orIndex];
    if (or.kind !== 'Or') throw new Error('Expected disjunction on the left');
    const gamma = sequent.assumptions.filter((_, i) => i !== orIndex);

    const leftPremise: SequentNode = {
      assumptions: [...gamma, or.left],
      conclusions: sequent.conclusions
    };

    const rightPremise: SequentNode = {
      assumptions: [...gamma, or.right],
      conclusions: sequent.conclusions
    };

    const leftChild = isInteractive ? this.buildInteractiveRoot(leftPremise) : await this.applyRules(leftPremise);
    const rightChild = isInteractive ? this.buildInteractiveRoot(rightPremise) : await this.applyRules(rightPremise);
    return {
      rule: '∨L',
      sequent,
      usedFormula: or,
      children: [leftChild, rightChild]
    };
  }

  private async applyNotRight(sequent: SequentNode, notF: FormulaNode, isInteractive: boolean = false): Promise<DerivationNode> {
    const not = notF as any;

    const newSequent: SequentNode = {
      assumptions: [...sequent.assumptions, not.inner],
      conclusions: [FormulaFactories.false()]
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSequent) : await this.applyRules(newSequent);
    return {
      rule: '¬R',
      sequent,
      usedFormula: notF,
      children: [child]
    };
  }

  private async applyNotLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false): Promise<DerivationNode> {
    const not = sequent.assumptions[idx] as any;
    const gamma = sequent.assumptions.filter((_, i) => i !== idx);

    const newSequent: SequentNode = {
      assumptions: gamma,
      conclusions: [not.inner]
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSequent) : await this.applyRules(newSequent);
    return {
      rule: '¬L',
      sequent,
      usedFormula: not,
      children: [child]
    };
  }

  private async applyWeakeningLeft(sequent: SequentNode, isInteractive: boolean = false): Promise<DerivationNode | null> {
    const match = sequent.assumptions.find(a =>
      sequent.conclusions.some(c => Equality.formulasEqual(a, c))
    );

    if (!match || sequent.assumptions.length <= 1) return null;

    const newSequent: SequentNode = {
      assumptions: [match],
      conclusions: sequent.conclusions
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSequent) : await this.applyRules(newSequent);
    return {
      rule: 'WL',
      sequent,
      children: [child]
    };
  }

  private async applyForallRight(sequent: SequentNode, forallF: FormulaNode, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk', quantifierInput?: string): Promise<DerivationNode> {
    if (forallF.kind !== 'Forall') throw new Error('Expected universal quantifier');
    
    const variable = forallF.variable;
    const body = forallF.body;
    
    let eigenVar: string;
    
    if (isInteractive) {
      const freeVarsInGamma = this.collectFreeVarsFromFormulas(sequent.assumptions);

      if (quantifierInput) {
        eigenVar = quantifierInput;
      } else {
        eigenVar = await this.promptQuantifierInput('forall-right', language, freeVarsInGamma);
      }
      
      const varMatch = eigenVar.match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        throw new Error(this.i18n.quantifierRuntimeErrors(language).invalidVariable.replace('{var}', eigenVar));
      }
      
      if (new Set(freeVarsInGamma).has(eigenVar)) {
        throw new Error(this.i18n.quantifierRuntimeErrors(language).notFreshInAssumptions.replace('{var}', eigenVar));
      }
    } else {
      const freeVars = new Set<string>();
      sequent.assumptions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVars.add(v));
      });
      eigenVar = this.freshVariable(variable, Array.from(freeVars), [variable]);
    }
    
    const substitutedBody = substituteFormula(body, variable, TermFactories.var(eigenVar));
    
    const newSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [substitutedBody]
    };
    
    const child = isInteractive ? this.buildInteractiveRoot(newSeq) : await this.applyRules(newSeq);
    return {
      rule: '∀R',
      sequent,
      usedFormula: forallF,
      metadata: {
        renamedVariable: { old: variable, new: eigenVar }
      },
      children: [child]
    };
  }

  private async applyForallLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk', quantifierInput?: string): Promise<DerivationNode> {
    const forall = sequent.assumptions[idx];
    if (forall.kind !== 'Forall') throw new Error('Expected universal quantifier on the left');
    
    const variable = forall.variable;
    const body = forall.body;
    
    const term = await this.resolveQuantifierTerm(variable, isInteractive, language, 'forall-left', quantifierInput);
    
    const substituted = substituteFormula(body, variable, term);
    
    const gamma = sequent.assumptions.filter((_, i) => i !== idx);
    const newSeq: SequentNode = {
      assumptions: [...gamma, substituted],
      conclusions: sequent.conclusions
    };
    
    const child = await this.deriveChildNode(newSeq, isInteractive);
    return {
      rule: '∀L',
      sequent,
      usedFormula: forall,
      metadata: {
        substitution: { variable, term }
      },
      children: [child]
    };
  }

  private async applyExistsRight(sequent: SequentNode, existsF: FormulaNode, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk', quantifierInput?: string): Promise<DerivationNode> {
    if (existsF.kind !== 'Exists') throw new Error('Expected existential quantifier');
    
    const variable = existsF.variable;
    const body = existsF.body;
    
    const term = await this.resolveQuantifierTerm(variable, isInteractive, language, 'exists-right', quantifierInput);
    
    const substituted = substituteFormula(body, variable, term);
    
    const newSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [substituted]
    };
    
    const child = await this.deriveChildNode(newSeq, isInteractive);
    return {
      rule: '∃R',
      sequent,
      usedFormula: existsF,
      metadata: {
        witness: term,
        substitution: { variable, term }
      },
      children: [child]
    };
  }

  private async applyExistsLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk', quantifierInput?: string): Promise<DerivationNode> {
    const exists = sequent.assumptions[idx];
    if (exists.kind !== 'Exists') throw new Error('Expected existential quantifier on the left');
    
    const variable = exists.variable;
    const body = exists.body;
    
    const otherAssumptions = sequent.assumptions.filter((_, i) => i !== idx);
    
    let eigenVar: string;
    
    if (isInteractive) {
      const freeVarsInGammaDelta = this.collectFreeVarsFromFormulas([...otherAssumptions, ...sequent.conclusions]);

      if (quantifierInput) {
        eigenVar = quantifierInput;
      } else {
        eigenVar = await this.promptQuantifierInput('exists-left', language, freeVarsInGammaDelta);
      }
      
      const varMatch = eigenVar.match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        throw new Error(this.i18n.quantifierRuntimeErrors(language).invalidVariable.replace('{var}', eigenVar));
      }
      
      if (new Set(freeVarsInGammaDelta).has(eigenVar)) {
        throw new Error(this.i18n.quantifierRuntimeErrors(language).notFreshInAssumptionsConclusions.replace('{var}', eigenVar));
      }
    } else {
      const freeVars = new Set<string>();
      otherAssumptions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVars.add(v));
      });
      sequent.conclusions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVars.add(v));
      });
      eigenVar = this.freshVariable(variable, Array.from(freeVars), [variable]);
    }
    
    const substitutedBody = substituteFormula(body, variable, TermFactories.var(eigenVar));
    
    const newSeq: SequentNode = {
      assumptions: [...otherAssumptions, substitutedBody],
      conclusions: sequent.conclusions
    };
    
    const child = isInteractive ? this.buildInteractiveRoot(newSeq) : await this.applyRules(newSeq);
    return {
      rule: '∃L',
      sequent,
      usedFormula: exists,
      metadata: {
        renamedVariable: { old: variable, new: eigenVar }
      },
      children: [child]
    };
  }

  private collectFreeVarsFromFormulas(formulas: FormulaNode[]): string[] {
    const freeVars = new Set<string>();
    for (const formula of formulas) {
      for (const variable of freeVarsFormula(formula)) {
        freeVars.add(variable);
      }
    }
    return Array.from(freeVars);
  }

  private parseTermOrThrow(termStr: string, language: 'sk' | 'en'): TermNode {
    const parsedTerm = parseTerm(termStr);
    if (!parsedTerm) {
      throw new Error(this.i18n.quantifierRuntimeErrors(language).invalidTerm.replace('{term}', termStr));
    }
    return parsedTerm;
  }

  private async resolveQuantifierTerm(
    variable: string,
    isInteractive: boolean,
    language: 'sk' | 'en',
    ruleType: 'forall-left' | 'exists-right',
    quantifierInput?: string
  ): Promise<TermNode> {
    if (!isInteractive) {
      return TermFactories.var(variable);
    }

    const termStr = quantifierInput ?? await this.promptQuantifierInput(ruleType, language);
    return this.parseTermOrThrow(termStr, language);
  }

  private async deriveChildNode(sequent: SequentNode, isInteractive: boolean): Promise<DerivationNode> {
    return isInteractive ? this.buildInteractiveRoot(sequent) : this.applyRules(sequent);
  }

  private async promptQuantifierInput(
    ruleType: 'forall-right' | 'forall-left' | 'exists-right' | 'exists-left',
    language: 'sk' | 'en',
    freeVars?: string[]
  ): Promise<string> {
    const title = this.i18n.quantifierRuleLabels(language, ruleType).title;
    const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
      header: title,
      data: {
        ruleType,
        title,
        freeVars,
        language
      },
      width: '440px',
      modal: true
    });

    if (!dialogRef) {
      throw new Error(this.i18n.quantifierRuntimeErrors(language).dialogOpenFailed);
    }

    const result = await firstValueFrom(dialogRef.onClose);
    if (!result) {
      throw new Error(this.i18n.quantifierRuntimeErrors(language).cancelled);
    }

    return String(result).trim();
  }

  private isAxiom(sequent: SequentNode): boolean {
    const conclusion = sequent.conclusions[0];
    if (!conclusion) return false;
    return sequent.assumptions.some(a => Equality.formulasEqual(a, conclusion));
  }

  private freshVariable(base: string, usedVars: string[], avoidVars: string[]): string {
    const allUsed = new Set([...usedVars, ...avoidVars]);
    let candidate = base;
    let counter = 0;
    while (allUsed.has(candidate)) {
      candidate = `${base}${counter}`;
      counter++;
    }
    return candidate;
  }

  private findConclusionByKind(sequent: SequentNode, kind: FormulaNode['kind']): FormulaNode | undefined {
    return sequent.conclusions.find((formula) => formula.kind === kind);
  }

  private findAssumptionIndexByKind(sequent: SequentNode, kind: FormulaNode['kind']): number {
    return sequent.assumptions.findIndex((formula) => formula.kind === kind);
  }

  async applyRuleManually(sequent: SequentNode, rule: string, isInteractive = true, language: 'sk' | 'en' = 'sk', quantifierInput?: string): Promise<DerivationNode | null> {
    if (rule === 'Ax' || rule === 'id' || rule === 'ID') {
      const axiom = this.isAxiom(sequent) ? { rule: 'Ax', sequent, children: [] } : null;
      return axiom ? this.annotateLatex(axiom) : null;
    }

    const handlers: Record<string, () => Promise<DerivationNode | null>> = {
      '→R': async () => {
        const impl = this.findConclusionByKind(sequent, 'Implies');
        return impl ? this.applyImplRight(sequent, impl, isInteractive) : null;
      },
      '→L': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'Implies');
        return index !== -1 ? this.applyImplLeft(sequent, index, isInteractive) : null;
      },
      '∧R': async () => {
        const and = this.findConclusionByKind(sequent, 'And');
        return and ? this.applyAndRight(sequent, and, isInteractive) : null;
      },
      '∧L1': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'And');
        return index !== -1 ? this.applyAndLeft(sequent, index, isInteractive, 'left') : null;
      },
      '∧L2': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'And');
        return index !== -1 ? this.applyAndLeft(sequent, index, isInteractive, 'right') : null;
      },
      '∨R1': async () => {
        const or = this.findConclusionByKind(sequent, 'Or');
        return or ? this.applyOrRight(sequent, or, isInteractive, 'left') : null;
      },
      '∨R2': async () => {
        const or = this.findConclusionByKind(sequent, 'Or');
        return or ? this.applyOrRight(sequent, or, isInteractive, 'right') : null;
      },
      '∨L': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'Or');
        return index !== -1 ? this.applyOrLeft(sequent, index, isInteractive) : null;
      },
      '¬R': async () => {
        const not = this.findConclusionByKind(sequent, 'Not');
        return not ? this.applyNotRight(sequent, not, isInteractive) : null;
      },
      '¬L': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'Not');
        return index !== -1 ? this.applyNotLeft(sequent, index, isInteractive) : null;
      },
      'WL': async () => this.applyWeakeningLeft(sequent, isInteractive),
      '∀R': async () => {
        const forall = this.findConclusionByKind(sequent, 'Forall');
        return forall ? this.applyForallRight(sequent, forall, isInteractive, language, quantifierInput) : null;
      },
      '∀L': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'Forall');
        return index !== -1 ? this.applyForallLeft(sequent, index, isInteractive, language, quantifierInput) : null;
      },
      '∃R': async () => {
        const exists = this.findConclusionByKind(sequent, 'Exists');
        return exists ? this.applyExistsRight(sequent, exists, isInteractive, language, quantifierInput) : null;
      },
      '∃L': async () => {
        const index = this.findAssumptionIndexByKind(sequent, 'Exists');
        return index !== -1 ? this.applyExistsLeft(sequent, index, isInteractive, language, quantifierInput) : null;
      }
    };

    const handler = handlers[rule];
    const result = handler ? await handler() : null;
    return result ? this.annotateLatex(result) : null;
  }

  getQuantifierInfo(sequent: SequentNode, rule: string, language: 'sk' | 'en'): { ruleType: string; isVariable: boolean; freeVars: string[]; placeholder: string; label: string } | null {
    const QUANTIFIER_RULES = ['∀R', '∀L', '∃R', '∃L'];
    if (!QUANTIFIER_RULES.includes(rule)) return null;

    const ruleTypeMap: Record<string, string> = {
      '∀R': 'forall-right', '∀L': 'forall-left', '∃R': 'exists-right', '∃L': 'exists-left'
    };
    const isVariableMap: Record<string, boolean> = {
      '∀R': true, '∀L': false, '∃R': false, '∃L': true
    };
    const ruleType = ruleTypeMap[rule];
    const isVariable = isVariableMap[rule];
    const labels = this.i18n.quantifierRuleLabels(language, ruleType);

    let freeVars: string[] = [];
    if (rule === '∀R') {
      freeVars = this.collectFreeVarsFromFormulas(sequent.assumptions);
    } else if (rule === '∃L') {
      const idx = sequent.assumptions.findIndex(f => f.kind === 'Exists');
      const otherAssumptions = sequent.assumptions.filter((_, i) => i !== idx);
      freeVars = this.collectFreeVarsFromFormulas([...otherAssumptions, ...sequent.conclusions]);
    }

    return { ruleType, isVariable, freeVars, placeholder: labels.placeholder, label: labels.title };
  }

    buildInteractiveRoot(sequent: SequentNode): DerivationNode {
    return this.annotateLatex({
      rule: '∅', // alebo necháš prázdne ''
      sequent: this.unwrapSequent(sequent),
      children: [],
      usedFormula: undefined
    });
  }
}
