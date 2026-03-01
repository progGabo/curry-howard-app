import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-proof-lambda',
  standalone: false,
  templateUrl: './proof-lambda.html',
  styleUrl: './proof-lambda.scss'
})
export class ProofLambda{         
  @Input() lambdaExpr: string = '';
  @Input() label: string = 'Lambda-výraz';
}
