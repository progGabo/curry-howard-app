import { TestBed } from '@angular/core/testing';
import { LambdaParserService } from './lambda-parser-service';
import { ExprFactories, TypeFactories } from '../utils/ast-factories';

describe('LambdaParserService regression', () => {
  let service: LambdaParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LambdaParserService);
  });

  it('formats LetDependentPair with both binders (witness and proof)', () => {
    const existsProof = ExprFactories.var('a');
    const resultProof = ExprFactories.dependentPair(
      ExprFactories.var('x'),
      TypeFactories.typeVar('T'),
      ExprFactories.app(
        ExprFactories.app(ExprFactories.var('b'), ExprFactories.var('x')),
        ExprFactories.var('p')
      )
    );

    const expr = ExprFactories.letDependentPair(
      'x',
      TypeFactories.typeVar('T'),
      'p',
      TypeFactories.predicate('P', [TypeFactories.typeVar('T')]),
      existsProof,
      resultProof
    );

    const printed = service.formatLambdaExpression(expr);

    expect(printed).toContain('let (x: T, p: P(T)) = a in');
    expect(printed).toContain('⟨x, b x p⟩');
  });
});
