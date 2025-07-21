import { bqlToRuleset, rulesetToBql, validateBql } from './bql';
import { QueryBuilderConfig, RuleSet, Rule } from 'ngx-query-builder';

describe('BQL named ruleset support', () => {
  const config: QueryBuilderConfig = { fields: {} } as any;

  it('should convert named ruleset to its name', () => {
    const rs: RuleSet = { condition: 'and', rules: [{ field: 'a', operator: '=', value: 1 }], name: 'TEST' };
    expect(rulesetToBql(rs, config)).toBe('TEST');
  });

  it('should parse named ruleset name', () => {
    const rs = bqlToRuleset('TEST', config);
    expect(rs.name).toBe('TEST');
  });

  it('should handle negated named ruleset', () => {
    const rs = bqlToRuleset('!TEST', config);
    expect(rs.name).toBe('TEST');
    expect(rs.not).toBeTrue();
    expect(rulesetToBql(rs, config)).toBe('!TEST');
  });

  it('should load named ruleset from config', () => {
    const get = jasmine.createSpy('get').and.returnValue({
      condition: 'and',
      rules: [{ field: 'a', operator: '=', value: 1 }]
    });
    const cfg: QueryBuilderConfig = { fields: {}, getNamedRuleset: get } as any;
    const rs = bqlToRuleset('TEST', cfg);
    expect(get).toHaveBeenCalledWith('TEST');
    expect(rs.name).toBe('TEST');
    expect(rs.rules.length).toBe(1);
    expect((rs.rules[0] as Rule).field).toBe('a');
  });

  it('should load negated named ruleset from config', () => {
    const get = jasmine.createSpy('get').and.returnValue({
      condition: 'and',
      rules: [{ field: 'a', operator: '=', value: 1 }]
    });
    const cfg: QueryBuilderConfig = { fields: {}, getNamedRuleset: get } as any;
    const rs = bqlToRuleset('!TEST', cfg);
    expect(get).toHaveBeenCalledWith('TEST');
    expect(rs.not).toBeTrue();
    expect(rs.rules.length).toBe(1);
    const child = rs.rules[0] as RuleSet;
    expect(child.name).toBe('TEST');
    expect((child.rules[0] as Rule).field).toBe('a');
  });

  it('should create rulesets for parentheses', () => {
    const cfg: QueryBuilderConfig = { fields: { a: { type: 'string' }, b: { type: 'string' } } } as any;
    const rs = bqlToRuleset('(a=1) & (b=2)', cfg);
    expect(rs.rules.length).toBe(2);
    const first = rs.rules[0] as RuleSet;
    expect(first.rules.length).toBe(1);
    expect(first.isChild).toBeTrue();
  });

  it('should keep named rulesets when parsing', () => {
    const rs = bqlToRuleset('ONE & TWO', config);
    expect(rs.rules.length).toBe(2);
    expect((rs.rules[0] as RuleSet).name).toBe('ONE');
    expect((rs.rules[1] as RuleSet).name).toBe('TWO');
  });

  it('should flatten simple OR queries into a single ruleset', () => {
    const cfg: QueryBuilderConfig = { fields: { fname: { type: 'string' } } } as any;
    const rs = bqlToRuleset('fname=bill | fname=john', cfg);
    expect(rs.condition).toBe('or');
    expect(rs.rules.length).toBe(2);
    const r1 = rs.rules[0] as Rule;
    const r2 = rs.rules[1] as Rule;
    expect(r1.field).toBe('fname');
    expect(r1.value).toBe('bill');
    expect(r2.field).toBe('fname');
    expect(r2.value).toBe('john');
  });

  it('should not wrap single rules when combining with groups', () => {
    const cfg: QueryBuilderConfig = { fields: { fname: { type: 'string' }, document: { type: 'string' } } } as any;
    const rs = bqlToRuleset('(fname=bill | fname=john) & foo', cfg);
    expect(rs.condition).toBe('and');
    expect(rs.rules.length).toBe(2);
    expect((rs.rules[0] as RuleSet).condition).toBe('or');
    expect((rs.rules[1] as Rule).field).toBe('document');
    expect((rs.rules[1] as Rule).value).toBe('foo');
  });

  it('should omit redundant parentheses when stringifying', () => {
    const cfg: QueryBuilderConfig = { fields: { a: { type: 'string' } } } as any;
    const rs = bqlToRuleset('(a=1)', cfg);
    expect(rulesetToBql(rs, cfg)).toBe('a=1');
  });

  it('should parse and stringify !CONTAINS operator', () => {
    const cfg: QueryBuilderConfig = {
      fields: { fname: { type: 'string', operators: ['contains', '!contains'] } }
    } as any;
    const rs = bqlToRuleset('fname !CONTAINS bob', cfg);
    const r = rs.rules[0] as Rule;
    expect(r.field).toBe('fname');
    expect(r.operator).toBe('!contains');
    expect(r.value).toBe('bob');
    expect(rulesetToBql(rs, cfg)).toBe('fname !CONTAINS bob');
  });

  it('should parse and stringify !LIKE operator', () => {
    const cfg: QueryBuilderConfig = {
      fields: { fname: { type: 'string', operators: ['like', '!like'] } }
    } as any;
    const rs = bqlToRuleset('fname !LIKE bob', cfg);
    const r = rs.rules[0] as Rule;
    expect(r.field).toBe('fname');
    expect(r.operator).toBe('!like');
    expect(rulesetToBql(rs, cfg)).toBe('fname !LIKE bob');
  });

  it('should parse and stringify IN operator', () => {
    const cfg: QueryBuilderConfig = {
      fields: { sign: { type: 'string', operators: ['in'] } }
    } as any;
    const rs = bqlToRuleset('sign IN (aries,taurus)', cfg);
    const r = rs.rules[0] as Rule;
    expect(Array.isArray(r.value)).toBeTrue();
    expect(r.value.length).toBe(2);
    expect(rulesetToBql(rs, cfg)).toBe('sign IN (aries,taurus)');
  });

  it('should parse IN operator with quoted value', () => {
    const cfg: QueryBuilderConfig = {
      fields: { sign: { type: 'string', operators: ['in'] } }
    } as any;
    const rs = bqlToRuleset('sign IN ("abc")', cfg);
    const r = rs.rules[0] as Rule;
    expect(Array.isArray(r.value)).toBeTrue();
    expect(r.value).toEqual(['abc']);
  });

  it('should parse IN operator with whitespace', () => {
    const cfg: QueryBuilderConfig = {
      fields: { sign: { type: 'string', operators: ['in'] } }
    } as any;
    const rs = bqlToRuleset('sign IN (aries,   taurus, gemini)', cfg);
    const r = rs.rules[0] as Rule;
    expect(r.value).toEqual(['aries', 'taurus', 'gemini']);
  });

  it('should throw on IN operator with no values', () => {
    const cfg: QueryBuilderConfig = {
      fields: { sign: { type: 'string', operators: ['in'] } }
    } as any;
    expect(() => bqlToRuleset('sign IN ()', cfg)).toThrow();
  });
});

describe('validateBql', () => {
  const cfg: QueryBuilderConfig = {
    fields: {
      sign: { name: 'Sign', type: 'category', options: [{ name: 'Aries', value: 'aries' }] },
      age: { name: 'Age', type: 'number', operators: ['=', '>'] }
    }
  } as any;

  it('should accept valid category value', () => {
    expect(validateBql('sign=aries', cfg)).toBeTrue();
  });

  it('should reject invalid category value', () => {
    expect(validateBql('sign=taurus', cfg)).toBeFalse();
  });

  it('should reject invalid operator', () => {
    expect(validateBql('age<10', cfg)).toBeFalse();
  });

  it('should return false on parse error', () => {
    expect(validateBql('(age=1', cfg)).toBeFalse();
  });

  it('should reject queries with trailing text', () => {
    expect(validateBql('sign=aries trailing', cfg)).toBeFalse();
  });

  it('should reject queries with dangling operator', () => {
    expect(validateBql('sign=aries &', cfg)).toBeFalse();
  });

  it('should reject unbalanced parentheses', () => {
    expect(validateBql('(xx', cfg)).toBeFalse();
  });

  it('should reject unknown named rulesets', () => {
    expect(validateBql('ABC', cfg)).toBeFalse();
  });

  it('should accept != operator for string fields', () => {
    const cfg2: QueryBuilderConfig = {
      fields: {
        fname: { name: 'First Name', type: 'string', operators: ['=', '!='] }
      }
    } as any;
    expect(validateBql('fname!=john', cfg2)).toBeTrue();
  });

  it('should accept !CONTAINS operator', () => {
    const cfg3: QueryBuilderConfig = {
      fields: { fname: { name: 'First', type: 'string', operators: ['!contains'] } }
    } as any;
    expect(validateBql('fname !CONTAINS bob', cfg3)).toBeTrue();
  });

  it('should accept !LIKE operator', () => {
    const cfg4: QueryBuilderConfig = {
      fields: { fname: { name: 'First', type: 'string', operators: ['!like'] } }
    } as any;
    expect(validateBql('fname !LIKE bob', cfg4)).toBeTrue();
  });

  it('should accept IN operator', () => {
    const cfg5: QueryBuilderConfig = {
      fields: { sign: { name: 'Sign', type: 'category', options: [{ name: 'Aries', value: 'aries' }, { name: 'Taurus', value: 'taurus' }], operators: ['in'] } }
    } as any;
    expect(validateBql('sign IN (aries,taurus)', cfg5)).toBeTrue();
  });

  it('should accept IN operator with whitespace', () => {
    const cfg5: QueryBuilderConfig = {
      fields: { sign: { name: 'Sign', type: 'category', options: [{ name: 'Aries', value: 'aries' }, { name: 'Taurus', value: 'taurus' }, { name: 'Gemini', value: 'gemini' }], operators: ['in'] } }
    } as any;
    expect(validateBql('sign IN (aries,   taurus, gemini)', cfg5)).toBeTrue();
  });

  it('should accept IN operator with quoted value', () => {
    const cfg5: QueryBuilderConfig = {
      fields: { sign: { name: 'Sign', type: 'category', options: [{ name: 'Abc', value: 'abc' }], operators: ['in'] } }
    } as any;
    expect(validateBql('sign IN ("abc")', cfg5)).toBeTrue();
  });

  it('should reject IN operator with no values', () => {
    const cfg5: QueryBuilderConfig = {
      fields: { sign: { name: 'Sign', type: 'category', options: [], operators: ['in'] } }
    } as any;
    expect(validateBql('sign IN ()', cfg5)).toBeFalse();
  });

  it('should reject invalid value in IN operator', () => {
    const cfg5: QueryBuilderConfig = {
      fields: { sign: { name: 'Sign', type: 'category', options: [{ name: 'Aries', value: 'aries' }], operators: ['in'] } }
    } as any;
    expect(validateBql('sign IN (aries,taurus)', cfg5)).toBeFalse();
  });
});
