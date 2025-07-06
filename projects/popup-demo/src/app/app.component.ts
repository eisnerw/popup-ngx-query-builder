import { Component } from '@angular/core';
import { QueryInputComponent } from 'popup-ngx-query-builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QueryInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'popup-demo';
}
