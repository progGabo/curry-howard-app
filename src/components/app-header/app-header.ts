import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTranslations } from '../../services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss'
})
export class AppHeaderComponent {
  @Input() headerOption: 'ch-expression-to-lambda' | 'ch-lambda-to-expression' | 'proofs-sequent' | 'proofs-natural-deduction' = 'ch-expression-to-lambda';
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() isPredicateLogic = false;
  @Input() canStepBack = false;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Input() t!: AppTranslations;

  @Output() headerOptionChange = new EventEmitter<'ch-expression-to-lambda' | 'ch-lambda-to-expression' | 'proofs-sequent' | 'proofs-natural-deduction'>();
  @Output() modeChange = new EventEmitter<'auto' | 'interactive'>();
  @Output() submodeChange = new EventEmitter<'applicable' | 'all' | 'predict'>();
  @Output() stepBack = new EventEmitter<void>();
  @Output() helpClick = new EventEmitter<void>();
  @Output() languageChange = new EventEmitter<'sk' | 'en'>();

  get currentSection(): 'curry-howard' | 'proofs' {
    return this.headerOption.startsWith('proofs') ? 'proofs' : 'curry-howard';
  }

  onHeaderSection(section: 'curry-howard' | 'proofs'): void {
    if (section === 'curry-howard') {
      const nextOption: 'ch-expression-to-lambda' | 'ch-lambda-to-expression' =
        this.headerOption === 'ch-lambda-to-expression' ? 'ch-lambda-to-expression' : 'ch-expression-to-lambda';
      this.headerOptionChange.emit(nextOption);
      return;
    }

    const nextOption: 'proofs-sequent' | 'proofs-natural-deduction' =
      this.headerOption === 'proofs-natural-deduction' ? 'proofs-natural-deduction' : 'proofs-sequent';
    this.headerOptionChange.emit(nextOption);
  }

  onHeaderOption(option: 'ch-expression-to-lambda' | 'ch-lambda-to-expression' | 'proofs-sequent' | 'proofs-natural-deduction'): void {
    this.headerOptionChange.emit(option);
  }

  onModeAuto(): void {
    this.modeChange.emit('auto');
  }

  onModeInteractive(): void {
    this.modeChange.emit('interactive');
  }

  onSubmodeChange(value: string): void {
    this.submodeChange.emit(value as 'applicable' | 'all' | 'predict');
  }

  onStepBack(): void {
    this.stepBack.emit();
  }

  onHelpClick(): void {
    this.helpClick.emit();
  }

  onLanguage(lang: 'sk' | 'en'): void {
    this.languageChange.emit(lang);
  }

  get autoModeDisabled(): boolean {
    return this.isPredicateLogic && this.headerOption !== 'ch-lambda-to-expression';
  }

  get autoModeTitle(): string {
    return this.autoModeDisabled
      ? this.currentLanguage === 'sk'
        ? 'Auto mód nie je dostupný pre predikátovú logiku'
        : 'Auto mode is not available for predicate logic'
      : '';
  }
}
