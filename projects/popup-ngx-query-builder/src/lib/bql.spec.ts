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

  it('should omit redundant parentheses when stringifying', () => {
    const cfg: QueryBuilderConfig = { fields: { a: { type: 'string' } } } as any;
    const rs = bqlToRuleset('(a=1)', cfg);
    expect(rulesetToBql(rs, cfg)).toBe('a=1');
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
});
