import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { PIECE_TYPE_CONFIG } from '../data/constants';
import { PieceTypeIcon } from './PieceTypeIcon';

export const CalendarView: React.FC = () => {
  const {
    filteredDemands,
    getClientById,
    getStageById,
    isEtapaFinal,
    setSelectedDemandId,
    openNewDemandModal,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';

  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Build grid calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({ dayNum, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNum: d, isCurrentMonth: true, dateStr });
  }

  // Next month leading days to complete grid (42 cells max)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNum: d, isCurrentMonth: false, dateStr });
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={handleToday}
            className={`px-3 py-1 text-xs font-semibold rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className={`backdrop-blur-xl rounded-2xl border overflow-hidden transition-all ${
        isDark
          ? 'bg-white/[0.03] border-white/10 shadow-lg shadow-black/30'
          : 'bg-white/80 border-slate-200/90 shadow-sm shadow-slate-200/50'
      }`}>
        
        {/* Days of week header */}
        <div className={`grid grid-cols-7 border-b text-center text-xs font-bold py-3 ${
          isDark ? 'border-white/10 bg-white/[0.04] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? isDark ? 'text-slate-500' : 'text-slate-400' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className={`grid grid-cols-7 divide-x divide-y ${
          isDark ? 'divide-white/[0.06]' : 'divide-slate-200/80'
        }`}>
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const dayDemands = filteredDemands.filter((d) => d.prazo === cell.dateStr);

            return (
              <div
                key={idx}
                className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition-colors relative flex flex-col ${
                  !cell.isCurrentMonth
                    ? isDark ? 'bg-black/20 text-slate-600' : 'bg-slate-100/50 text-slate-400'
                    : isToday
                    ? isDark ? 'bg-indigo-500/10' : 'bg-indigo-50/70'
                    : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Cell Header: Day Number */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? isDark ? 'text-slate-200' : 'text-slate-800'
                        : isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isCurrentMonth && (
                    <button
                      onClick={() => openNewDemandModal()}
                      className={`opacity-0 hover:opacity-100 p-1 rounded-lg transition-opacity ${
                        isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                      title="Adicionar demanda neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day's Demands Chips */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                  {dayDemands.map((demand) => {
                    const client = getClientById(demand.cliente_id);
                    const stage = getStageById(demand.etapa_id);
                    const isDone = isEtapaFinal(demand.etapa_id);

                    return (
                      <div
                        key={demand.id}
                        onClick={() => setSelectedDemandId(demand.id)}
                        className={`text-left p-1.5 rounded-lg border text-[11px] cursor-pointer backdrop-blur-xs transition-all hover:scale-[1.02] flex items-center gap-1.5 ${
                          isDone
                            ? isDark
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                            : isDark
                            ? 'bg-white/[0.06] text-slate-200 border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.09]'
                            : 'bg-white text-slate-800 border-slate-200 shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                        title={`${demand.titulo} - ${client?.nome || ''} (${stage?.nome || ''})`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: stage?.cor || '#6366f1' }}
                        />
                        <PieceTypeIcon tipo={demand.tipo} className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold flex-1">
                          {demand.titulo}
                        </span>
                        {demand.hora_agendamento && (
                          <span className={`text-[9px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {demand.hora_agendamento}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
