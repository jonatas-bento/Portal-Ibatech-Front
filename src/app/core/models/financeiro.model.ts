// src/app/core/models/financeiro.model.ts
import { FormaPagamento } from './venda.model';

export type TipoTransacao =
  | 'Receita'
  | 'Despesa';

export interface FinanceiroFiltro {
  dataInicio: string;
  dataFim: string;
  tipo?: TipoTransacao;
  categoria?: string;
  liquidada?: boolean;
  formaPagamento?: FormaPagamento;
  vendaId?: string;
  termo?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface ResumoFormaPagamento {
  formaPagamento: FormaPagamento;
  totalReceitas: number;
  totalEstornos: number;
  totalLiquido: number;
  quantidadeVendas: number;
  quantidadeEstornos: number;
}

export interface ResumoFinanceiroDetalhado {
  totalReceitas: number;
  totalDespesas: number;
  totalEstornos: number;
  totalLiquido: number;
  quantidadeVendas: number;
  quantidadeEstornos: number;
  ticketMedio: number;
  formasPagamento: ResumoFormaPagamento[];
}

export interface TransacaoFinanceiraResumo {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: string;
  dataVencimento: string;
  dataPagamento?: string | null;
  liquidada: boolean;
  vendaId?: string | null;
  numeroVenda?: string | null;
  formaPagamento?: FormaPagamento | null;
  usuarioId: string;
  usuarioNome: string;
  criadoEm: string;
}

export interface ResultadoPaginadoFinanceiro<T> {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}
