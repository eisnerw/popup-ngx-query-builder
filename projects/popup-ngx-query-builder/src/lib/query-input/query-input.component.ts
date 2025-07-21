import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TreeModule } from 'primeng/tree';
import { QueryBuilderModule, QueryBuilderConfig, RuleSet, Rule } from 'ngx-query-builder';
import { bqlToRuleset, rulesetToBql, validateBql } from '../bql';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EditRulesetDialogComponent } from './edit-ruleset-dialog.component';

@Component({
  selector: 'lib-query-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TreeModule,
    QueryBuilderModule
  ],
  styleUrls: ['./query-input.component.scss'],
  templateUrl: './query-input.component.html'
})
export class QueryInputComponent implements OnInit {
  @Input() placeholder = 'Enter query';
  @Input() query = '';
  @Input() config?: QueryBuilderConfig;
  @Input() allowNot = true;
  @Input() allowConvertToRuleset = true;
  @Input() allowRuleUpDown = true;
  @Input() ruleName = 'Rule';
  @Input() rulesetName = 'Ruleset';
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: RuleSet = { condition: 'and', rules: [] };
  namedRulesets: Record<string, RuleSet> = {};
  validQuery = true;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.onQueryChange();
  }

  startEdit() {
    this.editing = true;
    this.onQueryChange();
  }

  onQueryChange() {
    this.validQuery = validateBql(this.query, this.queryBuilderConfig);
  }

  // Default configuration for the query builder
  defaultConfig: QueryBuilderConfig = {
    fields: {
      document: { name: 'Document', type: 'string', operators: ["contains", "!contains"]},
      // lname: { name: 'Last Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
      lname: {
        name: 'Last Name',
        type: 'category'
      },
      fname: { name: 'First Name', type: 'string', operators: ['=', '!=', 'contains', '!contains', 'like', '!like', 'exists'] },
      isAlive: { name: 'Alive?', type: 'boolean' },
      categories: { name: 'Category', type: 'string', operators: ["contains", "!contains", "exists"]},
      dob: {
        name: 'Birthday', type: 'date', operators: ['=', '<=', '>', '<', '>='],
        defaultValue: (() => new Date())
      },
      sign: {
        name: 'Astrological Sign',
        type: 'category',
        options: [
          { name: 'Aries', value: 'aries' },
          { name: 'Taurus', value: 'taurus' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Cancer', value: 'cancer' },
          { name: 'Leo', value: 'leo' },
          { name: 'Virgo', value: 'virgo' },
          { name: 'Libra', value: 'libra' },
          { name: 'Scorpio', value: 'scorpio' },
          { name: 'Sagittarius', value: 'sagittarius' },
          { name: 'Capricorn', value: 'capricorn' },
          { name: 'Aquarius', value: 'aquarius' },
          { name: 'Pisces    ', value: 'pisces' }      
        ]
      }
    }
  };

  get queryBuilderConfig(): QueryBuilderConfig {
    const base = this.config || this.defaultConfig;
    return {
      ...base,
      listNamedRulesets: this.listNamedRulesets.bind(this),
      getNamedRuleset: this.getNamedRuleset.bind(this),
      saveNamedRuleset: this.saveNamedRuleset.bind(this),
      deleteNamedRuleset: this.deleteNamedRuleset.bind(this),
      editNamedRuleset: this.editNamedRuleset.bind(this),
      customCollapsedSummary: this.collapsedSummary.bind(this)
    } as QueryBuilderConfig;
  }

  clickSearch() {
    this.builderQuery = this.parseQuery(this.query);
    
    // Ensure the query has the required structure
    if (!this.builderQuery.condition) {
      this.builderQuery.condition = 'and';
    }
    
    this.showBuilder = true;
  }

  builderApplied(q: RuleSet) {
    this.query = this.stringifyQuery(q);
    this.onQueryChange();
    this.queryChange.emit(this.query);
    this.showBuilder = false;
  }

  cancelEdit() {
    this.editing = false;
  }

  acceptEdit() {
    this.editing = false;
    this.queryChange.emit(this.query);
  }

  parseQuery(text: string): RuleSet {
    try {
      return bqlToRuleset(text, this.queryBuilderConfig);
    } catch {
      return { condition: 'and', rules: [] };
    }
  }

  stringifyQuery(obj: RuleSet): string {
    try {
      const cleanQuery = this.cleanQuery(obj);
      return rulesetToBql(cleanQuery, this.queryBuilderConfig);
    } catch {
      return '';
    }
  }

  private cleanQuery(query: RuleSet): RuleSet {
    if (!query || typeof query !== 'object') {
      return { condition: 'and', rules: [] };
    }
    
    const cleaned: RuleSet = {
      condition: query.condition || 'and',
      rules: (query.rules || []).map((item: any) => {
        // Check if this is a nested ruleset
        if (item.condition && item.rules) {
          // Recursively clean nested rulesets
          return this.cleanQuery(item);
        }
        // This is a regular rule - validate it has required fields
        else if (item.field && item.operator && (item.value !== undefined && item.value !== '')) {
          return item;
        }
        // Invalid rule, exclude it
        return null;
      }).filter(item => item !== null)
    };
    
    // Include additional properties if they exist
    if (query.not !== undefined) {
      cleaned.not = query.not;
    }
    if (query.name !== undefined){
      cleaned.name = query.name;
    }
    if (query.collapsed !== undefined) {
      cleaned.collapsed = query.collapsed;
    }
    if (query.isChild !== undefined) {
      cleaned.isChild = query.isChild;
    }
    
    return cleaned;
  }

  applyQuery() {
    this.builderApplied(this.builderQuery);
  }

  cancelQuery() {
    this.showBuilder = false;
  }

  listNamedRulesets(): string[] {
    return Object.keys(this.namedRulesets);
  }

  getNamedRuleset(name: string): RuleSet {
    return JSON.parse(JSON.stringify(this.namedRulesets[name]));
  }

  saveNamedRuleset(rs: RuleSet) {
    if (rs.name) {
      this.namedRulesets[rs.name] = JSON.parse(JSON.stringify(rs));
    }
  }

  deleteNamedRuleset(name: string) {
    delete this.namedRulesets[name];
  }

  async editNamedRuleset(rs: RuleSet): Promise<RuleSet | null> {
    const result = await firstValueFrom(this.dialog.open(EditRulesetDialogComponent, {
      data: {
        ruleset: JSON.parse(JSON.stringify(rs)),
        rulesetName: this.rulesetName,
        validate: (r: any) => !!r && typeof r === 'object' && Array.isArray(r.rules) && r.rules.length > 0
      },
      width: '800px',
      panelClass: 'resizable-dialog',
      autoFocus: false
    }).afterClosed());
    return result || null;
  }

  collapsedSummary(ruleset: RuleSet): string {
    const names = new Set<string>();
    const walk = (rs: RuleSet) => {
      rs.rules.forEach(r => {
        if ((r as Rule).field) {
          const field = this.queryBuilderConfig.fields[(r as Rule).field];
          names.add(field?.name || (r as Rule).field);
        } else if ((r as RuleSet).rules) {
          walk(r as RuleSet);
        }
      });
    };
    walk(ruleset);
    return Array.from(names).join(', ');
  }
}
