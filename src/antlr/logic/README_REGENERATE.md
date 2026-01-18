# Regenerating ANTLR Parser Files

The following files need to be regenerated using ANTLR:

1. `PredicateLogicLexer.ts`
2. `PredicateLogicParser.ts`
3. `PredicateLogicListener.ts`
4. `PredicateLogicVisitor.ts` (can be manually created, but should match generated version)

## Command to regenerate:

```bash
cd src/antlr/logic
npx antlr4ng-cli PredicateLogic.g4 -Dlanguage=TypeScript -visitor -listener -o .
```

## Note:

The `PredicateLogicAstVisitor.ts` file is manually created and should NOT be regenerated - it contains the custom AST building logic.

The `PredicateLogicVisitor.ts` interface file can be manually created (as done) or regenerated - both should work.

