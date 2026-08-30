import React, { useState } from 'react';
import {
  X,
  Plus,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { Stage } from '../types';
import { INITIAL_STAGES } from '../data/initialData';

const STAGE_COLORS = [
  '#64748b', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#10b981', '#ef4444', '#ec4899', '#f97316', '#6366f1',
];

export const ManageStagesModal: React.FC = () => {
  const {
    isStageModalOpen,
    setIsStageModalOpen,
    stages,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    isEtapaFinal,
    demands,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [isAdding, setIsAdding] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(STAGE_COLORS[0]);
  const [descricao, setDescricao] = useState('');
  const [eEtapaFinal, setEEtapaFinal] = useState(false);

  if (!isStageModalOpen) return null;

  const resetForm = () => {
    setNome('');
    setCor(STAGE_COLORS[0]);
    setDescricao('');
    setEEtapaFinal(false);
    setIsAdding(false);
    setEditingStageId(null);
  };

  const handleStartEdit = (stage: Stage) => {
    setEditingStageId(stage.id);
    setNome(stage.nome);
    setCor(stage.cor);
    setDescricao(stage.descricao || '');
    setEEtapaFinal(Boolean(stage.e_etapa_final));
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingStageId) {
      updateStage(editingStageId, {
        nome: nome.trim(),
        cor,
        descricao: descricao.trim(),
        e_etapa_final: eEtapaFinal,
      });
    } else {
      addStage({
        nome: nome.trim(),
        cor,
        descricao: descricao.trim(),
        e_etapa_final: eEtapaFinal,
      });
    }
    resetForm();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newStages = [...stages];
    const temp = newStages[index - 1];
    newStages[index - 1] = newStages[index];
    newStages[index] = temp;
    reorderStages(newStages);
  };

  const moveDown = (index: number) => {
    if (index === stages.length - 1) return;
    const newStages = [...stages];
    const temp = newStages[index + 1];
    newStages[index + 1] = newStages[index];
    newStages[index] = temp;
    reorderStages(newStages);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsStageModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0e1017]/95 border-white/10 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h2 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Configurar Etapas do Fluxo</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Personalize as colunas do seu quadro Kanban</p>
            </div>
          </div>

          <button
            onClick={() => setIsStageModalOpen(false)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Add / Edit Form */}
          {(isAdding || editingStageId) && (
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 backdrop-blur-md ${
              isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {editingStageId ? 'Editar Etapa' : 'Nova Etapa / Coluna'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nome da Etapa *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Em Validação"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Descrição Breve</label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Validação técnica de arquivos"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cor da Coluna</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {STAGE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        cor === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Is Final Stage Checkbox */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <label htmlFor="stage-final-checkbox" className={`text-xs font-semibold block cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Marcar como etapa final (Concluído)
                  </label>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Demandas nesta etapa serão consideradas finalizadas em relatórios e filtros de prazo
                  </p>
                </div>
                <input
                  id="stage-final-checkbox"
                  type="checkbox"
                  checked={eEtapaFinal}
                  onChange={(e) => setEEtapaFinal(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-3.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingStageId ? 'Salvar Etapa' : 'Adicionar Etapa'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Add Trigger */}
          {!isAdding && !editingStageId && (
            <button
              onClick={() => setIsAdding(true)}
              className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border-white/20 hover:border-indigo-400 hover:bg-white/[0.04] text-indigo-300'
                  : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 text-indigo-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Nova Etapa / Coluna</span>
            </button>
          )}

          {/* List of Stages */}
          <div className="space-y-2">
            {stages.map((stage, index) => {
              const stageDemandsCount = demands.filter((d) => d.etapa_id === stage.id).length;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isDark
                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-4 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {index + 1}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: stage.cor }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stage.nome}</h4>
                        {isEtapaFinal(stage.id) && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                            isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            Etapa Final
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {stage.descricao || 'Sem descrição'} • {stageDemandsCount} demandas atualmente
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className={`p-1.5 rounded-xl disabled:opacity-20 transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Mover para a esquerda / cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === stages.length - 1}
                      className={`p-1.5 rounded-xl disabled:opacity-20 transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Mover para a direita / baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(stage)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Editar etapa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {stages.length > 2 && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a etapa "${stage.nome}"? As demandas serão realocadas para a primeira coluna.`)) {
                            deleteStage(stage.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Excluir etapa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset standard flow button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Deseja restaurar as 6 etapas padrão do fluxo de agência?')) {
                  reorderStages(INITIAL_STAGES);
                }
              }}
              className={`text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar fluxo padrão da agência (6 etapas)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
