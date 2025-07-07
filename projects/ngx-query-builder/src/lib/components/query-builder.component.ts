import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { QueryOperatorDirective } from '../directives/query-operator.directive';
import { QueryFieldDirective } from '../directives/query-field.directive';
import { QueryEntityDirective } from '../directives/query-entity.directive';
import { QuerySwitchGroupDirective } from '../directives/query-switch-group.directive';
import { QueryButtonGroupDirective } from '../directives/query-button-group.directive';
import { QueryInputDirective } from '../directives/query-input.directive';
import { QueryRulesetAddRuleButtonDirective } from '../directives/query-ruleset-add-rule-button.directive';
import { QueryRulesetAddRulesetButtonDirective } from '../directives/query-ruleset-add-ruleset-button.directive';
import { QueryRulesetRemoveButtonDirective } from '../directives/query-ruleset-remove-button.directive';
import { QueryRuleRemoveButtonDirective } from '../directives/query-rule-remove-button.directive';
import { QueryEmptyWarningDirective } from '../directives/query-empty-warning.directive';
import { QueryArrowIconDirective } from '../directives/query-arrow-icon.directive';
import {
  ButtonGroupContext,
  Entity,
  Field,
  SwitchGroupContext,
  EntityContext,
  FieldContext,
  InputContext,
  LocalRuleMeta,
  OperatorContext,
  Option,
  QueryBuilderClassNames,
  QueryBuilderConfig,
  RuleRemoveButtonContext,
  ArrowIconContext,
  Rule,
  RuleSet,
  EmptyWarningContext, RulesetRemoveButtonContext, RulesetAddRulesetButtonContext, RulesetAddRuleButtonContext,
} from '../models/query-builder.interfaces';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  forwardRef,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ElementRef
} from '@angular/core';

export const CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true
};

export const VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true
};

@Component({
  selector: 'ngx-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css'],
  providers: [CONTROL_VALUE_ACCESSOR, VALIDATOR],
  standalone: false
})
export class QueryBuilderComponent implements OnChanges, ControlValueAccessor, Validator {
  public fields!: Field[];
  public entities!: Entity[];
  public defaultClassNames: QueryBuilderClassNames = {
    switchRow: 'q-switch-row',
    arrowIconButton: 'q-arrow-icon-button',
    arrowIcon: 'q-icon q-arrow-icon',
    removeIcon: 'q-icon q-remove-icon',
    addIcon: 'q-icon q-add-icon',
    button: 'q-button',
    buttonGroup: 'q-button-group',
    removeButton: 'q-remove-button',
    switchGroup: 'q-switch-group',
    switchLabel: 'q-switch-label',
    switchRadio: 'q-switch-radio',
    rightAlign: 'q-right-align',
    transition: 'q-transition',
    collapsed: 'q-collapsed',
    treeContainer: 'q-tree-container',
    tree: 'q-tree',
    row: 'q-row',
    connector: 'q-connector',
    rule: 'q-rule',
    ruleContent: 'q-rule-content',
    ruleActions: 'q-rule-actions',
    ruleSet: 'q-ruleset',
    invalidRuleSet: 'q-invalid-ruleset',
    emptyWarning: 'q-empty-warning',
    fieldControl: 'q-field-control',
    fieldControlSize: 'q-control-size',
    entityControl: 'q-entity-control',
    entityControlSize: 'q-control-size',
    operatorControl: 'q-operator-control',
    operatorControlSize: 'q-control-size',
    inputControl: 'q-input-control',
    inputControlSize: 'q-control-size',
    upIcon: 'q-icon q-up-icon',
    downIcon: 'q-icon q-down-icon',
    collapsedSummary: 'q-collapsed-summary'
  };
  public defaultOperatorMap: Record<string, string[]> = {
    string: ['=', '!=', 'contains', 'like'],
    number: ['=', '!=', '>', '>=', '<', '<='],
    time: ['=', '!=', '>', '>=', '<', '<='],
    date: ['=', '!=', '>', '>=', '<', '<='],
    category: ['=', '!=', 'in', 'not in'],
    boolean: ['=']
  };

  // For ControlValueAccessor interface
  public onChangeCallback!: () => void;
  public onTouchedCallback!: () => any;

  @Input() disabled!: boolean;
  @Input() level = 0;
  @Input() data: RuleSet = { condition: 'and', rules: [] };
  @Input() allowNot = false;
  @Input() allowRuleset = true;
  @Input() allowConvertToRuleset = false;
  @Input() allowCollapse = true;
  @Input() allowRuleUpDown = false;
  @Input() emptyMessage = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
  @Input() classNames!: QueryBuilderClassNames;
  @Input() operatorMap!: Record<string, string[]>;
  @Input() parentValue!: RuleSet;
  @Input() config: QueryBuilderConfig = { fields: {} };
  @Input() parentArrowIconTemplate!: QueryArrowIconDirective;
  @Input() parentInputTemplates!: QueryList<QueryInputDirective>;
  @Input() parentOperatorTemplate!: QueryOperatorDirective;
  @Input() parentFieldTemplate!: QueryFieldDirective;
  @Input() parentEntityTemplate!: QueryEntityDirective;
  @Input() parentSwitchGroupTemplate!: QuerySwitchGroupDirective;
  @Input() parentButtonGroupTemplate!: QueryButtonGroupDirective;
  @Input() parentRulesetAddRuleButtonTemplate!: QueryRulesetAddRuleButtonDirective;
  @Input() parentRulesetAddRulesetButtonTemplate!: QueryRulesetAddRulesetButtonDirective;
  @Input() parentRulesetRemoveButtonTemplate!: QueryRulesetRemoveButtonDirective;
  @Input() parentRuleRemoveButtonTemplate!: QueryRuleRemoveButtonDirective;
  @Input() parentEmptyWarningTemplate!: QueryEmptyWarningDirective;
  @Input() parentChangeCallback!: () => void;
  @Input() parentTouchedCallback!: () => void;
  @Input() persistValueOnFieldChange = false;

  @ViewChild('treeContainer', {static: true}) treeContainer!: ElementRef;
  public collapsed = false;

  @ContentChild(QueryButtonGroupDirective) buttonGroupTemplate!: QueryButtonGroupDirective;
  @ContentChild(QuerySwitchGroupDirective) switchGroupTemplate!: QuerySwitchGroupDirective;
  @ContentChild(QueryFieldDirective) fieldTemplate!: QueryFieldDirective;
  @ContentChild(QueryEntityDirective) entityTemplate!: QueryEntityDirective;
  @ContentChild(QueryOperatorDirective) operatorTemplate!: QueryOperatorDirective;
  @ContentChild(QueryRulesetAddRuleButtonDirective) rulesetAddRuleButtonTemplate!: QueryRulesetAddRuleButtonDirective;
  @ContentChild(QueryRulesetAddRulesetButtonDirective) rulesetAddRulesetButtonTemplate!: QueryRulesetAddRulesetButtonDirective;
  @ContentChild(QueryRulesetRemoveButtonDirective) rulesetRemoveButtonTemplate!: QueryRulesetRemoveButtonDirective;
  @ContentChild(QueryRuleRemoveButtonDirective) ruleRemoveButtonTemplate!: QueryRuleRemoveButtonDirective;
  @ContentChild(QueryEmptyWarningDirective) emptyWarningTemplate!: QueryEmptyWarningDirective;
  @ContentChild(QueryArrowIconDirective) arrowIconTemplate!: QueryArrowIconDirective;
  @ContentChildren(QueryInputDirective) inputTemplates!: QueryList<QueryInputDirective>;

  private defaultTemplateTypes: string[] = [
    'string', 'number', 'time', 'date', 'category', 'boolean', 'multiselect'];
  private defaultPersistValueTypes: string[] = [
    'string', 'number', 'time', 'date', 'boolean'];
  private defaultEmptyList: any[] = [];
  private operatorsCache!: Record<string, string[]>;
  private inputContextCache = new Map<Rule, InputContext>();
  private operatorContextCache = new Map<Rule, OperatorContext>();
  private fieldContextCache = new Map<Rule, FieldContext>();
  private entityContextCache = new Map<Rule, EntityContext>();
  private rulesetAddRuleButtonContextCache = new Map<Rule, RulesetAddRuleButtonContext>();
  private rulesetAddRulesetButtonContextCache = new Map<Rule, RulesetAddRulesetButtonContext>();
  private rulesetRemoveButtonContextCache = new Map<Rule, RulesetRemoveButtonContext>();
  private ruleRemoveButtonContextCache = new Map<Rule, RuleRemoveButtonContext>();
  private buttonGroupContext!: ButtonGroupContext;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  // ----------OnChanges Implementation----------

  ngOnChanges(changes: SimpleChanges) {
    const config = this.config;
    const type = typeof config;
    if (type === 'object') {
      this.fields = Object.keys(config.fields).map((value) => {
        const field = config.fields[value];
        field.value = field.value || value;
        return field;
      });
      if (config.entities) {
        this.entities = Object.keys(config.entities).map((value) => {
          const entity = config.entities?.[value];
          if (entity) {
            entity.value = entity.value || value;
          }
          return entity;
        }).filter((entity) => entity !== undefined) as Entity[];
      } else {
        this.entities = [];
      }
      this.operatorsCache = {};
    } else {
      throw new Error(`Expected 'config' must be a valid object, got ${type} instead.`);
    }

    if (changes['config']) {
      const prev: QueryBuilderConfig | undefined = changes['config'].previousValue;
      const prevHasEntities = prev && prev.entities;
      const currHasEntities = this.config.entities;
      if (prevHasEntities && !currHasEntities) {
        this.removeEntitiesFromRuleset(this.data);
        this.handleDataChange();
      } else if (!prevHasEntities && currHasEntities) {
        this.addEntitiesToRuleset(this.data);
        this.handleDataChange();
      }
    }

    // Handle allowNot changes
    if (changes['allowNot']) {
      this.updateNotProperty(this.data, this.allowNot);
      this.handleDataChange();
    }
  }

  // ----------Validator Implementation----------

  validate(): ValidationErrors | null {
    const errors: Record<string, any> = {};
    const ruleErrorStore: any[] = [];
    let hasErrors = false;

    if (!this.config.allowEmptyRulesets && this.checkEmptyRuleInRuleset(this.data)) {
      errors['empty'] = 'Empty rulesets are not allowed.';
      hasErrors = true;
    }

    this.validateRulesInRuleset(this.data, ruleErrorStore);

    if (ruleErrorStore.length) {
      errors['rules'] = ruleErrorStore;
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  }

  // ----------ControlValueAccessor Implementation----------

  @Input()
  get value(): RuleSet {
    return this.cleanData(this.data);
  }
  set value(value: RuleSet) {
    // When component is initialized without a formControl, null is passed to value
    this.data = value || { condition: 'and', rules: [] };
    this.handleDataChange();
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = () => fn(this.cleanData(this.data));
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = () => fn(this.data);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.detectChanges();
  }

  // ----------END----------

  getDisabledState = (): boolean => {
    return this.disabled;
  }

  findTemplateForRule(rule: Rule): TemplateRef<any> | undefined {
    const type = this.getInputType(rule.field, rule.operator);
    if (type) {
      const queryInput = this.findQueryInput(type);
      if (queryInput) {
        return queryInput.template;
      } else {
        if (this.defaultTemplateTypes.indexOf(type) === -1) {
          console.warn(`Could not find template for field with type: ${type}`);
        }
      }
    }
    return undefined;
  }

  findQueryInput(type: string): QueryInputDirective | undefined {
    const templates = this.parentInputTemplates || this.inputTemplates;
    return (templates || []).find((item: QueryInputDirective) => item.queryInputType === type);
  }

  getOperators(field: string): string[] {
    if (this.operatorsCache[field]) {
      return this.operatorsCache[field];
    }
    let operators = this.defaultEmptyList;
    const fieldObject = this.config.fields[field];

    if (this.config.getOperators) {
      return this.config.getOperators(field, fieldObject);
    }

    const type = fieldObject.type;

    if (fieldObject && fieldObject.operators) {
      operators = fieldObject.operators;
    } else if (type) {
      operators = (this.operatorMap && this.operatorMap[type]) || this.defaultOperatorMap[type] || this.defaultEmptyList;
      if (operators.length === 0) {
        console.warn(
          `No operators found for field '${field}' with type ${fieldObject.type}. ` +
          `Please define an 'operators' property on the field or use the 'operatorMap' binding to fix this.`);
      }
      if (fieldObject.nullable) {
        operators = operators.concat(['is null', 'is not null']);
      }
    } else {
      console.warn(`No 'type' property found on field: '${field}'`);
    }

    // Cache reference to array object, so it won't be computed next time and trigger a rerender.
    this.operatorsCache[field] = operators;
    return operators;
  }

  getFields(entity: string): Field[] {
    if (this.entities && this.entities.length > 0 && entity) {
      return this.fields.filter((field) => {
        return field && field.entity === entity;
      });
    } else {
      return this.fields;
    }
  }

  getInputType(field: string, operator: string): string | undefined {
    if (this.config.getInputType) {
      return this.config.getInputType(field, operator);
    }

    if (!this.config.fields[field]) {
      throw new Error(`No configuration for field '${field}' could be found! Please add it to config.fields.`);
    }

    const type = this.config.fields[field].type;
    switch (operator) {
      case 'is null':
      case 'is not null':
        return undefined;  // No displayed component
      case 'in':
      case 'not in':
        return type === 'category' || type === 'boolean' ? 'multiselect' : type;
      default:
        return type;
    }
  }

  getOptions(field: string): Option[] {
    if (this.config.getOptions) {
      return this.config.getOptions(field);
    }
    return this.config.fields[field].options || this.defaultEmptyList;
  }

  getClassNames(...args: any[]): string | undefined {
    const clsLookup = this.classNames ? this.classNames : this.defaultClassNames;
    const classNames = args.map((id) => (clsLookup as any)[id] || (this.defaultClassNames as any)[id]).filter((c) => !!c);
    return classNames.length ? classNames.join(' ') : undefined;
  }

  getDefaultField(entity: Entity | undefined): Field | undefined {
    if (!entity) {
      return undefined;
    } else if (entity.defaultField !== undefined) {
      return this.getDefaultValue(entity.defaultField);
    } else {
      const entityFields = this.fields.filter((field) => {
        return field && field.entity === entity.value;
      });
      if (entityFields && entityFields.length) {
        return entityFields[0];
      } else {
        console.warn(`No fields found for entity '${entity.name}'. ` +
          `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
        return undefined;
      }
    }
  }

  getDefaultOperator(field: Field): string | undefined {
    if (field && field.defaultOperator !== undefined) {
      return this.getDefaultValue(field.defaultOperator);
    } else {
      const operators = field && field.value ? this.getOperators(field.value) : [];
      if (operators && operators.length) {
        return operators[0];
      } else {
        console.warn(`No operators found for field '${field?.value}'. ` +
          `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
        return undefined;
      }
    }
  }

  addRule(parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    if (this.config.addRule) {
      this.config.addRule(parent);
    } else {
      const field = this.fields[0];
      if (field.value) {
        parent.rules = parent.rules.concat([{
          field: field.value,
          operator: this.getDefaultOperator(field) || '',
          value: this.getDefaultValue(field.defaultValue),
          entity: field.entity
        } as Rule] as Rule[]);
      }
    }

    this.handleTouched();
    this.handleDataChange();
  }

  removeRule(rule: Rule, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    if (this.config.removeRule) {
      this.config.removeRule(rule, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== rule);
    }
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.ruleRemoveButtonContextCache.delete(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  moveRuleUp(rule: Rule | RuleSet, parent?: RuleSet): void {
    this.moveRule(rule, parent, -1);
  }

  moveRuleDown(rule: Rule | RuleSet, parent?: RuleSet): void {
    this.moveRule(rule, parent, 1);
  }

  private moveRule(rule: Rule | RuleSet, parent: RuleSet | undefined, step: number): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    const index = parent.rules.indexOf(rule);
    const newIndex = index + step;
    if (index === -1 || newIndex < 0 || newIndex >= parent.rules.length) {
      return;
    }
    parent.rules.splice(index, 1);
    parent.rules.splice(newIndex, 0, rule);

    this.handleTouched();
    this.handleDataChange();
  }

  convertToRuleset(rule: Rule, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    const index = parent.rules.indexOf(rule);
    if (index === -1) {
      return;
    }

    const newRule: Rule = { ...rule };
    const rs: RuleSet = { condition: 'or', rules: [newRule] };
    if (this.allowNot) {
      rs.not = false;
    }

    parent.rules.splice(index, 1, rs);

    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.ruleRemoveButtonContextCache.delete(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  convertRulesetToRule(ruleset?: RuleSet, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    ruleset = ruleset || this.data;
    parent = parent || this.parentValue;
    if (!parent || !ruleset) {
      return;
    }

    const index = parent.rules.indexOf(ruleset);
    if (index === -1 || !ruleset.rules || ruleset.rules.length !== 1) {
      return;
    }

    parent.rules.splice(index, 1, ruleset.rules[0]);

    this.handleTouched();
    this.handleDataChange();
  }

  addRuleSet(parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    if (this.config.addRuleSet) {
      this.config.addRuleSet(parent);
    } else {
      const rs: RuleSet = { condition: 'and', rules: [] };
      if (this.allowNot) {
        rs.not = false;
      }
      parent.rules = parent.rules.concat([rs]);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  removeRuleSet(ruleset?: RuleSet, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    ruleset = ruleset || this.data;
    parent = parent || this.parentValue;
    if (this.config.removeRuleSet) {
      this.config.removeRuleSet(ruleset, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== ruleset);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  transitionEnd(): void {
    if (this.treeContainer) {
      this.treeContainer.nativeElement.style.maxHeight = null;
    }
  }

  toggleCollapse(): void {
    this.computedTreeContainerHeight();
    setTimeout(() => {
      this.collapsed = !this.collapsed;
    }, 100);
  }

  computedTreeContainerHeight(): void {
    const nativeElement: HTMLElement = this.treeContainer?.nativeElement;
    if (nativeElement && nativeElement.firstElementChild) {
      nativeElement.style.maxHeight = (nativeElement.firstElementChild.clientHeight + 8) + 'px';
    }
  }

  changeCondition(value: string): void {
    if (this.disabled) {
      return;
    }

    this.data.condition = value;
    this.handleTouched();
    this.handleDataChange();
  }

  changeNot(value: boolean): void {
    if (this.disabled) {
      return;
    }

    this.data.not = value;
    this.handleTouched();
    this.handleDataChange();
  }

  changeOperator(rule: Rule): void {
    if (this.disabled) {
      return;
    }

    if (this.config.coerceValueForOperator) {
      rule.value = this.config.coerceValueForOperator(rule.operator, rule.value, rule);
    } else {
      rule.value = this.coerceValueForOperator(rule.operator, rule.value, rule);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  coerceValueForOperator(operator: string, value: any, rule: Rule): any {
    const inputType: string | undefined = this.getInputType(rule.field, operator);
    if (inputType === 'multiselect' && !Array.isArray(value)) {
      return [value];
    }
    return value;
  }

  changeInput(): void {
    if (this.disabled) {
      return;
    }

    this.handleTouched();
    this.handleDataChange();
  }

  changeField(fieldValue: string, rule: Rule): void {
    if (this.disabled) {
      return;
    }

    const inputContext = this.inputContextCache.get(rule);
    const currentField = inputContext && inputContext.field;

    const nextField: Field = this.config.fields[fieldValue];

    const nextValue = this.calculateFieldChangeValue(
      currentField, nextField, rule.value);

    if (nextValue !== undefined) {
      rule.value = nextValue;
    } else {
      delete rule.value;
    }

    rule.operator = this.getDefaultOperator(nextField) || '';

    // Create new context objects so templates will automatically update
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.getInputContext(rule);
    this.getFieldContext(rule);
    this.getOperatorContext(rule);
    this.getEntityContext(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  changeEntity(entityValue: string, rule: Rule, index: number, data: RuleSet): void {
    if (this.disabled) {
      return;
    }
    let i = index;
    let rs = data;
    const entity: Entity | undefined = this.entities.find((e) => e?.value === entityValue);
    const defaultField: Field | undefined = this.getDefaultField(entity);
    if (!rs) {
      rs = this.data;
      i = rs.rules.findIndex((x) => x === rule);
    }
    rule.field = defaultField && defaultField.value || '';
    rs.rules[i] = rule;
    if (defaultField) {
      this.changeField(rule.field, rule);
    } else {
      this.handleTouched();
      this.handleDataChange();
    }
  }

  getDefaultValue(defaultValue: any): any {
    switch (typeof defaultValue) {
      case 'function':
        return defaultValue();
      default:
        return defaultValue;
    }
  }

  getOperatorTemplate(): TemplateRef<any> | undefined {
    const t = this.parentOperatorTemplate || this.operatorTemplate;
    return t?.template;
  }

  getFieldTemplate(): TemplateRef<any> | undefined {
    const t = this.parentFieldTemplate || this.fieldTemplate;
    return t?.template;
  }

  getEntityTemplate(): TemplateRef<any> | undefined {
    const t = this.parentEntityTemplate || this.entityTemplate;
    return t?.template;
  }

  getArrowIconTemplate(): TemplateRef<any> | undefined {
    const t = this.parentArrowIconTemplate || this.arrowIconTemplate;
    return t?.template;
  }

  getButtonGroupTemplate(): TemplateRef<any> | undefined {
    const t = this.parentButtonGroupTemplate || this.buttonGroupTemplate;
    return t?.template;
  }

  getSwitchGroupTemplate(): TemplateRef<any> | undefined {
    const t = this.parentSwitchGroupTemplate || this.switchGroupTemplate;
    return t?.template;
  }

  getRulesetAddRuleButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.parentRulesetAddRuleButtonTemplate || this.rulesetAddRuleButtonTemplate;
    return t?.template;
  }

  getRulesetAddRulesetButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.parentRulesetAddRulesetButtonTemplate || this.rulesetAddRulesetButtonTemplate;
    return t?.template;
  }

  getRulesetRemoveButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.parentRulesetRemoveButtonTemplate || this.rulesetRemoveButtonTemplate;
    return t?.template;
  }

  getRuleRemoveButtonTemplate(): TemplateRef<any> | undefined {
    const t = this.parentRuleRemoveButtonTemplate || this.ruleRemoveButtonTemplate;
    return t?.template;
  }

  getEmptyWarningTemplate(): TemplateRef<any> | undefined {
    const t = this.parentEmptyWarningTemplate || this.emptyWarningTemplate;
    return t?.template;
  }

  getQueryItemClassName(): string | undefined {
    return this.getClassNames('row', 'connector', 'transition');
  }

  getQueryRulesetClassName(local: LocalRuleMeta): string | undefined {
    let cls = this.getClassNames('ruleSet');
    if (local.invalid) {
      cls += ' ' + this.getClassNames('invalidRuleSet');
    }
    return cls;
  }

  getQueryRuleClassName(): string | undefined {
    return this.getClassNames('rule');
  }

  getButtonGroupContext(): ButtonGroupContext {
    if (!this.buttonGroupContext) {
      this.buttonGroupContext = {
        parentValue: this.parentValue,
        addRule: this.addRule.bind(this),
        addRuleSet: this.allowRuleset && this.addRuleSet.bind(this),
        removeRuleSet: this.allowRuleset && this.parentValue && this.removeRuleSet.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: this.data
      };
    }
    return this.buttonGroupContext;
  }

  getRulesetAddRuleButtonContext(rule: Rule): RulesetAddRuleButtonContext | undefined {
    if (!this.rulesetAddRuleButtonContextCache.has(rule)) {
      this.rulesetAddRuleButtonContextCache.set(rule, {
        addRule: this.addRule.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.rulesetAddRuleButtonContextCache.get(rule);
  }

  getRulesetAddRulesetButtonContext(rule: Rule): RulesetAddRulesetButtonContext | undefined {
    if (!this.rulesetAddRulesetButtonContextCache.has(rule)) {
      this.rulesetAddRulesetButtonContextCache.set(rule, {
        addRuleSet: this.addRuleSet.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.rulesetAddRulesetButtonContextCache.get(rule);
  }

  getRulesetRemoveButtonContext(rule: Rule): RulesetRemoveButtonContext | undefined {
    if (!this.rulesetRemoveButtonContextCache.has(rule)) {
      this.rulesetRemoveButtonContextCache.set(rule, {
        removeRuleSet: this.removeRuleSet.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.rulesetRemoveButtonContextCache.get(rule);
  }

  getRuleRemoveButtonContext(rule: Rule): RuleRemoveButtonContext | undefined {
    if (!this.ruleRemoveButtonContextCache.has(rule)) {
      this.ruleRemoveButtonContextCache.set(rule, {
        removeRule: this.removeRule.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule
      });
    }
    return this.ruleRemoveButtonContextCache.get(rule);
  }

  getFieldContext(rule: Rule): FieldContext | undefined {
    if (!this.fieldContextCache.has(rule)) {
      this.fieldContextCache.set(rule, {
        onChange: this.changeField.bind(this),
        getFields: this.getFields.bind(this),
        getDisabledState: this.getDisabledState,
        fields: this.fields,
        $implicit: rule
      });
    }
    return this.fieldContextCache.get(rule);
  }

  getEntityContext(rule: Rule): EntityContext | undefined {
    if (!this.entityContextCache.has(rule)) {
      this.entityContextCache.set(rule, {
        onChange: this.changeEntity.bind(this),
        getDisabledState: this.getDisabledState,
        entities: this.entities,
        $implicit: rule
      });
    }
    return this.entityContextCache.get(rule);
  }

  getSwitchGroupContext(): SwitchGroupContext {
    return {
      onChange: this.changeCondition.bind(this),
      onChangeNot: this.changeNot.bind(this),
      allowNot: this.allowNot,
      getDisabledState: this.getDisabledState,
      $implicit: this.data
    };
  }

  getArrowIconContext(): ArrowIconContext {
    return {
      getDisabledState: this.getDisabledState,
      $implicit: this.data
    };
  }

  getEmptyWarningContext(): EmptyWarningContext {
    return {
      getDisabledState: this.getDisabledState,
      message: this.emptyMessage,
      $implicit: this.data
    };
  }

  getOperatorContext(rule: Rule): OperatorContext | undefined {
    if (!this.operatorContextCache.has(rule)) {
      this.operatorContextCache.set(rule, {
        onChange: this.changeOperator.bind(this),
        getDisabledState: this.getDisabledState,
        operators: this.getOperators(rule.field),
        $implicit: rule
      });
    }
    return this.operatorContextCache.get(rule);
  }

  getInputContext(rule: Rule): InputContext | undefined {
    if (!this.inputContextCache.has(rule)) {
      this.inputContextCache.set(rule, {
        onChange: this.changeInput.bind(this),
        getDisabledState: this.getDisabledState,
        options: this.getOptions(rule.field),
        field: this.config.fields[rule.field],
        $implicit: rule
      });
    }
    return this.inputContextCache.get(rule);
  }

  isRule(rule: Rule | RuleSet): rule is Rule {
    return !(rule as RuleSet).rules;
  }

  isRuleset(rule: Rule | RuleSet): rule is RuleSet {
    return !!(rule as RuleSet).rules;
  }

  isEmptyRuleset(rule: any): boolean {
    return rule.rules && rule.rules.length === 0;
  }

  private calculateFieldChangeValue(
    currentField: Field | undefined,
    nextField: Field | undefined,
    currentValue: any
  ): any {

    if (this.config.calculateFieldChangeValue) {
      return this.config.calculateFieldChangeValue(
        currentField, nextField, currentValue);
    }

    const canKeepValue = () => {
      if (!currentField || !nextField) {
        return false;
      }
      return currentField.type === nextField.type
        && this.defaultPersistValueTypes.indexOf(currentField.type) !== -1;
    };

    if (this.persistValueOnFieldChange && canKeepValue()) {
      return currentValue;
    }

    if (nextField && nextField.defaultValue !== undefined) {
      return this.getDefaultValue(nextField.defaultValue);
    }

    return undefined;
  }

  private checkEmptyRuleInRuleset(ruleset: RuleSet): boolean {
    if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
      return true;
    } else {
      return ruleset.rules.some((item: RuleSet | Rule) => {
        if ((item as RuleSet).rules) {
          return this.checkEmptyRuleInRuleset(item as RuleSet);
        } else {
          return false;
        }
      });
    }
  }

  private validateRulesInRuleset(ruleset: RuleSet, errorStore: any[]) {
    if (ruleset && ruleset.rules && ruleset.rules.length > 0) {
      ruleset.rules.forEach((item) => {
        if ((item as RuleSet).rules) {
          return this.validateRulesInRuleset(item as RuleSet, errorStore);
        } else if ((item as Rule).field) {
          const field = this.config.fields[(item as Rule).field];
          if (field && field.validator) {
            const error = field.validator(item as Rule, ruleset);
            if (error != null) {
              errorStore.push(error);
            }
          } else if (field && field.type === 'textarea') {
            const rule = item as Rule;
            const requiresValue = rule.operator !== 'is null' && rule.operator !== 'is not null';
            if (requiresValue && (typeof rule.value !== 'string' || rule.value.trim() === '')) {
              errorStore.push({ field: rule.field, error: 'required' });
            }
          }
        }
      });
    }
  }

  private handleDataChange(): void {
    this.changeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
  }

  private handleTouched(): void {
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }
  }

  private updateNotProperty(ruleset: RuleSet, allowNot: boolean): void {
    if (allowNot) {
      // Add 'not' property if it doesn't exist
      if (!ruleset.hasOwnProperty('not')) {
        ruleset.not = false;
      }
    } else {
      // Remove 'not' property if it exists
      if (ruleset.hasOwnProperty('not')) {
        delete ruleset.not;
      }
    }
    
    // Recursively update nested rulesets
    if (ruleset.rules) {
      ruleset.rules.forEach((rule: Rule | RuleSet) => {
        if (this.isRuleset(rule)) {
          this.updateNotProperty(rule, allowNot);
        }
      });
    }
  }

  private addEntitiesToRuleset(ruleset: RuleSet): void {
    if (!ruleset.rules) { return; }
    ruleset.rules.forEach((rule: Rule | RuleSet) => {
      if (this.isRuleset(rule)) {
        this.addEntitiesToRuleset(rule);
      } else {
        if (!('entity' in rule) || !rule.entity) {
          const fieldConf = this.config.fields[rule.field];
          let entity = fieldConf && fieldConf.entity;
          if (!entity) {
            const matched = Object.values(this.config.fields).find(f => (f as Field).name === rule.field && (f as Field).entity);
            if (matched) {
              entity = (matched as Field).entity;
            }
          }
          if (entity) {
            rule.entity = entity;
          }
        }
      }
    });
  }

  private removeEntitiesFromRuleset(ruleset: RuleSet): void {
    if (!ruleset.rules) { return; }
    ruleset.rules.forEach((rule: Rule | RuleSet) => {
      if (this.isRuleset(rule)) {
        this.removeEntitiesFromRuleset(rule);
      } else {
        if (rule.hasOwnProperty('entity')) {
          delete (rule as Rule).entity;
        }
      }
    });
  }

  private cleanData(data: RuleSet): RuleSet {
    // Create a deep copy to avoid modifying the original data
    const cleanedData = JSON.parse(JSON.stringify(data));
    
    // Remove 'not' property if allowNot is false
    if (!this.allowNot && cleanedData.hasOwnProperty('not')) {
      delete cleanedData.not;
    }
    
    // Recursively clean nested rulesets
    if (cleanedData.rules) {
      cleanedData.rules = cleanedData.rules.map((rule: Rule | RuleSet) => {
        if (this.isRuleset(rule)) {
          return this.cleanData(rule);
        } else {
          if (this.config.entities) {
            if (!('entity' in rule) || !rule.entity) {
              const fieldConf = this.config.fields[rule.field];
              let entity = fieldConf && fieldConf.entity;
              if (!entity) {
                const matched = Object.values(this.config.fields).find(f => (f as Field).name === rule.field && (f as Field).entity);
                if (matched) {
                  entity = (matched as Field).entity;
                }
              }
              if (entity) {
                (rule as Rule).entity = entity;
              }
            }
          } else {
            if (rule.hasOwnProperty('entity')) {
              delete (rule as Rule).entity;
            }
          }
          return rule;
        }
      });
    }
    
    return cleanedData;
  }

}
