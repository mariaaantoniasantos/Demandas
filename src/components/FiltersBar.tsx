import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  Filter,
  User,
  Building2,
  AlertTriangle,
  Layers,
  Calendar,
  Check,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { PIECE_TYPE_CONFIG, PRIORITY_CONFIG } from '../data/constants';

export const FiltersBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    clients,
    users,
    currentUser,
    activeFiltersCount,
    filteredDemands,
    demands,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';
  const isMyDemandsActive = filters.responsavelId === currentUser.id;

  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const filtersPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersPanelRef.current && !filtersPanelRef.current.contains(event.target as Node)) {
        setIsFiltersPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMyDemands = () => {
    setFilters((prev) => ({
      ...prev,
      responsavelId: isMyDemandsActive ? '' : currentUser.id,
    }));
  };

  const selectClasses = (active: boolean) =>
    `w-full py-2 pl-2.5 pr-7 text-xs rounded-xl border font-medium focus:outline-none focus:ring-1 focus:ring-indigo-400/50 appearance-none cursor-pointer backdrop-blur-md transition-all ${
      isDark
        ? active
          ? 'border-indigo-400/60 text-indigo-200 bg-indigo-500/20'
          : 'bg-[#13131a] border-white/10 text-slate-300 hover:bg-white/[0.08]'
        : active
          ? 'border-indigo-300 text-indigo-700 bg-indigo-50 shadow-xs'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
    }`;

  return (
    <div
      className={`border-b py-3 sticky top-16 z-20 backdrop-blur-xl transition-colors duration-200 ${
        isDark
          ? 'bg-[#0a0a0c]/60 border-white/10 shadow-md shadow-black/20 text-slate-100'
          : 'bg-white/70 border-slate-200/80 shadow-xs text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Left Side: Search + Minhas Demandas + Filtros */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">

            {/* Search Input */}
            <div className="relative min-w-[200px] sm:w-64">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                id="search-demands-input"
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Buscar por título, briefing..."
                className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border backdrop-blur-md transition-all focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.08]'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-indigo-400'
                }`}
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* "Minhas Demandas" Quick Toggle */}
            <button
              id="filter-my-demands-btn"
              onClick={toggleMyDemands}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                isMyDemandsActive
                  ? isDark
                    ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-sm'
                    : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs font-bold'
                  : isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-300 hover:bg-white/[0.09] hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: currentUser.cor_avatar }}
              >
                {currentUser.nome.charAt(0)}
              </div>
              <span>Minhas Demandas</span>
              {isMyDemandsActive && <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300 ml-0.5" />}
            </button>

            {/* Grouped "Filtros" Dropdown: Cliente, Time, Prioridade, Tipo de Peça, Prazo */}
            <div className="relative" ref={filtersPanelRef}>
              <button
                id="filters-panel-btn"
                onClick={() => setIsFiltersPanelOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                  isFiltersPanelOpen || activeFiltersCount > 0
                    ? isDark
                      ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-sm'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs font-bold'
                    : isDark
                      ? 'bg-white/[0.05] border-white/10 text-slate-300 hover:bg-white/[0.09] hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {isFiltersPanelOpen && (
                <div
                  className={`absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 backdrop-blur-2xl rounded-2xl shadow-2xl border p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-3 ${
                    isDark
                      ? 'bg-[#121218]/95 border-white/15 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Filtros Avançados
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className={`text-[11px] font-semibold ${isDark ? 'text-rose-300 hover:text-rose-200' : 'text-rose-600 hover:text-rose-700'}`}
                      >
                        Limpar tudo
                      </button>
                    )}
                  </div>

                  {/* Cliente */}
                  <div className="relative">
                    <select
                      id="filter-client-select"
                      value={filters.clienteId}
                      onChange={(e) => setFilters((prev) => ({ ...prev, clienteId: e.target.value }))}
                      aria-label="Filtrar por cliente"
                      className={selectClasses(Boolean(filters.clienteId))}
                    >
                      <option value="" className={isDark ? 'bg-[#13131a] text-slate-300' : 'bg-white text-slate-700'}>
                        Todos os Clientes
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id} className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                    <Building2 className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>

                  {/* Time / Responsável */}
                  <div className="relative">
                    <select
                      id="filter-assignee-select"
                      value={filters.responsavelId}
                      onChange={(e) => setFilters((prev) => ({ ...prev, responsavelId: e.target.value }))}
                      aria-label="Filtrar por responsável"
                      className={selectClasses(Boolean(filters.responsavelId))}
                    >
                      <option value="" className={isDark ? 'bg-[#13131a] text-slate-300' : 'bg-white text-slate-700'}>
                        Todo o Time
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id} className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                          {u.nome} ({u.papel === 'designer' ? 'Designer' : u.papel === 'social_media' ? 'Social' : u.papel === 'videomaker' ? 'Videomaker' : 'Gerente'})
                        </option>
                      ))}
                    </select>
                    <User className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>

                  {/* Prioridade */}
                  <div className="relative">
                    <select
                      id="filter-priority-select"
                      value={filters.prioridade}
                      onChange={(e) => setFilters((prev) => ({ ...prev, prioridade: e.target.value }))}
                      aria-label="Filtrar por prioridade"
                      className={selectClasses(Boolean(filters.prioridade))}
                    >
                      <option value="" className={isDark ? 'bg-[#13131a] text-slate-300' : 'bg-white text-slate-700'}>
                        Prioridade
                      </option>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key} className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                    <AlertTriangle className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>

                  {/* Tipo de Peça */}
                  <div className="relative">
                    <select
                      id="filter-piecetype-select"
                      value={filters.tipo}
                      onChange={(e) => setFilters((prev) => ({ ...prev, tipo: e.target.value }))}
                      aria-label="Filtrar por tipo de peça"
                      className={selectClasses(Boolean(filters.tipo))}
                    >
                      <option value="" className={isDark ? 'bg-[#13131a] text-slate-300' : 'bg-white text-slate-700'}>
                        Tipo de Peça
                      </option>
                      {Object.entries(PIECE_TYPE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key} className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                    <Layers className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>

                  {/* Prazo */}
                  <div className="relative">
                    <select
                      id="filter-deadline-select"
                      value={filters.prazoStatus}
                      onChange={(e) => setFilters((prev) => ({ ...prev, prazoStatus: e.target.value as any }))}
                      aria-label="Filtrar por status do prazo"
                      className={selectClasses(filters.prazoStatus !== 'todos')}
                    >
                      <option value="todos" className={isDark ? 'bg-[#13131a] text-slate-300' : 'bg-white text-slate-700'}>
                        Todos os Prazos
                      </option>
                      <option value="atrasados" className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                        ⚠️ Atrasados
                      </option>
                      <option value="hoje" className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                        🎯 Entrega Hoje
                      </option>
                      <option value="semana" className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                        📅 Esta Semana
                      </option>
                      <option value="sem_prazo" className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                        Sem Prazo
                      </option>
                    </select>
                    <Calendar className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Results info & Clear filters */}
          <div className={`flex items-center gap-3 shrink-0 self-end lg:self-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>
              Exibindo <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>{filteredDemands.length}</strong> de{' '}
              {demands.length} demandas
            </span>

            {activeFiltersCount > 0 && (
              <button
                id="clear-filters-btn"
                onClick={resetFilters}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md transition-colors ${
                  isDark
                    ? 'text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40'
                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar filtros ({activeFiltersCount})</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
