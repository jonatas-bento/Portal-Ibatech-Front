import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { VendaService } from '../../../services/venda.service';
import { ClienteService } from '../../../services/cliente.service';
import { VendaDetalhe, AtualizarVendaRequest } from '../../../core/models/venda.model';
import { ClienteResumo } from '../../../core/models/cliente.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-editar-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './editar-venda.component.html',
  styleUrls: ['./editar-venda.component.css']
})
export class EditarVendaComponent implements OnInit {
  venda?: VendaDetalhe;
  form: FormGroup;
  clientes: ClienteResumo[] = [];
  loading = false;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      clienteId: [null],
      observacao: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarVenda(id);
      this.carregarClientes();
    } else {
      this.toastService.error('ID da venda não informado.');
      this.router.navigate(['/dashboard/vendas']);
    }
  }

  carregarVenda(id: string): void {
    this.loading = true;
    this.vendaService.obterPorId(id).subscribe({
      next: (data) => {
        this.venda = data;
        this.form.patchValue({
          clienteId: data.clienteId,
          observacao: data.observacao
        });
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erro ao carregar venda.');
        this.router.navigate(['/dashboard/vendas']);
        this.loading = false;
      }
    });
  }

  carregarClientes(): void {
    this.clienteService.listar({}).subscribe({
      next: (data) => this.clientes = data.filter(c => c.ativo),
      error: () => this.toastService.error('Erro ao carregar clientes.')
    });
  }

  salvar(): void {
    if (this.salvando || this.form.invalid || !this.venda) {
      return;
    }

    const request: AtualizarVendaRequest = {
      clienteId: this.form.get('clienteId')?.value ?? null,
      observacao: this.form.get('observacao')?.value
    };

    this.salvando = true;

    this.vendaService.atualizar(this.venda.id, request)
      .pipe(finalize(() => this.salvando = false))
      .subscribe({
        next: (data) => {
          this.venda = data;

          this.form.patchValue({
            clienteId: data.clienteId ?? null,
            observacao: data.observacao ?? ''
          });

          this.toastService.success('Venda atualizada com sucesso.');
        },
        error: () => {
          this.toastService.error('Erro ao atualizar venda.');
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/vendas']);
  }
}
