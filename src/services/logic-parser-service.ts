import { Injectable } from "@angular/core";
import { LogicLexer } from "../antlr/logic/LogicLexer";
import { LogicParser } from "../antlr/logic/LogicParser";
import { CommonTokenStream, CharStream } from "antlr4ng";
import { SequentNode } from "../models/formula-node";
import { LogicAstVisitor } from "../antlr/logic/LogicAstVisitor";

@Injectable({ providedIn: 'root' })
export class LogicParserService {
  parseFormula(formula: string): SequentNode {
    const input = this.prepareInput(formula);
    const inputStream = CharStream.fromString(input);
    const lexer = new LogicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new LogicParser(tokenStream);

    const tree = parser.sequent();
    const visitor = new LogicAstVisitor();
    return visitor.visit(tree);
  }

  prepareInput(input: string): string {
    let trimmed = input.trim().normalize('NFKC');

    // Normalize Unicode symbols to ASCII equivalents for parsing
    // The lexer should handle both, but Unicode can cause encoding issues
    trimmed = trimmed
      .replace(/∀\s*/g, 'forall ')  // ∀x / ∀ x → forall x
      .replace(/∃\s*/g, 'exists ')  // ∃x / ∃ x → exists x
      .replace(/[⊢├]/g, '|-')   // ⊢ / ├ → |-
      .replace(/[⇒→⟹⟶]/g, '=>') // implication variants → =>
      .replace(/[∧⋀]/g, '&&')    // conjunction variants → &&
      .replace(/[∨⋁]/g, '||')    // disjunction variants → ||
      .replace(/[¬∼~]/g, '!');   // negation variants → !

    // Normalize quantifier binder punctuation:
    // allow user input like "exists x P(x)" by inserting the missing dot.
    trimmed = trimmed
      .replace(/\s*\.\s*/g, '. ')
      .replace(/\b(forall|exists)\s+([a-z][a-zA-Z0-9_]*)\s+(?=(?:!|\(|[A-Za-z]))/gi, '$1 $2. ');

    trimmed = trimmed.replace(/\s+/g, ' ').trim();
    trimmed = this.parenthesizeQuantifierAfterNegation(trimmed);
    trimmed = this.parenthesizeQuantifierAfterImplication(trimmed);

    const isSequent = trimmed.includes('|-');
    const preparedInput = isSequent ? trimmed : `|- ${trimmed}`;
    return preparedInput;
  }

  private parenthesizeQuantifierAfterImplication(input: string): string {
    let output = input;
    let cursor = 0;

    while (cursor < output.length) {
      const implicationIndex = output.indexOf('=>', cursor);
      if (implicationIndex === -1) break;

      let quantifierStart = implicationIndex + 2;
      while (quantifierStart < output.length && output[quantifierStart] === ' ') {
        quantifierStart += 1;
      }

      const tail = output.slice(quantifierStart);
      const quantifierMatch = /^(forall|exists)\b/i.exec(tail);
      if (!quantifierMatch) {
        cursor = implicationIndex + 2;
        continue;
      }

      const baseDepth = this.parenthesisDepthAt(output, quantifierStart);
      const end = this.findQuantifiedSegmentEnd(output, quantifierStart, baseDepth);

      output = `${output.slice(0, quantifierStart)}(${output.slice(quantifierStart, end)})${output.slice(end)}`;
      cursor = end + 2;
    }

    return output;
  }

  private parenthesizeQuantifierAfterNegation(input: string): string {
    let output = input;
    let cursor = 0;

    while (cursor < output.length) {
      const notIndex = output.indexOf('!', cursor);
      if (notIndex === -1) break;

      let quantifierStart = notIndex + 1;
      while (quantifierStart < output.length && output[quantifierStart] === ' ') {
        quantifierStart += 1;
      }

      const tail = output.slice(quantifierStart);
      const quantifierMatch = /^(forall|exists)\b/i.exec(tail);
      if (!quantifierMatch) {
        cursor = notIndex + 1;
        continue;
      }

      const baseDepth = this.parenthesisDepthAt(output, quantifierStart);
      const end = this.findQuantifiedSegmentEndForNegation(output, quantifierStart, baseDepth);
      output = `${output.slice(0, quantifierStart)}(${output.slice(quantifierStart, end)})${output.slice(end)}`;
      cursor = end + 2;
    }

    return output;
  }

  private parenthesisDepthAt(input: string, index: number): number {
    let depth = 0;
    for (let i = 0; i < index; i++) {
      if (input[i] === '(') depth += 1;
      else if (input[i] === ')') depth -= 1;
    }
    return depth;
  }

  private findQuantifiedSegmentEnd(input: string, start: number, baseDepth: number): number {
    let depth = baseDepth;

    for (let i = start; i < input.length; i++) {
      const char = input[i];
      if (char === '(') {
        depth += 1;
        continue;
      }

      if (char === ')') {
        if (depth === baseDepth) {
          return i;
        }
        depth -= 1;
        continue;
      }

      if (depth === baseDepth) {
        if (char === ',' || input.startsWith('|-', i)) {
          return i;
        }
      }
    }

    return input.length;
  }

  private findQuantifiedSegmentEndForNegation(input: string, start: number, baseDepth: number): number {
    let depth = baseDepth;

    for (let i = start; i < input.length; i++) {
      const char = input[i];
      if (char === '(') {
        depth += 1;
        continue;
      }

      if (char === ')') {
        if (depth === baseDepth) {
          return i;
        }
        depth -= 1;
        continue;
      }

      if (depth === baseDepth) {
        if (
          char === ',' ||
          input.startsWith('|-', i) ||
          input.startsWith('=>', i) ||
          input.startsWith('&&', i) ||
          input.startsWith('||', i)
        ) {
          return i;
        }
      }
    }

    return input.length;
  }
}