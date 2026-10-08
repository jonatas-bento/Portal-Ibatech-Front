import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  AtualizarFornecedorRequest,
  CriarFornecedorRequest,
  FornecedorResponse
} from '../core/models/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {

  private readonly apiUrl =
    `${environment.apiUrl}/fornecedores`;

  constructor(
    private readonly http: HttpClient
  ) {}

  listar(): Observable<FornecedorResponse[]> {
    return this.http.get<FornecedorResponse[]>(
      this.apiUrl
    );
  }

  obterPorId(
    id: string
  ): Observable<FornecedorResponse> {
    return this.http.get<FornecedorResponse>(
      `${this.apiUrl}/${id}`
    );
  }

  criar(
    request: CriarFornecedorRequest
  ): Observable<FornecedorResponse> {
    return this.http.post<FornecedorResponse>(
      this.apiUrl,
      request
    );
  }

  atualizar(
    id: string,
    request: AtualizarFornecedorRequest
  ): Observable<FornecedorResponse> {
    return this.http.put<FornecedorResponse>(
      `${this.apiUrl}/${id}`,
      request
    );
  }
}
