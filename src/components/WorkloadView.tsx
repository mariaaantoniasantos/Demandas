import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { USER_ROLE_CONFIG, PRIORITY_CONFIG } from '../data/constants';
import { getInitials, formatRelativeDateBR } from '../utils/formatters';

export const WorkloadView: React.FC = () => {
  const {
    users,
    demands,
    stages,
    getClientById,
    getStageById,
    isEtapaFinal,
    setSelectedDemandId,
    setCurrentUser,
    currentUser,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* View Header */}
      <div className="mb-6">
        <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Carga de Trabalho da Equipe
        </h2>
        <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Distribuição de demandas ativas, gargalos de produção e prazos por colaborador.
        </p>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {users.map((member) => {
          const userDemands = demands.filter((d) => d.responsavel_id === member.id);
          const activeDemands = userDemands.filter((d) => !isEtapaFinal(d.etapa_id));
          const completedDemands = userDemands.filter((d) => isEtapaFinal(d.etapa_id));
          const overdueDemands = activeDemands.filter((d) => d.prazo && d.prazo < todayStr);
          const inProduction = userDemands.filter((d) => d.etapa_id === 'stage_producao');
          const inApproval = userDemands.filter((d) => d.etapa_id === 'stage_aprovacao');

          // Workload Level calculation
          const loadStatus =
            activeDemands.length >= 5
              ? { label: 'Carga Alta', color: isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-50 text-rose-700 border-rose-200' }
              : activeDemands.length >= 3
              ? { label: 'Carga Moderada', color: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-700 border-amber-200' }
              : { label: 'Carga Equilibrada', color: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200' };

          return (
            <div
              key={member.id}
              className={`backdrop-blur-xl rounded-2xl border p-5 transition-all ${
                isDark
                  ? `bg-white/[0.03] shadow-lg shadow-black/30 ${currentUser.id === member.id ? 'border-indigo-400/60 ring-2 ring-indigo-500/20' : 'border-white/10'}`
                  : `bg-white/80 shadow-sm shadow-slate-200/50 ${currentUser.id === member.id ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200/90'}`
              }`}
            >
              {/* Member Card Top Header */}
              <div className={`flex items-start justify-between gap-3 mb-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
                    style={{ backgroundColor: member.cor_avatar }}
                  >
                    {getInitials(member.nome)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-base leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {member.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border backdrop-blur-xs ${USER_ROLE_CONFIG[member.papel].badge}`}>
                        {USER_ROLE_CONFIG[member.papel].label}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{member.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${loadStatus.color}`}>
                    {loadStatus.label}
                  </span>
                  {currentUser.id !== member.id && (
                    <button
                      onClick={() => setCurrentUser(member)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      Assumir persona
                    </button>
                  )}
                </div>
              </div>

              {/* Workload Stats Bar */}
              <div className={`grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl border text-center backdrop-blur-md ${
                isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ativas</span>
                  <p className={`text-base font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{activeDemands.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">Produção</span>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-300 mt-0.5">{inProduction.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">Aprovação</span>
                  <p className="text-base font-bold text-purple-600 dark:text-purple-300 mt-0.5">{inApproval.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Atrasadas</span>
                  <p className={`text-base font-bold mt-0.5 ${overdueDemands.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                    {overdueDemands.length}
                  </p>
                </div>
              </div>

              {/* Active Tasks List for this user */}
              <div>
                <h4 className={`text-xs font-bold mb-2 flex items-center justify-between ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <span>Demandas Ativas ({activeDemands.length})</span>
                  <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {completedDemands.length} concluídas no histórico
                  </span>
                </h4>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {activeDemands.map((demand) => {
                    const client = getClientById(demand.cliente_id);
                    const stage = getStageById(demand.etapa_id);
                    const deadline = formatRelativeDateBR(demand.prazo);

                    return (
                      <div
                        key={demand.id}
                        onClick={() => setSelectedDemandId(demand.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group text-xs ${
                          isDark
                            ? 'border-white/[0.06] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06]'
                            : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: stage?.cor || '#6366f1' }}
                          />
                          <span className={`font-semibold truncate transition-colors ${
                            isDark ? 'text-slate-200 group-hover:text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'
                          }`}>
                            {demand.titulo}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {client && (
                            <span className={`text-[10px] font-medium hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {client.nome.split(' ')[0]}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                              deadline.isOverdue
                                ? isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                : deadline.isToday
                                ? isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {deadline.text}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                        </div>
                      </div>
                    );
                  })}

                  {activeDemands.length === 0 && (
                    <div className={`py-6 text-center text-xs border border-dashed rounded-xl ${
                      isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'
                    }`}>
                      Sem demandas ativas atribuídas no momento.
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
