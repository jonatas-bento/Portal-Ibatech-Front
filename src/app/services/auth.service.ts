// src/app/services/auth.service.ts
import {
  Injectable,
  signal,
  computed,
  inject,
} from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Router }             from '@angular/router';
import { Observable, tap }    from 'rxjs';
import { environment }        from '../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  JwtPayload,
} from '../core/models/auth.models';
import { RoleUsuario } from '../core/models/usuario.model';

const TOKEN_KEY = 'ib_token';
const ROLE_KEY  = 'ib_role';
const NAME_KEY  = 'ib_name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  // ── Estado reativo via Signals ──────────────────────────────────────
  private readonly _token  = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  private readonly _role   = signal<RoleUsuario | null>(
    localStorage.getItem(ROLE_KEY) as RoleUsuario | null
  );
  private readonly _nome   = signal<string | null>(
    localStorage.getItem(NAME_KEY)
  );

  // ── Computeds públicos (somente leitura) ────────────────────────────
  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    return !this.tokenExpirado(token);
  });

  readonly currentRole  = computed(() => this._role());
  readonly currentNome  = computed(() => this._nome());
  readonly currentToken = computed(() => this._token());

  readonly isAdmin       = computed(() => this._role() === 'Admin');
  readonly isFuncionario = computed(() =>
    this._role() === 'Admin' || this._role() === 'Funcionario');
  readonly isCliente     = computed(() => this._role() === 'Cliente');

  // ── Métodos públicos ────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, payload)
      .pipe(
        tap(res => this.persistirSessao(res))
      );
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getToken(): string | null {
    return this._token();
  }

  // ── Utilidades internas ─────────────────────────────────────────────
  private persistirSessao(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY,  res.role);
    localStorage.setItem(NAME_KEY,  res.nome);
    this._token.set(res.token);
    this._role.set(res.role);
    this._nome.set(res.nome);
  }

  private limparSessao(): void {
    [TOKEN_KEY, ROLE_KEY, NAME_KEY].forEach(k =>
      localStorage.removeItem(k)
    );
    this._token.set(null);
    this._role.set(null);
    this._nome.set(null);
  }

  // Decodifica o payload JWT sem biblioteca externa
  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      ) as JwtPayload;
      // exp é Unix timestamp em segundos
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true; // token malformado = expirado
    }
  }
}