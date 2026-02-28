import { TestBed } from '@angular/core/testing';
import { FormulaTypeService } from './formula-type-service';
import { TypeInferenceService } from './type-inference-service';
import { FormulaFactories, ExprFactories, TypeFactories } from '../utils/ast-factories';
import { LambdaToExpressionService } from './lambda-to-expression-service';

describe('Negation/Bottom regression', () => {
  let formulaType: FormulaTypeService;
  let typeInference: TypeInferenceService;
  let lambdaToExpression: LambdaToExpressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    formulaType = TestBed.inject(FormulaTypeService);
    typeInference = TestBed.inject(TypeInferenceService);
    lambdaToExpression = TestBed.inject(LambdaToExpressionService);
  });

  it('maps ¬A to A → ⊥ and False to ⊥', () => {
    const a = FormulaFactories.var('p');
    const notAType = formulaType.formulaToType(FormulaFactories.not(a));
    const falseType = formulaType.formulaToType(FormulaFactories.false());

    expect(notAType.kind).toBe('Func');
    if (notAType.kind === 'Func') {
      expect(notAType.to.kind).toBe('Bottom');
    }
    expect(falseType.kind).toBe('Bottom');
  });

  it('types abort(x):A when x:⊥ (ex-falso)', () => {
    const assumptions = new Map<string, any>([['x', TypeFactories.bottom()]]);
    const expr = ExprFactories.abort(ExprFactories.var('x'), TypeFactories.typeVar('A'));

    const inferred = typeInference.buildTypeInferenceTree(expr, assumptions);
    expect(inferred.inferredType.kind).toBe('TypeVar');
    if (inferred.inferredType.kind === 'TypeVar') {
      expect(inferred.inferredType.name).toBe('A');
    }
  });

  it('rejects abort on non-bottom source', () => {
    const assumptions = new Map<string, any>([['x', TypeFactories.bool()]]);
    const expr = ExprFactories.abort(ExprFactories.var('x'), TypeFactories.typeVar('A'));

    expect(() => typeInference.buildTypeInferenceTree(expr, assumptions)).toThrow();
  });

  it('pretty-prints q → ⊥ as ¬q', () => {
    const rendered = lambdaToExpression.convertTypeToLogicalFormula(
      TypeFactories.func(TypeFactories.typeVar('q'), TypeFactories.bottom())
    );

    expect(rendered).toBe('¬q');
  });

  it('pretty-prints contraposition shape with compressed negation', () => {
    const rendered = lambdaToExpression.convertTypeToLogicalFormula(
      TypeFactories.func(
        TypeFactories.func(TypeFactories.typeVar('p'), TypeFactories.typeVar('q')),
        TypeFactories.func(
          TypeFactories.func(TypeFactories.typeVar('q'), TypeFactories.bottom()),
          TypeFactories.func(TypeFactories.typeVar('p'), TypeFactories.bottom())
        )
      )
    );

    expect(rendered).toBe('(p → q) → (¬q → ¬p)');
  });

  it('pretty-prints ((r → ⊥) → ⊥) as ¬¬r', () => {
    const rendered = lambdaToExpression.convertTypeToLogicalFormula(
      TypeFactories.func(
        TypeFactories.func(TypeFactories.typeVar('r'), TypeFactories.bottom()),
        TypeFactories.bottom()
      )
    );

    expect(rendered).toBe('¬(¬r)');
  });
});
