export interface FornecedorResponse {
  id: string;

  nome: string;
  nomeFantasia?: string | null;
  documento?: string | null;

  email?: string | null;
  telefone?: string | null;
  observacao?: string | null;

  ativo: boolean;
}

export interface CriarFornecedorRequest {
  nome: string;
  nomeFantasia?: string | null;
  documento?: string | null;

  email?: string | null;
  telefone?: string | null;
  observacao?: string | null;
}

export interface AtualizarFornecedorRequest {
  nome: string;
  nomeFantasia?: string | null;
  documento?: string | null;

  email?: string | null;
  telefone?: string | null;
  observacao?: string | null;
}
