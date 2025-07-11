import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AppComponent } from './app.component';
import { EditRulesetDialogComponent } from './edit-ruleset-dialog.component';

import { QueryBuilderModule } from 'ngx-query-builder';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    QueryBuilderModule
  ],
  declarations: [ AppComponent, EditRulesetDialogComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
