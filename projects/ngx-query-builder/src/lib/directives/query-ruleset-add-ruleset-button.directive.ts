import { Directive, TemplateRef } from '@angular/core';

@Directive({selector: '[queryRulesetAddRulesetButton]', standalone: false})
export class QueryRulesetAddRulesetButtonDirective {
  constructor(public template: TemplateRef<any>) {}
}
