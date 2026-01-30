import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { AppTranslations } from '../../services/i18n.service';

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

  onBackdropClick(): void {
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onDialogClick(event: Event): void {
    event.stopPropagation();
  }
}
