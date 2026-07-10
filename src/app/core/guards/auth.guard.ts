// src/app/core/guards/auth.guard.ts
import { inject }                    from '@angular/core';
import { CanActivateFn, Router }     from '@angular/router';
import { AuthService }               from '../../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Preserva a URL tentada para redirect pós-login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};