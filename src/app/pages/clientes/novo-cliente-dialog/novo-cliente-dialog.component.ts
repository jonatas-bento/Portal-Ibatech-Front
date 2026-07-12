import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClienteService } from '../../../services/cliente.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-novo-cliente-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './novo-cliente-dialog.component.html',
  styleUrls: ['./novo-cliente-dialog.component.css']
})
export class NovoClienteDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<NovoClienteDialogComponent>);
  private readonly clienteService = inject(ClienteService);
  private readonly toast = inject(ToastService);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cpfCnpj: ['', [Validators.pattern('^(\\d{11}|\\d{14})$')]],
      telefone: [''],
      email: ['', [Validators.email]],
      endereco: ['', [Validators.maxLength(300)]],
      observacao: ['', [Validators.maxLength(1000)]]
    });
  }

  cadastrar() {
    if (this.form.invalid) return;

    this.loading = true;
    const request = { ...this.form.value };
    if (request.cpfCnpj) {
      request.cpfCnpj = request.cpfCnpj.replace(/\D/g, '');
    }

    this.clienteService.criar(request).subscribe({
      next: () => {
        this.toast.success('Cliente cadastrado com sucesso.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.toast.error('Já existe um cliente cadastrado com este CPF/CNPJ.');
        } else if (err.status === 400) {
          this.toast.error('Verifique os dados informados.');
        } else {
          this.toast.error('Não foi possível cadastrar o cliente.');
        }
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
