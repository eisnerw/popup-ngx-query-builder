import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TreeModule } from 'primeng/tree';

@Component({
  selector: 'lib-query-input',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, DropdownModule, TreeModule],
  styleUrls: ['./query-input.component.scss'],
  templateUrl: './query-input.component.html'
})
export class QueryInputComponent {
  @Input() placeholder = 'Enter query';
  @Input() query = '';
  @Input() config: any;
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: any = {};

  // Default configuration for the query builder
  defaultConfig = {
    fields: [
      { value: 'name', name: 'Name', type: 'string' },
      { value: 'age', name: 'Age', type: 'number' },
      { value: 'email', name: 'Email', type: 'string' },
      { value: 'active', name: 'Active', type: 'boolean' },
      { value: 'date', name: 'Date', type: 'date' }
    ]
  };

  operators = [
    { value: '=', name: 'equals' },
    { value: '!=', name: 'not equals' },
    { value: '>', name: 'greater than' },
    { value: '<', name: 'less than' },
    { value: 'contains', name: 'contains' },
    { value: 'like', name: 'like' }
  ];

  get queryBuilderConfig() {
    return this.config || this.defaultConfig;
  }

  clickSearch() {
    this.builderQuery = this.parseQuery(this.query);
    
    // Ensure the query has the required structure
    if (!this.builderQuery.condition) {
      this.builderQuery.condition = 'and';
    }
    
    if (!this.builderQuery.rules || this.builderQuery.rules.length === 0) {
      this.builderQuery.rules = [this.createEmptyRule()];
    }
    
    this.showBuilder = true;
  }

  builderApplied(q: any) {
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

  parseQuery(text: string): any {
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === 'object' ? parsed : { condition: 'and', rules: [] };
    } catch {
      return { condition: 'and', rules: [] };
    }
  }

  stringifyQuery(obj: any): string {
    try {
      // Clean up the query object before stringifying
      const cleanQuery = this.cleanQuery(obj);
      return JSON.stringify(cleanQuery, null, 2);
    } catch {
      return '';
    }
  }

  private cleanQuery(query: any): any {
    if (!query || typeof query !== 'object') {
      return { condition: 'and', rules: [] };
    }
    
    const cleaned = {
      condition: query.condition || 'and',
      rules: (query.rules || []).filter((rule: any) => 
        rule.field && rule.operator && (rule.value !== undefined && rule.value !== '')
      )
    };
    
    return cleaned;
  }

  private createEmptyRule() {
    return {
      field: '',
      operator: '=',
      value: ''
    };
  }

  addRule() {
    if (!this.builderQuery.rules) {
      this.builderQuery.rules = [];
    }
    this.builderQuery.rules.push(this.createEmptyRule());
  }

  removeRule(index: number) {
    if (this.builderQuery.rules && this.builderQuery.rules.length > index) {
      this.builderQuery.rules.splice(index, 1);
    }
    
    // Ensure at least one rule exists
    if (!this.builderQuery.rules || this.builderQuery.rules.length === 0) {
      this.builderQuery.rules = [this.createEmptyRule()];
    }
  }

  applyQuery() {
    // Validate that at least one rule is properly filled
    const validRules = this.builderQuery.rules?.filter((rule: any) => 
      rule.field && rule.operator && (rule.value !== undefined && rule.value !== '')
    ) || [];
    
    if (validRules.length === 0) {
      // If no valid rules, show an alert or handle gracefully
      alert('Please add at least one complete rule before applying.');
      return;
    }
    
    this.builderApplied(this.builderQuery);
  }

  cancelQuery() {
    this.showBuilder = false;
  }
}
