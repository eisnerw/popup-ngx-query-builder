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
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: RuleSet = { condition: 'and', rules: [] };

  // Default configuration for the query builder
  defaultConfig: QueryBuilderConfig = {
    fields: {
      name: { name: 'Name', type: 'string' },
      age: { name: 'Age', type: 'number' },
      email: { name: 'Email', type: 'string' },
      active: { name: 'Active', type: 'boolean' },
      date: { name: 'Date', type: 'date' }
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
      rules: (query.rules || []).filter((rule: any) => 
        rule.field && rule.operator && (rule.value !== undefined && rule.value !== '')
      )
    };
    
    return cleaned;
  }

  applyQuery() {
    this.builderApplied(this.builderQuery);
  }

  cancelQuery() {
    this.showBuilder = false;
  }
}
