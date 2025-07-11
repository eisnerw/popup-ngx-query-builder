import { Component } from '@angular/core';
import { QueryInputComponent } from 'popup-ngx-query-builder';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { QueryBuilderConfig, RuleSet, Rule } from 'ngx-query-builder';
import { firstValueFrom } from 'rxjs';
import { EditRulesetDialogComponent } from 'popup-ngx-query-builder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    QueryInputComponent,
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
    EditRulesetDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'popup-demo';
  currentQuery = '';

  namedRulesets: Record<string, RuleSet> = {};
  config: QueryBuilderConfig;

  constructor(private dialog: MatDialog) {
    this.config = {
      fields: {
        document: { name: 'Document', type: 'string', operators: ['contains'] },
        lname: { name: 'Last Name', type: 'category' },
        fname: { name: 'First Name', type: 'string', operators: ['=', '!=', 'contains', 'like', 'exists'] },
        isAlive: { name: 'Alive?', type: 'boolean' },
        categories: { name: 'Category', type: 'string', operators: ['contains', 'exists'] },
        dob: { name: 'Birthday', type: 'date', operators: ['=', '<=', '>', '<', '>='], defaultValue: (() => new Date()) },
        sign: {
          name: 'Astrological Sign',
          type: 'category',
          options: [
            { name: 'Aries', value: 'aries' },
            { name: 'Taurus', value: 'taurus' },
            { name: 'Gemini', value: 'gemini' },
            { name: 'Cancer', value: 'cancer' },
            { name: 'Leo', value: 'leo' },
            { name: 'Virgo', value: 'virgo' },
            { name: 'Libra', value: 'libra' },
            { name: 'Scorpio', value: 'scorpio' },
            { name: 'Sagittarius', value: 'sagittarius' },
            { name: 'Capricorn', value: 'capricorn' },
            { name: 'Aquarius', value: 'aquarius' },
            { name: 'Pisces', value: 'pisces' }
          ]
        }
      },
      customCollapsedSummary: this.collapsedSummary.bind(this),
      listNamedRulesets: this.listNamedRulesets.bind(this),
      getNamedRuleset: this.getNamedRuleset.bind(this),
      saveNamedRuleset: this.saveNamedRuleset.bind(this),
      deleteNamedRuleset: this.deleteNamedRuleset.bind(this),
      editNamedRuleset: this.editNamedRuleset.bind(this)
    } as QueryBuilderConfig;
  }

  onQueryChange(query: string) {
    this.currentQuery = query;
    console.log('Query changed:', query);
  }

  listNamedRulesets(): string[] {
    return Object.keys(this.namedRulesets);
  }

  getNamedRuleset(name: string): RuleSet {
    return JSON.parse(JSON.stringify(this.namedRulesets[name]));
  }

  saveNamedRuleset(ruleset: RuleSet) {
    if (ruleset.name) {
      this.namedRulesets[ruleset.name] = JSON.parse(JSON.stringify(ruleset));
    }
  }

  deleteNamedRuleset(name: string) {
    delete this.namedRulesets[name];
  }

  editNamedRuleset(ruleset: RuleSet): Promise<RuleSet | null> {
    return firstValueFrom(this.dialog.open(EditRulesetDialogComponent, {
      data: {
        ruleset: JSON.parse(JSON.stringify(ruleset)),
        rulesetName: 'Ruleset',
        validate: (rs: any) => this.validateRuleset(rs)
      },
      width: '600px',
      autoFocus: false
    }).afterClosed());
  }

  collapsedSummary(ruleset: RuleSet): string {
    const names = new Set<string>();
    const walk = (rs: RuleSet) => {
      rs.rules.forEach(r => {
        if ((r as Rule).field) {
          const field = this.config.fields[(r as Rule).field];
          names.add(field?.name || (r as Rule).field);
        } else if ((r as RuleSet).rules) {
          walk(r as RuleSet);
        }
      });
    };
    walk(ruleset);
    return Array.from(names).join(', ');
  }

  private validateRuleset(rs: any): boolean {
    return rs && typeof rs === 'object' && Array.isArray(rs.rules);
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
