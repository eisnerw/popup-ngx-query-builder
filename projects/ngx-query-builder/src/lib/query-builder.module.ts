import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';

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

@NgModule({
  imports: [
    CommonModule,
    FormsModule
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
    QueryArrowIconDirective
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
