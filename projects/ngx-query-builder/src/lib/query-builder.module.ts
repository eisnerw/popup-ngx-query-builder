import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { QueryBuilderComponent } from './components/query-builder.component';

import { QueryArrowIconDirective } from './directives/query-arrow-icon.directive';
import { QueryFieldDirective } from './directives/query-field.directive';
import { QueryInputDirective } from './directives/query-input.directive';
import { QueryEntityDirective } from './directives/query-entity.directive';
import { QueryOperatorDirective } from './directives/query-operator.directive';
import { QueryButtonGroupDirective } from './directives/query-button-group.directive';
import { QuerySwitchGroupDirective } from './directives/query-switch-group.directive';
import { QueryRulesetAddRuleButtonDirective } from './directives/query-ruleset-add-rule-button.directive';
import { QueryRulesetAddRulesetButtonDirective } from './directives/query-ruleset-add-ruleset-button.directive';
import { QueryRulesetRemoveButtonDirective } from './directives/query-ruleset-remove-button.directive';
import { QueryRuleRemoveButtonDirective } from './directives/query-rule-remove-button.directive';
import { QueryEmptyWarningDirective } from './directives/query-empty-warning.directive';
import { AddNamedRulesetDialogComponent } from './components/add-named-ruleset-dialog.component';
import { NamedRulesetDialogComponent } from './components/named-ruleset-dialog.component';
import { MessageDialogComponent } from './components/message-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRulesetAddRuleButtonDirective,
    QueryRulesetAddRulesetButtonDirective,
    QueryRulesetRemoveButtonDirective,
    QueryRuleRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective,
    AddNamedRulesetDialogComponent,
    NamedRulesetDialogComponent,
    MessageDialogComponent
  ],
  exports: [
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRulesetAddRuleButtonDirective,
    QueryRulesetAddRulesetButtonDirective,
    QueryRulesetRemoveButtonDirective,
    QueryRuleRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective
  ]
})
export class QueryBuilderModule { }
