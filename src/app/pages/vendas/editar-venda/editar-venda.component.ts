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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { VendaService } from '../../../services/venda.service';
import { ConfirmarRemoverItemDialogComponent } from './confirmar-remover-item-dialog.component';
import { EditarVendaItemDialogComponent } from './editar-venda-item-dialog.component';
import { FinalizarVendaDialogComponent } from './finalizar-venda-dialog.component';
import { CancelarVendaDialogComponent } from './cancelar-venda-dialog.component';
import { EstornarVendaDialogComponent } from './estornar-venda-dialog.component';
import { ClienteService } from '../../../services/cliente.service';
import {
  VendaDetalhe,
  AtualizarVendaRequest,
  AdicionarVendaItemRequest,
  FinalizarVendaRequest,
  CancelarVendaRequest,
  EstornarVendaRequest
} from '../../../core/models/venda.model';
import { ClienteResumo } from '../../../core/models/cliente.model';
import { ToastService } from '../../../services/toast.service';
import { ProdutoService } from '../../../services/produto.service';
import { ProdutoResponse } from '../../../core/models/produto.model';
import { AuthService } from '../../../services/auth.service';


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
    MatIconModule,
    MatTooltipModule
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
  editandoItemId: string | null = null;
  finalizandoVenda = false;
  cancelandoVenda = false;
  estornandoVenda = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private toastService: ToastService,
    private produtoService: ProdutoService,
    private dialog: MatDialog,
    private authService: AuthService
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
      this.toastService.error('ID da venda nÃ£o informado.');
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

  /**
   * Indica se a venda pode ser editada (somente vendas em Rascunho).
   * Deve ser usado tanto no template quanto como guard nos mÃ©todos de aÃ§Ã£o.
   */
  get vendaPodeSerEditada(): boolean {
    return this.venda?.status === 'Rascunho';
  }

  get vendaConcluida(): boolean {
    return this.venda?.status === 'Concluida';
  }

  get vendaCancelada(): boolean {
    return this.venda?.status === 'Cancelada';
  }

  get vendaEstornada(): boolean {
    return this.venda?.status === 'Estornada';
  }

  get usuarioEhAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Indica se qualquer operaÃ§Ã£o de escrita estÃ¡ em andamento na tela.
   * Usado para impedir aÃ§Ãµes concorrentes (abrir diÃ¡logos, disparar
   * novas requisiÃ§Ãµes) enquanto uma chamada anterior ainda nÃ£o terminou.
   */
  get operacaoEmAndamento(): boolean {
    return (
      this.salvando ||
      this.adicionandoItem ||
      !!this.editandoItemId ||
      !!this.removendoItemId ||
      this.finalizandoVenda ||
      this.cancelandoVenda ||
      this.estornandoVenda
    );
  }

  /**
   * Regras de autorizaÃ§Ã£o visual (o backend permanece a fonte definitiva):
   * - Admin pode cancelar qualquer venda em Rascunho;
   * - Vendedor pode cancelar somente as prÃ³prias vendas em Rascunho.
   */
  get podeCancelarVenda(): boolean {
    if (!this.venda || this.venda.status !== 'Rascunho') {
      return false;
    }

    if (this.usuarioEhAdmin) {
      return true;
    }

    const usuarioId = this.authService.currentUserId();
    return !!usuarioId && this.venda.vendedorId === usuarioId;
  }

  /**
   * Somente Admin pode estornar, e somente vendas ConcluÃ­da.
   */
  get podeEstornarVenda(): boolean {
    return this.usuarioEhAdmin && this.venda?.status === 'Concluida';
  }


  get formaPagamentoLabel(): string {
    switch (this.venda?.formaPagamento) {
      case 'Dinheiro':
        return 'Dinheiro';
      case 'Pix':
        return 'Pix';
      case 'CartaoDebito':
        return 'CartÃ£o de dÃ©bito';
      case 'CartaoCredito':
        return 'CartÃ£o de crÃ©dito';
      default:
        return '-';
    }
  }

  get valorRecebidoExibicao(): number {
    if (!this.venda) {
      return 0;
    }

    if (this.venda.formaPagamento === 'Dinheiro') {
      return this.venda.valorRecebido ?? 0;
    }

    return this.venda.valorTotal;
  }

  get trocoExibicao(): number {
    if (!this.venda) {
      return 0;
    }

    if (this.venda.formaPagamento === 'Dinheiro') {
      return this.venda.troco ?? 0;
    }

    return 0;
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
    if (!this.vendaPodeSerEditada || this.adicionandoItem || !this.venda) {
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
          // O formulÃ¡rio permanece preenchido para que o usuÃ¡rio corrija.
        }
      });
  }

  removerItem(item: any): void {
    if (!this.vendaPodeSerEditada || !this.venda || this.removendoItemId) {
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

  editarItem(item: any): void {
    if (!this.vendaPodeSerEditada || !this.venda || this.editandoItemId) {
      return;
    }

    this.dialog.open(EditarVendaItemDialogComponent, {
      data: {
        itemId: item.id,
        codigoSku: item.codigoSku,
        nomeProduto: item.nomeProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto
      },
      width: '400px',
      panelClass: 'ib-editar-item-dialog'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.editandoItemId = item.id;

        this.vendaService
          .atualizarItem(this.venda!.id, item.id, {
            quantidade: result.quantidade,
            desconto: result.desconto
          })
          .pipe(
            finalize(() => {
              this.editandoItemId = null;
            })
          )
          .subscribe({
            next: (vendaAtualizada) => {
              this.venda = vendaAtualizada;
              this.toastService.success('Produto atualizado com sucesso.');
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
    if (!this.vendaPodeSerEditada || this.salvando || this.form.invalid || !this.venda) {
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

  /**
   * Abre o diÃ¡logo de checkout da venda e, se confirmado, chama o
   * endpoint de finalizaÃ§Ã£o. A resposta do backend Ã© a fonte definitiva
   * dos dados da venda finalizada â€” nÃ£o hÃ¡ recÃ¡lculo local.
   */
  abrirFinalizacao(): void {
    if (!this.venda) {
      return;
    }

    if (!this.vendaPodeSerEditada) {
      return;
    }

    if (this.venda.itens.length === 0) {
      return;
    }

    if (this.finalizandoVenda || this.salvando || this.adicionandoItem || this.editandoItemId || this.removendoItemId) {
      return;
    }

    this.dialog.open(FinalizarVendaDialogComponent, {
      data: {
        numero: this.venda.numero,
        valorBruto: this.venda.valorBruto,
        desconto: this.venda.desconto,
        valorTotal: this.venda.valorTotal,
        quantidadeItens: this.venda.itens.length
      },
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ib-finalizar-venda-dialog'
    }).afterClosed().subscribe((resultado: FinalizarVendaRequest | null) => {
      if (!resultado || !this.venda) {
        return;
      }

      const request: FinalizarVendaRequest = {
        formaPagamento: resultado.formaPagamento,
        valorRecebido: resultado.valorRecebido
      };

      this.finalizandoVenda = true;

      this.vendaService
        .finalizar(this.venda.id, request)
        .pipe(finalize(() => this.finalizandoVenda = false))
        .subscribe({
          next: (vendaFinalizada) => {
            this.venda = vendaFinalizada;
            this.toastService.success('Venda finalizada com sucesso.');
          },
          error: () => {
            // O interceptor exibe a mensagem especÃ­fica retornada pelo backend
            // (estoque insuficiente, venda jÃ¡ concluÃ­da, conflito, etc).
            // A venda permanece como estava antes da tentativa.
          }
        });
    });
  }

  /**
   * Guard TypeScript: valida venda existente, status Rascunho, usuÃ¡rio
   * autorizado e ausÃªncia de operaÃ§Ã£o em andamento antes de abrir o
   * diÃ¡logo de cancelamento. NÃ£o confia apenas no botÃ£o oculto no template.
   */
  abrirCancelamento(): void {
    if (!this.venda) {
      return;
    }

    if (this.venda.status !== 'Rascunho') {
      return;
    }

    if (!this.podeCancelarVenda) {
      return;
    }

    if (this.operacaoEmAndamento) {
      return;
    }

    this.dialog.open(CancelarVendaDialogComponent, {
      data: {
        numero: this.venda.numero,
        valorTotal: this.venda.valorTotal,
        quantidadeItens: this.venda.itens.length
      },
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ib-cancelar-venda-dialog'
    }).afterClosed().subscribe((resultado: CancelarVendaRequest | null) => {
      if (!resultado || !this.venda) {
        return;
      }

      this.cancelandoVenda = true;

      this.vendaService
        .cancelar(this.venda.id, resultado)
        .pipe(finalize(() => this.cancelandoVenda = false))
        .subscribe({
          next: (vendaAtualizada) => {
            this.venda = vendaAtualizada;
            this.toastService.success('Venda cancelada com sucesso.');
          },
          error: () => {
            // O interceptor exibe a mensagem especÃ­fica retornada pelo backend
            // (403, 409, etc). A venda permanece como estava antes da tentativa.
          }
        });
    });
  }

  /**
   * Guard TypeScript: valida venda existente, status Concluida, usuÃ¡rio
   * Admin e ausÃªncia de operaÃ§Ã£o em andamento antes de abrir o diÃ¡logo
   * de estorno. NÃ£o confia apenas no botÃ£o oculto no template.
   */
  abrirEstorno(): void {
    if (!this.venda) {
      return;
    }

    if (this.venda.status !== 'Concluida') {
      return;
    }

    if (!this.usuarioEhAdmin) {
      return;
    }

    if (this.operacaoEmAndamento) {
      return;
    }

    this.dialog.open(EstornarVendaDialogComponent, {
      data: {
        numero: this.venda.numero,
        valorTotal: this.venda.valorTotal,
        formaPagamento: this.venda.formaPagamento,
        quantidadeItens: this.venda.itens.length
      },
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ib-estornar-venda-dialog'
    }).afterClosed().subscribe((resultado: EstornarVendaRequest | null) => {
      if (!resultado || !this.venda) {
        return;
      }

      this.estornandoVenda = true;

      this.vendaService
        .estornar(this.venda.id, resultado)
        .pipe(finalize(() => this.estornandoVenda = false))
        .subscribe({
          next: (vendaAtualizada) => {
            this.venda = vendaAtualizada;
            this.toastService.success('Venda estornada com sucesso.');
          },
          error: () => {
            // O interceptor exibe a mensagem especÃ­fica retornada pelo backend
            // (403, 409, etc). A venda permanece como estava antes da tentativa.
          }
        });
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/vendas']);
  }
}
