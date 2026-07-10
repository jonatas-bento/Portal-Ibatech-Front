// src/app/pages/login/login.component.ts
import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterModule }       from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService }        from '../../services/auth.service';

@Component({
  selector:        'app-login',
  standalone:       true,
  imports:         [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl:     './login.component.html',
  styleUrls:       ['./login.component.scss'],
  changeDetection:  ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);

  readonly carregando  = signal(false);
  readonly erro        = signal<string | null>(null);
  readonly senhaVisivel = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleSenha(): void {
    this.senhaVisivel.update(v => !v);
  }

  // getter de ano no component — adicione abaixo de senhaVisivel:
readonly ano = new Date().getFullYear();

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    const { email, senha } = this.form.value;

    this.auth.login({ email: email!, senha: senha! }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(
          err.status === 401
            ? 'E-mail ou senha incorretos.'
            : 'Erro ao conectar. Tente novamente.'
        );
      },
    });
  }

  temErro(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && (c.dirty || c.touched));
  }
}