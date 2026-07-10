// src/app/core/guards/no-auth.guard.ts
// Bloqueia acesso a /login se já estiver autenticado
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }           from '../../services/auth.service';

export const noAuthGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? router.createUrlTree(['/dashboard'])
    : true;
};