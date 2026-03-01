import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { getElementCenter } from '../../utils/dom-position';
import { DerivationNode, SequentNode } from '../../models/formula-node';
import { NdNode } from '../../models/nd-node';
import { TypeInferenceNode } from '../../services/type-inference-service';
import { ExprNode, TypeNode } from '../../models/lambda-node';

export type TreeRenderNode = DerivationNode | NdNode | TypeInferenceNode;

@Component({
  selector: 'app-tree-renderer',
  standalone: false,
  templateUrl: './tree-renderer.html',
  styleUrls: ['./tree-renderer.scss']
})
export class TreeRendererComponent implements AfterViewChecked {
  @Input() treeType: 'sequent' | 'nd' | 'type' = 'sequent';
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() root: TreeRenderNode | null = null;
  @Input() selectedNode: TreeRenderNode | null = null;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';

  @Input() sequentLatexFn?: (sequent: SequentNode) => string;
  @Input() formatExpressionFn?: (expression: ExprNode) => string;
  @Input() formatTypeFn?: (type: TypeNode) => string;
  @Input() dischargeLabelFn?: (node: TreeRenderNode) => string;
  @Input() ruleLabelFn?: (node: TreeRenderNode) => string;
  @Input() showPlusButtonFn?: (node: TreeRenderNode) => boolean;
  @Input() showRuleFn?: (node: TreeRenderNode) => boolean;

  @Output() nodeClicked = new EventEmitter<TreeRenderNode>();
  @Output() plusButtonClicked = new EventEmitter<{ node: TreeRenderNode; x: number; y: number }>();

  @ViewChild('conclusionEl') conclusionEl?: ElementRef<HTMLElement>;
  @ViewChild('childrenEl') childrenEl?: ElementRef<HTMLElement>;

  lineWidthPx: number | null = null;
  private measureScheduled = false;

  get isSelected(): boolean {
    return this.selectedNode === this.root;
  }

  get children(): TreeRenderNode[] {
    if (!this.root) return [];
    if (this.treeType === 'nd') return (this.root as NdNode).premises ?? [];
    return (this.root as DerivationNode | TypeInferenceNode).children ?? [];
  }

  get showRule(): boolean {
    if (!this.root) return false;
    if (this.showRuleFn) return this.showRuleFn(this.root);

    if (this.treeType === 'nd') {
      return this.root.rule !== '∅';
    }

    if (this.treeType === 'sequent') {
      return this.children.length > 0 || this.root.rule === 'Ax' || this.root.rule === 'id';
    }

    return this.children.length > 0 || ['Var', 'True', 'False', 'Zero'].includes(this.root.rule);
  }

  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  get showPlusButton(): boolean {
    if (!this.root || this.mode !== 'interactive') return false;
    if (this.showPlusButtonFn) return this.showPlusButtonFn(this.root);

    if (!this.isLeaf) return false;

    if (this.treeType === 'nd') {
      return this.isNdNode(this.root) && this.root.branchStatus !== 'closed-hypothesis';
    }

    if (this.treeType === 'sequent') {
      return this.root.rule !== 'Ax' && this.root.rule !== 'id';
    }

    return !['Var', 'True', 'False', 'Zero'].includes(this.root.rule);
  }

  get addRuleTitle(): string {
    return this.currentLanguage === 'sk' ? 'Pridať pravidlo' : 'Add rule';
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.treeType !== 'nd') return;
    this.scheduleLineMeasure();
  }

  ngAfterViewChecked(): void {
    if (this.treeType !== 'nd') return;
    this.scheduleLineMeasure();
  }

  onNodeClick(): void {
    if (!this.root || this.mode !== 'interactive') return;
    this.nodeClicked.emit(this.root);
  }

  onNodeKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onNodeClick();
    }
  }

  get nodeAriaLabel(): string {
    if (this.mode !== 'interactive') {
      return this.currentLanguage === 'sk' ? 'Uzol dôkazu' : 'Proof node';
    }
    return this.currentLanguage === 'sk' ? 'Vybrať uzol dôkazu' : 'Select proof node';
  }

  onPlusButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.root || this.mode !== 'interactive') return;
    const button = event.currentTarget as HTMLElement;
    const center = getElementCenter(button);
    this.plusButtonClicked.emit({
      node: this.root,
      x: center.x,
      y: center.y
    });
  }

  getConclusionKatex(node: TreeRenderNode): string {
    if (this.treeType === 'nd') {
      return (node as NdNode).formulaLatex || '';
    }

    if (this.treeType === 'sequent') {
      const sequentNode = node as DerivationNode;
      return sequentNode.sequentLatex || this.sequentLatexFn?.(sequentNode.sequent) || '';
    }

    return '';
  }

  getExpressionText(node: TreeRenderNode): string {
    return this.formatExpressionFn ? this.formatExpressionFn((node as TypeInferenceNode).expression) : '';
  }

  getTypeText(node: TreeRenderNode): string {
    return this.formatTypeFn ? this.formatTypeFn((node as TypeInferenceNode).inferredType) : '';
  }

  getDischargeLabel(node: TreeRenderNode): string {
    if (!this.dischargeLabelFn) return '';
    return this.dischargeLabelFn(node);
  }

  getRuleLabel(node: TreeRenderNode): string {
    if (this.ruleLabelFn) {
      return this.ruleLabelFn(node);
    }
    return node.rule;
  }

  private isNdNode(node: TreeRenderNode): node is NdNode {
    return this.treeType === 'nd';
  }

  private scheduleLineMeasure(): void {
    if (this.measureScheduled) return;
    this.measureScheduled = true;

    requestAnimationFrame(() => {
      this.measureScheduled = false;
      this.updateLineWidth();
    });
  }

  private getOwnConclusionWidth(host: HTMLElement): number {
    const main = host.firstElementChild as HTMLElement | null;
    const treeNode = main?.firstElementChild as HTMLElement | null;
    if (!treeNode) return host.offsetWidth;

    const ownConclusion = Array.from(treeNode.children).find((child) =>
      (child as HTMLElement).classList.contains('conclusion')
    ) as HTMLElement | undefined;

    return ownConclusion?.offsetWidth ?? host.offsetWidth;
  }

  private getOwnConclusionCenterX(host: HTMLElement, relativeTo: HTMLElement): number {
    const main = host.firstElementChild as HTMLElement | null;
    const treeNode = main?.firstElementChild as HTMLElement | null;
    if (!treeNode) {
      return host.offsetLeft + host.offsetWidth / 2;
    }

    const ownConclusion = Array.from(treeNode.children).find((child) =>
      (child as HTMLElement).classList.contains('conclusion')
    ) as HTMLElement | undefined;

    if (!ownConclusion) {
      return host.offsetLeft + host.offsetWidth / 2;
    }

    const containerRect = relativeTo.getBoundingClientRect();
    const conclusionRect = ownConclusion.getBoundingClientRect();
    return conclusionRect.left - containerRect.left + conclusionRect.width / 2;
  }

  private updateLineWidth(): void {
    const conclusionWidth = this.conclusionEl?.nativeElement.offsetWidth ?? 0;
    const childrenContainer = this.childrenEl?.nativeElement;

    if (!childrenContainer) {
      this.lineWidthPx = conclusionWidth;
      return;
    }

    const childHosts = Array.from(childrenContainer.children) as HTMLElement[];

    if (childHosts.length === 0) {
      this.lineWidthPx = conclusionWidth;
      return;
    }

    if (childHosts.length === 1) {
      const childFormulaWidth = this.getOwnConclusionWidth(childHosts[0]);
      this.lineWidthPx = Math.max(conclusionWidth, childFormulaWidth);
      return;
    }

    if (childHosts.length === 2) {
      const firstCenter = this.getOwnConclusionCenterX(childHosts[0], childrenContainer);
      const secondCenter = this.getOwnConclusionCenterX(childHosts[1], childrenContainer);
      const baseWidth = Math.max(0, secondCenter - firstCenter);
      const extraSpan = 24;
      this.lineWidthPx = baseWidth + extraSpan;
      return;
    }

    this.lineWidthPx = childrenContainer.offsetWidth;
  }
}
