// src/app/core/models/projeto.models.ts

// Espelha Ibatech.Domain.Enums.StatusProjeto
export type StatusProjeto =
  | 'Recebido'
  | 'EmAnalise'
  | 'PropostaEnviada'
  | 'Aprovado'
  | 'Cancelado';

// Espelha Ibatech.Services.DTOs.Projeto.ProjetoResponseDto
export interface ProjetoResponse {
  id:                 string;
  nomeEmpresa:        string;
  nomeContato:        string;
  emailContato:       string;
  descricaoDores:     string;
  infraAtual:         string;
  utilizaNuvem:       boolean;
  provedorNuvem?:     string;
  volumetriaUsuarios: number;
  observacoesExtra?:  string;
  notaAnalista?:      string;
  status:             StatusProjeto;
  statusLabel:        string;
  dataProposta?:      string;
  dataAprovacao?:     string;
  criadoEm:           string;
  nomeUsuario?:       string;
}

// Espelha Ibatech.Services.DTOs.Projeto.ProjetoCreateDto
export interface ProjetoCreateRequest {
  nomeEmpresa:        string;
  nomeContato:        string;
  emailContato:       string;
  descricaoDores:     string;
  infraAtual:         string;
  utilizaNuvem:       boolean;
  provedorNuvem?:     string;
  volumetriaUsuarios: number;
  observacoesExtra?:  string;
}

// Espelha Ibatech.Services.DTOs.Projeto.AtualizarStatusDto
export interface AtualizarStatusRequest {
  novoStatus:    StatusProjeto;
  notaAnalista?: string;
}

// Mapa de transições válidas (replica a máquina de estados do Domain)
export const TRANSICOES_VALIDAS: Record<StatusProjeto, StatusProjeto[]> = {
  Recebido:        ['EmAnalise', 'Cancelado'],
  EmAnalise:       ['PropostaEnviada', 'Cancelado'],
  PropostaEnviada: ['Aprovado', 'Cancelado'],
  Aprovado:        [],
  Cancelado:       [],
};

export const STATUS_LABELS: Record<StatusProjeto, string> = {
  Recebido:        'Recebido',
  EmAnalise:       'Em Análise',
  PropostaEnviada: 'Proposta Enviada',
  Aprovado:        'Aprovado',
  Cancelado:       'Cancelado',
};

export const STATUS_BADGE_CLASS: Record<StatusProjeto, string> = {
  Recebido:        'badge--recebido',
  EmAnalise:       'badge--em-analise',
  PropostaEnviada: 'badge--proposta-enviada',
  Aprovado:        'badge--aprovado',
  Cancelado:       'badge--cancelado',
};