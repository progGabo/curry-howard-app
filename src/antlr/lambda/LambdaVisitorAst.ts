// AstBuilder.ts
// Visitor, ktorý mapuje parse-tree z Lambda.g4 na AST uzly (ExprNode / TypeNode).

import { AbstractParseTreeVisitor, ParseTreeVisitor } from "antlr4ng";

// Interface that the generated parser expects
export interface LambdaVisitor<T> {
  visitProgram(ctx: any): T;
  visitTerm(ctx: any): T;
  visitLamExpr(ctx: any): T;
  visitLetExpr(ctx: any): T;
  visitLetPairExpr(ctx: any): T;
  visitIfExpr(ctx: any): T;
  visitCaseExpr(ctx: any): T;
  visitAppExpr(ctx: any): T;
  visitAtom(ctx: any): T;
  visitType(ctx: any): T;
  visitSumType(ctx: any): T;
  visitProdType(ctx: any): T;
  visitAtomicType(ctx: any): T;
  visitPredicateType(ctx: any): T;
  visitTypeList(ctx: any): T;
  visitChildren(ctx: any): T;
}
import {
  ProgramContext,
  TermContext,
  LamExprContext,
  LetExprContext,
  LetPairExprContext,
  IfExprContext,
  CaseExprContext,
  AppExprContext,
  AtomContext,
  TypeContext,
  SumTypeContext,
  ProdTypeContext,
  AtomicTypeContext,
} from "./LambdaParser.js";
// No need to import the interface - we'll implement the visitor methods directly

// === AST typy z lambda-node.ts ===
import { TypeNode, ExprNode } from "../../models/lambda-node.js";
import { ExprFactories, TypeFactories } from "../../utils/ast-factories.js";

// Voliteľná pomocná anotácia pozície
export interface Span { start: number; end: number; }

// Pomocné: získať span z ľubovoľného ctx
function spanOf(ctx: { start: any; stop: any }): Span {
  const start = (ctx.start?.startIndex ?? 0) as number;
  const end = (ctx.stop?.stopIndex ?? start) as number;
  return { start, end };
}

// Pomocné: ľavo-asoc. reťazenie aplikácií a typových operátorov
function appChain(nodes: ExprNode[], span?: Span): ExprNode {
  if (nodes.length === 0) throw new Error("empty application chain");
  return nodes.slice(1).reduce<ExprNode>(
    (fn, arg) => ExprFactories.app(fn, arg, span),
    nodes[0]!
  );
}

function sumChain(nodes: TypeNode[], span?: Span): TypeNode {
  if (nodes.length === 0) throw new Error("empty sum chain");
  return nodes.slice(1).reduce<TypeNode>(
    (left, right) => TypeFactories.sum(left, right),
    nodes[0]!
  );
}

function prodChain(nodes: TypeNode[], span?: Span): TypeNode {
  if (nodes.length === 0) throw new Error("empty product chain");
  return nodes.slice(1).reduce<TypeNode>(
    (left, right) => TypeFactories.prod(left, right),
    nodes[0]!
  );
}

export class AstBuilder
  extends AbstractParseTreeVisitor<unknown>
  implements LambdaVisitor<unknown>
{
  protected override defaultResult(): unknown {
    return null;
  }

  // ---------- program ----------
  visitProgram(ctx: ProgramContext): ExprNode {
    // program : term EOF ;
    return this.visit(ctx.term()!) as ExprNode;
  }

  // ---------- term (deleguje na konkrétne pravidlo) ----------
  visitTerm(ctx: TermContext): ExprNode {
    if (!ctx) {
      throw new Error("Term context is null");
    }
    // term : lamExpr | letPairExpr | letExpr | ifExpr | caseExpr | appExpr ;
    if (ctx.lamExpr()) {
      const lamCtx = ctx.lamExpr();
      if (!lamCtx) throw new Error("LamExpr context is null");
      return this.visitLamExpr(lamCtx);
    }
    if (ctx.letPairExpr()) {
      const letPairCtx = ctx.letPairExpr();
      if (!letPairCtx) throw new Error("LetPairExpr context is null");
      return this.visitLetPairExpr(letPairCtx);
    }
    if (ctx.letExpr()) {
      const letCtx = ctx.letExpr();
      if (!letCtx) throw new Error("LetExpr context is null");
      return this.visitLetExpr(letCtx);
    }
    if (ctx.ifExpr()) {
      const ifCtx = ctx.ifExpr();
      if (!ifCtx) throw new Error("IfExpr context is null");
      return this.visitIfExpr(ifCtx);
    }
    if (ctx.caseExpr()) {
      const caseCtx = ctx.caseExpr();
      if (!caseCtx) throw new Error("CaseExpr context is null");
      return this.visitCaseExpr(caseCtx);
    }
    const appCtx = ctx.appExpr();
    if (!appCtx) {
      throw new Error("Term must have at least one expression type (lamExpr, letPairExpr, letExpr, ifExpr, caseExpr, or appExpr)");
    }
    return this.visitAppExpr(appCtx);
  }

  // ---------- λ-abstraction ----------
  visitLamExpr(ctx: LamExprContext): ExprNode {
    // LAMBDA VAR COLON type DOT term
    return ExprFactories.abs(
      ctx.VAR()!.getText(),
      this.visitType(ctx.type()!) as TypeNode,
      this.visit(ctx.term()!) as ExprNode,
      spanOf(ctx)
    );
  }

  // ---------- let ----------
  visitLetExpr(ctx: LetExprContext): ExprNode {
    // LET VAR ASSIGN term IN term
    return ExprFactories.let(
      ctx.VAR()!.getText(),
      this.visit(ctx.term(0)!) as ExprNode,
      this.visit(ctx.term(1)!) as ExprNode,
      spanOf(ctx)
    );
  }

  // ---------- let-pair ----------
  visitLetPairExpr(ctx: LetPairExprContext): ExprNode {
    // LET [ VAR , VAR ] ASSIGN term IN term
    return ExprFactories.letPair(
      ctx.VAR(0)!.getText(),
      ctx.VAR(1)!.getText(),
      this.visit(ctx.term(0)!) as ExprNode,
      this.visit(ctx.term(1)!) as ExprNode,
      spanOf(ctx)
    );
  }

  // ---------- if-then-else ----------
  visitIfExpr(ctx: IfExprContext): ExprNode {
    // IF term THEN term ELSE term
    return ExprFactories.if(
      this.visit(ctx.term(0)!) as ExprNode,
      this.visit(ctx.term(1)!) as ExprNode,
      this.visit(ctx.term(2)!) as ExprNode,
      spanOf(ctx)
    );
  }

  // ---------- case over sums ----------
  visitCaseExpr(ctx: CaseExprContext): ExprNode {
    // CASE term OF INL VAR : type => term | INR VAR : type => term
    return ExprFactories.case(
      this.visit(ctx.term(0)!) as ExprNode,
      ctx.VAR(0)!.getText(),
      this.visitType(ctx.type_(0)!) as TypeNode,
      this.visit(ctx.term(1)!) as ExprNode,
      ctx.VAR(1)!.getText(),
      this.visitType(ctx.type_(1)!) as TypeNode,
      this.visit(ctx.term(2)!) as ExprNode,
      spanOf(ctx)
    );
  }

  // ---------- application (ľavo-asoc) ----------
  visitAppExpr(ctx: AppExprContext): ExprNode {
    if (!ctx) {
      throw new Error("AppExpr context is null");
    }
    // appExpr : atom (atom)* ;
    const atomContexts = ctx.atom();
    if (!atomContexts || atomContexts.length === 0) {
      throw new Error("AppExpr requires at least one atom");
    }
    const atoms = atomContexts.map((a) => {
      if (!a) {
        throw new Error("Atom context is null in AppExpr");
      }
      return this.visitAtom(a) as ExprNode;
    });
    if (atoms.length === 1) return atoms[0]!;
    return appChain(atoms, spanOf(ctx));
  }

  // ---------- atoms ----------
  visitAtom(ctx: AtomContext): ExprNode {
    if (!ctx) {
      throw new Error("Atom context is null");
    }
    // Alternatívy podľa gramatiky:

    // VAR
    if (ctx.VAR()) {
      return ExprFactories.var(ctx.VAR()!.getText(), spanOf(ctx));
    }

    // TRUE | FALSE
    if (ctx.TRUE()) return ExprFactories.true(spanOf(ctx));
    if (ctx.FALSE()) return ExprFactories.false(spanOf(ctx));

    // ZERO | SUCC atom | PRED atom | ISZERO atom
    if (ctx.ZERO()) return ExprFactories.zero(spanOf(ctx));
    if (ctx.SUCC()) {
      const atomCtx = ctx.atom();
      if (!atomCtx) {
        throw new Error("SUCC requires an atom expression");
      }
      const inner = this.visitAtom(atomCtx) as ExprNode;
      return ExprFactories.succ(inner, spanOf(ctx));
    }
    if (ctx.PRED()) {
      const atomCtx = ctx.atom();
      if (!atomCtx) {
        throw new Error("PRED requires an atom expression");
      }
      const inner = this.visitAtom(atomCtx) as ExprNode;
      return ExprFactories.pred(inner, spanOf(ctx));
    }
    if (ctx.ISZERO()) {
      const atomCtx = ctx.atom();
      if (!atomCtx) {
        throw new Error("ISZERO requires an atom expression");
      }
      const inner = this.visitAtom(atomCtx) as ExprNode;
      return ExprFactories.isZero(inner, spanOf(ctx));
    }

    // ( term )  -- iba prenes term
    if (ctx.LPAREN() && ctx.RPAREN() && ctx.term().length === 1 && !ctx.COMMA()) {
      return this.visit(ctx.term(0)!) as ExprNode;
    }

    // ( term , term )  -- pár
    if (ctx.LPAREN() && ctx.RPAREN() && ctx.term().length === 2 && ctx.COMMA()) {
      return ExprFactories.pair(
        this.visit(ctx.term(0)!) as ExprNode,
        this.visit(ctx.term(1)!) as ExprNode,
        spanOf(ctx)
      );
    }

    // < term , term > or ⟨ term , term ⟩  -- pár s uhlovými zátvorkami
    if (((ctx as any).LANGLE && (ctx as any).LANGLE()) || ((ctx as any).RANGLE && (ctx as any).RANGLE())) {
      const terms = ctx.term();
      if (terms && terms.length === 2 && ctx.COMMA()) {
        return ExprFactories.pair(
          this.visit(terms[0]!) as ExprNode,
          this.visit(terms[1]!) as ExprNode,
          spanOf(ctx)
        );
      }
    }

    // INL atom AS type
    if (ctx.INL()) {
      const atomCtx = ctx.atom();
      const typeCtx = ctx.type();
      if (!atomCtx || !typeCtx) {
        throw new Error("INL requires an atom expression and a type");
      }
      return ExprFactories.inl(
        this.visitAtom(atomCtx) as ExprNode,
        this.visitType(typeCtx) as TypeNode,
        spanOf(ctx)
      );
    }

    // INR atom AS type
    if ((ctx as any).INR && (ctx as any).INR()) {
      const atomCtx = ctx.atom();
      const typeCtx = ctx.type();
      if (!atomCtx || !typeCtx) {
        throw new Error("INR requires an atom expression and a type");
      }
      return ExprFactories.inr(
        this.visitAtom(atomCtx) as ExprNode,
        this.visitType(typeCtx) as TypeNode,
        spanOf(ctx)
      );
    }
    // Ak máš token pomenovaný INTR v gramatike:
    if ((ctx as any).INTR && (ctx as any).INTR()) {
      const atomCtx = ctx.atom();
      const typeCtx = ctx.type();
      if (!atomCtx || !typeCtx) {
        throw new Error("INTR requires an atom expression and a type");
      }
      return ExprFactories.inr(
        this.visitAtom(atomCtx) as ExprNode,
        this.visitType(typeCtx) as TypeNode,
        spanOf(ctx)
      );
    }

    throw new Error("Unrecognized atom form");
  }

  // ---------- types ----------
  visitType(ctx: TypeContext): TypeNode {
    // type : sumType (ARROW type)? ;
    const left = this.visitSumType(ctx.sumType()!) as TypeNode;
    if (ctx.ARROW()) {
      return TypeFactories.func(left, this.visitType(ctx.type()!) as TypeNode); // pravá asociácia
    }
    return left;
  }

  visitSumType(ctx: SumTypeContext): TypeNode {
    // sumType : prodType (PLUS prodType)* ;
    const parts = [this.visitProdType(ctx.prodType(0)!)] as TypeNode[];
    for (let i = 1; i < ctx.prodType().length; i++) {
      parts.push(this.visitProdType(ctx.prodType(i)!) as TypeNode);
    }
    if (parts.length === 1) return parts[0]!;
    return sumChain(parts, spanOf(ctx));
  }

  visitProdType(ctx: ProdTypeContext): TypeNode {
    // prodType : atomicType (TIMES atomicType)* ;
    const parts = [this.visitAtomicType(ctx.atomicType(0)!)] as TypeNode[];
    for (let i = 1; i < ctx.atomicType().length; i++) {
      parts.push(this.visitAtomicType(ctx.atomicType(i)!) as TypeNode);
    }
    if (parts.length === 1) return parts[0]!;
    return prodChain(parts, spanOf(ctx));
  }

  visitAtomicType(ctx: AtomicTypeContext): TypeNode {
    // TYPEID | BOOL | NAT | predicateType | ( type )
    if (ctx.TYPEID()) {
      return TypeFactories.typeVar(ctx.TYPEID()!.getText());
    }
    if (ctx.BOOL()) {
      return TypeFactories.bool();
    }
    if (ctx.NAT()) {
      return TypeFactories.nat();
    }
    // Check for predicateType (will exist after parser regeneration)
    if ((ctx as any).predicateType && (ctx as any).predicateType()) {
      return this.visitPredicateType((ctx as any).predicateType()!) as TypeNode;
    }
    // ( type )
    return this.visitType(ctx.type()!) as TypeNode;
  }

  visitPredicateType(ctx: any): TypeNode {
    // TYPEID LPAREN typeList? RPAREN
    const name = ctx.TYPEID()!.getText();
    const argTypes: TypeNode[] = [];
    if (ctx.typeList()) {
      const typeListCtx = ctx.typeList();
      for (let i = 0; i < typeListCtx.type().length; i++) {
        argTypes.push(this.visitType(typeListCtx.type(i)!) as TypeNode);
      }
    }
    return TypeFactories.predicate(name, argTypes);
  }

  visitTypeList(ctx: any): TypeNode[] {
    // typeList : type (COMMA type)* ;
    const types: TypeNode[] = [];
    for (let i = 0; i < ctx.type().length; i++) {
      types.push(this.visitType(ctx.type(i)!) as TypeNode);
    }
    return types;
  }

  // Preťaženie visit(), aby TypeScript vedel, že vraciame známe uzly
  // (nepovinné – iba pre pohodlie)
  override visit(tree: any): unknown {
    if (!tree) {
      throw new Error("Cannot visit null tree");
    }
    return super.visit(tree);
  }

  // Required by the LambdaVisitor interface
  override visitChildren(ctx: any): unknown {
    if (!ctx) {
      throw new Error("Cannot visit children of null context");
    }
    return super.visitChildren(ctx);
  }

  // Required by ParseTreeVisitor interface
  override visitTerminal(ctx: any): unknown {
    return super.visitTerminal(ctx);
  }

  override visitErrorNode(ctx: any): unknown {
    return super.visitErrorNode(ctx);
  }
}
