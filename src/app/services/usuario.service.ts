// src/app/services/usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  UsuarioResumo,
  UsuarioDetalhe,
  CriarUsuarioRequest,
  AtualizarUsuarioRequest,
  AlterarStatusUsuarioRequest,
  RedefinirSenhaUsuarioRequest,
  AlterarMinhaSenhaRequest,
  UsuarioFiltros,
} from '../core/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  listar(filtros?: UsuarioFiltros): Observable<UsuarioResumo[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.nome) params = params.set('nome', filtros.nome);
      if (filtros.email) params = params.set('email', filtros.email);
      if (filtros.role) params = params.set('role', filtros.role);
      if (filtros.ativo !== undefined) params = params.set('ativo', filtros.ativo.toString());
    }
    return this.http.get<UsuarioResumo[]>(this.base, { params });
  }

  obterPorId(id: string): Observable<UsuarioDetalhe> {
    return this.http.get<UsuarioDetalhe>(`${this.base}/${id}`);
  }

  criar(request: CriarUsuarioRequest): Observable<void> {
    return this.http.post<void>(this.base, request);
  }

  atualizar(id: string, request: AtualizarUsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, request);
  }

  alterarStatus(id: string, request: AlterarStatusUsuarioRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, request);
  }

  redefinirSenha(id: string, request: RedefinirSenhaUsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/senha`, request);
  }

  alterarMinhaSenha(request: AlterarMinhaSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/minha-senha`, request);
  }
}
