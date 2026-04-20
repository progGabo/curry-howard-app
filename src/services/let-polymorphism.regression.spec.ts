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

  it('generalizes let-bound identity and instantiates it at the same type', () => {
    const ast = lambdaParser.parseLambdaExpression('let id = \\x:A. x in id');
    const tree = typeInference.buildTypeInferenceTree(ast);

    expect(tree.inferredType.kind).toBe('Func');
  });

  it('keeps non-polymorphic assumptions monomorphic under let', () => {
    const ast = lambdaParser.parseLambdaExpression('\\f:A->A. let id = f in id');
    const tree = typeInference.buildTypeInferenceTree(ast);

    expect(tree.inferredType.kind).toBe('Func');
  });
});
