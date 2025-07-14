import { bqlToRuleset, rulesetToBql } from './bql';
import { QueryBuilderConfig, RuleSet } from 'ngx-query-builder';

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
});
