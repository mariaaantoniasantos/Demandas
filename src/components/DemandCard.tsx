import React from 'react';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  ChevronRight,
  Clock,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { PIECE_TYPE_CONFIG, PRIORITY_CONFIG } from '../data/constants';
import { Demand } from '../types';
import { formatRelativeDateBR, getInitials } from '../utils/formatters';
import { PieceTypeIcon } from './PieceTypeIcon';

interface DemandCardProps {
  demand: Demand;
  onDragStart?: (e: React.DragEvent, demandId: string) => void;
}

export const DemandCard: React.FC<DemandCardProps> = ({ demand, onDragStart }) => {
  const {
    getClientById,
    getUserById,
    getStageById,
    isEtapaFinal,
    stages,
    moveDemand,
    setSelectedDemandId,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const client = getClientById(demand.cliente_id);
  const assignee = getUserById(demand.responsavel_id);
  const currentStage = getStageById(demand.etapa_id);
  const priorityConfig = PRIORITY_CONFIG[demand.prioridade];
  const pieceConfig = PIECE_TYPE_CONFIG[demand.tipo] || PIECE_TYPE_CONFIG.post;

  // Checklist counts
  const totalChecklist = demand.checklist?.length || 0;
  const completedChecklist = demand.checklist?.filter((c) => c.concluido).length || 0;
  const checklistProgress = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  // Deadline info
  const deadlineInfo = formatRelativeDateBR(demand.prazo);
  const isDone = isEtapaFinal(demand.etapa_id);

  // Next stage calculation for quick action
  const currentStageIndex = stages.findIndex((s) => s.id === demand.etapa_id);
  const nextStage = currentStageIndex >= 0 && currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  const handleQuickAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStage) {
      moveDemand(demand.id, nextStage.id);
    }
  };

  return (
    <div
      id={`demand-card-${demand.id}`}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, demand.id)}
      onClick={() => setSelectedDemandId(demand.id)}
      className={`group relative rounded-2xl border transition-all p-3.5 cursor-pointer select-none ${priorityConfig.borderClass} ${
        isDark
          ? 'bg-white/[0.05] backdrop-blur-md border-white/10 shadow-md shadow-black/30 hover:shadow-xl hover:border-white/25 hover:bg-white/[0.08]'
          : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 hover:bg-slate-50/80'
      }`}
    >
      {/* Top Header: Client & Piece Type */}
      <div className="flex items-center justify-between gap-2 mb-2">
        
        {/* Client Tag */}
        {client ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: client.cor_identificacao }}
            />
            <span className={`text-[11px] font-bold truncate max-w-[130px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              {client.nome}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">Sem cliente</span>
        )}

        {/* Piece Type Pill */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border backdrop-blur-xs ${pieceConfig.badgeClass}`}
        >
          <PieceTypeIcon tipo={demand.tipo} className="w-3 h-3" />
          <span>{pieceConfig.label}</span>
        </span>
      </div>

      {/* Demand Title */}
      <h3 className={`font-semibold text-xs sm:text-sm line-clamp-2 leading-snug mb-1.5 transition-colors ${
        isDark ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
      }`}>
        {demand.titulo}
      </h3>

      {/* Description Snippet (if available) */}
      {demand.descricao && (
        <p className={`text-[11px] line-clamp-2 mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {demand.descricao}
        </p>
      )}

      {/* Checklist Progress Bar (if items exist) */}
      {totalChecklist > 0 && (
        <div className="mb-3">
          <div className={`flex items-center justify-between text-[10px] mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>Checklist</span>
            </span>
            <span className={completedChecklist === totalChecklist ? 'text-emerald-500 font-bold' : isDark ? 'text-slate-300' : 'text-slate-600'}>
              {completedChecklist}/{totalChecklist}
            </span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div
              className={`h-full transition-all duration-300 ${
                completedChecklist === totalChecklist ? 'bg-emerald-500 shadow-xs' : 'bg-indigo-500 shadow-xs'
              }`}
              style={{ width: `${checklistProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Priority, Comments, Date, Assignee */}
      <div className={`flex items-center justify-between gap-2 pt-2 border-t text-xs ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        
        {/* Left indicators: Due Date & Comments */}
        <div className="flex items-center gap-2 text-[11px]">
          
          {/* Due date tag */}
          {demand.prazo && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium ${
                isDone
                  ? isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                  : deadlineInfo.isOverdue
                  ? isDark ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold' : 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                  : deadlineInfo.isToday
                  ? isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
                  : isDark ? 'text-slate-400 bg-white/[0.05] border border-white/10' : 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
              title={`Prazo: ${demand.prazo} ${demand.hora_agendamento ? `às ${demand.hora_agendamento}` : ''}`}
            >
              {deadlineInfo.isOverdue ? (
                <AlertCircle className="w-3 h-3 text-red-500" />
              ) : (
                <Clock className="w-3 h-3 text-slate-400" />
              )}
              <span>{deadlineInfo.text}</span>
            </span>
          )}

          {/* Comments count */}
          {demand.comentarios && demand.comentarios.length > 0 && (
            <span className={`inline-flex items-center gap-0.5 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <MessageSquare className="w-3 h-3" />
              <span>{demand.comentarios.length}</span>
            </span>
          )}
        </div>

        {/* Right side: Assignee Avatar & Quick Next Stage button */}
        <div className="flex items-center gap-1.5">
          
          {/* Quick advance to next stage */}
          {nextStage && !isDone && (
            <button
              onClick={handleQuickAdvance}
              className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Avançar para "${nextStage.nome}"`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Assignee Avatar */}
          {assignee ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: assignee.cor_avatar }}
              title={`Responsável: ${assignee.nome} (${assignee.papel})`}
            >
              {getInitials(assignee.nome)}
            </div>
          ) : (
            <div className={`w-6 h-6 rounded-full border border-dashed flex items-center justify-center text-[10px] ${
              isDark ? 'border-white/20 text-slate-400' : 'border-slate-300 text-slate-400'
            }`}>
              ?
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
