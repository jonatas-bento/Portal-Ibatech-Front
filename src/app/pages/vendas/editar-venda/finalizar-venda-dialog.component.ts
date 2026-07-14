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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FinalizarVendaRequest, FormaPagamento } from '../../../core/models/venda.model';

export interface FinalizarVendaDialogData {
  numero: string;
  valorBruto: number;
  desconto: number;
  valorTotal: number;
  quantidadeItens: number;
}

interface OpcaoFormaPagamento {
  valor: FormaPagamento;
  label: string;
}

@Component({
  selector: 'app-finalizar-venda-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>point_of_sale</mat-icon>
      Finalizar venda
    </h2>

    <mat-dialog-content>
      <div class="resumo-venda">
        <div class="resumo-linha">
          <span class="resumo-label">Número</span>
          <span class="resumo-valor">{{ data.numero }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Quantidade de itens</span>
          <span class="resumo-valor">{{ data.quantidadeItens }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Valor bruto</span>
          <span class="resumo-valor">{{ data.valorBruto | currency:'BRL' }}</span>
        </div>
        <div class="resumo-linha">
          <span class="resumo-label">Desconto</span>
          <span class="resumo-valor">{{ data.desconto | currency:'BRL' }}</span>
        </div>
        <div class="resumo-linha resumo-total">
          <span class="resumo-label">Total a pagar</span>
          <span class="resumo-valor">{{ data.valorTotal | currency:'BRL' }}</span>
        </div>
      </div>

      <form [formGroup]="form" class="ib-dark-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Forma de pagamento</mat-label>
          <mat-select formControlName="formaPagamento">
            @for (opcao of opcoesFormaPagamento; track opcao.valor) {
              <mat-option [value]="opcao.valor">{{ opcao.label }}</mat-option>
            }
          </mat-select>
          @if (
            form.get('formaPagamento')?.touched &&
            form.get('formaPagamento')?.hasError('required')
          ) {
            <mat-error>Selecione a forma de pagamento.</mat-error>
          }
        </mat-form-field>

        @if (ehDinheiro) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Valor recebido (R$)</mat-label>
            <input
              matInput
              type="number"
              min="0"
              step="0.01"
              formControlName="valorRecebido"
            >
            @if (
              form.get('valorRecebido')?.touched &&
              form.get('valorRecebido')?.hasError('required')
            ) {
              <mat-error>Informe o valor recebido.</mat-error>
            }
            @if (
              form.get('valorRecebido')?.touched &&
              form.get('valorRecebido')?.hasError('min')
            ) {
              <mat-error>O valor recebido deve ser ao menos o total da venda.</mat-error>
            }
          </mat-form-field>

          <div class="troco-preview">
            <div class="troco-linha">
              <span>Total da venda</span>
              <strong>{{ data.valorTotal | currency:'BRL' }}</strong>
            </div>
            <div class="troco-linha">
              <span>Valor recebido</span>
              <strong>{{ valorRecebidoAtual | currency:'BRL' }}</strong>
            </div>
            <div class="troco-linha troco-destaque">
              <span>Troco previsto</span>
              <strong>{{ trocoPrevisto | currency:'BRL' }}</strong>
            </div>

            @if (valorInsuficiente) {
              <div class="troco-erro">
                O valor recebido é menor que o total da venda.
              </div>
            }
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        type="button"
        class="btn-dialog-cancelar"
        [mat-dialog-close]="null">
        Cancelar
      </button>

      <button
        mat-flat-button
        type="button"
        class="btn-dialog-finalizar"
        [disabled]="!podeConfirmar"
        (click)="confirmar()">
        <mat-icon>check_circle</mat-icon>
        Finalizar venda
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .resumo-venda {
      margin-bottom: 18px;
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

    .full-width {
      display: block;
      width: 100%;
      margin-bottom: 8px;
    }

    .troco-preview {
      margin-top: 8px;
      padding: 16px;
      border: 1px solid var(--ib-border);
      border-radius: var(--ib-radius-md);
      background: var(--ib-surface-3);
    }

    .troco-linha {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: var(--ib-text-secondary);
    }

    .troco-linha strong {
      color: var(--ib-text-primary);
    }

    .troco-destaque {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--ib-border);
    }

    .troco-destaque strong {
      color: var(--ib-green);
      font-size: 1.1rem;
    }

    .troco-erro {
      margin-top: 12px;
      color: var(--ib-danger);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .btn-dialog-cancelar {
      color: var(--ib-text-primary) !important;
      background: transparent !important;
      border: 1px solid var(--ib-border);
    }

    .btn-dialog-cancelar:hover {
      color: var(--ib-green) !important;
      border-color: var(--ib-green);
      background-color: var(--ib-brand-soft) !important;
    }

    .btn-dialog-finalizar {
      color: #121212 !important;
      background-color: var(--ib-green) !important;
    }

    .btn-dialog-finalizar mat-icon {
      color: #121212 !important;
    }

    .btn-dialog-finalizar:disabled {
      opacity: 0.5;
    }
  `]
})
export class FinalizarVendaDialogComponent {
  readonly form: FormGroup;

  readonly opcoesFormaPagamento: OpcaoFormaPagamento[] = [
    { valor: 'Pix', label: 'Pix' },
    { valor: 'Dinheiro', label: 'Dinheiro' },
    { valor: 'CartaoDebito', label: 'Cartão de débito' },
    { valor: 'CartaoCredito', label: 'Cartão de crédito' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      FinalizarVendaDialogComponent,
      FinalizarVendaRequest | null
    >,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: FinalizarVendaDialogData
  ) {
    this.form = this.fb.group({
      formaPagamento: [null, [Validators.required]],
      valorRecebido: [null]
    });

    this.form.get('formaPagamento')?.valueChanges.subscribe((valor: FormaPagamento | null) => {
      const valorRecebidoControl = this.form.get('valorRecebido');

      if (valor === 'Dinheiro') {
        valorRecebidoControl?.setValidators([
          Validators.required,
          Validators.min(this.data.valorTotal)
        ]);
      } else {
        valorRecebidoControl?.reset(null);
        valorRecebidoControl?.clearValidators();
      }

      valorRecebidoControl?.updateValueAndValidity();
    });
  }

  get ehDinheiro(): boolean {
    return this.form.get('formaPagamento')?.value === 'Dinheiro';
  }

  get valorRecebidoAtual(): number {
    const valor = Number(this.form.get('valorRecebido')?.value);
    return Number.isFinite(valor) && valor > 0 ? valor : 0;
  }

  get trocoPrevisto(): number {
    return Math.max(0, this.valorRecebidoAtual - this.data.valorTotal);
  }

  get valorInsuficiente(): boolean {
    if (!this.ehDinheiro) {
      return false;
    }

    const valor = this.form.get('valorRecebido')?.value;

    if (valor === null || valor === undefined || valor === '') {
      return false;
    }

    return Number(valor) < this.data.valorTotal;
  }

  get podeConfirmar(): boolean {
    return this.form.valid && !this.valorInsuficiente;
  }

  confirmar(): void {
    if (this.form.invalid || this.valorInsuficiente) {
      this.form.markAllAsTouched();
      return;
    }

    const formaPagamento: FormaPagamento = this.form.get('formaPagamento')?.value;
    const valorRecebido = formaPagamento === 'Dinheiro'
      ? Number(this.form.get('valorRecebido')?.value)
      : null;

    this.dialogRef.close({
      formaPagamento,
      valorRecebido
    });
  }
}
