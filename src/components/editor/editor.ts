import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-editor',
  standalone: false,
  templateUrl: './editor.html',
  styleUrl: './editor.scss'
})
export class Editor implements OnChanges {
  @Input() conversionMode: 'expression-to-lambda' | 'lambda-to-expression' = 'expression-to-lambda';
  @Input() presetCode: string | null = null;
  @Output() formulaEntered = new EventEmitter<string>();

  code: string = '';
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
      if (this.presetCode !== null && this.presetCode !== undefined) {
        this.code = this.presetCode;
      }
    }
    if (changes['conversionMode']) {
      this.updatePlaceholder();
    }
  }

  private buildEditorOptions() {
    const lineHeight = Math.round(this.fontSize * 1.35);
    return {
      theme: 'vs',
      language: 'plaintext',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      fontSize: this.fontSize,
      lineHeight
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
    if (this.presetCode) {
      this.code = this.presetCode;
    } else if (this.conversionMode === 'expression-to-lambda') {
      this.code = 'p => q => p && q';
    } else {
      this.code = 'λx:Bool. λy:Bool. x';
    }
    this.editorOptions = { ...this.buildEditorOptions() };
  }

  onCodeChange(code: string) {
    this.formulaEntered.emit(code);
  }
}
