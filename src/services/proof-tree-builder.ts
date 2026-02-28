import { Injectable, Injector } from '@angular/core';
import { FormulaNode, SequentNode, DerivationNode, TermNode } from '../models/formula-node';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { Equality } from '../utils/equality';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QuantifierInputModalComponent } from '../components/quantifier-input-modal/quantifier-input-modal';
import { parseTerm, freeVarsFormula, freeVarsTerm, substituteFormula, substituteTerm } from '../utils/quantifier-utils';
import { FormulaRenderService } from './formula-render.service';

@Injectable({ providedIn: 'root' })
export class ProofTreeBuilderService {
  private dialogService: DialogService | null = null;

  constructor(
    private injector: Injector,
    private formulaRender: FormulaRenderService
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

    const implRight = conclusions.find(f => f.kind === 'Implies');
    if (implRight) return this.applyImplRight(sequent, implRight, false);

    const andRight = conclusions.find(f => f.kind === 'And');
    if (andRight) return this.applyAndRight(sequent, andRight);

    const orRight = conclusions.find(f => f.kind === 'Or');
    if (orRight) return this.applyOrRight(sequent, orRight);

    const implLeft = assumptions.findIndex(f => f.kind === 'Implies');
    if (implLeft !== -1) return this.applyImplLeft(sequent, implLeft);

    const andLeft = assumptions.findIndex(f => f.kind === 'And');
    if (andLeft !== -1) return this.applyAndLeft(sequent, andLeft);

    const orLeft = assumptions.findIndex(f => f.kind === 'Or');
    if (orLeft !== -1) return this.applyOrLeft(sequent, orLeft);

    const notRight = conclusions.find(f => f.kind === 'Not');
    if (notRight) return this.applyNotRight(sequent, notRight);

    const notLeft = assumptions.findIndex(f => f.kind === 'Not');
    if (notLeft !== -1) return this.applyNotLeft(sequent, notLeft);

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

    const wr = await this.applyWeakeningRight(sequent);
    if (wr) return wr;

    const wl = await this.applyWeakeningLeft(sequent);
    if (wl) return wl;

    return { rule: 'error', sequent, children: [] };
  }

    private async applyImplRight(sequent: SequentNode, impl: FormulaNode, isInteractive = false): Promise<DerivationNode> {
    const implF = impl as any;
    const newConclusions = sequent.conclusions.map(c =>
      Equality.formulasEqual(c, impl) ? implF.right : c
    );

    const newSeq: SequentNode = {
      assumptions: [...sequent.assumptions, implF.left],
      conclusions: newConclusions
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
      conclusions: [...sequent.conclusions, impl.left]
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
      conclusions: sequent.conclusions.map(c =>
        Equality.formulasEqual(c, andF) ? and.left : c
      )
    };

    const right: SequentNode = {
      assumptions: [...sequent.assumptions],
      conclusions: sequent.conclusions.map(c =>
        Equality.formulasEqual(c, andF) ? and.right : c
      )
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

  private async applyAndLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false): Promise<DerivationNode> {
    const and = sequent.assumptions[idx] as FormulaNode & { left: FormulaNode; right: FormulaNode };
    const gamma = sequent.assumptions.filter((_, i) => i !== idx);
    const newAssumptions = [...gamma, and.left, and.right];

    const newSequent: SequentNode = {
      assumptions: newAssumptions,
      conclusions: sequent.conclusions
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSequent) : await this.applyRules(newSequent);
    return {
      rule: '∧L',
      sequent,
      usedFormula: and,
      children: [child]
    };
  }

  private async applyOrRight(sequent: SequentNode, orFormula: FormulaNode, isInteractive: boolean = false): Promise<DerivationNode> {
    if (orFormula.kind !== 'Or') throw new Error('Expected disjunction');

    const newConclusions = sequent.conclusions.filter(c => !Equality.formulasEqual(c, orFormula));

    const leftSequent: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [...newConclusions, orFormula.left, orFormula.right]
    };

    const child = isInteractive ? this.buildInteractiveRoot(leftSequent) : await this.applyRules(leftSequent);
    return {
      rule: '∨R',
      sequent,
      usedFormula: orFormula,
      children: [child]
    };
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
    const newConclusions = sequent.conclusions.filter(c => !Equality.formulasEqual(c, notF));

    const newSequent: SequentNode = {
      assumptions: [...sequent.assumptions, not.inner],
      conclusions: newConclusions
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
      conclusions: [...sequent.conclusions, not.inner]
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

  private async applyForallRight(sequent: SequentNode, forallF: FormulaNode, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk'): Promise<DerivationNode> {
    if (forallF.kind !== 'Forall') throw new Error('Expected universal quantifier');
    
    const variable = forallF.variable;
    const body = forallF.body;
    
    let eigenVar: string;
    
    if (isInteractive) {
      const freeVarsInGamma = new Set<string>();
      sequent.assumptions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVarsInGamma.add(v));
      });
      
      const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
        header: language === 'sk' ? '∀R: Zvoľte eigenpremennú' : '∀R: Choose Eigenvariable',
        data: {
          ruleType: 'forall-right',
          title: language === 'sk' ? '∀R: Zvoľte eigenpremennú' : '∀R: Choose Eigenvariable',
          freeVars: Array.from(freeVarsInGamma),
          language: language
        },
        width: '500px',
        modal: true
      });
      
      const result = await dialogRef.onClose.toPromise();
      if (!result) {
        throw new Error('User cancelled quantifier rule application');
      }
      
      eigenVar = result.trim();
      
      const varMatch = eigenVar.match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        throw new Error(`Invalid variable name: ${eigenVar}. Must be a lowercase identifier.`);
      }
      
      if (freeVarsInGamma.has(eigenVar)) {
        throw new Error(`Variable ${eigenVar} is not fresh: it occurs free in the assumptions.`);
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
    
    const newConclusions = sequent.conclusions.map(c => 
      Equality.formulasEqual(c, forallF) ? substitutedBody : c
    );
    const newSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: newConclusions
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

  private async applyForallLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk'): Promise<DerivationNode> {
    const forall = sequent.assumptions[idx];
    if (forall.kind !== 'Forall') throw new Error('Expected universal quantifier on the left');
    
    const variable = forall.variable;
    const body = forall.body;
    
    let term: TermNode;
    
    if (isInteractive) {
      const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
        header: language === 'sk' ? '∀L: Zvoľte instanciačný term' : '∀L: Choose Instantiation Term',
        data: {
          ruleType: 'forall-left',
          title: language === 'sk' ? '∀L: Zvoľte instanciačný term' : '∀L: Choose Instantiation Term',
          language: language
        },
        width: '500px',
        modal: true
      });
      
      const result = await dialogRef.onClose.toPromise();
      if (!result) {
        throw new Error('User cancelled quantifier rule application');
      }
      
      const termStr = result.trim();
      const parsedTerm = parseTerm(termStr);
      if (!parsedTerm) {
        throw new Error(`Invalid term: ${termStr}. Must be a variable, constant, or function application.`);
      }
      
      term = parsedTerm;
    } else {
      term = TermFactories.var(variable);
    }
    
    const substituted = substituteFormula(body, variable, term);
    
    const gamma = sequent.assumptions.filter((_, i) => i !== idx);
    const newSeq: SequentNode = {
      assumptions: [...gamma, substituted],
      conclusions: sequent.conclusions
    };
    
    const child = isInteractive ? this.buildInteractiveRoot(newSeq) : await this.applyRules(newSeq);
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

  private async applyExistsRight(sequent: SequentNode, existsF: FormulaNode, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk'): Promise<DerivationNode> {
    if (existsF.kind !== 'Exists') throw new Error('Expected existential quantifier');
    
    const variable = existsF.variable;
    const body = existsF.body;
    
    let term: TermNode;
    
    if (isInteractive) {
      const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
        header: language === 'sk' ? '∃R: Zvoľte svedecký term' : '∃R: Choose Witness Term',
        data: {
          ruleType: 'exists-right',
          title: language === 'sk' ? '∃R: Zvoľte svedecký term' : '∃R: Choose Witness Term',
          language: language
        },
        width: '500px',
        modal: true
      });
      
      const result = await dialogRef.onClose.toPromise();
      if (!result) {
        throw new Error('User cancelled quantifier rule application');
      }
      
      const termStr = result.trim();
      const parsedTerm = parseTerm(termStr);
      if (!parsedTerm) {
        throw new Error(`Invalid term: ${termStr}. Must be a variable, constant, or function application.`);
      }
      
      term = parsedTerm;
    } else {
      term = TermFactories.var(variable);
    }
    
    const substituted = substituteFormula(body, variable, term);
    
    const newConclusions = sequent.conclusions.map(c => 
      Equality.formulasEqual(c, existsF) ? substituted : c
    );
    const newSeq: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: newConclusions
    };
    
    const child = isInteractive ? this.buildInteractiveRoot(newSeq) : await this.applyRules(newSeq);
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

  private async applyExistsLeft(sequent: SequentNode, idx: number, isInteractive: boolean = false, language: 'sk' | 'en' = 'sk'): Promise<DerivationNode> {
    const exists = sequent.assumptions[idx];
    if (exists.kind !== 'Exists') throw new Error('Expected existential quantifier on the left');
    
    const variable = exists.variable;
    const body = exists.body;
    
    const otherAssumptions = sequent.assumptions.filter((_, i) => i !== idx);
    
    let eigenVar: string;
    
    if (isInteractive) {
      const freeVarsInGammaDelta = new Set<string>();
      otherAssumptions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVarsInGammaDelta.add(v));
      });
      sequent.conclusions.forEach(f => {
        const fv = freeVarsFormula(f);
        fv.forEach(v => freeVarsInGammaDelta.add(v));
      });
      
      const dialogRef = this.getDialogService().open(QuantifierInputModalComponent, {
        header: language === 'sk' ? '∃L: Zvoľte eigenpremennú' : '∃L: Choose Eigenvariable',
        data: {
          ruleType: 'exists-left',
          title: language === 'sk' ? '∃L: Zvoľte eigenpremennú' : '∃L: Choose Eigenvariable',
          freeVars: Array.from(freeVarsInGammaDelta),
          language: language
        },
        width: '500px',
        modal: true
      });
      
      const result = await dialogRef.onClose.toPromise();
      if (!result) {
        throw new Error('User cancelled quantifier rule application');
      }
      
      eigenVar = result.trim();
      
      const varMatch = eigenVar.match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        throw new Error(`Invalid variable name: ${eigenVar}. Must be a lowercase identifier.`);
      }
      
      if (freeVarsInGammaDelta.has(eigenVar)) {
        throw new Error(`Variable ${eigenVar} is not fresh: it occurs free in the assumptions or conclusions.`);
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

  private async applyWeakeningRight(sequent: SequentNode, isInteractive: boolean = false): Promise<DerivationNode | null> {
    const match = sequent.conclusions.find(c =>
      sequent.assumptions.some(a => Equality.formulasEqual(a, c))
    );

    if (!match || sequent.conclusions.length <= 1) return null;

    const newSequent: SequentNode = {
      assumptions: sequent.assumptions,
      conclusions: [match]
    };

    const child = isInteractive ? this.buildInteractiveRoot(newSequent) : await this.applyRules(newSequent);
    return {
      rule: 'WR',
      sequent,
      children: [child]
    };
  }

  private isAxiom(sequent: SequentNode): boolean {
    return sequent.assumptions.some(a =>
      sequent.conclusions.some(c => Equality.formulasEqual(a, c))
    );
  }

  private formulasEqual(a: FormulaNode, b: FormulaNode): boolean {
    if (!a || !b || a.kind !== b.kind) return false;
    
    switch (a.kind) {
      case 'Var':
        return a.name === (b as any).name;
      case 'Not':
        return Equality.formulasEqual(a.inner, (b as any).inner);
      case 'Implies':
      case 'And':
      case 'Or':
        return Equality.formulasEqual(a.left, (b as any).left) && 
               Equality.formulasEqual(a.right, (b as any).right);
      case 'Forall':
      case 'Exists':
        return a.variable === (b as any).variable && 
               Equality.formulasEqual(a.body, (b as any).body);
      case 'Predicate':
        if (a.name !== (b as any).name || a.args.length !== (b as any).args.length) {
          return false;
        }
        return a.args.every((arg, i) => this.termsEqual(arg, (b as any).args[i]));
      case 'Paren':
        return Equality.formulasEqual(a.inner, (b as any).inner);
      case 'True':
      case 'False':
        return true;
      default:
        return false;
    }
  }

  private termsEqual(t1: TermNode, t2: TermNode): boolean {
    if (!t1 || !t2 || t1.kind !== t2.kind) return false;
    
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

  private isFreeIn(variable: string, formula: FormulaNode): boolean {
    switch (formula.kind) {
      case 'Var':
        return formula.name === variable;
      case 'Forall':
      case 'Exists':
        if (formula.variable === variable) return false; // bound variable
        return this.isFreeIn(variable, formula.body);
      case 'Implies':
      case 'And':
      case 'Or':
        return this.isFreeIn(variable, formula.left) || this.isFreeIn(variable, formula.right);
      case 'Not':
        return this.isFreeIn(variable, formula.inner);
      case 'Predicate':
        return formula.args.some(term => this.isFreeInTerm(variable, term));
      case 'Paren':
        return this.isFreeIn(variable, formula.inner);
      case 'True':
      case 'False':
        return false;
      default:
        return false;
    }
  }

  private isFreeInTerm(variable: string, term: TermNode): boolean {
    switch (term.kind) {
      case 'TermVar':
        return term.name === variable;
      case 'TermConst':
        return false;
      case 'TermFunc':
        return term.args.some(arg => this.isFreeInTerm(variable, arg));
      default:
        return false;
    }
  }

  private getFreeVariables(formula: FormulaNode): string[] {
    const vars = new Set<string>();
    this.collectFreeVariables(formula, vars, new Set<string>());
    return Array.from(vars);
  }

  private collectFreeVariables(formula: FormulaNode, freeVars: Set<string>, boundVars: Set<string>): void {
    switch (formula.kind) {
      case 'Var':
        if (!boundVars.has(formula.name)) {
          freeVars.add(formula.name);
        }
        break;
      case 'Forall':
      case 'Exists':
        const newBound = new Set(boundVars);
        newBound.add(formula.variable);
        this.collectFreeVariables(formula.body, freeVars, newBound);
        break;
      case 'Implies':
      case 'And':
      case 'Or':
        this.collectFreeVariables(formula.left, freeVars, boundVars);
        this.collectFreeVariables(formula.right, freeVars, boundVars);
        break;
      case 'Not':
        this.collectFreeVariables(formula.inner, freeVars, boundVars);
        break;
      case 'Predicate':
        formula.args.forEach(term => this.collectFreeVariablesInTerm(term, freeVars, boundVars));
        break;
      case 'Paren':
        this.collectFreeVariables(formula.inner, freeVars, boundVars);
        break;
      case 'True':
      case 'False':
        break;
    }
  }

  private collectFreeVariablesInTerm(term: TermNode, freeVars: Set<string>, boundVars: Set<string>): void {
    switch (term.kind) {
      case 'TermVar':
        if (!boundVars.has(term.name)) {
          freeVars.add(term.name);
        }
        break;
      case 'TermConst':
        break;
      case 'TermFunc':
        term.args.forEach(arg => this.collectFreeVariablesInTerm(arg, freeVars, boundVars));
        break;
    }
  }

  private substituteTerm(formula: FormulaNode, variable: string, term: TermNode): FormulaNode {
    switch (formula.kind) {
      case 'Var':
        return formula;
      case 'Forall':
        if (formula.variable === variable) {
          return formula; 
        }
        const freeInTerm = this.getFreeVariablesInTerm(term);
        if (freeInTerm.includes(formula.variable)) {
          const newVar = this.freshVariable(formula.variable, this.getFreeVariables(formula.body), freeInTerm);
          const renamedBody = this.renameVariable(formula.body, formula.variable, newVar);
          return FormulaFactories.forall(newVar, this.substituteTerm(renamedBody, variable, term));
        }
        return FormulaFactories.forall(formula.variable, this.substituteTerm(formula.body, variable, term));
      case 'Exists':
        if (formula.variable === variable) {
          return formula; 
        }
        const freeInTermExists = this.getFreeVariablesInTerm(term);
        if (freeInTermExists.includes(formula.variable)) {
          const newVarExists = this.freshVariable(formula.variable, this.getFreeVariables(formula.body), freeInTermExists);
          const renamedBodyExists = this.renameVariable(formula.body, formula.variable, newVarExists);
          return FormulaFactories.exists(
            newVarExists,
            this.substituteTerm(renamedBodyExists, variable, term)
          );
        }
        return FormulaFactories.exists(
          formula.variable,
          this.substituteTerm(formula.body, variable, term)
        );
      case 'Implies':
        return FormulaFactories.implies(
          this.substituteTerm(formula.left, variable, term),
          this.substituteTerm(formula.right, variable, term)
        );
      case 'And':
        return FormulaFactories.and(
          this.substituteTerm(formula.left, variable, term),
          this.substituteTerm(formula.right, variable, term)
        );
      case 'Or':
        return FormulaFactories.or(
          this.substituteTerm(formula.left, variable, term),
          this.substituteTerm(formula.right, variable, term)
        );
      case 'Not':
        return FormulaFactories.not(
          this.substituteTerm(formula.inner, variable, term)
        );
      case 'Predicate':
        return FormulaFactories.predicate(
          formula.name,
          formula.args.map(arg => this.substituteInTerm(arg, variable, term))
        );
      case 'Paren':
        return {
          kind: 'Paren',
          inner: this.substituteTerm(formula.inner, variable, term)
        };
      case 'True':
      case 'False':
        return formula;
      default:
        return formula;
    }
  }

  private substituteInTerm(term: TermNode, variable: string, replacement: TermNode): TermNode {
    switch (term.kind) {
      case 'TermVar':
        return term.name === variable ? replacement : term;
      case 'TermConst':
        return term;
      case 'TermFunc':
        return TermFactories.func(
          term.name,
          term.args.map(arg => this.substituteInTerm(arg, variable, replacement))
        );
      default:
        return term;
    }
  }

  private getFreeVariablesInTerm(term: TermNode): string[] {
    const vars = new Set<string>();
    this.collectFreeVariablesInTerm(term, vars, new Set<string>());
    return Array.from(vars);
  }

  private renameVariable(formula: FormulaNode, oldVar: string, newVar: string): FormulaNode {
    switch (formula.kind) {
      case 'Var':
        return formula.name === oldVar ? FormulaFactories.var(newVar) : formula;
      case 'Forall':
        if (formula.variable === oldVar) {
          return FormulaFactories.forall(newVar, this.renameVariable(formula.body, oldVar, newVar));
        }
        return FormulaFactories.forall(formula.variable, this.renameVariable(formula.body, oldVar, newVar));
      case 'Exists':
        if (formula.variable === oldVar) {
          return FormulaFactories.exists(newVar, this.renameVariable(formula.body, oldVar, newVar));
        }
        return FormulaFactories.exists(formula.variable, this.renameVariable(formula.body, oldVar, newVar));
      case 'Implies':
        return FormulaFactories.implies(
          this.renameVariable(formula.left, oldVar, newVar),
          this.renameVariable(formula.right, oldVar, newVar)
        );
      case 'And':
        return FormulaFactories.and(
          this.renameVariable(formula.left, oldVar, newVar),
          this.renameVariable(formula.right, oldVar, newVar)
        );
      case 'Or':
        return FormulaFactories.or(
          this.renameVariable(formula.left, oldVar, newVar),
          this.renameVariable(formula.right, oldVar, newVar)
        );
      case 'Not':
        return FormulaFactories.not(this.renameVariable(formula.inner, oldVar, newVar));
      case 'Predicate':
        return {
          kind: 'Predicate',
          name: formula.name,
          args: formula.args.map(term => this.renameVariableInTerm(term, oldVar, newVar))
        };
      case 'Paren':
        return { kind: 'Paren', inner: this.renameVariable(formula.inner, oldVar, newVar) };
      case 'True':
      case 'False':
        return formula;
      default:
        return formula;
    }
  }

  private renameVariableInTerm(term: TermNode, oldVar: string, newVar: string): TermNode {
    switch (term.kind) {
      case 'TermVar':
        return term.name === oldVar ? { kind: 'TermVar', name: newVar } : term;
      case 'TermConst':
        return term;
      case 'TermFunc':
        return {
          kind: 'TermFunc',
          name: term.name,
          args: term.args.map(arg => this.renameVariableInTerm(arg, oldVar, newVar))
        };
      default:
        return term;
    }
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

  async applyRuleManually(sequent: SequentNode, rule: string, isInteractive = true, language: 'sk' | 'en' = 'sk'): Promise<DerivationNode | null> {
    let result: DerivationNode | null;
    switch (rule) {
      case '→R': {
        const impl = sequent.conclusions.find(f => f.kind === 'Implies');
        result = impl ? await this.applyImplRight(sequent, impl, isInteractive) : null;
        break;
      }
      case '→L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'Implies');
        result = idx !== -1 ? await this.applyImplLeft(sequent, idx, isInteractive) : null;
        break;
      }
      case '∧R': {
        const and = sequent.conclusions.find(f => f.kind === 'And');
        result = and ? await this.applyAndRight(sequent, and, isInteractive) : null;
        break;
      }
      case '∧L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'And');
        result = idx !== -1 ? await this.applyAndLeft(sequent, idx, isInteractive) : null;
        break;
      }
      case '∨R': {
        const or = sequent.conclusions.find(f => f.kind === 'Or');
        result = or ? await this.applyOrRight(sequent, or, isInteractive) : null;
        break;
      }
      case '∨L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'Or');
        result = idx !== -1 ? await this.applyOrLeft(sequent, idx, isInteractive) : null;
        break;
      }
      case '¬R': {
        const not = sequent.conclusions.find(f => f.kind === 'Not');
        result = not ? await this.applyNotRight(sequent, not, isInteractive) : null;
        break;
      }
      case '¬L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'Not');
        result = idx !== -1 ? await this.applyNotLeft(sequent, idx, isInteractive) : null;
        break;
      }
      case 'WL': {
        result = await this.applyWeakeningLeft(sequent, isInteractive);
        break;
      }
      case 'WR': {
        result = await this.applyWeakeningRight(sequent, isInteractive);
        break;
      }
      case '∀R': {
        const forall = sequent.conclusions.find(f => f.kind === 'Forall');
        result = forall ? await this.applyForallRight(sequent, forall, isInteractive, language) : null;
        break;
      }
      case '∀L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'Forall');
        result = idx !== -1 ? await this.applyForallLeft(sequent, idx, isInteractive, language) : null;
        break;
      }
      case '∃R': {
        const exists = sequent.conclusions.find(f => f.kind === 'Exists');
        result = exists ? await this.applyExistsRight(sequent, exists, isInteractive, language) : null;
        break;
      }
      case '∃L': {
        const idx = sequent.assumptions.findIndex(f => f.kind === 'Exists');
        result = idx !== -1 ? await this.applyExistsLeft(sequent, idx, isInteractive, language) : null;
        break;
      }
      case 'Ax': {
        if (this.isAxiom(sequent)) {
          result = { rule: 'Ax', sequent, children: [] };
          break;
        }
        result = null;
        break;
      }
      default:
        result = null;
        break;
    }
    return result ? this.annotateLatex(result) : null;
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
