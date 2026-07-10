// src/app/services/estoque.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProdutoCreateRequest, ProdutoImportacaoResultado, ProdutoResponse } from '../core/models/produto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private readonly http = inject(HttpClient);
  // Como o environment.apiUrl geralmente já possui o "/api", mude para:
private readonly apiUrl = `${environment.apiUrl}/produtos`;

  private readonly _produtos = signal<ProdutoResponse[]>([]);
  readonly produtos = computed(() => this._produtos());
  readonly filtroTexto = signal<string>('');

  // Computação reativa baseada nas SUAS propriedades de interface
  readonly produtosFiltrados = computed(() => {
    const texto = this.filtroTexto().toLowerCase().trim();
    if (!texto) return this._produtos();

    return this._produtos().filter(p => 
      p.nome.toLowerCase().includes(texto) || 
      (p.codigoSku && p.codigoSku.toLowerCase().includes(texto)) || 
      p.tipo.toLowerCase().includes(texto)
    );
  });

  listarTodos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(this.apiUrl).pipe(
      tap(lista => this._produtos.set(lista))
    );
  }

  cadastrar(dto: ProdutoCreateRequest): Observable<ProdutoResponse> {
    return this.http.post<ProdutoResponse>(this.apiUrl, dto).pipe(
      tap(novo => this._produtos.update(atual => [novo, ...atual]))
    );
  }

  importarProdutos(arquivo: File): Observable<ProdutoImportacaoResultado> {
    const formData = new FormData();
    formData.append('arquivo', arquivo, arquivo.name);
    return this.http.post<ProdutoImportacaoResultado>(`${this.apiUrl}/importar`, formData);
  }
}
