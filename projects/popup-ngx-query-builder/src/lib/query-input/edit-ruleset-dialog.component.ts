import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RuleSet } from 'ngx-query-builder';

export interface EditRulesetDialogData {
  ruleset: RuleSet;
  rulesetName: string;
  validate: (rs: any) => boolean;
}

@Component({
  selector: 'lib-edit-ruleset-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <h1 mat-dialog-title>Edit {{data.rulesetName}}</h1>
    <div mat-dialog-content>
      <textarea class="dialog-output" [(ngModel)]="text" (ngModelChange)="onChange($event)"></textarea>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="state !== 'valid'" (click)="save()">Save</button>
    </div>
  `,
  styles: [
    `.dialog-output { width: 100%; height: 100%; resize: none; box-sizing: border-box; }`
  ]
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
      this.state = this.data.validate(val) ? 'valid' : 'invalid-query';
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
