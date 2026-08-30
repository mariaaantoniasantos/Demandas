import React, { useState } from 'react';
import { X, Plus, Building2, Trash2, Edit2, Check } from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { Client } from '../types';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#06b6d4', '#eab308', '#ef4444', '#64748b', '#14b8a6',
];

export const ManageClientsModal: React.FC = () => {
  const {
    isClientModalOpen,
    setIsClientModalOpen,
    clients,
    addClient,
    updateClient,
    deleteClient,
    demands,
    isEtapaFinal,
    theme,
  } = useDemands();

  const todayStr = new Date().toISOString().split('T')[0];

  const isDark = theme === 'dark';

  const [isAdding, setIsAdding] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(PRESET_COLORS[0]);
  const [segmento, setSegmento] = useState('');
  const [contato, setContato] = useState('');

  if (!isClientModalOpen) return null;

  const resetForm = () => {
    setNome('');
    setCor(PRESET_COLORS[0]);
    setSegmento('');
    setContato('');
    setIsAdding(false);
    setEditingClientId(null);
  };

  const handleStartEdit = (client: Client) => {
    setEditingClientId(client.id);
    setNome(client.nome);
    setCor(client.cor_identificacao);
    setSegmento(client.segmento || '');
    setContato(client.contato || '');
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editingClientId) {
      updateClient(editingClientId, {
        nome: nome.trim(),
        cor_identificacao: cor,
        segmento: segmento.trim(),
        contato: contato.trim(),
      });
    } else {
      addClient({
        nome: nome.trim(),
        cor_identificacao: cor,
        segmento: segmento.trim(),
        contato: contato.trim(),
      });
    }
    resetForm();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsClientModalOpen(false)}
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
            <Building2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h2 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Gerenciar Clientes / Contas</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cadastre e edite as contas atendidas pela agência</p>
            </div>
          </div>

          <button
            onClick={() => setIsClientModalOpen(false)}
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
          {(isAdding || editingClientId) && (
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 backdrop-blur-md ${
              isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {editingClientId ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Studio Bella Odonto"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Segmento / Nicho</label>
                  <input
                    type="text"
                    value={segmento}
                    onChange={(e) => setSegmento(e.target.value)}
                    placeholder="Ex: Odontologia & Estética"
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ponto de Contato</label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Ex: Fernanda (Marketing) - (11) 98888-7777"
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                    isDark
                      ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cor de Identificação</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
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
                  <input
                    type="color"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/20 bg-transparent cursor-pointer"
                    title="Escolher cor personalizada"
                  />
                </div>
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
                  <span>{editingClientId ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Add New Trigger */}
          {!isAdding && !editingClientId && (
            <button
              onClick={() => setIsAdding(true)}
              className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border-white/20 hover:border-indigo-400 hover:bg-white/[0.04] text-indigo-300'
                  : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 text-indigo-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Cliente</span>
            </button>
          )}

          {/* List of Clients */}
          <div className="space-y-2">
            {clients.map((client) => {
              const clientDemands = demands.filter((d) => d.cliente_id === client.id);
              const concluidas = clientDemands.filter((d) => isEtapaFinal(d.etapa_id)).length;
              const atrasadas = clientDemands.filter(
                (d) => !isEtapaFinal(d.etapa_id) && d.prazo && d.prazo < todayStr
              ).length;
              const ativas = clientDemands.filter((d) => !isEtapaFinal(d.etapa_id)).length;

              return (
                <div
                  key={client.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-all ${
                    isDark
                      ? 'border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.05]'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: client.cor_identificacao }}
                    >
                      {client.nome.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{client.nome}</h4>
                      <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {client.segmento || 'Sem segmento'} • {clientDemands.length} demandas cadastradas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-11 sm:pl-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`} title="Demandas ativas (não concluídas)">
                      {ativas} ativas
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`} title="Demandas concluídas">
                      {concluidas} concluídas
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      atrasadas > 0
                        ? isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                        : isDark ? 'bg-white/[0.05] text-slate-400 border-white/10' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`} title="Demandas com prazo vencido e não concluídas">
                      {atrasadas} atrasadas
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(client)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {clients.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o cliente "${client.nome}"?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
