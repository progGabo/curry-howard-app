import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tree-canvas',
  standalone: false,
  templateUrl: './tree-canvas.html',
  styleUrl: './tree-canvas.scss'
})
export class TreeCanvasComponent implements OnChanges {
  @Input() resetTrigger: number = 0;
  @Input() initialZoom: number = 1;

  panX = 0;
  panY = 0;
  zoom = 1;
  isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] || changes['initialZoom']) {
      this.panX = 0;
      this.panY = 0;
      this.zoom = this.clampZoom(this.initialZoom);
    }
  }

  get transformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isCanvasBackground =
      target.classList.contains('tree-canvas') || target.classList.contains('tree-canvas-container');
    const isMiddleButton = event.button === 1;
    const isModifierKey = (event.ctrlKey || event.metaKey) && event.button === 0;
    const isInteractiveElement = target.closest(
      'button, input, .rule-menu-popup, .conclusion, .sequent-content, .rule-plus-btn, .prediction-inputs'
    );

    if ((isMiddleButton || isModifierKey) && !isInteractiveElement) {
      this.startPan(event);
    } else if (isCanvasBackground && !isInteractiveElement) {
      this.startPan(event);
    }
  }

  private startPan(event: MouseEvent): void {
    this.isPanning = true;
    this.panStartX = event.clientX - this.panX;
    this.panStartY = event.clientY - this.panY;
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.panX = event.clientX - this.panStartX;
      this.panY = event.clientY - this.panStartY;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.isPanning) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isPanning = false;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, this.zoom * delta));
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const worldX = (mouseX - this.panX) / this.zoom;
    const worldY = (mouseY - this.panY) / this.zoom;
    this.zoom = newZoom;
    this.panX = mouseX - worldX * this.zoom;
    this.panY = mouseY - worldY * this.zoom;
  }

  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  private clampZoom(value: number): number {
    return Math.max(0.1, Math.min(5, value || 1));
  }
}
