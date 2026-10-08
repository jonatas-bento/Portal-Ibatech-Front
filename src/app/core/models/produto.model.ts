// src/app/core/models/produto.model.ts

export type TipoProduto =
  | 'Computador'
  | 'Peca'
  | 'AcessorioMovel'
  | 'Periferico';

export type TipoMovimentacaoEstoque =
  | 'Entrada'
  | 'Saida';

export interface RegistrarMovimentacaoRequest {
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  motivo?: string | null;
}

export interface ProdutoResponse {
  id: string;

  nome: string;
  descricao?: string | null;

  codigoSku?: string | null;
  codigoFornecedor?: string | null;
  codigoBarras?: string | null;

  ncm?: string | null;
  unidadeComercial: string;

  tipo: TipoProduto;
  tipoLabel: string;

  precoCompra: number;
  precoVenda: number;

  marca?: string | null;
  modelo?: string | null;

  quantidadeAtual: number;
  quantidadeMinima: number;

  alertaReposicao: boolean;
  ativo: boolean;
}

export interface ProdutoCreateRequest {
  nome: string;
  tipo: TipoProduto;

  precoCompra: number;
  precoVenda: number;

  quantidadeInicial: number;
  quantidadeMinima: number;

  descricao?: string | null;

  codigoSku?: string | null;
  codigoFornecedor?: string | null;
  codigoBarras?: string | null;

  ncm?: string | null;
  unidadeComercial?: string;

  marca?: string | null;
  modelo?: string | null;
}

export interface ProdutoUpdateRequest {
  nome: string;
  tipo: TipoProduto;

  precoVenda: number;
  quantidadeMinima: number;

  descricao?: string | null;

  codigoSku?: string | null;
  codigoFornecedor?: string | null;
  codigoBarras?: string | null;

  ncm?: string | null;
  unidadeComercial: string;

  marca?: string | null;
  modelo?: string | null;
}

export interface ProdutoImportacaoErro {
  linha: number;
  codigoSku?: string | null;
  nome?: string | null;
  mensagem: string;
}

export interface ProdutoImportacaoResultado {
  sucesso: boolean;
  totalLinhas: number;
  linhasValidas: number;
  linhasComErro: number;
  produtosImportados: number;
  erros: ProdutoImportacaoErro[];
}
