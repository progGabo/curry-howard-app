import { AfterViewChecked, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tree-renderer',
  standalone: false,
  templateUrl: './tree-renderer.html',
  styleUrls: ['./tree-renderer.scss']
})
export class TreeRendererComponent implements AfterViewChecked {
  @Input() treeType: 'sequent' | 'nd' | 'type' = 'sequent';
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() root: any | null = null;
  @Input() selectedNode: any | null = null;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';

  @Input() sequentLatexFn?: (sequent: any) => string;
  @Input() formatExpressionFn?: (expression: any) => string;
  @Input() formatTypeFn?: (type: any) => string;
  @Input() dischargeLabelFn?: (node: any) => string;
  @Input() ruleLabelFn?: (node: any) => string;
  @Input() showPlusButtonFn?: (node: any) => boolean;
  @Input() showRuleFn?: (node: any) => boolean;

  @Output() nodeClicked = new EventEmitter<any>();
  @Output() plusButtonClicked = new EventEmitter<{ node: any; x: number; y: number }>();

  @ViewChild('conclusionEl') conclusionEl?: ElementRef<HTMLElement>;
  @ViewChild('childrenEl') childrenEl?: ElementRef<HTMLElement>;

  lineWidthPx: number | null = null;
  private measureScheduled = false;

  get isSelected(): boolean {
    return this.selectedNode === this.root;
  }

  get children(): any[] {
    if (!this.root) return [];
    if (this.treeType === 'nd') return this.root.premises ?? [];
    return this.root.children ?? [];
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
      return this.root.branchStatus !== 'closed-hypothesis';
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

  onPlusButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.root || this.mode !== 'interactive') return;
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.plusButtonClicked.emit({
      node: this.root,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
  }

  getConclusionKatex(node: any): string {
    if (this.treeType === 'nd') {
      return node.formulaLatex || '';
    }

    if (this.treeType === 'sequent') {
      return node.sequentLatex || this.sequentLatexFn?.(node.sequent) || '';
    }

    return '';
  }

  getExpressionText(node: any): string {
    return this.formatExpressionFn ? this.formatExpressionFn(node.expression) : '';
  }

  getTypeText(node: any): string {
    return this.formatTypeFn ? this.formatTypeFn(node.inferredType) : '';
  }

  getDischargeLabel(node: any): string {
    if (!this.dischargeLabelFn) return '';
    return this.dischargeLabelFn(node);
  }

  getRuleLabel(node: any): string {
    if (this.ruleLabelFn) {
      return this.ruleLabelFn(node);
    }
    return node.rule;
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
