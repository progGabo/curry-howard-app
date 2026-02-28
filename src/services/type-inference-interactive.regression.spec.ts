import { TestBed } from '@angular/core/testing';
import { LambdaParserService } from './lambda-parser-service';
import { TypeInferenceService, TypeInferenceNode } from './type-inference-service';

describe('Type inference interactive regression', () => {
  let lambdaParser: LambdaParserService;
  let typeInference: TypeInferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    lambdaParser = TestBed.inject(LambdaParserService);
    typeInference = TestBed.inject(TypeInferenceService);
  });

  function findFirstDependentPair(node: TypeInferenceNode): TypeInferenceNode | null {
    if (node.expression.kind === 'DependentPair') {
      return node;
    }
    for (const child of node.children ?? []) {
      const found = findFirstDependentPair(child);
      if (found) return found;
    }
    return null;
  }

  it('replaces placeholder witness type in interactive DependentPair after child inference', () => {
    const expr = lambdaParser.parseLambdaExpression('λa:(∃x:T. P(x)) -> Bottom. λx:T. λb:P(x). a <x, b>');
    const root = typeInference.buildInteractiveRoot(expr);

    const abs1 = typeInference.applyRuleManually(root.expression, root.assumptions, 'Abs');
    expect(abs1).not.toBeNull();
    if (!abs1) return;

    const depAbs = typeInference.applyRuleManually(abs1.children[0].expression, abs1.children[0].assumptions, 'DependentAbs');
    expect(depAbs).not.toBeNull();
    if (!depAbs) return;

    const abs2 = typeInference.applyRuleManually(depAbs.children[0].expression, depAbs.children[0].assumptions, 'Abs');
    expect(abs2).not.toBeNull();
    if (!abs2) return;

    const app = typeInference.applyRuleManually(abs2.children[0].expression, abs2.children[0].assumptions, 'App');
    expect(app).not.toBeNull();
    if (!app) return;

    const pairNode = typeInference.applyRuleManually(app.children[1].expression, app.children[1].assumptions, 'DependentPair');
    expect(pairNode).not.toBeNull();
    if (!pairNode) return;

    const witnessVar = typeInference.applyRuleManually(pairNode.children[0].expression, pairNode.children[0].assumptions, 'Var');
    expect(witnessVar).not.toBeNull();
    if (!witnessVar) return;

    pairNode.children[0] = witnessVar;
    typeInference.updateNodeTypeFromChildren(pairNode);

    expect(pairNode.inferredType.kind).toBe('DependentProd');
    if (pairNode.inferredType.kind === 'DependentProd') {
      expect(pairNode.inferredType.paramType.kind).toBe('TypeVar');
      if (pairNode.inferredType.paramType.kind === 'TypeVar') {
        expect(pairNode.inferredType.paramType.name).toBe('T');
      }
    }
  });
});
