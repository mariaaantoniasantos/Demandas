import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  ActiveTimer,
  ActivityLog,
  Apontamento,
  ChecklistItem,
  Client,
  Comment,
  Demand,
  FilterState,
  Stage,
  ThemeMode,
  User,
  ViewMode,
} from '../types';
import { useAuth } from './AuthContext';

interface AddUserResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface DemandContextType {
  demands: Demand[];
  stages: Stage[];
  clients: Client[];
  users: User[];
  currentUser: User;
  selectedDemandId: string | null;
  setSelectedDemandId: (id: string | null) => void;
  isNewDemandModalOpen: boolean;
  setIsNewDemandModalOpen: (open: boolean) => void;
  newDemandInitialStageId: string | null;
  openNewDemandModal: (stageId?: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Modals for management
  isTeamModalOpen: boolean;
  setIsTeamModalOpen: (open: boolean) => void;
  isClientModalOpen: boolean;
  setIsClientModalOpen: (open: boolean) => void;
  isStageModalOpen: boolean;
  setIsStageModalOpen: (open: boolean) => void;

  // CRUD Demand
  addDemand: (data: Partial<Demand>) => Promise<Demand>;
  updateDemand: (id: string, updates: Partial<Demand>) => Promise<void>;
  moveDemand: (demandId: string, targetStageId: string, newIndex?: number) => Promise<void>;
  deleteDemand: (id: string) => Promise<void>;
  duplicateDemand: (id: string) => Promise<void>;

  // Checklist & Comments
  addComment: (demandId: string, texto: string) => Promise<void>;
  toggleChecklistItem: (demandId: string, itemId: string) => Promise<void>;
  addChecklistItem: (demandId: string, texto: string) => Promise<void>;
  deleteChecklistItem: (demandId: string, itemId: string) => Promise<void>;

  // Apontamento de horas
  apontamentos: Apontamento[];
  activeTimer: ActiveTimer | null;
  startTimer: (demandaId: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  addManualApontamento: (demandaId: string, duracaoMinutos: number, dataTrabalho: string) => Promise<void>;
  deleteApontamento: (id: string) => Promise<void>;
  getApontamentosByDemand: (demandaId: string) => Apontamento[];
  getTotalMinutosByDemand: (demandaId: string) => number;
  getTotalMinutosByClient: (clienteId: string) => number;
  getTotalMinutosByUser: (usuarioId: string) => number;

  // Entities CRUD
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'> & { senha: string }) => Promise<AddUserResult>;
  updateUser: (id: string, updates: Partial<User> & { senha?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<void>;
  addStage: (stage: Omit<Stage, 'id' | 'ordem'>) => Promise<Stage>;
  updateStage: (id: string, updates: Partial<Stage>) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  reorderStages: (newStages: Stage[]) => Promise<void>;

  // System Helpers
  exportDataJson: () => void;

  // Lookup helpers
  getClientById: (id: string) => Client | undefined;
  getUserById: (id: string) => User | undefined;
  getStageById: (id: string) => Stage | undefined;
  isEtapaFinal: (etapaId: string) => boolean;
  filteredDemands: Demand[];
  activeFiltersCount: number;
}

const THEME_STORAGE_KEY = 'agencia_theme_v1';

const initialFilters: FilterState = {
  search: '',
  clienteId: '',
  responsavelId: '',
  prioridade: '',
  tipo: '',
  prazoStatus: 'todos',
};

const DemandContext = createContext<DemandContextType | undefined>(undefined);

// ---- Mapeamento de linhas do Supabase para os tipos da aplicação ----

function mapUserRow(row: any): User {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    papel: row.papel,
    cor_avatar: row.cor_avatar,
    avatar_url: row.avatar_url ?? undefined,
  };
}

function mapClientRow(row: any): Client {
  return {
    id: row.id,
    nome: row.nome,
    cor_identificacao: row.cor_identificacao,
    segmento: row.segmento ?? undefined,
    contato: row.contato ?? undefined,
    observacoes: row.observacoes ?? undefined,
  };
}

function mapStageRow(row: any): Stage {
  return {
    id: row.id,
    nome: row.nome,
    ordem: row.ordem,
    cor: row.cor,
    descricao: row.descricao ?? undefined,
    e_etapa_final: Boolean(row.e_etapa_final),
  };
}

function mapChecklistRow(row: any): ChecklistItem {
  return {
    id: row.id,
    texto: row.texto,
    concluido: Boolean(row.concluido),
    responsavel_id: row.responsavel_id ?? undefined,
  };
}

function mapComentarioRow(row: any): Comment {
  return {
    id: row.id,
    autor_id: row.autor_id,
    texto: row.texto,
    criado_em: row.criado_em,
  };
}

function mapHistoricoRow(row: any): ActivityLog {
  return {
    id: row.id,
    autor_id: row.autor_id,
    acao: row.acao,
    detalhe: row.detalhe,
    timestamp: row.criado_em,
  };
}

function mapDemandFlat(row: any) {
  return {
    id: row.id as string,
    titulo: row.titulo as string,
    descricao: (row.descricao ?? '') as string,
    briefing: row.briefing ?? {},
    cliente_id: (row.cliente_id ?? '') as string,
    tipo: row.tipo,
    prioridade: row.prioridade,
    responsavel_id: (row.responsavel_id ?? '') as string,
    etapa_id: (row.etapa_id ?? '') as string,
    prazo: (row.prazo ?? '') as string,
    hora_agendamento: row.hora_agendamento ?? undefined,
    tags: row.tags ?? [],
    posicao: row.posicao ?? 0,
    criado_em: row.criado_em as string,
    atualizado_em: row.atualizado_em as string,
  };
}

function mapDemandRow(row: any): Demand {
  const historico = ((row.historico ?? []) as any[])
    .map(mapHistoricoRow)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    ...mapDemandFlat(row),
    checklist: ((row.checklist_items ?? []) as any[]).map(mapChecklistRow),
    comentarios: ((row.comentarios ?? []) as any[]).map(mapComentarioRow),
    historico,
  };
}

function mapApontamentoRow(row: any): Apontamento {
  return {
    id: row.id,
    demanda_id: row.demanda_id,
    usuario_id: row.usuario_id,
    inicio: row.inicio ?? undefined,
    fim: row.fim ?? undefined,
    data_trabalho: row.data_trabalho ?? undefined,
    duracao_minutos: row.duracao_minutos ?? 0,
    tipo: row.tipo,
    criado_em: row.criado_em,
  };
}

const DEMANDA_SELECT = '*, checklist_items(*), comentarios(*), historico(*)';

export const DemandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  // O DemandProvider só é montado (em App.tsx) quando já existe um usuário autenticado.
  const currentUser = auth.currentUser as User;

  // Theme state (única coisa que ainda vive só no navegador — preferência de UI, não dado do negócio)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#0a0a0c';
      document.body.style.color = '#f8fafc';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  // Dados do Supabase (Postgres). Carregados uma vez ao autenticar e mantidos
  // em memória, com atualizações otimistas a cada operação bem-sucedida.
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setIsLoadingData(true);
      const [usersRes, clientsRes, stagesRes, demandsRes, apontamentosRes] = await Promise.all([
        supabase.from('usuarios').select('*').order('nome'),
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('etapas').select('*').order('ordem'),
        supabase.from('demandas').select(DEMANDA_SELECT).order('posicao'),
        supabase.from('apontamentos').select('*'),
      ]);

      if (cancelled) return;

      if (usersRes.error) console.error('Falha ao carregar usuários', usersRes.error);
      if (clientsRes.error) console.error('Falha ao carregar clientes', clientsRes.error);
      if (stagesRes.error) console.error('Falha ao carregar etapas', stagesRes.error);
      if (demandsRes.error) console.error('Falha ao carregar demandas', demandsRes.error);
      if (apontamentosRes.error) console.error('Falha ao carregar apontamentos', apontamentosRes.error);

      setUsers((usersRes.data ?? []).map(mapUserRow));
      setClients((clientsRes.data ?? []).map(mapClientRow));
      setStages((stagesRes.data ?? []).map(mapStageRow));
      setDemands((demandsRes.data ?? []).map(mapDemandRow));
      setApontamentos((apontamentosRes.data ?? []).map(mapApontamentoRow));
      setIsLoadingData(false);
    }

    loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI state
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [isNewDemandModalOpen, setIsNewDemandModalOpen] = useState(false);
  const [newDemandInitialStageId, setNewDemandInitialStageId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Management modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  // Lookup functions
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getStageById = (id: string) => stages.find((s) => s.id === id);

  const isEtapaFinal = (etapaId: string): boolean => {
    if (!etapaId) return false;
    const targetStage = stages.find((s) => s.id === etapaId);
    if (!targetStage) return false;

    const hasExplicitFinal = stages.some((s) => s.e_etapa_final);
    if (hasExplicitFinal) {
      return Boolean(targetStage.e_etapa_final);
    }

    const sorted = [...stages].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const lastStage = sorted[sorted.length - 1];
    return lastStage?.id === etapaId;
  };

  const resetFilters = () => setFilters(initialFilters);

  const openNewDemandModal = (stageId?: string) => {
    setNewDemandInitialStageId(stageId || stages[0]?.id || null);
    setIsNewDemandModalOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.clienteId) count++;
    if (filters.responsavelId) count++;
    if (filters.prioridade) count++;
    if (filters.tipo) count++;
    if (filters.prazoStatus !== 'todos') count++;
    return count;
  }, [filters]);

  const filteredDemands = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return demands.filter((demand) => {
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const client = getClientById(demand.cliente_id)?.nome.toLowerCase() || '';
        const title = demand.titulo.toLowerCase();
        const desc = (demand.descricao || '').toLowerCase();
        const tags = (demand.tags || []).join(' ').toLowerCase();
        if (!title.includes(query) && !desc.includes(query) && !client.includes(query) && !tags.includes(query)) {
          return false;
        }
      }

      if (filters.clienteId && demand.cliente_id !== filters.clienteId) return false;
      if (filters.responsavelId && demand.responsavel_id !== filters.responsavelId) return false;
      if (filters.prioridade && demand.prioridade !== filters.prioridade) return false;
      if (filters.tipo && demand.tipo !== filters.tipo) return false;

      if (filters.prazoStatus !== 'todos') {
        if (!demand.prazo) {
          if (filters.prazoStatus !== 'sem_prazo') return false;
        } else {
          if (filters.prazoStatus === 'atrasados' && (demand.prazo >= todayStr || isEtapaFinal(demand.etapa_id))) {
            return false;
          }
          if (filters.prazoStatus === 'hoje' && demand.prazo !== todayStr) return false;
          if (filters.prazoStatus === 'semana' && (demand.prazo < todayStr || demand.prazo > nextWeekStr)) {
            return false;
          }
          if (filters.prazoStatus === 'sem_prazo') return false;
        }
      }

      return true;
    }).sort((a, b) => a.posicao - b.posicao);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demands, filters, clients, stages]);

  // ---- Demand CRUD ----

  function nextPosicaoInStage(etapaId: string, excludeId?: string): number {
    const itemsInStage = demands
      .filter((d) => d.etapa_id === etapaId && d.id !== excludeId)
      .sort((a, b) => a.posicao - b.posicao);
    return itemsInStage.length > 0 ? itemsInStage[itemsInStage.length - 1].posicao + 1000 : 1000;
  }

  const addDemand = async (data: Partial<Demand>): Promise<Demand> => {
    const etapaId = data.etapa_id || stages[0]?.id || '';
    const posicao = nextPosicaoInStage(etapaId);

    const { data: inserted, error } = await supabase
      .from('demandas')
      .insert({
        titulo: data.titulo || 'Nova Demanda',
        descricao: data.descricao || '',
        briefing: data.briefing || {},
        cliente_id: data.cliente_id || clients[0]?.id || null,
        tipo: data.tipo || 'post',
        prioridade: data.prioridade || 'media',
        responsavel_id: data.responsavel_id || currentUser.id,
        etapa_id: etapaId || null,
        prazo: data.prazo || new Date().toISOString().split('T')[0],
        hora_agendamento: data.hora_agendamento || null,
        tags: data.tags || [],
        posicao,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('Falha ao criar demanda', error);
      throw error || new Error('Falha ao criar demanda');
    }

    let checklistRows: ChecklistItem[] = [];
    if (data.checklist && data.checklist.length > 0) {
      const { data: insertedChecklist, error: checklistError } = await supabase
        .from('checklist_items')
        .insert(data.checklist.map((c) => ({ demanda_id: inserted.id, texto: c.texto, concluido: c.concluido })))
        .select('*');
      if (checklistError) console.error('Falha ao criar itens de checklist', checklistError);
      else if (insertedChecklist) checklistRows = insertedChecklist.map(mapChecklistRow);
    }

    const { data: historicoRow, error: historicoError } = await supabase
      .from('historico')
      .insert({
        demanda_id: inserted.id,
        autor_id: currentUser.id,
        acao: 'criado',
        detalhe: `Demanda criada por ${currentUser.nome}`,
      })
      .select('*')
      .single();
    if (historicoError) console.error('Falha ao registrar histórico', historicoError);

    const newDemand: Demand = {
      ...mapDemandFlat(inserted),
      checklist: checklistRows,
      comentarios: [],
      historico: historicoRow ? [mapHistoricoRow(historicoRow)] : [],
    };

    setDemands((prev) => [newDemand, ...prev]);
    return newDemand;
  };

  // Debounce das gravações de campos de texto (descrição/briefing) para não
  // disparar uma escrita no banco a cada tecla digitada. A UI já reflete a
  // mudança imediatamente via estado local otimista.
  const pendingFieldsRef = useRef<Map<string, Record<string, any>>>(new Map());
  const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const flushPendingUpdate = async (id: string) => {
    const timeout = pendingTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      pendingTimeoutsRef.current.delete(id);
    }
    const fields = pendingFieldsRef.current.get(id);
    if (!fields) return;
    pendingFieldsRef.current.delete(id);
    const { error } = await supabase.from('demandas').update(fields).eq('id', id);
    if (error) console.error('Falha ao salvar alterações da demanda', error);
  };

  const updateDemand = async (id: string, updates: Partial<Demand>) => {
    const dem = demands.find((d) => d.id === id);
    if (!dem) return;
    const nowIso = new Date().toISOString();

    const historicoInserts: Array<{ demanda_id: string; autor_id: string; acao: ActivityLog['acao']; detalhe: string }> = [];
    if (updates.etapa_id && updates.etapa_id !== dem.etapa_id) {
      const fromStage = getStageById(dem.etapa_id)?.nome || dem.etapa_id;
      const toStage = getStageById(updates.etapa_id)?.nome || updates.etapa_id;
      historicoInserts.push({
        demanda_id: id,
        autor_id: currentUser.id,
        acao: 'movido',
        detalhe: `Movido de "${fromStage}" para "${toStage}" por ${currentUser.nome}`,
      });
    }
    if (updates.responsavel_id && updates.responsavel_id !== dem.responsavel_id) {
      const prevUser = getUserById(dem.responsavel_id)?.nome || 'Sem responsável';
      const nextUser = getUserById(updates.responsavel_id)?.nome || 'Novo responsável';
      historicoInserts.push({
        demanda_id: id,
        autor_id: currentUser.id,
        acao: 'atualizado',
        detalhe: `Responsável transferido de "${prevUser}" para "${nextUser}" por ${currentUser.nome}`,
      });
    }

    const { checklist: newChecklistInput, comentarios: _c, historico: _h, id: _omit, ...dbUpdates } = updates as any;
    const isImmediate = Boolean(updates.etapa_id || updates.responsavel_id || newChecklistInput);

    // Atualização otimista local (a UI reflete na hora, mesmo com a gravação debounced)
    setDemands((prev) => prev.map((d) => (d.id === id ? { ...d, ...dbUpdates, atualizado_em: nowIso } : d)));

    let newChecklistRows: ChecklistItem[] = [];
    if (newChecklistInput) {
      const existingIds = new Set(dem.checklist.map((c) => c.id));
      const itemsToInsert = (newChecklistInput as ChecklistItem[]).filter((c) => !existingIds.has(c.id));
      if (itemsToInsert.length > 0) {
        const { data: inserted, error } = await supabase
          .from('checklist_items')
          .insert(itemsToInsert.map((c) => ({ demanda_id: id, texto: c.texto, concluido: c.concluido })))
          .select('*');
        if (error) console.error('Falha ao adicionar itens de checklist', error);
        else if (inserted) newChecklistRows = inserted.map(mapChecklistRow);
      }
    }

    let newHistoricoRows: ActivityLog[] = [];
    if (historicoInserts.length > 0) {
      const { data: inserted, error } = await supabase.from('historico').insert(historicoInserts).select('*');
      if (error) console.error('Falha ao registrar histórico', error);
      else if (inserted) newHistoricoRows = inserted.map(mapHistoricoRow);
    }

    if (isImmediate) {
      await flushPendingUpdate(id);
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from('demandas').update({ ...dbUpdates, atualizado_em: nowIso }).eq('id', id);
        if (error) console.error('Falha ao salvar demanda', error);
      }
    } else if (Object.keys(dbUpdates).length > 0) {
      const merged = { ...(pendingFieldsRef.current.get(id) || {}), ...dbUpdates, atualizado_em: nowIso };
      pendingFieldsRef.current.set(id, merged);
      const prevTimeout = pendingTimeoutsRef.current.get(id);
      if (prevTimeout) clearTimeout(prevTimeout);
      pendingTimeoutsRef.current.set(
        id,
        setTimeout(() => {
          flushPendingUpdate(id);
        }, 700)
      );
    }

    if (newChecklistRows.length > 0 || newHistoricoRows.length > 0) {
      setDemands((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                checklist: newChecklistRows.length > 0 ? [...d.checklist, ...newChecklistRows] : d.checklist,
                historico: newHistoricoRows.length > 0 ? [...newHistoricoRows, ...d.historico] : d.historico,
              }
            : d
        )
      );
    }
  };

  const moveDemand = async (demandId: string, targetStageId: string, newIndex?: number) => {
    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;

    const itemsInTargetStage = demands
      .filter((d) => d.etapa_id === targetStageId && d.id !== demandId)
      .sort((a, b) => a.posicao - b.posicao);

    const idx = typeof newIndex === 'number' ? newIndex : itemsInTargetStage.length;
    const clamped = Math.max(0, Math.min(idx, itemsInTargetStage.length));

    let posicao: number;
    if (itemsInTargetStage.length === 0) posicao = 1000;
    else if (clamped === 0) posicao = itemsInTargetStage[0].posicao - 1000;
    else if (clamped >= itemsInTargetStage.length) posicao = itemsInTargetStage[itemsInTargetStage.length - 1].posicao + 1000;
    else posicao = (itemsInTargetStage[clamped - 1].posicao + itemsInTargetStage[clamped].posicao) / 2;

    const nowIso = new Date().toISOString();
    const stageChanged = demand.etapa_id !== targetStageId;

    setDemands((prev) =>
      prev.map((d) => (d.id === demandId ? { ...d, etapa_id: targetStageId, posicao, atualizado_em: nowIso } : d))
    );

    const { error } = await supabase
      .from('demandas')
      .update({ etapa_id: targetStageId, posicao, atualizado_em: nowIso })
      .eq('id', demandId);
    if (error) {
      console.error('Falha ao mover demanda', error);
      return;
    }

    if (stageChanged) {
      const toStage = getStageById(targetStageId)?.nome || targetStageId;
      const { data: inserted, error: histError } = await supabase
        .from('historico')
        .insert({
          demanda_id: demandId,
          autor_id: currentUser.id,
          acao: isEtapaFinal(targetStageId) ? 'concluido' : 'movido',
          detalhe: `Movido para "${toStage}" por ${currentUser.nome}`,
        })
        .select('*')
        .single();
      if (histError) console.error('Falha ao registrar histórico', histError);
      else if (inserted) {
        const newRow = mapHistoricoRow(inserted);
        setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, historico: [newRow, ...d.historico] } : d)));
      }
    }
  };

  const deleteDemand = async (id: string) => {
    const { error } = await supabase.from('demandas').delete().eq('id', id);
    if (error) {
      console.error('Falha ao excluir demanda', error);
      return;
    }
    setDemands((prev) => prev.filter((d) => d.id !== id));
    setApontamentos((prev) => prev.filter((a) => a.demanda_id !== id));
    if (selectedDemandId === id) setSelectedDemandId(null);
  };

  const duplicateDemand = async (id: string) => {
    const original = demands.find((d) => d.id === id);
    if (!original) return;

    const posicao = nextPosicaoInStage(original.etapa_id);

    const { data: inserted, error } = await supabase
      .from('demandas')
      .insert({
        titulo: `${original.titulo} (Cópia)`,
        descricao: original.descricao,
        briefing: original.briefing || {},
        cliente_id: original.cliente_id || null,
        tipo: original.tipo,
        prioridade: original.prioridade,
        responsavel_id: original.responsavel_id || null,
        etapa_id: original.etapa_id || null,
        prazo: original.prazo || null,
        hora_agendamento: original.hora_agendamento || null,
        tags: original.tags || [],
        posicao,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      console.error('Falha ao duplicar demanda', error);
      return;
    }

    let checklistRows: ChecklistItem[] = [];
    if (original.checklist.length > 0) {
      const { data: insertedChecklist, error: checklistError } = await supabase
        .from('checklist_items')
        .insert(original.checklist.map((c) => ({ demanda_id: inserted.id, texto: c.texto, concluido: false })))
        .select('*');
      if (checklistError) console.error('Falha ao duplicar checklist', checklistError);
      else if (insertedChecklist) checklistRows = insertedChecklist.map(mapChecklistRow);
    }

    const { data: historicoRow, error: historicoError } = await supabase
      .from('historico')
      .insert({
        demanda_id: inserted.id,
        autor_id: currentUser.id,
        acao: 'criado',
        detalhe: `Duplicado a partir de "${original.titulo}"`,
      })
      .select('*')
      .single();
    if (historicoError) console.error('Falha ao registrar histórico', historicoError);

    const newDemand: Demand = {
      ...mapDemandFlat(inserted),
      checklist: checklistRows,
      comentarios: [],
      historico: historicoRow ? [mapHistoricoRow(historicoRow)] : [],
    };

    setDemands((prev) => [newDemand, ...prev]);
  };

  const addComment = async (demandId: string, texto: string) => {
    if (!texto.trim()) return;
    const nowIso = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('comentarios')
      .insert({ demanda_id: demandId, autor_id: currentUser.id, texto: texto.trim() })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao adicionar comentário', error);
      return;
    }

    await supabase.from('demandas').update({ atualizado_em: nowIso }).eq('id', demandId);

    setDemands((prev) =>
      prev.map((d) =>
        d.id === demandId ? { ...d, comentarios: [...d.comentarios, mapComentarioRow(inserted)], atualizado_em: nowIso } : d
      )
    );
  };

  const toggleChecklistItem = async (demandId: string, itemId: string) => {
    const dem = demands.find((d) => d.id === demandId);
    const item = dem?.checklist.find((c) => c.id === itemId);
    if (!item) return;

    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('checklist_items').update({ concluido: !item.concluido }).eq('id', itemId);
    if (error) {
      console.error('Falha ao atualizar item de checklist', error);
      return;
    }
    await supabase.from('demandas').update({ atualizado_em: nowIso }).eq('id', demandId);

    setDemands((prev) =>
      prev.map((d) =>
        d.id === demandId
          ? {
              ...d,
              checklist: d.checklist.map((c) => (c.id === itemId ? { ...c, concluido: !c.concluido } : c)),
              atualizado_em: nowIso,
            }
          : d
      )
    );
  };

  const addChecklistItem = async (demandId: string, texto: string) => {
    if (!texto.trim()) return;
    const nowIso = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from('checklist_items')
      .insert({ demanda_id: demandId, texto: texto.trim(), concluido: false })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao adicionar item de checklist', error);
      return;
    }
    await supabase.from('demandas').update({ atualizado_em: nowIso }).eq('id', demandId);

    setDemands((prev) =>
      prev.map((d) =>
        d.id === demandId ? { ...d, checklist: [...d.checklist, mapChecklistRow(inserted)], atualizado_em: nowIso } : d
      )
    );
  };

  const deleteChecklistItem = async (demandId: string, itemId: string) => {
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
    if (error) {
      console.error('Falha ao remover item de checklist', error);
      return;
    }
    await supabase.from('demandas').update({ atualizado_em: nowIso }).eq('id', demandId);

    setDemands((prev) =>
      prev.map((d) =>
        d.id === demandId
          ? { ...d, checklist: d.checklist.filter((item) => item.id !== itemId), atualizado_em: nowIso }
          : d
      )
    );
  };

  // ---- Apontamento de horas (timer + lançamento manual) ----
  // Um timer "em andamento" é uma linha de apontamentos com tipo='timer' e fim = null.

  const activeTimer: ActiveTimer | null = useMemo(() => {
    const running = apontamentos.find((a) => a.usuario_id === currentUser.id && a.tipo === 'timer' && !a.fim);
    if (!running || !running.inicio) return null;
    return { demandaId: running.demanda_id, usuarioId: running.usuario_id, inicio: running.inicio };
  }, [apontamentos, currentUser.id]);

  const startTimer = async (demandaId: string) => {
    if (activeTimer) return; // já existe um timer rodando para o usuário
    const inicio = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from('apontamentos')
      .insert({ demanda_id: demandaId, usuario_id: currentUser.id, inicio, tipo: 'timer', duracao_minutos: 0 })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao iniciar timer', error);
      return;
    }
    setApontamentos((prev) => [mapApontamentoRow(inserted), ...prev]);
  };

  const stopTimer = async () => {
    const running = apontamentos.find((a) => a.usuario_id === currentUser.id && a.tipo === 'timer' && !a.fim);
    if (!running || !running.inicio) return;

    const fimIso = new Date().toISOString();
    const duracaoMinutos = Math.max(1, Math.round((Date.now() - new Date(running.inicio).getTime()) / 60000));

    const { data: updated, error } = await supabase
      .from('apontamentos')
      .update({ fim: fimIso, duracao_minutos: duracaoMinutos })
      .eq('id', running.id)
      .select('*')
      .single();
    if (error || !updated) {
      console.error('Falha ao parar timer', error);
      return;
    }
    setApontamentos((prev) => prev.map((a) => (a.id === running.id ? mapApontamentoRow(updated) : a)));
  };

  const addManualApontamento = async (demandaId: string, duracaoMinutos: number, dataTrabalho: string) => {
    if (!duracaoMinutos || duracaoMinutos <= 0) return;
    const { data: inserted, error } = await supabase
      .from('apontamentos')
      .insert({
        demanda_id: demandaId,
        usuario_id: currentUser.id,
        data_trabalho: dataTrabalho || new Date().toISOString().split('T')[0],
        duracao_minutos: Math.round(duracaoMinutos),
        tipo: 'manual',
      })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao lançar apontamento', error);
      return;
    }
    setApontamentos((prev) => [mapApontamentoRow(inserted), ...prev]);
  };

  const deleteApontamento = async (id: string) => {
    const { error } = await supabase.from('apontamentos').delete().eq('id', id);
    if (error) {
      console.error('Falha ao remover apontamento', error);
      return;
    }
    setApontamentos((prev) => prev.filter((a) => a.id !== id));
  };

  const getApontamentosByDemand = (demandaId: string) =>
    apontamentos
      .filter((a) => a.demanda_id === demandaId)
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

  const getTotalMinutosByDemand = (demandaId: string) =>
    apontamentos.filter((a) => a.demanda_id === demandaId).reduce((sum, a) => sum + a.duracao_minutos, 0);

  const getTotalMinutosByClient = (clienteId: string) => {
    const demandIds = new Set(demands.filter((d) => d.cliente_id === clienteId).map((d) => d.id));
    return apontamentos.filter((a) => demandIds.has(a.demanda_id)).reduce((sum, a) => sum + a.duracao_minutos, 0);
  };

  const getTotalMinutosByUser = (usuarioId: string) =>
    apontamentos.filter((a) => a.usuario_id === usuarioId).reduce((sum, a) => sum + a.duracao_minutos, 0);

  // ---- Client CRUD ----

  const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const { data: inserted, error } = await supabase
      .from('clientes')
      .insert({
        nome: clientData.nome,
        cor_identificacao: clientData.cor_identificacao,
        segmento: clientData.segmento || null,
        contato: clientData.contato || null,
        observacoes: clientData.observacoes || null,
      })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao criar cliente', error);
      throw error || new Error('Falha ao criar cliente');
    }
    const newClient = mapClientRow(inserted);
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clientes').update(updates).eq('id', id);
    if (error) {
      console.error('Falha ao atualizar cliente', error);
      return;
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) {
      console.error('Falha ao excluir cliente', error);
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // ---- User CRUD — sempre via rotas protegidas /api/team-members (service role) ----

  const addUser = async (userData: Omit<User, 'id'> & { senha: string }): Promise<AddUserResult> => {
    try {
      const res = await auth.authFetch('/api/team-members', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Não foi possível cadastrar o usuário.' };
      }
      const newUser = mapUserRow(data.user);
      setUsers((prev) => [...prev, newUser]);
      return { success: true, user: newUser };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const updateUser = async (id: string, updates: Partial<User> & { senha?: string }) => {
    try {
      const res = await auth.authFetch(`/api/team-members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Falha ao atualizar usuário', data.error);
        return { success: false, error: data.error || 'Não foi possível atualizar o usuário.' };
      }
      const updatedUser = mapUserRow(data.user);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      if (currentUser.id === id) auth.setCurrentUser(updatedUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const deleteUser = async (id: string) => {
    if (users.length <= 1) return;
    if (id === currentUser.id) return;
    try {
      const res = await auth.authFetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        console.error('Falha ao remover usuário', data.error);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error('Falha ao remover usuário', e);
    }
  };

  // ---- Stage CRUD ----

  const addStage = async (stageData: Omit<Stage, 'id' | 'ordem'>): Promise<Stage> => {
    const newOrdem = stages.length + 1;

    if (stageData.e_etapa_final) {
      await supabase.from('etapas').update({ e_etapa_final: false }).gte('ordem', 0);
      setStages((prev) => prev.map((s) => ({ ...s, e_etapa_final: false })));
    }

    const { data: inserted, error } = await supabase
      .from('etapas')
      .insert({
        nome: stageData.nome,
        cor: stageData.cor,
        descricao: stageData.descricao || null,
        e_etapa_final: Boolean(stageData.e_etapa_final),
        ordem: newOrdem,
      })
      .select('*')
      .single();
    if (error || !inserted) {
      console.error('Falha ao criar etapa', error);
      throw error || new Error('Falha ao criar etapa');
    }
    const newStage = mapStageRow(inserted);
    setStages((prev) => [...prev, newStage]);
    return newStage;
  };

  const updateStage = async (id: string, updates: Partial<Stage>) => {
    if (updates.e_etapa_final) {
      await supabase.from('etapas').update({ e_etapa_final: false }).neq('id', id);
      setStages((prev) => prev.map((s) => (s.id === id ? s : { ...s, e_etapa_final: false })));
    }
    const { error } = await supabase.from('etapas').update(updates).eq('id', id);
    if (error) {
      console.error('Falha ao atualizar etapa', error);
      return;
    }
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStage = async (id: string) => {
    if (stages.length <= 1) return;
    const stageToDelete = stages.find((s) => s.id === id);
    let remaining = stages.filter((s) => s.id !== id);
    const fallbackStageId = remaining[0].id;

    const { error: reassignError } = await supabase.from('demandas').update({ etapa_id: fallbackStageId }).eq('etapa_id', id);
    if (reassignError) console.error('Falha ao reatribuir demandas da etapa excluída', reassignError);

    const { error: deleteError } = await supabase.from('etapas').delete().eq('id', id);
    if (deleteError) {
      console.error('Falha ao excluir etapa', deleteError);
      return;
    }

    setDemands((prev) => prev.map((d) => (d.etapa_id === id ? { ...d, etapa_id: fallbackStageId } : d)));

    const hasFinal = remaining.some((s) => s.e_etapa_final);
    if (stageToDelete?.e_etapa_final || !hasFinal) {
      const sorted = [...remaining].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      const lastStage = sorted[sorted.length - 1];
      remaining = remaining.map((s) => ({ ...s, e_etapa_final: s.id === lastStage.id }));
      await supabase.from('etapas').update({ e_etapa_final: true }).eq('id', lastStage.id);
    }

    setStages(remaining);
  };

  const reorderStages = async (newStages: Stage[]) => {
    const withUpdatedOrder = newStages.map((s, idx) => ({ ...s, ordem: idx + 1 }));
    setStages(withUpdatedOrder);
    const results = await Promise.all(
      withUpdatedOrder.map((s) => supabase.from('etapas').update({ ordem: s.ordem }).eq('id', s.id))
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) console.error('Falha ao reordenar etapas', failed.error);
  };

  // Export JSON (apenas leitura/backup local; os dados vivem no Supabase)
  const exportDataJson = () => {
    const dataToExport = {
      stages,
      clients,
      demands,
      apontamentos,
      exportedAt: new Date().toISOString(),
      version: '3.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agencia_demandas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-slate-400 text-sm">
        Carregando dados...
      </div>
    );
  }

  return (
    <DemandContext.Provider
      value={{
        demands,
        stages,
        clients,
        users,
        currentUser,
        selectedDemandId,
        setSelectedDemandId,
        isNewDemandModalOpen,
        setIsNewDemandModalOpen,
        newDemandInitialStageId,
        openNewDemandModal,
        filters,
        setFilters,
        resetFilters,
        viewMode,
        setViewMode,
        theme,
        setTheme,
        toggleTheme,
        isTeamModalOpen,
        setIsTeamModalOpen,
        isClientModalOpen,
        setIsClientModalOpen,
        isStageModalOpen,
        setIsStageModalOpen,
        addDemand,
        updateDemand,
        moveDemand,
        deleteDemand,
        duplicateDemand,
        addComment,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
        apontamentos,
        activeTimer,
        startTimer,
        stopTimer,
        addManualApontamento,
        deleteApontamento,
        getApontamentosByDemand,
        getTotalMinutosByDemand,
        getTotalMinutosByClient,
        getTotalMinutosByUser,
        addClient,
        updateClient,
        deleteClient,
        addUser,
        updateUser,
        deleteUser,
        addStage,
        updateStage,
        deleteStage,
        reorderStages,
        exportDataJson,
        getClientById,
        getUserById,
        getStageById,
        isEtapaFinal,
        filteredDemands,
        activeFiltersCount,
      }}
    >
      {children}
    </DemandContext.Provider>
  );
};

export const useDemands = () => {
  const context = useContext(DemandContext);
  if (!context) {
    throw new Error('useDemands must be used within a DemandProvider');
  }
  return context;
};
