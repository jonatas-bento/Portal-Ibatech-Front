import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  Location
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
  CriarEntradaCompraRequest
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
  selector: 'app-nova-compra',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],

  templateUrl:
    './nova-compra.component.html',

  styleUrl:
    './nova-compra.component.scss'
})
export class NovaCompraComponent
  implements OnInit {

  form: FormGroup;

  fornecedores: FornecedorResponse[] = [];

  carregandoFornecedores = false;
  salvando = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly fornecedorService:
      FornecedorService,
    private readonly compraService:
      EntradaCompraService,
    private readonly toastService:
      ToastService,
    private readonly router: Router,
    private readonly location: Location
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
        next: data => {
          this.fornecedores =
            data.filter(
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

  criar(): void {
    if (
      this.form.invalid ||
      this.salvando
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    const request:
      CriarEntradaCompraRequest = {

      fornecedorId:
        value.fornecedorId,

      numeroDocumento:
        value.numeroDocumento.trim(),

      dataEntrada:
        this.normalizarData(
          value.dataEntrada
        ),

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

    this.salvando = true;

    this.compraService
      .criar(request)
      .pipe(
        finalize(() => {
          this.salvando = false;
        })
      )
      .subscribe({
        next: entrada => {
          this.toastService.success(
            'Rascunho de compra criado com sucesso.'
          );

          this.router.navigate([
            '/dashboard/compras',
            entrada.id
          ]);
        },

        error: () => {
          // O interceptor já exibe
          // a mensagem específica do backend.
        }
      });
  }

  voltar(): void {
    this.location.back();
  }

  private normalizarData(
    data: string
  ): string {

    /*
     * O input date entrega YYYY-MM-DD.
     * Enviamos meio-dia local para evitar
     * mudança de dia por conversão de timezone.
     */
    return `${data}T12:00:00`;
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

    return texto
      ? texto
      : null;
  }
}
