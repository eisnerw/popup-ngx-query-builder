import { Directive, TemplateRef } from '@angular/core';

@Directive({selector: '[queryRulesetRemoveButton]', standalone: false})
export class QueryRulesetRemoveButtonDirective {
  constructor(public template: TemplateRef<any>) {}
}
