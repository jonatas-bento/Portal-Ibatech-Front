// src/app/core/models/financeiro.model.ts

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transacoesAbertas: number;
}

export interface TransacaoResponse {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'Receita' | 'Despesa'; // Casando com o seu Enum do C#
  dataVencimento: string;
  categoria: string;
  liquidada: boolean;
  dataLiquidacao?: string;
  usuarioId?: string;
}

export interface TransacaoCreateRequest {
  descricao: string;
  valor: number;
  tipo: string;
  dataVencimento: string;
  categoria: string;
  usuarioId?: string;
}