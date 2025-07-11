import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TreeModule } from 'primeng/tree';
import { QueryBuilderModule, QueryBuilderConfig, RuleSet } from 'ngx-query-builder';

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
export class QueryInputComponent {
  @Input() placeholder = 'Enter query';
  @Input() query = '';
  @Input() config?: QueryBuilderConfig;
  @Input() allowNot = true;
  @Input() allowConvertToRuleset = true;
  @Input() allowRuleUpDown = true;
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: RuleSet = { condition: 'and', rules: [] };

  // Default configuration for the query builder
  defaultConfig: QueryBuilderConfig = {
    fields: {
      document: { name: 'Document', type: 'string', operators: ["contains"]},
      // lname: { name: 'Last Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
      lname: {
        name: 'Last Name',
        type: 'category'
      },
      fname: { name: 'First Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
      isAlive: { name: 'Alive?', type: 'boolean' },
      categories: { name: 'Category', type: 'string', operators: ["contains", "exists"]},
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
    return this.config || this.defaultConfig;
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
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === 'object' ? parsed : { condition: 'and', rules: [] };
    } catch {
      return { condition: 'and', rules: [] };
    }
  }

  stringifyQuery(obj: RuleSet): string {
    try {
      // Clean up the query object before stringifying
      const cleanQuery = this.cleanQuery(obj);
      return JSON.stringify(cleanQuery, null, 2);
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
}
