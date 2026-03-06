import { TestBed } from '@angular/core/testing';
import { RuleFilterService } from './rule-filter.service';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { NdNode } from '../models/nd-node';

describe('RuleFilterService ND applicability', () => {
  let service: RuleFilterService;

  const predicate = (name: string, termName: string) =>
    FormulaFactories.predicate(name, [TermFactories.var(termName)]);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuleFilterService);
  });

  it('keeps →E available when context has a universal implication matching the current goal', () => {
    const node: NdNode = {
      id: 'nd-node-test',
      rule: '∅',
      judgement: {
        context: [
          predicate('P', 'a'),
          FormulaFactories.forall(
            'x',
            FormulaFactories.implies(predicate('P', 'x'), predicate('Q', 'x'))
          )
        ],
        goal: predicate('Q', 'a')
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const filtered = service.filterNdRules(['→E'], node, 'applicable');
    expect(filtered).toEqual(['→E']);
  });

  it('keeps →E available when an explicit implication is present (even parenthesized)', () => {
    const node: NdNode = {
      id: 'nd-node-paren',
      rule: '∅',
      judgement: {
        context: [
          {
            kind: 'Paren',
            inner: FormulaFactories.implies(predicate('P', 'a'), predicate('Q', 'a'))
          },
          predicate('P', 'a')
        ],
        goal: predicate('Q', 'a')
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const filtered = service.filterNdRules(['→E'], node, 'applicable');
    expect(filtered).toEqual(['→E']);
  });

  it('filters ND rules in predict mode to only applicable ones', () => {
    const node: NdNode = {
      id: 'nd-node-predict-filter',
      rule: '∅',
      judgement: {
        context: [predicate('P', 'a')],
        goal: FormulaFactories.implies(predicate('P', 'a'), predicate('Q', 'a'))
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const filtered = service.filterNdRules(['→I', '∧I', '∀I', '∃I'], node, 'predict');
    expect(filtered).toEqual(['→I']);
  });

  it('does not filter ND rules in all mode', () => {
    const node: NdNode = {
      id: 'nd-node-all-unfiltered',
      rule: '∅',
      judgement: {
        context: [predicate('P', 'a')],
        goal: FormulaFactories.implies(predicate('P', 'a'), predicate('Q', 'a'))
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const inputRules = ['→I', '∧I', '∀I', '∃I'];
    const filtered = service.filterNdRules(inputRules, node, 'all');
    expect(filtered).toEqual(inputRules);
  });

  it('hides ∀E when context universals cannot instantiate to the current goal', () => {
    const node: NdNode = {
      id: 'nd-node-forall-e-not-applicable',
      rule: '∅',
      judgement: {
        context: [
          FormulaFactories.exists('x', predicate('P', 'x')),
          FormulaFactories.forall(
            'x',
            FormulaFactories.implies(predicate('P', 'x'), predicate('Q', 'x'))
          )
        ],
        goal: FormulaFactories.exists('x', predicate('Q', 'x'))
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const filtered = service.filterNdRules(['∃I', '∀E', '∃E'], node, 'applicable');
    expect(filtered).toEqual(['∃I', '∃E']);
  });

  it('keeps ∀E when some universal can instantiate directly to the goal', () => {
    const node: NdNode = {
      id: 'nd-node-forall-e-applicable',
      rule: '∅',
      judgement: {
        context: [
          FormulaFactories.forall('x', predicate('Q', 'x'))
        ],
        goal: predicate('Q', 'a')
      },
      premises: [],
      openHypotheses: [],
      discharges: [],
      branchStatus: 'open'
    };

    const filtered = service.filterNdRules(['∀E'], node, 'applicable');
    expect(filtered).toEqual(['∀E']);
  });
});
