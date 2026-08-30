import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_CLIENTS,
  INITIAL_DEMANDS,
  INITIAL_STAGES,
  INITIAL_USERS,
} from '../data/initialData';
import {
  Client,
  Demand,
  FilterState,
  Stage,
  ThemeMode,
  User,
  ViewMode,
} from '../types';

interface DemandContextType {
  demands: Demand[];
  stages: Stage[];
  clients: Client[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
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
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;

  // CRUD Demand
  addDemand: (data: Partial<Demand>) => Demand;
  updateDemand: (id: string, updates: Partial<Demand>) => void;
  moveDemand: (demandId: string, targetStageId: string, newIndex?: number) => void;
  deleteDemand: (id: string) => void;
  duplicateDemand: (id: string) => void;

  // Checklist & Comments
  addComment: (demandId: string, texto: string) => void;
  toggleChecklistItem: (demandId: string, itemId: string) => void;
  addChecklistItem: (demandId: string, texto: string) => void;
  deleteChecklistItem: (demandId: string, itemId: string) => void;

  // Entities CRUD
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addStage: (stage: Omit<Stage, 'id' | 'ordem'>) => Stage;
  updateStage: (id: string, updates: Partial<Stage>) => void;
  deleteStage: (id: string) => void;
  reorderStages: (newStages: Stage[]) => void;

  // System Helpers
  resetToDefaults: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonStr: string) => boolean;

  // Lookup helpers
  getClientById: (id: string) => Client | undefined;
  getUserById: (id: string) => User | undefined;
  getStageById: (id: string) => Stage | undefined;
  isEtapaFinal: (etapaId: string) => boolean;
  filteredDemands: Demand[];
  activeFiltersCount: number;
}

const STORAGE_KEYS = {
  DEMANDS: 'agencia_demandas_v1',
  STAGES: 'agencia_etapas_v1',
  CLIENTS: 'agencia_clientes_v1',
  USERS: 'agencia_usuarios_v1',
  CURRENT_USER_ID: 'agencia_current_user_id_v1',
  THEME: 'agencia_theme_v1',
};

const initialFilters: FilterState = {
  search: '',
  clienteId: '',
  responsavelId: '',
  prioridade: '',
  tipo: '',
  prazoStatus: 'todos',
};

const DemandContext = createContext<DemandContextType | undefined>(undefined);

export const DemandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
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

  // Load from local storage or defaults
  const [stages, setStages] = useState<Stage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAGES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STAGES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CLIENTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    return users[0] || INITIAL_USERS[0];
  });

  const [demands, setDemands] = useState<Demand[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEMANDS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_DEMANDS;
  });

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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [currentUser]);

  // Lookup functions
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getStageById = (id: string) => stages.find((s) => s.id === id);

  const isEtapaFinal = (etapaId: string): boolean => {
    if (!etapaId) return false;
    const targetStage = stages.find((s) => s.id === etapaId);
    if (!targetStage) return false;

    // Check if any stage is explicitly marked as final
    const hasExplicitFinal = stages.some((s) => s.e_etapa_final);
    if (hasExplicitFinal) {
      return Boolean(targetStage.e_etapa_final);
    }

    // Fallback: If no stage is explicitly marked as final, the stage with the highest order (or last in list) is final
    const sorted = [...stages].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const lastStage = sorted[sorted.length - 1];
    return lastStage?.id === etapaId;
  };

  const resetFilters = () => setFilters(initialFilters);

  const openNewDemandModal = (stageId?: string) => {
    setNewDemandInitialStageId(stageId || stages[0]?.id || 'stage_ideias');
    setIsNewDemandModalOpen(true);
  };

  // Active filters count
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

  // Filtered Demands
  const filteredDemands = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return demands.filter((demand) => {
      // Search
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

      // Client filter
      if (filters.clienteId && demand.cliente_id !== filters.clienteId) {
        return false;
      }

      // Assignee filter
      if (filters.responsavelId && demand.responsavel_id !== filters.responsavelId) {
        return false;
      }

      // Priority filter
      if (filters.prioridade && demand.prioridade !== filters.prioridade) {
        return false;
      }

      // Piece Type filter
      if (filters.tipo && demand.tipo !== filters.tipo) {
        return false;
      }

      // Due date status filter
      if (filters.prazoStatus !== 'todos') {
        if (!demand.prazo) {
          if (filters.prazoStatus !== 'sem_prazo') return false;
        } else {
          if (filters.prazoStatus === 'atrasados' && (demand.prazo >= todayStr || isEtapaFinal(demand.etapa_id))) {
            return false;
          }
          if (filters.prazoStatus === 'hoje' && demand.prazo !== todayStr) {
            return false;
          }
          if (filters.prazoStatus === 'semana' && (demand.prazo < todayStr || demand.prazo > nextWeekStr)) {
            return false;
          }
          if (filters.prazoStatus === 'sem_prazo') {
            return false;
          }
        }
      }

      return true;
    });
  }, [demands, filters, clients]);

  // CRUD Operations
  const addDemand = (data: Partial<Demand>): Demand => {
    const newId = `dem_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const defaultStageId = stages[0]?.id || 'stage_ideias';

    const newDemand: Demand = {
      id: newId,
      titulo: data.titulo || 'Nova Demanda',
      descricao: data.descricao || '',
      briefing: data.briefing || {},
      cliente_id: data.cliente_id || clients[0]?.id || '',
      tipo: data.tipo || 'post',
      prioridade: data.prioridade || 'media',
      responsavel_id: data.responsavel_id || currentUser.id,
      etapa_id: data.etapa_id || defaultStageId,
      prazo: data.prazo || new Date().toISOString().split('T')[0],
      hora_agendamento: data.hora_agendamento || '',
      checklist: data.checklist || [],
      comentarios: data.comentarios || [],
      historico: [
        {
          id: `log_${Date.now()}`,
          autor_id: currentUser.id,
          acao: 'criado',
          detalhe: `Demanda criada por ${currentUser.nome}`,
          timestamp: nowIso,
        },
      ],
      tags: data.tags || [],
      criado_em: nowIso,
      atualizado_em: nowIso,
    };

    setDemands((prev) => [newDemand, ...prev]);
    return newDemand;
  };

  const updateDemand = (id: string, updates: Partial<Demand>) => {
    setDemands((prev) =>
      prev.map((dem) => {
        if (dem.id !== id) return dem;
        const nowIso = new Date().toISOString();

        // Check if stage changed
        const history = [...(dem.historico || [])];
        if (updates.etapa_id && updates.etapa_id !== dem.etapa_id) {
          const fromStage = getStageById(dem.etapa_id)?.nome || dem.etapa_id;
          const toStage = getStageById(updates.etapa_id)?.nome || updates.etapa_id;
          history.push({
            id: `log_${Date.now()}`,
            autor_id: currentUser.id,
            acao: 'movido',
            detalhe: `Movido de "${fromStage}" para "${toStage}" por ${currentUser.nome}`,
            timestamp: nowIso,
          });
        }

        // Check if responsible changed (e.g. from Videomaker capture to Video Editor)
        if (updates.responsavel_id && updates.responsavel_id !== dem.responsavel_id) {
          const prevUser = getUserById(dem.responsavel_id)?.nome || 'Sem responsável';
          const nextUser = getUserById(updates.responsavel_id)?.nome || 'Novo responsável';
          history.push({
            id: `log_${Date.now() + 1}`,
            autor_id: currentUser.id,
            acao: 'atualizado',
            detalhe: `Responsável transferido de "${prevUser}" para "${nextUser}" por ${currentUser.nome}`,
            timestamp: nowIso,
          });
        }

        return {
          ...dem,
          ...updates,
          historico: history,
          atualizado_em: nowIso,
        };
      })
    );
  };

  const moveDemand = (demandId: string, targetStageId: string, newIndex?: number) => {
    setDemands((prev) => {
      const demand = prev.find((d) => d.id === demandId);
      if (!demand) return prev;

      const fromStage = getStageById(demand.etapa_id)?.nome || demand.etapa_id;
      const toStage = getStageById(targetStageId)?.nome || targetStageId;
      const nowIso = new Date().toISOString();

      const updatedHistory = [...(demand.historico || [])];
      if (demand.etapa_id !== targetStageId) {
        updatedHistory.push({
          id: `log_${Date.now()}`,
          autor_id: currentUser.id,
          acao: isEtapaFinal(targetStageId) ? 'concluido' : 'movido',
          detalhe: `Movido para "${toStage}" por ${currentUser.nome}`,
          timestamp: nowIso,
        });
      }

      const updatedDemand: Demand = {
        ...demand,
        etapa_id: targetStageId,
        historico: updatedHistory,
        atualizado_em: nowIso,
      };

      const withoutMoved = prev.filter((d) => d.id !== demandId);
      
      if (typeof newIndex === 'number' && newIndex >= 0) {
        // Items currently belonging to target stage
        const targetStageItems = withoutMoved.filter((d) => d.etapa_id === targetStageId);
        const clampedIndex = Math.max(0, Math.min(newIndex, targetStageItems.length));

        if (targetStageItems.length === 0) {
          return [updatedDemand, ...withoutMoved];
        }

        if (clampedIndex < targetStageItems.length) {
          const refItem = targetStageItems[clampedIndex];
          const refIndexInAll = withoutMoved.findIndex((d) => d.id === refItem.id);
          const result = [...withoutMoved];
          result.splice(refIndexInAll, 0, updatedDemand);
          return result;
        } else {
          const lastItem = targetStageItems[targetStageItems.length - 1];
          const lastIndexInAll = withoutMoved.findIndex((d) => d.id === lastItem.id);
          const result = [...withoutMoved];
          result.splice(lastIndexInAll + 1, 0, updatedDemand);
          return result;
        }
      }

      return [updatedDemand, ...withoutMoved];
    });
  };

  const deleteDemand = (id: string) => {
    setDemands((prev) => prev.filter((d) => d.id !== id));
    if (selectedDemandId === id) {
      setSelectedDemandId(null);
    }
  };

  const duplicateDemand = (id: string) => {
    const original = demands.find((d) => d.id === id);
    if (!original) return;
    const nowIso = new Date().toISOString();

    const clone: Demand = {
      ...original,
      id: `dem_${Date.now()}`,
      titulo: `${original.titulo} (Cópia)`,
      checklist: original.checklist.map((c) => ({ ...c, id: `chk_${Date.now()}_${Math.random()}` })),
      comentarios: [],
      historico: [
        {
          id: `log_${Date.now()}`,
          autor_id: currentUser.id,
          acao: 'criado',
          detalhe: `Duplicado a partir de "${original.titulo}"`,
          timestamp: nowIso,
        },
      ],
      criado_em: nowIso,
      atualizado_em: nowIso,
    };

    setDemands((prev) => [clone, ...prev]);
  };

  const addComment = (demandId: string, texto: string) => {
    if (!texto.trim()) return;
    const newComment = {
      id: `com_${Date.now()}`,
      autor_id: currentUser.id,
      texto: texto.trim(),
      criado_em: new Date().toISOString(),
    };

    setDemands((prev) =>
      prev.map((dem) => {
        if (dem.id !== demandId) return dem;
        return {
          ...dem,
          comentarios: [...(dem.comentarios || []), newComment],
          atualizado_em: new Date().toISOString(),
        };
      })
    );
  };

  const toggleChecklistItem = (demandId: string, itemId: string) => {
    setDemands((prev) =>
      prev.map((dem) => {
        if (dem.id !== demandId) return dem;
        const newChecklist = dem.checklist.map((item) => {
          if (item.id !== itemId) return item;
          return { ...item, concluido: !item.concluido };
        });
        return {
          ...dem,
          checklist: newChecklist,
          atualizado_em: new Date().toISOString(),
        };
      })
    );
  };

  const addChecklistItem = (demandId: string, texto: string) => {
    if (!texto.trim()) return;
    const newItem = {
      id: `chk_${Date.now()}`,
      texto: texto.trim(),
      concluido: false,
    };

    setDemands((prev) =>
      prev.map((dem) => {
        if (dem.id !== demandId) return dem;
        return {
          ...dem,
          checklist: [...(dem.checklist || []), newItem],
          atualizado_em: new Date().toISOString(),
        };
      })
    );
  };

  const deleteChecklistItem = (demandId: string, itemId: string) => {
    setDemands((prev) =>
      prev.map((dem) => {
        if (dem.id !== demandId) return dem;
        return {
          ...dem,
          checklist: dem.checklist.filter((item) => item.id !== itemId),
          atualizado_em: new Date().toISOString(),
        };
      })
    );
  };

  // Client CRUD
  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli_${Date.now()}`,
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return; // Don't delete last user
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser.id === id) {
      const nextUser = users.find((u) => u.id !== id);
      if (nextUser) setCurrentUser(nextUser);
    }
  };

  // Stage CRUD
  const addStage = (stageData: Omit<Stage, 'id' | 'ordem'>) => {
    const newStage: Stage = {
      ...stageData,
      id: `stage_${Date.now()}`,
      ordem: stages.length + 1,
    };
    setStages((prev) => {
      if (newStage.e_etapa_final) {
        return [...prev.map((s) => ({ ...s, e_etapa_final: false })), newStage];
      }
      return [...prev, newStage];
    });
    return newStage;
  };

  const updateStage = (id: string, updates: Partial<Stage>) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, ...updates };
        }
        if (updates.e_etapa_final) {
          return { ...s, e_etapa_final: false };
        }
        return s;
      })
    );
  };

  const deleteStage = (id: string) => {
    if (stages.length <= 1) return;
    const stageToDelete = stages.find((s) => s.id === id);
    let remaining = stages.filter((s) => s.id !== id);
    // Reassign demands from deleted stage to the first stage
    const fallbackStageId = remaining[0].id;
    setDemands((prev) =>
      prev.map((d) => (d.etapa_id === id ? { ...d, etapa_id: fallbackStageId } : d))
    );
    
    // If deleted stage was final, or if no remaining stage is final, mark the new last stage as final
    const hasFinal = remaining.some((s) => s.e_etapa_final);
    if (stageToDelete?.e_etapa_final || !hasFinal) {
      const sorted = [...remaining].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      const lastStage = sorted[sorted.length - 1];
      remaining = remaining.map((s) => ({
        ...s,
        e_etapa_final: s.id === lastStage.id,
      }));
    }

    setStages(remaining);
  };

  const reorderStages = (newStages: Stage[]) => {
    const withUpdatedOrder = newStages.map((s, idx) => ({ ...s, ordem: idx + 1 }));
    setStages(withUpdatedOrder);
  };

  // Reset defaults
  const resetToDefaults = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo padrão? Todas as alterações manuais serão resetadas.')) {
      setStages(INITIAL_STAGES);
      setClients(INITIAL_CLIENTS);
      setUsers(INITIAL_USERS);
      setDemands(INITIAL_DEMANDS);
      setCurrentUser(INITIAL_USERS[0]);
      setFilters(initialFilters);
      localStorage.clear();
    }
  };

  // Export JSON
  const exportDataJson = () => {
    const dataToExport = {
      stages,
      clients,
      users,
      demands,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agencia_demandas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.demands) && Array.isArray(parsed.stages)) {
        setStages(parsed.stages);
        setClients(parsed.clients || INITIAL_CLIENTS);
        setUsers(parsed.users || INITIAL_USERS);
        setDemands(parsed.demands);
        if (parsed.users && parsed.users[0]) {
          setCurrentUser(parsed.users[0]);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <DemandContext.Provider
      value={{
        demands,
        stages,
        clients,
        users,
        currentUser,
        setCurrentUser,
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
        isAiModalOpen,
        setIsAiModalOpen,
        addDemand,
        updateDemand,
        moveDemand,
        deleteDemand,
        duplicateDemand,
        addComment,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
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
        resetToDefaults,
        exportDataJson,
        importDataJson,
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
