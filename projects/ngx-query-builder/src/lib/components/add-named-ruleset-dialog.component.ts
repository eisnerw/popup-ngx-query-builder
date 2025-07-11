import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddNamedRulesetDialogData {
  names: string[];
  rulesetName: string;
}

@Component({
  selector: 'lib-add-named-ruleset-dialog',
  standalone: false,
  template: `
    <h1 mat-dialog-title>Select a Named {{data.rulesetName}}</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>{{data.rulesetName}} Name</mat-label>
        <mat-select [(value)]="selected">
          <mat-option *ngFor="let n of data.names" [value]="n">{{n}}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!selected" (click)="dialogRef.close(selected)">Add</button>
    </div>
  `
})
export class AddNamedRulesetDialogComponent {
  selected: string | null = null;
  constructor(
    public dialogRef: MatDialogRef<AddNamedRulesetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddNamedRulesetDialogData
  ) {}
}
