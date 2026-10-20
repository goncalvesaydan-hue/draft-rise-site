'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Phone, 
  MessageSquare, 
  Filter, 
  MoreVertical,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { PIPELINE_STAGES } from './constants';
import { CompanyStatus } from './types';

interface KanbanBoardProps {
  onOpenNewModal: (area: 'prospect' | 'client') => void;
  onRequestLossReason: (companyId: string, targetStatus: CompanyStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  onOpenNewModal, 
  onRequestLossReason 
}) => {
  const { db, setSelectedCompanyId, moveCompanyStatus, searchQuery, showToast } = useDashboard();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<CompanyStatus | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  const companies = db.companies.filter(c => !c.deletedAt && c.area === 'prospect');

  const categories = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter(c => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const tagNames = c.tagIds.map(tid => db.tags.find(t => t.id === tid)?.name || '').join(' ').toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.whatsapp.toLowerCase().includes(q) ||
        tagNames.includes(q)
      );
    });
  }, [companies, selectedCategory, searchQuery, db.tags]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, status: CompanyStatus) => {
    e.preventDefault();
    if (hoveredColumn !== status) {
      setHoveredColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: CompanyStatus) => {
    e.preventDefault();
    setHoveredColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;

    if (status === 'perdido' || status === 'abandonado') {
      onRequestLossReason(id, status);
    } else {
      moveCompanyStatus(id, status);
    }
    setDraggedId(null);
  };

  const handleMoveViaDropdown = (companyId: string, targetStatus: CompanyStatus) => {
    if (targetStatus === 'perdido' || targetStatus === 'abandonado') {
      onRequestLossReason(companyId, targetStatus);
    } else {
      moveCompanyStatus(companyId, targetStatus);
      showToast('Etapa atualizada.', 'info');
    }
    setActiveCardMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar — Editorial Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#d8dddc]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
            Pipeline de Vendas
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] tracking-tight mt-0.5">
            Funil de Prospecção<span className="text-[#c74418]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#566266] mt-1">
            Gestão de leads e negociações em curso ({filtered.length} ativas).
          </p>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#f6f7f4] border border-[#d8dddc] px-3 py-1.5 rounded-full text-xs text-[#566266]">
              <Filter size={12} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[#202d32] font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => onOpenNewModal('prospect')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-full text-xs font-semibold shadow-xs shadow-[#ff6a36]/25 transition-all cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Nova Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container (com Snap Scroll nativo em mobile) */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 items-start min-h-[70vh] select-none snap-x snap-mandatory no-scrollbar">
        {PIPELINE_STAGES.filter(s => s.id !== 'cliente').map((stage) => {
          const stageCompanies = filtered.filter(c => c.status === stage.id);
          const isHovered = hoveredColumn === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={() => setHoveredColumn(null)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-[84vw] max-w-[320px] sm:w-80 shrink-0 bg-[#f6f7f4] rounded-xl flex flex-col max-h-[78vh] transition-colors border snap-center ${
                isHovered 
                  ? 'border-[#ff6a36] bg-[#fff8f5]' 
                  : 'border-[#d8dddc]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#d8dddc] flex items-center justify-between bg-white rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: stage.color }} 
                  />
                  <h2 className="font-semibold text-xs text-[#202d32] tracking-tight">
                    {stage.label}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[#566266] bg-[#f6f7f4] px-2 py-0.5 rounded-full border border-[#d8dddc]">
                    {stageCompanies.length}
                  </span>
                  <button
                    onClick={() => onOpenNewModal('prospect')}
                    className="w-6 h-6 rounded-md hover:bg-[#ff6a36]/10 hover:text-[#ff6a36] text-[#566266] flex items-center justify-center transition-colors cursor-pointer"
                    title={`Adicionar lead em ${stage.label}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageCompanies.map((c) => {
                  const companyTags = c.tagIds.map(tid => db.tags.find(t => t.id === tid)).filter(Boolean);
                  const isMenuOpen = activeCardMenuId === c.id;
                  const daysInFunnel = Math.max(0, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onClick={() => setSelectedCompanyId(c.id)}
                      className={`bg-white p-4 rounded-lg border border-[#d8dddc] hover:border-[#ff6a36] transition-all cursor-grab active:cursor-grabbing group relative ${
                        draggedId === c.id ? 'opacity-40 scale-98' : 'opacity-100'
                      }`}
                    >
                      {/* Top Row: Category & Dropdown */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[10px] font-semibold text-[#b5431c] tracking-wider uppercase truncate max-w-[170px]">
                          {c.category}
                        </span>

                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveCardMenuId(isMenuOpen ? null : c.id)}
                            className="p-1 rounded text-[#8c999e] hover:text-[#ff6a36] hover:bg-[#f6f7f4] transition-colors"
                            title="Mover etapa"
                          >
                            <MoreVertical size={13} />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-6 z-30 w-44 bg-white rounded-lg shadow-lg border border-[#d8dddc] py-1 text-xs">
                              <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#8c999e] tracking-wider border-b border-[#eef2f2]">
                                Mover para:
                              </div>
                              {PIPELINE_STAGES.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => handleMoveViaDropdown(c.id, s.id)}
                                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#f6f7f4] transition-colors cursor-pointer ${
                                    c.status === s.id ? 'font-semibold text-[#ff6a36]' : 'text-[#566266]'
                                  }`}
                                >
                                  <span>{s.label}</span>
                                  {c.status === s.id && <span>✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="font-semibold text-[#202d32] text-sm group-hover:text-[#ff6a36] transition-colors">
                        {c.name}
                      </div>

                      {/* City & Age */}
                      <div className="flex items-center justify-between text-xs text-[#566266] mt-1">
                        <span>{c.city || 'Portugal'}</span>
                        <span className="text-[10px] font-mono text-[#8c999e]">
                          {daysInFunnel === 0 ? 'Hoje' : `há ${daysInFunnel}d`}
                        </span>
                      </div>

                      {/* Contacts Toolbar */}
                      {(c.whatsapp || c.phone) && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0f2f2]">
                          <span className="text-[11px] font-mono text-[#566266]">
                            {c.whatsapp || c.phone}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {c.phone && (
                              <a
                                href={`tel:${c.phone}`}
                                className="p-1 rounded text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4] transition-colors"
                                title="Ligar"
                              >
                                <Phone size={13} />
                              </a>
                            )}
                            {c.whatsapp && (
                              <a
                                href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${c.name}, da equipa Draft & Rise!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-[#202d32] hover:text-[#c43f17] hover:bg-[#f6f7f4] transition-colors"
                                title="Abrir WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {companyTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {companyTags.map(t => (
                            <span
                              key={t!.id}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#d8dddc] text-[#566266] bg-[#f6f7f4]"
                            >
                              {t!.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {stageCompanies.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#8c999e] border border-dashed border-[#d8dddc] rounded-lg bg-white/40">
                    Sem registos nesta fase
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
