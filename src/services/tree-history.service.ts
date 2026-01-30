import { Injectable } from '@angular/core';
import { DerivationNode } from '../models/formula-node';
import { TypeNode } from '../models/lambda-node';
import { TypeInferenceNode } from './type-inference-service';

@Injectable({ providedIn: 'root' })
export class TreeHistoryService {
  private proofTreeHistory: DerivationNode[] = [];
  private typeInferenceTreeHistory: TypeInferenceNode[] = [];

  clear(): void {
    this.proofTreeHistory = [];
    this.typeInferenceTreeHistory = [];
  }

  pushProofState(node: DerivationNode): void {
    this.proofTreeHistory.push(this.deepCopyDerivationNode(node));
  }

  popProofState(): DerivationNode | null {
    return this.proofTreeHistory.pop() ?? null;
  }

  pushTypeInferenceState(node: TypeInferenceNode): void {
    this.typeInferenceTreeHistory.push(this.deepCopyTypeInferenceNode(node));
  }

  popTypeInferenceState(): TypeInferenceNode | null {
    return this.typeInferenceTreeHistory.pop() ?? null;
  }

  canStepBack(conversionMode: 'expression-to-lambda' | 'lambda-to-expression'): boolean {
    if (conversionMode === 'expression-to-lambda') {
      return this.proofTreeHistory.length > 0;
    }
    return this.typeInferenceTreeHistory.length > 0;
  }

  private deepCopyDerivationNode(node: DerivationNode): DerivationNode {
    return {
      rule: node.rule,
      sequent: {
        assumptions: JSON.parse(JSON.stringify(node.sequent.assumptions)),
        conclusions: JSON.parse(JSON.stringify(node.sequent.conclusions))
      },
      children: node.children ? node.children.map((child) => this.deepCopyDerivationNode(child)) : [],
      usedFormula: node.usedFormula ? JSON.parse(JSON.stringify(node.usedFormula)) : undefined,
      id: node.id,
      ui: node.ui ? { ...node.ui } : undefined
    };
  }

  private deepCopyTypeInferenceNode(node: TypeInferenceNode): TypeInferenceNode {
    const assumptionsCopy = new Map<string, TypeNode>();
    node.assumptions.forEach((value, key) => {
      assumptionsCopy.set(key, JSON.parse(JSON.stringify(value)) as TypeNode);
    });
    return {
      id: node.id,
      expression: JSON.parse(JSON.stringify(node.expression)),
      assumptions: assumptionsCopy,
      inferredType: JSON.parse(JSON.stringify(node.inferredType)),
      rule: node.rule,
      children: node.children ? node.children.map((child) => this.deepCopyTypeInferenceNode(child)) : [],
      ui: node.ui ? { ...node.ui } : undefined
    };
  }
}
