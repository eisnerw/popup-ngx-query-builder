import { Component } from '@angular/core';
import { QueryInputComponent } from 'popup-ngx-query-builder';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QueryInputComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'popup-demo';
  currentQuery = '';

  onQueryChange(query: string) {
    this.currentQuery = query;
    console.log('Query changed:', query);
  }

  getFormattedQuery(): string {
    if (!this.currentQuery) {
      return '';
    }
    
    try {
      // If the currentQuery is already a JSON string, parse and re-stringify with formatting
      const parsed = typeof this.currentQuery === 'string' ? JSON.parse(this.currentQuery) : this.currentQuery;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, return the currentQuery as is
      return this.currentQuery;
    }
  }
}
