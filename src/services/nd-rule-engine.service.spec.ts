import { TestBed } from '@angular/core/testing';
import { NdRuleEngineService } from './nd-rule-engine.service';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { Equality } from '../utils/equality';

describe('NdRuleEngineService quantifiers', () => {
  let service: NdRuleEngineService;

  const predicate = (name: string, termName: string) =>
    FormulaFactories.predicate(name, [TermFactories.var(termName)]);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NdRuleEngineService);
  });

  it('applies ∃I for P(c) ⊢ ∃x P(x)', () => {
    const root = service.createRoot({
      context: [predicate('P', 'c')],
      goal: FormulaFactories.exists('x', predicate('P', 'x'))
    });

    const applied = service.applyRule(root, '∃I', {
      instantiationTerm: TermFactories.var('c')
    });

    expect(applied).not.toBeNull();
    expect(applied?.premises.length).toBe(1);
    expect(applied?.premises[0].judgement.goal).toEqual(predicate('P', 'c'));
  });

  it('applies ∀E for ∀x P(x) ⊢ P(t)', () => {
    const root = service.createRoot({
      context: [FormulaFactories.forall('x', predicate('P', 'x'))],
      goal: predicate('P', 't')
    });

    const applied = service.applyRule(root, '∀E', {
      instantiationTerm: TermFactories.var('t')
    });

    expect(applied).not.toBeNull();
    expect(applied?.premises.length).toBe(1);
    expect(applied?.quantifierMeta?.binderVariable).toBe('x');
  });

  it('accepts ∀I when eigenvariable is fresh', () => {
    const root = service.createRoot({
      context: [predicate('Q', 'c')],
      goal: FormulaFactories.forall('x', predicate('P', 'x'))
    });

    const applied = service.applyRule(root, '∀I', {
      eigenVariable: 'y'
    });

    expect(applied).not.toBeNull();
    expect(applied?.premises[0].judgement.goal).toEqual(predicate('P', 'y'));
    expect(applied?.quantifierMeta?.eigenVariable).toBe('y');
  });

  it('rejects ∀I when eigenvariable is not fresh in context', () => {
    const root = service.createRoot({
      context: [predicate('Q', 'y')],
      goal: FormulaFactories.forall('x', predicate('P', 'x'))
    });

    const applied = service.applyRule(root, '∀I', {
      eigenVariable: 'y'
    });

    expect(applied).toBeNull();
  });

  it('accepts ∃E when eigenvariable is fresh', () => {
    const root = service.createRoot({
      context: [FormulaFactories.exists('x', predicate('P', 'x'))],
      goal: predicate('R', 'z')
    });

    const applied = service.applyRule(root, '∃E', {
      eigenVariable: 'a'
    });

    expect(applied).not.toBeNull();
    expect(applied?.premises.length).toBe(2);
    expect(
      applied?.premises[1].judgement.context.some((f) => Equality.formulasEqual(f, predicate('P', 'a')))
    ).toBeTrue();
  });

  it('rejects ∃E when eigenvariable is not fresh in context/goal', () => {
    const root = service.createRoot({
      context: [
        FormulaFactories.exists('x', predicate('P', 'x')),
        predicate('S', 'y')
      ],
      goal: predicate('R', 'y')
    });

    const applied = service.applyRule(root, '∃E', {
      eigenVariable: 'y'
    });

    expect(applied).toBeNull();
  });

  it('applies →E with a universal source by creating an explicit implication premise', () => {
    const root = service.createRoot({
      context: [
        predicate('P', 'a'),
        FormulaFactories.forall(
          'x',
          FormulaFactories.implies(predicate('P', 'x'), predicate('Q', 'x'))
        )
      ],
      goal: predicate('Q', 'a')
    });

    const applied = service.applyRule(root, '→E');

    expect(applied).not.toBeNull();
    expect(applied?.premises.length).toBe(2);
    expect(applied?.premises[0].judgement.goal.kind).toBe('Implies');
    expect(applied?.premises[0].judgement.goal).toEqual(
      FormulaFactories.implies(predicate('P', 'a'), predicate('Q', 'a'))
    );
    expect(applied?.premises[1].judgement.goal).toEqual(predicate('P', 'a'));
  });

  it('requires explicit ∀E before →E in the interactive ND path for ∃x.P(x), ∀x(P(x)→Q(x)) ⊢ ∃x.Q(x)', () => {
    const root = service.createRoot({
      context: [
        FormulaFactories.exists('x', predicate('P', 'x')),
        FormulaFactories.forall('x', FormulaFactories.implies(predicate('P', 'x'), predicate('Q', 'x')))
      ],
      goal: FormulaFactories.exists('x', predicate('Q', 'x'))
    });

    const existsElim = service.applyRule(root, '∃E', { eigenVariable: 'a' });
    expect(existsElim).not.toBeNull();
    if (!existsElim) return;

    const witnessBranch = existsElim.premises[1];
    const existsIntro = service.applyRule(witnessBranch, '∃I', { instantiationTerm: TermFactories.var('a') });
    expect(existsIntro).not.toBeNull();
    if (!existsIntro) return;

    const qGoal = existsIntro.premises[0];
    const implElim = service.applyRule(qGoal, '→E');
    expect(implElim).not.toBeNull();
    if (!implElim) return;

    expect(implElim.premises[0].judgement.goal.kind).toBe('Implies');
    expect(implElim.premises[0].judgement.goal).toEqual(
      FormulaFactories.implies(predicate('P', 'a'), predicate('Q', 'a'))
    );
    expect(implElim.premises[1].judgement.goal).toEqual(predicate('P', 'a'));

    const forallElim = service.applyRule(implElim.premises[0], '∀E', { instantiationTerm: TermFactories.var('a') });
    expect(forallElim).not.toBeNull();
    if (!forallElim) return;

    expect(service.isHypothesisLeaf(forallElim.premises[0])).toBeTrue();
    expect(service.isHypothesisLeaf(implElim.premises[1])).toBeTrue();
  });
});
