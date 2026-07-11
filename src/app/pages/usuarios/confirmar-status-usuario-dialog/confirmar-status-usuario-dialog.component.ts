import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-confirmar-status-usuario-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './confirmar-status-usuario-dialog.component.html',
  styleUrls: ['./confirmar-status-usuario-dialog.component.css']
})
export class ConfirmarStatusUsuarioDialogComponent {
  private readonly svc = inject(UsuarioService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<ConfirmarStatusUsuarioDialogComponent>);
  readonly data = inject<{ id: string; nomeCompleto: string; ativo: boolean }>(MAT_DIALOG_DATA);

  readonly processando = signal(false);

  confirmar(): void {
    this.processando.set(true);
    this.svc.alterarStatus(this.data.id, { ativo: !this.data.ativo }).subscribe({
      next: () => {
        this.toast.success(`Usuário ${this.data.ativo ? 'desativado' : 'ativado'} com sucesso.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.processando.set(false);
        if (err.status === 400 && err.error?.message?.includes('própria conta')) {
          this.toast.error('Você não pode desativar a própria conta.');
        } else if (err.status === 400 && err.error?.message?.includes('último administrador')) {
          this.toast.error('Não é possível desativar o último administrador ativo.');
        } else if (err.status === 404) {
          this.toast.error('Usuário não encontrado.');
        } else {
          this.toast.error('Não foi possível alterar o status do usuário.');
        }
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
