import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rule-menu-popup',
  standalone: false,
  templateUrl: './rule-menu-popup.html',
  styleUrl: './rule-menu-popup.scss'
})
export class RuleMenuPopupComponent {
  @Input() visible = false;
  @Input() popupX = 0;
  @Input() popupY = 0;
  @Input() conversionMode: 'expression-to-lambda' | 'lambda-to-expression' = 'expression-to-lambda';
  @Input() filteredConclusionRules: string[] = [];
  @Input() filteredAssumptionRules: string[] = [];
  @Input() filteredSpecialRules: string[] = [];
  @Input() filteredBasicRules: string[] = [];
  @Input() filteredAbsRules: string[] = [];
  @Input() filteredAppRules: string[] = [];
  @Input() filteredPairRules: string[] = [];
  @Input() filteredDependentRules: string[] = [];
  @Input() filteredSumRules: string[] = [];
  @Input() filteredConditionalRules: string[] = [];
  @Input() filteredNatRules: string[] = [];
  @Input() filteredLetRules: string[] = [];

  @Output() proofRuleClick = new EventEmitter<string>();
  @Output() typeRuleClick = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();

  isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  get popupPosition(): { top: string; left: string } {
    return { top: `${this.popupY}px`, left: `${this.popupX}px` };
  }

  onDragStart(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.popupX;
    this.dragStartY = event.clientY - this.popupY;
    event.preventDefault();
  }

  onDragMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.positionChange.emit({
        x: event.clientX - this.dragStartX,
        y: event.clientY - this.dragStartY
      });
    }
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  onClose(): void {
    this.close.emit();
  }

  onProofRuleClick(rule: string): void {
    this.proofRuleClick.emit(rule);
  }

  onTypeRuleClick(rule: string): void {
    this.typeRuleClick.emit(rule);
  }
}
