// src/app/pages/estoque/lista-produtos/lista-produtos.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EstoqueService } from 'src/app/services/estoque.service';
import { ImportarProdutosComponent } from '../importar-produtos/importar-produtos.component';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-produtos.component.html',
  styleUrls: ['./lista-produtos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaProdutosComponent implements OnInit {
  // Injeção de Serviços
  readonly estoqueService = inject(EstoqueService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Estados Reativos de UI baseados em Signals
  readonly carregando = signal<boolean>(false);
  readonly erroMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.buscarEstoque();
  }

  /**
   * Dispara a requisição HTTP para coletar a lista de ativos do back-end
   */
  buscarEstoque(): void {
    this.carregando.set(true);
    this.erroMsg.set(null);

    this.estoqueService.listarTodos().subscribe({
      error: (err) => {
        console.error(err);
        this.erroMsg.set('Falha ao sincronizar inventário com o laboratório Ibatech.');
        this.carregando.set(false);
      },
      complete: () => {
        this.carregando.set(false);
      }
    });
  }

  /**
   * Redireciona o usuário para a rota de cadastro de um novo ativo
   */
  irParaCadastro(): void {
    this.router.navigate(['/dashboard/estoque/novo']);
  }

  abrirImportacao(): void {
    const dialogRef = this.dialog.open(ImportarProdutosComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.atualizarLista) {
        this.buscarEstoque();
      }
    });
  }

  /**
   * Alimenta o signal do serviço reativo para filtrar as linhas da tabela
   * @param valor String digitada pelo usuário no campo de busca
   */
  aoDigitarBusca(valor: string): void {
    this.estoqueService.filtroTexto.set(valor);
  }

  /**
   * Método mantido apenas para compatibilidade legada com eventos de Blur/Change antigos
   */
  onBuscaAlterada(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.aoDigitarBusca(valor);
  }
}