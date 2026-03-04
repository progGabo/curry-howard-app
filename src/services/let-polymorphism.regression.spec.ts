import { TestBed } from '@angular/core/testing';
import { LambdaParserService } from './lambda-parser-service';
import { TypeInferenceService } from './type-inference-service';

describe('Let polymorphism regression', () => {
  let lambdaParser: LambdaParserService;
  let typeInference: TypeInferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    lambdaParser = TestBed.inject(LambdaParserService);
    typeInference = TestBed.inject(TypeInferenceService);
  });

  it('generalizes let-bound identity and instantiates it at multiple types', () => {
    const ast = lambdaParser.parseLambdaExpression('let id = \\x:A. x in (id true, id 0)');
    const tree = typeInference.buildTypeInferenceTree(ast);

    expect(tree.inferredType.kind).toBe('Prod');
    if (tree.inferredType.kind === 'Prod') {
      expect(tree.inferredType.left.kind).toBe('Bool');
      expect(tree.inferredType.right.kind).toBe('Nat');
    }
  });

  it('keeps non-polymorphic assumptions monomorphic', () => {
    const ast = lambdaParser.parseLambdaExpression('\\f:A->A. let id = f in (id true, id 0)');

    expect(() => typeInference.buildTypeInferenceTree(ast)).toThrow();
  });
});
