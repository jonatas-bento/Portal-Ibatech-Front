import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { ROLE_OPTIONS } from '../../../core/utils/role.helper';

@Component({
  selector: 'app-novo-usuario-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './novo-usuario-dialog.component.html',
  styleUrls: ['./novo-usuario-dialog.component.css']
})
export class NovoUsuarioDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(UsuarioService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<NovoUsuarioDialogComponent>);

  readonly form: FormGroup;
  readonly roleOptions = ROLE_OPTIONS;
  readonly enviando = signal(false);

  constructor() {
    this.form = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      cpf: [''],
      role: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.svc.criar(this.form.value).subscribe({
      next: () => {
        this.toast.success('Usuário cadastrado com sucesso.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.enviando.set(false);
        if (err.status === 409) {
          this.toast.error('Este e-mail já está cadastrado.');
        } else {
          this.toast.error('Não foi possível cadastrar o usuário.');
        }
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
