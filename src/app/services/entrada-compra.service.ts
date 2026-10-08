import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  AdicionarEntradaCompraItemRequest,
  AtualizarEntradaCompraItemRequest,
  AtualizarEntradaCompraRequest,
  CriarEntradaCompraRequest,
  EntradaCompraDetalhe,
  EntradaCompraResumo,
  EntradaCompraImportacaoResultado,
  ImportarEntradaCompraRequest
} from '../core/models/entrada-compra.model';

@Injectable({
  providedIn: 'root'
})
export class EntradaCompraService {

  private readonly apiUrl =
    `${environment.apiUrl}/entradas-compras`;

  constructor(
    private readonly http: HttpClient
  ) {}

  listar(): Observable<EntradaCompraResumo[]> {
    return this.http.get<EntradaCompraResumo[]>(
      this.apiUrl
    );
  }

  obterPorId(
    id: string
  ): Observable<EntradaCompraDetalhe> {
    return this.http.get<EntradaCompraDetalhe>(
      `${this.apiUrl}/${id}`
    );
  }

  criar(
    request: CriarEntradaCompraRequest
  ): Observable<EntradaCompraDetalhe> {
    return this.http.post<EntradaCompraDetalhe>(
      this.apiUrl,
      request
    );
  }

  atualizar(
    id: string,
    request: AtualizarEntradaCompraRequest
  ): Observable<EntradaCompraDetalhe> {
    return this.http.put<EntradaCompraDetalhe>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  adicionarItem(
    entradaId: string,
    request: AdicionarEntradaCompraItemRequest
  ): Observable<EntradaCompraDetalhe> {
    return this.http.post<EntradaCompraDetalhe>(
      `${this.apiUrl}/${entradaId}/itens`,
      request
    );
  }

  atualizarItem(
    entradaId: string,
    itemId: string,
    request: AtualizarEntradaCompraItemRequest
  ): Observable<EntradaCompraDetalhe> {
    return this.http.put<EntradaCompraDetalhe>(
      `${this.apiUrl}/${entradaId}/itens/${itemId}`,
      request
    );
  }

  removerItem(
    entradaId: string,
    itemId: string
  ): Observable<EntradaCompraDetalhe> {
    return this.http.delete<EntradaCompraDetalhe>(
      `${this.apiUrl}/${entradaId}/itens/${itemId}`
    );
  }

  importar(
    request: ImportarEntradaCompraRequest
  ): Observable<EntradaCompraImportacaoResultado> {

    const formData = new FormData();

    formData.append(
      'arquivo',
      request.arquivo
    );

    formData.append(
      'fornecedorId',
      request.fornecedorId
    );

    formData.append(
      'numeroDocumento',
      request.numeroDocumento
    );

    formData.append(
      'dataEntrada',
      request.dataEntrada
    );

    /*
     * O backend aceita valores monetários como texto.
     * Usamos ponto decimal de forma determinística.
     */
    formData.append(
      'valorFrete',
      request.valorFrete.toFixed(2)
    );

    formData.append(
      'valorDesconto',
      request.valorDesconto.toFixed(2)
    );

    formData.append(
      'outrasDespesas',
      request.outrasDespesas.toFixed(2)
    );

    if (request.observacao) {
      formData.append(
        'observacao',
        request.observacao
      );
    }

    return this.http.post<EntradaCompraImportacaoResultado>(
      `${this.apiUrl}/importar`,
      formData
    );
  }

  confirmar(
    entradaId: string
  ): Observable<EntradaCompraDetalhe> {
    return this.http.post<EntradaCompraDetalhe>(
      `${this.apiUrl}/${entradaId}/confirmar`,
      {}
    );
  }
}
