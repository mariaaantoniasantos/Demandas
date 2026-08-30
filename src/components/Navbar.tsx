import React, { useState, useRef, useEffect } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Calendar,
  Users,
  Plus,
  Download,
  Building2,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { useAuth } from '../context/AuthContext';
import { USER_ROLE_CONFIG } from '../data/constants';
import { getInitials } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    demands,
    currentUser,
    isEtapaFinal,
    getStageById,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    openNewDemandModal,
    setIsClientModalOpen,
    setIsTeamModalOpen,
    setIsStageModalOpen,
    exportDataJson,
  } = useDemands();
  const { logout } = useAuth();

  const isDark = theme === 'dark';

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const activeDemands = demands.filter((d) => !isEtapaFinal(d.etapa_id));
  const inProduction = demands.filter((d) => getStageById(d.etapa_id)?.nome === 'Em Produção');
  const inApproval = demands.filter((d) => getStageById(d.etapa_id)?.nome === 'Aprovação Cliente');
  const overdueDemands = demands.filter(
    (d) => d.prazo && d.prazo < todayStr && !isEtapaFinal(d.etapa_id)
  );

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? 'bg-[#0a0a0c]/80 border-white/10 shadow-lg shadow-black/40 text-slate-100'
          : 'bg-white/85 border-slate-200 shadow-sm shadow-slate-200/60 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 py-2.5 sm:h-16 sm:py-0">
          
          {/* Logo & Agency Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 border border-white/20 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-lg leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  StudioFlow
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30">
                  Agência
                </span>
              </div>
              <p className={`text-xs hidden md:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gestão de Demandas • Design, Vídeo & Social Media
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Middle) */}
          <div
            className={`hidden lg:flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs ${
              isDark ? 'bg-white/[0.03]' : 'bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ativas</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeDemands.length}</span>
            </div>
            <span className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Produção</span>
              <span className="font-bold text-blue-600 dark:text-blue-300">{inProduction.length}</span>
            </div>
            <span className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Aprovação</span>
              <span className="font-bold text-purple-600 dark:text-purple-300">{inApproval.length}</span>
            </div>
            {overdueDemands.length > 0 && (
              <>
                <span className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
                <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Atrasadas</span>
                  <span className="font-bold text-red-600 dark:text-red-300">{overdueDemands.length}</span>
                </div>
              </>
            )}
          </div>

          {/* Right Actions & Persona Switcher */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
            
            {/* View Switchers */}
            <div
              className={`flex items-center backdrop-blur-md p-1 rounded-xl border ${
                isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                id="view-btn-kanban"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? isDark
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Visualização em Quadro Kanban"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Quadro</span>
              </button>

              <button
                id="view-btn-table"
                onClick={() => setViewMode('tabela')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'tabela'
                    ? isDark
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Visualização em Tabela / Lista"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Lista</span>
              </button>

              <button
                id="view-btn-calendar"
                onClick={() => setViewMode('calendario')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'calendario'
                    ? isDark
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Visualização em Calendário"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Calendário</span>
              </button>

              <button
                id="view-btn-team"
                onClick={() => setViewMode('equipe')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === 'equipe'
                    ? isDark
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Carga de Trabalho da Equipe"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Carga Equipe</span>
              </button>
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={`flex items-center justify-center p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 hover:text-amber-200 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 shadow-xs'
              }`}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Noturno'}
              aria-label="Alternar Tema"
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Conta: Avatar + Menu de Configurações e Gestão */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                id="account-menu-btn"
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-left text-xs backdrop-blur-md transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/[0.05] hover:bg-white/[0.09]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
                }`}
                title={`Logado como ${currentUser.nome}`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-sm"
                  style={{ backgroundColor: currentUser.cor_avatar }}
                >
                  {getInitials(currentUser.nome)}
                </div>
                <div className="hidden xl:block">
                  <div className={`font-semibold text-xs leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {currentUser.nome.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {USER_ROLE_CONFIG[currentUser.papel].label}
                  </div>
                </div>
              </button>

              {isSettingsMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-60 backdrop-blur-2xl rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    isDark
                      ? 'bg-[#121218]/95 border-white/15 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
                  }`}
                >
                  <div className={`px-3 py-1.5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Gestão da Agência
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsClientModalOpen(true);
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>Gerenciar Clientes</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTeamModalOpen(true);
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                    <span>Gerenciar Equipe</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsStageModalOpen(true);
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Configurar Colunas (Etapas)</span>
                  </button>

                  <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>

                  <button
                    onClick={() => {
                      exportDataJson();
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Exportar Backup (JSON)</span>
                  </button>

                  <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />

                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      if (confirm('Deseja sair da sua conta?')) {
                        logout();
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-rose-300 hover:text-rose-200 hover:bg-rose-500/10' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button: Nova Demanda */}
            <button
              id="new-demand-primary-btn"
              onClick={() => openNewDemandModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Demanda</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
