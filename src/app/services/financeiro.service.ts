// src/app/services/financeiro.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  FinanceiroFiltro,
  ResumoFinanceiroDetalhado,
  ResultadoPaginadoFinanceiro,
  TransacaoFinanceiraResumo
} from '../core/models/financeiro.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Financeiro`;

  // Requisição: Obter resumo consolidado do painel financeiro
  obterResumo(filtro: FinanceiroFiltro): Observable<ResumoFinanceiroDetalhado> {
    const params = this.criarParametros(filtro, false);
    return this.http.get<ResumoFinanceiroDetalhado>(`${this.apiUrl}/painel/resumo`, { params });
  }

  // Requisição: Listar transações paginadas do painel financeiro
  listarTransacoes(
    filtro: FinanceiroFiltro
  ): Observable<ResultadoPaginadoFinanceiro<TransacaoFinanceiraResumo>> {
    const params = this.criarParametros(filtro, true);
    return this.http.get<ResultadoPaginadoFinanceiro<TransacaoFinanceiraResumo>>(
      `${this.apiUrl}/painel/transacoes`,
      { params }
    );
  }

  // Monta os HttpParams a partir do filtro, enviando apenas valores preenchidos.
  private criarParametros(filtro: FinanceiroFiltro, incluirPaginacao: boolean): HttpParams {
    let params = new HttpParams();

    params = params.set('dataInicio', filtro.dataInicio);
    params = params.set('dataFim', filtro.dataFim);

    if (filtro.tipo) {
      params = params.set('tipo', filtro.tipo);
    }

    if (filtro.categoria && filtro.categoria.trim()) {
      params = params.set('categoria', filtro.categoria.trim());
    }

    if (filtro.liquidada !== undefined) {
      params = params.set('liquidada', filtro.liquidada.toString());
    }

    if (filtro.formaPagamento) {
      params = params.set('formaPagamento', filtro.formaPagamento);
    }

    if (filtro.vendaId) {
      params = params.set('vendaId', filtro.vendaId);
    }

    if (filtro.termo && filtro.termo.trim()) {
      params = params.set('termo', filtro.termo.trim());
    }

    if (incluirPaginacao) {
      if (filtro.pagina !== undefined) {
        params = params.set('pagina', filtro.pagina.toString());
      }
      if (filtro.tamanhoPagina !== undefined) {
        params = params.set('tamanhoPagina', filtro.tamanhoPagina.toString());
      }
    }

    return params;
  }

  /**
   * Converte uma data local (YYYY-MM-DD) inclusiva de início em ISO string
   * representando o início do dia (00:00:00) no fuso horário local.
   */
  static converterDataInicio(valor: string): string {
    const data = FinanceiroService.parseDataLocal(valor);
    return new Date(
      data.ano,
      data.mes - 1,
      data.dia,
      0, 0, 0, 0
    ).toISOString();
  }

  /**
   * Converte uma data local (YYYY-MM-DD) inclusiva de fim, retornando o
   * início do dia seguinte em ISO string, pois o backend trata DataFim
   * como exclusiva.
   */
  static converterDataFimExclusiva(valor: string): string {
    const data = FinanceiroService.parseDataLocal(valor);
    const dataBase = new Date(data.ano, data.mes - 1, data.dia, 0, 0, 0, 0);
    dataBase.setDate(dataBase.getDate() + 1);
    return dataBase.toISOString();
  }

  private static parseDataLocal(valor: string): { ano: number; mes: number; dia: number } {
    if (!valor || typeof valor !== 'string') {
      throw new Error('Data inválida: valor não informado.');
    }

    const partes = valor.split('-').map(Number);

    if (partes.length !== 3 || partes.some(p => Number.isNaN(p))) {
      throw new Error(`Data inválida: "${valor}". Formato esperado YYYY-MM-DD.`);
    }

    const [ano, mes, dia] = partes;

    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      throw new Error(`Data inválida: "${valor}".`);
    }

    return { ano, mes, dia };
  }
}
