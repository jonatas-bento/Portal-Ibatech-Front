import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CancelarVendaRequest } from '../../../core/models/venda.model';

export interface CancelarVendaDialogData {
  numero: string;
  valorTotal: number;
  quantidadeItens: number;
}

const MOTIVO_MAX_LENGTH = 500;

/** Valida que o campo não contém apenas espaços em branco. */
function naoSomenteEspacos(valor: string | null | undefined): boolean {
  return !!valor && valor.trim().length > 0;
}

@Component({
  selector: 'app-cancelar-venda-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>block</mat-icon>
      Cancelar venda
    </h2>

    <mat-dialog-content>
      <div class="aviso-box">
        Esta ação encerrará o rascunho. Os itens e valores serão preservados
        para consulta, mas a venda não poderá mais ser editada.
      </div>

      <div class="resumo-venda">
        <div class="resumo-linha">
          <span class="resumo-label">Número</span>
          <span class="resumo-valor">{{ data.numero }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Quantidade de itens</span>
          <span class="resumo-valor">{{ data.quantidadeItens }}</span>
        </div>
        <div class="resumo-linha resumo-total">
          <span class="resumo-label">Valor total</span>
          <span class="resumo-valor">{{ data.valorTotal | currency:'BRL' }}</span>
        </div>
      </div>

      <ul class="info-list">
        <li>O cancelamento de um rascunho não altera o estoque.</li>
        <li>O cancelamento de um rascunho não gera movimentação financeira.</li>
      </ul>

      <form [formGroup]="form" class="ib-dark-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo do cancelamento</mat-label>
          <textarea
            matInput
            formControlName="motivo"
            rows="4"
            [maxlength]="motivoMaxLength"
          ></textarea>
          <mat-hint align="end">{{ motivoAtual.length }}/{{ motivoMaxLength }}</mat-hint>
          @if (
            form.get('motivo')?.touched &&
            form.get('motivo')?.hasError('required')
          ) {
            <mat-error>Informe o motivo do cancelamento.</mat-error>
          }
          @if (
            form.get('motivo')?.touched &&
            form.get('motivo')?.hasError('somenteEspacos')
          ) {
            <mat-error>O motivo não pode conter apenas espaços.</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        type="button"
        class="btn-dialog-voltar"
        [mat-dialog-close]="null">
        Voltar
      </button>

      <button
        mat-flat-button
        type="button"
        class="btn-dialog-cancelar-venda"
        [disabled]="form.invalid"
        (click)="confirmar()">
        <mat-icon>block</mat-icon>
        Cancelar venda
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aviso-box {
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: var(--ib-radius-md);
      background: var(--ib-surface-3);
      border: 1px solid var(--ib-border);
      color: var(--ib-text-secondary);
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .resumo-venda {
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid var(--ib-border);
      border-radius: var(--ib-radius-md);
      background: var(--ib-surface-3);
    }

    .resumo-linha {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: var(--ib-text-secondary);
    }

    .resumo-label {
      color: var(--ib-text-secondary);
    }

    .resumo-valor {
      color: var(--ib-text-primary);
      font-weight: 500;
    }

    .resumo-total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--ib-border);
    }

    .resumo-total .resumo-label,
    .resumo-total .resumo-valor {
      color: var(--ib-green);
      font-weight: 700;
      font-size: 1.05rem;
    }

    .info-list {
      margin: 0 0 16px 0;
      padding-left: 20px;
      color: var(--ib-text-secondary);
      font-size: 0.88rem;
      line-height: 1.6;
    }

    .full-width {
      display: block;
      width: 100%;
    }

    .btn-dialog-voltar {
      color: var(--ib-text-primary) !important;
      background: transparent !important;
      border: 1px solid var(--ib-border);
    }

    .btn-dialog-voltar:hover {
      color: var(--ib-green) !important;
      border-color: var(--ib-green);
      background-color: var(--ib-brand-soft) !important;
    }

    .btn-dialog-cancelar-venda {
      color: var(--ib-white) !important;
      background-color: var(--ib-danger) !important;
    }

    .btn-dialog-cancelar-venda mat-icon {
      color: var(--ib-white) !important;
    }

    .btn-dialog-cancelar-venda:disabled {
      opacity: 0.5;
    }
  `]
})
export class CancelarVendaDialogComponent {
  readonly form: FormGroup;
  readonly motivoMaxLength = MOTIVO_MAX_LENGTH;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      CancelarVendaDialogComponent,
      CancelarVendaRequest | null
    >,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: CancelarVendaDialogData
  ) {
    this.form = this.fb.group({
      motivo: [
        '',
        [
          Validators.required,
          Validators.maxLength(MOTIVO_MAX_LENGTH),
          (control: any) =>
            naoSomenteEspacos(control.value) ? null : { somenteEspacos: true }
        ]
      ]
    });
  }

  get motivoAtual(): string {
    return (this.form.get('motivo')?.value ?? '') as string;
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const motivo = (this.form.get('motivo')?.value as string).trim();

    this.dialogRef.close({ motivo });
  }
}
