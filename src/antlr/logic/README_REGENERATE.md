# Regenerating ANTLR Parser Files

The following files need to be regenerated using ANTLR:

1. `LogicLexer.ts`
2. `LogicParser.ts`
3. `LogicListener.ts`
4. `LogicVisitor.ts` (can be manually created, but should match generated version)

## Command to regenerate:

```bash
cd src/antlr/logic
npx antlr4ng-cli Logic.g4 -Dlanguage=TypeScript -visitor -listener -o .
```

## Note:

The `LogicAstVisitor.ts` file is manually created and should NOT be regenerated - it contains the custom AST building logic currently used by the app.

The app parser service is already wired to `LogicLexer`, `LogicParser`, and `LogicAstVisitor`.

