import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NdNode } from '../../models/nd-node';
import { termToText } from '../../utils/quantifier-utils';
import { getElementCenter } from '../../utils/dom-position';
import { applyPredictionShortcut, isEscapeCancel } from '../../utils/prediction-input';

@Component({
  selector: 'app-natural-deduction-tree',
  standalone: false,
  templateUrl: './natural-deduction-tree.html',
  styleUrl: './natural-deduction-tree.scss'
})
export class NaturalDeductionTreeComponent {
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() root!: NdNode | null;
  @Input() selectedNode: NdNode | null = null;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Input() ndPredictionRequest: { node: NdNode; userPredictions: string[] } | null = null;

  @Output() nodeClicked = new EventEmitter<NdNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: NdNode; x: number; y: number }>();
  @Output() ndPredictionConfirm = new EventEmitter<string[]>();
  @Output() ndPredictionCancel = new EventEmitter<void>();

  localPredictionInputs: string[] = [];

  get addRuleTitle(): string {
    return this.currentLanguage === 'sk' ? 'Pridať pravidlo' : 'Add rule';
  }

  predictionPlaceholder(index: number): string {
    const prefix = this.currentLanguage === 'sk' ? 'Predikuj formulu' : 'Predict formula';
    return `${prefix} ${index + 1}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ndPredictionRequest']) {
      if (this.root && this.hasPendingPrediction(this.root) && this.ndPredictionRequest) {
        this.localPredictionInputs = [...this.ndPredictionRequest.userPredictions];
      } else {
        this.localPredictionInputs = [];
      }
    }
  }

  getDischargeLabel = (node: NdNode): string => {
    if (!node.discharges?.length) return '';
    return node.discharges.map((d) => d.label).join(',');
  };

  getRuleLabel = (node: NdNode): string => {
    if (!node.quantifierMeta) return node.rule;

    const binder = node.quantifierMeta.binderVariable;
    const term = node.quantifierMeta.instantiationTerm;
    const eigen = node.quantifierMeta.eigenVariable;

    if ((node.rule === '∀E' || node.rule === '∃I') && binder && term) {
      return `${node.rule}[${binder}:=${termToText(term)}]`;
    }

    if ((node.rule === '∀I' || node.rule === '∃E') && eigen) {
      return `${node.rule}[${eigen} fresh]`;
    }

    return node.rule;
  };

  canShowPlusButton = (node: NdNode): boolean => {
    if (this.mode !== 'interactive') return false;
    const isLeaf = !node.premises?.length;
    const isClosedHypothesisLeaf = node.branchStatus === 'closed-hypothesis' && isLeaf;
    return isLeaf && !isClosedHypothesisLeaf;
  };

  hasPendingPrediction(node: NdNode): boolean {
    return !!this.ndPredictionRequest && this.ndPredictionRequest.node === node;
  }

  onPredictionInput(index: number, event: Event): void {
    this.localPredictionInputs[index] = applyPredictionShortcut(event);
  }

  onPredictionKeyDown(event: KeyboardEvent): void {
    if (isEscapeCancel(event)) {
      this.ndPredictionCancel.emit();
    }
  }

  onPredictionConfirm(): void {
    this.ndPredictionConfirm.emit([...this.localPredictionInputs]);
  }

  onNodeClick(node: NdNode): void {
    if (this.mode !== 'interactive') return;
    this.nodeClicked.emit(node);
  }

  onNodeKeyDown(node: NdNode, event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onNodeClick(node);
    }
  }

  get nodeAriaLabel(): string {
    return this.mode === 'interactive'
      ? (this.currentLanguage === 'sk' ? 'Vybrať uzol dôkazu' : 'Select proof node')
      : (this.currentLanguage === 'sk' ? 'Uzol dôkazu' : 'Proof node');
  }

  onPlusButtonClick(node: NdNode, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canShowPlusButton(node)) return;
    const button = event.currentTarget as HTMLElement;
    const center = getElementCenter(button);
    this.plusButtonClicked.emit({
      node,
      x: center.x,
      y: center.y
    });
  }
}
