import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import type * as monaco from 'monaco-editor';

@Component({
  selector: 'app-editor',
  standalone: false,
  templateUrl: './editor.html',
  styleUrl: './editor.scss'
})
export class Editor implements OnChanges {
  @Input() conversionMode: 'expression-to-lambda' | 'lambda-to-expression' | 'natural-deduction' = 'expression-to-lambda';
  @Input() presetCode: string | null = null;
  @Output() formulaEntered = new EventEmitter<string>();

  code: string = '';
  private editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
  private applyingShortcut = false;
  private readonly symbolShortcuts: Record<string, string> = {
    '\\impl': '⇒',
    '\\and': '∧',
    '\\or': '∨',
    '\\not': '¬',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\turnstile': '⊢',
    '\\vdash': '⊢',
    '\\lambda': 'λ'
  };
  fontSize: number = 16;
  fontSizeStep = 2;
  minFontSize = 8;
  maxFontSize = 24;
  editorOptions = this.buildEditorOptions();

  constructor() {
    this.updatePlaceholder();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['presetCode']) {
      const incomingCode = this.presetCode ?? '';
      if (incomingCode !== this.code) {
        this.code = incomingCode;
      }
    }
    if (changes['conversionMode']) {
      this.updatePlaceholder();
    }
  }

  private buildEditorOptions() {
    const lineHeight = Math.round(this.fontSize * 1.35);
    const placeholder = this.conversionMode === 'lambda-to-expression'
      ? 'λx:Bool. λy:Bool. x'
      : 'p ⇒ q ⇒ p ∧ q';
    return {
      theme: 'vs',
      language: 'plaintext',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      fontSize: this.fontSize,
      lineHeight,
      placeholder: placeholder
    };
  }

  onFontSizeChange() {
    this.editorOptions = { ...this.buildEditorOptions() };
  }

  fontSizeDown() {
    if (this.fontSize > this.minFontSize) {
      this.fontSize = Math.max(this.minFontSize, this.fontSize - this.fontSizeStep);
      this.onFontSizeChange();
    }
  }

  fontSizeUp() {
    if (this.fontSize < this.maxFontSize) {
      this.fontSize = Math.min(this.maxFontSize, this.fontSize + this.fontSizeStep);
      this.onFontSizeChange();
    }
  }

  private updatePlaceholder() {
    // Only set code if there's a presetCode
    if (this.presetCode) {
      this.code = this.presetCode;
    } else {
      // Keep code empty - placeholder will be shown in editorOptions
      this.code = '';
    }
    this.editorOptions = { ...this.buildEditorOptions() };
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorInstance = editor;
    editor.onDidChangeModelContent(() => {
      this.applyTypingShortcut();
    });
  }

  private applyTypingShortcut() {
    if (this.applyingShortcut || !this.editorInstance) {
      return;
    }

    const model = this.editorInstance.getModel();
    const position = this.editorInstance.getPosition();
    if (!model || !position) {
      return;
    }

    const cursorOffset = model.getOffsetAt(position);
    const textBeforeCursor = model.getValue().slice(0, cursorOffset);
    const match = textBeforeCursor.match(/\\[a-zA-Z]+$/);
    if (!match) {
      return;
    }

    const typedShortcut = match[0].toLowerCase();
    const symbol = this.symbolShortcuts[typedShortcut];
    if (!symbol) {
      return;
    }

    const startOffset = cursorOffset - match[0].length;
    const startPosition = model.getPositionAt(startOffset);

    this.applyingShortcut = true;
    this.editorInstance.executeEdits('symbol-shortcut', [
      {
        range: {
          startLineNumber: startPosition.lineNumber,
          startColumn: startPosition.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: symbol,
        forceMoveMarkers: true
      }
    ]);
    this.applyingShortcut = false;

    this.code = model.getValue();
    this.formulaEntered.emit(this.code);
  }

  onCodeChange(code: string) {
    this.formulaEntered.emit(code);
  }
}
