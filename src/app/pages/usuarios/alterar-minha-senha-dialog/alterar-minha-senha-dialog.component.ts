import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alterar-minha-senha-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './alterar-minha-senha-dialog.component.html',
  styleUrls: ['./alterar-minha-senha-dialog.component.css']
})
export class AlterarMinhaSenhaDialogComponent {
  form: FormGroup;
  processando = false;
  mostrarSenha = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<AlterarMinhaSenhaDialogComponent>
  ) {
    this.form = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarNovaSenha: ['', Validators.required]
    }, { validators: this.senhasCoincidem });
  }

  senhasCoincidem(group: FormGroup) {
    const nova = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarNovaSenha')?.value;
    return nova === confirmar ? null : { senhasDiferentes: true };
  }

  toggleMostrarSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  async salvar() {
    if (this.form.invalid || this.processando) return;

    this.processando = true;
    const { senhaAtual, novaSenha } = this.form.value;

    try {
      await this.usuarioService.alterarMinhaSenha({ senhaAtual, novaSenha }).toPromise();
      this.toastService.success('Senha alterada com sucesso.');
      this.dialogRef.close(true);
    } catch (error: any) {
      this.processando = false;
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
