import { Injectable } from '@angular/core';
import { CharStream, CommonTokenStream, ParseTreeVisitor } from 'antlr4ng';
import { LambdaLexer } from '../antlr/lambda/LambdaLexer';
import { LambdaParser } from '../antlr/lambda/LambdaParser';
import { AstBuilder } from '../antlr/lambda/LambdaVisitorAst';
import { ExprNode } from '../models/lambda-node';

class LambdaVisitorWrapper implements ParseTreeVisitor<unknown> {
  private astBuilder = new AstBuilder();

  visitProgram(ctx: any): unknown {
    return this.astBuilder.visitProgram(ctx);
  }

  visitTerm(ctx: any): unknown {
    return this.astBuilder.visitTerm(ctx);
  }

  visitLamExpr(ctx: any): unknown {
    return this.astBuilder.visitLamExpr(ctx);
  }

  visitLetExpr(ctx: any): unknown {
    return this.astBuilder.visitLetExpr(ctx);
  }

  visitLetPairExpr(ctx: any): unknown {
    return this.astBuilder.visitLetPairExpr(ctx);
  }

  visitIfExpr(ctx: any): unknown {
    return this.astBuilder.visitIfExpr(ctx);
  }

  visitCaseExpr(ctx: any): unknown {
    return this.astBuilder.visitCaseExpr(ctx);
  }

  visitAppExpr(ctx: any): unknown {
    if (!ctx) {
      throw new Error("Cannot visit null AppExpr context");
    }
    return this.astBuilder.visitAppExpr(ctx);
  }

  visitAtom(ctx: any): unknown {
    if (!ctx) {
      throw new Error("Cannot visit null atom context");
    }
    return this.astBuilder.visitAtom(ctx);
  }

  visitType(ctx: any): unknown {
    return this.astBuilder.visitType(ctx);
  }

  visitSumType(ctx: any): unknown {
    return this.astBuilder.visitSumType(ctx);
  }

  visitProdType(ctx: any): unknown {
    return this.astBuilder.visitProdType(ctx);
  }

  visitAtomicType(ctx: any): unknown {
    return this.astBuilder.visitAtomicType(ctx);
  }

  visitPredicateType(ctx: any): unknown {
    return this.astBuilder.visitPredicateType(ctx);
  }

  visitTypeList(ctx: any): unknown {
    return this.astBuilder.visitTypeList(ctx);
  }

  // Required by ParseTreeVisitor interface
  visitChildren(ctx: any): unknown {
    return this.astBuilder.visitChildren(ctx);
  }

  visitTerminal(ctx: any): unknown {
    return this.astBuilder.visitTerminal(ctx);
  }

  visitErrorNode(ctx: any): unknown {
    return this.astBuilder.visitErrorNode(ctx);
  }

  // Required by ParseTreeVisitor interface
  visit(ctx: any): unknown {
    return this.astBuilder.visit(ctx);
  }
}

@Injectable({ providedIn: 'root' })
export class LambdaParserService {
  
  parseLambdaExpression(lambdaCode: string): ExprNode {
    try {
      if (!lambdaCode || lambdaCode.trim().length === 0) {
        throw new Error("Lambda expression cannot be empty");
      }
      
      // Normalize Unicode symbols to ASCII so the lexer recognizes them
      let processedCode = lambdaCode
        .replace(/\u03BB/g, '\\')   // λ (Greek lambda) -> \
        .replace(/\u2192/g, '->')   // → -> ->
        .replace(/\u21D4/g, '=>')   // ⇒ -> =>
        .replace(/\u00D7/g, '*')   // × -> *
        .replace(/\u2295/g, '+')   // ⊕ -> +
        .replace(/\u27E8/g, '<')   // ⟨ -> <
        .replace(/\u27E9/g, '>');  // ⟩ -> >
      // Convert <x, y> to (x, y) only when there are no type annotations ( : )
      // Otherwise keep angle brackets so grammar parses LANGLE term COLON type COMMA term RANGLE
      processedCode = processedCode.replace(/<([^<>]+),([^<>]+)>/g, (_match, g1, g2) =>
        (g1.includes(' : ') || g2.includes(' : ')) ? `<${g1},${g2}>` : `(${g1},${g2})`
      );
      
      const inputStream = CharStream.fromString(processedCode);
      const lexer = new LambdaLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new LambdaParser(tokenStream);
      
      // Enable better error reporting
      parser.removeErrorListeners();
      parser.addErrorListener({
        syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
          throw new Error(`Syntax error at line ${line}:${charPositionInLine} - ${msg}`);
        },
        reportAmbiguity: (recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) => {
          // Optional: can be left empty or log if needed
        },
        reportAttemptingFullContext: (recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) => {
          // Optional: can be left empty or log if needed
        },
        reportContextSensitivity: (recognizer, dfa, startIndex, stopIndex, prediction, configs) => {
          // Optional: can be left empty or log if needed
        }
      });
      
      const tree = parser.program();
      if (!tree) {
        throw new Error("Parser returned null tree");
      }
      
      const visitor = new LambdaVisitorWrapper();
      const result = visitor.visitProgram(tree) as ExprNode;
      
      if (!result) {
        throw new Error("Visitor returned null result");
      }
      
      return result;
    } catch (error: any) {
      console.error('Error parsing lambda expression:', error);
      const errorMessage = error?.message || String(error);
      throw new Error(`Failed to parse lambda expression: ${errorMessage}`);
    }
  }

  formatLambdaExpression(expr: ExprNode): string {
    return this.formatExpr(expr);
  }

  private formatExpr(expr: ExprNode): string {
    switch (expr.kind) {
      case 'Var':
        return expr.name;
      
      case 'Abs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      
      case 'App':
        const fnStr = this.formatExpr(expr.fn);
        const argStr = this.formatExpr(expr.arg);
        // Add parentheses if needed for precedence
        const needsParens = expr.arg.kind === 'Abs' || expr.arg.kind === 'DependentAbs' || expr.arg.kind === 'App';
        return `${fnStr} ${needsParens ? `(${argStr})` : argStr}`;
      
      case 'Let':
        return `let ${expr.name} = ${this.formatExpr(expr.value)} in ${this.formatExpr(expr.inExpr)}`;
      
      case 'LetPair':
        return `let [${expr.x}, ${expr.y}] = ${this.formatExpr(expr.pair)} in ${this.formatExpr(expr.inExpr)}`;
      
      case 'Pair':
        return `(${this.formatExpr(expr.left)}, ${this.formatExpr(expr.right)})`;
      
      case 'Inl':
        return `inl ${this.formatExpr(expr.expr)} as ${this.formatType(expr.asType)}`;
      
      case 'Inr':
        return `inr ${this.formatExpr(expr.expr)} as ${this.formatType(expr.asType)}`;
      
      case 'Case':
        return `case ${this.formatExpr(expr.expr)} of inl ${expr.leftVar}:${this.formatType(expr.leftType)} => ${this.formatExpr(expr.leftBranch)} | inr ${expr.rightVar}:${this.formatType(expr.rightType)} => ${this.formatExpr(expr.rightBranch)}`;
      
      case 'If':
        return `if ${this.formatExpr(expr.cond)} then ${this.formatExpr(expr.thenBranch)} else ${this.formatExpr(expr.elseBranch)}`;
      
      case 'True':
        return 'true';
      
      case 'False':
        return 'false';
      
      case 'Zero':
        return '0';
      
      case 'Succ':
        return `succ ${this.formatExpr(expr.expr)}`;
      
      case 'Pred':
        return `pred ${this.formatExpr(expr.expr)}`;
      
      case 'IsZero':
        return `iszero ${this.formatExpr(expr.expr)}`;
      
      case 'DependentAbs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      
      case 'DependentPair':
        return `⟨${this.formatExpr(expr.witness)}, ${this.formatExpr(expr.proof)}⟩`;
      
      case 'LetDependentPair':
        return `let (${expr.x}: ${this.formatType(expr.xType)}) = ${this.formatExpr(expr.pair)} in ${this.formatExpr(expr.inExpr)}`;
      
      default:
        return `[${(expr as any).kind}]`;
    }
  }

  private formatType(type: any): string {
    switch (type.kind) {
      case 'TypeVar':
        return type.name;
      case 'Bool':
        return 'Bool';
      case 'Nat':
        return 'Nat';
      case 'Func':
        return `${this.formatType(type.from)} -> ${this.formatType(type.to)}`;
      case 'Prod':
        return `${this.formatType(type.left)} * ${this.formatType(type.right)}`;
      case 'Sum':
        return `${this.formatType(type.left)} + ${this.formatType(type.right)}`;
      case 'PredicateType':
        const args = type.argTypes.map((t: any) => this.formatType(t)).join(', ');
        return `${type.name}(${args})`;
      case 'DependentFunc':
        return `(${type.param}: ${this.formatType(type.paramType)}) -> ${this.formatType(type.bodyType)}`;
      case 'DependentProd':
        return `(${type.param}: ${this.formatType(type.paramType)}) * ${this.formatType(type.bodyType)}`;
      default:
        return `[${type.kind}]`;
    }
  }
}
