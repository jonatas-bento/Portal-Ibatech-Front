import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VendaService } from '../../../services/venda.service';
import { VendaResumo, VendaFiltro } from '../../../core/models/venda.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-lista-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-vendas.component.html',
  styleUrls: ['./lista-vendas.component.css']
})
export class ListaVendasComponent implements OnInit {
  vendas: VendaResumo[] = [];
  filtros: VendaFiltro = {
    status: 'Rascunho'
  };
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
          this.toastService.error('Não foi possível carregar as vendas.');
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
