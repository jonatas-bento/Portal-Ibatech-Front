import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { FinanceiroService } from '../../../services/financeiro.service';
import { ResumoFinanceiroDetalhado } from '../../../core/models/financeiro.model';
import { getFormaPagamentoLabel } from '../../../core/utils/forma-pagamento.helper';
import { FormaPagamento } from '../../../core/models/venda.model';

@Component({
  selector: 'app-painel-financeiro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './painel-financeiro.component.html',
  styleUrls: ['./painel-financeiro.component.css']
})
export class PainelFinanceiroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly financeiroService = inject(FinanceiroService);

  readonly periodoForm = this.fb.nonNullable.group({
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required]
  });

  resumo: ResumoFinanceiroDetalhado | null = null;
  carregando = false;
  erroCarregamento = false;

  ngOnInit(): void {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.periodoForm.setValue({
      dataInicio: this.formatarDataInput(primeiroDiaMes),
      dataFim: this.formatarDataInput(hoje)
    });

    this.carregarResumo();
  }

  carregarResumo(): void {
    if (this.carregando) {
      return;
    }

    if (this.periodoForm.invalid) {
      return;
    }

    const { dataInicio, dataFim } = this.periodoForm.getRawValue();

    if (!dataInicio || !dataFim) {
      return;
    }

    if (dataInicio > dataFim) {
      return;
    }

    this.carregando = true;
    this.erroCarregamento = false;

    const filtro = {
      dataInicio: FinanceiroService.converterDataInicio(dataInicio),
      dataFim: FinanceiroService.converterDataFimExclusiva(dataFim)
    };

    this.financeiroService.obterResumo(filtro)
      .pipe(finalize(() => this.carregando = false))
      .subscribe({
        next: (resultado) => {
          this.resumo = resultado;
        },
        error: () => {
          this.erroCarregamento = true;
        }
      });
  }

  /**
   * Formata uma Date em string YYYY-MM-DD usando componentes locais,
   * evitando o deslocamento de fuso horário causado por toISOString().
   */
  private formatarDataInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  getFormaPagamentoLabel(forma: FormaPagamento): string {
    return getFormaPagamentoLabel(forma);
  }

  iconeFormaPagamento(forma: FormaPagamento): string {
    switch (forma) {
      case 'Dinheiro': return 'payments';
      case 'Pix': return 'qr_code_2';
      case 'CartaoDebito': return 'credit_card';
      case 'CartaoCredito': return 'credit_score';
      default: return 'payment';
    }
  }
}
