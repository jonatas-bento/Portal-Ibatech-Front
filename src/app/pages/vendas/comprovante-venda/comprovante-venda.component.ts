import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { VendaService } from '../../../services/venda.service';
import { VendaDetalhe } from '../../../core/models/venda.model';

/**
 * Status aceitos para emissão do comprovante.
 * O backend utiliza "Concluida"; "Finalizada" é aceito de forma defensiva.
 */
const STATUS_PERMITIDOS_COMPROVANTE = ['Concluida', 'Finalizada'];

/**
 * Comprovante (NÃO FISCAL) de venda concluída.
 *
 * Tela estritamente somente leitura: não edita a venda, não recalcula
 * estoque, não gera transação financeira, não finaliza novamente e não
 * altera status. Utiliza apenas os dados consolidados retornados pelo
 * backend em GET /api/vendas/{id} (VendaService.obterPorId).
 */
@Component({
  selector: 'app-comprovante-venda',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './comprovante-venda.component.html',
  styleUrls: ['./comprovante-venda.component.scss']
})
export class ComprovanteVendaComponent implements OnInit, OnDestroy {
  venda?: VendaDetalhe;
  carregando = true;
  erro = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendaService: VendaService
  ) {}

  ngOnInit(): void {
    // Classe no body usada pelos estilos globais de impressão para
    // esconder sidebar/navbar e limpar o fundo escuro apenas nesta tela.
    document.body.classList.add('ib-imprimindo-comprovante');

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.erro = true;
      this.carregando = false;
      return;
    }

    this.vendaService
      .obterPorId(id)
      .pipe(finalize(() => this.carregando = false))
      .subscribe({
        next: (venda) => {
          this.venda = venda;
        },
        error: () => {
          // Venda inexistente/sem permissão: o interceptor exibe o erro da API.
          this.erro = true;
        }
      });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('ib-imprimindo-comprovante');
  }

  /** Somente venda concluída/finalizada pode emitir comprovante. */
  get vendaConcluida(): boolean {
    return !!this.venda && STATUS_PERMITIDOS_COMPROVANTE.includes(this.venda.status);
  }

  get formaPagamentoLabel(): string {
    switch (this.venda?.formaPagamento) {
      case 'Dinheiro':       return 'Dinheiro';
      case 'Pix':            return 'Pix';
      case 'CartaoDebito':   return 'Cartão de débito';
      case 'CartaoCredito':  return 'Cartão de crédito';
      default:               return '-';
    }
  }

  /** Formata valores em pt-BR, sem recalcular nada (usa o total consolidado do backend). */
  formatarValor(valor?: number | null): string {
    if (valor === null || valor === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  /** Formata datas no padrão pt-BR: 08/10/2026 16:50 */
  formatarDataHora(data?: string | null): string {
    if (!data) {
      return '-';
    }

    const d = new Date(data);
    if (isNaN(d.getTime())) {
      return '-';
    }

    const parteData = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(d);
    const parteHora = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    }).format(d);

    return `${parteData} ${parteHora}`;
  }

  /** Aciona a impressão/salvar PDF do navegador (A4). */
  imprimir(): void {
    window.print();
  }

  voltar(): void {
    if (this.venda) {
      this.router.navigate(['/dashboard/vendas', this.venda.id]);
      return;
    }
    this.router.navigate(['/dashboard/vendas']);
  }
}
