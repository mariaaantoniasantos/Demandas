import React, { useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { DemandCard } from './DemandCard';
import { Demand } from '../types';

interface DropTargetState {
  stageId: string;
  index: number;
  cardId: string | null;
  position: 'top' | 'bottom' | null;
}

export const KanbanView: React.FC = () => {
  const {
    stages,
    filteredDemands,
    openNewDemandModal,
    moveDemand,
    setIsStageModalOpen,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [draggedDemandId, setDraggedDemandId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);

  const handleDragStart = (e: React.DragEvent, demandId: string) => {
    e.dataTransfer.setData('text/plain', demandId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedDemandId(demandId);
  };

  const handleDragEnd = () => {
    setDraggedDemandId(null);
    setDropTarget(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, stageId: string, stageDemands: Demand[]) => {
    e.preventDefault();
    const remainingInStage = stageDemands.filter((d) => d.id !== draggedDemandId);
    setDropTarget({
      stageId,
      index: remainingInStage.length,
      cardId: null,
      position: null,
    });
  };

  const handleCardDragOver = (
    e: React.DragEvent,
    cardDemand: Demand,
    stageId: string,
    stageDemands: Demand[]
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTopHalf = e.clientY < midY;

    const remainingInStage = stageDemands.filter((d) => d.id !== draggedDemandId);
    const cardIndexInRemaining = remainingInStage.findIndex((d) => d.id === cardDemand.id);

    const targetIndex = cardIndexInRemaining === -1
      ? 0
      : isTopHalf
        ? cardIndexInRemaining
        : cardIndexInRemaining + 1;

    setDropTarget({
      stageId,
      index: targetIndex,
      cardId: cardDemand.id,
      position: isTopHalf ? 'top' : 'bottom',
    });
  };

  const handleColumnDragLeave = (e: React.DragEvent, stageId: string) => {
    // Only clear if leaving the column altogether
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dropTarget?.stageId === stageId) {
        setDropTarget(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const demandId = e.dataTransfer.getData('text/plain') || draggedDemandId;
    if (demandId) {
      const targetIndex = dropTarget && dropTarget.stageId === targetStageId
        ? dropTarget.index
        : undefined;
      moveDemand(demandId, targetStageId, targetIndex);
    }
    setDraggedDemandId(null);
    setDropTarget(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-transparent min-h-[calc(100vh-140px)]">
      <div className="flex items-start gap-4 sm:gap-5 min-w-max pb-8">
        
        {stages.map((stage) => {
          const stageDemands = filteredDemands.filter((d) => d.etapa_id === stage.id);
          const isColumnHovered = dropTarget?.stageId === stage.id;

          return (
            <div
              key={stage.id}
              id={`kanban-column-${stage.id}`}
              onDragOver={(e) => handleColumnDragOver(e, stage.id, stageDemands)}
              onDragLeave={(e) => handleColumnDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-[290px] sm:w-[320px] shrink-0 rounded-2xl flex flex-col transition-all duration-200 backdrop-blur-xl ${
                isColumnHovered && !dropTarget?.cardId
                  ? isDark
                    ? 'bg-indigo-500/15 border-2 border-dashed border-indigo-400 shadow-xl shadow-indigo-500/20'
                    : 'bg-indigo-50 border-2 border-dashed border-indigo-400 shadow-lg'
                  : isDark
                    ? 'bg-white/[0.03] border border-white/10 shadow-lg shadow-black/20'
                    : 'bg-white/75 border border-slate-200/90 shadow-sm shadow-slate-200/50'
              }`}
            >
              {/* Column Header */}
              <div className={`p-3 sm:p-3.5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stage.cor }}
                  />
                  <h3 className={`font-bold text-xs sm:text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {stage.nome}
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full border ${
                    isDark ? 'text-slate-300 bg-white/10 border-white/10' : 'text-slate-700 bg-slate-100 border-slate-200'
                  }`}>
                    {stageDemands.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openNewDemandModal(stage.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={`Adicionar demanda em "${stage.nome}"`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2 sm:p-2.5 flex flex-col gap-2 flex-1 min-h-[140px] max-h-[calc(100vh-230px)] overflow-y-auto pr-1.5 custom-scrollbar">
                {stageDemands.map((demand) => {
                  const isBeingDragged = draggedDemandId === demand.id;
                  const isTargetTop =
                    dropTarget?.stageId === stage.id &&
                    dropTarget?.cardId === demand.id &&
                    dropTarget?.position === 'top';
                  const isTargetBottom =
                    dropTarget?.stageId === stage.id &&
                    dropTarget?.cardId === demand.id &&
                    dropTarget?.position === 'bottom';

                  return (
                    <div
                      key={demand.id}
                      onDragOver={(e) => handleCardDragOver(e, demand, stage.id, stageDemands)}
                      className="relative flex flex-col gap-1.5"
                    >
                      {/* Top Drop Indicator Line */}
                      {isTargetTop && (
                        <div className="h-1 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50 animate-pulse" />
                      )}

                      <div className={isBeingDragged ? 'opacity-40 scale-95 transition-transform' : 'transition-transform'}>
                        <DemandCard
                          demand={demand}
                          onDragStart={(e) => handleDragStart(e, demand.id)}
                        />
                      </div>

                      {/* Bottom Drop Indicator Line */}
                      {isTargetBottom && (
                        <div className="h-1 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50 animate-pulse" />
                      )}
                    </div>
                  );
                })}

                {/* Empty Column Message */}
                {stageDemands.length === 0 && (
                  <div className={`flex flex-col items-center justify-center h-28 border border-dashed rounded-xl p-3 text-center ${
                    isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'
                  }`}>
                    <p className="text-xs font-medium">Nenhuma demanda aqui</p>
                    <button
                      onClick={() => openNewDemandModal(stage.id)}
                      className="mt-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Criar demanda</span>
                    </button>
                  </div>
                )}

                {/* Drop Indicator at end of column */}
                {draggedDemandId &&
                  dropTarget?.stageId === stage.id &&
                  dropTarget?.cardId === null &&
                  stageDemands.length > 0 && (
                    <div className="h-1 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50 animate-pulse my-1" />
                  )}
              </div>

              {/* Quick Add at bottom */}
              <div className={`p-2 pt-1 border-t ${isDark ? 'border-white/[0.04]' : 'border-slate-100'}`}>
                <button
                  onClick={() => openNewDemandModal(stage.id)}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-xl transition-colors font-medium border border-transparent cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar demanda</span>
                </button>
              </div>

            </div>
          );
        })}

        {/* Add/Manage Stage Button at the end */}
        <div className="w-[180px] shrink-0 pt-2">
          <button
            onClick={() => setIsStageModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold border border-dashed rounded-2xl backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white border-white/15 hover:border-indigo-400/50 hover:bg-indigo-500/10'
                : 'text-slate-600 hover:text-indigo-600 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/70 bg-white/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Configurar Etapas</span>
          </button>
        </div>

      </div>
    </div>
  );
};
