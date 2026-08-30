import React, { useState } from 'react';
import {
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckSquare,
  Building2,
  Layers,
  Copy,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { PIECE_TYPE_CONFIG, PRIORITY_CONFIG } from '../data/constants';
import { Demand } from '../types';
import { formatDateBR, formatRelativeDateBR, getInitials } from '../utils/formatters';
import { PieceTypeIcon } from './PieceTypeIcon';

export const TableView: React.FC = () => {
  const {
    filteredDemands,
    stages,
    clients,
    users,
    getClientById,
    getUserById,
    getStageById,
    isEtapaFinal,
    moveDemand,
    setSelectedDemandId,
    duplicateDemand,
    deleteDemand,
    currentUser,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [groupBy, setGroupBy] = useState<'stage' | 'client' | 'none'>('stage');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderRow = (demand: Demand) => {
    const client = getClientById(demand.cliente_id);
    const assignee = getUserById(demand.responsavel_id);
    const stage = getStageById(demand.etapa_id);
    const priorityConfig = PRIORITY_CONFIG[demand.prioridade];
    const pieceConfig = PIECE_TYPE_CONFIG[demand.tipo] || PIECE_TYPE_CONFIG.post;
    const deadlineInfo = formatRelativeDateBR(demand.prazo);
    const isDone = isEtapaFinal(demand.etapa_id);

    const totalChecklist = demand.checklist?.length || 0;
    const completedChecklist = demand.checklist?.filter((c) => c.concluido).length || 0;

    return (
      <tr
        key={demand.id}
        onClick={() => setSelectedDemandId(demand.id)}
        className={`transition-colors cursor-pointer border-b last:border-0 group ${
          isDark
            ? 'hover:bg-white/[0.04] border-white/[0.06]'
            : 'hover:bg-slate-50 border-slate-100'
        }`}
      >
        {/* Title & Type */}
        <td className="py-3 px-4 min-w-[280px]">
          <div className="flex items-start gap-2.5">
            <span
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 border backdrop-blur-xs ${pieceConfig.badgeClass}`}
              title={pieceConfig.label}
            >
              <PieceTypeIcon tipo={demand.tipo} className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <span className={`font-semibold text-xs sm:text-sm transition-colors line-clamp-1 ${
                isDark ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
              }`}>
                {demand.titulo}
              </span>
              {demand.descricao && (
                <p className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {demand.descricao}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Client */}
        <td className="py-3 px-4 whitespace-nowrap">
          {client ? (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: client.cor_identificacao }}
              />
              <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{client.nome}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Stage / Etapa (with inline changer) */}
        <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <select
            value={demand.etapa_id}
            onChange={(e) => moveDemand(demand.id, e.target.value)}
            aria-label="Alterar etapa"
            className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-400/50 cursor-pointer backdrop-blur-md transition-colors ${
              isDark
                ? 'border-white/10 bg-[#13131a] text-slate-200 hover:bg-white/[0.08]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id} className={isDark ? 'bg-[#13131a] text-slate-200' : 'bg-white text-slate-900'}>
                {s.nome}
              </option>
            ))}
          </select>
        </td>

        {/* Priority */}
        <td className="py-3 px-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-xs ${priorityConfig.bgClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
            <span>{priorityConfig.label}</span>
          </span>
        </td>

        {/* Assignee */}
        <td className="py-3 px-4 whitespace-nowrap">
          {assignee ? (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: assignee.cor_avatar }}
              >
                {getInitials(assignee.nome)}
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {assignee.nome.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Não atribuído</span>
          )}
        </td>

        {/* Due Date */}
        <td className="py-3 px-4 whitespace-nowrap">
          {demand.prazo ? (
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${
                isDone
                  ? isDark ? 'text-slate-500 line-through bg-white/[0.03]' : 'text-slate-400 line-through bg-slate-100'
                  : deadlineInfo.isOverdue
                  ? isDark ? 'text-red-300 bg-red-500/20 border border-red-500/30 font-bold' : 'text-red-700 bg-red-50 border border-red-200 font-bold'
                  : deadlineInfo.isToday
                  ? isDark ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30 font-bold' : 'text-amber-700 bg-amber-50 border border-amber-200 font-bold'
                  : isDark ? 'text-slate-300 bg-white/[0.04] border border-white/10' : 'text-slate-700 bg-slate-100 border border-slate-200'
              }`}
            >
              {deadlineInfo.isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              <span>{formatDateBR(demand.prazo)}</span>
              <span className="text-[10px] opacity-75">({deadlineInfo.text})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Checklist */}
        <td className="py-3 px-4 whitespace-nowrap">
          {totalChecklist > 0 ? (
            <div className="flex items-center gap-2">
              <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div
                  className={`h-full ${
                    completedChecklist === totalChecklist ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {completedChecklist}/{totalChecklist}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setSelectedDemandId(demand.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Abrir detalhes"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => duplicateDemand(demand.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Duplicar demanda"
            >
              <Copy className="w-4 h-4" />
            </button>
            {currentUser.papel === 'gerente' && (
              <button
                onClick={() => {
                  if (confirm(`Deseja excluir a demanda "${demand.titulo}"?`)) {
                    deleteDemand(demand.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Excluir demanda"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Table Controls */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Agrupar por:</span>
          <div className={`inline-flex rounded-xl p-1 border backdrop-blur-md ${
            isDark ? 'bg-white/[0.05] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setGroupBy('stage')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                groupBy === 'stage'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-xs'
                    : 'bg-white text-indigo-600 border border-indigo-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Etapas
            </button>
            <button
              onClick={() => setGroupBy('client')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                groupBy === 'client'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-xs'
                    : 'bg-white text-indigo-600 border border-indigo-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setGroupBy('none')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                groupBy === 'none'
                  ? isDark
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-xs'
                    : 'bg-white text-indigo-600 border border-indigo-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sem Agrupamento
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className={`backdrop-blur-xl rounded-2xl border overflow-hidden transition-all ${
        isDark
          ? 'bg-white/[0.03] border-white/10 shadow-lg shadow-black/30'
          : 'bg-white/80 border-slate-200/90 shadow-sm shadow-slate-200/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-white/[0.04] border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3.5 px-4">Demanda & Tipo</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Etapa</th>
                <th className="py-3.5 px-4">Prioridade</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4">Prazo</th>
                <th className="py-3.5 px-4">Checklist</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
              
              {/* Grouped by Stage */}
              {groupBy === 'stage' &&
                stages.map((stage) => {
                  const stageDemands = filteredDemands.filter((d) => d.etapa_id === stage.id);
                  if (stageDemands.length === 0) return null;
                  const isCollapsed = collapsedGroups[stage.id];

                  return (
                    <React.Fragment key={stage.id}>
                      <tr
                        onClick={() => toggleGroup(stage.id)}
                        className={`transition-colors cursor-pointer ${
                          isDark ? 'bg-white/[0.06] hover:bg-white/[0.09]' : 'bg-slate-50/80 hover:bg-slate-100/80'
                        }`}
                      >
                        <td colSpan={8} className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                            <span
                              className="w-2.5 h-2.5 rounded-full shadow-xs"
                              style={{ backgroundColor: stage.cor }}
                            />
                            <span className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {stage.nome}
                            </span>
                            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              ({stageDemands.length})
                            </span>
                          </div>
                        </td>
                      </tr>
                      {!isCollapsed && stageDemands.map((demand) => renderRow(demand))}
                    </React.Fragment>
                  );
                })}

              {/* Grouped by Client */}
              {groupBy === 'client' &&
                clients.map((client) => {
                  const clientDemands = filteredDemands.filter((d) => d.cliente_id === client.id);
                  if (clientDemands.length === 0) return null;
                  const isCollapsed = collapsedGroups[client.id];

                  return (
                    <React.Fragment key={client.id}>
                      <tr
                        onClick={() => toggleGroup(client.id)}
                        className={`transition-colors cursor-pointer ${
                          isDark ? 'bg-white/[0.06] hover:bg-white/[0.09]' : 'bg-slate-50/80 hover:bg-slate-100/80'
                        }`}
                      >
                        <td colSpan={8} className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                            <span
                              className="w-2.5 h-2.5 rounded-full shadow-xs"
                              style={{ backgroundColor: client.cor_identificacao }}
                            />
                            <span className={`font-bold text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {client.nome}
                            </span>
                            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              ({clientDemands.length})
                            </span>
                          </div>
                        </td>
                      </tr>
                      {!isCollapsed && clientDemands.map((demand) => renderRow(demand))}
                    </React.Fragment>
                  );
                })}

              {/* No Grouping */}
              {groupBy === 'none' &&
                filteredDemands.map((demand) => renderRow(demand))}

              {/* Empty state */}
              {filteredDemands.length === 0 && (
                <tr>
                  <td colSpan={8} className={`py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <p className="text-sm font-medium">Nenhuma demanda encontrada com os filtros selecionados.</p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
