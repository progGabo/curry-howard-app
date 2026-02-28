export interface ShortcutApplyResult {
  text: string;
  cursor: number;
  changed: boolean;
}

const SYMBOL_SHORTCUTS: Record<string, string> = {
  '\\impl': '⇒',
  '\\to': '⇒',
  '\\and': '∧',
  '\\or': '∨',
  '\\not': '¬',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\turnstile': '⊢',
  '\\vdash': '⊢',
  '\\lambda': 'λ'
};

export function applySymbolShortcut(text: string, cursor: number): ShortcutApplyResult {
  const boundedCursor = Math.max(0, Math.min(cursor, text.length));
  const textBeforeCursor = text.slice(0, boundedCursor);
  const match = textBeforeCursor.match(/\\[a-zA-Z]+$/);

  if (!match) {
    return { text, cursor: boundedCursor, changed: false };
  }

  const shortcut = match[0].toLowerCase();
  const symbol = SYMBOL_SHORTCUTS[shortcut];
  if (!symbol) {
    return { text, cursor: boundedCursor, changed: false };
  }

  const startIndex = boundedCursor - match[0].length;
  const nextText = `${text.slice(0, startIndex)}${symbol}${text.slice(boundedCursor)}`;
  const nextCursor = startIndex + symbol.length;

  return {
    text: nextText,
    cursor: nextCursor,
    changed: true
  };
}
