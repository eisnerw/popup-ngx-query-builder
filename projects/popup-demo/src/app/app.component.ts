import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { QueryInputComponent, bqlToRuleset, rulesetToBql } from 'popup-ngx-query-builder';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QueryInputComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'popup-demo';
  currentQuery = '';
  rulesetJson = '';

  @ViewChild(QueryInputComponent) queryInput!: QueryInputComponent;

  ngAfterViewInit(): void {
    this.onQueryChange(this.currentQuery);
  }

  onQueryChange(query: string) {
    this.currentQuery = query;
    try {
      const rs = bqlToRuleset(query, this.queryInput.queryBuilderConfig);
      this.rulesetJson = JSON.stringify(rs, null, 2);
    } catch {
      this.rulesetJson = '';
    }
  }

  onRulesetChange(value: string) {
    this.rulesetJson = value;
    try {
      const rs = JSON.parse(value);
      this.currentQuery = rulesetToBql(rs, this.queryInput.queryBuilderConfig);
    } catch {
      // ignore parse errors
    }
  }
}
