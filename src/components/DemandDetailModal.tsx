import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  AlertTriangle,
  Layers,
  CheckSquare,
  MessageSquare,
  History,
  Copy,
  Trash2,
  Send,
  Plus,
  Edit2,
  ExternalLink,
  Tag,
  Check,
  Share2,
  FileText,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { DEFAULT_CHECKLIST_BY_TYPE, PIECE_TYPE_CONFIG, PRIORITY_CONFIG, USER_ROLE_CONFIG, VIDEO_ROUTINE_CHECKLIST } from '../data/constants';
import { PieceType, Priority } from '../types';
import {
  formatDateBR,
  formatMinutesToHours,
  formatRelativeDateBR,
  formatTimeAgo,
  formatTimeHM,
  getInitials,
  parseDurationToMinutes,
} from '../utils/formatters';
import { PieceTypeIcon } from './PieceTypeIcon';

export const DemandDetailModal: React.FC = () => {
  const {
    selectedDemandId,
    setSelectedDemandId,
    demands,
    stages,
    clients,
    users,
    currentUser,
    updateDemand,
    deleteDemand,
    duplicateDemand,
    addComment,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    activeTimer,
    startTimer,
    stopTimer,
    addManualApontamento,
    deleteApontamento,
    getApontamentosByDemand,
    getTotalMinutosByDemand,
    getClientById,
    getUserById,
    getStageById,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const demand = demands.find((d) => d.id === selectedDemandId);

  const [activeTab, setActiveTab] = useState<'briefing' | 'checklist' | 'comentarios' | 'historico' | 'horas'>('briefing');
  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [copiedBriefing, setCopiedBriefing] = useState(false);
  const [manualDuracao, setManualDuracao] = useState('');
  const [manualData, setManualData] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualError, setManualError] = useState('');
  const [, forceTick] = useState(0);

  // Sync title when opening
  useEffect(() => {
    if (demand) {
      setTitleInput(demand.titulo);
    }
  }, [demand?.id]);

  // Re-render every second while there is a timer running for this demand, to update the live counter
  const isTimerRunningHere = Boolean(
    activeTimer && demand && activeTimer.demandaId === demand.id && activeTimer.usuarioId === currentUser.id
  );
  useEffect(() => {
    if (!isTimerRunningHere) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunningHere]);

  if (!demand) return null;

  const client = getClientById(demand.cliente_id);
  const assignee = getUserById(demand.responsavel_id);
  const currentStage = getStageById(demand.etapa_id);
  const priorityConfig = PRIORITY_CONFIG[demand.prioridade];
  const pieceConfig = PIECE_TYPE_CONFIG[demand.tipo] || PIECE_TYPE_CONFIG.post;
  const deadlineInfo = formatRelativeDateBR(demand.prazo);

  const totalChecklist = demand.checklist?.length || 0;
  const completedChecklist = demand.checklist?.filter((c) => c.concluido).length || 0;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const demandApontamentos = getApontamentosByDemand(demand.id);
  const totalMinutosDemand = getTotalMinutosByDemand(demand.id);
  const timerElapsedMinutes = isTimerRunningHere && activeTimer
    ? Math.floor((Date.now() - new Date(activeTimer.inicio).getTime()) / 60000)
    : 0;
  const isTimerRunningElsewhere = Boolean(activeTimer && !isTimerRunningHere && activeTimer.usuarioId === currentUser.id);

  const handleStartTimer = () => startTimer(demand.id);
  const handleStopTimer = () => stopTimer();

  const handleAddManualApontamento = (e: React.FormEvent) => {
    e.preventDefault();
    const minutos = parseDurationToMinutes(manualDuracao);
    if (!minutos) {
      setManualError('Informe uma duração válida (ex: 2h30, 1:30 ou 90).');
      return;
    }
    setManualError('');
    addManualApontamento(demand.id, minutos, manualData);
    setManualDuracao('');
  };

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput !== demand.titulo) {
      updateDemand(demand.id, { titulo: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(demand.id, commentText);
    setCommentText('');
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(demand.id, newChecklistText);
    setNewChecklistText('');
  };

  const handleApplyStandardChecklist = () => {
    const standardItems = DEFAULT_CHECKLIST_BY_TYPE[demand.tipo] || DEFAULT_CHECKLIST_BY_TYPE.video;
    const currentTexts = new Set((demand.checklist || []).map((c) => c.texto.toLowerCase()));
    
    // Add missing standard steps
    const newItems = [...(demand.checklist || [])];
    standardItems.forEach((text) => {
      if (!currentTexts.has(text.toLowerCase())) {
        newItems.push({
          id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          texto: text,
          concluido: false,
        });
      }
    });

    updateDemand(demand.id, { checklist: newItems });
  };

  const handleTypeChangeInDetail = (newTipo: PieceType) => {
    if ((newTipo === 'video' || newTipo === 'reels') && (!demand.checklist || demand.checklist.length === 0)) {
      const standardItems = DEFAULT_CHECKLIST_BY_TYPE[newTipo] || DEFAULT_CHECKLIST_BY_TYPE.video;
      updateDemand(demand.id, {
        tipo: newTipo,
        checklist: standardItems.map((texto) => ({
          id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          texto,
          concluido: false,
        })),
      });
    } else {
      updateDemand(demand.id, { tipo: newTipo });
    }
  };

  const handleCopyBriefing = () => {
    const textToCopy = `📋 DEMANDA: ${demand.titulo}
Cliente: ${client?.nome || 'N/A'}
Tipo: ${pieceConfig.label}
Prioridade: ${priorityConfig.label}
Prazo: ${formatDateBR(demand.prazo)} ${demand.hora_agendamento ? `às ${demand.hora_agendamento}` : ''}
Responsável: ${assignee?.nome || 'N/A'}

📝 Descrição / Objetivo:
${demand.descricao || 'Sem descrição'}

${demand.briefing?.copy_sugestao ? `✍️ Sugestão de Copy:\n${demand.briefing.copy_sugestao}\n` : ''}
${demand.briefing?.referencias ? `🎨 Referências Visuais:\n${demand.briefing.referencias}\n` : ''}
${demand.briefing?.link_drive ? `🔗 Link Drive / Arquivos: ${demand.briefing.link_drive}\n` : ''}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={() => setSelectedDemandId(null)}
    >
      <div
        id="demand-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0e1017]/95 border-white/10 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        
        {/* Modal Top Bar */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Client Pill */}
            {client && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border backdrop-blur-md shadow-xs ${
                isDark ? 'bg-white/[0.05] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: client.cor_identificacao }}
                />
                <span>{client.nome}</span>
              </span>
            )}

            {/* Piece Type Pill */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border backdrop-blur-xs ${pieceConfig.badgeClass}`}>
              <PieceTypeIcon tipo={demand.tipo} className="w-3.5 h-3.5" />
              <span>{pieceConfig.label}</span>
            </span>

            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-xs ${priorityConfig.bgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
              <span>{priorityConfig.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyBriefing}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border backdrop-blur-md transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white'
              }`}
              title="Copiar briefing completo para a área de transferência"
            >
              {copiedBriefing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBriefing ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={() => {
                duplicateDemand(demand.id);
                alert('Demanda duplicada com sucesso!');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Duplicar demanda"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDemandId(null)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Modal Main Content (2 Columns: Left content, Right metadata) */}
        <div className={`flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x custom-scrollbar ${
          isDark ? 'divide-white/10' : 'divide-slate-200'
        }`}>
          
          {/* Left Column (8 cols): Title, Stage Pipeline, Tabs & Details */}
          <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col gap-5">
            
            {/* Title Section (Editable) */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className={`w-full text-lg font-bold px-3 py-1.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'text-slate-100 bg-white/[0.05] border-indigo-400/80'
                        : 'text-slate-900 bg-white border-indigo-500'
                    }`}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2 group">
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className={`text-lg sm:text-xl font-bold cursor-pointer transition-colors leading-snug ${
                      isDark ? 'text-slate-100 hover:text-indigo-400' : 'text-slate-900 hover:text-indigo-600'
                    }`}
                    title="Clique para editar o título"
                  >
                    {demand.titulo}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity shrink-0 cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stage Progress Stepper (Click to move stage) */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Etapa do Fluxo (clique para mover):
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {stages.map((stage, idx) => {
                  const isCurrent = stage.id === demand.etapa_id;
                  const isPassed =
                    stages.findIndex((s) => s.id === demand.etapa_id) > idx;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => updateDemand(demand.id, { etapa_id: stage.id })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : isPassed
                          ? isDark
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : isDark
                          ? 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08] hover:text-slate-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shadow-xs"
                        style={{ backgroundColor: stage.cor }}
                      />
                      <span>{stage.nome}</span>
                      {isPassed && <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Tabs (Briefing, Checklist, Comentários, Histórico) */}
            <div className={`border-b flex items-center gap-4 text-xs font-semibold ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setActiveTab('briefing')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'briefing'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Briefing & Descrição</span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'checklist'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Checklist ({completedChecklist}/{totalChecklist})</span>
              </button>

              <button
                onClick={() => setActiveTab('comentarios')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'comentarios'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comentários ({demand.comentarios?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'historico'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
              </button>

              <button
                onClick={() => setActiveTab('horas')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'horas'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Horas ({formatMinutesToHours(totalMinutosDemand)})</span>
              </button>
            </div>

            {/* TAB 1: BRIEFING & DETALHES */}
            {activeTab === 'briefing' && (
              <div className="space-y-4">
                
                {/* General Description */}
                <div>
                  <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Descrição / Contexto Geral:
                  </label>
                  <textarea
                    rows={3}
                    value={demand.descricao || ''}
                    onChange={(e) => updateDemand(demand.id, { descricao: e.target.value })}
                    placeholder="Descreva o propósito da peça, detalhes importantes..."
                    className={`w-full text-xs sm:text-sm p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition-all leading-relaxed ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Structured Briefing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Objetivo da Peça:
                    </label>
                    <input
                      type="text"
                      value={demand.briefing?.objetivo || ''}
                      onChange={(e) =>
                        updateDemand(demand.id, {
                          briefing: { ...demand.briefing, objetivo: e.target.value },
                        })
                      }
                      placeholder="Ex: Engajamento, Vendas, Alcance..."
                      className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                        isDark
                          ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Formato / Dimensões:
                    </label>
                    <input
                      type="text"
                      value={demand.briefing?.formato || ''}
                      onChange={(e) =>
                        updateDemand(demand.id, {
                          briefing: { ...demand.briefing, formato: e.target.value },
                        })
                      }
                      placeholder="Ex: 1080x1350, 9:16, 5 lâminas..."
                      className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                        isDark
                          ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Copy / Legenda / Roteiro */}
                <div>
                  <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Copy Sugerida / Roteiro / Legenda (Social Media):
                  </label>
                  <textarea
                    rows={4}
                    value={demand.briefing?.copy_sugestao || ''}
                    onChange={(e) =>
                      updateDemand(demand.id, {
                        briefing: { ...demand.briefing, copy_sugestao: e.target.value },
                      })
                    }
                    placeholder="Cole aqui a copy dos slides, legendas, títulos ou roteiro do vídeo..."
                    className={`w-full text-xs sm:text-sm p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition-all font-mono text-[12px] leading-relaxed ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* References & Drive Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Referências Visuais / Estilo:
                    </label>
                    <input
                      type="text"
                      value={demand.briefing?.referencias || ''}
                      onChange={(e) =>
                        updateDemand(demand.id, {
                          briefing: { ...demand.briefing, referencias: e.target.value },
                        })
                      }
                      placeholder="Ex: Minimalista, tons pastéis, tipografia bold..."
                      className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                        isDark
                          ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Link Google Drive / Arquivos:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={demand.briefing?.link_drive || ''}
                        onChange={(e) =>
                          updateDemand(demand.id, {
                            briefing: { ...demand.briefing, link_drive: e.target.value },
                          })
                        }
                        placeholder="https://drive.google.com/..."
                        className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                          isDark
                            ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      {demand.briefing?.link_drive && (
                        <a
                          href={demand.briefing.link_drive}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                            isDark ? 'bg-white/10 hover:bg-white/15 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Abrir link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CHECKLIST */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                
                {/* Video routine banner for video / reels */}
                {(demand.tipo === 'video' || demand.tipo === 'reels') && (
                  <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 backdrop-blur-md ${
                    isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-start sm:items-center gap-2">
                      <span className="text-base shrink-0">🎬</span>
                      <div>
                        <p className="font-bold">Rotina de Vídeo & Videomaker</p>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
                          Passos essenciais: Roteiro, Captação, Takes, Edição, Corte, Áudio e Exportação.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyStandardChecklist}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] shrink-0 transition-colors cursor-pointer border ${
                        isDark
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-200'
                          : 'bg-white hover:bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                      }`}
                    >
                      Preencher passos padrão
                    </button>
                  </div>
                )}

                {/* Progress bar */}
                <div className={`p-3.5 rounded-xl border backdrop-blur-md ${
                  isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>Progresso das subtarefas</span>
                    <div className="flex items-center gap-3">
                      {demand.tipo !== 'video' && demand.tipo !== 'reels' && (
                        <button
                          type="button"
                          onClick={handleApplyStandardChecklist}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          + Sugerir padrão ({pieceConfig.label})
                        </button>
                      )}
                      <span className={checklistPercent === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-300'}>
                        {checklistPercent}% ({completedChecklist}/{totalChecklist})
                      </span>
                    </div>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${
                        checklistPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${checklistPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-2">
                  {demand.checklist?.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        item.concluido
                          ? isDark
                            ? 'bg-white/[0.02] border-white/[0.06] text-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          : isDark
                          ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:border-white/20'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 shadow-xs'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.concluido}
                          onChange={() => toggleChecklistItem(demand.id, item.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400/50 cursor-pointer"
                        />
                        <span className={`text-xs sm:text-sm ${item.concluido ? 'line-through opacity-70' : 'font-medium'}`}>
                          {item.texto}
                        </span>
                      </label>

                      <button
                        onClick={() => deleteChecklistItem(demand.id, item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {totalChecklist === 0 && (
                    <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nenhuma subtarefa adicionada ainda.
                    </p>
                  )}
                </div>

                {/* Add new checklist item form */}
                <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Adicionar subtarefa (ex: 'Exportar PNG 1080x1350')..."
                    className={`flex-1 text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </form>

              </div>
            )}

            {/* TAB 3: COMENTÁRIOS */}
            {activeTab === 'comentarios' && (
              <div className="space-y-4">
                
                {/* List of comments */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {demand.comentarios?.map((com) => {
                    const author = getUserById(com.autor_id);

                    return (
                      <div key={com.id} className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs backdrop-blur-xs ${
                        isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-xs"
                          style={{ backgroundColor: author?.cor_avatar || '#6366f1' }}
                        >
                          {getInitials(author?.nome || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {author?.nome || 'Usuário'}
                            </span>
                            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {formatTimeAgo(com.criado_em)}
                            </span>
                          </div>
                          <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {com.texto}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {(!demand.comentarios || demand.comentarios.length === 0) && (
                    <div className={`text-center py-6 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nenhum comentário ainda. Inicie a conversa abaixo!
                    </div>
                  )}
                </div>

                {/* New comment input */}
                <form onSubmit={handleAddComment} className={`flex flex-col gap-2 p-3.5 rounded-xl border backdrop-blur-md ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>Comentando como:</span>
                    <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentUser.cor_avatar }}
                      />
                      {currentUser.nome}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escreva um comentário ou feedback sobre a peça..."
                    className={`w-full text-xs sm:text-sm p-2.5 border rounded-xl transition-all resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Comentário</span>
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 4: HISTÓRICO */}
            {activeTab === 'historico' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {demand.historico?.map((log) => {
                  return (
                    <div key={log.id} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{log.detalhe}</span>
                      </div>
                      <span className={`text-[10px] shrink-0 ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 5: HORAS (Apontamento de Tempo) */}
            {activeTab === 'horas' && (
              <div className="space-y-4">

                {/* Total + Timer Control */}
                <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Total apontado nesta demanda
                    </p>
                    <p className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {formatMinutesToHours(totalMinutosDemand)}
                    </p>
                  </div>

                  {isTimerRunningHere ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-[10px] font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          Timer rodando desde {activeTimer && formatTimeHM(activeTimer.inicio)}
                        </p>
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {formatMinutesToHours(timerElapsedMinutes)} decorridos
                        </p>
                      </div>
                      <button
                        onClick={handleStopTimer}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Parar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={handleStartTimer}
                        disabled={isTimerRunningElsewhere}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Timer</span>
                      </button>
                      {isTimerRunningElsewhere && (
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Você já tem um timer rodando em outra demanda.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Manual entry form */}
                <form onSubmit={handleAddManualApontamento} className={`p-3.5 rounded-xl border backdrop-blur-md space-y-2.5 ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Lançar horas manualmente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      type="text"
                      value={manualDuracao}
                      onChange={(e) => setManualDuracao(e.target.value)}
                      placeholder="Duração (ex: 2h30, 1:30, 90)"
                      className={`text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                        isDark
                          ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <input
                      type="date"
                      value={manualData}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setManualData(e.target.value)}
                      className={`text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                        isDark
                          ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-white/[0.08]'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lançar</span>
                    </button>
                  </div>
                  {manualError && (
                    <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{manualError}</span>
                    </div>
                  )}
                </form>

                {/* List of apontamentos */}
                <div className="space-y-2">
                  {demandApontamentos.map((apontamento) => {
                    const author = getUserById(apontamento.usuario_id);
                    const canDelete = currentUser.id === apontamento.usuario_id || currentUser.papel === 'gerente';
                    return (
                      <div
                        key={apontamento.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-xs"
                            style={{ backgroundColor: author?.cor_avatar || '#6366f1' }}
                          >
                            {getInitials(author?.nome || '?')}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {author?.nome || 'Usuário'}
                              <span className={`ml-1.5 font-normal text-[10px] px-1.5 py-0.5 rounded ${
                                apontamento.tipo === 'timer'
                                  ? isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                                  : isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {apontamento.tipo === 'timer' ? 'Timer' : 'Manual'}
                              </span>
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {apontamento.tipo === 'timer' && apontamento.inicio
                                ? `${formatTimeHM(apontamento.inicio)} – ${apontamento.fim ? formatTimeHM(apontamento.fim) : '--:--'}`
                                : formatDateBR(apontamento.data_trabalho || '')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {formatMinutesToHours(apontamento.duracao_minutos)}
                          </span>
                          {canDelete && (
                            <button
                              onClick={() => deleteApontamento(apontamento.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                              title="Remover apontamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {demandApontamentos.length === 0 && (
                    <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Nenhum apontamento de horas registrado ainda.
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column (4 cols): Metadata & Controls Sidebar */}
          <div className={`lg:col-span-4 p-5 sm:p-6 space-y-4 ${
            isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'
          }`}>
            
            {/* Cliente */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Cliente:</span>
              </label>
              <select
                value={demand.cliente_id}
                onChange={(e) => updateDemand(demand.id, { cliente_id: e.target.value })}
                className={`w-full text-xs font-semibold p-2.5 border rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922]'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsável */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Responsável:</span>
              </label>
              <select
                value={demand.responsavel_id}
                onChange={(e) => updateDemand(demand.id, { responsavel_id: e.target.value })}
                className={`w-full text-xs font-semibold p-2.5 border rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922]'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {u.nome} ({USER_ROLE_CONFIG[u.papel].label})
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                <span>Prioridade:</span>
              </label>
              <select
                value={demand.prioridade}
                onChange={(e) => updateDemand(demand.id, { prioridade: e.target.value as Priority })}
                className={`w-full text-xs font-semibold p-2.5 border rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922]'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Peça */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Tipo de Peça:</span>
              </label>
              <select
                value={demand.tipo}
                onChange={(e) => handleTypeChangeInDetail(e.target.value as PieceType)}
                className={`w-full text-xs font-semibold p-2.5 border rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922]'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {Object.entries(PIECE_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prazo & Horário */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Data Prazo:</span>
                </label>
                <input
                  type="date"
                  value={demand.prazo || ''}
                  onChange={(e) => updateDemand(demand.id, { prazo: e.target.value })}
                  className={`w-full text-xs font-semibold p-2 border rounded-xl focus:outline-none ${
                    isDark
                      ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-white/[0.08]'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Horário:</span>
                </label>
                <input
                  type="time"
                  value={demand.hora_agendamento || ''}
                  onChange={(e) => updateDemand(demand.id, { hora_agendamento: e.target.value })}
                  className={`w-full text-xs font-semibold p-2 border rounded-xl focus:outline-none ${
                    isDark
                      ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-white/[0.08]'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Danger Zone: Delete */}
            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a demanda "${demand.titulo}"?`)) {
                    deleteDemand(demand.id);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Demanda</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
