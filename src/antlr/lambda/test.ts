import { CharStream, CommonTokenStream } from "antlr4ng";
import { ParseTree } from "antlr4ng";

// importy z vygenerovaných súborov
import { LambdaParser } from "./LambdaParser";
import { LambdaLexer } from "./LambdaLexer";

// Test runner class
class Main {
  static testInputs: string[] = [
    // identity
    "λx: Bool. x",

    // double abstraction
    "λx: Bool. λy: Bool. x",

    // application
    "(λx: Bool. x) true",

    // let binding
    "let x = true in x",

    // pair and projection
    "λp: (Bool × Bool). let [a,b] = p in a",

    // sum with case
    "λa: (Bool + Bool). case a of inl x: Bool => x | inr y: Bool => y",

    // natural numbers
    "succ (pred 0)",

    // nested arrow types
    "λf: (Bool -> Bool). f true"
  ];

  static run() {
    for (const input of Main.testInputs) {
      console.log("=========================================");
      console.log("Input: ", input);

      try {
        const chars = CharStream.fromString(input);
        const lexer = new LambdaLexer(chars);
        const tokens = new CommonTokenStream(lexer);
        const parser = new LambdaParser(tokens);

        // začíname od pravidla 'program'
        const tree: ParseTree = parser.program();

        // ANTLR má vstavaný toStringTree
        console.log("Parse tree: ", tree.toStringTree(parser));

        // ak parser hodil chyby, nájdu sa v parser.errors
        if (parser.numberOfSyntaxErrors > 0) {
          console.error("❌ Syntax errors detected!");
        } else {
          console.log("✅ Parsed successfully");
        }
      } catch (err) {
        console.error("❌ Exception while parsing: ", err);
      }
    }
  }
}

export { Main };
