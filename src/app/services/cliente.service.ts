import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  ClienteResumo, 
  ClienteDetalhe,
  CriarClienteRequest, 
  AtualizarClienteRequest, 
  AlterarStatusClienteRequest, 
  ClienteFiltros 
} from '../core/models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar(filtros: ClienteFiltros): Observable<ClienteResumo[]> {
    let params = new HttpParams();
    
    if (filtros.texto) {
      params = params.set('texto', filtros.texto);
    }
    
    if (filtros.ativo !== undefined && filtros.ativo !== null) {
      params = params.set('ativo', filtros.ativo.toString());
    }

    return this.http.get<ClienteResumo[]>(this.apiUrl, { params });
  }

  obterPorId(id: string): Observable<ClienteDetalhe> {
    return this.http.get<ClienteDetalhe>(`${this.apiUrl}/${id}`);
  }

  criar(request: CriarClienteRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  atualizar(id: string, request: AtualizarClienteRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  alterarStatus(id: string, request: AlterarStatusClienteRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, request);
  }
}
