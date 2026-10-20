'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Building2, 
  Maximize2, 
  Upload, 
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  Archive,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { Idea, IdeaCategory, IdeaStatus } from './types';
import { compressImage } from './utils';

// Configurações visuais por Categoria — Paleta Institucional Draft & Rise (Sem emojis)
export const IDEA_CATEGORY_CONFIG: Record<IdeaCategory, { label: string; badge: string; color: string }> = {
  oferta: { label: 'Nova Oferta', badge: 'bg-[#ff6a36]/10 text-[#ff6a36] border-[#ff6a36]/25', color: '#ff6a36' },
  marketing: { label: 'Marketing & Vendas', badge: 'bg-[#236a50]/10 text-[#236a50] border-[#236a50]/25', color: '#236a50' },
  conteudo: { label: 'Conteúdo & Posts', badge: 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/25', color: '#0284c7' },
  processo: { label: 'Processos & SOPs', badge: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/25', color: '#7c3aed' },
  geral: { label: 'Geral', badge: 'bg-[#202d32]/10 text-[#202d32] border-[#202d32]/20', color: '#202d32' }
};

// Configurações visuais por Estado — Totalmente sem emojis, com ícones SVG discretos e cores funcionais
export const IDEA_STATUS_CONFIG: Record<IdeaStatus, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge: string }> = {
  ideia: { 
    label: 'Ideia Nova', 
    icon: Lightbulb, 
    badge: 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a]' 
  },
  estudo: { 
    label: 'Em Estudo', 
    icon: Clock, 
    badge: 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]' 
  },
  aprovada: { 
    label: 'Aprovada', 
    icon: CheckCircle2, 
    badge: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' 
  },
  arquivada: { 
    label: 'Arquivada', 
    icon: Archive, 
    badge: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]' 
  }
};

export const IdeasBoard: React.FC = () => {
  const { db, createIdea, updateIdea, deleteIdea, setSelectedCompanyId } = useDashboard();

  const [categoryFilter, setCategoryFilter] = useState<'all' | IdeaCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IdeaStatus>('all');
  const [localSearch, setLocalSearch] = useState('');

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<IdeaCategory>('geral');
  const [formStatus, setFormStatus] = useState<IdeaStatus>('ideia');
  const [formCompanyId, setFormCompanyId] = useState<string>('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Lightbox Modal
  const [lightboxData, setLightboxData] = useState<{ images: string[]; currentIndex: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ideasList = db.ideas || [];

  // Estatísticas Rápidas
  const totalIdeas = ideasList.length;
  const inStudyCount = ideasList.filter(i => i.status === 'estudo').length;
  const approvedCount = ideasList.filter(i => i.status === 'aprovada').length;
  const withImagesCount = ideasList.filter(i => i.images && i.images.length > 0).length;

  // Filtragem
  const filteredIdeas = useMemo(() => {
    return ideasList.filter((idea) => {
      if (categoryFilter !== 'all' && idea.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && idea.status !== statusFilter) return false;
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchesTitle = idea.title.toLowerCase().includes(q);
        const matchesContent = idea.content.toLowerCase().includes(q);
        const associatedComp = db.companies.find(c => c.id === idea.companyId);
        const matchesCompany = associatedComp ? associatedComp.name.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesContent && !matchesCompany) return false;
      }
      return true;
    });
  }, [ideasList, categoryFilter, statusFilter, localSearch, db.companies]);

  // Abrir Modal para Nova Ideia
  const handleOpenNew = () => {
    setEditingIdeaId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('geral');
    setFormStatus('ideia');
    setFormCompanyId('');
    setFormImages([]);
    setIsFormOpen(true);
  };

  // Abrir Modal para Edição
  const handleOpenEdit = (idea: Idea) => {
    setEditingIdeaId(idea.id);
    setFormTitle(idea.title);
    setFormContent(idea.content);
    setFormCategory(idea.category);
    setFormStatus(idea.status);
    setFormCompanyId(idea.companyId || '');
    setFormImages(idea.images || []);
    setIsFormOpen(true);
  };

  // Processar Imagens
  const processImageFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setIsCompressing(true);
    try {
      const compressedResults: string[] = [];
      for (const file of validFiles) {
        const compressed = await compressImage(file, 1400, 1400, 0.82);
        compressedResults.push(compressed);
      }
      setFormImages(prev => [...prev, ...compressedResults]);
    } catch (err) {
      console.error('Erro ao comprimir imagens:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Evento de colar imagens com Cmd+V / Ctrl+V
  const handlePasteEvent = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      await processImageFiles(files);
    }
  };

  // Guardar Ideia
  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingIdeaId) {
      updateIdea(editingIdeaId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        companyId: formCompanyId || undefined,
        images: formImages
      });
    } else {
      createIdea({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        companyId: formCompanyId || undefined,
        images: formImages
      });
    }

    setIsFormOpen(false);
  };

  // Remover imagem selecionada no formulário
  const handleRemoveFormImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Abrir Lightbox
  const handleOpenLightbox = (images: string[], index = 0) => {
    setLightboxData({ images, currentIndex: index });
  };

  // Navegação no Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxData) return;
      if (e.key === 'Escape') setLightboxData(null);
      if (e.key === 'ArrowRight') {
        setLightboxData(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length } : null);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxData(prev => prev ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxData]);

  const activeCompanies = db.companies.filter(c => !c.deletedAt);

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER INSTITUCIONAL DRAFT & RISE
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6a36]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Inovação & Estratégia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202d32] mt-1">
            Bloco de Ideias
          </h1>
          <p className="text-xs text-[#566266] mt-1">
            Registo operacional de oportunidades, novas ofertas, campanhas e referências visuais da agência.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          style={{ color: '#ffffff' }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/25 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={15} className="shrink-0" />
          <span>Nova Ideia</span>
        </button>
      </div>

      {/* ========================================================
          2. INDICADORES (SECTOR CARDS ESTILO DRAFT & RISE)
      ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Total de Ideias
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dce9ee] text-[#202d32] grid place-items-center">
              <Lightbulb size={14} className="sm:hidden" />
              <Lightbulb size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32]">
              {totalIdeas}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Todas as categorias
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#1e40af]">
              Em Estudo
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dbeafe] text-[#1e40af] grid place-items-center">
              <Clock size={14} className="sm:hidden" />
              <Clock size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1e40af]">
              {inStudyCount}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Em fase de análise
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#236a50]">
              Aprovadas
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dcfce7] text-[#236a50] grid place-items-center">
              <CheckCircle2 size={14} className="sm:hidden" />
              <CheckCircle2 size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#236a50]">
              {approvedCount}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Validadas para execução
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Com Imagens
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ffcaa8]/40 text-[#c74418] grid place-items-center">
              <ImageIcon size={14} className="sm:hidden" />
              <ImageIcon size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32]">
              {withImagesCount}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Com referências visuais
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BARRA DE FILTROS & PESQUISA (SEGMENTED PILLS CLAROS)
      ======================================================== */}
      <div className="p-3 sm:p-4 rounded-xl border border-[#d8dddc] bg-white space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Pesquisa Local */}
          <div className="relative flex-1">
            <Search size={14} className="text-[#8c999e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por título, notas ou cliente associado..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full !pl-9 pr-8 py-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] placeholder:text-[#8c999e] focus:outline-none focus:border-[#ff6a36]"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c999e] hover:text-[#ff6a36] cursor-pointer"
                title="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Control de Estados (Pills com scroll horizontal suave no mobile) */}
          <div className="inline-flex p-1 rounded-full bg-[#f6f7f4] border border-[#d8dddc] overflow-x-auto no-scrollbar shrink-0 max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={statusFilter === 'all' ? { color: '#ffffff' } : {}}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#202d32] !text-white shadow-xs'
                  : 'text-[#566266] hover:text-[#202d32]'
              }`}
            >
              Todas ({ideasList.length})
            </button>
            {(Object.keys(IDEA_STATUS_CONFIG) as IdeaStatus[]).map(stKey => {
              const conf = IDEA_STATUS_CONFIG[stKey];
              const isSelected = statusFilter === stKey;
              const count = ideasList.filter(i => i.status === stKey).length;
              return (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => setStatusFilter(stKey)}
                  style={isSelected ? { color: '#ffffff' } : {}}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#202d32] !text-white shadow-xs'
                      : 'text-[#566266] hover:text-[#202d32]'
                  }`}
                >
                  <span>{conf.label}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#e3e7ee]' : 'text-[#8c999e]'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha de Categorias (Botões Pílula com Contraste Perfeito) */}
        <div className="pt-2 border-t border-[#d8dddc] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
          <span className="text-[#8c999e] font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
            Categorias:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            style={categoryFilter === 'all' ? { color: '#ffffff' } : {}}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#202d32] !text-white shadow-xs'
                : 'bg-white border border-[#d8dddc] text-[#566266] hover:border-[#202d32] hover:text-[#202d32]'
            }`}
          >
            Todas
          </button>
          {(Object.keys(IDEA_CATEGORY_CONFIG) as IdeaCategory[]).map(catKey => {
            const catConf = IDEA_CATEGORY_CONFIG[catKey];
            const isCatActive = categoryFilter === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                style={isCatActive ? { color: '#ffffff' } : {}}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isCatActive
                    ? 'bg-[#ff6a36] !text-white shadow-xs border border-[#ff6a36]'
                    : 'bg-white border border-[#d8dddc] text-[#566266] hover:border-[#ff6a36] hover:text-[#ff6a36]'
                }`}
              >
                {catConf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. GRELHA DE CARDS DE IDEIAS
      ======================================================== */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {filteredIdeas.map((idea) => {
            const catConf = IDEA_CATEGORY_CONFIG[idea.category] || IDEA_CATEGORY_CONFIG.geral;
            const statConf = IDEA_STATUS_CONFIG[idea.status] || IDEA_STATUS_CONFIG.ideia;
            const StatusIcon = statConf.icon;
            const associatedCompany = idea.companyId ? db.companies.find(c => c.id === idea.companyId) : null;
            const hasImages = idea.images && idea.images.length > 0;
            const coverImage = hasImages ? idea.images[0] : null;

            return (
              <div
                key={idea.id}
                className="rounded-xl border border-[#d8dddc] bg-[#f6f7f4] hover:bg-[#fcfcfa] hover:border-[#ff6a36] hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Imagem de Capa (se existir) */}
                {coverImage && (
                  <div 
                    className="relative w-full h-44 bg-[#e8eae6] overflow-hidden cursor-pointer group/img"
                    onClick={() => handleOpenLightbox(idea.images, 0)}
                  >
                    <img 
                      src={coverImage} 
                      alt={idea.title} 
                      className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center">
                      <div 
                        style={{ color: '#ffffff' }}
                        className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-[#202d32]/90 !text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md"
                      >
                        <Maximize2 size={13} />
                        <span>Ver imagem ({idea.images.length})</span>
                      </div>
                    </div>
                    {idea.images.length > 1 && (
                      <span 
                        style={{ color: '#ffffff' }}
                        className="absolute bottom-2.5 right-2.5 bg-[#202d32]/85 !text-white text-[10px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1"
                      >
                        <ImageIcon size={11} />
                        <span>+{idea.images.length - 1} fotos</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Corpo do Cartão */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Badges de Categoria e Estado (Sem emojis) */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${catConf.badge}`}>
                        {catConf.label}
                      </span>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statConf.badge} flex items-center gap-1.5`}>
                        <StatusIcon size={12} className="shrink-0" />
                        <span>{statConf.label}</span>
                      </span>
                    </div>

                    {/* Título */}
                    <h2 
                      onClick={() => handleOpenEdit(idea)}
                      className="font-bold text-base text-[#202d32] group-hover:text-[#ff6a36] transition-colors cursor-pointer leading-snug"
                    >
                      {idea.title}
                    </h2>

                    {/* Conteúdo / Notas */}
                    {idea.content && (
                      <p className="text-xs text-[#566266] mt-2 line-clamp-4 leading-relaxed whitespace-pre-line">
                        {idea.content}
                      </p>
                    )}

                    {/* Miniaturas adicionais */}
                    {hasImages && idea.images.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#d8dddc]">
                        {idea.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => handleOpenLightbox(idea.images, imgIdx)}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-[#d8dddc] hover:border-[#ff6a36] cursor-pointer shrink-0 transition-transform hover:scale-105"
                          >
                            <img src={img} alt={`Anexo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Cartão */}
                  <div className="pt-3 border-t border-[#d8dddc] flex items-center justify-between gap-2 text-xs text-[#566266]">
                    {associatedCompany ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCompanyId(associatedCompany.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#202d32] hover:text-[#ff6a36] transition-colors truncate max-w-[140px]"
                        title="Ver ficha da empresa"
                      >
                        <Building2 size={12} className="text-[#ff6a36] shrink-0" />
                        <span className="truncate">{associatedCompany.name}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#8c999e]">Ideia Geral</span>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(idea)}
                        className="p-1.5 text-[#566266] hover:text-[#ff6a36] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Editar ideia"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover a ideia "${idea.title}"?`)) {
                            deleteIdea(idea.id);
                          }
                        }}
                        className="p-1.5 text-[#8c999e] hover:text-[#c43f17] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Eliminar ideia"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vazio */
        <div className="p-12 text-center bg-[#f6f7f4] rounded-xl border border-[#d8dddc] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ff6a36]/10 text-[#ff6a36] mx-auto flex items-center justify-center">
            <Lightbulb size={22} />
          </div>
          <h2 className="font-semibold text-base text-[#202d32]">
            {ideasList.length === 0 ? 'Nenhuma ideia registada' : 'Nenhuma ideia encontrada com os filtros selecionados'}
          </h2>
          <p className="text-xs text-[#566266] max-w-md mx-auto leading-relaxed">
            {ideasList.length === 0
              ? 'Usa este espaço para anotar ideias de campanhas, novas ofertas de serviços ou referências visuais para os clientes da agência.'
              : 'Tenta redefinir a categoria ou o termo de pesquisa.'}
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            style={{ color: '#ffffff' }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] !text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/20 cursor-pointer mt-2"
          >
            <Plus size={15} />
            <span>Criar Nova Ideia</span>
          </button>
        </div>
      )}

      {/* ========================================================
          5. MODAL DE CRIAÇÃO / EDIÇÃO DE IDEIA
      ======================================================== */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onPaste={handlePasteEvent}
        >
          <div className="bg-white rounded-2xl border border-[#d8dddc] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#d8dddc] flex items-center justify-between bg-[#fcfcfa]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ff6a36]/10 text-[#ff6a36] grid place-items-center">
                  <Lightbulb size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#202d32]">
                    {editingIdeaId ? 'Editar Ideia' : 'Registar Nova Ideia'}
                  </h2>
                  <p className="text-xs text-[#566266]">
                    Podes escrever notas e colar imagens diretamente com Cmd+V / Ctrl+V.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg text-[#566266] hover:bg-[#f6f7f4] hover:text-[#202d32] grid place-items-center transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveIdea} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1">
                  Título da Ideia <span className="text-[#ff6a36]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Oferta de Auditoria Google 48h para Clínicas Dentárias"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-3 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
              </div>

              {/* Categoria e Estado em Linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as IdeaCategory)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                  >
                    <option value="geral">Geral</option>
                    <option value="oferta">Nova Oferta</option>
                    <option value="marketing">Marketing & Vendas</option>
                    <option value="conteudo">Conteúdo & Posts</option>
                    <option value="processo">Processos & SOPs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Estado da Ideia
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as IdeaStatus)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                  >
                    <option value="ideia">Ideia Nova (Rascunho)</option>
                    <option value="estudo">Em Estudo / Análise</option>
                    <option value="aprovada">Aprovada / Ativa</option>
                    <option value="arquivada">Arquivada</option>
                  </select>
                </div>
              </div>

              {/* Associação Opcional a Cliente */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1">
                  Associar a Cliente ou Lead (Opcional)
                </label>
                <select
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                >
                  <option value="">Ideia Geral (Sem cliente associado)</option>
                  {activeCompanies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.status === 'cliente' ? 'Cliente' : 'Lead'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#202d32]">
                    Notas & Descrição
                  </label>
                  <span className="text-[11px] text-[#8c999e]">Podes colar prints com Cmd+V</span>
                </div>
                <textarea
                  rows={5}
                  placeholder="Descreve a oportunidade, passos de execução ou notas da ideia..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  onPaste={handlePasteEvent}
                  className="w-full p-3 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] resize-y"
                />
              </div>

              {/* Secção de Imagens e Anexos */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#ff6a36]" />
                    <span>Imagens e Referências Visuais ({formImages.length})</span>
                  </span>
                  {isCompressing && (
                    <span className="text-xs text-[#ff6a36] animate-pulse">A comprimir imagem…</span>
                  )}
                </label>

                {/* Zona de Drop / Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) processImageFiles(e.dataTransfer.files);
                  }}
                  className="p-5 border-2 border-dashed border-[#d8dddc] hover:border-[#ff6a36] rounded-xl bg-[#fcfcfa] hover:bg-white text-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) processImageFiles(e.target.files);
                    }}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-xs text-[#566266]">
                    <Upload size={18} className="text-[#ff6a36]" />
                    <span className="font-semibold text-[#202d32]">
                      Arrasta imagens para aqui ou clica para selecionar
                    </span>
                    <span className="text-[11px] text-[#8c999e]">
                      Suporta PNG, JPG, WebP. Ou prime <strong>Cmd+V</strong> para colar um screenshot.
                    </span>
                  </div>
                </div>

                {/* Galeria de Miniaturas no Modal */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative group/thumb rounded-lg overflow-hidden border border-[#d8dddc] h-20 bg-[#f6f7f4]">
                        <img src={img} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-[#c43f17] text-white rounded-full grid place-items-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                          title="Remover imagem"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 border-t border-[#d8dddc] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#566266] hover:bg-[#f6f7f4] border border-[#d8dddc] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCompressing || !formTitle.trim()}
                  style={{ color: '#ffffff' }}
                  className="px-6 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingIdeaId ? 'Salvar Alterações' : 'Criar Ideia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL LIGHTBOX
      ======================================================== */}
      {lightboxData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
          onClick={() => setLightboxData(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxData.images[lightboxData.currentIndex]}
              alt={`Imagem ${lightboxData.currentIndex + 1}`}
              className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
            />

            <button
              onClick={() => setLightboxData(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X size={24} />
            </button>

            {lightboxData.images.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxData(prev => prev ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length } : null)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white grid place-items-center transition-colors cursor-pointer"
                  title="Imagem anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setLightboxData(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length } : null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white grid place-items-center transition-colors cursor-pointer"
                  title="Próxima imagem"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="mt-3 text-xs text-white/70 font-mono">
                  {lightboxData.currentIndex + 1} de {lightboxData.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
