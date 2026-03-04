import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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

  @ViewChild('conclusionEl') conclusionEl?: ElementRef<HTMLElement>;
  @ViewChild('childrenEl') childrenEl?: ElementRef<HTMLElement>;

  localPredictionInputs: string[] = [];
  lineWidthPx: number | null = null;
  lineOffsetPx = 0;
  private measureScheduled = false;

  get addRuleTitle(): string {
    return this.currentLanguage === 'sk' ? 'Pridať pravidlo' : 'Add rule';
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleLineMeasure();
  }

  ngAfterViewChecked(): void {
    this.scheduleLineMeasure();
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

  private scheduleLineMeasure(): void {
    if (this.measureScheduled) return;
    this.measureScheduled = true;

    requestAnimationFrame(() => {
      this.measureScheduled = false;
      this.updateLineWidth();
    });
  }

  private getOwnFormulaBounds(host: HTMLElement, relativeTo: HTMLElement): { left: number; right: number; width: number } {
    const main = host.firstElementChild as HTMLElement | null;
    const treeNode = main?.firstElementChild as HTMLElement | null;
    if (!treeNode) {
      return {
        left: host.offsetLeft,
        right: host.offsetLeft + host.offsetWidth,
        width: host.offsetWidth
      };
    }

    const ownConclusion = Array.from(treeNode.children).find((child) =>
      (child as HTMLElement).classList.contains('conclusion')
    ) as HTMLElement | undefined;

    if (!ownConclusion) {
      return {
        left: host.offsetLeft,
        right: host.offsetLeft + host.offsetWidth,
        width: host.offsetWidth
      };
    }

    const formulaEl = ownConclusion.querySelector('.sequent-content') as HTMLElement | null;
    const targetEl = formulaEl ?? ownConclusion;
    const containerRect = relativeTo.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const scaleX = targetEl.offsetWidth > 0 ? (targetRect.width / targetEl.offsetWidth) : 1;
    const safeScaleX = scaleX > 0 ? scaleX : 1;
    const left = (targetRect.left - containerRect.left) / safeScaleX;
    const width = targetRect.width / safeScaleX;
    const right = left + width;

    return {
      left,
      right,
      width: Math.max(0, width)
    };
  }

  private updateLineWidth(): void {
    const conclusionEl = this.conclusionEl?.nativeElement;
    const formulaEl = conclusionEl?.querySelector('.sequent-content') as HTMLElement | null;
    const conclusionWidth = conclusionEl?.offsetWidth ?? 0;
    const ownFormulaWidth = formulaEl?.offsetWidth ?? conclusionWidth;
    const childrenContainer = this.childrenEl?.nativeElement;
    this.lineOffsetPx = 0;

    if (!childrenContainer) {
      this.lineWidthPx = ownFormulaWidth;
      return;
    }

    const childHosts = Array.from(childrenContainer.children) as HTMLElement[];

    if (childHosts.length === 0) {
      this.lineWidthPx = ownFormulaWidth;
      return;
    }

    if (childHosts.length === 1) {
      const childBounds = this.getOwnFormulaBounds(childHosts[0], childrenContainer);
      this.lineWidthPx = Math.max(ownFormulaWidth, childBounds.width);
      return;
    }

    if (!conclusionEl) {
      this.lineWidthPx = childrenContainer.offsetWidth;
      return;
    }

    const childBounds = childHosts.map((host) => this.getOwnFormulaBounds(host, childrenContainer));
    const minLeft = Math.min(...childBounds.map((bounds) => bounds.left));
    const maxRight = Math.max(...childBounds.map((bounds) => bounds.right));
    const spanWidth = Math.max(0, maxRight - minLeft);
    const twoPremiseExtra = childHosts.length === 2 ? 16 : 0;
    this.lineWidthPx = spanWidth + twoPremiseExtra;

    const spanCenterWithinChildren = minLeft + spanWidth / 2;
    const childrenRect = childrenContainer.getBoundingClientRect();
    const conclusionRect = conclusionEl.getBoundingClientRect();
    const scaleX = conclusionEl.offsetWidth > 0 ? (conclusionRect.width / conclusionEl.offsetWidth) : 1;
    const safeScaleX = scaleX > 0 ? scaleX : 1;
    const spanCenterViewport = childrenRect.left + (spanCenterWithinChildren * safeScaleX);
    const conclusionCenterViewport = conclusionRect.left + (conclusionRect.width / 2);
    this.lineOffsetPx = (spanCenterViewport - conclusionCenterViewport) / safeScaleX;
  }
}
