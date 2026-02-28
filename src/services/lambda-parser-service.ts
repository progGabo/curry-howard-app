import { Injectable } from '@angular/core';
import { CharStream, CommonTokenStream, ParseTreeVisitor } from 'antlr4ng';
import { LambdaLexer } from '../antlr/lambda/LambdaLexer';
import { LambdaParser } from '../antlr/lambda/LambdaParser';
import { AstBuilder } from '../antlr/lambda/LambdaVisitorAst';
import { ExprNode, TypeNode } from '../models/lambda-node';

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
        .replace(/\u22A5/g, 'Bottom') // ⊥ -> Bottom (parseable TYPEID)
        .replace(/\u00D7/g, '*')   // × -> *
        .replace(/\u2295/g, '+')   // ⊕ -> +
        .replace(/\u27E8/g, '<')   // ⟨ -> <
        .replace(/\u27E9/g, '>');  // ⟩ -> >

      const quantifiedAliases = this.extractQuantifiedTypeAliases(processedCode);
      processedCode = quantifiedAliases.rewrittenCode;

      // Educational sugar: allow whole-term ascription for untyped lambdas,
      // e.g. "\\x.x : A -> A" or "(\\x. x) : A -> A".
      // Rewrite into parser-supported typed lambda form: "\\x:A. x".
      processedCode = this.rewriteUntypedLambdaAscription(processedCode);
      
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
      
      return this.expandQuantifiedTypeAliasesInExpr(result, quantifiedAliases.aliasMap);
    } catch (error: any) {
      console.error('Error parsing lambda expression:', error);
      const errorMessage = error?.message || String(error);
      throw new Error(`Failed to parse lambda expression: ${errorMessage}`);
    }
  }

  private extractQuantifiedTypeAliases(code: string): { rewrittenCode: string; aliasMap: Map<string, TypeNode> } {
    const aliasMap = new Map<string, TypeNode>();
    let output = '';
    let index = 0;
    let aliasIndex = 0;

    while (index < code.length) {
      const found = this.findQuantifiedTypeAt(code, index);
      if (!found) {
        output += code[index];
        index += 1;
        continue;
      }

      output += code.slice(index, found.start);

      const aliasName = `Q${aliasIndex++}`;
      const paramType = this.parseTypeSnippet(found.paramTypeText);
      const bodyType = this.parseTypeSnippet(found.bodyTypeText);

      const typeNode: TypeNode = found.quantifier === 'exists'
        ? { kind: 'DependentProd', param: found.variable, paramType, bodyType }
        : { kind: 'DependentFunc', param: found.variable, paramType, bodyType };

      aliasMap.set(aliasName, typeNode);
      output += aliasName;
      index = found.end;
    }

    return { rewrittenCode: output, aliasMap };
  }

  private findQuantifiedTypeAt(code: string, from: number):
    | { start: number; end: number; quantifier: 'forall' | 'exists'; variable: string; paramTypeText: string; bodyTypeText: string }
    | null {
    for (let i = from; i < code.length; i++) {
      const char = code[i];
      const isExists = char === '∃' || code.startsWith('exists', i);
      const isForall = char === '∀' || code.startsWith('forall', i);
      if (!isExists && !isForall) continue;

      const before = i > 0 ? code[i - 1] : ' ';
      if (/[A-Za-z0-9_]/.test(before)) continue;

      const quantifier = isExists ? 'exists' as const : 'forall' as const;
      let cursor = i + (char === '∃' || char === '∀' ? 1 : quantifier.length);

      while (cursor < code.length && /\s/.test(code[cursor])) cursor += 1;
      const varMatch = /^[a-z_][A-Za-z0-9_]*/.exec(code.slice(cursor));
      if (!varMatch) continue;
      const variable = varMatch[0];
      cursor += variable.length;

      while (cursor < code.length && /\s/.test(code[cursor])) cursor += 1;
      if (code[cursor] !== ':') continue;
      cursor += 1;

      const paramStart = cursor;
      let depth = 0;
      while (cursor < code.length) {
        const ch = code[cursor];
        if (ch === '(') depth += 1;
        else if (ch === ')') depth -= 1;
        else if (ch === '.' && depth === 0) break;
        cursor += 1;
      }
      if (cursor >= code.length || code[cursor] !== '.') continue;

      const paramTypeText = code.slice(paramStart, cursor).trim();
      cursor += 1;

      const bodyStart = cursor;
      depth = 0;
      while (cursor < code.length) {
        const ch = code[cursor];
        if (ch === '(') {
          depth += 1;
          cursor += 1;
          continue;
        }
        if (ch === ')') {
          if (depth === 0) break;
          depth -= 1;
          cursor += 1;
          continue;
        }
        if (depth === 0) {
          if (code.startsWith('->', cursor) || code.startsWith('=>', cursor) || ch === ',' || ch === '+') {
            break;
          }
        }
        cursor += 1;
      }

      const bodyTypeText = code.slice(bodyStart, cursor).trim();
      if (!paramTypeText || !bodyTypeText) continue;

      return {
        start: i,
        end: cursor,
        quantifier,
        variable,
        paramTypeText,
        bodyTypeText
      };
    }

    return null;
  }

  private parseTypeSnippet(typeText: string): TypeNode {
    const parsed = this.parseLambdaExpression(`\\q:${typeText}. q`);
    if (parsed.kind === 'Abs' || parsed.kind === 'DependentAbs') {
      return parsed.paramType;
    }
    throw new Error(`Failed to parse type snippet: ${typeText}`);
  }

  private expandQuantifiedTypeAliasesInExpr(expr: ExprNode, aliasMap: Map<string, TypeNode>): ExprNode {
    if (aliasMap.size === 0) return expr;

    const expandType = (type: TypeNode): TypeNode => {
      switch (type.kind) {
        case 'TypeVar': {
          const resolved = aliasMap.get(type.name);
          return resolved ? expandType(this.cloneType(resolved)) : type;
        }
        case 'Func':
          return { ...type, from: expandType(type.from), to: expandType(type.to) };
        case 'Prod':
        case 'Sum':
          return { ...type, left: expandType(type.left), right: expandType(type.right) };
        case 'PredicateType':
          return { ...type, argTypes: type.argTypes.map(expandType) };
        case 'DependentFunc':
        case 'DependentProd':
          return { ...type, paramType: expandType(type.paramType), bodyType: expandType(type.bodyType) };
        case 'Bool':
        case 'Bottom':
        case 'Nat':
          return type;
      }
    };

    const visit = (node: ExprNode): ExprNode => {
      switch (node.kind) {
        case 'Abs':
        case 'DependentAbs':
          return { ...node, paramType: expandType(node.paramType), body: visit(node.body) };
        case 'App':
          return { ...node, fn: visit(node.fn), arg: visit(node.arg) };
        case 'Pair':
          return { ...node, left: visit(node.left), right: visit(node.right) };
        case 'Fst':
        case 'Snd':
          return { ...node, pair: visit(node.pair) };
        case 'Inl':
        case 'Inr':
          return { ...node, expr: visit(node.expr), asType: expandType(node.asType) };
        case 'Case':
          return {
            ...node,
            expr: visit(node.expr),
            leftType: expandType(node.leftType),
            leftBranch: visit(node.leftBranch),
            rightType: expandType(node.rightType),
            rightBranch: visit(node.rightBranch)
          };
        case 'Let':
          return { ...node, value: visit(node.value), inExpr: visit(node.inExpr) };
        case 'LetPair':
          return { ...node, pair: visit(node.pair), inExpr: visit(node.inExpr) };
        case 'If':
          return { ...node, cond: visit(node.cond), thenBranch: visit(node.thenBranch), elseBranch: visit(node.elseBranch) };
        case 'Succ':
        case 'Pred':
        case 'IsZero':
          return { ...node, expr: visit(node.expr) };
        case 'DependentPair':
          return {
            ...node,
            witnessType: expandType(node.witnessType),
            witness: visit(node.witness),
            proof: visit(node.proof),
            proofType: node.proofType ? expandType(node.proofType) : undefined
          };
        case 'LetDependentPair':
          return {
            ...node,
            xType: expandType(node.xType),
            pType: expandType(node.pType),
            pair: visit(node.pair),
            inExpr: visit(node.inExpr)
          };
        case 'Abort':
          return { ...node, expr: visit(node.expr), targetType: expandType(node.targetType) };
        case 'Var':
        case 'True':
        case 'False':
        case 'Zero':
          return node;
      }
    };

    return visit(expr);
  }

  private cloneType(type: TypeNode): TypeNode {
    switch (type.kind) {
      case 'TypeVar':
        return { ...type };
      case 'Bool':
      case 'Bottom':
      case 'Nat':
        return { ...type };
      case 'Func':
        return { ...type, from: this.cloneType(type.from), to: this.cloneType(type.to) };
      case 'Prod':
      case 'Sum':
        return { ...type, left: this.cloneType(type.left), right: this.cloneType(type.right) };
      case 'PredicateType':
        return { ...type, argTypes: type.argTypes.map((arg) => this.cloneType(arg)) };
      case 'DependentFunc':
      case 'DependentProd':
        return { ...type, paramType: this.cloneType(type.paramType), bodyType: this.cloneType(type.bodyType) };
    }
  }

  private rewriteUntypedLambdaAscription(input: string): string {
    const source = input.trim();

    const parenthesized = source.match(/^\(\s*[\\]([a-z_][A-Za-z0-9_]*)\s*\.\s*(.+)\s*\)\s*:\s*(.+)$/);
    if (parenthesized) {
      const [, param, body, ascribedType] = parenthesized;
      const domain = this.extractAscribedFunctionDomain(ascribedType);
      if (domain) {
        return `\\${param}:${domain}. ${body.trim()}`;
      }
    }

    const direct = source.match(/^[\\]([a-z_][A-Za-z0-9_]*)\s*\.\s*(.+)\s*:\s*(.+)$/);
    if (direct) {
      const [, param, body, ascribedType] = direct;
      const domain = this.extractAscribedFunctionDomain(ascribedType);
      if (domain) {
        return `\\${param}:${domain}. ${body.trim()}`;
      }
    }

    return input;
  }

  private extractAscribedFunctionDomain(typeText: string): string | null {
    const normalized = typeText.trim();
    let depth = 0;
    for (let i = 0; i < normalized.length - 1; i++) {
      const char = normalized[i];
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth === 0) {
        const two = normalized.slice(i, i + 2);
        if (two === '->') {
          return normalized.slice(0, i).trim() || null;
        }
        if (char === '→') {
          return normalized.slice(0, i).trim() || null;
        }
      }
    }
    return null;
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

      case 'Fst':
        return `fst(${this.formatExpr(expr.pair)})`;

      case 'Snd':
        return `snd(${this.formatExpr(expr.pair)})`;
      
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

      case 'Abort':
        return `abort(${this.formatExpr(expr.expr)}): ${this.formatType(expr.targetType)}`;
      
      case 'DependentAbs':
        return `λ${expr.param}:${this.formatType(expr.paramType)}. ${this.formatExpr(expr.body)}`;
      
      case 'DependentPair':
        const proofWithType = expr.proofType
          ? `${this.formatExpr(expr.proof)}: ${this.formatType(expr.proofType)}`
          : this.formatExpr(expr.proof);
        return `⟨${this.formatExpr(expr.witness)}, ${proofWithType}⟩`;
      
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
      case 'Bottom':
        return '⊥';
      case 'Nat':
        return 'Nat';
      case 'Func':
        const from = this.formatType(type.from);
        const to = this.formatType(type.to);
        const fromNeedsParens = this.needsParensForArrowSide(type.from, 'left');
        const toNeedsParens = this.needsParensForArrowSide(type.to, 'right');
        return `${fromNeedsParens ? `(${from})` : from} -> ${toNeedsParens ? `(${to})` : to}`;
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
        return `∃${type.param}:${this.formatType(type.paramType)}. ${this.formatType(type.bodyType)}`;
      default:
        return `[${type.kind}]`;
    }
  }

  private isNegationType(type: any): boolean {
    return type?.kind === 'Func' && type?.to?.kind === 'Bottom';
  }

  private needsParensForArrowSide(type: any, side: 'left' | 'right'): boolean {
    if (this.isNegationType(type)) return false;
    if (type?.kind === 'Prod' || type?.kind === 'Sum') return true;
    if (type?.kind === 'DependentFunc' || type?.kind === 'DependentProd') return true;
    if (type?.kind === 'Func') return side === 'left' || side === 'right';
    return false;
  }
}
