// src/app/core/interceptors/error.interceptor.ts
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject }          from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router }          from '@angular/router';
import { AuthService }     from '../../services/auth.service';
import { ToastService }    from '../../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router  = inject(Router);
  const auth    = inject(AuthService);
  const toast   = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          auth.logout(); // limpa sessão e redireciona
          break;

        case 403:
          toast.error('Acesso negado para esta operação.');
          router.navigate(['/dashboard']);
          break;

        case 422:
        case 400: {
          // Erros de validação do .NET — extrai mensagens do ProblemDetails
          const detail = err.error?.detail ?? err.error?.title ?? 'Dados inválidos.';
          toast.error(detail);
          break;
        }

        case 500:
          toast.error('Erro interno no servidor. Tente novamente.');
          break;

        default:
          if (!navigator.onLine) {
            toast.error('Sem conexão com a internet.');
          }
      }

      return throwError(() => err);
    })
  );
};