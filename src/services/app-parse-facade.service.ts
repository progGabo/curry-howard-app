import { Injectable } from '@angular/core';
import { DerivationNode, FormulaNode, SequentNode } from '../models/formula-node';
import { NdNode } from '../models/nd-node';
import { NdJudgement } from '../models/nd-judgement';
import { FormulaFactories } from '../utils/ast-factories';
import { LogicParserService } from './logic-parser-service';
import { ProofTreeBuilderService } from './proof-tree-builder';
import { NaturalDeductionBuilderService } from './natural-deduction-builder.service';
import { LambdaParserService } from './lambda-parser-service';
import { LambdaToExpressionService } from './lambda-to-expression-service';
import { TypeInferenceNode, TypeInferenceService } from './type-inference-service';

export interface SequentParseResult {
  sequent: SequentNode;
  proofTree: DerivationNode;
  isPredicateLogic: boolean;
  nextMode: 'auto' | 'interactive';
}

export interface NaturalDeductionParseResult {
  naturalDeductionTree: NdNode | null;
  isPredicateLogic: boolean;
  nextMode: 'auto' | 'interactive';
  notProvable: boolean;
}

export interface LambdaParseResult {
  typeInferenceTree: TypeInferenceNode | null;
  resultExpression: string;
  lambdaExpr: string;
}

@Injectable({ providedIn: 'root' })
export class AppParseFacadeService {
  constructor(
    private logicParser: LogicParserService,
    private proofBuilder: ProofTreeBuilderService,
    private naturalDeductionBuilder: NaturalDeductionBuilderService,
    private lambdaParser: LambdaParserService,
    private lambdaToExpression: LambdaToExpressionService,
    private typeInference: TypeInferenceService
  ) {}

  async parseSequentInput(code: string, mode: 'auto' | 'interactive'): Promise<SequentParseResult> {
    const sequent = this.logicParser.parseFormula(code);
    const isPredicateLogic = this.containsPredicateLogic(sequent);
    const nextMode: 'auto' | 'interactive' = isPredicateLogic && mode === 'auto' ? 'interactive' : mode;
    const proofTree = nextMode === 'auto' && !isPredicateLogic
      ? await this.proofBuilder.buildProof(sequent)
      : this.proofBuilder.buildInteractiveRoot(sequent);

    return {
      sequent,
      proofTree,
      isPredicateLogic,
      nextMode
    };
  }

  async parseNaturalDeductionInput(code: string, mode: 'auto' | 'interactive'): Promise<NaturalDeductionParseResult> {
    const parsed = this.logicParser.parseFormula(code);
    const isPredicateLogic = this.containsPredicateLogic(parsed);
    const nextMode: 'auto' | 'interactive' = isPredicateLogic && mode === 'auto' ? 'interactive' : mode;

    const ndJudgement: NdJudgement = {
      context: [...parsed.assumptions],
      goal: parsed.conclusions[0] ?? FormulaFactories.false()
    };

    if (nextMode === 'auto' && !isPredicateLogic) {
      const naturalDeductionTree = await this.naturalDeductionBuilder.buildProof(ndJudgement);
      return {
        naturalDeductionTree,
        isPredicateLogic,
        nextMode,
        notProvable: !naturalDeductionTree
      };
    }

    return {
      naturalDeductionTree: this.naturalDeductionBuilder.buildInteractiveRoot(ndJudgement),
      isPredicateLogic,
      nextMode,
      notProvable: false
    };
  }

  parseLambdaInput(code: string, mode: 'auto' | 'interactive'): LambdaParseResult {
    const lambdaExpr = this.lambdaParser.parseLambdaExpression(code);
    const initialAssumptions = undefined;
    const typeInferenceTree = mode === 'auto'
      ? this.typeInference.buildTypeInferenceTree(lambdaExpr, initialAssumptions)
      : this.typeInference.buildInteractiveRoot(lambdaExpr, initialAssumptions);

    const resultExpression = typeInferenceTree
      ? this.lambdaToExpression.convertLambdaToExpression(lambdaExpr, typeInferenceTree.inferredType)
      : '';

    return {
      typeInferenceTree,
      resultExpression,
      lambdaExpr: this.lambdaParser.formatLambdaExpression(lambdaExpr)
    };
  }

  private containsPredicateLogic(sequent: SequentNode | null): boolean {
    if (!sequent) return false;

    const checkFormula = (formula: FormulaNode): boolean => {
      switch (formula.kind) {
        case 'Forall':
        case 'Exists':
        case 'Predicate':
          return true;
        case 'Implies':
        case 'And':
        case 'Or':
          return checkFormula(formula.left) || checkFormula(formula.right);
        case 'Not':
        case 'Paren':
          return checkFormula(formula.inner);
        default:
          return false;
      }
    };

    return sequent.assumptions.some(checkFormula) || sequent.conclusions.some(checkFormula);
  }
}
