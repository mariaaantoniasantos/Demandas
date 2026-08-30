import React, { useState, useRef, useEffect } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Calendar,
  Users,
  Plus,
  Settings,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { USER_ROLE_CONFIG } from '../data/constants';
import { ViewMode } from '../types';
import { getInitials } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    demands,
    currentUser,
    setCurrentUser,
    users,
    isEtapaFinal,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    openNewDemandModal,
    setIsClientModalOpen,
    setIsTeamModalOpen,
    setIsStageModalOpen,
    setIsAiModalOpen,
    resetToDefaults,
    exportDataJson,
    importDataJson,
  } = useDemands();

  const isDark = theme === 'dark';

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
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
  const inProduction = demands.filter((d) => d.etapa_id === 'stage_producao');
  const inApproval = demands.filter((d) => d.etapa_id === 'stage_aprovacao');
  const overdueDemands = demands.filter(
    (d) => d.prazo && d.prazo < todayStr && !isEtapaFinal(d.etapa_id)
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar arquivo JSON. Verifique a estrutura.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? 'bg-[#0a0a0c]/80 border-white/10 shadow-lg shadow-black/40 text-slate-100'
          : 'bg-white/85 border-slate-200 shadow-sm shadow-slate-200/60 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
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
              <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gestão de Demandas • Design, Vídeo & Social Media
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Middle) */}
          <div
            className={`hidden lg:flex items-center gap-2 backdrop-blur-md p-1.5 rounded-xl border text-xs ${
              isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100/90 border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                isDark
                  ? 'bg-white/[0.08] border-white/10 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ativas:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeDemands.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-blue-500 dark:text-blue-300 bg-blue-500/15 border border-blue-500/30 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Produção:</span>
              <span className="font-bold text-blue-600 dark:text-blue-200">{inProduction.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-purple-500 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Aprovação:</span>
              <span className="font-bold text-purple-600 dark:text-purple-200">{inApproval.length}</span>
            </div>
            {overdueDemands.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-red-500 dark:text-red-300 bg-red-500/20 border border-red-500/40 font-medium animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span>Atrasadas:</span>
                <span className="font-bold text-red-600 dark:text-red-200">{overdueDemands.length}</span>
              </div>
            )}
          </div>

          {/* Right Actions & Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
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
                <span className="hidden sm:inline">Quadro</span>
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
                <span className="hidden sm:inline">Lista</span>
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
                <span className="hidden sm:inline">Calendário</span>
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
                <span className="hidden md:inline">Carga Equipe</span>
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

            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={personaMenuRef}>
              <button
                id="persona-switcher-btn"
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-left transition-all text-xs backdrop-blur-md ${
                  isDark
                    ? 'border-white/10 bg-white/[0.05] hover:bg-white/[0.09]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
                }`}
                title="Trocar usuário ativo para testar a experiência"
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
                <ChevronDown className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>

              {isPersonaMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 backdrop-blur-2xl rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                    isDark
                      ? 'bg-[#121218]/95 border-white/15 text-slate-100'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
                  }`}
                >
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Visualizar como (Persona)
                    </p>
                  </div>
                  <div className="py-1">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setIsPersonaMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                          currentUser.id === user.id
                            ? isDark
                              ? 'bg-indigo-500/20 font-semibold text-white'
                              : 'bg-indigo-50 font-semibold text-indigo-900'
                            : isDark
                              ? 'hover:bg-white/10 text-slate-200'
                              : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: user.cor_avatar }}
                        >
                          {getInitials(user.nome)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.nome}</p>
                          <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-medium ${USER_ROLE_CONFIG[user.papel].badge}`}>
                            {USER_ROLE_CONFIG[user.papel].label}
                          </span>
                        </div>
                        {currentUser.id === user.id && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Settings & Management Menu */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                id="settings-menu-btn"
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className={`p-2 rounded-xl border backdrop-blur-md transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
                title="Configurações e Gestão da Agência"
              >
                <Settings className="w-4 h-4" />
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
                      toggleTheme();
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-500" />
                      )}
                      <span>{isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Noturno'}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {isDark ? 'Escuro' : 'Claro'}
                    </span>
                  </button>

                  <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                  
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

                  <button
                    onClick={() => {
                      setIsAiModalOpen(true);
                      setIsSettingsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/15 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/25 transition-colors font-medium border-y border-indigo-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                    <span>Assistente de Briefing & Copy</span>
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

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsSettingsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Importar Backup (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToDefaults();
                      setIsSettingsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/15 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <span>Restaurar Dados Padrão</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

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
