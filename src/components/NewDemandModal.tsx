import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  User,
  Building2,
  AlertTriangle,
  FileText,
  CheckSquare,
  Check,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { DEMAND_TEMPLATES, DEFAULT_CHECKLIST_BY_TYPE, PIECE_TYPE_CONFIG, PRIORITY_CONFIG, USER_ROLE_CONFIG } from '../data/constants';
import { PieceType, Priority } from '../types';
import { PieceTypeIcon } from './PieceTypeIcon';

export const NewDemandModal: React.FC = () => {
  const {
    isNewDemandModalOpen,
    setIsNewDemandModalOpen,
    newDemandInitialStageId,
    stages,
    clients,
    users,
    currentUser,
    addDemand,
    setSelectedDemandId,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [etapaId, setEtapaId] = useState('');
  const [tipo, setTipo] = useState<PieceType>('post');
  const [prioridade, setPrioridade] = useState<Priority>('media');
  const [prazo, setPrazo] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistInput, setNewChecklistInput] = useState('');

  // Structured briefing
  const [objetivo, setObjetivo] = useState('');
  const [formato, setFormato] = useState('');
  const [copySugestao, setCopySugestao] = useState('');
  const [referencias, setReferencias] = useState('');
  const [linkDrive, setLinkDrive] = useState('');

  // Initialize defaults
  useEffect(() => {
    if (isNewDemandModalOpen) {
      setClienteId(clients[0]?.id || '');
      setResponsavelId(currentUser.id || users[0]?.id || '');
      setEtapaId(newDemandInitialStageId || stages[0]?.id || 'stage_ideias');
      
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 2);
      setPrazo(defaultDate.toISOString().split('T')[0]);
      
      // Default reset
      setSelectedTemplateId('custom');
      setTitulo('');
      setDescricao('');
      setTipo('post');
      setPrioridade('media');
      setChecklistItems([...(DEFAULT_CHECKLIST_BY_TYPE.post || [])]);
      setObjetivo('');
      setFormato('');
      setCopySugestao('');
      setReferencias('');
      setLinkDrive('');
    }
  }, [isNewDemandModalOpen, newDemandInitialStageId, clients, users, stages, currentUser]);

  if (!isNewDemandModalOpen) return null;

  const handleTypeChange = (newTipo: PieceType) => {
    setTipo(newTipo);
    // Automatically apply the standard checklist for the chosen type (e.g. 7-step video routine)
    if (DEFAULT_CHECKLIST_BY_TYPE[newTipo]) {
      setChecklistItems([...DEFAULT_CHECKLIST_BY_TYPE[newTipo]]);
    }
  };

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'custom') return;

    const tpl = DEMAND_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setTipo(tpl.tipo);
      setPrioridade(tpl.prioridade);
      setDescricao(tpl.descricao);
      setChecklistItems([...tpl.checklist]);
      if (!titulo) {
        setTitulo(`${tpl.name} - [Assunto]`);
      }
    }
  };

  const handleResetChecklistToDefault = () => {
    if (DEFAULT_CHECKLIST_BY_TYPE[tipo]) {
      setChecklistItems([...DEFAULT_CHECKLIST_BY_TYPE[tipo]]);
    }
  };

  const handleAddChecklistLine = () => {
    if (!newChecklistInput.trim()) return;
    setChecklistItems((prev) => [...prev, newChecklistInput.trim()]);
    setNewChecklistInput('');
  };

  const handleRemoveChecklistLine = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Por favor, informe o título da demanda.');
      return;
    }

    const created = addDemand({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      cliente_id: clienteId,
      responsavel_id: responsavelId,
      etapa_id: etapaId,
      tipo,
      prioridade,
      prazo,
      hora_agendamento: horaAgendamento,
      briefing: {
        objetivo: objetivo.trim(),
        formato: formato.trim(),
        copy_sugestao: copySugestao.trim(),
        referencias: referencias.trim(),
        link_drive: linkDrive.trim(),
      },
      checklist: checklistItems.map((text) => ({
        id: `chk_${Date.now()}_${Math.random()}`,
        texto: text,
        concluido: false,
      })),
      comentarios: [],
    });

    setIsNewDemandModalOpen(false);
    setSelectedDemandId(created.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={() => setIsNewDemandModalOpen(false)}
    >
      <div
        id="new-demand-modal-container"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0e1017]/95 border-white/10 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nova Demanda de Conteúdo</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Crie ou selecione um template rápido para o fluxo</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewDemandModalOpen(false)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Quick Templates Selector */}
          <div>
            <label className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Templates Rápidos (Agência):</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('custom')}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                  selectedTemplateId === 'custom'
                    ? isDark
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/50 font-semibold'
                      : 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/50 font-semibold'
                    : isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                ✏️ Do Zero (Personalizado)
              </button>

              {DEMAND_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-500/50 font-semibold'
                        : 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/50 font-semibold'
                      : isDark
                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <PieceTypeIcon tipo={tpl.tipo} className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{tpl.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Title & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Título da Demanda *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Carrossel: 5 Erros no Treino de Hipertrofia..."
                className={`w-full text-xs sm:text-sm p-2.5 border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Cliente *
              </label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-xl font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922] focus:border-indigo-400/80'
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
          </div>

          {/* Grid: Tipo, Prioridade, Responsável, Etapa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tipo de Peça
              </label>
              <select
                value={tipo}
                onChange={(e) => handleTypeChange(e.target.value as PieceType)}
                className={`w-full text-xs p-2.5 border rounded-xl cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922] focus:border-indigo-400/80'
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

            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Priority)}
                className={`w-full text-xs p-2.5 border rounded-xl cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922] focus:border-indigo-400/80'
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

            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Responsável
              </label>
              <select
                value={responsavelId}
                onChange={(e) => setResponsavelId(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-xl cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {u.nome} ({USER_ROLE_CONFIG[u.papel]?.label || u.papel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Etapa Inicial
              </label>
              <select
                value={etapaId}
                onChange={(e) => setEtapaId(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-xl cursor-pointer focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-[#161922] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id} className={isDark ? 'bg-[#161922] text-slate-100' : 'bg-white text-slate-900'}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prazo & Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Data do Prazo / Entrega
              </label>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-white/[0.08] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Horário Sugerido de Postagem / Agendamento
              </label>
              <input
                type="time"
                value={horaAgendamento}
                onChange={(e) => setHoraAgendamento(e.target.value)}
                className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 focus:bg-white/[0.08] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* Descrição / Briefing */}
          <div>
            <label className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Descrição e Briefing da Peça
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instruções para o designer/social media, contexto, tema..."
              className={`w-full text-xs sm:text-sm p-3 border rounded-xl focus:outline-none ${
                isDark
                  ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08] focus:border-indigo-400/80'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Checklist inicial */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Checklist de Subtarefas ({checklistItems.length})
              </label>
              <button
                type="button"
                onClick={handleResetChecklistToDefault}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Restaurar padrão ({PIECE_TYPE_CONFIG[tipo]?.label || tipo})
              </button>
            </div>

            {(tipo === 'video' || tipo === 'reels') && (
              <div className={`mb-2 p-2 rounded-xl text-[11px] flex items-center gap-2 border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span className="font-bold">🎬 Rotina de Vídeo & Videomaker:</span>
                <span>7 etapas padrão carregadas automaticamente (Roteiro, Captação, Takes, Edição, Corte, Áudio e Exportação).</span>
              </div>
            )}

            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistLine(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChecklistInput}
                onChange={(e) => setNewChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistLine();
                  }
                }}
                placeholder="Adicionar item ao checklist..."
                className={`flex-1 text-xs p-2.5 border rounded-xl focus:outline-none ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08] focus:border-indigo-400/80'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={handleAddChecklistLine}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setIsNewDemandModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Criar Demanda</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
