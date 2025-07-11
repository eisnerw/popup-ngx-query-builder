import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RuleSet } from 'ngx-query-builder';

export interface EditRulesetDialogData {
  ruleset: RuleSet;
  rulesetName: string;
  validate: (rs: any) => boolean;
}

@Component({
  selector: 'app-edit-ruleset-dialog',
  standalone: false,
  template: `
    <h1 mat-dialog-title>Edit {{data.rulesetName}}</h1>
    <div mat-dialog-content>
      <textarea class="output dialog-output" [ngClass]="state" [(ngModel)]="text" (ngModelChange)="onChange($event)"></textarea>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="state !== 'valid'" (click)="save()">Save</button>
    </div>
  `,
  styleUrls: ['./app.component.less', './edit-ruleset-dialog.component.less']
})
export class EditRulesetDialogComponent {
  text: string;
  state: 'valid' | 'invalid-json' | 'invalid-query' = 'valid';

  constructor(
    public dialogRef: MatDialogRef<EditRulesetDialogComponent, RuleSet | null>,
    @Inject(MAT_DIALOG_DATA) public data: EditRulesetDialogData
  ) {
    this.text = JSON.stringify(data.ruleset, null, 2);
    this.validate();
  }

  onChange(value: string): void {
    this.text = value;
    this.validate();
  }

  private validate(): void {
    try {
      const val = JSON.parse(this.text.trim());
      if (this.data.validate(val)) {
        this.state = 'valid';
      } else {
        this.state = 'invalid-query';
      }
    } catch {
      this.state = 'invalid-json';
    }
  }

  save(): void {
    try {
      const val = JSON.parse(this.text.trim());
      if (this.data.validate(val)) {
        this.dialogRef.close(val);
      }
    } catch {
      // ignore
    }
  }
}
