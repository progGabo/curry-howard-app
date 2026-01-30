import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTranslations } from '../../services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss'
})
export class AppHeaderComponent {
  @Input() conversionMode: 'expression-to-lambda' | 'lambda-to-expression' = 'expression-to-lambda';
  @Input() mode: 'auto' | 'interactive' = 'auto';
  @Input() interactiveSubmode: 'applicable' | 'all' | 'predict' = 'all';
  @Input() isPredicateLogic = false;
  @Input() canStepBack = false;
  @Input() currentLanguage: 'sk' | 'en' = 'sk';
  @Input() t!: AppTranslations;

  @Output() conversionModeChange = new EventEmitter<'expression-to-lambda' | 'lambda-to-expression'>();
  @Output() modeChange = new EventEmitter<'auto' | 'interactive'>();
  @Output() submodeChange = new EventEmitter<'applicable' | 'all' | 'predict'>();
  @Output() stepBack = new EventEmitter<void>();
  @Output() helpClick = new EventEmitter<void>();
  @Output() languageChange = new EventEmitter<'sk' | 'en'>();

  onConversionMode(m: 'expression-to-lambda' | 'lambda-to-expression'): void {
    this.conversionModeChange.emit(m);
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
    return this.isPredicateLogic && this.conversionMode === 'expression-to-lambda';
  }

  get autoModeTitle(): string {
    return this.autoModeDisabled
      ? this.currentLanguage === 'sk'
        ? 'Auto mód nie je dostupný pre predikátovú logiku'
        : 'Auto mode is not available for predicate logic'
      : '';
  }
}
