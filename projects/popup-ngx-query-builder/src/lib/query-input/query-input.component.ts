import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { QueryBuilderComponent } from 'ngx-query-builder';

@Component({
  selector: 'lib-query-input',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, QueryBuilderComponent],
  styleUrls: ['./query-input.component.scss'],
  templateUrl: './query-input.component.html'
})
export class QueryInputComponent {
  @Input() placeholder = 'Enter query';
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();

  editing = false;
  showBuilder = false;
  builderQuery: any = {};

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
      return {};
    }
  }

  stringifyQuery(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return '';
    }
  }
}
