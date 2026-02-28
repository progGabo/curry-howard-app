import { Injectable } from '@angular/core';
import { NdJudgement } from '../models/nd-judgement';
import { NdNode } from '../models/nd-node';
import { NdRule, NdRuleApplicationOptions } from '../models/nd-rule';
import { FormulaRenderService } from './formula-render.service';
import { NdRuleEngineService } from './nd-rule-engine.service';
import { NdAutoProverService } from './nd-auto-prover.service';
import { NdInteractiveCheckerService } from './nd-interactive-checker.service';
import { Equality } from '../utils/equality';

@Injectable({ providedIn: 'root' })
export class NaturalDeductionBuilderService {
	constructor(
		private formulaRender: FormulaRenderService,
		private engine: NdRuleEngineService,
		private autoProver: NdAutoProverService,
		private interactiveChecker: NdInteractiveCheckerService
	) {}

	async buildProof(judgement: NdJudgement): Promise<NdNode | null> {
		const root = this.autoProver.buildAutoTree(judgement);
		return root ? this.annotateLatex(root) : null;
	}

	buildInteractiveRoot(judgement: NdJudgement): NdNode {
		const root = this.engine.createRoot(judgement);
		return this.annotateLatex(root);
	}

	async applyRuleManually(node: NdNode, rule: NdRule, options?: NdRuleApplicationOptions): Promise<NdNode | null> {
		const applied = this.interactiveChecker.apply(node, rule, options);
		return applied ? this.annotateLatex(applied) : null;
	}

	canApply(node: NdNode, rule: NdRule, options?: NdRuleApplicationOptions): boolean {
		return this.interactiveChecker.canApply(node, rule, options);
	}

	private annotateLatex(node: NdNode): NdNode {
		node = this.autoCloseHypothesisLeaf(node);

		const assumptionsLatex = node.judgement.context
			.map((formula) => this.formulaRender.formulaToLatex(formula))
			.join(',\\, ');
		node.assumptionsLatex = assumptionsLatex ? `\\left[${assumptionsLatex}\\right]` : '';

		const goalLatex = this.formulaRender.formulaToLatex(node.judgement.goal);
		if (node.branchStatus === 'closed-hypothesis' && !node.premises?.length) {
			const labels = this.findMatchingHypothesisLabels(node);
			const superscript = labels.length ? `^{${labels.join(',')}}` : '';
			node.formulaLatex = `\\left[${goalLatex}\\right]${superscript}`;
		} else {
			node.formulaLatex = goalLatex;
		}

		node.premises = node.premises.map((child) => this.annotateLatex(child));
		return node;
	}

	private autoCloseHypothesisLeaf(node: NdNode): NdNode {
		const isLeaf = !node.premises?.length;
		if (!isLeaf) return node;

		const goalInContext = node.judgement.context.some((formula) =>
			Equality.formulasEqual(formula, node.judgement.goal)
		);

		if (!goalInContext) return node;

		node.rule = '∅';
		node.branchStatus = 'closed-hypothesis';
		return node;
	}

	private findMatchingHypothesisLabels(node: NdNode): string[] {
		const labels = new Set<string>();
		for (const hypothesis of node.openHypotheses ?? []) {
			if (
				hypothesis.label &&
				Equality.formulasEqual(hypothesis.formula, node.judgement.goal)
			) {
				labels.add(hypothesis.label);
			}
		}

		return [...labels].sort((left, right) => left.localeCompare(right));
	}
}
