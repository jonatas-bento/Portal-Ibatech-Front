import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  VendaResumo,
  VendaDetalhe,
  CriarVendaRequest,
  AtualizarVendaRequest,
  AdicionarVendaItemRequest,
  VendaFiltro
} from '../core/models/venda.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private readonly apiUrl = `${environment.apiUrl}/vendas`;

  constructor(private http: HttpClient) {}

  listar(filtros?: VendaFiltro): Observable<VendaResumo[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.numero) params = params.set('numero', filtros.numero);
      if (filtros.clienteId) params = params.set('clienteId', filtros.clienteId);
      if (filtros.vendedorId) params = params.set('vendedorId', filtros.vendedorId);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.dataInicial) params = params.set('dataInicial', filtros.dataInicial);
      if (filtros.dataFinal) params = params.set('dataFinal', filtros.dataFinal);
    }

    return this.http.get<VendaResumo[]>(this.apiUrl, { params });
  }

  obterPorId(id: string): Observable<VendaDetalhe> {
    return this.http.get<VendaDetalhe>(`${this.apiUrl}/${id}`);
  }

  criar(request: CriarVendaRequest): Observable<VendaDetalhe> {
    return this.http.post<VendaDetalhe>(this.apiUrl, request);
  }

  atualizar(id: string, request: AtualizarVendaRequest): Observable<VendaDetalhe> {
    return this.http.put<VendaDetalhe>(`${this.apiUrl}/${id}`, request);
  }

  adicionarItem(vendaId: string, request: AdicionarVendaItemRequest): Observable<VendaDetalhe> {
    return this.http.post<VendaDetalhe>(`${this.apiUrl}/${vendaId}/itens`, request);
  }

  removerItem(vendaId: string, itemId: string): Observable<VendaDetalhe> {
    return this.http.delete<VendaDetalhe>(`${this.apiUrl}/${vendaId}/itens/${itemId}`);
  }
}
