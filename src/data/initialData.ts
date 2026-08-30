import { Client, Demand, Stage, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_mariana',
    nome: 'Mariana Santos',
    email: 'mariana.santos@v4company.com',
    cor_avatar: '#10b981',
    papel: 'gerente',
  },
  {
    id: 'user_lucas',
    nome: 'Lucas Silva',
    email: 'lucas.designer@agencia.com',
    cor_avatar: '#8b5cf6',
    papel: 'designer',
  },
  {
    id: 'user_beatriz',
    nome: 'Beatriz Lima',
    email: 'beatriz.social@agencia.com',
    cor_avatar: '#ec4899',
    papel: 'social_media',
  },
  {
    id: 'user_rafael',
    nome: 'Rafael Costa',
    email: 'rafael.video@agencia.com',
    cor_avatar: '#f59e0b',
    papel: 'videomaker',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_nutrilife',
    nome: 'NutriLife Alimentos',
    cor_identificacao: '#10b981',
    segmento: 'Alimentação Saudável & Suplementos',
    contato: 'Fernanda (Marketing)',
  },
  {
    id: 'cli_studiobella',
    nome: 'Studio Bella Odonto',
    cor_identificacao: '#ec4899',
    segmento: 'Clínica Odontológica & Estética',
    contato: 'Dra. Isabela',
  },
  {
    id: 'cli_inovare',
    nome: 'Inovare Imóveis',
    cor_identificacao: '#3b82f6',
    segmento: 'Imobiliária Alto Padrão',
    contato: 'Carlos Eduardo',
  },
  {
    id: 'cli_fitzone',
    nome: 'FitZone Academia',
    cor_identificacao: '#f97316',
    segmento: 'Fitness & Treinamento',
    contato: 'Rodrigo Personal',
  },
  {
    id: 'cli_techflow',
    nome: 'TechFlow SaaS',
    cor_identificacao: '#8b5cf6',
    segmento: 'Software B2B & Automação',
    contato: 'Arthur CTO',
  },
];

export const INITIAL_STAGES: Stage[] = [
  {
    id: 'stage_ideias',
    nome: 'Briefing / Ideias',
    ordem: 1,
    cor: '#64748b',
    descricao: 'Demandas em concepção, levantamento de referências e alinhamento',
  },
  {
    id: 'stage_producao',
    nome: 'Em Produção',
    ordem: 2,
    cor: '#3b82f6',
    descricao: 'Designer ou Social Media executando a peça visual e texto',
  },
  {
    id: 'stage_revisao',
    nome: 'Revisão Interna',
    ordem: 3,
    cor: '#f59e0b',
    descricao: 'Checagem de texto, proporções e alinhamento com a marca pelo time',
  },
  {
    id: 'stage_aprovacao',
    nome: 'Aprovação Cliente',
    ordem: 4,
    cor: '#8b5cf6',
    descricao: 'Peça enviada para validação e ok do cliente',
  },
  {
    id: 'stage_agendamento',
    nome: 'Agendamento',
    ordem: 5,
    cor: '#06b6d4',
    descricao: 'Aprovada! Programação de data, horário e legenda nas ferramentas',
  },
  {
    id: 'stage_concluido',
    nome: 'Concluído',
    ordem: 6,
    cor: '#10b981',
    descricao: 'Publicado no ar e métricas em acompanhamento',
    e_etapa_final: true,
  },
];

// Helper to get formatted relative dates
const getOffsetDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_DEMANDS: Demand[] = [
  {
    id: 'dem_1',
    titulo: 'Carrossel: 5 Mitos sobre Creatina e Hidratação',
    descricao: 'Carrossel educativo desmistificando dúvidas comuns do público fitness sobre o uso diário de creatina.',
    briefing: {
      objetivo: 'Engajamento no feed e salvamentos com conteúdo de alto valor informativo.',
      formato: 'Carrossel 1080x1350 (5 lâminas)',
      copy_sugestao: 'Capa: "Creatina retém líquido no músculo ou engorda?" / Slide 2: Explicação fisiológica / Slide 5: CTA "Salve este post para consultar depois!"',
      referencias: 'Usar a paleta verde esmeralda e fotos em alta resolução do banco de imagens.',
      link_drive: 'https://drive.google.com/drive/folders/nutrilife-campanha',
    },
    cliente_id: 'cli_nutrilife',
    tipo: 'carrossel',
    prioridade: 'alta',
    responsavel_id: 'user_lucas',
    etapa_id: 'stage_producao',
    prazo: getOffsetDate(2),
    hora_agendamento: '18:30',
    tags: ['Fitness', 'Nutrição', 'Carrossel'],
    checklist: [
      { id: 'chk_1', texto: 'Pesquisar artigos científicos e validar dados', concluido: true },
      { id: 'chk_2', texto: 'Escrever copy detalhada dos 5 slides', concluido: true },
      { id: 'chk_3', texto: 'Diagramar slides no Figma (1080x1350)', concluido: false },
      { id: 'chk_4', texto: 'Exportar PNGs e enviar para revisão', concluido: false },
    ],
    comentarios: [
      {
        id: 'com_1',
        autor_id: 'user_beatriz',
        texto: 'Lucas, já deixei a copy aprovada no briefing. No slide 4 deixei um destaque em amarelo para a dosagem recomendada!',
        criado_em: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'com_2',
        autor_id: 'user_lucas',
        texto: 'Show Bia! Já comecei a montagem das lâminas, vou finalizar a capa ainda hoje.',
        criado_em: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    historico: [
      {
        id: 'log_1',
        autor_id: 'user_mariana',
        acao: 'criado',
        detalhe: 'Demanda criada e atribuída a Lucas Silva',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'log_2',
        autor_id: 'user_lucas',
        acao: 'movido',
        detalhe: 'Movido de Briefing / Ideias para Em Produção',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 'dem_2',
    titulo: 'Reels: Transformação Antes/Depois Lentes em Resina',
    descricao: 'Vídeo dinâmico de 30s mostrando o sorriso do paciente antes e o resultado final estético com depoimento emocionado.',
    briefing: {
      objetivo: 'Gerar mensagens no Direct solicitando avaliação estética.',
      formato: 'Vídeo 9:16 (1080x1920) 60fps',
      copy_sugestao: 'Áudio em alta, gancho inicial nos primeiros 2 segundos com o close do sorriso.',
      referencias: 'Estilo clean, fundo musical suave e legendas elegantes com transição suave.',
      link_drive: 'https://drive.google.com/drive/folders/studiobella-reels',
    },
    cliente_id: 'cli_studiobella',
    tipo: 'reels',
    prioridade: 'urgente',
    responsavel_id: 'user_rafael',
    etapa_id: 'stage_aprovacao',
    prazo: getOffsetDate(0), // Hoje
    hora_agendamento: '12:00',
    tags: ['Odonto', 'Reels', 'Estética'],
    checklist: [
      { id: 'chk_20', texto: 'Roteiro aprovado', concluido: true },
      { id: 'chk_21', texto: 'Captação realizada', concluido: true },
      { id: 'chk_22', texto: 'Seleção de melhores takes', concluido: true },
      { id: 'chk_23', texto: 'Edição finalizada', concluido: true },
      { id: 'chk_24', texto: 'Revisão de corte (interna)', concluido: true },
      { id: 'chk_25', texto: 'Trilha/áudio ajustado', concluido: false },
      { id: 'chk_26', texto: 'Exportado em formato final', concluido: false },
    ],
    comentarios: [
      {
        id: 'com_20',
        autor_id: 'user_rafael',
        texto: 'Vídeo renderizado e enviado pelo link do preview. Aguardando apenas o ok da doutora.',
        criado_em: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'com_21',
        autor_id: 'user_mariana',
        texto: 'Ela já visualizou e adorou o resultado, só pediu para ajustar o crédito do dentista no final!',
        criado_em: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
    historico: [
      {
        id: 'log_20',
        autor_id: 'user_mariana',
        acao: 'criado',
        detalhe: 'Demanda criada com prioridade urgente',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'log_21',
        autor_id: 'user_rafael',
        acao: 'movido',
        detalhe: 'Movido para Aprovação Cliente',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 3).toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 'dem_3',
    titulo: 'Post: Lançamento Edifício Reserva Jardins',
    descricao: 'Anúncio de abertura de vendas do novo empreendimento de alto padrão com plantas de 140m².',
    briefing: {
      objetivo: 'Atrair leads qualificados para agendamento com corretores.',
      formato: 'Feed 1:1 e formato 4:5 para tráfego pago',
      copy_sugestao: 'Viver com exclusividade no melhor endereço da cidade. Conheça o decorado.',
      link_drive: 'https://drive.google.com/drive/folders/inovare-reserva',
    },
    cliente_id: 'cli_inovare',
    tipo: 'post',
    prioridade: 'alta',
    responsavel_id: 'user_lucas',
    etapa_id: 'stage_revisao',
    prazo: getOffsetDate(1),
    hora_agendamento: '19:00',
    tags: ['Imóveis', 'Lançamento', 'Meta Ads'],
    checklist: [
      { id: 'chk_30', texto: 'Tratar render 3D da fachada principal', concluido: true },
      { id: 'chk_31', texto: 'Inserir logotipo dourado e selo de lançamento', concluido: true },
      { id: 'chk_32', texto: 'Revisar se o número de registro no cartório está legível', concluido: false },
    ],
    comentarios: [
      {
        id: 'com_30',
        autor_id: 'user_beatriz',
        texto: 'Lucas, preciso que o telefone do plantão de vendas fique com tamanho de fonte maior para leitura rápida.',
        criado_em: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
    historico: [
      {
        id: 'log_30',
        autor_id: 'user_lucas',
        acao: 'movido',
        detalhe: 'Movido para Revisão Interna',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 'dem_4',
    titulo: 'Sequência de Stories: Desafio 21 Dias de Verão',
    descricao: 'Sequência interativa de 4 stories chamando os alunos para a pesagem inicial e matrícula no plano semestral.',
    briefing: {
      objetivo: 'Engajar membros da academia e gerar conversões de novos planos.',
      formato: 'Stories 1080x1920',
      copy_sugestao: 'Enquete: "Qual sua meta nesse verão? Ganhar massa ou Queimar gordura?"',
    },
    cliente_id: 'cli_fitzone',
    tipo: 'stories',
    prioridade: 'media',
    responsavel_id: 'user_beatriz',
    etapa_id: 'stage_agendamento',
    prazo: getOffsetDate(3),
    hora_agendamento: '08:00',
    tags: ['Stories', 'Interativo', 'Academia'],
    checklist: [
      { id: 'chk_40', texto: 'Criar artes com stickers e espaço para enquetes', concluido: true },
      { id: 'chk_41', texto: 'Validar horários de maior audiência matinal', concluido: true },
      { id: 'chk_42', texto: 'Programar no Meta Business Suite', concluido: true },
    ],
    comentarios: [],
    historico: [
      {
        id: 'log_40',
        autor_id: 'user_beatriz',
        acao: 'movido',
        detalhe: 'Movido para Agendamento',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 1).toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 'dem_5',
    titulo: 'Relatório Mensal de Performance e ROI',
    descricao: 'Consolidação das métricas de tráfego pago (Google Ads e LinkedIn) com CPL e pipeline de vendas gerado.',
    briefing: {
      objetivo: 'Apresentação executiva para os fundadores do SaaS.',
      formato: 'PDF 16:9 + Apresentação',
    },
    cliente_id: 'cli_techflow',
    tipo: 'relatorio',
    prioridade: 'urgente',
    responsavel_id: 'user_mariana',
    etapa_id: 'stage_ideias',
    prazo: getOffsetDate(-1), // Atrasada para demonstrar aviso visual
    hora_agendamento: '15:00',
    tags: ['Métricas', 'B2B', 'Relatório'],
    checklist: [
      { id: 'chk_50', texto: 'Exportar dados do Google Analytics 4', concluido: true },
      { id: 'chk_51', texto: 'Cruzar leads gerados com o CRM HubSpot', concluido: false },
      { id: 'chk_52', texto: 'Montar slides de diagnóstico e plano para próximo mês', concluido: false },
    ],
    comentarios: [
      {
        id: 'com_50',
        autor_id: 'user_mariana',
        texto: 'Aguardando o Arthur confirmar se a reunião será na quinta ou sexta.',
        criado_em: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
    historico: [
      {
        id: 'log_50',
        autor_id: 'user_mariana',
        acao: 'criado',
        detalhe: 'Demanda criada em Briefing',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 4).toISOString(),
    atualizado_em: new Date().toISOString(),
  },
  {
    id: 'dem_6',
    titulo: 'Identidade Visual: Nova Linha de Proteínas Veganas',
    descricao: 'Criação de rótulos para pote de 900g, paleta de cores secundária e manual de aplicação do selo 100% Plant-Based.',
    briefing: {
      objetivo: 'Diferenciação na gôndola e comunicação com público vegano/vegetariano.',
      formato: 'Vetor / Arquivos para gráfica com sangria e faca',
    },
    cliente_id: 'cli_nutrilife',
    tipo: 'identidade',
    prioridade: 'media',
    responsavel_id: 'user_lucas',
    etapa_id: 'stage_concluido',
    prazo: getOffsetDate(-3),
    tags: ['Branding', 'Embalagem', 'Produto'],
    checklist: [
      { id: 'chk_60', texto: 'Painel de referências de embalagens sustentáveis', concluido: true },
      { id: 'chk_61', texto: '3 propostas de design frontal de rótulo', concluido: true },
      { id: 'chk_62', texto: 'Aprovação do time de compliance e vigilância', concluido: true },
      { id: 'chk_63', texto: 'Fechamento de arquivo em PDF/X-1a para gráfica', concluido: true },
    ],
    comentarios: [
      {
        id: 'com_60',
        autor_id: 'user_mariana',
        texto: 'Cliente aprovou a proposta 2 de primeira! Excelente trabalho, Lucas.',
        criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    historico: [
      {
        id: 'log_60',
        autor_id: 'user_mariana',
        acao: 'concluido',
        detalhe: 'Demanda concluída com sucesso',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    criado_em: new Date(Date.now() - 86400000 * 10).toISOString(),
    atualizado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];
