// src/app/services/financeiro.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResumoFinanceiro, TransacaoResponse, TransacaoCreateRequest } from '../core/models/financeiro.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/financeiro`; // Aponta para o novo controller C#

  // Estados Reativos Locais (Cache)
  private readonly _resumo = signal<ResumoFinanceiro | null>(null);
  readonly resumo = computed(() => this._resumo());

  private readonly _transacoes = signal<TransacaoResponse[]>([]);
  readonly transacoes = computed(() => this._transacoes());

  // Requisição: Obter Cards de Resumo (Receitas, Despesas, Saldo)
  obterResumo(): Observable<ResumoFinanceiro> {
    return this.http.get<ResumoFinanceiro>(`${this.apiUrl}/resumo`).pipe(
      tap(dados => this._resumo.set(dados))
    );
  }

  // Requisição: Listar Extrato Completo
  listarTodas(): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(this.apiUrl).pipe(
      tap(lista => this._transacoes.set(lista))
    );
  }

  // Requisição: Lançar Nova Transação (Receita / Despesa)
  criar(dto: TransacaoCreateRequest): Observable<TransacaoResponse> {
    return this.http.post<TransacaoResponse>(this.apiUrl, dto).pipe(
      tap(nova => {
        // Atualiza a lista local reativamente jogando o novo lançamento no topo
        this._transacoes.update(atual => [nova, ...atual]);
        // Força a atualização dos cards de resumo após o novo lançamento
        this.obterResumo().subscribe();
      })
    );
  }

  // Requisição: Dar baixa / Liquidar transação por ID
  liquidar(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/liquidar`, {}).pipe(
      tap(() => {
        // Atualiza o estado da transação localmente para refletir na tabela sem dar F5
        this._transacoes.update(lista => 
          lista.map(t => t.id === id ? { ...t, liquidada: true, dataLiquidacao: new Date().toISOString() } : t)
        );
        // Atualiza os cards com os novos saldos liquidados
        this.obterResumo().subscribe();
      })
    );
  }
}