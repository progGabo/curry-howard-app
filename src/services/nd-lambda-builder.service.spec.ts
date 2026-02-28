import { TestBed } from '@angular/core/testing';
import { NdLambdaBuilderService } from './nd-lambda-builder.service';
import { FormulaFactories, TermFactories } from '../utils/ast-factories';
import { NdNode } from '../models/nd-node';
import { NdHypothesis } from '../models/nd-hypothesis';
import { ExprNode } from '../models/lambda-node';

describe('NdLambdaBuilderService', () => {
  let service: NdLambdaBuilderService;

  const A = FormulaFactories.var('A');
  const B = FormulaFactories.var('B');

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NdLambdaBuilderService);
  });

  function leaf(nodeId: string, goal: any, context: any[], openHypotheses: NdHypothesis[]): NdNode {
    return {
      id: nodeId,
      rule: '∅',
      judgement: { goal, context },
      premises: [],
      openHypotheses,
      discharges: [],
      branchStatus: 'closed-hypothesis'
    };
  }

  it('extracts λx:A. x from proof of ⊢ A → A', () => {
    const h1: NdHypothesis = {
      id: 'h1',
      label: 'a',
      formula: A,
      introducedAtNodeId: 'nd-node-1'
    };

    const root: NdNode = {
      id: 'nd-node-1',
      rule: '→I',
      judgement: { context: [], goal: FormulaFactories.implies(A, A) },
      premises: [leaf('nd-node-2', A, [A], [h1])],
      openHypotheses: [],
      discharges: [{ hypothesisId: 'h1', label: 'a' }],
      branchStatus: 'open'
    };

    const term = service.buildLambda(root);

    expect(term).not.toBeNull();
    expect(term?.kind).toBe('Abs');
    if (term?.kind === 'Abs') {
      expect(term.body.kind).toBe('Var');
      if (term.body.kind === 'Var') {
        expect(term.body.name).toBe(term.param);
      }
    }
  });

  it('extracts λp:A∧B. fst(p) from proof of ⊢ A ∧ B → A', () => {
    const andAB = FormulaFactories.and(A, B);

    const h1: NdHypothesis = {
      id: 'h1',
      label: 'a',
      formula: andAB,
      introducedAtNodeId: 'nd-node-1'
    };

    const root: NdNode = {
      id: 'nd-node-1',
      rule: '→I',
      judgement: { context: [], goal: FormulaFactories.implies(andAB, A) },
      premises: [
        {
          id: 'nd-node-2',
          rule: '∧E1',
          judgement: { context: [andAB], goal: A },
          premises: [leaf('nd-node-3', andAB, [andAB], [h1])],
          openHypotheses: [h1],
          discharges: [],
          branchStatus: 'open'
        }
      ],
      openHypotheses: [],
      discharges: [{ hypothesisId: 'h1', label: 'a' }],
      branchStatus: 'open'
    };

    const term = service.buildLambda(root);

    expect(term).not.toBeNull();
    expect(term?.kind).toBe('Abs');
    if (term?.kind === 'Abs') {
      expect(term.body.kind).toBe('Fst');
      if (term.body.kind === 'Fst') {
        expect(term.body.pair.kind).toBe('Var');
        if (term.body.pair.kind === 'Var') {
          expect(term.body.pair.name).toBe(term.param);
        }
      }
    }
  });

  it('extracts case expression for ∨E', () => {
    const disjunction = FormulaFactories.or(A, B);

    const rootContextHyp: NdHypothesis = {
      id: 'h0',
      label: 'k',
      formula: disjunction,
      introducedAtNodeId: 'root'
    };

    const leftHyp: NdHypothesis = {
      id: 'h1',
      label: 'a',
      formula: A,
      introducedAtNodeId: 'nd-node-1'
    };

    const rightHyp: NdHypothesis = {
      id: 'h2',
      label: 'b',
      formula: B,
      introducedAtNodeId: 'nd-node-1'
    };

    const root: NdNode = {
      id: 'nd-node-1',
      rule: '∨E',
      judgement: { context: [disjunction], goal: disjunction },
      premises: [
        leaf('nd-node-2', disjunction, [disjunction], [rootContextHyp]),
        {
          id: 'nd-node-3',
          rule: '∨I1',
          judgement: { context: [disjunction, A], goal: disjunction },
          premises: [leaf('nd-node-5', A, [disjunction, A], [rootContextHyp, leftHyp])],
          openHypotheses: [rootContextHyp, leftHyp],
          discharges: [],
          branchStatus: 'open'
        },
        {
          id: 'nd-node-4',
          rule: '∨I2',
          judgement: { context: [disjunction, B], goal: disjunction },
          premises: [leaf('nd-node-6', B, [disjunction, B], [rootContextHyp, rightHyp])],
          openHypotheses: [rootContextHyp, rightHyp],
          discharges: [],
          branchStatus: 'open'
        }
      ],
      openHypotheses: [rootContextHyp],
      discharges: [
        { hypothesisId: 'h1', label: 'a' },
        { hypothesisId: 'h2', label: 'b' }
      ],
      branchStatus: 'open'
    };

    const term = service.buildLambda(root);

    expect(term).not.toBeNull();
    expect(term?.kind).toBe('Case');

    if (term) {
      const names = collectVariableNames(term);
      expect(names.every((name) => !/\d/.test(name))).toBeTrue();
    }
  });

  it('uses quantifier instantiation term for ∀E', () => {
    const pOfX = FormulaFactories.predicate('P', [TermFactories.var('x')]);
    const pOfT = FormulaFactories.predicate('P', [TermFactories.const('t')]);
    const forallPx = FormulaFactories.forall('x', pOfX);

    const hForall: NdHypothesis = {
      id: 'h-forall',
      label: 'u',
      formula: forallPx,
      introducedAtNodeId: 'root'
    };

    const root: NdNode = {
      id: 'root',
      rule: '→I',
      judgement: { context: [], goal: FormulaFactories.implies(forallPx, pOfT) },
      premises: [
        {
          id: 'forall-e',
          rule: '∀E',
          judgement: { context: [forallPx], goal: pOfT },
          premises: [leaf('forall-leaf', forallPx, [forallPx], [hForall])],
          openHypotheses: [hForall],
          discharges: [],
          branchStatus: 'open',
          quantifierMeta: {
            binderVariable: 'x',
            instantiationTerm: TermFactories.const('t')
          }
        }
      ],
      openHypotheses: [],
      discharges: [{ hypothesisId: 'h-forall', label: 'u' }],
      branchStatus: 'open'
    };

    const term = service.buildLambda(root);
    expect(term?.kind).toBe('Abs');
    if (term?.kind === 'Abs') {
      expect(term.body.kind).toBe('App');
      if (term.body.kind === 'App') {
        expect(term.body.arg.kind).toBe('Var');
        if (term.body.arg.kind === 'Var') {
          expect(term.body.arg.name).toBe('t');
        }
      }
    }
  });

  it('uses witness metadata for ∃I and applies ∀E at the same witness', () => {
    const pOfX = FormulaFactories.predicate('P', [TermFactories.var('x')]);
    const pOfC = FormulaFactories.predicate('P', [TermFactories.const('c')]);
    const forallPx = FormulaFactories.forall('x', pOfX);
    const existsPx = FormulaFactories.exists('y', FormulaFactories.predicate('P', [TermFactories.var('y')]));

    const hForall: NdHypothesis = {
      id: 'h-forall',
      label: 'u',
      formula: forallPx,
      introducedAtNodeId: 'root'
    };

    const root: NdNode = {
      id: 'root',
      rule: '→I',
      judgement: { context: [], goal: FormulaFactories.implies(forallPx, existsPx) },
      premises: [
        {
          id: 'exists-i',
          rule: '∃I',
          judgement: { context: [forallPx], goal: existsPx },
          premises: [
            {
              id: 'forall-e',
              rule: '∀E',
              judgement: { context: [forallPx], goal: pOfC },
              premises: [leaf('forall-leaf', forallPx, [forallPx], [hForall])],
              openHypotheses: [hForall],
              discharges: [],
              branchStatus: 'open',
              quantifierMeta: {
                binderVariable: 'x',
                instantiationTerm: TermFactories.const('c')
              }
            }
          ],
          openHypotheses: [hForall],
          discharges: [],
          branchStatus: 'open',
          quantifierMeta: {
            binderVariable: 'y',
            instantiationTerm: TermFactories.const('c')
          }
        }
      ],
      openHypotheses: [],
      discharges: [{ hypothesisId: 'h-forall', label: 'u' }],
      branchStatus: 'open'
    };

    const term = service.buildLambda(root);
    expect(term?.kind).toBe('Abs');
    if (term?.kind === 'Abs') {
      expect(term.body.kind).toBe('DependentPair');
      if (term.body.kind === 'DependentPair') {
        expect(term.body.witness.kind).toBe('Var');
        if (term.body.witness.kind === 'Var') {
          expect(term.body.witness.name).toBe('c');
        }
        expect(term.body.proof.kind).toBe('App');
      }
    }
  });

  it('replaces ∃E eigenvariable with let-bound witness in extracted body', () => {
    const pOfA = FormulaFactories.predicate('P', [TermFactories.const('a')]);
    const qOfA = FormulaFactories.predicate('Q', [TermFactories.const('a')]);
    const existsPx = FormulaFactories.exists('x', FormulaFactories.predicate('P', [TermFactories.var('x')]));
    const forallImp = FormulaFactories.forall(
      'x',
      FormulaFactories.implies(
        FormulaFactories.predicate('P', [TermFactories.var('x')]),
        FormulaFactories.predicate('Q', [TermFactories.var('x')])
      )
    );
    const existsQx = FormulaFactories.exists('x', FormulaFactories.predicate('Q', [TermFactories.var('x')]));

    const hExists: NdHypothesis = {
      id: 'h-ex',
      label: 'e',
      formula: existsPx,
      introducedAtNodeId: 'root'
    };
    const hForall: NdHypothesis = {
      id: 'h-fa',
      label: 'u',
      formula: forallImp,
      introducedAtNodeId: 'root'
    };
    const hPa: NdHypothesis = {
      id: 'h-pa',
      label: 'p',
      formula: pOfA,
      introducedAtNodeId: 'exists-e'
    };

    const root: NdNode = {
      id: 'exists-e',
      rule: '∃E',
      judgement: { context: [existsPx, forallImp], goal: existsQx },
      premises: [
        leaf('exists-leaf', existsPx, [existsPx, forallImp], [hExists, hForall]),
        {
          id: 'exists-i',
          rule: '∃I',
          judgement: { context: [existsPx, forallImp, pOfA], goal: existsQx },
          premises: [
            {
              id: 'imp-e',
              rule: '→E',
              judgement: { context: [existsPx, forallImp, pOfA], goal: qOfA },
              premises: [
                {
                  id: 'forall-e',
                  rule: '∀E',
                  judgement: { context: [existsPx, forallImp, pOfA], goal: FormulaFactories.implies(pOfA, qOfA) },
                  premises: [leaf('forall-leaf', forallImp, [existsPx, forallImp, pOfA], [hExists, hForall, hPa])],
                  openHypotheses: [hExists, hForall, hPa],
                  discharges: [],
                  branchStatus: 'open',
                  quantifierMeta: {
                    binderVariable: 'x',
                    instantiationTerm: TermFactories.const('a')
                  }
                },
                leaf('p-leaf', pOfA, [existsPx, forallImp, pOfA], [hExists, hForall, hPa])
              ],
              openHypotheses: [hExists, hForall, hPa],
              discharges: [],
              branchStatus: 'open'
            }
          ],
          openHypotheses: [hExists, hForall, hPa],
          discharges: [],
          branchStatus: 'open',
          quantifierMeta: {
            binderVariable: 'x',
            instantiationTerm: TermFactories.const('a')
          }
        }
      ],
      openHypotheses: [hExists, hForall],
      discharges: [{ hypothesisId: 'h-pa', label: 'p' }],
      branchStatus: 'open',
      quantifierMeta: {
        binderVariable: 'x',
        eigenVariable: 'a'
      }
    };

    const term = service.buildLambda(root);
    expect(term?.kind).toBe('LetDependentPair');
    if (term?.kind === 'LetDependentPair') {
      expect(term.inExpr.kind).toBe('DependentPair');
      if (term.inExpr.kind === 'DependentPair') {
        expect(term.inExpr.witness.kind).toBe('Var');
        if (term.inExpr.witness.kind === 'Var') {
          expect(term.inExpr.witness.name).toBe(term.x);
        }
        expect(term.inExpr.proof.kind).toBe('App');
        if (term.inExpr.proof.kind === 'App') {
          expect(term.inExpr.proof.fn.kind).toBe('App');
          expect(term.inExpr.proof.arg.kind).toBe('Var');
          if (term.inExpr.proof.arg.kind === 'Var') {
            expect(term.inExpr.proof.arg.name).toBe(term.p);
          }
          if (term.inExpr.proof.fn.kind === 'App') {
            expect(term.inExpr.proof.fn.arg.kind).toBe('Var');
            if (term.inExpr.proof.fn.arg.kind === 'Var') {
              expect(term.inExpr.proof.fn.arg.name).toBe(term.x);
            }
          }
        }
      }
    }
  });

  function collectVariableNames(expr: ExprNode): string[] {
    const names: string[] = [];

    const visit = (node: ExprNode): void => {
      switch (node.kind) {
        case 'Var':
          names.push(node.name);
          return;
        case 'Abs':
        case 'DependentAbs':
          names.push(node.param);
          visit(node.body);
          return;
        case 'App':
          visit(node.fn);
          visit(node.arg);
          return;
        case 'Pair':
          visit(node.left);
          visit(node.right);
          return;
        case 'Fst':
        case 'Snd':
          visit(node.pair);
          return;
        case 'Inl':
        case 'Inr':
        case 'Succ':
        case 'Pred':
        case 'IsZero':
        case 'Abort':
          visit(node.expr);
          return;
        case 'Case':
          names.push(node.leftVar);
          names.push(node.rightVar);
          visit(node.expr);
          visit(node.leftBranch);
          visit(node.rightBranch);
          return;
        case 'LetPair':
          names.push(node.x);
          names.push(node.y);
          visit(node.pair);
          visit(node.inExpr);
          return;
        case 'LetDependentPair':
          names.push(node.x);
          names.push(node.p);
          visit(node.pair);
          visit(node.inExpr);
          return;
        case 'Let':
          names.push(node.name);
          visit(node.value);
          visit(node.inExpr);
          return;
        case 'True':
        case 'False':
        case 'Zero':
        case 'DependentPair':
          if (node.kind === 'DependentPair') {
            visit(node.witness);
            visit(node.proof);
          }
          return;
      }
    };

    visit(expr);
    return names;
  }
});
