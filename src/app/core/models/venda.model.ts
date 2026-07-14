export interface VendaResumo {
  id: string;
  numero: string;
  vendedorId: string;
  vendedorNome: string;
  status: string;
  dataVenda: string;
  valorBruto: number;
  desconto: number;
  valorTotal: number;
  quantidadeItens: number;
}

export interface VendaItem {
  id: string;
  produtoId: string;
  codigoSku: string;
  nomeProduto: string;
  descricaoProduto?: string | null;
  quantidade: number;
  precoUnitario: number;
  valorBruto: number;
  desconto: number;
  valorTotal: number;
}

export interface VendaDetalhe {
  id: string;
  numero: string;
  clienteId?: string | null;
  clienteNome?: string | null;
  clienteCpfCnpj?: string | null;
  vendedorId: string;
  vendedorNome: string;
  status: string;
  dataVenda: string;
  valorBruto: number;
  desconto: number;
  valorTotal: number;
  observacao?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  itens: VendaItem[];
}

export interface VendaFiltro {
  numero?: string;
  clienteId?: string;
  vendedorId?: string;
  status?: string;
  dataInicial?: string;
  dataFinal?: string;
}

export interface CriarVendaRequest {
  clienteId?: string | null;
  observacao?: string | null;
}

export interface AtualizarVendaRequest {
  clienteId?: string | null;
  observacao?: string | null;
}

export interface AdicionarVendaItemRequest {
  produtoId: string;
  quantidade: number;
  desconto: number;
}

export interface AtualizarVendaItemRequest {
  quantidade: number;
  desconto: number;
}
