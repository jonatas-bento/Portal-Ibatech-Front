import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstoqueService } from 'src/app/services/estoque.service';
import { ToastService } from 'src/app/services/toast.service';
import { RegistrarMovimentacaoRequest } from 'src/app/core/models/produto.model';

@Component({
  selector: 'app-movimentar-estoque',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './movimentar-estoque.component.html',
  styleUrls: ['./movimentar-estoque.component.scss']
})
export class MovimentarEstoqueComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly estoqueService = inject(EstoqueService);
  private readonly toastService = inject(ToastService);

  form!: FormGroup;
  produtoId: string | null = null;
  readonly salvando = signal<boolean>(false);
  produto: any = null;

  ngOnInit(): void {
    this.produtoId = this.route.snapshot.paramMap.get('id');
    this.produto = history.state?.produto;

    this.form = this.fb.group({
      tipo: ['Entrada', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]]
    });
  }

  salvar(): void {
    if (this.form.invalid || this.salvando() || !this.produtoId) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const request: RegistrarMovimentacaoRequest = this.form.value;

    this.estoqueService.movimentarProduto(this.produtoId, request).subscribe({
      next: () => {
        this.toastService.success(`${request.tipo} de estoque registrada com sucesso.`);
        this.router.navigate(['/dashboard/estoque']);
      },
      error: () => {
        this.salvando.set(false);
      },
      complete: () => {
        this.salvando.set(false);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/estoque']);
  }
}
