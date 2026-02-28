import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as katex from 'katex';

@Directive({
  selector: '[appKatex]',
  standalone: true
})
export class KatexDirective implements OnInit, OnChanges {
  @Input() appKatex: string = '';

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.renderKatex();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appKatex']) {
      this.renderKatex();
    }
  }

  private renderKatex() {
    this.el.nativeElement.innerHTML = '';
    if (this.appKatex) {
      try {
        const normalizedFormula = this.normalizeFormula(this.appKatex);
        katex.render(normalizedFormula, this.el.nativeElement, {
          throwOnError: false,
          displayMode: true,
          trust: true,
          output: 'htmlAndMathml'
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        this.el.nativeElement.textContent = this.appKatex;
      }
      return;
    }
    this.el.nativeElement.textContent = '';
  }

  private normalizeFormula(formula: string): string {
    const withDisplayFractions = formula.replace(/\\frac/g, '\\dfrac');
    if (/\\displaystyle/.test(withDisplayFractions)) {
      return withDisplayFractions;
    }
    return `\\displaystyle ${withDisplayFractions}`;
  }
}
