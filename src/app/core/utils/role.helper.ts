// src/app/core/utils/role.helper.ts
import { RoleUsuario } from '../models/usuario.model';

export const ROLE_LABELS: Record<RoleUsuario, string> = {
  Admin: 'Administrador',
  Funcionario: 'Funcionário',
  Cliente: 'Cliente',
  Vendedor: 'Vendedor',
  Estoque: 'Estoque',
  Financeiro: 'Financeiro',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as RoleUsuario,
  label,
}));

export function getRoleLabel(role: RoleUsuario): string {
  return ROLE_LABELS[role] || role;
}
