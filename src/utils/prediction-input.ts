import { applySymbolShortcut } from './symbol-shortcuts';

export function applyPredictionShortcut(event: Event): string {
  const target = event.target as HTMLInputElement;
  const cursor = target.selectionStart ?? target.value.length;
  const transformed = applySymbolShortcut(target.value, cursor);

  if (transformed.changed) {
    target.value = transformed.text;
    queueMicrotask(() => {
      target.setSelectionRange(transformed.cursor, transformed.cursor);
    });
  }

  return transformed.text;
}

export function isEscapeCancel(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}