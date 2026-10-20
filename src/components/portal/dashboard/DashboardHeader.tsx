'use client';

import React, { useRef, useEffect } from 'react';
import { Search, Plus, RefreshCw, Menu } from 'lucide-react';
import { useDashboard } from './DashboardContext';

interface DashboardHeaderProps {
  onOpenNewModal: (area: 'prospect' | 'client') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOpenNewModal }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    syncCloud, 
    db, 
    activeTab, 
    setIsMobileSidebarOpen 
  } = useDashboard();
  
  const [syncing, setSyncing] = React.useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSync = async () => {
    if (!db.sync.enabled) return;
    setSyncing(true);
    await syncCloud();
    setTimeout(() => setSyncing(false), 500);
  };

  const tabLabels: Record<string, string> = {
    dashboard: 'Painel Operacional',
    prospeccao: 'Funil Prospecção',
    clientes: 'Empresas & Clientes',
    semana: 'Rotina Semanal',
    ideias: 'Bloco de Ideias',
    financeiro: 'Controlo Avenças',
    lixeira: 'Arquivo',
    configuracoes: 'Configurações'
  };

  return (
    <header className="h-18 bg-[#fcfcfa]/95 backdrop-blur-md border-b border-[#202d32]/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Toggle + Brand Status & Search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#202d32] hover:bg-[#f6f7f4] border border-[#d8dddc] transition-colors"
          title="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-[#d8dddc] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c74418]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#202d32]">
            {tabLabels[activeTab] || 'Dashboard'}
          </span>
        </div>

        {/* Search Bar com estetica do site (rounded-full, subtle border) */}
        <div className="relative flex-1">
          <Search 
            size={15} 
            className="text-[#8c999e] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" 
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Pesquisar por nome, nicho ou cidade... (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', paddingRight: '40px' }}
            className="dashboard-search-input w-full !pl-11 !pr-10 py-2.5 bg-[#f6f7f4] border border-[#d8dddc] !rounded-full text-xs sm:text-sm text-[#202d32] placeholder:text-[#8c999e] focus:outline-none focus:border-[#ff6a36] transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8c999e] hover:text-[#ff6a36] cursor-pointer p-1 z-10"
              title="Limpar pesquisa"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8c999e] bg-white px-1.5 py-0.5 rounded border border-[#d8dddc] pointer-events-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Action Buttons — Estilo Draft & Rise */}
      <div className="flex items-center gap-2.5 sm:gap-3 pl-3 shrink-0">
        {db.sync.enabled && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#202d32] bg-[#f6f7f4] hover:bg-white hover:text-[#ff6a36] border border-[#d8dddc] hover:border-[#ff6a36] rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Sincronizar"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        )}

        <button
          onClick={() => onOpenNewModal('prospect')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] rounded-full shadow-xs shadow-[#ff6a36]/25 transition-all cursor-pointer"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>Nova Empresa</span>
        </button>
      </div>
    </header>
  );
};
