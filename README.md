# Curry-Howard App

Interactive Angular application for exploring the Curry-Howard correspondence with proof trees, natural deduction, and lambda/type workflows.

## Workflows

- `Curry-Howard`
  - `Expression → Lambda` (natural deduction proof + lambda generation)
  - `Lambda → Expression` (type inference / expression conversion)
- `Proofs`
  - `Sequent calculus` (proof-only)
  - `Natural deduction` (proof-only)

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run start
```

Build:

```bash
npm run build
```

Run unit tests:

```bash
npm run test
```

## Project Notes

- Current runtime bootstrap is module-based (`AppModule`).
- The following files are intentionally retained as **deprecated migration artifacts** and are not active runtime paths:
  - `src/app/app.config.ts`
  - `src/app/app.routes.ts`
- The following files are retained as **dev-only parser helpers**:
  - `src/antlr/lambda/test.ts`
  - `src/antlr/lambda/test-lambda-parser.ts`
