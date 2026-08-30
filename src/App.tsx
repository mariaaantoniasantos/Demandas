/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemandProvider, useDemands } from './context/DemandContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { FiltersBar } from './components/FiltersBar';
import { KanbanView } from './components/KanbanView';
import { TableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { WorkloadView } from './components/WorkloadView';
import { DemandDetailModal } from './components/DemandDetailModal';
import { NewDemandModal } from './components/NewDemandModal';
import { ManageClientsModal } from './components/ManageClientsModal';
import { ManageTeamModal } from './components/ManageTeamModal';
import { ManageStagesModal } from './components/ManageStagesModal';

const AppContent: React.FC = () => {
  const { viewMode, theme } = useDemands();

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#0a0a0c] text-slate-100' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      {/* Subtle ambient lighting glows for frosted glass reflection */}
      {isDark ? (
        <>
          <div className="fixed top-[-10%] left-[15%] w-[450px] h-[450px] bg-indigo-600/12 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-[40%] right-[5%] w-[350px] h-[350px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none -z-10" />
        </>
      ) : (
        <>
          <div className="fixed top-[-10%] left-[15%] w-[450px] h-[450px] bg-indigo-300/25 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-[40%] right-[5%] w-[350px] h-[350px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        </>
      )}

      {/* Top Navigation */}
      <Navbar />

      {/* Dynamic Filters & Search */}
      <FiltersBar />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col z-0">
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'tabela' && <TableView />}
        {viewMode === 'calendario' && <CalendarView />}
        {viewMode === 'equipe' && <WorkloadView />}
      </main>

      {/* Modals & Dialogs */}
      <DemandDetailModal />
      <NewDemandModal />
      <ManageClientsModal />
      <ManageTeamModal />
      <ManageStagesModal />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-slate-400 text-sm">
        Carregando...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <DemandProvider>
      <AppContent />
    </DemandProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
