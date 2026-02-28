// Voliteľné: source map pre lepšie chyby
export interface Span { start: number; end: number; }

// ---------- Types (podľa STLC.g4) ----------
export type TypeNode =
  | { id?: number; span?: Span; kind: 'TypeVar'; name: string }     // TYPEID
  | { id?: number; span?: Span; kind: 'Bool' }                       // BOOL
  | { id?: number; span?: Span; kind: 'Bottom' }                     // ⊥ (logical falsehood)
  | { id?: number; span?: Span; kind: 'Nat' }                        // NAT
  | { id?: number; span?: Span; kind: 'Func'; from: TypeNode; to: TypeNode } // A -> B
  | { id?: number; span?: Span; kind: 'Prod'; left: TypeNode; right: TypeNode } // A * B
  | { id?: number; span?: Span; kind: 'Sum'; left: TypeNode; right: TypeNode }  // A + B
  | { id?: number; span?: Span; kind: 'PredicateType'; name: string; argTypes: TypeNode[] }  // P(T1, T2, ...)
  | { id?: number; span?: Span; kind: 'DependentFunc'; param: string; paramType: TypeNode; bodyType: TypeNode } // (x: T) -> A
  | { id?: number; span?: Span; kind: 'DependentProd'; param: string; paramType: TypeNode; bodyType: TypeNode }  // (x: T) * A
;

// ---------- Expressions (podľa STLC.g4) ----------
export type ExprNode =
  | { id?: number; span?: Span; kind: 'Var'; name: string }

  // λx:T. t
  | { id?: number; span?: Span; kind: 'Abs'; param: string; paramType: TypeNode; body: ExprNode }

  // aplikácia (ľavoasociatívna)
  | { id?: number; span?: Span; kind: 'App'; fn: ExprNode; arg: ExprNode }

  // let x = t in u
  | { id?: number; span?: Span; kind: 'Let'; name: string; value: ExprNode; inExpr: ExprNode }

  // páry: (t, u) a let [x, y] = p in q
  | { id?: number; span?: Span; kind: 'Pair'; left: ExprNode; right: ExprNode }
  | { id?: number; span?: Span; kind: 'Fst'; pair: ExprNode }
  | { id?: number; span?: Span; kind: 'Snd'; pair: ExprNode }
  | { id?: number; span?: Span; kind: 'LetPair'; x: string; y: string; pair: ExprNode; inExpr: ExprNode }

  // sumy: inl t as T | inr t as U
  | { id?: number; span?: Span; kind: 'Inl'; expr: ExprNode; asType: TypeNode }
  | { id?: number; span?: Span; kind: 'Inr'; expr: ExprNode; asType: TypeNode }

  // case t of inl x : T => u | inr y : U => v
  | { id?: number; span?: Span; kind: 'Case'
      ; expr: ExprNode
      ; leftVar: string; leftType: TypeNode; leftBranch: ExprNode
      ; rightVar: string; rightType: TypeNode; rightBranch: ExprNode
    }

  // if t then u else v
  | { id?: number; span?: Span; kind: 'If'; cond: ExprNode; thenBranch: ExprNode; elseBranch: ExprNode }

  // Bool a Nat fragment
  | { id?: number; span?: Span; kind: 'True' }
  | { id?: number; span?: Span; kind: 'False' }
  | { id?: number; span?: Span; kind: 'Zero' }                       // 0
  | { id?: number; span?: Span; kind: 'Succ'; expr: ExprNode }       // succ t
  | { id?: number; span?: Span; kind: 'Pred'; expr: ExprNode }       // pred t
  | { id?: number; span?: Span; kind: 'IsZero'; expr: ExprNode }     // iszero t

  // Dependent types for quantifiers
  | { id?: number; span?: Span; kind: 'DependentAbs'; param: string; paramType: TypeNode; body: ExprNode } // λx:T. t (dependent)
  | { id?: number; span?: Span; kind: 'DependentPair'; witness: ExprNode; witnessType: TypeNode; proof: ExprNode; proofType?: TypeNode } // (w, p) for ∃
  | { id?: number; span?: Span; kind: 'LetDependentPair'; x: string; xType: TypeNode; p: string; pType: TypeNode; pair: ExprNode; inExpr: ExprNode } // let ⟨x, p⟩ = ... in ...
  | { id?: number; span?: Span; kind: 'Abort'; expr: ExprNode; targetType: TypeNode }

  // voliteľné: všeobecná askripcia (len ak pridáš do gramatiky)
  // | { id?: number; span?: Span; kind: 'Annot'; expr: ExprNode; type: TypeNode }
;

// Voliteľné: cache na typy/inferenčné metadáta (neplést so syntaktickým typom)
export interface ExprMeta {
  inferredType?: TypeNode;
  ui?: { selected: boolean; expanded: boolean; userEdited?: boolean };
}
