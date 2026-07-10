import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { AuthService }       from '../../services/auth.service';

// Ajuste para bater com as URLs reais da sua API (ex: se for /api/login ou /login)
const PUBLIC_URLS = ['/login', '/refresh'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // Verifica se a URL da requisição atual pertence a algum endpoint público
  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));

  // SE NÃO HOUVER TOKEN OU FOR PÚBLICA: Deixa a requisição passar pura, sem injetar lixo
  if (!token || isPublic) {
    return next(req);
  }

  // SE HOUVER TOKEN: Injeta o cabeçalho de forma segura
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};