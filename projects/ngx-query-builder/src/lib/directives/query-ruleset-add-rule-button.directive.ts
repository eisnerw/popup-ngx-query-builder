import { Directive, TemplateRef } from '@angular/core';

@Directive({selector: '[queryRulesetAddRuleButton]', standalone: false})
export class QueryRulesetAddRuleButtonDirective {
  constructor(public template: TemplateRef<any>) {}
}
