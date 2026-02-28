import { Injectable } from '@angular/core';
import { NdNode } from '../models/nd-node';
import { NdRule, NdRuleApplicationOptions } from '../models/nd-rule';
import { NdRuleEngineService } from './nd-rule-engine.service';

@Injectable({ providedIn: 'root' })
export class NdInteractiveCheckerService {
  constructor(private engine: NdRuleEngineService) {}

  canApply(node: NdNode, rule: NdRule, options?: NdRuleApplicationOptions): boolean {
    return this.engine.applyRule(node, rule, options) !== null;
  }

  apply(node: NdNode, rule: NdRule, options?: NdRuleApplicationOptions): NdNode | null {
    return this.engine.applyRule(node, rule, options);
  }
}
