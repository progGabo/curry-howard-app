import { Injectable } from '@angular/core';

export type HeaderOption =
  | 'ch-expression-to-lambda'
  | 'ch-lambda-to-expression'
  | 'proofs-sequent'
  | 'proofs-natural-deduction';

export type ConversionMode = 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction';

@Injectable({ providedIn: 'root' })
export class AppWorkflowFacadeService {
  headerOption: HeaderOption = 'ch-expression-to-lambda';
  conversionMode: ConversionMode = this.deriveConversionMode(this.headerOption);

  setHeaderOption(option: HeaderOption): boolean {
    if (option === this.headerOption) {
      return false;
    }
    this.headerOption = option;
    this.conversionMode = this.deriveConversionMode(option);
    return true;
  }

  get isLambdaToExpressionWorkflow(): boolean {
    return this.headerOption === 'ch-lambda-to-expression';
  }

  get isNaturalDeductionWorkflow(): boolean {
    return this.headerOption === 'ch-expression-to-lambda' || this.headerOption === 'proofs-natural-deduction';
  }

  get isSequentWorkflow(): boolean {
    return this.headerOption === 'proofs-sequent';
  }

  get shouldGenerateLambdaFromProof(): boolean {
    return this.headerOption === 'ch-expression-to-lambda';
  }

  private deriveConversionMode(option: HeaderOption): ConversionMode {
    if (option === 'ch-lambda-to-expression') {
      return 'lambda-to-expression';
    }
    if (option === 'proofs-sequent') {
      return 'expression-to-lambda';
    }
    return 'natural-deduction';
  }
}
