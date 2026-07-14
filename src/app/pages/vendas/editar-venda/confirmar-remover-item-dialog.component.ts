import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar-remover-item-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Remover produto</h2>

<mat-dialog-content>
  Deseja remover “{{ data.nomeProduto }}” desta venda?
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button
    mat-button
    type="button"
    class="btn-dialog-cancelar"
    [mat-dialog-close]="false">
    Cancelar
  </button>

  <button
    mat-flat-button
    type="button"
    class="btn-dialog-remover"
    [mat-dialog-close]="true">
    <mat-icon>delete_outline</mat-icon>
    Remover
  </button>
</mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }
    mat-dialog-content {
      margin-top: 16px;
      color: var(--ib-text-secondary);
    }
    .btn-dialog-cancelar {
      color: var(--ib-text-primary) !important;
      border: 1px solid var(--ib-border);
      background-color: transparent !important;
    }
    .btn-dialog-cancelar:hover {
      color: var(--ib-text-primary) !important;
      border-color: var(--ib-text-muted);
      background-color: rgba(255,255,255,0.05) !important;
    }
    .btn-dialog-remover {
      background-color: var(--ib-danger) !important;
      color: var(--ib-white) !important;
    }
    .btn-dialog-remover mat-icon {
      color: var(--ib-white) !important;
    }
  `]
})
export class ConfirmarRemoverItemDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmarRemoverItemDialogComponent>);
  readonly data = inject<{ nomeProduto: string }>(MAT_DIALOG_DATA);

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
