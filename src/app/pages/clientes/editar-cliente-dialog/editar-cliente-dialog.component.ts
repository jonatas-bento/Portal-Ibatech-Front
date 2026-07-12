import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ClienteService } from '../../../services/cliente.service';
import { ToastService } from '../../../services/toast.service';
import { ClienteResumo } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-editar-cliente-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './editar-cliente-dialog.component.html',
  styleUrls: ['./editar-cliente-dialog.component.css']
})
export class EditarClienteDialogComponent implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EditarClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cliente: ClienteResumo }
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cpfCnpj: ['', [Validators.pattern('^(\\d{11}|\\d{14})$')]],
      telefone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      endereco: ['', [Validators.maxLength(300)]],
      observacao: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.clienteService.obterPorId(this.data.cliente.id)
      .subscribe({
        next: (cliente) => {
          this.form.patchValue(cliente);
        },
        error: () => {
          this.toastService.error('Não foi possível carregar os dados do cliente.');
          this.dialogRef.close();
        }
      });
  }

  atualizar(): void {
    if (this.form.invalid) return;

    this.clienteService.atualizar(this.data.cliente.id, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.toastService.success('Cliente atualizado com sucesso.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          if (err.status === 400) {
            this.toastService.error('Verifique os dados informados.');
          } else if (err.status === 404) {
            this.toastService.error('Cliente não encontrado.');
          } else if (err.status === 409) {
            this.toastService.error('Já existe um cliente cadastrado com este CPF/CNPJ.');
          } else {
            this.toastService.error('Não foi possível atualizar o cliente.');
          }
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
