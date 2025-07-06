import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <textarea rows="10" cols="40" [(ngModel)]="queryString"></textarea>
    <div style="margin-top:0.5rem;">
      <button type="button" (click)="apply()">Apply</button>
    </div>
  `,
})
export class QueryBuilderComponent {
  @Input() query: any;
  @Output() queryChange = new EventEmitter<any>();
  queryString = '';

  ngOnInit() {
    this.queryString = JSON.stringify(this.query ?? {}, null, 2);
  }

  apply() {
    try {
      const obj = JSON.parse(this.queryString);
      this.queryChange.emit(obj);
    } catch {}
  }
}
