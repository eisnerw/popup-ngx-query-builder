export interface BqlParseOptions {
  config: import('ngx-query-builder').QueryBuilderConfig;
}

import { RuleSet, Rule, QueryBuilderConfig } from 'ngx-query-builder';

interface Token {
  type: 'symbol' | 'word' | 'string' | 'operator';
  value: string;
}

function isRulesetName(name: string): boolean {
  return /^[A-Z0-9_]+$/.test(name) && /[A-Z]/.test(name);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '(' || ch === ')' || ch === '!' || ch === '&' || ch === '|') {
      tokens.push({ type: 'symbol', value: ch });
      i++; continue;
    }
    if (ch === '"') {
      let j = i + 1; let str = '';
      while (j < input.length) {
        if (input[j] === '\\') { str += input[j+1]; j += 2; continue; }
        if (input[j] === '"') { break; }
        str += input[j];
        j++;
      }
      tokens.push({ type: 'string', value: JSON.parse(input.slice(i, j+1)) });
      i = j + 1; continue;
    }
    if (/=|!|<|>/.test(ch)) {
      let op = ch; i++;
      if (i < input.length && input[i] === '=') { op += '='; i++; }
      tokens.push({ type: 'operator', value: op });
      continue;
    }
    let j = i;
    while (j < input.length && !/\s|\(|\)|!|&|\||=|<|>/.test(input[j])) j++;
    const word = input.slice(i, j);
    tokens.push({ type: 'word', value: word });
    i = j;
  }
  return tokens;
}

function isAlphaOperator(op: string): boolean {
  return /^[A-Z][A-Z_]*$/.test(op);
}

function toOperatorToken(op: string): string {
  return /^[A-Za-z]+$/.test(op) ? op.toUpperCase() : op;
}

function parseValue(token: Token, field: string, config: QueryBuilderConfig): any {
  const fieldConf = config.fields[field];
  if (!fieldConf) return token.value;
  const type = fieldConf.type;
  const v = token.value;
  if (type === 'number') return Number(v);
  if (type === 'boolean') return v === 'true';
  if (type === 'date') return new Date(v);
  return v;
}

export interface ParseInfo { index: number; length: number }

export function bqlToRuleset(input: string, config: QueryBuilderConfig, info?: ParseInfo): RuleSet {
  const tokens = tokenize(input);
  let pos = 0;
  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }

  function parsePrimary(): RuleSet {
    const tok = peek();
    if (!tok) return { condition: 'and', rules: [] };
    if (tok.value === '(') {
      consume();
      const expr = parseExpression();
      if (peek() && peek().value === ')') consume();
      expr.isChild = true;
      return expr;
    }
    if (tok.value === '!') { consume(); const inner = parsePrimary(); inner.not = !inner.not; return inner; }
    if (tok.type === 'word' && isRulesetName(tok.value)) {
      consume();
      const name = tok.value;
      let stored: RuleSet | undefined;
      if (config.getNamedRuleset) {
        try {
          stored = config.getNamedRuleset(name);
        } catch {
          stored = undefined;
        }
      }
      if (stored) {
        return { ...JSON.parse(JSON.stringify(stored)), name };
      }
      return { condition: 'and', rules: [], name };
    }
    // value or field rule
    const first = consume();
    const next = peek();
    if (next && next.type === 'operator' || (next && next.type === 'word' && isAlphaOperator(next.value))) {
      const opTok = consume();
      const valTok = consume();
      if (!valTok) {
        return { condition: 'and', rules: [] };
      }
      const field = first.value;
      const operator = opTok.type === 'word' ? opTok.value.toLowerCase() : opTok.value;
      const value = valTok.type === 'string' ? valTok.value : parseValue(valTok, field, config);
      return { condition: 'and', rules: [{ field, operator, value }] };
    } else {
      const value = first.type === 'string' ? first.value : first.value;
      return { condition: 'and', rules: [{ field: 'document', operator: 'contains', value: parseValue({type:'word', value}, 'document', config) }] };
    }
  }

  function parseUnary(): RuleSet {
    if (peek() && peek().value === '!') {
      consume();
      const rs = parseUnary();
      rs.not = !rs.not;
      return rs;
    }
    return parsePrimary();
  }

  function merge(left: RuleSet, right: RuleSet, cond: 'and' | 'or'): RuleSet {
    if (
      left.condition === cond &&
      !left.not &&
      !right.not &&
      !left.name &&
      !right.name &&
      !left.isChild &&
      !right.isChild
    ) {
      left.rules.push(...right.rules);
      return left;
    }
    return { condition: cond, rules: [left, right] };
  }

  function parseAnd(): RuleSet {
    let left = parseUnary();
    while (peek() && peek().value === '&') { consume(); const right = parseUnary(); left = merge(left, right, 'and'); }
    return left;
  }

  function parseOr(): RuleSet {
    let left = parseAnd();
    while (peek() && peek().value === '|') { consume(); const right = parseAnd(); left = merge(left, right, 'or'); }
    return left;
  }

  function parseExpression(): RuleSet { return parseOr(); }

  const result = parseExpression();
  if (info) { info.index = pos; info.length = tokens.length; }
  return result;
}

function valueToString(value: any): string {
  if (typeof value === 'string' && /^[A-Za-z0-9]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

export function rulesetToBql(rs: RuleSet, config: QueryBuilderConfig): string {
  function ruleToString(rule: Rule): string {
    if (rule.field === 'document' && rule.operator.toLowerCase() === 'contains') {
      return valueToString(rule.value);
    }
    const op = toOperatorToken(rule.operator);
    return `${rule.field}${isAlphaOperator(op) ? ' ' : ''}${op}${isAlphaOperator(op) ? ' ' : ''}${valueToString(rule.value)}`;
  }

  function isRule(obj: Rule | RuleSet): obj is Rule {
    return (obj as Rule).field !== undefined;
  }

  function isAtomic(rs: RuleSet): boolean {
    if (rs.not) return false;
    if (rs.rules.length !== 1) return false;
    const only = rs.rules[0];
    return isRule(only) || (!isRule(only) && isAtomic(only as RuleSet));
  }

  function prec(cond: 'and' | 'or'): number { return cond === 'or' ? 1 : 2; }

  function rulesetString(r: RuleSet, parent?: 'and' | 'or'): string {
    if (r.name) {
      return r.not ? `!${r.name}` : r.name;
    }
    if (!r.not && r.rules.length === 1) {
      const only = r.rules[0];
      if (isRule(only)) return ruleToString(only);
      if (!(only as RuleSet).name) {
        return rulesetString(only as RuleSet, parent);
      }
    }

    const parts = r.rules.map((child) => {
      if (isRule(child)) return ruleToString(child);
      return rulesetString(child as RuleSet, r.condition as 'and' | 'or');
    });

    const joiner = r.condition === 'or' ? ' | ' : ' & ';
    let result = parts.join(joiner);

    if (!r.not && parent && prec(r.condition as 'and' | 'or') < prec(parent)) {
      result = `(${result})`;
    }

    if (r.not) {
      if (r.rules.length === 1 && !isRule(r.rules[0]) && isAtomic(r.rules[0] as RuleSet)) {
        result = `!${result}`;
      } else if (r.rules.length === 1 && isRule(r.rules[0])) {
        result = `!${result}`;
      } else {
        result = `!(${result})`;
      }
    }

    return result;
  }
  return rulesetString(rs);
}

function validateRule(rule: Rule, parent: RuleSet, config: QueryBuilderConfig): boolean {
  const fieldConf = config.fields[rule.field];
  if (!fieldConf) return false;

  let operators = fieldConf.operators || [];
  if (config.getOperators) {
    try {
      operators = config.getOperators(rule.field, fieldConf);
    } catch {
      operators = fieldConf.operators || [];
    }
  }
  if (operators.length && !operators.includes(rule.operator)) {
    return false;
  }

  let allowedValues: any[] | undefined;
  if (fieldConf.options) {
    allowedValues = fieldConf.options.map(o => o.value);
  }
  if (fieldConf.categorySource) {
    try {
      const cats = fieldConf.categorySource(rule, parent);
      if (cats && cats.length) {
        allowedValues = cats;
      }
    } catch {
      // ignore
    }
  }

  if ((fieldConf.type === 'category' || allowedValues) && allowedValues && allowedValues.length) {
    if (!allowedValues.includes(rule.value)) {
      return false;
    }
  }

  if (fieldConf.validator) {
    try {
      const res = fieldConf.validator(rule, parent);
      if (res === false || res === null) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

function validateRuleset(rs: RuleSet, config: QueryBuilderConfig, parent?: RuleSet): boolean {
  for (const child of rs.rules) {
    const asRule = child as Rule;
    if (asRule.field !== undefined) {
      if (!validateRule(asRule, rs, config)) {
        return false;
      }
    } else if ((child as RuleSet).rules) {
      if (!validateRuleset(child as RuleSet, config, rs)) {
        return false;
      }
    }
  }
  return true;
}

export function validateBql(bql: string, config: QueryBuilderConfig): boolean {
  try {
    const info: ParseInfo = { index: 0, length: 0 };
    const rs = bqlToRuleset(bql, config, info);
    if (info.index !== info.length) {
      return false;
    }
    return validateRuleset(rs, config);
  } catch {
    return false;
  }
}

