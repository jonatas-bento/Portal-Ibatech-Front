import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VendaService } from '../../../services/venda.service';
import { VendaResumo, VendaFiltro } from '../../../core/models/venda.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-lista-vendas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './lista-vendas.component.html',
  styleUrls: ['./lista-vendas.component.css']
})
export class ListaVendasComponent implements OnInit {
  vendas: VendaResumo[] = [];
  filtros: VendaFiltro = {
    status: 'Rascunho'
  };
  readonly statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Rascunho', label: 'Rascunho' },
    { value: 'AguardandoPagamento', label: 'Aguardando pagamento' },
    { value: 'Concluida', label: 'Concluída' },
    { value: 'Cancelada', label: 'Cancelada' },
    { value: 'Estornada', label: 'Estornada' }
  ];
  loading = false;
  criandoVenda = false;

  constructor(
    private vendaService: VendaService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVendas();
  }

  carregarVendas(): void {
    this.loading = true;
    this.vendaService.listar(this.filtros)
      .subscribe({
        next: (data) => {
          this.vendas = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  filtrar(): void {
    this.carregarVendas();
  }

  limparFiltros(): void {
    this.filtros = {};
    this.carregarVendas();
  }

  /**
   * Converte o valor técnico do status em um label amigável para exibição.
   * Não confundir "Concluida" com "Finalizada" — o valor técnico permanece
   * inalterado, apenas o texto exibido é traduzido.
   */
  statusLabel(status: string): string {
    switch (status) {
      case 'Rascunho':
        return 'Rascunho';
      case 'AguardandoPagamento':
        return 'Aguardando pagamento';
      case 'Concluida':
        return 'Concluída';
      case 'Cancelada':
        return 'Cancelada';
      case 'Estornada':
        return 'Estornada';
      default:
        return status;
    }
  }

  criarNovaVenda(): void {

    if (this.criandoVenda) {
      return;
    }

    this.criandoVenda = true;

    this.vendaService.criar({})
      .pipe(finalize(() => this.criandoVenda = false))
      .subscribe({
        next: (venda) => {
          this.toastService.success('Rascunho criado com sucesso.');
          this.router.navigate(['/dashboard/vendas', venda.id]);
        },
        error: () => {
          this.toastService.error('Não foi possível criar o rascunho.');
        }
      });
  }
}
