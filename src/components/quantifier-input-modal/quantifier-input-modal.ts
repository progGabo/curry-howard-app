import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { I18nService } from '../../services/i18n.service';

/**
 * Modal component for quantifier rule input.
 * Used for:
 * - ∀R, ∃L: Input eigenvariable (fresh variable name)
 * - ∀L, ∃R: Input instantiation/witness term
 */
@Component({
  selector: 'app-quantifier-input-modal',
  templateUrl: './quantifier-input-modal.html',
  styleUrls: ['./quantifier-input-modal.scss'],
  standalone: false,
})
export class QuantifierInputModalComponent implements OnInit {
  inputValue: string = '';
  errorMessage: string = '';
  ruleType: 'forall-right' | 'forall-left' | 'exists-right' | 'exists-left' = 'forall-right';
  placeholder: string = '';
  isVariableInput: boolean = true; // true for eigenvariable, false for term
  freeVars: string[] = []; // Free variables to check freshness against
  
  // Translations
  title: string = '';
  labelVariable: string = '';
  labelTerm: string = '';
  btnCancel: string = '';
  btnConfirm: string = '';
  currentLanguage: 'sk' | 'en' = 'sk';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    this.ruleType = this.config.data.ruleType;
    this.freeVars = this.config.data.freeVars || [];
    this.currentLanguage = this.config.data.language || 'sk';
    this.setupForRule();
  }

  private setupForRule() {
    const t = this.i18n.quantifierRuleLabels(this.currentLanguage, this.ruleType);
    this.title = t.title;
    this.labelVariable = t.labelVariable ?? '';
    this.labelTerm = t.labelTerm ?? '';
    this.placeholder = t.placeholder;
    this.btnCancel = t.btnCancel;
    this.btnConfirm = t.btnConfirm;

    switch (this.ruleType) {
      case 'forall-right':
      case 'exists-left':
        this.isVariableInput = true;
        break;
      case 'forall-left':
      case 'exists-right':
        this.isVariableInput = false;
        break;
    }
  }

  validate(): boolean {
    this.errorMessage = '';
    const errors = this.i18n.quantifierErrors(this.currentLanguage);

    if (!this.inputValue.trim()) {
      this.errorMessage = errors.empty;
      return false;
    }

    if (this.isVariableInput) {
      const varMatch = this.inputValue.trim().match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        this.errorMessage = errors.invalidVar;
        return false;
      }
      const inputVar = this.inputValue.trim();
      if (this.freeVars.includes(inputVar)) {
        this.errorMessage = errors.notFresh.replace('{var}', inputVar);
        return false;
      }
    } else {
      const trimmed = this.inputValue.trim();
      if (!trimmed) {
        this.errorMessage = errors.emptyTerm;
        return false;
      }
    }

    return true;
  }

  confirm() {
    if (this.validate()) {
      this.ref.close(this.inputValue.trim());
    }
  }

  cancel() {
    this.ref.close(null);
  }
}

