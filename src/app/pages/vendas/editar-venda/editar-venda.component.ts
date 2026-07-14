import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { VendaService } from '../../../services/venda.service';
import { ConfirmarRemoverItemDialogComponent } from './confirmar-remover-item-dialog.component';
import { ClienteService } from '../../../services/cliente.service';
import { VendaDetalhe, AtualizarVendaRequest, AdicionarVendaItemRequest } from '../../../core/models/venda.model';
import { ClienteResumo } from '../../../core/models/cliente.model';
import { ToastService } from '../../../services/toast.service';
import { ProdutoService } from '../../../services/produto.service';
import { ProdutoResponse } from '../../../core/models/produto.model';

@Component({
  selector: 'app-editar-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './editar-venda.component.html',
  styleUrls: ['./editar-venda.component.css']
})
export class EditarVendaComponent implements OnInit {
  venda?: VendaDetalhe;
  form: FormGroup;
  itemForm: FormGroup;
  clientes: ClienteResumo[] = [];
  produtos: ProdutoResponse[] = [];
  produtosDisponiveis: ProdutoResponse[] = [];
  loading = false;
  salvando = false;
  carregandoProdutos = false;
  adicionandoItem = false;
  removendoItemId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private toastService: ToastService,
    private produtoService: ProdutoService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      clienteId: [null],
      observacao: ['']
    });

    this.itemForm = this.fb.group({
      produtoId: [null, [Validators.required]],
      quantidade: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      desconto: [0, [Validators.required, Validators.min(0)]]
    }, { validators: [() => this.validarDescontoMaiorQueBruto()] });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarVenda(id);
      this.carregarClientes();
      this.carregarProdutos();
    } else {
      this.toastService.error('ID da venda não informado.');
      this.router.navigate(['/dashboard/vendas']);
    }
  }

  carregarVenda(id: string): void {
    this.loading = true;
    this.vendaService.obterPorId(id).subscribe({
      next: (data) => {
        this.venda = data;
        this.form.patchValue({
          clienteId: data.clienteId,
          observacao: data.observacao
        });
        this.atualizarProdutosDisponiveis();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erro ao carregar venda.');
        this.router.navigate(['/dashboard/vendas']);
        this.loading = false;
      }
    });
  }

  carregarProdutos(): void {
  this.carregandoProdutos = true;

  this.produtoService
    .listarTodos()
    .pipe(
      finalize(() => {
        this.carregandoProdutos = false;
      })
    )
    .subscribe({
      next: (data) => {
        this.produtos = data;
        this.atualizarProdutosDisponiveis();

        this.itemForm.updateValueAndValidity({
          emitEvent: false
        });
      },
      error: () => {
        this.toastService.error(
          'Erro ao carregar produtos.'
        );
      }
    });
}

  atualizarProdutosDisponiveis(): void {
    if (!this.venda) {
      this.produtosDisponiveis = [];
      return;
    }
    const itensIds = this.venda.itens.map(item => item.produtoId);
    this.produtosDisponiveis = this.produtos.filter(p => p.ativo && !itensIds.includes(p.id));
  }

  get produtoSelecionado(): ProdutoResponse | undefined {
    const id = this.itemForm.get('produtoId')?.value;
    return this.produtos.find(p => p.id === id);
  }

  get precoUnitarioPrevio(): number {
    return this.produtoSelecionado?.precoVenda ?? 0;
  }

  get quantidadePrevia(): number {
    const val = this.itemForm.get('quantidade')?.value;
    const num = Number(val);
    return isNaN(num) || num < 1 ? 0 : num;
  }

  get valorBrutoPrevio(): number {
    return this.quantidadePrevia * this.precoUnitarioPrevio;
  }

  get descontoPrevio(): number {
    const val = this.itemForm.get('desconto')?.value;
    const num = Number(val);
    return isNaN(num) || num < 0 ? 0 : num;
  }

  get totalPrevistoPrevio(): number {
    return Math.max(0, this.valorBrutoPrevio - this.descontoPrevio);
  }

  get estoqueInformativo(): number {
    return this.produtoSelecionado?.quantidadeAtual ?? 0;
  }

  validarDescontoMaiorQueBruto(): ValidationErrors | null {
  if (!this.itemForm) {
    return null;
  }

  const quantidade = Number(
    this.itemForm.get('quantidade')?.value
  );

  const desconto = Number(
    this.itemForm.get('desconto')?.value
  );

  const produto = this.produtoSelecionado;

  if (
    !produto ||
    !Number.isFinite(quantidade) ||
    !Number.isFinite(desconto)
  ) {
    return null;
  }

  return desconto > quantidade * produto.precoVenda
    ? { descontoMaiorQueBruto: true }
    : null;
}

  adicionarItem(): void {
    if (this.adicionandoItem || !this.venda) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const produtoId = this.itemForm.get('produtoId')?.value;

    if (!produtoId) {
      this.itemForm.get('produtoId')?.markAsTouched();
      return;
    }

    const request: AdicionarVendaItemRequest = {
      produtoId,
      quantidade: Number(
        this.itemForm.get('quantidade')?.value
      ),
      desconto: Number(
        this.itemForm.get('desconto')?.value ?? 0
      )
    };

    this.adicionandoItem = true;

    this.vendaService
      .adicionarItem(this.venda.id, request)
      .pipe(
        finalize(() => {
          this.adicionandoItem = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.venda = data;

          this.itemForm.reset({
            produtoId: null,
            quantidade: 1,
            desconto: 0
          });

          this.atualizarProdutosDisponiveis();
          this.toastService.success(
            'Produto adicionado com sucesso.'
          );
        },
        error: () => {
          // O interceptor apresenta a mensagem retornada pelo backend.
          // O formulário permanece preenchido para que o usuário corrija.
        }
      });
  }

  removerItem(item: any): void {
    if (!this.venda || this.removendoItemId) {
      return;
    }

    const produto = this.produtos.find(p => p.id === item.produtoId);
    const nomeProduto = produto ? produto.nome : 'Produto';

    this.dialog.open(ConfirmarRemoverItemDialogComponent, {
      data: { nomeProduto },
      width: '400px',
      panelClass: 'ib-remover-item-dialog'
    }).afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.removendoItemId = item.id;

        this.vendaService
          .removerItem(this.venda!.id, item.id)
          .pipe(
            finalize(() => {
              this.removendoItemId = null;
            })
          )
          .subscribe({
            next: (vendaAtualizada) => {
              this.venda = vendaAtualizada;
              this.atualizarProdutosDisponiveis();
              this.toastService.success('Produto removido da venda.');
            },
            error: () => {
              // O interceptor exibe o detalhe do backend.
            }
          });
      }
    });
  }

  carregarClientes(): void {
    this.clienteService.listar({}).subscribe({
      next: (data) => this.clientes = data.filter(c => c.ativo),
      error: () => this.toastService.error('Erro ao carregar clientes.')
    });
  }

  salvar(): void {
    if (this.salvando || this.form.invalid || !this.venda) {
      return;
    }

    const request: AtualizarVendaRequest = {
      clienteId: this.form.get('clienteId')?.value ?? null,
      observacao: this.form.get('observacao')?.value
    };

    this.salvando = true;

    this.vendaService.atualizar(this.venda.id, request)
      .pipe(finalize(() => this.salvando = false))
      .subscribe({
        next: (data) => {
          this.venda = data;

          this.form.patchValue({
            clienteId: data.clienteId ?? null,
            observacao: data.observacao ?? ''
          });

          this.toastService.success('Venda atualizada com sucesso.');
        },
        error: () => {
          this.toastService.error('Erro ao atualizar venda.');
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/vendas']);
  }
}
