'use client';

import React, { useRef, useEffect } from 'react';
import { Search, Plus, RefreshCw, Menu, Sun, Moon, Monitor, X } from 'lucide-react';
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
    setIsMobileSidebarOpen,
    theme,
    setTheme
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
    calendario: 'Agenda & Calendário',
    ideias: 'Bloco de Ideias',
    financeiro: 'Controlo Avenças',
    lixeira: 'Arquivo',
    configuracoes: 'Configurações'
  };

  return (
    <header className="h-18 bg-[#fcfcfa]/95 dark:bg-[#141c20]/95 backdrop-blur-md border-b border-[#202d32]/10 dark:border-[#2a3a41] px-3 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors gap-2 sm:gap-4">
      {/* Mobile Toggle + Brand Status & Search */}
      <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#202d32] dark:text-[#f5f7f7] hover:bg-[#f6f7f4] dark:hover:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] transition-colors shrink-0"
          title="Abrir menu"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-[#d8dddc] dark:border-[#2a3a41] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c74418]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#202d32] dark:text-[#f5f7f7]">
            {tabLabels[activeTab] || 'Dashboard'}
          </span>
        </div>

        {/* Search Bar com estetica do site (rounded-full, subtle border) */}
        <div className="relative flex-1 min-w-0">
          <Search 
            size={15} 
            className="text-[#8c999e] absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" 
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dashboard-search-input w-full !pl-10 sm:!pl-11 !pr-8 sm:!pr-10 py-2 sm:py-2.5 bg-[#f6f7f4] dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] !rounded-full text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36] transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c999e] hover:text-[#ff6a36] cursor-pointer p-1 z-10"
              title="Limpar pesquisa"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8c999e] dark:text-[#70848c] bg-white dark:bg-[#1c272c] px-1.5 py-0.5 rounded border border-[#d8dddc] dark:border-[#2a3a41] pointer-events-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Action Buttons — Estilo Draft & Rise */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Seletor de Tema Tríade: Claro, Noturno (Night) e Sistema */}
        <div className="flex items-center bg-[#f6f7f4] dark:bg-[#192327] border border-[#d8dddc] dark:border-[#2a3a41] rounded-full p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Modo Claro"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white dark:bg-[#223136] text-[#ff6a36] shadow-xs'
                : 'text-[#8c999e] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            <Sun size={13} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Modo Noturno (Night)"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#141c20] dark:bg-[#223136] text-[#ff6a36] shadow-xs'
                : 'text-[#8c999e] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            <Moon size={13} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            title="Automático (Segue o Sistema Operacional)"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-white dark:bg-[#223136] text-[#236a50] dark:text-[#34b785] shadow-xs'
                : 'text-[#8c999e] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            <Monitor size={13} />
          </button>
        </div>

        {db.sync.enabled && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-white dark:hover:bg-[#25353d] hover:text-[#ff6a36] border border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
            title="Sincronizar"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        )}

        <button
          onClick={() => onOpenNewModal('prospect')}
          title="Nova Empresa"
          aria-label="Nova Empresa"
          style={{ color: '#ffffff' }}
          className="inline-flex items-center justify-center gap-1.5 h-9 w-9 sm:w-auto p-0 sm:px-4 sm:py-2 text-xs font-semibold !text-white bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] rounded-full shadow-xs shadow-[#ff6a36]/25 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span className="hidden sm:inline">Nova Empresa</span>
        </button>
      </div>
    </header>
  );
};
