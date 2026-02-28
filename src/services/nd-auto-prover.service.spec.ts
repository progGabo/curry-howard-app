import { TestBed } from '@angular/core/testing';
import { NdAutoProverService } from './nd-auto-prover.service';
import { FormulaFactories } from '../utils/ast-factories';
import { NdNode } from '../models/nd-node';

describe('NdAutoProverService', () => {
  let service: NdAutoProverService;

  const A = FormulaFactories.var('A');
  const B = FormulaFactories.var('B');
  const C = FormulaFactories.var('C');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NdAutoProverService);
  });

  function containsRule(node: NdNode | null, rule: string): boolean {
    if (!node) return false;
    if (node.rule === rule) return true;
    return node.premises.some((premise) => containsRule(premise, rule));
  }

  it('proves ⊢ A → A', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(A, A)
    });

    expect(result).not.toBeNull();
    expect(result?.rule).toBe('→I');
  });

  it('proves ⊢ A ∧ B → A', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(FormulaFactories.and(A, B), A)
    });

    expect(result).not.toBeNull();
    expect(containsRule(result, '∧E1')).toBeTrue();
  });

  it('proves ⊢ A → (B → A)', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(A, FormulaFactories.implies(B, A))
    });

    expect(result).not.toBeNull();
    expect(result?.rule).toBe('→I');
  });

  it('proves ⊢ (A → B) → ((B → C) → (A → C))', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(
        FormulaFactories.implies(A, B),
        FormulaFactories.implies(
          FormulaFactories.implies(B, C),
          FormulaFactories.implies(A, C)
        )
      )
    });

    expect(result).not.toBeNull();
    expect(containsRule(result, '→E')).toBeTrue();
  });

  it('proves ⊢ ((A → B) ∧ (B → C)) → (A → C)', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(
        FormulaFactories.and(
          FormulaFactories.implies(A, B),
          FormulaFactories.implies(B, C)
        ),
        FormulaFactories.implies(A, C)
      )
    });

    expect(result).not.toBeNull();
    expect(containsRule(result, '∧E1')).toBeTrue();
    expect(containsRule(result, '∧E2')).toBeTrue();
    expect(containsRule(result, '→E')).toBeTrue();
  });

  it('fails on ⊢ A ∨ ¬A in intuitionistic logic', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.or(A, FormulaFactories.not(A))
    });

    expect(result).toBeNull();
  });

  it('fails on ⊢ ¬¬A → A in intuitionistic logic', () => {
    const result = service.buildAutoTree({
      context: [],
      goal: FormulaFactories.implies(
        FormulaFactories.not(FormulaFactories.not(A)),
        A
      )
    });

    expect(result).toBeNull();
  });

  it('builds ∨E for disjunction elimination from assumptions', () => {
    const result = service.buildAutoTree({
      context: [
        FormulaFactories.or(A, B),
        FormulaFactories.implies(A, C),
        FormulaFactories.implies(B, C)
      ],
      goal: C
    });

    expect(result).not.toBeNull();
    expect(containsRule(result, '∨E')).toBeTrue();
  });
});
