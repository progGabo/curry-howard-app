import { TestBed } from '@angular/core/testing';
import { LogicParserService } from './logic-parser-service';
import { ProofTreeBuilderService } from './proof-tree-builder';
import { LambdaBuilderService } from './lambda-builder-service';
import { LambdaParserService } from './lambda-parser-service';
import { DerivationNode, SequentNode } from '../models/formula-node';

describe('Expression → Lambda regression', () => {
  let logicParser: LogicParserService;
  let proofBuilder: ProofTreeBuilderService;
  let lambdaBuilder: LambdaBuilderService;
  let lambdaParser: LambdaParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    logicParser = TestBed.inject(LogicParserService);
    proofBuilder = TestBed.inject(ProofTreeBuilderService);
    lambdaBuilder = TestBed.inject(LambdaBuilderService);
    lambdaParser = TestBed.inject(LambdaParserService);
  });

  const autoDerivableSequents = [
    'p ⇒ q ⇒ p ∧ q',
    '(p ⇒ q) ⇒ (¬q ⇒ ¬p)',
    '(p ∧ q) ⇒ p',
    'p ⇒ (p ∨ q)',
    '((p ⇒ q) ∧ (q ⇒ r)) ⇒ (p ⇒ r)',
    '(p ⇒ r), (q ⇒ r), (p ∨ q) ⊢ r',
    'p ⇒ (q ⇒ p)',
    '(p ⇒ (q ⇒ r)) ⇒ ((p ⇒ q) ⇒ (p ⇒ r))',
    '¬¬p ⇒ p ⇒ p',
    '((p ∧ q) ⇒ r) ⇒ (p ⇒ (q ⇒ r))',
    '(p ⇒ q), p ⊢ q',
    '(p ∧ q), (q ⇒ r) ⊢ r',
    '(p ⇒ q), (q ⇒ r), p ⊢ r',
    '(p ∨ q), (p ⇒ r), (q ⇒ r) ⊢ r',
    '(p ⇒ q), (r ⇒ s) ⊢ (p ⇒ q)',
    '(p ⇒ q) ⇒ ((q ⇒ r) ⇒ (p ⇒ r))',
    'p ⇒ ¬¬p',
    '(p ⇒ q) ⇒ (¬q ⇒ ¬p)'
  ];

  const parseOnlyPredicateSequents = [
    '∀x. P(x) ⇒ P(x)',
    '∃x. P(x), ∀x. (P(x) → Q(x)) ⊢ ∃x. Q(x)',
    '∀x. (P(x) ⇒ Q(x)), P(a) ⊢ Q(a)',
    '∃x. (P(x) ∧ Q(x)) ⊢ ∃x. P(x)',
    '∀x. (P(x) ⇒ R(x)), ∀x. (R(x) ⇒ Q(x)) ⊢ ∀x. (P(x) ⇒ Q(x))',
    '∃x. P(x) ⊢ ∃x. (P(x) ∨ Q(x))',
    '∀x. (P(x) ⇒ Q(x)), ∀x. (Q(x) ⇒ R(x)), P(a) ⊢ R(a)',
    '∀x. P(x) ⊢ P(a)',
    '∃x. Q(x), ∀x. (Q(x) ⇒ R(x)) ⊢ ∃x. R(x)',
    '∀x. (P(x) ∧ Q(x)) ⇒ P(a)',
    '∀x. (P(x) ⇒ (Q(x) ⇒ R(x))), P(a), Q(a) ⊢ R(a)'
  ];

  const stableNormalizationInputs = [
    '  p   ⇒   q  ',
    '∀x.P(x)',
    '∃x.   Q(x)',
    'p  ⊢   q',
    '¬(p ∨ q) ⇒ ¬p ∧ ¬q',
    'forall x. P(x)  |-  exists x. P(x)'
  ];

  it('parses a wide set of propositional sequents and builds non-empty lambda terms', async () => {
    for (const source of autoDerivableSequents) {
      const sequent: SequentNode = logicParser.parseFormula(source);
      expect(sequent.assumptions).withContext(source).toBeDefined();
      expect(sequent.conclusions.length).withContext(source).toBeGreaterThan(0);

      const proof = await proofBuilder.buildProof(sequent);
      expect(proof.rule).withContext(source).not.toBe('error');

      const lambda = lambdaBuilder.buildLambda(proof, sequent);
      const pretty = lambdaBuilder.exprToString(lambda);
      expect(pretty.length).withContext(source).toBeGreaterThan(0);
    }
  });

  it('normalizes unicode/ascii operator variants consistently', () => {
    const variants = [
      ['p ⇒ q', 'p => q'],
      ['¬p ∨ q', '!p || q'],
      ['p ∧ q', 'p && q'],
      ['p ⊢ q', 'p |- q'],
      ['∀x. P(x)', 'forall x. P(x)'],
      ['∃x. Q(x)', 'exists x. Q(x)']
    ];

    for (const [left, right] of variants) {
      const leftSeq = logicParser.parseFormula(left);
      const rightSeq = logicParser.parseFormula(right);

      expect(JSON.stringify(leftSeq)).withContext(`${left} vs ${right}`).toEqual(JSON.stringify(rightSeq));
    }
  });

  it('parses predicate-heavy examples used in app examples and workflows', () => {
    for (const source of parseOnlyPredicateSequents) {
      const sequent = logicParser.parseFormula(source);
      expect(sequent.conclusions.length).withContext(source).toBeGreaterThan(0);
    }
  });

  it('keeps interactive root creation stable for predicate sequents', () => {
    for (const source of parseOnlyPredicateSequents) {
      const sequent = logicParser.parseFormula(source);
      const root: DerivationNode = proofBuilder.buildInteractiveRoot(sequent);
      expect(root.rule).withContext(source).toBe('∅');
      expect(root.children.length).withContext(source).toBe(0);
      expect(root.sequentLatex).withContext(source).toContain('\\vdash');
    }
  });

  it('prepareInput always produces parseable normalized sequents', () => {
    for (const source of stableNormalizationInputs) {
      const normalized = logicParser.prepareInput(source);
      expect(normalized).withContext(source).toContain('|-');
      const parsed = logicParser.parseFormula(source);
      expect(parsed.conclusions.length).withContext(source).toBeGreaterThan(0);
    }
  });

  it('accepts quantifier formulas even when user omits dot after binder', () => {
    const source = 'P(t) ⇒ ∃y P(y)';
    const sequent = logicParser.parseFormula(source);

    expect(sequent.conclusions.length).toBe(1);
    expect(sequent.conclusions[0].kind).toBe('Implies');

    const implication = sequent.conclusions[0] as any;
    expect(implication.right.kind).toBe('Exists');
    expect(implication.right.variable).toBe('y');
    expect(implication.right.body.kind).toBe('Predicate');
  });

  it('parses ¬∃x. P(x) ⇒ ∀x. ¬(P(x)) without collapsing to ¬x', () => {
    const source = '¬∃x. P(x) ⇒ ∀x. ¬(P(x))';
    const sequent = logicParser.parseFormula(source);

    expect(sequent.conclusions.length).toBe(1);
    expect(sequent.conclusions[0].kind).toBe('Implies');

    const implication = sequent.conclusions[0] as any;
    expect(implication.left.kind).toBe('Not');
    expect(implication.left.inner.kind).toBe('Exists');

    expect(implication.right.kind).toBe('Forall');
    expect(implication.right.body.kind).toBe('Not');
    expect(implication.right.body.inner.kind).toBe('Predicate');
  });

  it('produces latex data on complete auto-generated proof trees', async () => {
    for (const source of autoDerivableSequents.slice(0, 10)) {
      const sequent = logicParser.parseFormula(source);
      const proof = await proofBuilder.buildProof(sequent);

      const visit = (node: DerivationNode) => {
        expect(node.sequentLatex).withContext(source).toBeDefined();
        expect(node.sequentLatex || '').withContext(source).toContain('\\vdash');
        for (const child of node.children) visit(child);
      };

      visit(proof);
    }
  });

  it('serializes generated lambdas consistently for a broad propositional set', async () => {
    const serializationSources = [
      'p ⇒ q ⇒ p ∧ q',
      '(p ∧ q) ⇒ p',
      'p ⇒ (p ∨ q)',
      'p ⇒ (q ⇒ p)',
      '((p ∧ q) ⇒ r) ⇒ (p ⇒ (q ⇒ r))'
    ];

    for (const source of serializationSources) {
      const sequent = logicParser.parseFormula(source);
      const proof = await proofBuilder.buildProof(sequent);
      const lambda = lambdaBuilder.buildLambda(proof, sequent);
      const pretty = lambdaBuilder.exprToString(lambda);
      expect(pretty.length).withContext(source).toBeGreaterThan(0);
      expect(pretty.includes('λ') || pretty.includes('let') || pretty.includes('⟨')).withContext(source).toBeTrue();
    }
  });

  it('encodes contraposition negation with ⊥ instead of Bool', async () => {
    const source = '(p ⇒ q) ⇒ (¬q ⇒ ¬p)';
    const sequent = logicParser.parseFormula(source);
    const proof = await proofBuilder.buildProof(sequent);
    const lambda = lambdaBuilder.buildLambda(proof, sequent);
    const pretty = lambdaBuilder.exprToString(lambda);

    expect(pretty).toContain('⊥');
    expect(pretty).not.toContain('Bool');
  });
});
