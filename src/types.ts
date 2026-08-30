export type PieceType = 
  | 'post' 
  | 'carrossel' 
  | 'reels' 
  | 'stories' 
  | 'video' 
  | 'site' 
  | 'relatorio' 
  | 'identidade' 
  | 'outro';

export type Priority = 'urgente' | 'alta' | 'media' | 'baixa';

export type UserRole = 'designer' | 'videomaker' | 'social_media' | 'gerente';

export interface User {
  id: string;
  nome: string;
  email: string;
  cor_avatar: string;
  papel: UserRole;
  avatar_url?: string;
}

export interface Client {
  id: string;
  nome: string;
  cor_identificacao: string;
  segmento?: string;
  contato?: string;
  observacoes?: string;
}

export interface Stage {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
  descricao?: string;
  e_etapa_final?: boolean;
}

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  responsavel_id?: string;
}

export interface Comment {
  id: string;
  autor_id: string;
  texto: string;
  criado_em: string; // ISO string
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  autor_id: string;
  acao: 'criado' | 'movido' | 'editado' | 'comentado' | 'checklist' | 'concluido';
  detalhe: string;
}

export interface DemandBriefing {
  objetivo?: string;
  formato?: string;
  copy_sugestao?: string;
  referencias?: string;
  link_drive?: string;
}

export interface Demand {
  id: string;
  titulo: string;
  descricao: string;
  briefing?: DemandBriefing;
  cliente_id: string;
  tipo: PieceType;
  prioridade: Priority;
  responsavel_id: string;
  etapa_id: string;
  prazo: string; // YYYY-MM-DD
  hora_agendamento?: string;
  checklist: ChecklistItem[];
  comentarios: Comment[];
  historico: ActivityLog[];
  tags: string[];
  criado_em: string;
  atualizado_em: string;
}

export interface FilterState {
  search: string;
  clienteId: string;
  responsavelId: string;
  prioridade: string;
  tipo: string;
  prazoStatus: 'todos' | 'atrasados' | 'hoje' | 'semana' | 'sem_prazo';
}

export type ViewMode = 'kanban' | 'tabela' | 'calendario' | 'equipe';

export type ThemeMode = 'dark' | 'light';
