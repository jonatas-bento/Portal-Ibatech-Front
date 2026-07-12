export interface ClienteResumo {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacao: string;
  ativo: boolean;
}

export interface ClienteDetalhe {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacao: string;
  ativo: boolean;
}

export interface CriarClienteRequest {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacao: string;
}

export interface AtualizarClienteRequest {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  observacao: string;
}

export interface AlterarStatusClienteRequest {
  ativo: boolean;
}

export interface ClienteFiltros {
  texto?: string;
  ativo?: boolean;
}
