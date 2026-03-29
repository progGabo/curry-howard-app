import { Injectable } from "@angular/core";
import { LogicLexer } from "../antlr/logic/LogicLexer";
import { LogicParser } from "../antlr/logic/LogicParser";
import { CommonTokenStream, CharStream } from "antlr4ng";
import { FormulaNode, SequentNode } from "../models/formula-node";
import { LogicAstVisitor } from "../antlr/logic/LogicAstVisitor";

interface TypedQuantifierDomain {
  kind: 'forall' | 'exists';
  variable: string;
  rawDomain: string;
}

@Injectable({ providedIn: 'root' })
export class LogicParserService {
  parseFormula(formula: string): SequentNode {
    const prepared = this.prepareInput(formula);
    const stripped = this.stripTypedQuantifierDomains(prepared);

    const domainQueue = stripped.domains
      .map((entry) => {
        const parsed = this.parseStandaloneFormula(entry.rawDomain);
        return parsed ? { kind: entry.kind, variable: entry.variable, domain: parsed } : null;
      })
      .filter((entry): entry is { kind: 'forall' | 'exists'; variable: string; domain: FormulaNode } => entry !== null);

    const input = stripped.input;
    const inputStream = CharStream.fromString(input);
    const lexer = new LogicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new LogicParser(tokenStream);

    const tree = parser.sequent();
    const visitor = new LogicAstVisitor();
    const parsed = visitor.visit(tree) as SequentNode;

    if (domainQueue.length > 0) {
      this.attachTypedDomains(parsed, domainQueue);
    }

    return parsed;
  }

  prepareInput(input: string): string {
    let trimmed = input.trim().normalize('NFKC');

    trimmed = trimmed
      .replace(/∀\s*/g, 'forall ')  // ∀x / ∀ x → forall x
      .replace(/∃\s*/g, 'exists ')  // ∃x / ∃ x → exists x
      .replace(/∶/g, ':')           // ratio colon variant → :
      .replace(/[⊢├]/g, '|-')   // ⊢ / ├ → |-
      .replace(/[⇒→⟹⟶]/g, '=>') // implication variants → =>
      .replace(/[∧⋀]/g, '&&')    // conjunction variants → &&
      .replace(/[∨⋁]/g, '||')    // disjunction variants → ||
      .replace(/[¬∼~]/g, '!');   // negation variants → !

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

  private stripTypedQuantifierDomains(input: string): { input: string; domains: TypedQuantifierDomain[] } {
    let output = input;
    let cursor = 0;
    const domains: TypedQuantifierDomain[] = [];

    while (cursor < output.length) {
      const found = this.findTypedQuantifierDomain(output, cursor);
      if (!found) {
        break;
      }

      domains.push({
        kind: found.kind,
        variable: found.variable,
        rawDomain: found.rawDomain
      });

      output = `${output.slice(0, found.start)}${found.replacement}${output.slice(found.end)}`;
      cursor = found.start + found.replacement.length;
    }

    return { input: output, domains };
  }

  private findTypedQuantifierDomain(input: string, from: number):
    { start: number; end: number; replacement: string; kind: 'forall' | 'exists'; variable: string; rawDomain: string } | null {
    for (let i = from; i < input.length; i++) {
      const quantifier = this.matchQuantifierAt(input, i);
      if (!quantifier) continue;

      let cursor = i + quantifier.length;
      while (cursor < input.length && input[cursor] === ' ') cursor += 1;

      const varMatch = /^[a-z][a-zA-Z0-9_]*/.exec(input.slice(cursor));
      if (!varMatch) continue;

      const variable = varMatch[0];
      cursor += variable.length;

      while (cursor < input.length && input[cursor] === ' ') cursor += 1;
      if (input[cursor] !== ':') continue;
      cursor += 1;

      const domainStart = cursor;
      let depth = 0;
      while (cursor < input.length) {
        const ch = input[cursor];
        if (ch === '(') {
          depth += 1;
        } else if (ch === ')') {
          if (depth === 0) break;
          depth -= 1;
        } else if (ch === '.' && depth === 0) {
          break;
        }
        cursor += 1;
      }

      if (cursor >= input.length || input[cursor] !== '.') continue;
      const rawDomain = input.slice(domainStart, cursor).trim();
      if (!rawDomain) continue;

      const replacement = `${quantifier} ${variable}`;
      return {
        start: i,
        end: cursor,
        replacement,
        kind: quantifier,
        variable,
        rawDomain
      };
    }

    return null;
  }

  private matchQuantifierAt(input: string, index: number): 'forall' | 'exists' | null {
    const isWordBoundaryBefore = index === 0 || !/[A-Za-z0-9_]/.test(input[index - 1]);
    if (!isWordBoundaryBefore) return null;

    if (input.startsWith('forall', index)) {
      const end = index + 'forall'.length;
      const isWordBoundaryAfter = end >= input.length || !/[A-Za-z0-9_]/.test(input[end]);
      return isWordBoundaryAfter ? 'forall' : null;
    }

    if (input.startsWith('exists', index)) {
      const end = index + 'exists'.length;
      const isWordBoundaryAfter = end >= input.length || !/[A-Za-z0-9_]/.test(input[end]);
      return isWordBoundaryAfter ? 'exists' : null;
    }

    return null;
  }

  private parseStandaloneFormula(input: string): FormulaNode | null {
    try {
      const parsed = this.parseFormula(input);
      if (parsed.conclusions.length === 1) {
        return parsed.conclusions[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  private attachTypedDomains(
    sequent: SequentNode,
    domains: Array<{ kind: 'forall' | 'exists'; variable: string; domain: FormulaNode }>
  ): void {
    let idx = 0;

    const visit = (formula: FormulaNode): void => {
      if (idx < domains.length) {
        const next = domains[idx];
        if (formula.kind === 'Forall' && next.kind === 'forall' && formula.variable === next.variable) {
          formula.domain = next.domain;
          idx += 1;
        } else if (formula.kind === 'Exists' && next.kind === 'exists' && formula.variable === next.variable) {
          formula.domain = next.domain;
          idx += 1;
        }
      }

      switch (formula.kind) {
        case 'Implies':
        case 'And':
        case 'Or':
          visit(formula.left);
          visit(formula.right);
          break;
        case 'Not':
        case 'Paren':
          visit(formula.inner);
          break;
        case 'Forall':
        case 'Exists':
          if (formula.domain) {
            visit(formula.domain);
          }
          visit(formula.body);
          break;
        default:
          break;
      }
    };

    for (const formula of sequent.assumptions) {
      visit(formula);
    }
    for (const formula of sequent.conclusions) {
      visit(formula);
    }
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