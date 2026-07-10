// src/app/core/models/produto.models.ts
export type TipoProduto =
  | 'Computador'
  | 'Peca'
  | 'AcessorioMovel'
  | 'Periferico';

export type TipoMovimentacao = 'Entrada' | 'Saida' | 'Ajuste';

export interface ProdutoResponse {
  id:               string;
  nome:             string;
  descricao?:       string;
  codigoSku?:       string;
  tipo:             TipoProduto;
  tipoLabel:        string;
  precoCompra:      number;
  precoVenda:       number;
  marca?:           string;
  modelo?:          string;
  quantidadeAtual:  number;
  quantidadeMinima: number;
  alertaReposicao:  boolean;
  ativo:            boolean;
}

export interface ProdutoCreateRequest {
  nome:              string;
  tipo:              TipoProduto;
  precoCompra:       number;
  precoVenda:        number;
  quantidadeInicial: number;
  quantidadeMinima?: number;
  descricao?:        string;
  codigoSku?:        string;
  marca?:            string;
  modelo?:           string;
}

export interface ProdutoImportacaoErro {
  linha: number;
  campo: string;
  valor: string | null;
  mensagem: string;
}

export interface ProdutoImportacaoResultado {
  sucesso: boolean;
  nomeArquivo: string;
  totalLinhas: number;
  linhasValidas: number;
  produtosImportados: number;
  linhasComErro: number;
  erros: ProdutoImportacaoErro[];
}
