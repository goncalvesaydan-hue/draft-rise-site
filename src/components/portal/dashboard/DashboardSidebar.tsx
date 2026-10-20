'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  CheckSquare, 
  BadgeEuro, 
  Trash2, 
  Settings, 
  Cloud, 
  CloudOff, 
  Bot, 
  ExternalLink,
  X,
  Lightbulb
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { NavigationTab } from './types';

export const DashboardSidebar: React.FC = () => {
  const { activeTab, setActiveTab, db, isMobileSidebarOpen, setIsMobileSidebarOpen } = useDashboard();

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'dashboard', label: 'Painel Operacional', icon: LayoutDashboard },
    { id: 'prospeccao', label: 'Funil Prospecção', icon: Kanban },
    { id: 'clientes', label: 'Empresas & Clientes', icon: Users },
    { id: 'semana', label: 'Rotina Semanal', icon: CheckSquare },
    { id: 'ideias', label: 'Bloco de Ideias', icon: Lightbulb },
    { id: 'financeiro', label: 'Controlo Avenças', icon: BadgeEuro },
    { id: 'lixeira', label: 'Arquivo', icon: Trash2 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const activeClientsCount = db.companies.filter(c => !c.deletedAt && c.status === 'cliente').length;
  const prospectsCount = db.companies.filter(c => !c.deletedAt && c.area === 'prospect').length;
  const ideasCount = (db.ideas || []).filter(i => i.status !== 'arquivada').length;

  const handleSelectTab = (id: NavigationTab) => {
    setActiveTab(id);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-50
        w-64 bg-[#1a2428] text-[#e3e7ee] flex flex-col shrink-0 h-screen border-r border-[#26343b] select-none
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header — draftandrise dashboard */}
        <div className="p-5 border-b border-[#26343b] flex items-center justify-between">
          <Link 
            href="/equipa/dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#253339] border border-[#32454d] flex items-center justify-center p-1.5 shadow-sm group-hover:border-[#ff6a36]/50 transition-colors">
              <Image 
                src="/brand/draft-rise-mark.png" 
                alt="Draft & Rise" 
                width={26} 
                height={26} 
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-semibold text-white text-[17px] tracking-tight flex items-center">
                <span>draft&amp;rise</span>
                <span className="text-[#c74418] font-bold">.</span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-[#a6b4b9]">
                dashboard
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#8c999e] hover:text-white hover:bg-[#253339] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Link para Questionários Bot */}
        <div className="p-3 border-b border-[#26343b]/80">
          <Link
            href="/equipa"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#a6b4b9] hover:text-white hover:bg-[#253339] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Bot size={15} className="text-[#ff6a36]" />
              <span>Questionários Bot</span>
            </div>
            <ExternalLink size={12} className="text-[#718288] group-hover:text-white" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#78888e]">
            Operação
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#253339] text-white font-semibold'
                    : 'text-[#c2cbcf] hover:bg-[#202d32] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#ff6a36]' : 'bg-transparent'}`} />
                  <Icon size={15} className={isActive ? 'text-[#ff6a36]' : 'text-[#8c999e]'} />
                  <span>{item.label}</span>
                </div>

                {item.id === 'clientes' && activeClientsCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1a2428] text-[#a6b4b9]">
                    {activeClientsCount}
                  </span>
                )}
                {item.id === 'prospeccao' && prospectsCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1a2428] text-[#ffcaa8]">
                    {prospectsCount}
                  </span>
                )}
                {item.id === 'ideias' && ideasCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1a2428] text-[#facc15]">
                    {ideasCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#26343b] text-xs text-[#8c999e]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Sincronização:</span>
            {db.sync.enabled ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Cloud size={12} /> Nuvem ativa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#8c999e]">
                <CloudOff size={12} /> Local
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#718288]">
            {db.companies.filter(c => !c.deletedAt).length} empresas registadas
          </div>
        </div>
      </aside>
    </>
  );
};
