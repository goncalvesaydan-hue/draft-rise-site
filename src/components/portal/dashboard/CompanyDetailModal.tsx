'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  MessageSquare, 
  Globe, 
  Calendar, 
  Trash2, 
  TrendingUp, 
  BadgeEuro, 
  History,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Check,
  Share2,
  Copy,
  Printer,
  Edit3,
  Save,
  Plus,
  Tag as TagIcon,
  Calculator,
  HelpCircle,
  Columns,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Send,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { PIPELINE_STAGES } from './constants';
import { CompanyStatus, PaymentStatus } from './types';
import { formatDate, formatDateOnly, formatCurrency } from './utils';

export const CompanyDetailModal: React.FC = () => {
  const { 
    selectedCompanyId, 
    setSelectedCompanyId, 
    db, 
    updateCompany, 
    moveCompanyStatus,
    addNote, 
    deleteNote,
    toggleChecklistItem,
    addChecklistItem,
    addPost,
    addRanking,
    deleteRanking,
    addQA,
    deleteQA,
    addBeforeAfter,
    deleteBeforeAfter,
    toggleCompanyTag,
    updateFinance,
    showToast
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'resumo' | 'relatorio' | 'notas' | 'seo' | 'otimizacao' | 'financeiro' | 'timeline'>('resumo');

  // Modo de Edição dos Dados da Empresa
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editSocial, setEditSocial] = useState('');
  const [editCadence, setEditCadence] = useState(7);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Estados dos Formulários
  const [newNoteText, setNewNoteText] = useState('');
  const [newNotePri, setNewNotePri] = useState<1 | 2 | 3>(2);
  const [newKw, setNewKw] = useState('');
  const [newPos, setNewPos] = useState<number>(1);
  const [newChkLabel, setNewChkLabel] = useState('');
  const [postDate, setPostDate] = useState(new Date().toISOString().slice(0, 10));
  const [postNotes, setPostNotes] = useState('');
  const [newReminderDue, setNewReminderDue] = useState(new Date().toISOString().slice(0, 10));
  const [newReminderNote, setNewReminderNote] = useState('');

  // Estados para Q&A e Antes/Depois
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [newBaField, setNewBaField] = useState('Perfil Geral & Nome');
  const [newBaBefore, setNewBaBefore] = useState('');
  const [newBaAfter, setNewBaAfter] = useState('');
  const [newBaNotes, setNewBaNotes] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  const company = db.companies.find(c => c.id === selectedCompanyId);

  // Sincronizar campos de edição ao abrir modal ou trocar empresa
  useEffect(() => {
    if (company) {
      setEditName(company.name);
      setEditCategory(company.category);
      setEditCity(company.city || '');
      setEditPhone(company.phone || '');
      setEditWhatsapp(company.whatsapp || '');
      setEditWebsite(company.website || '');
      setEditSocial(company.social || '');
      setEditCadence(company.cadence || 7);
      setIsEditingInfo(false);
      setIsTagManagerOpen(false);
    }
  }, [company?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCompanyId(null);
      }
    };
    if (selectedCompanyId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompanyId, setSelectedCompanyId]);

  if (!selectedCompanyId || !company) return null;

  const stage = PIPELINE_STAGES.find(s => s.id === company.status);
  const tags = (company.tagIds || []).map(id => db.tags.find(t => t.id === id)).filter(Boolean);

  const totalChecklist = company.checklist.length;
  const doneChecklist = company.checklist.filter(c => c.done).length;
  const checklistPct = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateCompany(company.id, {
      name: editName.trim(),
      category: editCategory.trim(),
      city: editCity.trim(),
      phone: editPhone.trim(),
      whatsapp: editWhatsapp.trim(),
      website: editWebsite.trim(),
      social: editSocial.trim(),
      cadence: Number(editCadence) || 7
    });
    setIsEditingInfo(false);
    showToast('Dados da empresa atualizados com sucesso!', 'success');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(company.id, newNoteText.trim(), newNotePri);
    setNewNoteText('');
  };

  const handleAddRanking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw.trim()) return;
    addRanking(company.id, newKw.trim(), Number(newPos) || 1);
    setNewKw('');
    setNewPos(1);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChkLabel.trim()) return;
    addChecklistItem(company.id, newChkLabel.trim());
    setNewChkLabel('');
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    addPost(company.id, postDate, postNotes.trim());
    setPostNotes('');
  };

  const handleAddPostToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    addPost(company.id, today, 'Publicação efetuada no Perfil Google.');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderNote.trim()) return;
    const newRem = {
      id: Date.now().toString(36),
      due: newReminderDue,
      note: newReminderNote.trim(),
      done: false,
      kind: 'custom' as const
    };
    updateCompany(company.id, {
      reminders: [...company.reminders, newRem]
    });
    setNewReminderNote('');
    showToast('Lembrete criado com sucesso.', 'info');
  };

  const handleAddQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;
    addQA(company.id, newQ.trim(), newA.trim());
    setNewQ('');
    setNewA('');
  };

  const handleAddBeforeAfter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaBefore.trim() || !newBaAfter.trim()) return;
    addBeforeAfter(company.id, newBaField.trim(), newBaBefore.trim(), newBaAfter.trim(), newBaNotes.trim());
    setNewBaBefore('');
    setNewBaAfter('');
    setNewBaNotes('');
  };

  const getWhatsAppLink = (messageText: string) => {
    const cleanNumber = (company.whatsapp || company.phone || '').replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
  };

  const getSafeUrl = (url?: string): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
      return null;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleMarkPaymentToday = () => {
    const today = new Date().toISOString();
    updateFinance(company.id, company.monthlyFee || 0, company.dueDay || 5, 'pago');
    updateCompany(company.id, { lastPaymentDate: today });
  };

  // Gerador de Relatório de Desempenho
  const generateReportText = () => {
    const todayStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
    const pendingItems = company.checklist.filter(i => !i.done).slice(0, 3).map(i => `• ${i.label}`).join('\n');
    const rankingsList = company.rankings.length > 0 
      ? company.rankings.map(r => `• ${r.kw}: #${r.pos} no Maps`).join('\n')
      : '• Palavras-chave em fase de consolidação e monitorização';

    return `*RELATÓRIO DE DESEMPENHO — DRAFT & RISE*
*Empresa:* ${company.name}
*Localização:* ${company.city || 'Portugal'}
*Data:* ${todayStr}

*ESTADO DO PERFIL GOOGLE:*
• Otimização Concluída: ${checklistPct}% (${doneChecklist} de ${totalChecklist} requisitos cumpridos)
• Cadência de Publicações: a cada ${company.cadence || 7} dias (${company.posts.length} posts registados)

*POSICIONAMENTOS NO GOOGLE MAPS:*
${rankingsList}

*PRÓXIMAS AÇÕES PLANEADAS:*
${pendingItems || '• Manutenção ativa de cadência semanal e monitorização de avaliações'}

_Relatório oficial emitido pela equipa Draft & Rise · Marketing Digital & SEO Local_`;
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    showToast('Relatório copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedReport(false), 2500);
  };

  interface NavTabItem {
    id: 'resumo' | 'relatorio' | 'notas' | 'seo' | 'otimizacao' | 'financeiro' | 'timeline';
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }

  const navTabs: NavTabItem[] = [
    { id: 'resumo', label: 'Resumo & Contactos', icon: Building2 },
    { id: 'relatorio', label: 'Relatório & Partilha', icon: FileText },
    { id: 'notas', label: 'Notas', badge: `${company.notes.length}`, icon: MessageSquare },
    { id: 'seo', label: 'Rankings Maps', badge: `${company.rankings.length}`, icon: TrendingUp },
    { id: 'otimizacao', label: 'Otimização GBP', badge: `${checklistPct}%`, icon: CheckCircle2 },
    { id: 'financeiro', label: 'Avença & Faturação', badge: company.monthlyFee > 0 ? `${formatCurrency(company.monthlyFee)}` : undefined, icon: BadgeEuro },
    { id: 'timeline', label: 'Linha do Tempo', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#202d32]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#fcfcfa] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#d8dddc] animate-in zoom-in-95 duration-150 max-h-[94vh]">
        
        {/* ========================================================
            HEADER EXECUTIVO — IDENTIDADE DRAFT & RISE
        ======================================================== */}
        <div className="p-5 sm:p-6 bg-[#202d32] text-white border-b border-[#35454b] shrink-0">
          <div className="flex items-start justify-between gap-4">
            
            {/* Esquerda: Identificação da Empresa */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#2a3a40] border border-white/10 grid place-items-center text-[#ff6a36] shrink-0 shadow-xs">
                <Building2 size={24} />
              </div>

              <div className="min-w-0 flex-1">
                {/* Linha 1: Nome da Empresa + Seletor de Fase + Badge de Tipo */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                    {company.name}
                  </h2>

                  {/* Seletor de Fase Estilizado (Sem quebra nem expansão feia) */}
                  <div className="relative inline-flex items-center">
                    <select
                      value={company.status}
                      onChange={(e) => {
                        moveCompanyStatus(company.id, e.target.value as CompanyStatus);
                        showToast(`Fase atualizada para ${e.target.value}`, 'info');
                      }}
                      style={{ backgroundColor: '#2a3a40', color: '#ffffff', WebkitAppearance: 'none', MozAppearance: 'none' }}
                      className="appearance-none text-xs font-semibold pl-3 pr-7 py-1 rounded-full border border-white/20 cursor-pointer focus:outline-none focus:border-[#ff6a36] transition-colors shadow-xs"
                    >
                      {PIPELINE_STAGES.map(s => (
                        <option key={s.id} value={s.id} style={{ backgroundColor: '#ffffff', color: '#202d32' }}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 text-white/80 pointer-events-none z-10" />
                  </div>

                  {/* Badge de Área: Cliente vs Lead */}
                  {company.status === 'cliente' || company.area === 'client' ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#236a50]/30 text-[#4ade80] border border-[#236a50] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                      Cliente Ativo
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ff6a36]/20 text-[#ff8c61] border border-[#ff6a36]/40 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a36]" />
                      Prospecção
                    </span>
                  )}
                </div>

                {/* Linha 2: Metadados Rápidos (Cidade, Nicho, Avença, WhatsApp) */}
                <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-[#a6b4b9] mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[#d8dddc]">
                    <TagIcon size={12} className="text-[#ff6a36]" />
                    <span>{company.category}</span>
                  </span>

                  <span className="text-[#485960]">•</span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#a6b4b9]" />
                    <span>{company.city || 'Portugal'}</span>
                  </span>

                  {company.monthlyFee > 0 && (
                    <>
                      <span className="text-[#485960]">•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md">
                        <BadgeEuro size={12} className="text-[#ff6a36]" />
                        <span>{formatCurrency(company.monthlyFee)}/mês</span>
                      </span>
                    </>
                  )}

                  {company.whatsapp && (
                    <>
                      <span className="text-[#485960]">•</span>
                      <a
                        href={getWhatsAppLink(`Olá ${company.name}, da equipa Draft & Rise!`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#4ade80] hover:text-white transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageSquare size={12} />
                        <span className="font-mono">{company.whatsapp}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Direita: Botão Fechar */}
            <button
              onClick={() => setSelectedCompanyId(null)}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-[#a6b4b9] hover:text-white grid place-items-center transition-colors cursor-pointer shrink-0 border border-white/10"
              title="Fechar (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================
            BARRA DE NAVEGAÇÃO DE SEPARADORES (PILLS DE ALTA VISIBILIDADE)
        ======================================================== */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#d8dddc] bg-[#f6f7f4] flex items-center gap-2 overflow-x-auto select-none shrink-0">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#ff6a36] text-white border-[#ff6a36] shadow-xs shadow-[#ff6a36]/25'
                    : 'bg-white text-[#566266] border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#202d32]'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-[#8c999e]'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#f6f7f4] text-[#566266] border border-[#d8dddc]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            CORPO DO MODAL (DIVISÕES E SECÇÕES INTERNAS)
        ======================================================== */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 bg-[#fcfcfa]">
          
          {/* ----------------------------------------------------
              SEPARADOR 1: RESUMO & CONTACTOS
          ---------------------------------------------------- */}
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cartão 1: Dados Cadastrais & Contactos */}
              <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-4">
                <div className="border-b border-[#d8dddc] pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                      Canais Diretos
                    </span>
                    <h3 className="text-sm font-semibold text-[#202d32]">Ficha &amp; Contactos</h3>
                  </div>

                  <button
                    onClick={() => setIsEditingInfo(!isEditingInfo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d8dddc] bg-[#f6f7f4] hover:bg-white hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit3 size={12} />
                    <span>{isEditingInfo ? 'Fechar Edição' : 'Editar Ficha'}</span>
                  </button>
                </div>

                {isEditingInfo ? (
                  <form onSubmit={handleSaveInfo} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Nome da Empresa</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs font-semibold text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Categoria / Nicho</label>
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Cidade</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Telefone</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Website</label>
                        <input
                          type="text"
                          value={editWebsite}
                          onChange={(e) => setEditWebsite(e.target.value)}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#566266] uppercase mb-1">Cadência Posts (dias)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={editCadence}
                          onChange={(e) => setEditCadence(Number(e.target.value))}
                          className="w-full p-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#d8dddc]">
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(false)}
                        className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] text-xs text-[#566266] hover:bg-[#f6f7f4] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Guardar Alterações
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3.5 text-xs text-[#202d32]">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <span className="text-[#566266] flex items-center gap-1.5">
                        <Phone size={13} className="text-[#ff6a36]" />
                        Telefone:
                      </span>
                      <span className="font-mono font-medium">{company.phone || '—'}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <span className="text-[#566266] flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-[#236a50]" />
                        WhatsApp:
                      </span>
                      {company.whatsapp ? (
                        <a
                          href={getWhatsAppLink(`Olá ${company.name}, da equipa Draft & Rise!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#236a50] hover:text-[#1b523e] font-mono font-bold underline inline-flex items-center gap-1"
                        >
                          <span>{company.whatsapp}</span>
                          <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <span className="text-[#8c999e]">—</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <span className="text-[#566266] flex items-center gap-1.5">
                        <Globe size={13} className="text-[#ff6a36]" />
                        Website:
                      </span>
                      {(() => {
                        const safe = getSafeUrl(company.website);
                        if (safe) {
                          return (
                            <a
                              href={safe}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#202d32] hover:text-[#ff6a36] underline truncate max-w-[220px] font-medium inline-flex items-center gap-1"
                            >
                              <span className="truncate">{company.website}</span>
                              <ExternalLink size={12} className="shrink-0" />
                            </a>
                          );
                        }
                        if (company.website) {
                          return <span className="text-[#202d32] truncate max-w-[220px] font-medium">{company.website}</span>;
                        }
                        return <span className="text-[#8c999e]">—</span>;
                      })()}
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <span className="text-[#566266] flex items-center gap-1.5">
                        <Clock size={13} className="text-[#ff6a36]" />
                        Cadência Google:
                      </span>
                      <span className="font-semibold text-[#202d32]">A cada {company.cadence || 7} dias</span>
                    </div>
                  </div>
                )}

                {/* Etiquetas / Tags com Gestor Visual */}
                <div className="pt-3 border-t border-[#d8dddc]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c999e]">
                      Etiquetas / Segmentos
                    </span>
                    <button
                      onClick={() => setIsTagManagerOpen(!isTagManagerOpen)}
                      className="text-[11px] font-semibold text-[#ff6a36] hover:underline cursor-pointer"
                    >
                      {isTagManagerOpen ? 'Concluir' : '+ Gerir Tags'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => t && (
                      <span 
                        key={t.id} 
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#d8dddc] bg-[#f6f7f4] text-[#202d32] inline-flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color || '#ff6a36' }} />
                        <span>{t.name}</span>
                      </span>
                    ))}
                    {tags.length === 0 && !isTagManagerOpen && (
                      <span className="text-[11px] text-[#8c999e]">Nenhuma etiqueta atribuída.</span>
                    )}
                  </div>

                  {isTagManagerOpen && (
                    <div className="mt-3 p-3 bg-[#f6f7f4] rounded-lg border border-[#d8dddc] space-y-2">
                      <div className="text-[10px] font-bold uppercase text-[#566266]">Clica para associar/remover:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {db.tags.map(t => {
                          const isAssigned = (company.tagIds || []).includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleCompanyTag(company.id, t.id)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                                isAssigned 
                                  ? 'bg-[#ff6a36] text-white border-[#ff6a36] shadow-xs' 
                                  : 'bg-white border-[#d8dddc] text-[#566266] hover:border-[#ff6a36]'
                              }`}
                            >
                              {isAssigned ? '✓ ' : '+ '}{t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cartão 2: Comunicações Estratégicas WhatsApp */}
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                  <div className="border-b border-[#d8dddc] pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                        Agilidade Operacional
                      </span>
                      <h3 className="text-sm font-semibold text-[#202d32]">Mensagens Rápidas WhatsApp</h3>
                    </div>
                    <span className="text-[11px] text-[#236a50] font-semibold bg-[#236a50]/10 px-2 py-0.5 rounded-full">
                      1-Clique
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={getWhatsAppLink(`Olá ${company.name}, da equipa Draft & Rise! Estamos a preparar as próximas publicações no vosso Perfil do Google. Têm fotografias de trabalhos recentes ou novidades que queiram destacar esta semana?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-[#d8dddc] bg-[#f6f7f4] hover:bg-white hover:border-[#ff6a36] transition-colors block text-xs group shadow-2xs"
                    >
                      <div className="font-semibold text-[#202d32] group-hover:text-[#ff6a36] flex items-center justify-between">
                        <span>Solicitar fotos e novidades da semana</span>
                        <ArrowUpRight size={13} className="text-[#8c999e] group-hover:text-[#ff6a36]" />
                      </div>
                      <p className="text-[11px] text-[#566266] mt-1 line-clamp-1">
                        Pedido amigável de fotos de trabalhos para publicação no Google...
                      </p>
                    </a>

                    <a
                      href={getWhatsAppLink(`Olá ${company.name}! Informamos que foi registada uma nova avaliação no vosso Perfil do Google Maps. A resposta recomendada já se encontra preparada de acordo com as diretrizes da Draft & Rise.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-[#d8dddc] bg-[#f6f7f4] hover:bg-white hover:border-[#ff6a36] transition-colors block text-xs group shadow-2xs"
                    >
                      <div className="font-semibold text-[#202d32] group-hover:text-[#ff6a36] flex items-center justify-between">
                        <span>Notificar nova avaliação no Google Maps</span>
                        <ArrowUpRight size={13} className="text-[#8c999e] group-hover:text-[#ff6a36]" />
                      </div>
                      <p className="text-[11px] text-[#566266] mt-1 line-clamp-1">
                        Aviso prévio e recomendação de alinhamento com a avaliação...
                      </p>
                    </a>

                    <a
                      href={getWhatsAppLink(`Olá ${company.name}, da equipa Draft & Rise! Notámos uma subida relevante das vossas posições no ranking de pesquisas locais no Google Maps. Partilharemos o resumo completo no próximo relatório.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-[#d8dddc] bg-[#f6f7f4] hover:bg-white hover:border-[#ff6a36] transition-colors block text-xs group shadow-2xs"
                    >
                      <div className="font-semibold text-[#202d32] group-hover:text-[#ff6a36] flex items-center justify-between">
                        <span>Notificar subida de posições no Maps</span>
                        <ArrowUpRight size={13} className="text-[#8c999e] group-hover:text-[#ff6a36]" />
                      </div>
                      <p className="text-[11px] text-[#566266] mt-1 line-clamp-1">
                        Partilha de boas notícias sobre ganhos de visibilidade local...
                      </p>
                    </a>

                    {company.status === 'cliente' && (
                      <a
                        href={getWhatsAppLink(`Olá ${company.name}! Da equipa Draft & Rise, enviamos este lembrete relativo ao vencimento da avença mensal de ${formatCurrency(company.monthlyFee)} (vencimento dia ${company.dueDay || 5}). Caso já tenham efetuado, por favor desconsiderem. Muito obrigado!`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border border-[#236a50]/40 bg-[#236a50]/5 hover:bg-[#236a50]/10 transition-colors block text-xs group shadow-2xs"
                      >
                        <div className="font-semibold text-[#236a50] flex items-center justify-between">
                          <span>Lembrete amigável de avença mensal</span>
                          <ArrowUpRight size={13} className="text-[#236a50]" />
                        </div>
                        <p className="text-[11px] text-[#566266] mt-1 line-clamp-1">
                          Aviso prévio cordeal do valor de {formatCurrency(company.monthlyFee)}...
                        </p>
                      </a>
                    )}
                  </div>
                </div>

                {/* Estimativa de Impacto */}
                <div className="p-4 rounded-xl border border-[#d8dddc] bg-white shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c] block mb-2">
                    Potencial de Impacto Local
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <div className="text-[10px] text-[#566266] uppercase font-semibold">Pesquisas no Nicho</div>
                      <div className="font-bold text-base text-[#202d32] mt-0.5">~1.800/mês</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#f6f7f4] border border-[#d8dddc]">
                      <div className="text-[10px] text-[#566266] uppercase font-semibold">Chamadas &amp; Rotas</div>
                      <div className="font-bold text-base text-[#236a50] mt-0.5">~140 a 220</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lembretes e Pendências da Empresa */}
              <div className="md:col-span-2 p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                <div className="border-b border-[#d8dddc] pb-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                      Acompanhamento
                    </span>
                    <h3 className="text-sm font-semibold text-[#202d32]">Lembretes &amp; Tarefas Desta Empresa</h3>
                  </div>
                  <span className="text-xs font-semibold text-[#566266] bg-[#f6f7f4] px-2.5 py-0.5 rounded-full border border-[#d8dddc]">
                    {company.reminders.filter(r => !r.done).length} pendentes
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {company.reminders.map(r => (
                    <div 
                      key={r.id} 
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                        r.done ? 'bg-[#fcfcfa] border-[#d8dddc] opacity-60' : 'bg-[#f6f7f4] border-[#d8dddc]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] font-semibold text-[#b5431c] bg-white px-2 py-0.5 rounded border border-[#d8dddc]">
                          {formatDateOnly(r.due)}
                        </span>
                        <span className={r.done ? 'line-through text-[#8c999e]' : 'text-[#202d32] font-medium'}>
                          {r.note}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const updated = company.reminders.map(x => x.id === r.id ? { ...x, done: !x.done } : x);
                          updateCompany(company.id, { reminders: updated });
                        }}
                        className="px-3 py-1 rounded-full text-xs font-semibold border border-[#d8dddc] bg-white hover:border-[#ff6a36] hover:text-[#ff6a36] transition-colors cursor-pointer shadow-xs"
                      >
                        {r.done ? 'Reabrir' : 'Concluir'}
                      </button>
                    </div>
                  ))}
                  {company.reminders.length === 0 && (
                    <p className="text-xs text-[#8c999e] py-4 text-center">Nenhum lembrete registado para esta empresa.</p>
                  )}
                </div>

                <form onSubmit={handleAddReminder} className="grid grid-cols-[140px_1fr_auto] gap-2 pt-3 border-t border-[#d8dddc]">
                  <input
                    type="date"
                    value={newReminderDue}
                    onChange={(e) => setNewReminderDue(e.target.value)}
                    className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <input
                    type="text"
                    placeholder="Adicionar novo lembrete com prazo..."
                    value={newReminderNote}
                    onChange={(e) => setNewReminderNote(e.target.value)}
                    className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Adicionar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 2: RELATÓRIO & PARTILHA COM O CLIENTE
          ---------------------------------------------------- */}
          {activeTab === 'relatorio' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Barra de Ações Rápidas */}
              <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Comunicação com o Cliente
                  </span>
                  <h3 className="text-base font-semibold text-[#202d32]">Relatório de Desempenho Local</h3>
                  <p className="text-xs text-[#566266] mt-0.5">
                    Resumo executivo oficial pronto para partilha no WhatsApp ou impressão.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] text-white text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 cursor-pointer transition-all"
                  >
                    {copiedReport ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedReport ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  {company.whatsapp && (
                    <a
                      href={getWhatsAppLink(generateReportText())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#236a50] hover:bg-[#1b523e] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Abrir no WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#f6f7f4] border border-[#d8dddc] hover:border-[#ff6a36] text-[#202d32] text-xs font-semibold shadow-xs cursor-pointer transition-all"
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Carta Executiva de Desempenho Visual */}
              <div className="bg-white rounded-2xl border border-[#d8dddc] shadow-sm overflow-hidden">
                {/* Cabeçalho da Carta */}
                <div className="p-6 bg-[#202d32] text-white border-b border-[#35454b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#ff6a36]">
                        RELATÓRIO DE DESEMPENHO — DRAFT &amp; RISE
                      </div>
                      <h4 className="text-xl font-bold tracking-tight text-white mt-1">
                        {company.name}
                      </h4>
                      <p className="text-xs text-[#a6b4b9] mt-0.5">
                        {company.city || 'Portugal'} · Atualizado em {new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center text-[#ff6a36]">
                      <Sparkles size={20} />
                    </div>
                  </div>
                </div>

                {/* 3 Blocos de Destaque Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#d8dddc] border-b border-[#d8dddc] bg-[#f6f7f4]">
                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] font-bold uppercase text-[#566266] tracking-wider block">
                      Otimização Google
                    </span>
                    <div className="text-2xl font-bold text-[#202d32] mt-1">
                      {checklistPct}%
                    </div>
                    <div className="h-1.5 w-full bg-[#d8dddc] rounded-full overflow-hidden mt-2">
                      <div style={{ width: `${checklistPct}%` }} className="h-full bg-[#236a50] rounded-full" />
                    </div>
                    <span className="text-[11px] text-[#566266] mt-1 block">
                      {doneChecklist} de {totalChecklist} requisitos cumpridos
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] font-bold uppercase text-[#566266] tracking-wider block">
                      Palavras no Maps
                    </span>
                    <div className="text-2xl font-bold text-[#202d32] mt-1">
                      {company.rankings.length}
                    </div>
                    <span className="text-[11px] text-[#236a50] font-semibold mt-2 block">
                      {company.rankings.filter(r => r.pos <= 3).length > 0
                        ? `${company.rankings.filter(r => r.pos <= 3).length} no Top 3 Maps`
                        : 'Em monitorização contínua'}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] font-bold uppercase text-[#566266] tracking-wider block">
                      Cadência de Posts
                    </span>
                    <div className="text-2xl font-bold text-[#202d32] mt-1">
                      {company.cadence || 7} dias
                    </div>
                    <span className="text-[11px] text-[#566266] mt-2 block">
                      {company.posts.length} publicações registadas
                    </span>
                  </div>
                </div>

                {/* Conteúdo Detalhado da Carta */}
                <div className="p-6 space-y-5">
                  {/* Rankings Maps */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#b5431c] mb-2">
                      Posicionamentos no Google Maps
                    </h5>
                    {company.rankings.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {company.rankings.map(r => (
                          <div key={r.id} className="p-3 rounded-lg border border-[#d8dddc] bg-[#fcfcfa] flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#202d32]">{r.kw}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              r.pos <= 3 ? 'bg-[#236a50] text-white' : 'bg-[#f6f7f4] border border-[#d8dddc] text-[#202d32]'
                            }`}>
                              #{r.pos}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#f6f7f4] border border-[#d8dddc] text-xs text-[#566266]">
                        Palavras-chave em fase de consolidação e monitorização de posicionamento.
                      </div>
                    )}
                  </div>

                  {/* Próximas Ações */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#b5431c] mb-2">
                      Próximas Ações Planeadas
                    </h5>
                    <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#fcfcfa] space-y-1.5 text-xs text-[#202d32]">
                      {company.checklist.filter(i => !i.done).slice(0, 4).map(i => (
                        <div key={i.key} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a36]" />
                          <span>{i.label}</span>
                        </div>
                      ))}
                      {company.checklist.filter(i => !i.done).length === 0 && (
                        <div className="flex items-center gap-2 text-[#236a50] font-medium">
                          <CheckCircle size={14} />
                          <span>Todas as boas práticas fundamentais de otimização GBP estão cumpridas!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rodapé do Relatório */}
                <div className="p-4 bg-[#f6f7f4] border-t border-[#d8dddc] text-center text-[11px] text-[#8c999e]">
                  Relatório oficial emitido pela equipa Draft &amp; Rise · Marketing Digital &amp; SEO Local
                </div>
              </div>

              {/* Caixa Expansível com Texto Puro para WhatsApp */}
              <div className="p-5 bg-white rounded-xl border border-[#d8dddc] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#566266]">
                    Texto Bruto Formatado para Mensagem
                  </span>
                  <button
                    onClick={handleCopyReport}
                    className="text-xs font-semibold text-[#ff6a36] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy size={12} />
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="p-4 bg-[#f6f7f4] rounded-lg border border-[#d8dddc] font-mono text-xs text-[#202d32] whitespace-pre-wrap leading-relaxed select-all">
                  {generateReportText()}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 3: NOTAS INTERNAS
          ---------------------------------------------------- */}
          {activeTab === 'notas' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <form onSubmit={handleAddNote} className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                <div className="border-b border-[#d8dddc] pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Histórico da Equipa
                  </span>
                  <h3 className="text-sm font-semibold text-[#202d32]">Registar Nova Anotação Interna</h3>
                </div>

                <textarea
                  rows={3}
                  placeholder="Anotação ou decisão importante relativa a esta empresa..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-3 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#566266]">
                    <span className="text-[11px] font-semibold mr-1">Prioridade:</span>
                    <button
                      type="button"
                      onClick={() => setNewNotePri(1)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                        newNotePri === 1 ? 'bg-[#c43f17] text-white border-[#c43f17]' : 'border-[#d8dddc] bg-white text-[#566266]'
                      }`}
                    >
                      Alta
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNotePri(2)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                        newNotePri === 2 ? 'bg-[#ff6a36] text-white border-[#ff6a36]' : 'border-[#d8dddc] bg-white text-[#566266]'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNotePri(3)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                        newNotePri === 3 ? 'bg-[#236a50] text-white border-[#236a50]' : 'border-[#d8dddc] bg-white text-[#566266]'
                      }`}
                    >
                      Baixa
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer"
                  >
                    Guardar Nota
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {company.notes.map(note => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-[#d8dddc] bg-white shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8c999e] mb-2 border-b border-[#d8dddc] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#202d32]">{note.author}</span>
                        <span>•</span>
                        <span>{formatDate(note.at)}</span>
                        {note.pri === 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c43f17]/10 text-[#c43f17]">
                            Prioridade Alta
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteNote(company.id, note.id)}
                        className="text-[#8c999e] hover:text-[#c43f17] cursor-pointer p-1 transition-colors"
                        title="Apagar Nota"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[#202d32] whitespace-pre-wrap leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))}

                {company.notes.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#8c999e] border border-dashed border-[#d8dddc] rounded-xl bg-white">
                    Nenhuma anotação interna registada para esta empresa.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 4: RANKINGS GOOGLE MAPS
          ---------------------------------------------------- */}
          {activeTab === 'seo' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <form onSubmit={handleAddRanking} className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                <div className="border-b border-[#d8dddc] pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    SEO Local &amp; Maps
                  </span>
                  <h3 className="text-sm font-semibold text-[#202d32]">Adicionar Palavra-chave Monitorizada</h3>
                </div>

                <div className="grid grid-cols-[1fr_90px_auto] gap-2">
                  <input
                    type="text"
                    placeholder="Palavra-chave (ex.: dentista lisboa centro)"
                    value={newKw}
                    onChange={(e) => setNewKw(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Posição"
                    value={newPos}
                    onChange={(e) => setNewPos(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Adicionar
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.rankings.map(r => (
                  <div key={r.id} className="p-4 rounded-xl border border-[#d8dddc] bg-white shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#202d32]">{r.kw}</div>
                      <div className="text-[11px] text-[#8c999e] mt-1 flex items-center gap-1">
                        <Clock size={11} />
                        <span>{formatDate(r.at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm font-bold px-3 py-1 rounded-md border ${
                        r.pos <= 3
                          ? 'bg-[#236a50]/15 text-[#236a50] border-[#236a50]/30'
                          : r.pos <= 10
                          ? 'bg-[#ff6a36]/15 text-[#ff6a36] border-[#ff6a36]/30'
                          : 'bg-[#f6f7f4] text-[#566266] border-[#d8dddc]'
                      }`}>
                        #{r.pos}
                      </span>

                      <button
                        onClick={() => deleteRanking(company.id, r.id)}
                        className="text-[#8c999e] hover:text-[#c43f17] cursor-pointer p-1 transition-colors"
                        title="Remover Keyword"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {company.rankings.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#8c999e] border border-dashed border-[#d8dddc] rounded-xl bg-white col-span-2">
                    Nenhuma palavra-chave monitorizada para esta empresa.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 5: OTIMIZAÇÃO GBP (CHECKLIST, POSTS, Q&A, ANTES/DEPOIS)
          ---------------------------------------------------- */}
          {activeTab === 'otimizacao' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sub-divisão 1: Checklist SOP de Otimização GBP (11 Pontos) */}
                <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#d8dddc] pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                        SOP de Otimização
                      </span>
                      <h3 className="font-semibold text-sm text-[#202d32]">Checklist do Perfil Google</h3>
                    </div>
                    <span className="text-xs text-[#202d32] font-semibold bg-[#f6f7f4] border border-[#d8dddc] px-2.5 py-1 rounded-full">
                      {doneChecklist}/{totalChecklist} ({checklistPct}%)
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="h-1.5 w-full bg-[#f6f7f4] border border-[#d8dddc] rounded-full overflow-hidden">
                    <div style={{ width: `${checklistPct}%` }} className="h-full bg-[#236a50] rounded-full transition-all duration-300" />
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pt-1">
                    {company.checklist.map(item => (
                      <div 
                        key={item.key} 
                        onClick={() => toggleChecklistItem(company.id, item.key)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors select-none ${
                          item.done 
                            ? 'bg-[#f6f7f4] border-[#d8dddc] opacity-75' 
                            : 'bg-white border-[#d8dddc] hover:border-[#ff6a36]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          item.done 
                            ? 'bg-[#236a50] border-[#236a50] text-white shadow-xs' 
                            : 'bg-white border-[#d8dddc]'
                        }`}>
                          {item.done && <Check size={11} className="stroke-[3]" />}
                        </div>
                        <span className={item.done ? 'line-through text-[#8c999e] flex-1' : 'text-[#202d32] font-medium flex-1'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddChecklist} className="grid grid-cols-[1fr_auto] gap-2 pt-2 border-t border-[#d8dddc]">
                    <input
                      type="text"
                      placeholder="Novo ponto de verificação personalizado..."
                      value={newChkLabel}
                      onChange={(e) => setNewChkLabel(e.target.value)}
                      className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                    <button type="submit" className="px-3.5 py-1.5 bg-[#ff6a36] hover:bg-[#e85a28] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer">
                      +
                    </button>
                  </form>
                </div>

                {/* Sub-divisão 2: Registo de Postagens & Cadência */}
                <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#d8dddc] pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                        Cadência
                      </span>
                      <h3 className="font-semibold text-sm text-[#202d32]">Histórico de Publicações</h3>
                    </div>
                    <button
                      onClick={handleAddPostToday}
                      className="px-3 py-1 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      + Post feito hoje
                    </button>
                  </div>

                  <form onSubmit={handleAddPost} className="space-y-2">
                    <div className="grid grid-cols-[140px_1fr_auto] gap-2">
                      <input
                        type="date"
                        value={postDate}
                        onChange={(e) => setPostDate(e.target.value)}
                        className="w-full p-1.5 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                      <input
                        type="text"
                        placeholder="Notas ou tema da publicação..."
                        value={postNotes}
                        onChange={(e) => setPostNotes(e.target.value)}
                        className="w-full p-1.5 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                      <button type="submit" className="px-4 py-1.5 bg-[#236a50] hover:bg-[#1b523e] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer whitespace-nowrap">
                        Registar
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-72 overflow-y-auto pt-1">
                    {company.posts.map(p => (
                      <div key={p.id} className="p-3 rounded-lg bg-[#f6f7f4] border border-[#d8dddc] text-xs">
                        <div className="font-semibold text-[#202d32] flex items-center justify-between">
                          <span>{formatDateOnly(p.at)}</span>
                          <span className="text-[10px] text-[#236a50] font-semibold bg-white px-2 py-0.5 rounded border border-[#d8dddc]">
                            Publicado
                          </span>
                        </div>
                        <div className="text-[#566266] mt-1">{p.notes || 'Sem observações'}</div>
                      </div>
                    ))}
                    {company.posts.length === 0 && (
                      <p className="text-xs text-[#8c999e] text-center py-8">Nenhum post registado no histórico.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 2: Perguntas & Respostas (Q&A) e Antes/Depois */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#d8dddc]">
                
                {/* Sub-divisão 3: Q&A Estratégico no Google Maps */}
                <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#d8dddc] pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                        Google Maps Q&amp;A
                      </span>
                      <h3 className="font-semibold text-sm text-[#202d32]">Perguntas &amp; Respostas Frequentes</h3>
                    </div>
                    <span className="text-xs text-[#566266] font-mono">{(company.qa || []).length} cadastradas</span>
                  </div>

                  <form onSubmit={handleAddQA} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Pergunta (ex: Têm estacionamento gratuito no local?)..."
                      value={newQ}
                      onChange={(e) => setNewQ(e.target.value)}
                      className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        placeholder="Resposta recomendada com palavras-chave..."
                        value={newA}
                        onChange={(e) => setNewA(e.target.value)}
                        className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                      <button type="submit" className="px-3.5 py-1.5 bg-[#ff6a36] hover:bg-[#e85a28] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer whitespace-nowrap">
                        Adicionar
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-56 overflow-y-auto pt-1">
                    {(company.qa || []).map(item => (
                      <div key={item.id} className="p-3 bg-[#f6f7f4] rounded-lg border border-[#d8dddc] text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-[#202d32]">Q: {item.q}</strong>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`P: ${item.q}\nR: ${item.a}`);
                                showToast('Q&A copiada para colar no Google Maps!', 'success');
                              }}
                              className="p-1 text-[#566266] hover:text-[#ff6a36] cursor-pointer"
                              title="Copiar para colar no Maps"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => deleteQA(company.id, item.id)}
                              className="p-1 text-[#8c999e] hover:text-[#c43f17] cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#566266] leading-relaxed">R: {item.a}</p>
                      </div>
                    ))}
                    {(!company.qa || company.qa.length === 0) && (
                      <p className="text-xs text-[#8c999e] text-center py-6">Nenhuma pergunta/resposta configurada.</p>
                    )}
                  </div>
                </div>

                {/* Sub-divisão 4: Antes & Depois */}
                <div className="p-5 rounded-xl border border-[#d8dddc] bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#d8dddc] pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                        Evolução Visual
                      </span>
                      <h3 className="font-semibold text-sm text-[#202d32]">Antes &amp; Depois do Perfil</h3>
                    </div>
                    <span className="text-xs text-[#566266] font-mono">{(company.beforeAfter || []).length} registos</span>
                  </div>

                  <form onSubmit={handleAddBeforeAfter} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Área (ex: Fotos do Estabelecimento, Descrição SEO)..."
                      value={newBaField}
                      onChange={(e) => setNewBaField(e.target.value)}
                      className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Antes (ex: Sem fotos de pratos)..."
                        value={newBaBefore}
                        onChange={(e) => setNewBaBefore(e.target.value)}
                        className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                      <input
                        type="text"
                        placeholder="Depois (ex: 35 fotos em 4K)..."
                        value={newBaAfter}
                        onChange={(e) => setNewBaAfter(e.target.value)}
                        className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        placeholder="Notas opcionais..."
                        value={newBaNotes}
                        onChange={(e) => setNewBaNotes(e.target.value)}
                        className="w-full p-2 text-xs bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                      />
                      <button type="submit" className="px-3.5 py-1.5 bg-[#236a50] hover:bg-[#1b523e] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer whitespace-nowrap">
                        Adicionar
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 max-h-56 overflow-y-auto pt-1">
                    {(company.beforeAfter || []).map(ba => (
                      <div key={ba.id} className="p-3 bg-[#f6f7f4] rounded-lg border border-[#d8dddc] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#202d32]">{ba.field}</span>
                          <button
                            onClick={() => deleteBeforeAfter(company.id, ba.id)}
                            className="p-1 text-[#8c999e] hover:text-[#c43f17] cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 bg-[#fff4f2] rounded border border-[#fbd0c8] text-[#c43f17]">
                            <strong className="block text-[10px] uppercase font-bold">Antes</strong>
                            <span>{ba.before}</span>
                          </div>
                          <div className="p-2 bg-[#f0f9f4] rounded border border-[#c7ebd5] text-[#236a50]">
                            <strong className="block text-[10px] uppercase font-bold">Depois</strong>
                            <span>{ba.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!company.beforeAfter || company.beforeAfter.length === 0) && (
                      <p className="text-xs text-[#8c999e] text-center py-6">Nenhum registo Antes/Depois registado.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 6: AVENÇA & FATURAÇÃO
          ---------------------------------------------------- */}
          {activeTab === 'financeiro' && (
            <div className="p-6 rounded-2xl border border-[#d8dddc] bg-white shadow-xs max-w-xl mx-auto space-y-5">
              <div className="flex items-center justify-between border-b border-[#d8dddc] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Contrato Recorrente
                  </span>
                  <h3 className="font-semibold text-base text-[#202d32]">Avença Mensal &amp; Faturação</h3>
                </div>
                <button
                  onClick={handleMarkPaymentToday}
                  className="px-4 py-2 bg-[#236a50] hover:bg-[#1b523e] text-white rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Marcar pago este mês
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#566266] mb-1">Valor da Mensalidade (€)</label>
                  <input
                    type="number"
                    value={company.monthlyFee || 0}
                    onChange={(e) => updateFinance(company.id, Number(e.target.value), company.dueDay || 5, company.paymentStatus)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-sm font-semibold text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566266] mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={company.dueDay || 5}
                    onChange={(e) => updateFinance(company.id, company.monthlyFee || 0, Number(e.target.value), company.paymentStatus)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-sm font-semibold text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                </div>
              </div>

              {/* Projeção Anual de Contrato (LTV) */}
              <div className="p-4 bg-[#f6f7f4] rounded-xl border border-[#d8dddc] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#566266] block">Valor Anual Projetado (LTV/Ano):</span>
                  <span className="text-[11px] text-[#8c999e]">Baseado na avença de {formatCurrency(company.monthlyFee)}/mês</span>
                </div>
                <span className="font-bold text-[#202d32] text-lg">{formatCurrency((company.monthlyFee || 0) * 12)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566266] mb-2">Estado Atual do Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pago', 'pendente', 'atrasado'] as PaymentStatus[]).map((st) => {
                    const isSelected = company.paymentStatus === st;
                    const activeBg =
                      st === 'pago'
                        ? 'bg-[#236a50] text-white border-[#236a50] shadow-xs'
                        : st === 'atrasado'
                        ? 'bg-[#c43f17] text-white border-[#c43f17] shadow-xs'
                        : 'bg-[#ff6a36] text-white border-[#ff6a36] shadow-xs';
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateFinance(company.id, company.monthlyFee || 0, company.dueDay || 5, st)}
                        className={`py-2 px-3 rounded-lg font-bold text-xs uppercase cursor-pointer border transition-colors ${
                          isSelected
                            ? activeBg
                            : 'bg-white border-[#d8dddc] text-[#566266] hover:border-[#ff6a36]'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {company.paymentStatus !== 'pago' && company.whatsapp && (
                <div className="pt-2">
                  <a
                    href={getWhatsAppLink(`Olá ${company.name}! Da equipa Draft & Rise, enviamos este lembrete relativo ao vencimento da avença mensal de ${formatCurrency(company.monthlyFee)} (vencimento dia ${company.dueDay || 5}). Caso já tenham efetuado, por favor desconsiderem. Muito obrigado!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-full bg-[#f6f7f4] hover:bg-white border border-[#ff6a36] text-[#ff6a36] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MessageSquare size={14} />
                    <span>Enviar Lembrete de Cobrança no WhatsApp</span>
                  </a>
                </div>
              )}

              {company.lastPaymentDate && (
                <p className="text-xs text-[#566266] pt-1 text-center">
                  Último pagamento registado em {formatDate(company.lastPaymentDate)}
                </p>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              SEPARADOR 7: LINHA DO TEMPO (AUDITORIA & HISTÓRICO)
          ---------------------------------------------------- */}
          {activeTab === 'timeline' && (
            <div className="p-6 rounded-2xl border border-[#d8dddc] bg-white shadow-xs max-w-2xl mx-auto">
              <div className="border-b border-[#d8dddc] pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Registo de Atividades
                </span>
                <h3 className="text-base font-semibold text-[#202d32]">Histórico &amp; Auditoria</h3>
              </div>

              <div className="space-y-4">
                {company.timeline.map((ev, idx) => (
                  <div key={ev.id || idx} className="flex items-start gap-3 text-xs border-b border-[#d8dddc] pb-3.5 last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-[#ff6a36] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[#8c999e]">
                        <span className="font-semibold text-[#202d32] text-sm">{ev.title}</span>
                        <span>{formatDate(ev.at)}</span>
                      </div>
                      {ev.detail && <p className="text-[#566266] mt-0.5">{ev.detail}</p>}
                      <div className="text-[10px] text-[#8c999e] mt-1">Autor: {ev.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
