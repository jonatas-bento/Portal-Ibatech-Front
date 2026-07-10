// src/app/core/guards/role.guard.ts
import { inject }                         from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService }                    from '../../services/auth.service';
import { RoleUsuario } from '../models/usuario.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: RoleUsuario[] = route.data['roles'] ?? [];
  const userRole = auth.currentRole();

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
    return true;
  }

  // Redireciona para dashboard sem mensagem agressiva
  return router.createUrlTree(['/dashboard']);
};