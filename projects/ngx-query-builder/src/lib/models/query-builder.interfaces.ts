export interface RuleSet {
  condition: string;
  rules: (RuleSet | Rule)[];
  name?: string;
  not?: boolean;
  collapsed?: boolean;
  isChild?: boolean;
}

export interface Rule {
  field: string;
  operator: string;
  entity?: string;
  value?: any;
}

export interface Option {
  name: string;
  value: any;
}

export type FieldMap = Record<string, Field>;

export interface Field {
  name: string;
  value?: string;
  type: string;
  nullable?: boolean;
  options?: Option[];
  operators?: string[];
  defaultValue?: any;
  defaultOperator?: any;
  entity?: string;
  validator?: (rule: Rule, parent: RuleSet) => any | null;
  categorySource?: (rule: Rule, parent: RuleSet) => string[] | null;
}

export interface LocalRuleMeta {
  ruleset: boolean;
  invalid: boolean;
}

export type EntityMap = Record<string, Entity>;

export interface Entity {
  name: string;
  value?: string;
  defaultField?: any;
}

export interface QueryBuilderClassNames {
  arrowIconButton?: string;
  arrowIcon?: string;
  removeIcon?: string;
  addIcon?: string;
  button?: string;
  buttonGroup?: string;
  removeButton?: string;
  removeButtonSize?: string;
  switchRow?: string;
  switchGroup?: string;
  switchLabel?: string;
  switchRadio?: string;
  switchControl?: string;
  rightAlign?: string;
  transition?: string;
  collapsed?: string;
  treeContainer?: string;
  tree?: string;
  row?: string;
  connector?: string;
  rule?: string;
  ruleContent?: string;
  ruleActions?: string;
  ruleSet?: string;
  invalidRuleSet?: string;
  emptyWarning?: string;
  fieldControl?: string;
  fieldControlSize?: string;
  entityControl?: string;
  entityControlSize?: string;
  operatorControl?: string;
  operatorControlSize?: string;
  inputControl?: string;
  inputControlSize?: string;
  upIcon?: string;
  downIcon?: string;
  equalIcon?: string;
  searchIcon?: string;
  saveIcon?: string;
  collapsedSummary?: string;
}

export interface QueryBuilderConfig {
  fields: FieldMap;
  entities?: EntityMap;
  rulesLimit?: number;
  levelLimit?: number;
  allowEmptyRulesets?: boolean;
  getOperators?: (fieldName: string, field: Field) => string[];
  getInputType?: (field: string, operator: string) => string;
  getOptions?: (field: string) => Option[];
  addRuleSet?: (parent: RuleSet) => void;
  addRule?: (parent: RuleSet) => void;
  removeRuleSet?: (ruleset: RuleSet, parent: RuleSet) => void;
  removeRule?: (rule: Rule, parent: RuleSet) => void;
  coerceValueForOperator?: (operator: string, value: any, rule: Rule) => any;
  calculateFieldChangeValue?: (currentField: Field | undefined,
                               nextField: Field | undefined,
                               currentValue: any) => any;
  customCollapsedSummary?: (ruleset: RuleSet) => string;
  listNamedRulesets?: () => string[];
  getNamedRuleset?: (name: string) => RuleSet;
  saveNamedRuleset?: (ruleset: RuleSet) => void;
  deleteNamedRuleset?: (name: string) => void;
  editNamedRuleset?: (ruleset: RuleSet) => Promise<RuleSet | null> | RuleSet | null;
  rulesetNameSanitizer?: (value: string) => string;
}

export interface SwitchGroupContext {
  onChange: (conditionValue: string) => void;
  onChangeNot: (not: boolean) => void;
  allowNot: boolean;
  getDisabledState: () => boolean;
  $implicit: RuleSet;
}

export interface EmptyWarningContext {
  getDisabledState: () => boolean;
  message: string;
  $implicit: RuleSet;
}

export interface ArrowIconContext {
  getDisabledState: () => boolean;
  $implicit: RuleSet;
}

export interface EntityContext {
  onChange: any;
  getDisabledState: () => boolean;
  entities: Entity[];
  $implicit: Rule;
}

export interface FieldContext {
  onChange: (fieldValue: string, rule: Rule) => void;
  getFields: (entityName: string) => void;
  getDisabledState: () => boolean;
  fields: Field[];
  $implicit: Rule;
}

export interface OperatorContext {
  onChange: any;
  getDisabledState: () => boolean;
  operators: string[];
  $implicit: Rule;
}

export interface InputContext {
  onChange: () => void;
  getDisabledState: () => boolean;
  options: Option[];
  field: Field;
  $implicit: Rule;
}

export interface ButtonGroupContext {
  parentValue: RuleSet;
  addRule: any;
  addRuleSet: any;
  removeRuleSet: any;
  getDisabledState: () => boolean;
  $implicit: RuleSet;
}

export interface RulesetAddRuleButtonContext {
  addRule: () => void;
  getDisabledState: () => boolean;
  $implicit: Rule;
}

export interface RulesetAddRulesetButtonContext {
  addRuleSet: () => void;
  getDisabledState: () => boolean;
  $implicit: Rule;
}

export interface RulesetRemoveButtonContext {
  removeRuleSet: (ruleset: RuleSet) => void;
  getDisabledState: () => boolean;
  $implicit: Rule;
}

export interface RuleRemoveButtonContext {
  removeRule: (rule: Rule) => void;
  getDisabledState: () => boolean;
  $implicit: Rule;
}
