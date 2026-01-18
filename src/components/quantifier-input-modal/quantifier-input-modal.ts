import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

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
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.ruleType = this.config.data.ruleType;
    this.freeVars = this.config.data.freeVars || [];
    this.currentLanguage = this.config.data.language || 'sk';
    this.setupForRule();
  }

  private setupForRule() {
    const translations = {
      sk: {
        'forall-right': {
          title: '∀R: Zvoľte premennú',
          labelVariable: 'Názov premennej:',
          placeholder: 'napr., y',
          btnCancel: 'Zrušiť',
          btnConfirm: 'Potvrdiť'
        },
        'forall-left': {
          title: '∀L: Zvoľte term',
          labelTerm: 'Term:',
          placeholder: 'napr., x, c, f(x, y)',
          btnCancel: 'Zrušiť',
          btnConfirm: 'Potvrdiť'
        },
        'exists-right': {
          title: '∃R: Zvoľte svedka',
          labelTerm: 'Term:',
          placeholder: 'napr., x, c, f(x, y)',
          btnCancel: 'Zrušiť',
          btnConfirm: 'Potvrdiť'
        },
        'exists-left': {
          title: '∃L: Zvoľte premennú',
          labelVariable: 'Názov premennej:',
          placeholder: 'napr., y',
          btnCancel: 'Zrušiť',
          btnConfirm: 'Potvrdiť'
        }
      },
      en: {
        'forall-right': {
          title: '∀R: Choose Eigenvariable',
          labelVariable: 'Variable name:',
          placeholder: 'e.g., y',
          btnCancel: 'Cancel',
          btnConfirm: 'Confirm'
        },
        'forall-left': {
          title: '∀L: Choose Instantiation Term',
          labelTerm: 'Term:',
          placeholder: 'e.g., x, c, f(x, y)',
          btnCancel: 'Cancel',
          btnConfirm: 'Confirm'
        },
        'exists-right': {
          title: '∃R: Choose Witness Term',
          labelTerm: 'Term:',
          placeholder: 'e.g., x, c, f(x, y)',
          btnCancel: 'Cancel',
          btnConfirm: 'Confirm'
        },
        'exists-left': {
          title: '∃L: Choose Eigenvariable',
          labelVariable: 'Variable name:',
          placeholder: 'e.g., y',
          btnCancel: 'Cancel',
          btnConfirm: 'Confirm'
        }
      }
    };

    const t = translations[this.currentLanguage][this.ruleType];
    this.title = t.title;
    this.labelVariable = 'labelVariable' in t ? t.labelVariable : '';
    this.labelTerm = 'labelTerm' in t ? t.labelTerm : '';
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
    
    const errorMessages = {
      sk: {
        empty: 'Vstup nemôže byť prázdny.',
        invalidVar: 'Názov premennej musí byť malými písmenami (napr., x, y, z).',
        notFresh: 'Premenná {var} nie je čerstvá: vyskytuje sa voľne v kontexte. Zvoľte iný názov premennej.',
        emptyTerm: 'Term nemôže byť prázdny.'
      },
      en: {
        empty: 'Input cannot be empty.',
        invalidVar: 'Variable name must be a lowercase identifier (e.g., x, y, z).',
        notFresh: 'Variable {var} is not fresh: it occurs free in the context. Please choose a different variable name.',
        emptyTerm: 'Term cannot be empty.'
      }
    };

    const errors = errorMessages[this.currentLanguage];

    if (!this.inputValue.trim()) {
      this.errorMessage = errors.empty;
      return false;
    }

    if (this.isVariableInput) {
      // Validate variable name: must be a valid identifier
      const varMatch = this.inputValue.trim().match(/^[a-z][a-zA-Z0-9_]*$/);
      if (!varMatch) {
        this.errorMessage = errors.invalidVar;
        return false;
      }
      
      // Validate freshness: variable must not be in freeVars
      const inputVar = this.inputValue.trim();
      if (this.freeVars.includes(inputVar)) {
        this.errorMessage = errors.notFresh.replace('{var}', inputVar);
        return false;
      }
    } else {
      // Validate term: basic check (will be fully validated by parser)
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

