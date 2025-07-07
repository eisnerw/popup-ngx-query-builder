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
}
