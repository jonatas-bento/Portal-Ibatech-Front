// src/app/core/models/usuario.model.ts
export type RoleUsuario =
  | 'Admin'
  | 'Funcionario'
  | 'Cliente'
  | 'Vendedor'
  | 'Estoque'
  | 'Financeiro';

export interface UsuarioResumo {
  id: string;
  nomeCompleto: string;
  email: string;
  role: RoleUsuario;
  ativo: boolean;
}

export interface UsuarioDetalhe extends UsuarioResumo {
  telefone?: string;
  cpf?: string;
  criadoEm: string;
}

export interface CriarUsuarioRequest {
  nomeCompleto: string;
  email: string;
  senha: string;
  role: RoleUsuario;
  telefone?: string;
  cpf?: string;
}

export interface AtualizarUsuarioRequest {
  nomeCompleto: string;
  email: string;
  role: RoleUsuario;
  telefone?: string;
  cpf?: string;
}

export interface AlterarStatusUsuarioRequest {
  ativo: boolean;
}

export interface RedefinirSenhaUsuarioRequest {
  novaSenha: string;
}

export interface AlterarMinhaSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface UsuarioFiltros {
  nome?: string;
  email?: string;
  role?: RoleUsuario;
  ativo?: boolean;
}
