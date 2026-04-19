import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ShowErrorOptions {
  summary?: string;
  life?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showError(message: string, options?: ShowErrorOptions): void {
    this.messageService.add({
      severity: 'error',
      summary: options?.summary ?? 'Error',
      detail: message,
      life: options?.life ?? 7000
    });
  }
}
