import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { FinanceiroService } from '../../../services/financeiro.service';
import {
  FinanceiroFiltro,
  ResumoFinanceiroDetalhado,
  TransacaoFinanceiraResumo,
  TipoTransacao
} from '../../../core/models/financeiro.model';
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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule,
    RouterLink
  ],
  templateUrl: './painel-financeiro.component.html',
  styleUrls: ['./painel-financeiro.component.css']
})
export class PainelFinanceiroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly auth = inject(AuthService);

  readonly podeAbrirVenda = this.auth.possuiRole('Admin');

  readonly periodoForm = this.fb.nonNullable.group({
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    termo: [''],
    tipo: [null as TipoTransacao | null],
    categoria: [''],
    liquidada: [null as boolean | null],
    formaPagamento: [null as FormaPagamento | null]
  });

  resumo: ResumoFinanceiroDetalhado | null = null;
  transacoes: TransacaoFinanceiraResumo[] = [];

  paginaAtual = 1;
  tamanhoPagina = 20;
  totalItens = 0;
  totalPaginas = 0;

  carregando = false;
  erroCarregamento = false;

  carregandoTransacoes = false;
  erroTransacoes = false;

  tiposTransacao: TipoTransacao[] = ['Receita', 'Despesa'];
  formasPagamento: FormaPagamento[] = ['Dinheiro', 'Pix', 'CartaoDebito', 'CartaoCredito'];

  ngOnInit(): void {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.periodoForm.patchValue({
      dataInicio: this.formatarDataInput(primeiroDiaMes),
      dataFim: this.formatarDataInput(hoje)
    });

    this.carregarResumo();
    this.carregarTransacoes();
  }

  carregarResumo(): void {
    if (this.carregando) {
      return;
    }

    if (this.periodoForm.invalid) {
      return;
    }

    this.carregando = true;
    this.erroCarregamento = false;

    this.financeiroService.obterResumo(this.montarFiltro(false))
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

  carregarTransacoes(): void {
    if (this.carregandoTransacoes || this.periodoForm.invalid) {
      return;
    }

    this.carregandoTransacoes = true;
    this.erroTransacoes = false;

    this.financeiroService.listarTransacoes(this.montarFiltro(true))
      .pipe(finalize(() => this.carregandoTransacoes = false))
      .subscribe({
        next: (resultado) => {
          this.transacoes = resultado.itens;
          this.paginaAtual = resultado.pagina;
          this.tamanhoPagina = resultado.tamanhoPagina;
          this.totalItens = resultado.totalItens;
          this.totalPaginas = resultado.totalPaginas;
        },
        error: () => {
          this.erroTransacoes = true;
          this.transacoes = [];
        }
      });
  }

  private montarFiltro(incluirPaginacao: boolean): FinanceiroFiltro {
    const raw = this.periodoForm.getRawValue();
    const filtro: FinanceiroFiltro = {
      dataInicio: FinanceiroService.converterDataInicio(raw.dataInicio),
      dataFim: FinanceiroService.converterDataFimExclusiva(raw.dataFim),
      termo: raw.termo?.trim() || undefined,
      tipo: raw.tipo || undefined,
      categoria: raw.categoria?.trim() || undefined,
      liquidada: raw.liquidada === null ? undefined : raw.liquidada,
      formaPagamento: raw.formaPagamento || undefined
    };

    if (incluirPaginacao) {
      filtro.pagina = this.paginaAtual;
      filtro.tamanhoPagina = this.tamanhoPagina;
    }

    return filtro;
  }

  aoMudarPagina(event: PageEvent): void {
    this.paginaAtual = event.pageIndex + 1;
    this.tamanhoPagina = event.pageSize;
    this.carregarTransacoes();
  }

  atualizar(): void {
    if (this.periodoForm.invalid) {
      return;
    }
    this.paginaAtual = 1;
    this.carregarResumo();
    this.carregarTransacoes();
  }

  limparFiltros(): void {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.periodoForm.patchValue({
      dataInicio: this.formatarDataInput(primeiroDiaMes),
      dataFim: this.formatarDataInput(hoje),
      termo: '',
      tipo: null,
      categoria: '',
      liquidada: null,
      formaPagamento: null
    });

    this.paginaAtual = 1;
    this.carregarResumo();
    this.carregarTransacoes();
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
