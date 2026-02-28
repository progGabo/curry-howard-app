import { TestBed } from '@angular/core/testing';
import { LambdaParserService } from './lambda-parser-service';
import { TypeInferenceService } from './type-inference-service';
import { LambdaToExpressionService } from './lambda-to-expression-service';

describe('Lambda → Expression regression', () => {
  let lambdaParser: LambdaParserService;
  let typeInference: TypeInferenceService;
  let lambdaToExpression: LambdaToExpressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    lambdaParser = TestBed.inject(LambdaParserService);
    typeInference = TestBed.inject(TypeInferenceService);
    lambdaToExpression = TestBed.inject(LambdaToExpressionService);
  });

  const lambdaCases = [
    { code: '\\x:Bool. \\y:Bool. x', expectContains: 'Bool' },
    { code: '\\x.x : a -> a', expectContains: 'a → a' },
    { code: '\\f:(A->B). \\x:A. f x', expectContains: 'A → B' },
    { code: '\\x:A. x', expectContains: 'A → A' },
    { code: '\\x:A. \\y:B. <x,y>', expectContains: 'A → (B →' },
    { code: '\\x:T. \\p:P(x). p', expectContains: '∀x:T. P(x) → P(x)' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in p', expectContains: 'P(fst(e))' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, p : P(x)⟩', expectContains: '∃' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, ((f x) p) : Q(x)⟩', expectContains: 'Q(fst(e))' },
    { code: '\\x:Nat. succ x', expectContains: 'Nat → Nat' },
    { code: '\\x:Nat. iszero x', expectContains: 'Nat → Bool' },
    { code: 'if true then false else true', expectContains: 'Bool' },
    { code: 'let x = true in x', expectContains: 'Bool' },
    { code: 'inl true as Bool + Nat', expectContains: 'Bool ∨ Nat' },
    { code: 'inr 0 as Bool + Nat', expectContains: 'Bool ∨ Nat' },
    { code: '\\x:(A->B). \\y:A. x y', expectContains: '(A → B) → (A → B)' },
    { code: '\\x:Bool. if x then true else false', expectContains: 'Bool → Bool' },
    { code: '\\x:Nat. pred (succ x)', expectContains: 'Nat → Nat' },
    { code: '\\x:Nat. iszero (pred x)', expectContains: 'Nat → Bool' },
    { code: '\\x:A. \\y:B. \\z:C. x', expectContains: 'A → (B → (C → A))' },
    { code: 'let x = 0 in succ x', expectContains: 'Nat' },
    { code: 'let x = true in if x then true else false', expectContains: 'Bool' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, p : P(x)⟩', expectContains: 'P(fst(e))' }
  ];

  const dependentPairCases = [
    { code: 'let ⟨x : T, p : P(x)⟩ = e in p', expected: 'P(fst(e))' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, p : P(x)⟩', expected: '∃' },
    { code: 'let ⟨x : T, p : P(x)⟩ = e in ⟨x : T, ((f x) p) : Q(x)⟩', expected: 'Q(fst(e))' }
  ];

  it('parses and infers a large set of lambda examples without throwing', () => {
    for (const testCase of lambdaCases) {
      const ast = lambdaParser.parseLambdaExpression(testCase.code);
      const tree = typeInference.buildTypeInferenceTree(ast);
      const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

      expect(expression.length).withContext(testCase.code).toBeGreaterThan(0);
      expect(expression).withContext(testCase.code).toContain(testCase.expectContains);
    }
  });

  it('keeps parser normalization for unicode and ascii lambda syntax stable', () => {
    const pairs = [
      ['λx:Bool. x', '\\x:Bool. x'],
      ['\\f:(A→B). \\x:A. f x', '\\f:(A->B). \\x:A. f x'],
      ['\\x:A. \\y:B. ⟨x,y⟩', '\\x:A. \\y:B. <x,y>']
    ];

    for (const [unicodeCode, asciiCode] of pairs) {
      const unicodeAst = lambdaParser.parseLambdaExpression(unicodeCode);
      const asciiAst = lambdaParser.parseLambdaExpression(asciiCode);
      const unicodeTree = typeInference.buildTypeInferenceTree(unicodeAst);
      const asciiTree = typeInference.buildTypeInferenceTree(asciiAst);

      const unicodeExpr = lambdaToExpression.convertLambdaToExpression(unicodeAst, unicodeTree.inferredType);
      const asciiExpr = lambdaToExpression.convertLambdaToExpression(asciiAst, asciiTree.inferredType);

      expect(unicodeExpr).withContext(`${unicodeCode} vs ${asciiCode}`).toEqual(asciiExpr);
    }
  });

  it('preserves key dependent-pair Option-B behavior for let-elimination result type', () => {
    const ast = lambdaParser.parseLambdaExpression('let ⟨x : T, p : P(x)⟩ = e in p');
    const tree = typeInference.buildTypeInferenceTree(ast);
    const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

    expect(expression).toContain('P(fst(e))');
    expect(expression).not.toContain('P(x)');
    expect(expression).not.toContain('P(X)');
  });

  it('converts types to logical formulas for representative constructors', () => {
    const typeStrings = [
      'A',
      'A->B',
      'A*B',
      'A+B',
      'P(A)'
    ];

    for (const typeText of typeStrings) {
      const ast = lambdaParser.parseLambdaExpression(`\\x:${typeText}. x`);
      const tree = typeInference.buildTypeInferenceTree(ast);
      const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);
      expect(expression.length).withContext(typeText).toBeGreaterThan(0);
    }
  });

  it('keeps dependent-pair regression cases stable as a dedicated set', () => {
    for (const testCase of dependentPairCases) {
      const ast = lambdaParser.parseLambdaExpression(testCase.code);
      const tree = typeInference.buildTypeInferenceTree(ast);
      const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

      expect(expression).withContext(testCase.code).toContain(testCase.expected);
      expect(expression).withContext(testCase.code).not.toContain('P(X)');
    }
  });

  it('keeps sum/case typing examples stable', () => {
    const sumCases = [
      { code: 'inl true as Bool + Nat', expectContains: 'Bool ∨ Nat' },
      { code: 'inr 0 as Bool + Nat', expectContains: 'Bool ∨ Nat' },
      {
        code: 'case inl true as Bool + Nat of inl b:Bool => b | inr n:Nat => false',
        expectContains: 'Bool'
      }
    ];

    for (const testCase of sumCases) {
      const ast = lambdaParser.parseLambdaExpression(testCase.code);
      const tree = typeInference.buildTypeInferenceTree(ast);
      const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);
      expect(expression).withContext(testCase.code).toContain(testCase.expectContains);
    }
  });

  it('accepts quantified type annotations in lambda parameters (¬∃x:T.P(x) case)', () => {
    const code = 'λa:(∃x:T. P(x)) -> Bottom. λx:T. λb:P(x). a <x, b>';
    const ast = lambdaParser.parseLambdaExpression(code);
    const tree = typeInference.buildTypeInferenceTree(ast);
    const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

    expect(expression).toContain('∃');
    expect(expression).toContain('∀');
    expect(expression).toContain('¬');
    expect(expression).toContain('P(x)');
  });

  it('distinguishes logical negation (→ ⊥) from Bool-valued functions', () => {
    const logicalNeg = lambdaParser.parseLambdaExpression('\\a:(p->q). \\b:(q->Bottom). \\c:p. b (a c)');
    const logicalNegType = typeInference.buildTypeInferenceTree(logicalNeg).inferredType;
    const logicalNegFormula = lambdaToExpression.convertLambdaToExpression(logicalNeg, logicalNegType);

    const boolFn = lambdaParser.parseLambdaExpression('\\a:(p->q). \\b:(q->Bool). \\c:p. b (a c)');
    const boolFnType = typeInference.buildTypeInferenceTree(boolFn).inferredType;
    const boolFnFormula = lambdaToExpression.convertLambdaToExpression(boolFn, boolFnType);

    expect(logicalNegFormula).toContain('(p → q) → (¬q → ¬p)');
    expect(logicalNegFormula).not.toContain('Bool');
    expect(boolFnFormula).toContain('Bool');
    expect(boolFnFormula).not.toContain('⊥');
  });

  it('prints q → ⊥ as ¬q and nested negation as ¬¬r', () => {
    const singleNeg = lambdaParser.parseLambdaExpression('\\f:(q->Bottom). f');
    const singleNegType = typeInference.buildTypeInferenceTree(singleNeg).inferredType;
    const singleNegFormula = lambdaToExpression.convertLambdaToExpression(singleNeg, singleNegType);

    const doubleNeg = lambdaParser.parseLambdaExpression('\\f:((r->Bottom)->Bottom). f');
    const doubleNegType = typeInference.buildTypeInferenceTree(doubleNeg).inferredType;
    const doubleNegFormula = lambdaToExpression.convertLambdaToExpression(doubleNeg, doubleNegType);

    expect(singleNegFormula).toContain('¬q');
    expect(doubleNegFormula).toContain('¬(¬r)');
  });

  it('infers λx:T. λa:P(x). ⟨x, a⟩ as existential dependent pair, not conjunction', () => {
    const ast = lambdaParser.parseLambdaExpression('\\x:T. \\a:P(x). <x, a>');
    const tree = typeInference.buildTypeInferenceTree(ast);
    const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

    expect(expression).toContain('∃');
    expect(expression).toContain('P(x)');
    expect(expression).not.toContain('∧');
    expect(expression).not.toContain('×');

    let codomain: any = tree.inferredType;
    while (codomain.kind === 'Func' || codomain.kind === 'DependentFunc') {
      codomain = codomain.kind === 'Func' ? codomain.to : codomain.bodyType;
    }
    expect(codomain.kind).toBe('DependentProd');
  });

  it('keeps ordinary parenthesized pair as product type', () => {
    const ast = lambdaParser.parseLambdaExpression('\\t:T. \\u:U. (t, u)');
    const tree = typeInference.buildTypeInferenceTree(ast);
    const expression = lambdaToExpression.convertLambdaToExpression(ast, tree.inferredType);

    expect(expression).toContain('∧');

    expect(tree.inferredType.kind).toBe('Func');
    if (tree.inferredType.kind === 'Func') {
      expect(tree.inferredType.to.kind).toBe('Func');
      if (tree.inferredType.to.kind === 'Func') {
        expect(tree.inferredType.to.to.kind).toBe('Prod');
      }
    }
  });
});
