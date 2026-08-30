import { PieceType, Priority, UserRole } from '../types';

export const PIECE_TYPE_CONFIG: Record<
  PieceType,
  { label: string; icon: string; bgLight: string; textDark: string; badgeClass: string }
> = {
  post: {
    label: 'Post Feed',
    icon: 'Image',
    bgLight: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    textDark: 'text-sky-400',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  carrossel: {
    label: 'Carrossel',
    icon: 'Layers',
    bgLight: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    textDark: 'text-indigo-400',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  reels: {
    label: 'Reels / TikTok',
    icon: 'Film',
    bgLight: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    textDark: 'text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  stories: {
    label: 'Stories (Seq.)',
    icon: 'Sparkles',
    bgLight: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    textDark: 'text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  video: {
    label: 'Vídeo Longo / YouTube',
    icon: 'Video',
    bgLight: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    textDark: 'text-purple-400',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  site: {
    label: 'Site / Landing Page',
    icon: 'Globe',
    bgLight: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    textDark: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  relatorio: {
    label: 'Relatório / Métricas',
    icon: 'BarChart3',
    bgLight: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    textDark: 'text-slate-400',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  identidade: {
    label: 'Identidade Visual',
    icon: 'Palette',
    bgLight: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    textDark: 'text-fuchsia-400',
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  },
  outro: {
    label: 'Outro Material',
    icon: 'FileText',
    bgLight: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    textDark: 'text-zinc-400',
    badgeClass: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; borderClass: string; bgClass: string; textClass: string; dotClass: string }
> = {
  urgente: {
    label: 'Urgente',
    color: '#ef4444',
    borderClass: 'border-l-4 border-l-red-500 border-red-500/30',
    bgClass: 'bg-red-500/15 text-red-300 border border-red-500/30',
    textClass: 'text-red-400 font-semibold',
    dotClass: 'bg-red-500',
  },
  alta: {
    label: 'Alta',
    color: '#f97316',
    borderClass: 'border-l-4 border-l-orange-500 border-orange-500/30',
    bgClass: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
    textClass: 'text-orange-400 font-semibold',
    dotClass: 'bg-orange-500',
  },
  media: {
    label: 'Média',
    color: '#3b82f6',
    borderClass: 'border-l-4 border-l-blue-500 border-blue-500/30',
    bgClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    textClass: 'text-blue-400',
    dotClass: 'bg-blue-500',
  },
  baixa: {
    label: 'Baixa',
    color: '#64748b',
    borderClass: 'border-l-4 border-l-slate-400 border-slate-500/30',
    bgClass: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    textClass: 'text-slate-400',
    dotClass: 'bg-slate-400',
  },
};

export const USER_ROLE_CONFIG: Record<UserRole, { label: string; badge: string }> = {
  designer: {
    label: 'Designer',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  videomaker: {
    label: 'Videomaker / Editor de Vídeo',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  social_media: {
    label: 'Social Media',
    badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  },
  gerente: {
    label: 'Gerente / Atendimento',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
};

export const VIDEO_ROUTINE_CHECKLIST = [
  'Roteiro aprovado',
  'Captação realizada',
  'Seleção de melhores takes',
  'Edição finalizada',
  'Revisão de corte (interna)',
  'Trilha/áudio ajustado',
  'Exportado em formato final',
];

export const DEFAULT_CHECKLIST_BY_TYPE: Record<PieceType, string[]> = {
  video: [
    'Roteiro aprovado',
    'Captação realizada',
    'Seleção de melhores takes',
    'Edição finalizada',
    'Revisão de corte (interna)',
    'Trilha/áudio ajustado',
    'Exportado em formato final',
  ],
  reels: [
    'Roteiro aprovado',
    'Captação realizada',
    'Seleção de melhores takes',
    'Edição finalizada',
    'Revisão de corte (interna)',
    'Trilha/áudio ajustado',
    'Exportado em formato final',
  ],
  post: [
    'Alinhamento de briefing e objetivo do post',
    'Redação da copy e seleção de hashtags estratégicas',
    'Criação do criativo visual (1080x1350 ou 1080x1080)',
    'Revisão ortográfica e de identidade visual',
    'Envio para aprovação do cliente',
    'Agendamento na plataforma (Meta Business/mLabs)',
  ],
  carrossel: [
    'Estrutura do roteiro dos slides (Capa, 3 de conteúdo, CTA final)',
    'Copy completa com gatilhos de retenção',
    'Design dos 5 slides com padrão visual da marca',
    'Ajuste de contraste e legibilidade mobile',
    'Aprovação interna e envio ao cliente',
    'Agendamento com texto na legenda',
  ],
  stories: [
    'Story 1: Contextualização e curiosidade',
    'Story 2: Conteúdo / Revelação',
    'Story 3: Enquete ou caixinha interativa',
    'Story 4: CTA para direct ou link externo',
    'Exportação 1080x1920 e agendamento',
  ],
  site: [
    'Wireframe e estrutura da página',
    'Copywriting persuasivo e seções de conversão',
    'Design UI no Figma (Desktop e Mobile)',
    'Desenvolvimento / Publicação',
    'Testes de formulários e analytics',
  ],
  relatorio: [
    'Extração de dados das plataformas (Meta, Google, TikTok)',
    'Análise dos posts de melhor e pior desempenho',
    'Cálculo de ROI / CPL de campanhas ativas',
    'Montagem do PDF executivo com gráficos',
    'Reunião ou envio de apresentação para o cliente',
  ],
  identidade: [
    'Painel de referências visuais e moodboard',
    'Propostas conceituais e tipografia',
    'Paleta de cores e aplicações de marca',
    'Manual básico de uso e fechamento de arquivos',
  ],
  outro: [
    'Alinhar briefing e referências',
    'Elaborar conteúdo / redação',
    'Execução do material no formato especificado',
    'Revisão interna e aprovação final',
  ],
};

export const DEMAND_TEMPLATES = [
  {
    id: 'tpl_post',
    name: 'Post Único para Feed',
    tipo: 'post' as PieceType,
    prioridade: 'media' as Priority,
    descricao: 'Criação de post único para Instagram/LinkedIn com foco em engajamento e branding.',
    checklist: [
      'Alinhamento de briefing e objetivo do post',
      'Redação da copy e seleção de hashtags estratégicas',
      'Criação do criativo visual (1080x1350 ou 1080x1080)',
      'Revisão ortográfica e de identidade visual',
      'Envio para aprovação do cliente',
      'Agendamento na plataforma (Meta Business/mLabs)',
    ],
  },
  {
    id: 'tpl_carrossel',
    name: 'Carrossel Educativo (5 telas)',
    tipo: 'carrossel' as PieceType,
    prioridade: 'alta' as Priority,
    descricao: 'Carrossel educativo passo a passo com gancho forte na capa e CTA claro na última tela.',
    checklist: [
      'Estrutura do roteiro dos slides (Capa, 3 de conteúdo, CTA final)',
      'Copy completa com gatilhos de retenção',
      'Design dos 5 slides com padrão visual da marca',
      'Ajuste de contraste e legibilidade mobile',
      'Aprovação interna e envio ao cliente',
      'Agendamento com texto na legenda',
    ],
  },
  {
    id: 'tpl_reels',
    name: 'Reels / TikTok (Rotina de Vídeo)',
    tipo: 'reels' as PieceType,
    prioridade: 'alta' as Priority,
    descricao: 'Produção e edição de vídeo vertical com captação, corte dinâmico, legendas e trilha.',
    checklist: [
      'Roteiro aprovado',
      'Captação realizada',
      'Seleção de melhores takes',
      'Edição finalizada',
      'Revisão de corte (interna)',
      'Trilha/áudio ajustado',
      'Exportado em formato final',
    ],
  },
  {
    id: 'tpl_video_longo',
    name: 'Vídeo Institucional / YouTube',
    tipo: 'video' as PieceType,
    prioridade: 'alta' as Priority,
    descricao: 'Vídeo longo institucional ou para YouTube com roteiro estruturado e pós-produção completa.',
    checklist: [
      'Roteiro aprovado',
      'Captação realizada',
      'Seleção de melhores takes',
      'Edição finalizada',
      'Revisão de corte (interna)',
      'Trilha/áudio ajustado',
      'Exportado em formato final',
    ],
  },
  {
    id: 'tpl_stories',
    name: 'Sequência de Stories (4 telas)',
    tipo: 'stories' as PieceType,
    prioridade: 'media' as Priority,
    descricao: 'Sequência narrativa nos stories com enquetes, caixinha de perguntas ou link.',
    checklist: [
      'Story 1: Contextualização e curiosidade',
      'Story 2: Conteúdo / Revelação',
      'Story 3: Enquete ou caixinha interativa',
      'Story 4: CTA para direct ou link externo',
      'Exportação 1080x1920 e agendamento',
    ],
  },
  {
    id: 'tpl_relatorio',
    name: 'Relatório Mensal de Resultados',
    tipo: 'relatorio' as PieceType,
    prioridade: 'alta' as Priority,
    descricao: 'Compilação de métricas de alcance, engajamento, seguidores e leads do mês com insights de melhoria.',
    checklist: [
      'Extração de dados das plataformas (Meta, Google, TikTok)',
      'Análise dos posts de melhor e pior desempenho',
      'Cálculo de ROI / CPL de campanhas ativas',
      'Montagem do PDF executivo com gráficos',
      'Reunião ou envio de apresentação para o cliente',
    ],
  },
];
