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
  ActivatedRoute,
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
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  finalize
} from 'rxjs/operators';

import {
  EntradaCompraDetalhe,
  EntradaCompraItem,
  AtualizarEntradaCompraRequest,
  AdicionarEntradaCompraItemRequest,
  AtualizarEntradaCompraItemRequest
} from '../../../core/models/entrada-compra.model';

import {
  ProdutoResponse
} from '../../../core/models/produto.model';

import {
  EntradaCompraService
} from '../../../services/entrada-compra.service';

import {
  ProdutoService
} from '../../../services/produto.service';

import {
  ToastService
} from '../../../services/toast.service';

@Component({
  selector: 'app-detalhe-compra',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],

  templateUrl:
    './detalhe-compra.component.html',

  styleUrl:
    './detalhe-compra.component.scss'
})
export class DetalheCompraComponent
  implements OnInit {

  entrada?: EntradaCompraDetalhe;

  produtos: ProdutoResponse[] = [];
  produtosDisponiveis: ProdutoResponse[] = [];

  loading = false;
  salvandoCabecalho = false;
  adicionandoItem = false;
  salvandoItem = false;
  removendoItemId: string | null = null;
  confirmando = false;

  editandoItemId: string | null = null;

  cabecalhoForm: FormGroup;
  itemForm: FormGroup;
  editarItemForm: FormGroup;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,

    private readonly service:
      EntradaCompraService,

    private readonly produtoService:
      ProdutoService,

    private readonly toastService:
      ToastService
  ) {

    this.cabecalhoForm =
      this.fb.group({

        numeroDocumento: [
          '',
          Validators.required
        ],

        dataEntrada: [
          '',
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

    this.itemForm =
      this.fb.group({

        produtoId: [
          null,
          Validators.required
        ],

        quantidade: [
          1,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        precoUnitarioCompra: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      });

    this.editarItemForm =
      this.fb.group({

        quantidade: [
          1,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        precoUnitarioCompra: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]
      });
  }

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.voltar();
      return;
    }

    this.carregar(id);
  }

  carregar(
    id: string
  ): void {

    this.loading = true;

    this.service
      .obterPorId(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: entrada => {
          this.aplicarEntrada(
            entrada
          );

          if (
            entrada.status ===
            'Rascunho'
          ) {
            this.carregarProdutos();
          }
        },

        error: () => {

          this.toastService.error(
            'Não foi possível carregar a entrada de compra.'
          );

          this.voltar();
        }
      });
  }

  private aplicarEntrada(
    entrada: EntradaCompraDetalhe
  ): void {

    this.entrada = entrada;

    this.cabecalhoForm.patchValue({

      numeroDocumento:
        entrada.numeroDocumento,

      dataEntrada:
        entrada.dataEntrada
          .slice(0, 10),

      valorFrete:
        entrada.valorFrete,

      valorDesconto:
        entrada.valorDesconto,

      outrasDespesas:
        entrada.outrasDespesas,

      observacao:
        entrada.observacao ?? ''
    });

    this.atualizarProdutosDisponiveis();
  }

  carregarProdutos(): void {

    this.produtoService
      .listarTodos()
      .subscribe({

        next: produtos => {

          this.produtos =
            produtos.filter(
              produto => produto.ativo
            );

          this.atualizarProdutosDisponiveis();
        },

        error: () => {

          this.toastService.error(
            'Não foi possível carregar os produtos.'
          );
        }
      });
  }

  atualizarProdutosDisponiveis(): void {

    if (!this.entrada) {
      this.produtosDisponiveis =
        this.produtos;
      return;
    }

    const produtosNaEntrada =
      this.entrada.itens.map(
        item => item.produtoId
      );

    this.produtosDisponiveis =
      this.produtos.filter(
        produto =>
          produto.ativo &&
          !produtosNaEntrada.includes(
            produto.id
          )
      );
  }

  get podeEditar(): boolean {

    return (
      this.entrada?.status ===
      'Rascunho'
    );
  }

  get produtoSelecionado():
    ProdutoResponse | undefined {

    const produtoId =
      this.itemForm
        .get('produtoId')
        ?.value;

    return this.produtos.find(
      produto =>
        produto.id === produtoId
    );
  }

  aoSelecionarProduto(): void {

    const produto =
      this.produtoSelecionado;

    if (!produto) {
      return;
    }

    this.itemForm.patchValue({
      precoUnitarioCompra:
        produto.precoCompra
    });
  }

  salvarCabecalho(): void {

    if (
      !this.entrada ||
      !this.podeEditar ||
      this.cabecalhoForm.invalid ||
      this.salvandoCabecalho
    ) {
      this.cabecalhoForm
        .markAllAsTouched();

      return;
    }

    const value =
      this.cabecalhoForm
        .getRawValue();

    const request:
      AtualizarEntradaCompraRequest = {

      numeroDocumento:
        value.numeroDocumento.trim(),

      dataEntrada:
        `${value.dataEntrada}T12:00:00`,

      valorFrete:
        Number(
          value.valorFrete ?? 0
        ),

      valorDesconto:
        Number(
          value.valorDesconto ?? 0
        ),

      outrasDespesas:
        Number(
          value.outrasDespesas ?? 0
        ),

      observacao:
        this.normalizarTexto(
          value.observacao
        )
    };

    this.salvandoCabecalho = true;

    this.service
      .atualizar(
        this.entrada.id,
        request
      )
      .pipe(
        finalize(() => {
          this.salvandoCabecalho =
            false;
        })
      )
      .subscribe({

        next: entrada => {

          this.aplicarEntrada(
            entrada
          );

          this.toastService.success(
            'Dados da compra atualizados.'
          );
        },

        error: () => {
          // Interceptor exibe a mensagem.
        }
      });
  }

  adicionarItem(): void {

    if (
      !this.entrada ||
      !this.podeEditar ||
      this.itemForm.invalid ||
      this.adicionandoItem
    ) {
      this.itemForm
        .markAllAsTouched();

      return;
    }

    const value =
      this.itemForm.getRawValue();

    const request:
      AdicionarEntradaCompraItemRequest = {

      produtoId:
        value.produtoId,

      quantidade:
        Number(value.quantidade),

      precoUnitarioCompra:
        Number(
          value.precoUnitarioCompra
        )
    };

    this.adicionandoItem = true;

    this.service
      .adicionarItem(
        this.entrada.id,
        request
      )
      .pipe(
        finalize(() => {
          this.adicionandoItem =
            false;
        })
      )
      .subscribe({

        next: entrada => {

          this.aplicarEntrada(
            entrada
          );

          this.itemForm.reset({
            produtoId: null,
            quantidade: 1,
            precoUnitarioCompra: 0
          });

          this.toastService.success(
            'Produto adicionado à compra.'
          );
        },

        error: () => {
          // Interceptor exibe a mensagem.
        }
      });
  }

  iniciarEdicaoItem(
    item: EntradaCompraItem
  ): void {

    if (!this.podeEditar) {
      return;
    }

    this.editandoItemId =
      item.id;

    this.editarItemForm
      .reset({

        quantidade:
          item.quantidade,

        precoUnitarioCompra:
          item.precoUnitarioCompra
      });
  }

  cancelarEdicaoItem(): void {

    this.editandoItemId =
      null;
  }

  salvarItem(
    item: EntradaCompraItem
  ): void {

    if (
      !this.entrada ||
      !this.podeEditar ||
      this.editarItemForm.invalid ||
      this.salvandoItem
    ) {
      this.editarItemForm
        .markAllAsTouched();

      return;
    }

    const value =
      this.editarItemForm
        .getRawValue();

    const request:
      AtualizarEntradaCompraItemRequest = {

      quantidade:
        Number(value.quantidade),

      precoUnitarioCompra:
        Number(
          value.precoUnitarioCompra
        )
    };

    this.salvandoItem = true;

    this.service
      .atualizarItem(
        this.entrada.id,
        item.id,
        request
      )
      .pipe(
        finalize(() => {
          this.salvandoItem =
            false;
        })
      )
      .subscribe({

        next: entrada => {

          this.editandoItemId =
            null;

          this.aplicarEntrada(
            entrada
          );

          this.toastService.success(
            'Item atualizado com sucesso.'
          );
        },

        error: () => {
          // Interceptor exibe a mensagem.
        }
      });
  }

  removerItem(
    item: EntradaCompraItem
  ): void {

    if (
      !this.entrada ||
      !this.podeEditar ||
      this.removendoItemId
    ) {
      return;
    }

    const confirmou =
      window.confirm(
        `Remover "${item.nomeProduto}" desta entrada de compra?`
      );

    if (!confirmou) {
      return;
    }

    this.removendoItemId =
      item.id;

    this.service
      .removerItem(
        this.entrada.id,
        item.id
      )
      .pipe(
        finalize(() => {
          this.removendoItemId =
            null;
        })
      )
      .subscribe({

        next: entrada => {

          this.aplicarEntrada(
            entrada
          );

          this.toastService.success(
            'Produto removido da compra.'
          );
        },

        error: () => {
          // Interceptor exibe a mensagem.
        }
      });
  }

  confirmarEntrada(): void {

    if (
      !this.entrada ||
      !this.podeEditar ||
      this.confirmando
    ) {
      return;
    }

    if (
      this.entrada.itens.length === 0
    ) {

      this.toastService.error(
        'Adicione pelo menos um produto antes de confirmar a entrada.'
      );

      return;
    }

    const confirmou =
      window.confirm(
        'Confirmar esta entrada de compra? ' +
        'Esta operação movimentará o estoque e atualizará o custo dos produtos. ' +
        'Depois da confirmação o documento não poderá mais ser editado.'
      );

    if (!confirmou) {
      return;
    }

    this.confirmando = true;

    this.service
      .confirmar(
        this.entrada.id
      )
      .pipe(
        finalize(() => {
          this.confirmando =
            false;
        })
      )
      .subscribe({

        next: entrada => {

          this.aplicarEntrada(
            entrada
          );

          this.toastService.success(
            'Entrada confirmada e estoque atualizado.'
          );
        },

        error: () => {
          // Interceptor exibe a mensagem.
        }
      });
  }

  voltar(): void {

    this.router.navigate([
      '/dashboard/compras'
    ]);
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
