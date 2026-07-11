import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { ROLE_OPTIONS } from '../../../core/utils/role.helper';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './editar-usuario-dialog.component.html',
  styleUrls: ['./editar-usuario-dialog.component.css']
})
export class EditarUsuarioDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(UsuarioService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<EditarUsuarioDialogComponent>);
  private readonly data = inject<{ id: string }>(MAT_DIALOG_DATA);

  readonly form: FormGroup;
  readonly roleOptions = ROLE_OPTIONS;
  readonly carregando = signal(true);
  readonly enviando = signal(false);

  constructor() {
    this.form = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      cpf: [''],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.svc.obterPorId(this.data.id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          telefone: usuario.telefone,
          cpf: usuario.cpf,
          role: usuario.role
        });
        this.carregando.set(false);
      },
      error: () => {
        this.toast.error('Não foi possível carregar os dados do usuário.');
        this.dialogRef.close();
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.svc.atualizar(this.data.id, this.form.value).subscribe({
      next: () => {
        this.toast.success('Usuário atualizado com sucesso.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.enviando.set(false);
        if (err.status === 409) {
          this.toast.error('Este e-mail já está cadastrado.');
        } else if (err.status === 404) {
          this.toast.error('Usuário não encontrado.');
        } else if (err.status === 400 && err.error?.message?.includes('último administrador')) {
          this.toast.error('Não é possível alterar o perfil do último administrador ativo.');
        } else {
          this.toast.error('Não foi possível atualizar o usuário.');
        }
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
