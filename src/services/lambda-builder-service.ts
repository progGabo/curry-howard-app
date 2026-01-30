import { Injectable } from '@angular/core';
import { DerivationNode, FormulaNode, SequentNode, TermNode } from '../models/formula-node';
import { ExprNode, TypeNode } from '../models/lambda-node';
import { ExprFactories, TypeFactories } from '../utils/ast-factories';
import { isImplies, isForall, isExists, isAnd, isOr, isNot, isPredicate, isAbs, isFuncType } from '../utils/type-guards';
import { Equality } from '../utils/equality';
import { VariableNamingService } from './variable-naming-service';
import { FormulaTypeService } from './formula-type-service';
import { substituteFormula } from '../utils/quantifier-utils';

/**
 * New lambda builder service with improved architecture:
 * - Uses metadata from DerivationNode for explicit tracking
 * - Proper dependent types for quantifiers
 * - Better variable naming
 * - Cleaner separation of concerns
 */
@Injectable({ providedIn: 'root' })
export class LambdaBuilderService {
  private formulaMap = new WeakMap<DerivationNode, FormulaNode>();
  private sequentMap = new WeakMap<DerivationNode, SequentNode>();
  private formulaVarMap = new WeakMap<FormulaNode, string>();
  private nameType = new Map<string, TypeNode>();
  private boundVarContext: { eigenVar: string; boundVar: string } | null = null;
  private allNodes = new Set<DerivationNode>();

  constructor(
    private variableNaming: VariableNamingService,
    private formulaType: FormulaTypeService
  ) {}

  buildLambda(root: DerivationNode, rootSeq: SequentNode): ExprNode {
    // Reset state
    this.formulaMap = new WeakMap();
    this.sequentMap = new WeakMap();
    this.formulaVarMap = new WeakMap();
    this.nameType = new Map();
    this.boundVarContext = null;
    this.allNodes = new Set();
    this.variableNaming.reset();

    // Phase 1: Annotation - build context maps
    this.annotate(root, rootSeq);
    
    // Phase 2: Generation - generate lambda terms
    const raw = this.generate(root);
    return raw;
  }

  /**
   * Phase 1: Annotate the derivation tree with formulas and sequents
   */
  private annotate(node: DerivationNode, seq: SequentNode): void {
    this.allNodes.add(node);
    this.sequentMap.set(node, seq);

    // Create formula-to-variable mapping for this sequent
    const formulaToVar = new WeakMap<FormulaNode, string>();
    
    // Pre-populate variable names for all assumptions
    // This makes lambda generation simpler by providing direct lookups
    for (const assumption of seq.assumptions) {
      if (!formulaToVar.has(assumption)) {
        const varName = this.variableNaming.getVariableName(assumption, 'assumption');
        formulaToVar.set(assumption, varName);
        this.formulaVarMap.set(assumption, varName);
      }
    }
    
    // Store in metadata for easy access during generation
    if (!node.metadata) {
      node.metadata = {};
    }
    node.metadata.formulaToVar = formulaToVar;
    
    // Also store in sequent for convenience
    seq.assumptionVars = formulaToVar;

    let formula = node.usedFormula || this.detectFormula(node, seq);

    const pool =
      ['→R','∧R','∨R','¬R','∀R','∃R'].includes(node.rule) ? seq.conclusions :
      ['→L','∧L','∨L','¬L','∀L','∃L'].includes(node.rule) ? seq.assumptions : null;

    if (pool && formula) {
      try { formula = this.pickSameInstance(formula, pool); } catch {}
    }
    
    if (!formula) {
      throw new Error(`Could not detect formula for rule ${node.rule} in sequent`);
    }
    
    this.formulaMap.set(node, formula);

    switch (node.rule) {
      case 'Ax':
        return;

      case '→R': {
        const f = this.expect(formula, 'Implies', '→R vyžaduje implikáciu v závěre');
        this.annotate(node.children[0], {
          assumptions: [...seq.assumptions, f.left],
          conclusions: [f.right],
        });
        return;
      }

      case '→L': {
        const f = this.expect(formula, 'Implies', '→L vyžaduje implikáciu v predpokladoch');
        const gamma = seq.assumptions.filter(a => a !== f);
        // →L: Γ, A→B ⊢ Δ
        // Left premise: Γ ⊢ A, Δ  (NOT just A!)
        // Right premise: Γ, B ⊢ Δ
        const rightPremiseSeq = { 
          assumptions: [...gamma, f.right], 
          conclusions: seq.conclusions 
        };
        this.annotate(node.children[0], { 
          assumptions: gamma, 
          conclusions: [...seq.conclusions, f.left] 
        });
        this.annotate(node.children[1], rightPremiseSeq);
        return;
      }

      case '∧R': {
        const f = this.expect(formula, 'And', '∧R vyžaduje konjunkciu v závěre');
        this.annotate(node.children[0], { assumptions: seq.assumptions, conclusions: [f.left] });
        this.annotate(node.children[1], { assumptions: seq.assumptions, conclusions: [f.right] });
        return;
      }

      case '∧L': {
        const f = this.expect(formula, 'And', '∧L vyžaduje konjunkciu v predpokladoch');
        const gamma = seq.assumptions.filter(a => a !== f);
        this.annotate(node.children[0], { assumptions: [...gamma, f.left, f.right], conclusions: seq.conclusions });
        return;
      }

      case '∨R': {
        const f = this.expect(formula, 'Or', '∨R vyžaduje disjunkciu v závěre');
        this.annotate(node.children[0], { assumptions: seq.assumptions, conclusions: [f.left, f.right] });
        return;
      }

      case '∨L': {
        const f = this.expect(formula, 'Or', '∨L vyžaduje disjunkciu v predpokladoch');
        const gamma = seq.assumptions.filter(a => a !== f);
        this.annotate(node.children[0], { assumptions: [...gamma, f.left], conclusions: seq.conclusions });
        this.annotate(node.children[1], { assumptions: [...gamma, f.right], conclusions: seq.conclusions });
        return;
      }

      case '¬R': {
        const f = this.expect(formula, 'Not', '¬R vyžaduje negáciu v závěre');
        // ¬R: Γ ⊢ ¬A, Δ → Γ, A ⊢ Δ
        // Remove ¬A from conclusions
        const newConclusions = seq.conclusions.filter(c => !Equality.formulasEqual(c, f));
        this.annotate(node.children[0], { 
          assumptions: [...seq.assumptions, f.inner], 
          conclusions: newConclusions 
        });
        return;
      }

      case '¬L': {
        const f = this.expect(formula, 'Not', '¬L vyžaduje negáciu v predpokladoch');
        const gamma = seq.assumptions.filter(a => a !== f);
        this.annotate(node.children[0], { assumptions: gamma, conclusions: [...seq.conclusions, f.inner] });
        return;
      }

      case '∀R': {
        const f = this.expect(formula, 'Forall', '∀R vyžaduje univerzálny kvantifikátor v závěre');
        // Use renamed variable from metadata if available
        const variable = node.metadata?.renamedVariable?.new || f.variable;
        const body = node.metadata?.renamedVariable 
          ? this.renameVariableInFormula(f.body, f.variable, variable)
          : f.body;
        this.annotate(node.children[0], { assumptions: seq.assumptions, conclusions: [body] });
        return;
      }

      case '∀L': {
        const f = this.expect(formula, 'Forall', '∀L vyžaduje univerzálny kvantifikátor v predpokladoch');
        // The child has the substituted body - use metadata if available
        const gamma = seq.assumptions.filter(a => a !== f);
        if (node.children[0] && 'sequent' in node.children[0]) {
          this.annotate(node.children[0], node.children[0].sequent);
        }
        return;
      }

      case '∃R': {
        const f = this.expect(formula, 'Exists', '∃R vyžaduje existenčný kvantifikátor v závěre');
        // The child has the substituted body - use metadata if available
        if (node.children[0] && 'sequent' in node.children[0]) {
          this.annotate(node.children[0], node.children[0].sequent);
        }
        return;
      }

      case '∃L': {
        const f = this.expect(formula, 'Exists', '∃L vyžaduje existenčný kvantifikátor v predpokladoch');
        // Use renamed variable from metadata if available
        const variable = node.metadata?.renamedVariable?.new || f.variable;
        const body = node.metadata?.renamedVariable
          ? this.renameVariableInFormula(f.body, f.variable, variable)
          : f.body;
        const gamma = seq.assumptions.filter(a => a !== f);
        this.annotate(node.children[0], { assumptions: [...gamma, body], conclusions: seq.conclusions });
        return;
      }

      case 'WL':
      case 'WR':
      case 'Cut':
        node.children.forEach(child => this.annotate(child, seq));
        return;

      default:
        return;
    }
  }

  /**
   * Phase 2: Generate lambda expressions from annotated derivation tree
   */
  private generate(node: DerivationNode): ExprNode {
    const formula = this.formulaMap.get(node);

    switch (node.rule) {
      case 'Ax': {
        const seq = this.sequentMap.get(node)!;
        const hit = seq.assumptions.find(a => seq.conclusions.some(c => Equality.formulasEqual(a, c)));
        if (!hit) throw new Error('Ax: Nenájdená zhodná formula medzi Γ a Δ');
        return ExprFactories.var(this.getVar(hit, node));
      }

      case '→R': {
        const f = this.expect(formula!, 'Implies');
        const param = this.bindVar(f.left, undefined, node.children[0]);
        const paramType = this.formulaType.formulaToType(f.left, true);
        
        const body = this.generate(node.children[0]);
        return ExprFactories.abs(param, paramType, body);
      }

      case '→L': {
        const f = this.expect(formula!, 'Implies');
        // →L: Γ, A→B ⊢ Δ
        // Left premise: Γ ⊢ A, Δ  (gives us proof that includes A)
        // Right premise: Γ, B ⊢ Δ  (gives us function B → Δ)
        
        // Check if this implication came from a ∀L substitution
        // If so, we should use the forall instance (f x) instead of the variable bound to the substituted body
        let fVar: ExprNode;
        const seq = this.sequentMap.get(node);
        if (seq) {
          // Check if there's a ∀L node in the assumptions that produced this formula
          // We need to find a ∀L node that has this formula as its substituted body
          // Since we don't have parent information, we'll check if the formula is in assumptions
          // and if there's a way to get the forall instance
          // For now, we'll use the variable, but we should improve this
          const forallNode = this.findForallNodeForFormula(f, node);
          if (forallNode) {
            // This formula came from a ∀L substitution, use the forall instance
            const forallFMap = this.formulaMap.get(forallNode);
            if (!forallFMap) return ExprFactories.var(this.getVar(f, node));
            const forallF = this.expect(forallFMap, 'Forall');
            const substitution = forallNode.metadata?.substitution;
            if (substitution) {
              const forallVar = this.getVar(forallF, forallNode);
              const termExpr = this.termToExpr(substitution.term);
              fVar = ExprFactories.app(ExprFactories.var(forallVar), termExpr);
            } else {
              fVar = ExprFactories.var(this.getVar(f, node));
            }
          } else {
            fVar = ExprFactories.var(this.getVar(f, node));
          }
        } else {
          fVar = ExprFactories.var(this.getVar(f, node));
        }
        
        // Get the left proof - it should prove A (possibly along with other conclusions)
        let leftProof = this.generate(node.children[0]);
        
        // Special handling: if leftProof is an identity abstraction from ¬R+Ax,
        // extract the actual proof from the axiom
        // This happens when: ¬q ⊢ ¬p, p → ¬R on ¬p → ¬q, p ⊢ p (axiom)
        // ¬R creates λp:p. p, but →L needs just p
        const leftChild = node.children[0];
        if (leftChild.rule === '¬R' && isAbs(leftProof)) {
          // Check if this is an identity function λa:a. a
          if (leftProof.body.kind === 'Var' && leftProof.body.name === leftProof.param) {
            // Check if the child of ¬R is an axiom
            const notRChild = leftChild.children[0];
            if (notRChild && notRChild.rule === 'Ax') {
              const axSeq = this.sequentMap.get(notRChild);
              if (axSeq) {
                // Find the assumption that matches f.left (which is what we need to prove)
                const aHit = axSeq.assumptions.find(a => 
                  axSeq.conclusions.some(c => 
                    Equality.formulasEqual(a, c) && Equality.formulasEqual(a, f.left)
                  )
                );
                if (aHit) {
                  // Extract the variable directly from the axiom
                  leftProof = ExprFactories.var(this.getVar(aHit, notRChild));
                }
              }
            }
          }
        }
        
        // If leftProof is a variable and f.left equals an ∃L substituted body, use that ∃L's proof variable (p not p0)
        if (leftProof.kind === 'Var') {
          const existsNode = this.findExistsNodeForFormula(f.left, node);
          if (existsNode) {
            const existsF = this.formulaMap.get(existsNode);
            if (existsF && existsF.kind === 'Exists') {
              const childSeq = this.sequentMap.get(existsNode.children[0]);
              const currentSeq = this.sequentMap.get(existsNode);
              if (childSeq && currentSeq) {
                const originalAssumptions = currentSeq.assumptions.filter((a: FormulaNode) => a !== existsF);
                const substitutedBody = childSeq.assumptions.find((a: FormulaNode) =>
                  !originalAssumptions.some((orig: FormulaNode) => Equality.formulasEqual(orig, a))
                );
                if (substitutedBody && Equality.formulasEqual(substitutedBody, f.left)) {
                  const proofVar = this.getVar(substitutedBody, existsNode.children[0]);
                  leftProof = ExprFactories.var(proofVar);
                }
              }
            }
          }
        }

        const faExpr = ExprFactories.app(fVar, leftProof); // f(leftProof) : B

        const rightProofRaw = this.generate(node.children[1]); // Proof of Δ from Γ, B
        // If the right proof uses a variable that should come from faExpr (i.e., f.right),
        // replace it with faExpr. This handles the case where q should come from a x.
        // We need to find the variable name for f.right in the right proof's context
        const rightNode = node.children[1];
        const rightSeq = this.sequentMap.get(rightNode);
        // Check if f.right is in the right premise's assumptions
        const bInRightAssumptions = rightSeq?.assumptions.find(a => Equality.formulasEqual(a, f.right));
        let rightProof = rightProofRaw;
        if (bInRightAssumptions) {
          // f.right is in assumptions, so we should replace references to it with faExpr
          rightProof = this.fixRightProof(rightProofRaw, f.right, faExpr, rightNode);
        }
        const bType = this.formulaType.formulaToType(f.right, true);
        
        // Get the variable name for B from the right premise's assumptions
        const bVar = rightNode.metadata?.formulaToVar?.get(f.right) 
          || rightNode.sequent?.assumptionVars?.get(f.right);
        
        // Check if rightProof already uses B correctly (i.e., it's a function that uses B from context)
        // If rightProof is an abstraction but doesn't match B's type, it might be abstracting over something else
        // In that case, we need to check if B is used as a free variable in rightProof
        // Also check if rightProof uses faExpr (which gives us B), in which case we shouldn't wrap it
        let rightFn: ExprNode;
        
        // Check if rightProof uses faExpr (which computes B from the left proof)
        const usesFaExpr = this.containsExpr(rightProof, faExpr);
        
        if (isAbs(rightProof) && Equality.typesEqual(rightProof.paramType, bType)) {
          // Right proof is already a function B → Δ
          rightFn = rightProof;
        } else if (usesFaExpr) {
          // Right proof already uses faExpr to get B - don't wrap it
          rightFn = rightProof;
        } else if (bVar && this.usesVariable(rightProof, bVar)) {
          // Right proof already uses B from assumptions - don't wrap it
          rightFn = rightProof;
        } else {
          // Need to abstract over B: use direct lookup from metadata
          if (!bVar) {
            // Fallback: search for it (shouldn't happen if annotation worked correctly)
            const rightSeq = this.sequentMap.get(rightNode);
            const bAssumption = rightSeq?.assumptions.find(a => Equality.formulasEqual(a, f.right));
            if (!bAssumption) {
              throw new Error('→L: Right premise should have B in assumptions');
            }
            const bParam = this.getVar(bAssumption, rightNode);
            rightFn = ExprFactories.abs(bParam, bType, rightProof);
          } else {
            rightFn = ExprFactories.abs(bVar, bType, rightProof);
          }
        }
        // If rightProof already uses faExpr, it means it computes B from the left proof's result
        // In this case, we should use the right proof directly, not apply it to faExpr
        if (usesFaExpr) {
          return rightFn;
        }
        return ExprFactories.app(rightFn, faExpr);
      }

      case '∧R': {
        return ExprFactories.pair(this.generate(node.children[0]), this.generate(node.children[1]));
      }

      case '∧L': {
        const f = this.expect(formula!, 'And');
        return ExprFactories.letPair(
          this.getVar(f.left),
          this.getVar(f.right),
          ExprFactories.var(this.getVar(f)),
          this.generate(node.children[0])
        );
      }

      case '∨R': {
        const f = this.expect(formula!, 'Or');
        const child = this.generate(node.children[0]);
        const childSeq = this.sequentMap.get(node.children[0]);
        
        // Try to determine branch choice from metadata or child sequent
        let branchChoice = node.metadata?.branchChoice;
        if (!branchChoice && childSeq) {
          const hasLeft = childSeq.conclusions.some(c => Equality.formulasEqual(c, f.left));
          const hasRight = childSeq.conclusions.some(c => Equality.formulasEqual(c, f.right));
          if (hasLeft && !hasRight) branchChoice = 'left';
          else if (hasRight && !hasLeft) branchChoice = 'right';
        }
        
        const orType = this.formulaType.formulaToType(f, true);
        if (branchChoice === 'left') {
          return ExprFactories.inl(child, orType);
        } else if (branchChoice === 'right') {
          return ExprFactories.inr(child, orType);
        } else {
          // Default to left if can't determine
          return ExprFactories.inl(child, orType);
        }
      }

      case '∨L': {
        const f = this.expect(formula!, 'Or');
        const parentSeq = this.sequentMap.get(node)!;
        const sumGoal = parentSeq.conclusions.find(c => c.kind === 'Or') || f;
        const leftType = this.formulaType.formulaToType(f.left, true);
        const rightType = this.formulaType.formulaToType(f.right, true);
        return ExprFactories.case(
          ExprFactories.var(this.getVar(f)),
          this.getVar(f.left),
          leftType,
          this.generate(node.children[0]),
          this.getVar(f.right),
          rightType,
          this.generate(node.children[1])
        );
      }

      case '¬R': {
        const f = this.expect(formula!, 'Not');
        // ¬R: Γ ⊢ ¬A, Δ → Γ, A ⊢ Δ
        // The child proves Δ from Γ, A
        // Standard: create function A → (proof of Δ)
        const childProof = this.generate(node.children[0]);
        const childSeq = this.sequentMap.get(node.children[0]);
        const originalSeq = this.sequentMap.get(node)!;
        
        // Check if there are other conclusions besides ¬A
        const otherConclusions = originalSeq.conclusions.filter(c => !Equality.formulasEqual(c, f));
        
        // Special case: if child is an axiom proving one of the other conclusions directly,
        // and that conclusion is what we need (not ¬A), we can sometimes avoid abstraction
        // But in standard sequent calculus, ¬R always creates an abstraction
        // The issue is when this is used in →L's left premise
        
        // For now, always create the abstraction as per standard sequent calculus
        const param = this.bindVar(f.inner, undefined, node.children[0]);
        const paramType = this.formulaType.formulaToType(f.inner, true);
        return ExprFactories.abs(param, paramType, childProof);
      }

      case '¬L': {
        const f = this.expect(formula!, 'Not');
        // ¬L: Γ, ¬A ⊢ Δ → Γ ⊢ A, Δ
        // The child proves A, Δ from Γ
        // Standard: apply the proof of ¬A (which is A→⊥) to the proof of A to get ⊥
        // Then use that to prove Δ
        // Lambda term: (proof of ¬A) (proof of A from child)
        const childProof = this.generate(node.children[0]);
        const aVar = this.getVar(f.inner, node.children[0]);
        const notAVar = this.getVar(f, node);
        // Apply ¬A to A to get ⊥, then use childProof (which proves A,Δ) to get Δ
        // Actually: if childProof proves A,Δ, we need to extract A and apply ¬A to it
        // Standard: (proof of ¬A) (proof of A)
        return ExprFactories.app(ExprFactories.var(notAVar), ExprFactories.var(aVar));
      }

      case '∀R': {
        const f = this.expect(formula!, 'Forall');
        // Use the eigenvariable for the lambda parameter
        const variable = node.metadata?.renamedVariable?.new || f.variable;
        const eigenVar = node.metadata?.renamedVariable?.new;
        
        // Set bound variable context for child nodes (use eigenvariable for type references)
        const oldContext = this.boundVarContext;
        if (eigenVar) {
          this.boundVarContext = { eigenVar, boundVar: eigenVar };
        }
        
        const paramType = this.formulaType.inferQuantifierParamType({ variable: f.variable, body: f.body });
        const bodyExpr = this.generate(node.children[0]);
        
        // Restore old context
        this.boundVarContext = oldContext;
        
        // Use dependent abstraction for proper dependent types
        return ExprFactories.dependentAbs(variable, paramType, bodyExpr);
      }

      case '∀L': {
        const f = this.expect(formula!, 'Forall');
        // Get substitution from metadata
        const substitution = node.metadata?.substitution;
        if (substitution) {
          // Generate lambda for the substituted body
          const childExpr = this.generate(node.children[0]);
          // Apply the forall variable to get the instance
          const forallVar = this.getVar(f, node);
          // Convert the substitution term to an expression
          const termExpr = this.termToExpr(substitution.term);
          // Apply the forall variable to the term: f(term)
          // This gives us the instance of the forall formula (e.g., P(x) => Q(x))
          const forallInstance = ExprFactories.app(ExprFactories.var(forallVar), termExpr);
          // The child expression should use this instance, but it's already generated
          // So we return the child expression as-is (it should already reference the instance)
          return childExpr;
        } else {
          // Fallback: just use child expression
          return this.generate(node.children[0]);
        }
      }

      case '∃R': {
        const f = this.expect(formula!, 'Exists');
        // Get witness from metadata
        const witness = node.metadata?.witness;
        if (witness) {
          // Create dependent pair: (witness, proof). Use quantifier domain type for witnessType
          // so type inference matches (e.g. x : T in LetDependentPair body).
          const witnessExpr = this.termToExpr(witness);
          const witnessType = this.formulaType.inferQuantifierParamType({ variable: f.variable, body: f.body });
          const proofExpr = this.generate(node.children[0]);
          return ExprFactories.dependentPair(witnessExpr, witnessType, proofExpr);
        } else {
          // Fallback: just return child expression
          return this.generate(node.children[0]);
        }
      }

      case '∃L': {
        const f = this.expect(formula!, 'Exists');
        // Use renamed variable from metadata if available
        const variable = node.metadata?.renamedVariable?.new || f.variable;
        // For ∃L, we extract the witness and proof using let binding
        const witnessType = this.formulaType.inferQuantifierParamType({ variable: f.variable, body: f.body });
        // Get the substituted body (proof) from the child sequent
        const childSeq = this.sequentMap.get(node.children[0]);
        if (!childSeq) throw new Error('∃L: Child sequent not found');
        const currentSeq = this.sequentMap.get(node);
        if (!currentSeq) throw new Error('∃L: Current sequent not found');
        // The substituted body P(eigenVar) was added to assumptions during annotation
        // Find it by matching - it should be the one that's not in the original assumptions
        const originalAssumptions = currentSeq.assumptions.filter((a: FormulaNode) => a !== f);
        const substitutedBody = childSeq.assumptions.find((a: FormulaNode) => 
          !originalAssumptions.some((orig: FormulaNode) => Equality.formulasEqual(orig, a))
        );
        if (!substitutedBody) throw new Error('∃L: Substituted body not found in child assumptions');
        // Get the variable name for the proof (bind substitutedBody -> proofVar so child uses same name)
        const proofVar = this.getVar(substitutedBody, node.children[0]);
        // Collect any variable names that were assigned to formulas equal to substitutedBody (e.g. p0 for f.left)
        const otherVarsForBody = new Set<string>();
        for (const n of this.allNodes) {
          const s = this.sequentMap.get(n);
          if (!s) continue;
          for (const a of s.assumptions) {
            if (Equality.formulasEqual(a, substitutedBody)) {
              const v = this.formulaVarMap.get(a);
              if (v && v !== proofVar) otherVarsForBody.add(v);
            }
          }
          for (const c of s.conclusions || []) {
            if (Equality.formulasEqual(c, substitutedBody)) {
              const v = this.formulaVarMap.get(c);
              if (v && v !== proofVar) otherVarsForBody.add(v);
            }
          }
        }
        // Force every formula equal to substitutedBody to use proofVar
        for (const n of this.allNodes) {
          const s = this.sequentMap.get(n);
          if (!s) continue;
          for (const a of s.assumptions) {
            if (Equality.formulasEqual(a, substitutedBody)) this.formulaVarMap.set(a, proofVar);
          }
          for (const c of s.conclusions || []) {
            if (Equality.formulasEqual(c, substitutedBody)) this.formulaVarMap.set(c, proofVar);
          }
        }
        // Proof type is P(a) where a is the witness: use body type with witness variable substituted
        const proofType = this.replaceTypeVarInPredicateType(
          this.formulaType.formulaToType(f.body),
          f.variable,
          variable
        );
        // Get the variable name for the existential formula (the assumption variable, e.g., "e")
        const existentialVar = this.getVar(f, node);
        let inExpr = this.generate(node.children[0]);
        // Replace any other variable that was used for the substituted body (e.g. p0) with proofVar in the body
        for (const otherVar of otherVarsForBody) {
          inExpr = this.replaceVariableInExpr(inExpr, otherVar, ExprFactories.var(proofVar));
        }
        // Fallback: replace any proof-alias variable (e.g. p0, p1) that appears in the body with proofVar
        const varsInBody = new Set<string>();
        this.collectVariables(inExpr, varsInBody);
        for (const name of varsInBody) {
          if (name !== proofVar && name !== variable && name !== existentialVar &&
              proofVar.length > 0 && name.startsWith(proofVar) && /^\d+$/.test(name.slice(proofVar.length))) {
            inExpr = this.replaceVariableInExpr(inExpr, name, ExprFactories.var(proofVar));
          }
        }
        return ExprFactories.letDependentPair(variable, witnessType, proofVar, proofType, ExprFactories.var(existentialVar), inExpr);
      }

      case 'WL':
      case 'WR':
      case 'Cut':
        return this.generate(node.children[0]);

      default:
        return { kind: 'Var', name: '-' };
    }
  }

  /**
   * Find an ∃L node that produced the given formula as its substituted body
   */
  private findExistsNodeForFormula(formula: FormulaNode, currentNode: DerivationNode): DerivationNode | null {
    for (const node of this.allNodes) {
      if (node.rule === '∃L') {
        const existsF = this.formulaMap.get(node);
        if (existsF && existsF.kind === 'Exists') {
          // Check if the substituted body matches the given formula
          const childSeq = this.sequentMap.get(node.children[0]);
          const currentSeq = this.sequentMap.get(node);
          if (childSeq && currentSeq) {
            const originalAssumptions = currentSeq.assumptions.filter((a: FormulaNode) => a !== existsF);
            const substitutedBody = childSeq.assumptions.find((a: FormulaNode) => 
              !originalAssumptions.some((orig: FormulaNode) => Equality.formulasEqual(orig, a))
            );
            if (substitutedBody && Equality.formulasEqual(substitutedBody, formula)) {
              return node;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Find a ∀L node that produced the given formula as its substituted body
   */
  private findForallNodeForFormula(formula: FormulaNode, currentNode: DerivationNode): DerivationNode | null {
    for (const node of this.allNodes) {
      if (node.rule === '∀L' && node.metadata?.substitution) {
        const forallF = this.formulaMap.get(node);
        if (forallF && forallF.kind === 'Forall') {
          // Check if the substituted body matches the given formula
          const substitution = node.metadata.substitution;
          const substituted = this.substituteFormulaInLambda(forallF.body, substitution.variable, substitution.term);
          if (Equality.formulasEqual(substituted, formula)) {
            return node;
          }
        }
      }
    }
    return null;
  }

  /**
   * Substitute a term for a variable in a formula (helper for findForallNodeForFormula)
   * Uses the substitution utility from quantifier-utils
   */
  private substituteFormulaInLambda(formula: FormulaNode, variable: string, term: TermNode): FormulaNode {
    return substituteFormula(formula, variable, term);
  }

  /**
   * Convert a term to an expression (for witnesses)
   */
  private termToExpr(term: TermNode): ExprNode {
    switch (term.kind) {
      case 'TermVar':
        return ExprFactories.var(term.name);
      case 'TermConst':
        return ExprFactories.var(term.name); // Constants as variables for now
      case 'TermFunc':
        // Function terms - simplified, could be enhanced
        const args = term.args.map(arg => this.termToExpr(arg));
        // For now, just return first arg or a variable
        return args[0] || ExprFactories.var(term.name);
      default:
        return ExprFactories.var('witness');
    }
  }

  private expect<T extends FormulaNode['kind']>(f: FormulaNode, kind: T, msg?: string): Extract<FormulaNode, { kind: T }> {
    if (!f || f.kind !== kind) throw new Error(msg || `Očakávané ${kind}, dostal som ${f?.kind}`);
    return f as any;
  }

  private pickSameInstance(target: FormulaNode, pool: FormulaNode[]): FormulaNode {
    const hit = pool.find(f => Equality.formulasEqual(f, target));
    if (!hit) throw new Error('pickSameInstance: formula nie je v danom sekvente');
    return hit;
  }

  private detectFormula(node: DerivationNode, seq: SequentNode): FormulaNode {
    if (node.usedFormula) return node.usedFormula;

    switch (node.rule) {
      case 'Ax': {
        for (const a of seq.assumptions) {
          const c = seq.conclusions.find(x => Equality.formulasEqual(a, x));
          if (c) return c;
        }
        throw new Error('Ax: Nenájdená zhodná formula medzi Γ a Δ');
      }
      case '→R': {
        const m = seq.conclusions.find(isImplies);
        if (!m) throw new Error('→R: Nenájdená implikácia v Δ');
        return m;
      }
      case '→L': {
        const imps = seq.assumptions.filter(isImplies);
        if (imps.length === 0) throw new Error('→L: v Γ nie je žiadna implikácia');
        const pick = imps.find(i => !isNot(i.right)) ?? imps[0];
        return pick;
      }
      case '∧R': {
        const m = seq.conclusions.find(isAnd);
        if (!m) throw new Error('∧R: Nenájdená ∧ v Δ');
        return m;
      }
      case '∧L': {
        const m = seq.assumptions.find(isAnd);
        if (!m) throw new Error('∧L: Nenájdená ∧ v Γ');
        return m;
      }
      case '∨R': {
        const m = seq.conclusions.find(isOr);
        if (!m) throw new Error('∨R: Nenájdená ∨ v Δ');
        return m;
      }
      case '∨L': {
        const m = seq.assumptions.find(isOr);
        if (!m) throw new Error('∨L: Nenájdená ∨ v Γ');
        return m;
      }
      case '¬R': {
        const m = seq.conclusions.find(isNot);
        if (!m) throw new Error('¬R: Nenájdená negácia v Δ');
        return m;
      }
      case '¬L': {
        const m = seq.assumptions.find(isNot);
        if (!m) throw new Error('¬L: Nenájdená negácia v Γ');
        return m;
      }
      case '∀R': {
        const m = seq.conclusions.find(isForall);
        if (!m) throw new Error('∀R: Nenájdený univerzálny kvantifikátor v Δ');
        return m;
      }
      case '∀L': {
        const m = seq.assumptions.find(isForall);
        if (!m) throw new Error('∀L: Nenájdený univerzálny kvantifikátor v Γ');
        return m;
      }
      case '∃R': {
        const m = seq.conclusions.find(isExists);
        if (!m) throw new Error('∃R: Nenájdený existenčný kvantifikátor v Δ');
        return m;
      }
      case '∃L': {
        const m = seq.assumptions.find(isExists);
        if (!m) throw new Error('∃L: Nenájdený existenčný kvantifikátor v Γ');
        return m;
      }
      case 'WL':
      case 'WR':
      case 'Cut':
        return seq.conclusions[0] ?? seq.assumptions[0]!;
      default:
        return { kind: 'Var', name: '-' };
    }
  }

  private getVar(f: FormulaNode, node?: DerivationNode): string { 
    return this.bindVar(f, undefined, node); 
  }

  private bindVar(f: FormulaNode, preferred?: string, node?: DerivationNode): string {
    // First try to get from existing mapping
    let v = this.formulaVarMap.get(f);
    if (v) {
      // For predicates, ensure lowercase (P -> p)
      if (f.kind === 'Predicate' && v && v.length > 0 && v[0] === v[0].toUpperCase()) {
        v = v[0].toLowerCase() + v.slice(1);
        this.formulaVarMap.set(f, v);
      }
      return v;
    }
    
    // Try to get from node's metadata (if provided)
    if (node?.metadata?.formulaToVar) {
      v = node.metadata.formulaToVar.get(f);
      if (v) {
        // For predicates, ensure lowercase (P -> p)
        if (f.kind === 'Predicate' && v && v.length > 0 && v[0] === v[0].toUpperCase()) {
          v = v[0].toLowerCase() + v.slice(1);
        }
        this.formulaVarMap.set(f, v);
        return v;
      }
    }
    
    // Try to get from sequent's assumptionVars (if node has sequent)
    if (node?.sequent?.assumptionVars) {
      v = node.sequent.assumptionVars.get(f);
      if (v) {
        // For predicates, ensure lowercase (P -> p)
        if (f.kind === 'Predicate' && v && v.length > 0 && v[0] === v[0].toUpperCase()) {
          v = v[0].toLowerCase() + v.slice(1);
        }
        this.formulaVarMap.set(f, v);
        return v;
      }
    }
    
    // If f is equal to an ∃L substituted body, use that proof variable (fixes p0 vs p)
    for (const n of this.allNodes) {
      if (n.rule === '∃L') {
        const childSeq = this.sequentMap.get(n.children[0]);
        const currentSeq = this.sequentMap.get(n);
        if (!childSeq || !currentSeq) continue;
        const orig = currentSeq.assumptions.filter((a: FormulaNode) => a !== this.formulaMap.get(n));
        const sub = childSeq.assumptions.find((a: FormulaNode) =>
          !orig.some((o: FormulaNode) => Equality.formulasEqual(o, a))
        );
        if (sub && Equality.formulasEqual(sub, f)) {
          v = this.formulaVarMap.get(sub);
          if (v) {
            this.formulaVarMap.set(f, v);
            return v;
          }
        }
      }
    }

    // Fallback: generate new name
    v = preferred || this.variableNaming.getVariableName(f);
    // For predicates, lowercase the variable name (P -> p)
    if (f.kind === 'Predicate' && v && v.length > 0 && v[0] === v[0].toUpperCase()) {
      v = v[0].toLowerCase() + v.slice(1);
    }
    this.formulaVarMap.set(f, v);
    this.nameType.set(v, this.formulaType.formulaToType(f, true));
    return v;
  }

  /**
   * Fix the right proof by replacing variables that should come from faExpr.
   * This handles cases where q should come from a x instead of being used directly.
   */
  private fixRightProof(expr: ExprNode, targetFormula: FormulaNode, replacement: ExprNode, contextNode?: DerivationNode): ExprNode {
    // If replacement is an application like (a p), we need to adapt it to the context
    // If expr is an abstraction λx: T. body, we should replace variables with (a x) not (a p)
    return this.replaceVariableAdaptive(expr, targetFormula, replacement, contextNode);
  }

  /**
   * Replace variables adaptively - if the expression is an abstraction,
   * adapt the replacement to use the abstraction's parameter
   */
  private replaceVariableAdaptive(expr: ExprNode, targetFormula: FormulaNode, replacement: ExprNode, contextNode?: DerivationNode): ExprNode {
    // If replacement is an application (a p) and expr is an abstraction λx: T. body,
    // we should replace with (a x) where x is the parameter
    if (replacement.kind === 'App' && expr.kind === 'Abs') {
      // Extract the function and argument from replacement
      const replacementFn = replacement.fn;
      const replacementArg = replacement.arg;
      
      // If replacementArg is a variable that matches the abstraction's parameter type,
      // replace it with the abstraction's parameter
      if (replacementArg.kind === 'Var') {
        // Create new replacement using the abstraction's parameter
        const adaptedReplacement = ExprFactories.app(replacementFn, ExprFactories.var(expr.param));
        const targetVar = this.getVar(targetFormula, contextNode);
        let result = this.replaceVariableInExpr(expr.body, targetVar, adaptedReplacement);
        
        // Also replace generated variables
        if (targetFormula.kind === 'Var') {
          const baseName = targetFormula.name;
          const generatedVars = this.findGeneratedVariables(result, baseName);
          for (const genVar of generatedVars) {
            result = this.replaceVariableInExpr(result, genVar, adaptedReplacement);
          }
        }
        
        return { ...expr, body: result };
      }
    }
    
    // Fallback to standard replacement
    const targetVar = this.getVar(targetFormula, contextNode);
    let result = this.replaceVariableInExpr(expr, targetVar, replacement);
    
    // Also check for generated names
    if (targetFormula.kind === 'Var') {
      const baseName = targetFormula.name;
      const generatedVars = this.findGeneratedVariables(result, baseName);
      for (const genVar of generatedVars) {
        result = this.replaceVariableInExpr(result, genVar, replacement);
      }
    }
    
    return result;
  }

  /**
   * Find all generated variable names (like q0, q1) that match a base name
   */
  private findGeneratedVariables(expr: ExprNode, baseName: string): string[] {
    const vars = new Set<string>();
    this.collectVariables(expr, vars);
    const generated: string[] = [];
    for (const v of vars) {
      // Check if v matches the pattern baseName + number (e.g., q0, q1, q2, etc.)
      const match = v.match(new RegExp(`^${baseName}(\\d+)$`));
      if (match) {
        generated.push(v);
      }
    }
    return generated;
  }

  /**
   * Collect all variable names used in an expression
   */
  private collectVariables(expr: ExprNode, vars: Set<string>): void {
    switch (expr.kind) {
      case 'Var':
        vars.add(expr.name);
        break;
      case 'Abs':
        // Don't collect bound variables
        this.collectVariables(expr.body, vars);
        break;
      case 'App':
        this.collectVariables(expr.fn, vars);
        this.collectVariables(expr.arg, vars);
        break;
      case 'Pair':
        this.collectVariables(expr.left, vars);
        this.collectVariables(expr.right, vars);
        break;
      case 'LetPair':
        this.collectVariables(expr.pair, vars);
        this.collectVariables(expr.inExpr, vars);
        break;
      case 'Inl':
      case 'Inr':
        this.collectVariables(expr.expr, vars);
        break;
      case 'Case':
        this.collectVariables(expr.expr, vars);
        this.collectVariables(expr.leftBranch, vars);
        this.collectVariables(expr.rightBranch, vars);
        break;
      case 'DependentAbs':
        this.collectVariables(expr.body, vars);
        break;
      case 'DependentPair':
        this.collectVariables(expr.witness, vars);
        this.collectVariables(expr.proof, vars);
        break;
      case 'LetDependentPair':
        this.collectVariables(expr.pair, vars);
        this.collectVariables(expr.inExpr, vars);
        break;
      default:
        break;
    }
  }

  /**
   * Replace a variable in an expression with another expression.
   * Used to replace references to B with faExpr in →L.
   */
  private replaceVariableWithExpr(expr: ExprNode, targetFormula: FormulaNode, replacement: ExprNode, contextNode?: DerivationNode): ExprNode {
    // Get the variable name for the target formula
    const targetVar = this.getVar(targetFormula, contextNode);
    
    // Check if this expression uses the target variable
    if (!this.usesVariable(expr, targetVar)) {
      return expr; // No replacement needed
    }
    
    // Replace the variable with the replacement expression
    return this.replaceVariableInExpr(expr, targetVar, replacement);
  }

  /**
   * Replace all occurrences of a variable in an expression with another expression
   */
  private replaceVariableInExpr(expr: ExprNode, varName: string, replacement: ExprNode): ExprNode {
    switch (expr.kind) {
      case 'Var':
        return expr.name === varName ? replacement : expr;
      case 'Abs':
        // If the abstraction binds the variable, don't replace it
        if (expr.param === varName) return expr;
        return { ...expr, body: this.replaceVariableInExpr(expr.body, varName, replacement) };
      case 'App':
        return {
          ...expr,
          fn: this.replaceVariableInExpr(expr.fn, varName, replacement),
          arg: this.replaceVariableInExpr(expr.arg, varName, replacement)
        };
      case 'Pair':
        return {
          ...expr,
          left: this.replaceVariableInExpr(expr.left, varName, replacement),
          right: this.replaceVariableInExpr(expr.right, varName, replacement)
        };
      case 'LetPair':
        if (expr.x === varName || expr.y === varName) return expr;
        return {
          ...expr,
          pair: this.replaceVariableInExpr(expr.pair, varName, replacement),
          inExpr: this.replaceVariableInExpr(expr.inExpr, varName, replacement)
        };
      case 'Inl':
      case 'Inr':
        return { ...expr, expr: this.replaceVariableInExpr(expr.expr, varName, replacement) };
      case 'Case':
        if (expr.leftVar === varName || expr.rightVar === varName) return expr;
        return {
          ...expr,
          expr: this.replaceVariableInExpr(expr.expr, varName, replacement),
          leftBranch: this.replaceVariableInExpr(expr.leftBranch, varName, replacement),
          rightBranch: this.replaceVariableInExpr(expr.rightBranch, varName, replacement)
        };
      case 'DependentAbs':
        if (expr.param === varName) return expr;
        return { ...expr, body: this.replaceVariableInExpr(expr.body, varName, replacement) };
      case 'DependentPair':
        return {
          ...expr,
          witness: this.replaceVariableInExpr(expr.witness, varName, replacement),
          proof: this.replaceVariableInExpr(expr.proof, varName, replacement)
        };
      case 'LetDependentPair':
        if (expr.x === varName || expr.p === varName) return expr;
        return {
          ...expr,
          pair: this.replaceVariableInExpr(expr.pair, varName, replacement),
          inExpr: this.replaceVariableInExpr(expr.inExpr, varName, replacement)
        };
      default:
        return expr;
    }
  }

  /**
   * Check if an expression contains another expression (structural equality)
   */
  private containsExpr(expr: ExprNode, target: ExprNode): boolean {
    if (Equality.exprsEqual(expr, target)) {
      return true;
    }
    
    switch (expr.kind) {
      case 'Var':
        return false;
      case 'Abs':
        return this.containsExpr(expr.body, target);
      case 'App':
        return this.containsExpr(expr.fn, target) || this.containsExpr(expr.arg, target);
      case 'Pair':
        return this.containsExpr(expr.left, target) || this.containsExpr(expr.right, target);
      case 'LetPair':
        return this.containsExpr(expr.pair, target) || this.containsExpr(expr.inExpr, target);
      case 'Inl':
      case 'Inr':
        return this.containsExpr(expr.expr, target);
      case 'Case':
        return this.containsExpr(expr.expr, target) || 
               this.containsExpr(expr.leftBranch, target) || 
               this.containsExpr(expr.rightBranch, target);
      case 'DependentAbs':
        return this.containsExpr(expr.body, target);
      case 'DependentPair':
        return this.containsExpr(expr.witness, target) || this.containsExpr(expr.proof, target);
      case 'LetDependentPair':
        return this.containsExpr(expr.pair, target) || this.containsExpr(expr.inExpr, target);
      default:
        return false;
    }
  }

  /**
   * Check if an expression uses a variable (as a free variable)
   */
  private usesVariable(expr: ExprNode, varName: string): boolean {
    switch (expr.kind) {
      case 'Var':
        return expr.name === varName;
      case 'Abs':
        // If the abstraction binds the variable, it's not free
        if (expr.param === varName) return false;
        return this.usesVariable(expr.body, varName);
      case 'App':
        return this.usesVariable(expr.fn, varName) || this.usesVariable(expr.arg, varName);
      case 'Pair':
        return this.usesVariable(expr.left, varName) || this.usesVariable(expr.right, varName);
      case 'LetPair':
        if (expr.x === varName || expr.y === varName) return false;
        return this.usesVariable(expr.pair, varName) || this.usesVariable(expr.inExpr, varName);
      case 'Inl':
      case 'Inr':
        return this.usesVariable(expr.expr, varName);
      case 'Case':
        if (expr.leftVar === varName || expr.rightVar === varName) return false;
        return this.usesVariable(expr.expr, varName) || 
               this.usesVariable(expr.leftBranch, varName) || 
               this.usesVariable(expr.rightBranch, varName);
      case 'DependentAbs':
        if (expr.param === varName) return false;
        return this.usesVariable(expr.body, varName);
      case 'DependentPair':
        return this.usesVariable(expr.witness, varName) || this.usesVariable(expr.proof, varName);
      case 'LetDependentPair':
        if (expr.x === varName || expr.p === varName) return false;
        return this.usesVariable(expr.pair, varName) || this.usesVariable(expr.inExpr, varName);
      default:
        return false;
    }
  }

  /**
   * Rename a variable in a formula (for freshness handling)
   */
  private renameVariableInFormula(formula: FormulaNode, oldVar: string, newVar: string): FormulaNode {
    // This is a simplified version - full implementation would need to handle all cases
    if (formula.kind === 'Forall' && formula.variable === oldVar) {
      return { ...formula, variable: newVar };
    }
    if (formula.kind === 'Exists' && formula.variable === oldVar) {
      return { ...formula, variable: newVar };
    }
    // For other cases, return as-is (full implementation would recurse)
    return formula;
  }

  /**
   * Convert lambda expression to string for display
   */
  exprToString(e: ExprNode): string {
    switch (e.kind) {
      case 'Var': return e.name;
      case 'Abs': return `λ${e.param}: ${this.typeToText(e.paramType)}. ${this.exprToString(e.body)}`;
      case 'App': return `(${this.exprToString(e.fn)} ${this.exprToString(e.arg)})`;
      case 'Pair': return `⟨${this.exprToString(e.left)}, ${this.exprToString(e.right)}⟩`;
      case 'LetPair': return `let ⟨${e.x}, ${e.y}⟩ = ${this.exprToString(e.pair)} in ${this.exprToString(e.inExpr)}`;
      case 'Inl': return `inl ${this.exprToString(e.expr)} : ${this.typeToText(e.asType)}`;
      case 'Inr': return `inr ${this.exprToString(e.expr)} : ${this.typeToText(e.asType)}`;
      case 'Case': {
        const sumExpr = this.exprToString(e.expr);
        const L = `inl ${e.leftVar}: ${this.typeToText(e.leftType)} ⇒ ${this.exprToString(e.leftBranch)}`;
        const R = `inr ${e.rightVar}: ${this.typeToText(e.rightType)} ⇒ ${this.exprToString(e.rightBranch)}`;
        return `case ${sumExpr} of\n  ${L} |\n  ${R}`;
      }
      case 'DependentAbs': 
        // Set context for displaying body so type variables matching the parameter stay lowercase
        const oldContextForDisplay = this.boundVarContext;
        this.boundVarContext = { eigenVar: e.param, boundVar: e.param };
        const bodyStr = this.exprToString(e.body);
        this.boundVarContext = oldContextForDisplay;
        return `λ${e.param}: ${this.typeToText(e.paramType)}. ${bodyStr}`;
      case 'DependentPair':
        return `⟨${this.exprToString(e.witness)} : ${this.typeToText(e.witnessType)}, ${this.exprToString(e.proof)}⟩`;
      case 'LetDependentPair': {
        const oldCtx = this.boundVarContext;
        this.boundVarContext = { eigenVar: e.x, boundVar: e.x };
        const out = `let ⟨${e.x} : ${this.typeToText(e.xType)}, ${e.p} : ${this.typeToText(e.pType)}⟩ = ${this.exprToString(e.pair)} in ${this.exprToString(e.inExpr)}`;
        this.boundVarContext = oldCtx;
        return out;
      }
      default: return '-';
    }
  }

  /**
   * Replace type variables in a predicate type that match the eigenvariable with the bound variable
   */
  private replaceTypeVarInPredicateType(type: TypeNode, eigenVar: string, boundVar: string): TypeNode {
    if (type.kind !== 'PredicateType') return type;
    
    const newArgTypes = type.argTypes.map(argType => {
      if (argType.kind === 'TypeVar' && argType.name.toLowerCase() === eigenVar.toLowerCase()) {
        return TypeFactories.typeVar(boundVar);
      }
      return argType;
    });
    
    return TypeFactories.predicate(type.name, newArgTypes);
  }

  private typeToText(t: TypeNode): string {
    switch (t.kind) {
      case 'TypeVar': 
        // If this type variable matches a bound variable (eigenvariable) in context, keep it lowercase
        // Otherwise, capitalize the first letter
        if (this.boundVarContext) {
          const boundVarLower = this.boundVarContext.boundVar.toLowerCase();
          const typeVarLower = t.name.toLowerCase();
          if (typeVarLower === boundVarLower) {
            return t.name; // Keep bound variable references lowercase (preserve original case)
          }
        }
        // Capitalize the first letter of type variable names
        return t.name.charAt(0).toUpperCase() + t.name.slice(1);
      case 'Bool': return 'Bool';
      case 'Nat': return 'Nat';
      case 'Func': return `(${this.typeToText(t.from)} → ${this.typeToText(t.to)})`;
      case 'Prod': return `(${this.typeToText(t.left)} × ${this.typeToText(t.right)})`;
      case 'Sum': return `(${this.typeToText(t.left)} + ${this.typeToText(t.right)})`;
      case 'PredicateType':
        const args = t.argTypes.map(arg => this.typeToText(arg)).join(', ');
        return `${t.name}(${args})`;
      case 'DependentFunc':
        return `(${t.param}: ${this.typeToText(t.paramType)}) → ${this.typeToText(t.bodyType)}`;
      case 'DependentProd':
        return `(${t.param}: ${this.typeToText(t.paramType)}) × ${this.typeToText(t.bodyType)}`;
      default: return 'Unknown';
    }
  }
}
