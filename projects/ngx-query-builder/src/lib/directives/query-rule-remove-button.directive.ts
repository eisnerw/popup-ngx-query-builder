import { Directive, TemplateRef } from '@angular/core';

@Directive({selector: '[queryRuleRemoveButton]', standalone: false})
export class QueryRuleRemoveButtonDirective {
  constructor(public template: TemplateRef<any>) {}
}
