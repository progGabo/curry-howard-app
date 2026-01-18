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
  editorOptions = {
    theme: 'vs-dark', 
    language: 'plaintext',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    fontSize: 14,
    lineHeight: 19
  };

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

  private updatePlaceholder() {
    if (this.presetCode) {
      this.code = this.presetCode;
      this.editorOptions = {
        theme: 'vs-dark', 
        language: 'plaintext',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        fontSize: 14,
        lineHeight: 19
      };
      return;
    }
    if (this.conversionMode === 'expression-to-lambda') {
      this.code = 'p => q => p && q';
      this.editorOptions = {
        theme: 'vs-dark', 
        language: 'plaintext',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        fontSize: 14,
        lineHeight: 19
      };
    } else {
      this.code = 'λx:Bool. λy:Bool. x';
      this.editorOptions = {
        theme: 'vs-dark', 
        language: 'plaintext',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        fontSize: 14,
        lineHeight: 19
      };
    }
  }

  onCodeChange(code: string) {
    this.formulaEntered.emit(code);
  }
}
