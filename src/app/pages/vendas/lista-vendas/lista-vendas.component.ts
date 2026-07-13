import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../../../services/venda.service';
import { VendaResumo, VendaFiltro } from '../../../core/models/venda.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-lista-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private loadingService: LoadingService
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
    this.criandoVenda = true;
    this.vendaService.criar({}).subscribe({
      next: () => {
        this.toastService.success('Rascunho criado com sucesso.');
        this.carregarVendas();
        this.criandoVenda = false;
      },
      error: () => {
        this.toastService.error('Não foi possível criar o rascunho.');
        this.criandoVenda = false;
      }
    });
  }
}
