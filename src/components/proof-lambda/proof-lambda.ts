import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProofNode } from '../../models/proof-node';
import { LogicParserService } from '../../services/logic-parser-service';
import { ProofTreeBuilderService } from '../../services/proof-tree-builder';
import { LambdaBuilderService } from '../../services/lambda-builder-service';
import { DerivationNode, SequentNode } from '../../models/formula-node';
import { Lambda } from '../../models/lambda';
import { FormulaNode } from '../../models/formula-node';

@Component({
  selector: 'app-proof-lambda',
  standalone: false,
  templateUrl: './proof-lambda.html',
  styleUrl: './proof-lambda.scss'
})
export class ProofLambda{         
  @Input() lambdaExpr: string = '';

  constructor(
    private lambdaBuilder: LambdaBuilderService
  ) {}

}
