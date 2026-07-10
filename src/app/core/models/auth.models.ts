import { RoleUsuario } from './usuario.model';
// src/app/core/models/auth.models.ts

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token:    string;
  nome:     string;
  email:    string;
  role:     RoleUsuario;
  expiraEm: string; // ISO 8601 — DateTime.UtcNow no backend
}

// Payload decodificado do JWT (claims padrão .NET)
export interface JwtPayload {
  sub:                        string;  // Guid do usuário
  email:                      string;
  name:                       string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': RoleUsuario;
  exp:                        number;  // Unix timestamp
  iss:                        string;
  aud:                        string;
}