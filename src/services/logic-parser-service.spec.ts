import { LogicParserService } from './logic-parser-service';

describe('LogicParserService typed quantifier domains', () => {
  let service: LogicParserService;

  beforeEach(() => {
    service = new LogicParserService();
  });

  it('keeps typed existential syntax in prepared input', () => {
    const prepared = service.prepareInput('∃x ∶ A. B(x)');
    expect(prepared).toBe('|- exists x : A. B(x)');
  });

  it('parses typed existential into Exists with domain and body', () => {
    const parsed = service.parseFormula('∃x: A. B(x)');
    expect(parsed.conclusions.length).toBe(1);

    const top = parsed.conclusions[0] as any;
    expect(top.kind).toBe('Exists');
    expect(top.variable).toBe('x');
    expect(top.domain.kind).toBe('Var');
    expect(top.domain.name).toBe('A');
    expect(top.body.kind).toBe('Predicate');
    expect(top.body.name).toBe('B');
  });

  it('parses typed universal into Forall with domain and body', () => {
    const parsed = service.parseFormula('∀x: A. B(x)');
    expect(parsed.conclusions.length).toBe(1);

    const top = parsed.conclusions[0] as any;
    expect(top.kind).toBe('Forall');
    expect(top.variable).toBe('x');
    expect(top.domain.kind).toBe('Var');
    expect(top.domain.name).toBe('A');
    expect(top.body.kind).toBe('Predicate');
    expect(top.body.name).toBe('B');
  });

  it('keeps quantifier parenthesized after implication with domain intact', () => {
    const parsed = service.parseFormula('P => ∃x: A. B(x)');
    expect(parsed.conclusions.length).toBe(1);

    const top = parsed.conclusions[0] as any;
    expect(top.kind).toBe('Implies');
    expect(top.right.kind).toBe('Exists');
    expect(top.right.domain.kind).toBe('Var');
    expect(top.right.domain.name).toBe('A');
  });
});
