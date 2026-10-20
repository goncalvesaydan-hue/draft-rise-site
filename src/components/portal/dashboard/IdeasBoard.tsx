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
  Check, 
  Archive, 
  ArrowRight, 
  X, 
  Maximize2, 
  Upload, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { Idea, IdeaCategory, IdeaStatus } from './types';
import { formatDate, compressImage } from './utils';

// Configurações visuais por Categoria
export const IDEA_CATEGORY_CONFIG: Record<IdeaCategory, { label: string; bg: string; text: string; border: string }> = {
  oferta: { label: 'Nova Oferta', bg: 'bg-[#ff6a36]/10', text: 'text-[#ff6a36]', border: 'border-[#ff6a36]/30' },
  marketing: { label: 'Marketing & Vendas', bg: 'bg-[#236a50]/10', text: 'text-[#236a50]', border: 'border-[#236a50]/30' },
  conteudo: { label: 'Ideias de Conteúdo', bg: 'bg-[#3b82f6]/10', text: 'text-[#2563eb]', border: 'border-[#3b82f6]/30' },
  processo: { label: 'Processos & SOPs', bg: 'bg-[#8b5cf6]/10', text: 'text-[#7c3aed]', border: 'border-[#8b5cf6]/30' },
  geral: { label: 'Geral', bg: 'bg-[#202d32]/10', text: 'text-[#202d32]', border: 'border-[#202d32]/20' }
};

// Configurações visuais por Estado
export const IDEA_STATUS_CONFIG: Record<IdeaStatus, { label: string; icon: string; bg: string; text: string; border: string }> = {
  ideia: { label: 'Ideia Nova', icon: '💡', bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', border: 'border-[#fef08a]' },
  estudo: { label: 'Em Estudo', icon: '🔍', bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]', border: 'border-[#bfdbfe]' },
  aprovada: { label: 'Aprovada / Ativa', icon: '🚀', bg: 'bg-[#dcfce7]', text: 'text-[#166534]', border: 'border-[#bbf7d0]' },
  arquivada: { label: 'Arquivada', icon: '📦', bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', border: 'border-[#e2e8f0]' }
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

  // Processar Imagens (Upload ou Colar da Área de Transferência)
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
          1. HEADER & RESUMO DO BLOCO DE IDEIAS
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6a36]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Brainstorming & Inovação
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202d32] mt-0.5">
            Bloco de Ideias
          </h1>
          <p className="text-xs text-[#566266] mt-1">
            Espaço criativo para registar novas ideias de ofertas, campanhas, prints de inspiração e melhorias da agência.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={15} />
          <span>Nova Ideia</span>
        </button>
      </div>

      {/* Grid de 4 Indicadores Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#566266]">Total Registadas</span>
          <div className="text-2xl font-bold text-[#202d32] mt-1">{totalIdeas}</div>
          <span className="text-[11px] text-[#566266] mt-1">Todas as categorias</span>
        </div>

        <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e40af]">Em Estudo</span>
          <div className="text-2xl font-bold text-[#1e40af] mt-1">{inStudyCount}</div>
          <span className="text-[11px] text-[#566266] mt-1">Prontas para avaliar</span>
        </div>

        <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">Aprovadas</span>
          <div className="text-2xl font-bold text-[#166534] mt-1">{approvedCount}</div>
          <span className="text-[11px] text-[#566266] mt-1">Em execução / validadas</span>
        </div>

        <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6a36]">Com Imagens</span>
          <div className="text-2xl font-bold text-[#202d32] mt-1">{withImagesCount}</div>
          <span className="text-[11px] text-[#566266] mt-1">Prints e referências visuais</span>
        </div>
      </div>

      {/* ========================================================
          2. FILTROS & BARRA DE PESQUISA
      ======================================================== */}
      <div className="p-4 rounded-xl border border-[#d8dddc] bg-white space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Campo de Pesquisa Local */}
          <div className="relative flex-1">
            <Search size={14} className="text-[#8c999e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por título, notas ou cliente associado..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full !pl-9 pr-8 py-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] placeholder:text-[#8c999e] focus:outline-none focus:border-[#ff6a36]"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c999e] hover:text-[#ff6a36] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro de Estado em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#202d32] text-white shadow-xs'
                  : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#ebece8]'
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
                  onClick={() => setStatusFilter(stKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#202d32] text-white shadow-xs'
                      : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#ebece8]'
                  }`}
                >
                  <span>{conf.icon}</span>
                  <span>{conf.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Categorias */}
        <div className="pt-2 border-t border-[#d8dddc] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[#8c999e] font-medium mr-1 text-[11px] shrink-0">Categorias:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#202d32] text-white'
                : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#ebece8]'
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
                onClick={() => setCategoryFilter(catKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  isCatActive
                    ? 'bg-[#ff6a36] text-white'
                    : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#ebece8]'
                }`}
              >
                {catConf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. GRELHA DE CARDS DE IDEIAS (ESTILO PINTEREST / CARDS)
      ======================================================== */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {filteredIdeas.map((idea) => {
            const catConf = IDEA_CATEGORY_CONFIG[idea.category] || IDEA_CATEGORY_CONFIG.geral;
            const statConf = IDEA_STATUS_CONFIG[idea.status] || IDEA_STATUS_CONFIG.ideia;
            const associatedCompany = idea.companyId ? db.companies.find(c => c.id === idea.companyId) : null;
            const hasImages = idea.images && idea.images.length > 0;
            const coverImage = hasImages ? idea.images[0] : null;

            return (
              <div
                key={idea.id}
                className="rounded-xl border border-[#d8dddc] bg-white hover:border-[#ff6a36] hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Imagem de Capa (se existir) */}
                {coverImage && (
                  <div 
                    className="relative w-full h-44 bg-[#f6f7f4] overflow-hidden cursor-pointer group/img"
                    onClick={() => handleOpenLightbox(idea.images, 0)}
                  >
                    <img 
                      src={coverImage} 
                      alt={idea.title} 
                      className="w-full h-full object-cover group-hover/img:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/75 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Maximize2 size={12} />
                        <span>Ver imagem ({idea.images.length})</span>
                      </div>
                    </div>
                    {idea.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon size={10} />
                        +{idea.images.length - 1} fotos
                      </span>
                    )}
                  </div>
                )}

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Badges de Categoria e Estado */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${catConf.bg} ${catConf.text} ${catConf.border}`}>
                        {catConf.label}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statConf.bg} ${statConf.text} ${statConf.border} flex items-center gap-1`}>
                        <span>{statConf.icon}</span>
                        <span>{statConf.label}</span>
                      </span>
                    </div>

                    {/* Título da Ideia */}
                    <h2 
                      onClick={() => handleOpenEdit(idea)}
                      className="font-bold text-base text-[#202d32] hover:text-[#ff6a36] transition-colors cursor-pointer leading-snug"
                    >
                      {idea.title}
                    </h2>

                    {/* Descrição / Texto da Ideia */}
                    {idea.content && (
                      <p className="text-xs text-[#566266] mt-2 line-clamp-4 leading-relaxed whitespace-pre-line">
                        {idea.content}
                      </p>
                    )}

                    {/* Galeria de Thumbnails caso haja mais de 1 imagem */}
                    {hasImages && idea.images.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#f0f2f0]">
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

                  {/* Rodapé do Card */}
                  <div className="pt-3 border-t border-[#d8dddc] flex items-center justify-between gap-2 text-xs text-[#566266]">
                    {/* Empresa Associada */}
                    {associatedCompany ? (
                      <button
                        onClick={() => setSelectedCompanyId(associatedCompany.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#202d32] hover:text-[#ff6a36] transition-colors truncate max-w-[140px]"
                        title="Ver ficha da empresa associada"
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
                        onClick={() => handleOpenEdit(idea)}
                        className="p-1.5 text-[#566266] hover:text-[#ff6a36] hover:bg-[#f6f7f4] rounded-lg transition-colors cursor-pointer"
                        title="Editar ideia"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remover a ideia "${idea.title}"?`)) {
                            deleteIdea(idea.id);
                          }
                        }}
                        className="p-1.5 text-[#8c999e] hover:text-[#c43f17] hover:bg-[#f6f7f4] rounded-lg transition-colors cursor-pointer"
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
        <div className="p-12 text-center bg-white rounded-2xl border border-[#d8dddc] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ff6a36]/10 text-[#ff6a36] mx-auto flex items-center justify-center">
            <Lightbulb size={24} />
          </div>
          <h2 className="font-bold text-base text-[#202d32]">
            {ideasList.length === 0 ? 'O teu Bloco de Ideias está limpo' : 'Nenhuma ideia encontrada com estes filtros'}
          </h2>
          <p className="text-xs text-[#566266] max-w-md mx-auto leading-relaxed">
            {ideasList.length === 0
              ? 'Regista aqui tudo o que a equipa brainstormar: ideias de reels, campanhas para clientes, novas ofertas ou prints de inspiração.'
              : 'Tenta alterar a categoria ou o termo de pesquisa selecionado.'}
          </p>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/20 cursor-pointer mt-2"
          >
            <Plus size={15} />
            <span>Criar Primeira Ideia</span>
          </button>
        </div>
      )}

      {/* ========================================================
          4. MODAL DE CRIAÇÃO & EDIÇÃO DE IDEIA (COM UPLOAD & PASTE)
      ======================================================== */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onPaste={handlePasteEvent}
        >
          <div className="bg-white rounded-2xl border border-[#d8dddc] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#d8dddc] flex items-center justify-between bg-[#fcfcfa]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ff6a36]/10 text-[#ff6a36] grid place-items-center">
                  <Lightbulb size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#202d32]">
                    {editingIdeaId ? 'Editar Ideia' : 'Registar Nova Ideia'}
                  </h2>
                  <p className="text-xs text-[#566266]">
                    Podes escrever texto e colar imagens diretamente com Cmd+V / Ctrl+V.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg text-[#566266] hover:bg-[#f6f7f4] hover:text-[#202d32] grid place-items-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveIdea} className="p-6 space-y-4 overflow-y-auto flex-1">
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
                  className="w-full p-3 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
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
                    <option value="marketing">Marketing & Aquisição</option>
                    <option value="conteudo">Ideia de Conteúdo / Post</option>
                    <option value="processo">Processo / SOP Agência</option>
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
                    <option value="ideia">💡 Ideia Nova (Rascunho)</option>
                    <option value="estudo">🔍 Em Estudo / Análise</option>
                    <option value="aprovada">🚀 Aprovada / Em Execução</option>
                    <option value="arquivada">📦 Arquivada</option>
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

              {/* Notas e Descrição com suporte a colar imagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#202d32]">
                    Notas & Descrição
                  </label>
                  <span className="text-[11px] text-[#8c999e]">Podes colar prints com Cmd+V</span>
                </div>
                <textarea
                  rows={5}
                  placeholder="Descreve a oportunidade, como implementar, que resultados pode trazer ou o raciocínio da ideia..."
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
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#566266] hover:bg-[#f6f7f4] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCompressing || !formTitle.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingIdeaId ? 'Salvar Alterações' : 'Criar Ideia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          5. MODAL LIGHTBOX PARA VISUALIZAR IMAGEM EM ALTA DEFINIÇÃO
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
            {/* Imagem em Grande Formato */}
            <img
              src={lightboxData.images[lightboxData.currentIndex]}
              alt={`Imagem ${lightboxData.currentIndex + 1}`}
              className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
            />

            {/* Controlos e Navegação */}
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
