import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  AlertCircle,
  Clock,
  Building2,
} from 'lucide-react';
import { useDemands } from '../context/DemandContext';
import { USER_ROLE_CONFIG } from '../data/constants';
import { getInitials, formatRelativeDateBR, formatMinutesToHours } from '../utils/formatters';

type WorkloadTab = 'equipe' | 'clientes';

export const WorkloadView: React.FC = () => {
  const {
    users,
    demands,
    clients,
    getStageById,
    isEtapaFinal,
    setSelectedDemandId,
    currentUser,
    getTotalMinutosByUser,
    getTotalMinutosByClient,
    theme,
  } = useDemands();

  const isDark = theme === 'dark';
  const todayStr = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState<WorkloadTab>('equipe');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">

      {/* View Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Carga de Trabalho da Equipe
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Distribuição de demandas, horas apontadas e prazos por colaborador e por cliente.
          </p>
        </div>

        {/* Tabs: Equipe / Clientes */}
        <div className={`flex items-center backdrop-blur-md p-1 rounded-xl border shrink-0 ${
          isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setTab('equipe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'equipe'
                ? isDark ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipe</span>
          </button>
          <button
            onClick={() => setTab('clientes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'clientes'
                ? isDark ? 'bg-white/15 text-white shadow-sm border border-white/20' : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Clientes</span>
          </button>
        </div>
      </div>

      {tab === 'equipe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {users.map((member) => {
            const userDemands = demands.filter((d) => d.responsavel_id === member.id);
            const activeDemands = userDemands.filter((d) => !isEtapaFinal(d.etapa_id));
            const completedDemands = userDemands.filter((d) => isEtapaFinal(d.etapa_id));
            const overdueDemands = activeDemands.filter((d) => d.prazo && d.prazo < todayStr);
            const inProduction = userDemands.filter((d) => d.etapa_id === 'stage_producao');
            const inApproval = userDemands.filter((d) => d.etapa_id === 'stage_aprovacao');
            const totalMinutos = getTotalMinutosByUser(member.id);

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

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${loadStatus.color}`}>
                    {loadStatus.label}
                  </span>
                </div>

                {/* Workload Stats Bar */}
                <div className={`grid grid-cols-5 gap-2 mb-4 p-3 rounded-xl border text-center backdrop-blur-md ${
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
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Horas</span>
                    </span>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-300 mt-0.5">{formatMinutesToHours(totalMinutos)}</p>
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
                      const client = clients.find((c) => c.id === demand.cliente_id);
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
      )}

      {tab === 'clientes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clients.map((client) => {
            const clientDemands = demands.filter((d) => d.cliente_id === client.id);
            const ativas = clientDemands.filter((d) => !isEtapaFinal(d.etapa_id));
            const concluidas = clientDemands.filter((d) => isEtapaFinal(d.etapa_id));
            const atrasadas = ativas.filter((d) => d.prazo && d.prazo < todayStr);
            const totalMinutos = getTotalMinutosByClient(client.id);

            return (
              <div
                key={client.id}
                className={`backdrop-blur-xl rounded-2xl border p-5 transition-all ${
                  isDark ? 'bg-white/[0.03] shadow-lg shadow-black/30 border-white/10' : 'bg-white/80 shadow-sm shadow-slate-200/50 border-slate-200/90'
                }`}
              >
                <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
                    style={{ backgroundColor: client.cor_identificacao }}
                  >
                    {client.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-base leading-tight truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {client.nome}
                    </h3>
                    <p className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {client.segmento || 'Sem segmento'}
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-4 gap-2 p-3 rounded-xl border text-center backdrop-blur-md ${
                  isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ativas</span>
                    <p className={`text-base font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{ativas.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Concluídas</span>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-300 mt-0.5">{concluidas.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 flex items-center justify-center gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>Atrasadas</span>
                    </span>
                    <p className={`text-base font-bold mt-0.5 ${atrasadas.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                      {atrasadas.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Horas</span>
                    </span>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-300 mt-0.5">{formatMinutesToHours(totalMinutos)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {clients.length === 0 && (
            <div className={`col-span-full py-10 text-center text-xs border border-dashed rounded-xl ${
              isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'
            }`}>
              Nenhum cliente cadastrado ainda.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
