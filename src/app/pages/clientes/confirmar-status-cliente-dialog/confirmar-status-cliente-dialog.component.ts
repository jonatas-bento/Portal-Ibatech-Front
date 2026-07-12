import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ClienteService } from '../../../services/cliente.service';
import { ToastService } from '../../../services/toast.service';
import { ClienteResumo } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-confirmar-status-cliente-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirmar-status-cliente-dialog.component.html',
  styleUrls: ['./confirmar-status-cliente-dialog.component.css']
})
export class ConfirmarStatusClienteDialogComponent {
  loading = false;

  constructor(
    private clienteService: ClienteService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<ConfirmarStatusClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cliente: ClienteResumo }
  ) {}

  confirmar(): void {
    this.loading = true;
    const novoStatus = !this.data.cliente.ativo;
    this.clienteService.alterarStatus(this.data.cliente.id, { ativo: novoStatus }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(`Cliente ${novoStatus ? 'ativado' : 'desativado'} com sucesso.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.toastService.error('Cliente não encontrado.');
        } else {
          this.toastService.error('Não foi possível alterar o status do cliente.');
        }
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
