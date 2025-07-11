import { FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet, Rule } from 'ngx-query-builder';
import { EditRulesetDialogComponent } from './edit-ruleset-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  standalone: false
})
export class AppComponent implements OnInit {
  public queryCtrl: FormControl;
  public queryText: string = '';
  public queryTextState: 'valid' | 'invalid-json' | 'invalid-query' = 'valid';
  public queryTitle = '';

  public namedRulesets: Record<string, RuleSet> = {};
  public useSavedRulesets = false;

  public bootstrapClassNames: QueryBuilderClassNames = {
    removeIcon: 'fa fa-minus',
    addIcon: 'fa fa-plus',
    arrowIcon: 'fa fa-chevron-right px-2',
    button: 'btn',
    buttonGroup: 'btn-group',
    rightAlign: 'order-12 ml-auto',
    switchRow: 'd-flex px-2',
    switchGroup: 'd-flex align-items-center',
    switchRadio: 'custom-control-input',
    switchLabel: 'custom-control-label',
    switchControl: 'custom-control custom-radio custom-control-inline',
    row: 'row p-2 m-1',
    rule: 'border',
    ruleSet: 'border',
    invalidRuleSet: 'alert alert-danger',
    emptyWarning: 'text-danger mx-auto',
    operatorControl: 'form-control',
    operatorControlSize: 'col-auto pr-0',
    fieldControl: 'form-control',
    fieldControlSize: 'col-auto pr-0',
    entityControl: 'form-control',
    entityControlSize: 'col-auto pr-0',
    inputControl: 'form-control',
    inputControlSize: 'col-auto'
  };

  public query = {
    condition: 'and',
    rules: [
      {field: 'age', operator: '<='},
      {field: 'birthday', operator: '=', value: new Date()},
      {
        condition: 'or',
        rules: [
          {field: 'gender', operator: '='},
          {field: 'occupation', operator: 'in'},
          {field: 'school', operator: 'is null'},
          {field: 'notes', operator: '='}
        ]
      }
    ]
  };

  public entityConfig: QueryBuilderConfig = {
    entities: {
      physical: {name: 'Physical Attributes'},
      nonphysical: {name: 'Nonphysical Attributes'}
    },
    fields: {
      age: {name: 'Age', type: 'number', entity: 'physical'},
      gender: {
        name: 'Gender',
        entity: 'physical',
        type: 'category',
        options: [
          {name: 'Male', value: 'm'},
          {name: 'Female', value: 'f'}
        ]
      },
      name: {name: 'Name', type: 'string', entity: 'nonphysical'},
      notes: {name: 'Notes', type: 'textarea', operators: ['=', '!='], entity: 'nonphysical'},
      educated: {name: 'College Degree?', type: 'boolean', entity: 'nonphysical'},
      birthday: {name: 'Birthday', type: 'date', operators: ['=', '<=', '>'],
        defaultValue: (() => new Date()), entity: 'nonphysical'
      },
      school: {name: 'School', type: 'string', nullable: true, entity: 'nonphysical'},
      occupation: {
        name: 'Occupation',
        entity: 'nonphysical',
        type: 'category',
        options: [
          {name: 'Student', value: 'student'},
          {name: 'Teacher', value: 'teacher'},
          {name: 'Unemployed', value: 'unemployed'},
          {name: 'Scientist', value: 'scientist'}
        ]
      }    
    }
  };

  public config: QueryBuilderConfig = {
    fields: {
      age: {name: 'Age', type: 'number'},
      gender: {
        name: 'Gender',
        type: 'category',
        options: [
          {name: 'Male', value: 'm'},
          {name: 'Female', value: 'f'}
        ]
      },
      name: {name: 'Name', type: 'string'},
      notes: {name: 'Notes', type: 'textarea', operators: ['=', '!=']},
      educated: {name: 'College Degree?', type: 'boolean'},
      birthday: {name: 'Birthday', type: 'date', operators: ['=', '<=', '>'],
        defaultValue: (() => new Date())
      },
      school: {name: 'School', type: 'string', nullable: true},
      occupation: {
        name: 'Occupation',
        type: 'category',
        options: [
          {name: 'Student', value: 'student'},
          {name: 'Teacher', value: 'teacher'},
          {name: 'Unemployed', value: 'unemployed'},
          {name: 'Scientist', value: 'scientist'}
        ]
      },
      repositories: {
        name: 'Repositories',
        type: 'category',
        validator: (r, p) => this.repositoriesValidator(r, p),
        categorySource: (r, p) => this.repositoriesCategorySource(r, p)
      },
      github: {
        name: 'Github Id',
        type: 'string',
        validator: (r, p) => this.githubValidator(r),
        operators: ['=']
      }
    }
  };

  public currentConfig!: QueryBuilderConfig;
  public allowRuleset: boolean = true;
  public allowCollapse: boolean = true;
  public allowNot: boolean = false;
  public allowConvertToRuleset: boolean = false;
  public allowRuleUpDown: boolean = false;
  public hideButtons: boolean = false;
  public persistValueOnFieldChange: boolean = false;
  public useCollapsedSummary: boolean = false;
  public ruleName: string = 'Rule';
  public rulesetName: string = 'Ruleset';
  public useExpressionNames: boolean = false;

  public collapsedSummary(ruleset: RuleSet): string {
    const names = new Set<string>();
    const walk = (rs: RuleSet) => {
      rs.rules.forEach(r => {
        if ((r as Rule).field) {
          const field = this.currentConfig.fields[(r as Rule).field];
          names.add(field?.name || (r as Rule).field);
        } else if ((r as RuleSet).rules) {
          walk(r as RuleSet);
        }
      });
    };
    walk(ruleset);
    return Array.from(names).join(', ');
  }

  private githubValidator(rule: Rule): any | null {
    const id = String(rule.value || '').trim();
    if (!id) {
      return { field: rule.field, error: 'required' };
    }
    try {
      const req = new XMLHttpRequest();
      req.open('GET', `https://api.github.com/users/${encodeURIComponent(id)}`, false);
      req.send();
      if (req.status === 404) {
        return { field: rule.field, error: 'notfound' };
      }
    } catch {
      return { field: rule.field, error: 'notfound' };
    }
    return null;
  }

  private repositoriesValidator(rule: Rule, parent: RuleSet): any | null {
    if (parent.condition !== 'and') {
      return { field: rule.field, error: 'parent-not-and' };
    }
    const githubRule = parent.rules.find(r => (r as Rule).field === 'github') as Rule | undefined;
    if (!githubRule) {
      return { field: rule.field, error: 'missing-github' };
    }
    const err = this.githubValidator(githubRule);
    if (err) {
      return { field: rule.field, error: 'invalid-github' };
    }
    return null;
  }

  private repositoriesCategorySource(rule: Rule, parent: RuleSet): string[] | null {
    const githubRule = parent.rules.find(r => (r as Rule).field === 'github') as Rule | undefined;
    const id = githubRule && String(githubRule.value || '').trim();
    if (!id) {
      return null;
    }
    try {
      const req = new XMLHttpRequest();
      req.open('GET', `https://api.github.com/users/${encodeURIComponent(id)}/repos`, false);
      req.send();
      if (req.status === 200) {
        const data = JSON.parse(req.responseText);
        return Array.isArray(data) ? data.map((d: any) => d.name) : null;
      }
    } catch {
      // ignore errors
    }
    return null;
  }

  listNamedRulesets(): string[] {
    return Object.keys(this.namedRulesets);
  }

  getNamedRuleset(name: string): RuleSet {
    return JSON.parse(JSON.stringify(this.namedRulesets[name]));
  }

  saveNamedRuleset(ruleset: RuleSet) {
    if (ruleset.name) {
      this.namedRulesets[ruleset.name] = JSON.parse(JSON.stringify(ruleset));
    }
  }

  deleteNamedRuleset(name: string) {
    delete this.namedRulesets[name];
  }

  editNamedRuleset(ruleset: RuleSet): Promise<RuleSet | null> {
    return firstValueFrom(this.dialog.open(EditRulesetDialogComponent, {
      data: {
        ruleset: JSON.parse(JSON.stringify(ruleset)),
        rulesetName: this.rulesetName,
        validate: (rs: any) => this.validateRuleset(rs)
      },
      width: '800px',
      panelClass: 'resizable-dialog',
      autoFocus: false
    }).afterClosed());
  }

  updateNamedRulesetsUsage() {
    if (this.useSavedRulesets) {
      this.currentConfig = {
        ...this.currentConfig,
        listNamedRulesets: this.listNamedRulesets.bind(this),
        getNamedRuleset: this.getNamedRuleset.bind(this),
        saveNamedRuleset: this.saveNamedRuleset.bind(this),
        deleteNamedRuleset: this.deleteNamedRuleset.bind(this),
        editNamedRuleset: this.editNamedRuleset.bind(this)
      } as QueryBuilderConfig;
    } else {
      const {
        listNamedRulesets,
        getNamedRuleset,
        saveNamedRuleset,
        deleteNamedRuleset,
        editNamedRuleset,
        ...rest
      } = this.currentConfig as any;
      this.currentConfig = rest;
    }
  }

  updateCollapsedSummary() {
    this.currentConfig = {
      ...this.currentConfig,
      customCollapsedSummary: this.useCollapsedSummary ? this.collapsedSummary.bind(this) : undefined
    } as QueryBuilderConfig;
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.queryCtrl = this.formBuilder.control(this.query);
    this.currentConfig = this.config;
    this.updateNamedRulesetsUsage();
    this.updateCollapsedSummary();
    this.queryText = JSON.stringify(this.queryCtrl.value, null, 2);
    if (this.validateQuery(this.queryCtrl.value)) {
      this.queryTextState = 'valid';
      this.queryTitle = '';
    } else {
      this.queryTextState = 'invalid-query';
      this.queryTitle = 'Invalid query';
    }
  }

  ngOnInit(): void {
    this.queryCtrl.valueChanges.subscribe(value => {
      this.queryText = JSON.stringify(value, null, 2);
      if (this.validateQuery(value)) {
        this.queryTextState = 'valid';
        this.queryTitle = '';
      } else {
        this.queryTextState = 'invalid-query';
        this.queryTitle = 'Invalid query';
      }
    });
  }

  updateQuery(text: string): void {
    try {
      const val = JSON.parse(text.trim());
      if (this.validateQuery(val)) {
        this.queryCtrl.setValue(val);
        this.queryTextState = 'valid';
        this.queryTitle = '';
      } else {
        this.queryTextState = 'invalid-query';
        this.queryTitle = 'Invalid query';
      }
    } catch {
      this.queryTextState = 'invalid-json';
      this.queryTitle = 'Invalid JSON';
      // ignore invalid JSON
    }
  }

  private validateQuery(value: any): boolean {
    return this.validateRuleset(value);
  }

  private validateRuleset(ruleset: any): boolean {
    if (!ruleset || typeof ruleset !== 'object' || Array.isArray(ruleset)) {
      return false;
    }
    const keys = Object.keys(ruleset);
    if (keys.some(k => !['condition', 'rules', 'not', 'name'].includes(k))) {
      return false;
    }
    if (!('condition' in ruleset) || !('rules' in ruleset)) {
      return false;
    }
    if (ruleset.condition !== 'and' && ruleset.condition !== 'or') {
      return false;
    }
    if ('not' in ruleset && typeof ruleset.not !== 'boolean') {
      return false;
    }
    if ('name' in ruleset && typeof ruleset.name !== 'string') {
      return false;
    }
    if (!Array.isArray(ruleset.rules)) {
      return false;
    }
    if (ruleset.rules.length === 0) {
      return false;
    }
    return ruleset.rules.every((r: any) => {
      if (r && typeof r === 'object' && 'rules' in r) {
        return this.validateRuleset(r);
      } else {
        return this.validateRule(r, ruleset);
      }
    });
  }

  private validateRule(rule: any, parent?: RuleSet): boolean {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      return false;
    }
    const keys = Object.keys(rule);
    if (keys.some(k => !['field', 'operator', 'value', 'entity'].includes(k))) {
      return false;
    }
    if (!('field' in rule) || !('operator' in rule)) {
      return false;
    }
    const requiresValue = rule.operator !== 'is null' && rule.operator !== 'is not null';
    if (requiresValue && !('value' in rule)) {
      return false;
    }

    const fieldConf = this.currentConfig.fields[rule.field];
    if (!fieldConf) {
      return false;
    }

    const ops = this.getOperatorsForField(rule.field, fieldConf);
    if (!ops.includes(rule.operator)) {
      return false;
    }

    if (requiresValue) {
      const val = rule.value;
      switch (fieldConf.type) {
        case 'string':
        case 'textarea':
          if (typeof val !== 'string') {
            return false;
          }
          break;
        case 'number':
          if (typeof val !== 'number' || isNaN(val)) {
            return false;
          }
          break;
        case 'time':
          if (typeof val !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(val)) {
            return false;
          }
          break;
        case 'date':
          if (typeof val === 'string') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(Date.parse(val))) {
              return false;
            }
          } else {
            return false;
          }
          break;
        case 'category':
          const optionValues = fieldConf.options
            ? fieldConf.options.map(o => o.value)
            : (fieldConf.categorySource && parent
              ? fieldConf.categorySource(rule, parent)
              : null);
          if (rule.operator === 'in' || rule.operator === 'not in') {
            if (!Array.isArray(val) || val.length === 0) {
              return false;
            }
            if (optionValues && val.some((v: any) => !optionValues!.includes(v))) {
              return false;
            }
          } else {
            if (optionValues && !optionValues.includes(val)) {
              return false;
            }
          }
          break;
        case 'boolean':
          if (val !== true && val !== false) {
            return false;
          }
          break;
        case 'multiselect':
          if (!Array.isArray(val)) {
            return false;
          }
          if (fieldConf.options && val.some((v: any) => !fieldConf.options!.some(o => o.value === v))) {
            return false;
          }
          break;
      }
    }

    if ('entity' in rule && this.currentConfig.entities && !this.currentConfig.entities[rule.entity]) {
      return false;
    }

    return true;
  }

  private getOperatorsForField(fieldName: string, field: any): string[] {
    if (this.currentConfig.getOperators) {
      return this.currentConfig.getOperators(fieldName, field);
    }
    let ops: string[] = [];
    if (field.operators) {
      ops = field.operators.slice();
    } else {
      const map: Record<string, string[]> = {
        string: ['=', '!=', 'contains', 'like'],
        number: ['=', '!=', '>', '>=', '<', '<='],
        time: ['=', '!=', '>', '>=', '<', '<='],
        date: ['=', '!=', '>', '>=', '<', '<='],
        category: ['=', '!=', 'in', 'not in'],
        boolean: ['='],
        multiselect: ['in', 'not in']
      };
      ops = map[field.type] || [];
    }
    if (field.nullable) {
      ops = ops.concat(['is null', 'is not null']);
    }
    return ops;
  }

  switchModes(event: Event) {
    this.currentConfig = (<HTMLInputElement>event.target).checked ? this.entityConfig : this.config;
    this.updateNamedRulesetsUsage();
    this.updateCollapsedSummary();
  }

  changeDisabled(event: Event) {
    (<HTMLInputElement>event.target).checked ? this.queryCtrl.disable() : this.queryCtrl.enable();
  }

  changeRulesLimit(event: Event) {
    this.currentConfig = {...this.currentConfig, rulesLimit: parseInt((<HTMLInputElement>event.target).value, 10)} as QueryBuilderConfig;
    this.updateCollapsedSummary();
  }

  changeLevelLimit(event: Event) {
    this.currentConfig = {...this.currentConfig, levelLimit: parseInt((<HTMLInputElement>event.target).value, 10)} as QueryBuilderConfig;
    this.updateCollapsedSummary();
  }

  toggleExpressionNames() {
    if (this.useExpressionNames) {
      this.ruleName = 'Expression';
      this.rulesetName = 'Query';
    } else {
      this.ruleName = 'Rule';
      this.rulesetName = 'Ruleset';
    }
  }
}
