import {
  Component,
  OnInit,
  inject,
  signal
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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ProdutoResponse,
  ProdutoUpdateRequest,
  TipoProduto
} from '../../../core/models/produto.model';

import { EstoqueService } from '../../../services/estoque.service';

@Component({
  selector: 'app-editar-produto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './editar-produto.component.html',
  styleUrl: './editar-produto.component.scss'
})
export class EditarProdutoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly estoqueService = inject(EstoqueService);

  readonly carregando = signal(true);
  readonly salvando = signal(false);

  produto: ProdutoResponse | null = null;

  form!: FormGroup;

  readonly categorias = [
    {
      value: 'Computador',
      label: 'Computador / Servidor'
    },
    {
      value: 'Peca',
      label: 'Peça / Hardware'
    },
    {
      value: 'AcessorioMovel',
      label: 'Acessório Móvel'
    },
    {
      value: 'Periferico',
      label: 'Periférico / Conectividade'
    }
  ];

  ngOnInit(): void {
    this.criarFormulario();

    const produtoId =
      this.route.snapshot.paramMap.get('id');

    if (!produtoId) {
      this.router.navigate(['/dashboard/estoque']);
      return;
    }

    this.carregarProduto(produtoId);
  }

  private criarFormulario(): void {
    this.form = this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      tipo: [
        '',
        Validators.required
      ],

      precoVenda: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      quantidadeMinima: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      codigoSku: [''],
      codigoFornecedor: [''],
      codigoBarras: [''],

      marca: [''],
      modelo: [''],

      ncm: [''],
      unidadeComercial: [
        'UN',
        Validators.required
      ],

      descricao: ['']
    });
  }

  private carregarProduto(
    produtoId: string
  ): void {
    this.carregando.set(true);

    /*
     * O backend ainda não possui GET /produtos/{id}.
     * Aproveitamos a listagem já existente e localizamos
     * o produto pelo identificador.
     */
    this.estoqueService
      .listarTodos()
      .subscribe({
        next: produtos => {
          const produto =
            produtos.find(
              item => item.id === produtoId
            );

          if (!produto) {
            this.carregando.set(false);
            this.router.navigate([
              '/dashboard/estoque'
            ]);
            return;
          }

          this.produto = produto;

          this.form.patchValue({
            nome: produto.nome,
            tipo: produto.tipo,
            precoVenda: produto.precoVenda,
            quantidadeMinima:
              produto.quantidadeMinima,

            codigoSku:
              produto.codigoSku ?? '',

            codigoFornecedor:
              produto.codigoFornecedor ?? '',

            codigoBarras:
              produto.codigoBarras ?? '',

            marca:
              produto.marca ?? '',

            modelo:
              produto.modelo ?? '',

            ncm:
              produto.ncm ?? '',

            unidadeComercial:
              produto.unidadeComercial || 'UN',

            descricao:
              produto.descricao ?? ''
          });

          this.carregando.set(false);
        },

        error: () => {
          this.carregando.set(false);
        }
      });
  }

  salvar(): void {
    if (
      !this.produto ||
      this.form.invalid ||
      this.salvando()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const payload: ProdutoUpdateRequest = {
      nome: value.nome.trim(),
      tipo: value.tipo as TipoProduto,

      precoVenda:
        Number(value.precoVenda),

      quantidadeMinima:
        Number(value.quantidadeMinima),

      codigoSku:
        this.normalizar(value.codigoSku),

      codigoFornecedor:
        this.normalizar(
          value.codigoFornecedor
        ),

      codigoBarras:
        this.normalizar(
          value.codigoBarras
        ),

      marca:
        this.normalizar(value.marca),

      modelo:
        this.normalizar(value.modelo),

      ncm:
        this.normalizar(value.ncm),

      unidadeComercial:
        value.unidadeComercial?.trim()
        || 'UN',

      descricao:
        this.normalizar(value.descricao)
    };

    this.salvando.set(true);

    this.estoqueService
      .atualizar(
        this.produto.id,
        payload
      )
      .subscribe({
        next: () => {
          this.salvando.set(false);

          this.router.navigate([
            '/dashboard/estoque'
          ]);
        },

        error: err => {
          console.error(
            'Falha ao atualizar produto:',
            err
          );

          this.salvando.set(false);
        }
      });
  }

  voltar(): void {
    this.location.back();
  }

  temErro(campo: string): boolean {
    const control =
      this.form.get(campo);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  private normalizar(
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

    return texto.length > 0
      ? texto
      : null;
  }
}
