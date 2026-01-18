import { Injectable } from "@angular/core";
import { PredicateLogicLexer } from "../antlr/logic/PredicateLogicLexer";
import { PredicateLogicParser } from "../antlr/logic/PredicateLogicParser";
import { CommonTokenStream, CharStream } from "antlr4ng";
import { SequentNode } from "../models/formula-node";
import { PredicateLogicAstVisitor } from "../antlr/logic/PredicateLogicAstVisitor";

@Injectable({ providedIn: 'root' })
export class LogicParserService {
  parseFormula(formula: string): SequentNode {
    const input = this.prepareInput(formula);
    const inputStream = CharStream.fromString(input);
    const lexer = new PredicateLogicLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new PredicateLogicParser(tokenStream);

    const tree = parser.sequent();
    const visitor = new PredicateLogicAstVisitor();
    return visitor.visit(tree);
  }

  prepareInput(input: string): string {
    let trimmed = input.trim();

    // Normalize Unicode symbols to ASCII equivalents for parsing
    // The lexer should handle both, but Unicode can cause encoding issues
    trimmed = trimmed
      .replace(/∀/g, 'forall')  // ∀ → forall
      .replace(/∃/g, 'exists')  // ∃ → exists
      .replace(/⊢/g, '|-')      // ⊢ → |-
      .replace(/→/g, '=>')      // → => =>
      .replace(/∧/g, '&&')       // ∧ → &&
      .replace(/∨/g, '||')       // ∨ → ||
      .replace(/¬/g, '!');        // ¬ → !

    const isSequent = trimmed.includes('|-');
    const preparedInput = isSequent ? trimmed : `|- ${trimmed}`;
    return preparedInput;
  }
}