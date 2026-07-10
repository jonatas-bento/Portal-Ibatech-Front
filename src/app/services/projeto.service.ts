// src/app/services/projeto.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient }                 from '@angular/common/http';
import { Observable, tap }            from 'rxjs';
import { environment }                from '../../environments/environment';
import {
  ProjetoResponse,
  ProjetoCreateRequest,
  AtualizarStatusRequest
} from './../core/models/projeto.model';

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/projetos`;

  // Cache local reativo
  readonly projetos = signal<ProjetoResponse[]>([]);

  listar(): Observable<ProjetoResponse[]> {
    return this.http.get<ProjetoResponse[]>(this.base).pipe(
      tap(data => this.projetos.set(data))
    );
  }

  listarMeus(): Observable<ProjetoResponse[]> {
    return this.http.get<ProjetoResponse[]>(`${this.base}/meus`).pipe(
      tap(data => this.projetos.set(data))
    );
  }

  obterPorId(id: string): Observable<ProjetoResponse> {
    return this.http.get<ProjetoResponse>(`${this.base}/${id}`);
  }

  criar(dto: ProjetoCreateRequest): Observable<ProjetoResponse> {
    return this.http.post<ProjetoResponse>(this.base, dto).pipe(
      tap(novo =>
        this.projetos.update(lista => [novo, ...lista])
      )
    );
  }

  atualizarStatus(
    id: string,
    dto: AtualizarStatusRequest
  ): Observable<ProjetoResponse> {
    return this.http
      .patch<ProjetoResponse>(`${this.base}/${id}/status`, dto)
      .pipe(
        tap(atualizado =>
          this.projetos.update(lista =>
            lista.map(p => (p.id === id ? atualizado : p))
          )
        )
      );
  }
}