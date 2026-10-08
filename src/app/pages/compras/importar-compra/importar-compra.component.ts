import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  finalize
} from 'rxjs/operators';

import {
  FornecedorResponse
} from '../../../core/models/fornecedor.model';

import {
  ImportarEntradaCompraRequest
} from '../../../core/models/entrada-compra.model';

import {
  FornecedorService
} from '../../../services/fornecedor.service';

import {
  EntradaCompraService
} from '../../../services/entrada-compra.service';

import {
  ToastService
} from '../../../services/toast.service';

@Component({
  selector: 'app-importar-compra',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],

  templateUrl:
    './importar-compra.component.html',

  styleUrl:
    './importar-compra.component.scss'
})
export class ImportarCompraComponent
  implements OnInit {

  form: FormGroup;

  fornecedores: FornecedorResponse[] = [];

  arquivo: File | null = null;

  carregandoFornecedores = false;
  importando = false;

  constructor(
    private readonly fb: FormBuilder,

    private readonly fornecedorService:
      FornecedorService,

    private readonly compraService:
      EntradaCompraService,

    private readonly toastService:
      ToastService,

    private readonly dialogRef:
      MatDialogRef<ImportarCompraComponent>,

    private readonly router: Router
  ) {

    const hoje =
      new Date()
        .toISOString()
        .slice(0, 10);

    this.form = this.fb.group({
      fornecedorId: [
        null,
        Validators.required
      ],

      numeroDocumento: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      dataEntrada: [
        hoje,
        Validators.required
      ],

      valorFrete: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      valorDesconto: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      outrasDespesas: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      observacao: ['']
    });
  }

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  private carregarFornecedores(): void {
    this.carregandoFornecedores = true;

    this.fornecedorService
      .listar()
      .pipe(
        finalize(() => {
          this.carregandoFornecedores = false;
        })
      )
      .subscribe({
        next: fornecedores => {
          this.fornecedores =
            fornecedores.filter(
              fornecedor => fornecedor.ativo
            );
        },

        error: () => {
          this.toastService.error(
            'Não foi possível carregar os fornecedores.'
          );
        }
      });
  }

  selecionarArquivo(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const arquivo =
      input.files?.[0] ?? null;

    this.arquivo = arquivo;
  }

  importar(): void {
    if (
      this.form.invalid ||
      !this.arquivo ||
      this.importando
    ) {
      this.form.markAllAsTouched();

      if (!this.arquivo) {
        this.toastService.error(
          'Selecione a planilha XLSX da compra.'
        );
      }

      return;
    }

    const extensao =
      this.arquivo.name
        .toLowerCase();

    if (!extensao.endsWith('.xlsx')) {
      this.toastService.error(
        'Selecione um arquivo no formato XLSX.'
      );
      return;
    }

    const value =
      this.form.getRawValue();

    const request:
      ImportarEntradaCompraRequest = {

      arquivo: this.arquivo,

      fornecedorId:
        value.fornecedorId,

      numeroDocumento:
        value.numeroDocumento.trim(),

      dataEntrada:
        `${value.dataEntrada}T12:00:00`,

      valorFrete:
        Number(value.valorFrete ?? 0),

      valorDesconto:
        Number(value.valorDesconto ?? 0),

      outrasDespesas:
        Number(value.outrasDespesas ?? 0),

      observacao:
        this.normalizarTexto(
          value.observacao
        )
    };

    this.importando = true;

    this.compraService
      .importar(request)
      .pipe(
        finalize(() => {
          this.importando = false;
        })
      )
      .subscribe({
        next: resultado => {

          this.toastService.success(
            `Compra importada: ${resultado.produtosCriados} produtos criados.`
          );

          const entradaId =
            resultado.entradaCompraId;

          this.dialogRef.close({
            importado: true,
            entradaCompraId: entradaId
          });

          this.router.navigate([
            '/dashboard/compras',
            entradaId
          ]);
        },

        error: () => {
          /*
           * O interceptor mantém a mensagem detalhada
           * retornada pelo backend.
           */
        }
      });
  }

  cancelar(): void {
    if (this.importando) {
      return;
    }

    this.dialogRef.close();
  }

  private normalizarTexto(
    valor: unknown
  ): string | null {

    if (
      valor === null ||
      valor === undefined
    ) {
      return null;
    }

    const texto =
      String(valor).trim();

    return texto || null;
  }
}
