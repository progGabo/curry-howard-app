import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ShowErrorOptions {
  summary?: string;
  life?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}

  /**
   * Show an error toast. Components typically get the message from I18nService
   * and pass it here.
   */
  showError(message: string, options?: ShowErrorOptions): void {
    this.messageService.add({
      severity: 'error',
      summary: options?.summary ?? 'Error',
      detail: message,
      life: options?.life ?? 7000
    });
  }
}
