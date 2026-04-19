import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTranslations } from '../../services/i18n.service';
import { RuleFormulaService } from '../../services/rule-formula.service';

export type HelpTab = 'syntax' | 'controls' | 'curry-howard' | 'sequent' | 'natural-deduction';

@Component({
  selector: 'app-help-modal',
  standalone: false,
  templateUrl: './help-modal.html',
  styleUrl: './help-modal.scss'
})
export class HelpModalComponent {
  @Input() visible = false;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Input() t!: AppTranslations;

  @Output() close = new EventEmitter<void>();

  activeTab: HelpTab = 'syntax';

  get tabs(): { key: HelpTab; label: string }[] {
    const sk = this.currentLanguage === 'sk';
    return [
      { key: 'syntax', label: sk ? 'Syntax vstupu' : 'Input syntax' },
      { key: 'controls', label: sk ? 'Ovládanie' : 'Controls' },
      { key: 'curry-howard', label: 'Curry-Howard' },
      { key: 'sequent', label: sk ? 'Sekventový kalkul' : 'Sequent calculus' },
      { key: 'natural-deduction', label: sk ? 'Prirodzená dedukcia' : 'Natural deduction' },
    ];
  }

  readonly sequentConclusionRules = ['→R', '∧R', '∨R', '¬R', '∀R', '∃R'];
  readonly sequentAssumptionRules = ['→L', '∧L', '∨L', '¬L', '∀L', '∃L'];
  readonly sequentSpecialRules = ['id', 'WR', 'WL'];

  readonly ndIntroRules = ['⊤I', '¬I', '∧I', '∨I1', '∨I2', '→I'];
  readonly ndElimRules = ['⊥E1', '¬E', '∧E1', '∧E2', '∨E', '→E'];
  readonly ndQuantifierRules = ['∀I', '∀E', '∃I', '∃E'];

  constructor(private ruleFormula: RuleFormulaService) {}

  onBackdropClick(): void {
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }

  selectTab(tab: HelpTab): void {
    this.activeTab = tab;
  }

  getFormula(ruleName: string): string {
    const formula = this.ruleFormula.getFormula(ruleName, this.currentLanguage);
    return formula ? formula.formula : '';
  }
}
