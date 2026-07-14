import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
import { AtualizarVendaItemRequest } from '../../../core/models/venda.model';

export interface EditarVendaItemData {
  itemId: string;
  codigoSku: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
}

@Component({
  selector: 'app-editar-venda-item-dialog',
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
    <h2 mat-dialog-title>Editar item</h2>

    <mat-dialog-content>
      <div class="item-info">
        <p><strong>SKU:</strong> {{ data.codigoSku }}</p>
        <p><strong>Produto:</strong> {{ data.nomeProduto }}</p>
        <p>
          <strong>Preço unitário:</strong>
          {{ data.precoUnitario | currency:'BRL' }}
        </p>
      </div>

      <form [formGroup]="form" class="ib-dark-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Quantidade</mat-label>

          <input
            matInput
            type="number"
            min="1"
            step="1"
            formControlName="quantidade"
          >

          @if (
            form.get('quantidade')?.touched &&
            form.get('quantidade')?.hasError('required')
          ) {
            <mat-error>Informe a quantidade.</mat-error>
          }

          @if (
            form.get('quantidade')?.touched &&
            form.get('quantidade')?.hasError('min')
          ) {
            <mat-error>A quantidade mínima é 1.</mat-error>
          }

          @if (
            form.get('quantidade')?.touched &&
            form.get('quantidade')?.hasError('pattern')
          ) {
            <mat-error>A quantidade deve ser inteira.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Desconto (R$)</mat-label>

          <input
            matInput
            type="number"
            min="0"
            step="0.01"
            formControlName="desconto"
          >

          @if (
            form.get('desconto')?.touched &&
            form.get('desconto')?.hasError('min')
          ) {
            <mat-error>O desconto não pode ser negativo.</mat-error>
          }

          @if (
            form.touched &&
            form.hasError('descontoMaiorQueBruto')
          ) {
            <mat-error>
              O desconto não pode superar o valor bruto.
            </mat-error>
          }
        </mat-form-field>
      </form>

      <div class="preview">
        <p>
          Valor bruto:
          <strong>{{ valorBrutoPrevisto | currency:'BRL' }}</strong>
        </p>

        <p>
          Desconto:
          <strong>{{ descontoPrevisto | currency:'BRL' }}</strong>
        </p>

        <p class="preview-total">
          Total previsto:
          <strong>{{ totalPrevisto | currency:'BRL' }}</strong>
        </p>
      </div>
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
        class="btn-dialog-salvar"
        [disabled]="form.invalid"
        (click)="salvar()">
        <mat-icon>save</mat-icon>
        Salvar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .item-info {
      margin-bottom: 18px;
    }

    .item-info p {
      margin: 4px 0;
      color: var(--ib-text-secondary);
    }

    .item-info strong {
      color: var(--ib-text-primary);
    }

    .full-width {
      display: block;
      width: 100%;
      margin-bottom: 8px;
    }

    .preview {
      margin-top: 8px;
      padding: 16px;
      border: 1px solid var(--ib-border);
      border-radius: var(--ib-radius-md);
      background: var(--ib-surface-3);
    }

    .preview p {
      margin: 5px 0;
      color: var(--ib-text-secondary);
    }

    .preview strong {
      color: var(--ib-text-primary);
    }

    .preview-total strong {
      color: var(--ib-green);
    }
  `]
})
export class EditarVendaItemDialogComponent {
  readonly form: FormGroup;

  private readonly validarDesconto: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const quantidade = Number(
      control.get('quantidade')?.value
    );

    const desconto = Number(
      control.get('desconto')?.value
    );

    if (
      !Number.isFinite(quantidade) ||
      !Number.isFinite(desconto)
    ) {
      return null;
    }

    return desconto > quantidade * this.data.precoUnitario
      ? { descontoMaiorQueBruto: true }
      : null;
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<
      EditarVendaItemDialogComponent,
      AtualizarVendaItemRequest | null
    >,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: EditarVendaItemData
  ) {
    this.form = this.fb.group(
      {
        quantidade: [
          data.quantidade,
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^\d+$/)
          ]
        ],
        desconto: [
          data.desconto,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      },
      {
        validators: [this.validarDesconto]
      }
    );
  }

  get valorBrutoPrevisto(): number {
    const quantidade = Number(
      this.form.get('quantidade')?.value
    );

    return Number.isFinite(quantidade)
      ? quantidade * this.data.precoUnitario
      : 0;
  }

  get descontoPrevisto(): number {
    const desconto = Number(
      this.form.get('desconto')?.value
    );

    return Number.isFinite(desconto) ? desconto : 0;
  }

  get totalPrevisto(): number {
    return Math.max(
      0,
      this.valorBrutoPrevisto - this.descontoPrevisto
    );
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      quantidade: Number(
        this.form.get('quantidade')?.value
      ),
      desconto: Number(
        this.form.get('desconto')?.value
      )
    });
  }
}