export type StatusEntradaCompra =
  | 'Rascunho'
  | 'Confirmada'
  | 'Cancelada';

export interface EntradaCompraItem {
  id: string;
  produtoId: string;

  codigoSku?: string | null;
  codigoFornecedor?: string | null;

  nomeProduto: string;

  quantidade: number;
  precoUnitarioCompra: number;

  valorTotalProduto: number;

  valorFreteRateado: number;
  valorDescontoRateado: number;
  valorOutrasDespesasRateado: number;

  custoEfetivoUnitario: number;
}

export interface EntradaCompraResumo {
  id: string;

  fornecedorId: string;
  fornecedorNome: string;

  numeroDocumento: string;
  dataEntrada: string;

  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  outrasDespesas: number;
  valorTotal: number;

  status: StatusEntradaCompra;

  dataConfirmacao?: string | null;
}

export interface EntradaCompraDetalhe {
  id: string;

  fornecedorId: string;
  fornecedorNome: string;

  numeroDocumento: string;
  dataEntrada: string;

  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  outrasDespesas: number;
  valorTotal: number;

  observacao?: string | null;

  usuarioId: string;

  status: StatusEntradaCompra;
  dataConfirmacao?: string | null;

  itens: EntradaCompraItem[];
}

export interface CriarEntradaCompraRequest {
  fornecedorId: string;
  numeroDocumento: string;
  dataEntrada: string;

  valorFrete: number;
  valorDesconto: number;
  outrasDespesas: number;

  observacao?: string | null;
}

export interface AtualizarEntradaCompraRequest {
  numeroDocumento: string;
  dataEntrada: string;

  valorFrete: number;
  valorDesconto: number;
  outrasDespesas: number;

  observacao?: string | null;
}

export interface AdicionarEntradaCompraItemRequest {
  produtoId: string;
  quantidade: number;
  precoUnitarioCompra: number;
}

export interface AtualizarEntradaCompraItemRequest {
  quantidade: number;
  precoUnitarioCompra: number;
}

export interface ImportarEntradaCompraRequest {
  arquivo: File;

  fornecedorId: string;
  numeroDocumento: string;
  dataEntrada: string;

  valorFrete: number;
  valorDesconto: number;
  outrasDespesas: number;

  observacao?: string | null;
}

export interface EntradaCompraImportacaoResultado {
  sucesso: boolean;

  nomeArquivo: string;
  totalLinhas: number;
  produtosCriados: number;

  entradaCompraId: string;

  entrada: EntradaCompraDetalhe;

  erros: unknown[];
}
