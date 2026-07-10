// src/app/core/models/usuario.models.ts
export type RoleUsuario = 'Admin' | 'Funcionario' | 'Cliente';

export interface UsuarioResponse {
  id:           string;
  nomeCompleto: string;
  email:        string;
  telefone?:    string;
  cpf?:         string;
  role:         RoleUsuario;
  ativo:        boolean;
  criadoEm:     string;
}

export interface UsuarioCreateRequest {
  nomeCompleto: string;
  email:        string;
  senha:        string;
  role:         RoleUsuario;
  telefone?:    string;
  cpf?:         string;
}