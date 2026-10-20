'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useDashboard } from './DashboardContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { OverviewDashboard } from './OverviewDashboard';
import { KanbanBoard } from './KanbanBoard';
import { ClientList } from './ClientList';
import { WeeklyChecklist } from './WeeklyChecklist';
import { FinanceDashboard } from './FinanceDashboard';
import { TrashView } from './TrashView';
import { SettingsView } from './SettingsView';
import { CompanyDetailModal } from './CompanyDetailModal';
import { NewCompanyModal } from './NewCompanyModal';
import { LossReasonModal } from './LossReasonModal';
import { CompanyStatus } from './types';

export const DashboardView: React.FC = () => {
  const { activeTab, loading } = useDashboard();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalArea, setNewModalArea] = useState<'prospect' | 'client'>('prospect');

  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [lossCompanyId, setLossCompanyId] = useState<string | null>(null);
  const [lossTargetStatus, setLossTargetStatus] = useState<CompanyStatus>('perdido');

  const handleOpenNewModal = (area: 'prospect' | 'client') => {
    setNewModalArea(area);
    setIsNewModalOpen(true);
  };

  const handleRequestLossReason = (companyId: string, targetStatus: CompanyStatus) => {
    setLossCompanyId(companyId);
    setLossTargetStatus(targetStatus);
    setLossModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a2428] text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#253339] border border-[#32454d] flex items-center justify-center p-2 mb-3 shadow-md animate-pulse">
          <Image 
            src="/brand/draft-rise-mark.png" 
            alt="Draft & Rise" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        <div className="font-bold text-sm tracking-wide">draftandrise dashboard</div>
        <div className="text-xs text-[#8c999e] mt-1">A carregar dados da equipa…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcfcfa] text-[#202d32] font-sans antialiased">
      {/* Sidebar fixo */}
      <DashboardSidebar />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onOpenNewModal={handleOpenNewModal} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <OverviewDashboard />}
          {activeTab === 'prospeccao' && (
            <KanbanBoard 
              onOpenNewModal={handleOpenNewModal} 
              onRequestLossReason={handleRequestLossReason} 
            />
          )}
          {activeTab === 'clientes' && <ClientList onOpenNewModal={handleOpenNewModal} />}
          {activeTab === 'semana' && <WeeklyChecklist />}
          {activeTab === 'financeiro' && <FinanceDashboard />}
          {activeTab === 'lixeira' && <TrashView />}
          {activeTab === 'configuracoes' && <SettingsView />}
        </main>
      </div>

      {/* Modais Globais */}
      <CompanyDetailModal />

      <NewCompanyModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultArea={newModalArea}
      />

      <LossReasonModal
        isOpen={lossModalOpen}
        onClose={() => setLossModalOpen(false)}
        companyId={lossCompanyId}
        targetStatus={lossTargetStatus}
      />
    </div>
  );
};
