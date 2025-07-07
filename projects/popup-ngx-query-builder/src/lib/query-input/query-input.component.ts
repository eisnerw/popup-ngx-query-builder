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
      return JSON.parse(text);
    } catch {
      return { condition: 'and', rules: [] };
    }
  }

  stringifyQuery(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return '';
    }
  }

  addRule() {
    if (!this.builderQuery.rules) {
      this.builderQuery.rules = [];
    }
    this.builderQuery.rules.push({
      field: '',
      operator: '=',
      value: ''
    });
  }

  removeRule(index: number) {
    if (this.builderQuery.rules) {
      this.builderQuery.rules.splice(index, 1);
    }
  }

  applyQuery() {
    this.builderApplied(this.builderQuery);
  }

  cancelQuery() {
    this.showBuilder = false;
  }
}
