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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EstornarVendaRequest, FormaPagamento } from '../../../core/models/venda.model';

export interface EstornarVendaDialogData {
  numero: string;
  valorTotal: number;
  formaPagamento?: FormaPagamento | null;
  quantidadeItens: number;
}

const MOTIVO_MAX_LENGTH = 500;

/** Valida que o campo não contém apenas espaços em branco. */
function naoSomenteEspacos(valor: string | null | undefined): boolean {
  return !!valor && valor.trim().length > 0;
}

@Component({
  selector: 'app-estornar-venda-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>currency_exchange</mat-icon>
      Estornar venda
    </h2>

    <mat-dialog-content>
      <div class="aviso-box aviso-forte">
        Esta ação devolverá os itens ao estoque e registrará uma compensação
        financeira. O estorno não poderá ser desfeito pelo portal.
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
        <div class="resumo-linha" *ngIf="data.formaPagamento">
          <span class="resumo-label">Forma de pagamento</span>
          <span class="resumo-valor">{{ formaPagamentoLabel }}</span>
        </div>
        <div class="resumo-linha resumo-total">
          <span class="resumo-label">Valor a compensar</span>
          <span class="resumo-valor">{{ data.valorTotal | currency:'BRL' }}</span>
        </div>
      </div>

      <ul class="info-list">
        <li>A Receita original da venda será preservada.</li>
        <li>Será criada uma Despesa compensatória.</li>
        <li>O valor compensado será o total da venda.</li>
        <li>
          Devoluções externas de Pix, cartão ou dinheiro continuam sendo
          realizadas operacionalmente pela empresa.
        </li>
      </ul>

      <form [formGroup]="form" class="ib-dark-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo do estorno</mat-label>
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
            <mat-error>Informe o motivo do estorno.</mat-error>
          }
          @if (
            form.get('motivo')?.touched &&
            form.get('motivo')?.hasError('somenteEspacos')
          ) {
            <mat-error>O motivo não pode conter apenas espaços.</mat-error>
          }
        </mat-form-field>

        <mat-checkbox formControlName="confirmacao" class="checkbox-confirmacao">
          Confirmo que a devolução externa ao cliente foi tratada quando necessária.
        </mat-checkbox>
        @if (
          form.get('confirmacao')?.touched &&
          form.get('confirmacao')?.hasError('required')
        ) {
          <div class="checkbox-erro">É necessário confirmar esta declaração.</div>
        }
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
        class="btn-dialog-estornar"
        [disabled]="form.invalid"
        (click)="confirmar()">
        <mat-icon>currency_exchange</mat-icon>
        Confirmar estorno
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

    .aviso-forte {
      border-color: var(--ib-danger);
      color: var(--ib-text-primary);
      background: rgba(229, 62, 62, 0.08);
      font-weight: 500;
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
      color: var(--ib-danger);
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
      margin-bottom: 8px;
    }

    .checkbox-confirmacao {
      display: block;
      margin-top: 8px;
      color: var(--ib-text-primary);
    }

    .checkbox-erro {
      margin-top: 6px;
      color: var(--ib-danger);
      font-size: 0.85rem;
      font-weight: 500;
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

    .btn-dialog-estornar {
      color: var(--ib-white) !important;
      background-color: var(--ib-danger) !important;
    }

    .btn-dialog-estornar mat-icon {
      color: var(--ib-white) !important;
    }

    .btn-dialog-estornar:disabled {
      opacity: 0.5;
    }
  `]
})
export class EstornarVendaDialogComponent {
  readonly form: FormGroup;
  readonly motivoMaxLength = MOTIVO_MAX_LENGTH;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      EstornarVendaDialogComponent,
      EstornarVendaRequest | null
    >,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: EstornarVendaDialogData
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
      ],
      confirmacao: [false, [Validators.requiredTrue]]
    });
  }

  get motivoAtual(): string {
    return (this.form.get('motivo')?.value ?? '') as string;
  }

  get formaPagamentoLabel(): string {
    switch (this.data.formaPagamento) {
      case 'Dinheiro':
        return 'Dinheiro';
      case 'Pix':
        return 'Pix';
      case 'CartaoDebito':
        return 'Cartão de débito';
      case 'CartaoCredito':
        return 'Cartão de crédito';
      default:
        return '-';
    }
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
