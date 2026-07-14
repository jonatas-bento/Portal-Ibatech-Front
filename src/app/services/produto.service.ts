import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoResponse } from '../core/models/produto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/produtos`;

  listarTodos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(this.apiUrl);
  }
}
