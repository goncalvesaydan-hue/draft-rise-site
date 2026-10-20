'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2,
  Users,
  Sliders,
  Cloud,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tag as TagIcon,
  Plus,
  X,
  Trash2,
  RefreshCw,
  Shield,
  FileSpreadsheet,
  Lock,
  Layers,
  ListChecks,
  Clock,
  HelpCircle,
  FolderSync
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { testSupabaseConnection } from './supabase';
import { generateId } from './utils';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ANALYSIS_POINTS,
  DEFAULT_TAGS,
  DEFAULT_LOSS_REASONS,
  DEFAULT_AGENCY_SETTINGS
} from './constants';
import { Tag } from './types';

type SettingsSubTab = 'geral' | 'equipa' | 'taxonomia' | 'sincronizacao' | 'dados';

const TAG_COLOR_OPTIONS = [
  { name: 'Terracota', hex: '#ff6a36' },
  { name: 'Verde Floresta', hex: '#236a50' },
  { name: 'Ardósia Escura', hex: '#202d32' },
  { name: 'Âmbar / Alerta', hex: '#f59e0b' },
  { name: 'Azul Comercial', hex: '#3b82f6' },
  { name: 'Púrpura Criativo', hex: '#8b5cf6' },
  { name: 'Ciano Técnico', hex: '#06b6d4' },
  { name: 'Rosa Estratégico', hex: '#ec4899' }
];

export const SettingsView: React.FC = () => {
  const { 
    db, 
    updateSettings, 
    exportBackup, 
    exportCSV,
    exportIdeasCSV,
    exportEventsCSV,
    clearTrashNotes,
    importBackup, 
    syncCloud, 
    loadDemoData, 
    clearAllData,
    showToast 
  } = useDashboard();

  // Sub-aba ativa
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('geral');

  // 1. Estado da Agência & Parâmetros Operacionais
  const agencyData = db.agency || DEFAULT_AGENCY_SETTINGS;
  const [agencyName, setAgencyName] = useState(agencyData.name || 'Draft & Rise');
  const [agencyEmail, setAgencyEmail] = useState(agencyData.email || 'contacto@draftandrise.com');
  const [agencyPhone, setAgencyPhone] = useState(agencyData.phone || '+351 912 345 678');
  const [currency, setCurrency] = useState(agencyData.currency || 'EUR');
  const [staleDays, setStaleDays] = useState(db.staleDays || 7);
  const [defaultDueDay, setDefaultDueDay] = useState(agencyData.defaultDueDay || 5);
  const [defaultCadence, setDefaultCadence] = useState(agencyData.defaultCadence || 7);
  const [alertDaysBeforeDue, setAlertDaysBeforeDue] = useState(agencyData.alertDaysBeforeDue || 3);

  // 2. Estado de Nuvem / Supabase
  const [supaUrl, setSupaUrl] = useState(db.sync.url || '');
  const [supaKey, setSupaKey] = useState(db.sync.key || '');
  const [supaRoom, setSupaRoom] = useState(db.sync.room || 'gbp-team-default');
  const [supaPass, setSupaPass] = useState(db.sync.password || '');
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [testing, setTesting] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);

  // 3. Estado de Taxonomia
  const [newCat, setNewCat] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newAnalysis, setNewAnalysis] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#ff6a36');

  // 4. Modais de Confirmação & Segurança
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [clearTrashModalOpen, setClearTrashModalOpen] = useState(false);

  // 5. Modal de Confirmação de Importação
  const [importSummary, setImportSummary] = useState<{
    companiesCount: number;
    ideasCount: number;
    eventsCount: number;
    rawContent: string;
  } | null>(null);

  // Estatísticas globais do sistema
  const systemStats = useMemo(() => {
    const totalCompanies = db.companies.filter(c => !c.deletedAt).length;
    const clientCount = db.companies.filter(c => !c.deletedAt && c.area === 'client').length;
    const prospectCount = db.companies.filter(c => !c.deletedAt && c.area === 'prospect').length;
    const ideasCount = db.ideas?.length || 0;
    const eventsCount = db.events?.length || 0;
    const trashCount = db.trashNotes?.length || 0;
    let weekTasksCount = 0;
    Object.values(db.weeks || {}).forEach(w => {
      Object.values(w).forEach(tasks => {
        weekTasksCount += tasks.length;
      });
    });

    return {
      totalCompanies,
      clientCount,
      prospectCount,
      ideasCount,
      eventsCount,
      trashCount,
      weekTasksCount
    };
  }, [db]);

  // Contagem de empresas por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    db.companies.filter(c => !c.deletedAt).forEach(c => {
      if (c.category) {
        counts[c.category] = (counts[c.category] || 0) + 1;
      }
    });
    return counts;
  }, [db.companies]);

  // Contagem de empresas por tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    db.companies.filter(c => !c.deletedAt).forEach(c => {
      (c.tagIds || []).forEach(tid => {
        counts[tid] = (counts[tid] || 0) + 1;
      });
    });
    return counts;
  }, [db.companies]);

  // Salvar Parâmetros Operacionais da Agência
  const handleSaveAgencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      staleDays: Number(staleDays) || 7,
      agency: {
        name: agencyName.trim() || 'Draft & Rise',
        email: agencyEmail.trim() || 'contacto@draftandrise.com',
        phone: agencyPhone.trim(),
        currency,
        defaultDueDay: Number(defaultDueDay) || 5,
        defaultCadence: Number(defaultCadence) || 7,
        alertDaysBeforeDue: Number(alertDaysBeforeDue) || 3
      }
    });
    showToast('Definições operacionais guardadas com sucesso!', 'success');
  };

  // Testar Conexão Supabase
  const handleTestConnection = async () => {
    if (!supaUrl || !supaKey) {
      setSyncStatusMsg({ text: 'Preenche o URL e a chave anónima do Supabase.', ok: false });
      return;
    }
    setTesting(true);
    setSyncStatusMsg(null);
    const ok = await testSupabaseConnection(supaUrl, supaKey);
    setTesting(false);
    if (ok) {
      setSyncStatusMsg({ text: 'Ligação ao Supabase estabelecida com sucesso!', ok: true });
    } else {
      setSyncStatusMsg({ text: 'Não foi possível ligar ao projeto Supabase. Verifica os dados.', ok: false });
    }
  };

  // Salvar Sincronização
  const handleSaveSync = async (enable: boolean) => {
    setTesting(true);
    setSyncStatusMsg(null);

    if (enable) {
      if (!supaUrl || !supaKey) {
        setSyncStatusMsg({ text: 'Preenche o URL e a chave anónima do Supabase.', ok: false });
        setTesting(false);
        return;
      }
      const ok = await testSupabaseConnection(supaUrl, supaKey);
      if (!ok) {
        setSyncStatusMsg({ text: 'Não foi possível ligar ao projeto Supabase.', ok: false });
        setTesting(false);
        return;
      }
    }

    updateSettings({
      sync: {
        enabled: enable,
        url: supaUrl.trim(),
        key: supaKey.trim(),
        password: supaPass.trim(),
        room: supaRoom.trim() || 'gbp-team-default'
      }
    });

    setTesting(false);
    if (enable) {
      const syncResult = await syncCloud();
      if (syncResult.ok) {
        setSyncStatusMsg({ text: 'Sincronização ativada com sucesso.', ok: true });
      } else {
        setSyncStatusMsg({ text: syncResult.error || 'Falha ao sincronizar com a nuvem.', ok: false });
      }
    } else {
      setSyncStatusMsg({ text: 'Sincronização em nuvem desativada.', ok: true });
    }
  };

  // Sincronização Manual Imediata
  const handleManualSync = async () => {
    setSyncingManual(true);
    const res = await syncCloud();
    setSyncingManual(false);
    if (res.ok) {
      setSyncStatusMsg({ text: 'Sincronização manual concluída com sucesso.', ok: true });
    } else {
      setSyncStatusMsg({ text: res.error || 'Erro ao sincronizar.', ok: false });
    }
  };

  // Leitor de ficheiro JSON de Backup
  const handleSelectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          const comps = Array.isArray(parsed.companies) ? parsed.companies.length : 0;
          const ideas = Array.isArray(parsed.ideas) ? parsed.ideas.length : 0;
          const events = Array.isArray(parsed.events) ? parsed.events.length : 0;
          setImportSummary({
            companiesCount: comps,
            ideasCount: ideas,
            eventsCount: events,
            rawContent: content
          });
        } else {
          showToast('Ficheiro de backup inválido.', 'error');
        }
      } catch {
        showToast('Ficheiro não é um JSON válido.', 'error');
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importSummary) return;
    const ok = importBackup(importSummary.rawContent);
    setImportSummary(null);
    if (ok) {
      showToast('Base de dados restaurada com sucesso!', 'success');
    }
  };

  // Gestão de Categorias
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCat.trim();
    if (!clean) return;
    if (db.categories.includes(clean)) {
      showToast('Esta categoria já existe.', 'info');
      return;
    }
    updateSettings({
      categories: [...db.categories, clean]
    });
    setNewCat('');
    showToast(`Categoria "${clean}" adicionada.`, 'success');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const associatedCount = categoryCounts[catToRemove] || 0;
    if (associatedCount > 0) {
      if (!confirm(`A categoria "${catToRemove}" está associada a ${associatedCount} empresa(s). Desejas remover mesmo assim?`)) {
        return;
      }
    }
    updateSettings({
      categories: db.categories.filter(c => c !== catToRemove)
    });
    showToast(`Categoria "${catToRemove}" removida.`, 'info');
  };

  const handleResetCategories = () => {
    if (confirm('Restaurar a lista de nichos e categorias padrão da Draft & Rise?')) {
      updateSettings({ categories: DEFAULT_CATEGORIES });
      showToast('Categorias padrão restauradas.', 'success');
    }
  };

  // Gestão de Tags
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.trim();
    if (!clean) return;
    const newTag: Tag = {
      id: generateId(),
      name: clean,
      color: newTagColor
    };
    updateSettings({
      tags: [...db.tags, newTag]
    });
    setNewTagName('');
    showToast(`Etiqueta "${clean}" adicionada.`, 'success');
  };

  const handleRemoveTag = (tagId: string, tagName: string) => {
    updateSettings({
      tags: db.tags.filter(t => t.id !== tagId)
    });
    showToast(`Etiqueta "${tagName}" removida.`, 'info');
  };

  const handleResetTags = () => {
    if (confirm('Restaurar as etiquetas padrão da agência?')) {
      updateSettings({ tags: DEFAULT_TAGS });
      showToast('Etiquetas padrão restauradas.', 'success');
    }
  };

  // Gestão de Motivos de Perda
  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newReason.trim();
    if (!clean) return;
    if (db.reasons.includes(clean)) {
      showToast('Este motivo já existe.', 'info');
      return;
    }
    updateSettings({
      reasons: [...db.reasons, clean]
    });
    setNewReason('');
    showToast(`Motivo "${clean}" adicionado.`, 'success');
  };

  const handleRemoveReason = (reasonToRemove: string) => {
    updateSettings({
      reasons: db.reasons.filter(r => r !== reasonToRemove)
    });
    showToast(`Motivo removido.`, 'info');
  };

  const handleResetReasons = () => {
    if (confirm('Restaurar os motivos de perda padrão?')) {
      updateSettings({ reasons: DEFAULT_LOSS_REASONS });
      showToast('Motivos de perda padrão restaurados.', 'success');
    }
  };

  // Gestão de Pontos de Análise Rápida GBP
  const handleAddAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAnalysis.trim();
    if (!clean) return;
    if (db.analysis.includes(clean)) {
      showToast('Este ponto já existe.', 'info');
      return;
    }
    updateSettings({
      analysis: [...db.analysis, clean]
    });
    setNewAnalysis('');
    showToast(`Ponto de auditoria adicionado.`, 'success');
  };

  const handleRemoveAnalysis = (itemToRemove: string) => {
    updateSettings({
      analysis: db.analysis.filter(a => a !== itemToRemove)
    });
    showToast(`Ponto de auditoria removido.`, 'info');
  };

  const handleResetAnalysis = () => {
    if (confirm('Restaurar os pontos de auditoria GBP padrão?')) {
      updateSettings({ analysis: DEFAULT_ANALYSIS_POINTS });
      showToast('Critérios padrão restaurados.', 'success');
    }
  };

  // Confirmação de Reset Total
  const handleExecuteFullReset = () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'LIMPAR') {
      showToast('Palavra de confirmação incorreta. Escreve LIMPAR para confirmar.', 'error');
      return;
    }
    clearAllData();
    setResetModalOpen(false);
    setResetConfirmInput('');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER PRINCIPAL COM STATUS DO SISTEMA
      ======================================================== */}
      <div className="pb-4 border-b border-[#d8dddc] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
            Sistema &amp; Plataforma
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] tracking-tight mt-0.5">
            Definições &amp; Controlo Central<span className="text-[#c74418]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#566266] mt-1">
            Gestão operacional da agência, equipa, taxonomia, cópias de segurança e nuvem.
          </p>
        </div>

        {/* Badges de Resumo em Tempo Real */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f7f4] border border-[#d8dddc] text-xs font-medium text-[#202d32]">
            <Database size={13} className="text-[#ff6a36]" />
            <span>{systemStats.totalCompanies} empresas</span>
            <span className="text-[#8c999e]">({systemStats.clientCount} clientes)</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
            db.sync.enabled 
              ? 'bg-[#236a50]/10 border-[#236a50]/30 text-[#236a50]' 
              : 'bg-[#f6f7f4] border-[#d8dddc] text-[#566266]'
          }`}>
            <Cloud size={13} className={db.sync.enabled ? 'text-[#236a50]' : 'text-[#8c999e]'} />
            <span>{db.sync.enabled ? 'Nuvem Ativa' : 'Modo Local (IndexedDB)'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. NAVEGAÇÃO POR ABAS INTERNAS (ESTILO SEGMENTADO)
      ======================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#d8dddc]">
        <button
          type="button"
          onClick={() => setActiveSubTab('geral')}
          style={activeSubTab === 'geral' ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'geral'
              ? 'bg-[#202d32] !text-white shadow-xs'
              : 'text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4]'
          }`}
        >
          <Building2 size={14} className="shrink-0" />
          <span>Geral &amp; Agência</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('equipa')}
          style={activeSubTab === 'equipa' ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'equipa'
              ? 'bg-[#202d32] !text-white shadow-xs'
              : 'text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4]'
          }`}
        >
          <Users size={14} className="shrink-0" />
          <span>Equipa &amp; Permissões</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20">6</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('taxonomia')}
          style={activeSubTab === 'taxonomia' ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'taxonomia'
              ? 'bg-[#202d32] !text-white shadow-xs'
              : 'text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4]'
          }`}
        >
          <Sliders size={14} className="shrink-0" />
          <span>Taxonomia &amp; Funil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sincronizacao')}
          style={activeSubTab === 'sincronizacao' ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'sincronizacao'
              ? 'bg-[#202d32] !text-white shadow-xs'
              : 'text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4]'
          }`}
        >
          <Cloud size={14} className="shrink-0" />
          <span>Nuvem &amp; Sincronização</span>
          {db.sync.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dados')}
          style={activeSubTab === 'dados' ? { color: '#ffffff' } : undefined}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            activeSubTab === 'dados'
              ? 'bg-[#202d32] !text-white shadow-xs'
              : 'text-[#566266] hover:text-[#202d32] hover:bg-[#f6f7f4]'
          }`}
        >
          <Database size={14} className="shrink-0" />
          <span>Cópias &amp; Manutenção</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: GERAL & AGÊNCIA
      ======================================================== */}
      {activeSubTab === 'geral' && (
        <form onSubmit={handleSaveAgencySettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco A: Identidade da Agência */}
            <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
              <div className="border-b border-[#d8dddc] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Identidade Institucional
                </span>
                <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Perfil da Agência</h2>
                <p className="text-xs text-[#566266]">Dados utilizados nas notificações, exports e cabeçalhos operacionais.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                    Nome da Empresa / Marca
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Draft & Rise"
                    className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Email Operacional
                    </label>
                    <input
                      type="email"
                      value={agencyEmail}
                      onChange={(e) => setAgencyEmail(e.target.value)}
                      placeholder="contacto@draftandrise.com"
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={agencyPhone}
                      onChange={(e) => setAgencyPhone(e.target.value)}
                      placeholder="+351 912 345 678"
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Moeda Padrão
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                    >
                      <option value="EUR">Euro (€ - EUR)</option>
                      <option value="USD">Dólar ($ - USD)</option>
                      <option value="BRL">Real (R$ - BRL)</option>
                      <option value="GBP">Libra (£ - GBP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Fuso Horário
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Europe/Lisbon (WET/WEST)"
                      className="w-full p-2.5 text-xs bg-[#f0f2f1] border border-[#d8dddc] rounded-lg text-[#566266] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco B: Parâmetros Operacionais de Gestão */}
            <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
              <div className="border-b border-[#d8dddc] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Automações &amp; Cadência
                </span>
                <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Regras Operacionais</h2>
                <p className="text-xs text-[#566266]">Define os limiares de inatividade, datas padrão e alertas automáticos.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#566266] uppercase tracking-wider">
                      Dias para Lead Estagnada
                    </label>
                    <span className="text-xs font-mono font-bold text-[#b5431c]">{staleDays} dias</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={staleDays}
                    onChange={(e) => setStaleDays(Number(e.target.value))}
                    className="w-full accent-[#ff6a36] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#8c999e] mt-0.5">
                    Leads sem contacto há mais de {staleDays} dias são marcadas com aviso de atenção no funil.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Dia Vencimento Avenças
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={defaultDueDay}
                      onChange={(e) => setDefaultDueDay(Number(e.target.value))}
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                    <p className="text-[10px] text-[#8c999e] mt-1">Dia sugerido ao fechar novo cliente (ex: dia 5)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Cadência de Posts GBP
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={defaultCadence}
                      onChange={(e) => setDefaultCadence(Number(e.target.value))}
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                    <p className="text-[10px] text-[#8c999e] mt-1">Frequência em dias para novas postagens no perfil</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                    Aviso Prévio de Avenças (Dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={alertDaysBeforeDue}
                    onChange={(e) => setAlertDaysBeforeDue(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <p className="text-[10px] text-[#8c999e] mt-1">
                    Mostra avisos na agenda e no painel {alertDaysBeforeDue} dias antes do vencimento da mensalidade.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="px-6 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/25 cursor-pointer"
            >
              Guardar Parâmetros Gerais
            </button>
          </div>
        </form>
      )}

      {/* ========================================================
          ABA 2: EQUIPA & PERMISSÕES
      ======================================================== */}
      {activeSubTab === 'equipa' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#202d32]">Contas da Equipa &amp; Níveis de Acesso</h2>
              <p className="text-xs text-[#566266] mt-0.5">
                Os utilizadores <strong>user1</strong>, <strong>user2</strong> e <strong>user3</strong> possuem autoridade total de administração. Os restantes utilizadores possuem permissão de operações e gestão de projetos.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff6a36]/10 border border-[#ff6a36]/30 text-xs font-semibold text-[#b5431c] shrink-0">
              <Shield size={14} />
              <span>3 Admins Totais Ativos</span>
            </div>
          </div>

          {/* Grelha dos 6 Membros da Equipa */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User 1 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#ff6a36]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#b5431c] uppercase tracking-wider">user1</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6a36] text-white">
                  Admin Total
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Admin Total · user1</h3>
                <p className="text-xs text-[#566266] mt-0.5">Fundador / Diretor Geral</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Acesso irrestrito a todo o portal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Gestão de avenças e financeiro</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Exportação, definições e reset</span>
                </div>
              </div>
            </div>

            {/* User 2 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#ff6a36]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#b5431c] uppercase tracking-wider">user2</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6a36] text-white">
                  Admin Total
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Admin Total · user2</h3>
                <p className="text-xs text-[#566266] mt-0.5">Sócio / Diretor Comercial</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Acesso irrestrito a todo o portal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Gestão de avenças e financeiro</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Exportação, definições e reset</span>
                </div>
              </div>
            </div>

            {/* User 3 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#ff6a36]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#b5431c] uppercase tracking-wider">user3</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6a36] text-white">
                  Admin Total
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Admin Total · user3</h3>
                <p className="text-xs text-[#566266] mt-0.5">Sócio / Diretor de Operações</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Acesso irrestrito a todo o portal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Gestão de avenças e financeiro</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Exportação, definições e reset</span>
                </div>
              </div>
            </div>

            {/* User 4 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#236a50]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#236a50] uppercase tracking-wider">user4</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#236a50] text-white">
                  Gestor de Operações
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Equipa · user4</h3>
                <p className="text-xs text-[#566266] mt-0.5">Especialista GBP &amp; SEO Local</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Prospeção e ficha de clientes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Checklist GBP e rotina semanal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Bloco de ideias e agenda geral</span>
                </div>
              </div>
            </div>

            {/* User 5 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#236a50]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#236a50] uppercase tracking-wider">user5</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#236a50] text-white">
                  Gestor de Operações
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Equipa · user5</h3>
                <p className="text-xs text-[#566266] mt-0.5">Copywriter &amp; Estratégia de Conteúdo</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Prospeção e ficha de clientes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Checklist GBP e rotina semanal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Bloco de ideias e agenda geral</span>
                </div>
              </div>
            </div>

            {/* User 6 */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#d8dddc] bg-white shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-[#236a50]" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#236a50] uppercase tracking-wider">user6</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#236a50] text-white">
                  Gestor de Operações
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202d32]">Equipa · user6</h3>
                <p className="text-xs text-[#566266] mt-0.5">Gestor de Contas &amp; Onboarding</p>
              </div>
              <div className="pt-2 border-t border-[#d8dddc] text-[11px] text-[#566266] space-y-1">
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Prospeção e ficha de clientes</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Checklist GBP e rotina semanal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#236a50]">
                  <CheckCircle2 size={12} />
                  <span>Bloco de ideias e agenda geral</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matriz de Permissões */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b5431c]">
              Matriz Detalhada de Autorização
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#d8dddc] text-[#566266]">
                    <th className="py-2 pr-4 font-semibold">Módulo / Funcionalidade</th>
                    <th className="py-2 px-4 font-semibold text-center">Admins (user1, user2, user3)</th>
                    <th className="py-2 pl-4 font-semibold text-center">Equipa (user4, user5, user6)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d8dddc]/60 text-[#202d32]">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Visualizar e Criar Leads / Clientes</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Sim</td>
                    <td className="py-2.5 pl-4 text-center font-bold text-[#236a50]">Sim</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Checklist GBP, Rankings e Auditorias</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Sim</td>
                    <td className="py-2.5 pl-4 text-center font-bold text-[#236a50]">Sim</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Rotina Semanal e Bloco de Ideias</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Sim</td>
                    <td className="py-2.5 pl-4 text-center font-bold text-[#236a50]">Sim</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Agenda Geral e Cronograma</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Sim</td>
                    <td className="py-2.5 pl-4 text-center font-bold text-[#236a50]">Sim</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Gestão Financeira &amp; Avenças Mensais</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Total</td>
                    <td className="py-2.5 pl-4 text-center font-medium text-[#566266]">Apenas Leitura</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Definições Globais e Gestão de Nuvem</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Total</td>
                    <td className="py-2.5 pl-4 text-center font-medium text-[#8c999e]">Restrito</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Eliminação Definitiva &amp; Reset do Sistema</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#236a50]">Total</td>
                    <td className="py-2.5 pl-4 text-center font-medium text-[#c43f17]">Bloqueado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#d8dddc] flex items-center gap-2 text-xs text-[#566266]">
              <Lock size={13} className="text-[#8c999e] shrink-0" />
              <span>
                As credenciais de acesso e senhas são geridas através das variáveis de ambiente de produção (<code>PORTAL_TEAM_USER1_PASS</code> a <code>USER6_PASS</code>).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: TAXONOMIA & FUNIL
      ======================================================== */}
      {activeSubTab === 'taxonomia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bloco 1: Nichos / Categorias de Clientes */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#d8dddc] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Segmentação de Mercado
                  </span>
                  <h2 className="text-base font-semibold text-[#202d32]">Nichos &amp; Categorias</h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetCategories}
                  className="text-[11px] font-semibold text-[#566266] hover:text-[#ff6a36] underline cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Novo nicho (ex: Ginásios & Fitness)..."
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
                <button
                  type="submit"
                  style={{ color: '#ffffff' }}
                  className="px-4 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Adicionar
                </button>
              </form>

              <div className="flex flex-wrap gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
                {db.categories.map((c, i) => {
                  const count = categoryCounts[c] || 0;
                  return (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32] shadow-2xs"
                    >
                      <span>{c}</span>
                      {count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#f6f7f4] text-[#566266] border border-[#d8dddc]">
                          {count}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(c)}
                        className="text-[#8c999e] hover:text-[#c43f17] ml-0.5 cursor-pointer"
                        title="Remover categoria"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-[#8c999e] pt-2 border-t border-[#d8dddc]">
              {db.categories.length} nichos configurados para classificação de leads e relatórios de clientes.
            </p>
          </div>

          {/* Bloco 2: Etiquetas / Tags Operacionais */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#d8dddc] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Sinalização Visual
                  </span>
                  <h2 className="text-base font-semibold text-[#202d32]">Etiquetas / Tags</h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetTags}
                  className="text-[11px] font-semibold text-[#566266] hover:text-[#ff6a36] underline cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>

              <form onSubmit={handleAddTag} className="space-y-3 mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome da etiqueta (ex: Ticket Alto)..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                  <button
                    type="submit"
                    style={{ color: '#ffffff' }}
                    className="px-4 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Seletor de Cores */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#566266] font-medium mr-1">Cor:</span>
                  {TAG_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewTagColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        newTagColor === c.hex ? 'border-[#202d32] scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </form>

              <div className="flex flex-wrap gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
                {db.tags.map((t) => {
                  const count = tagCounts[t.id] || 0;
                  return (
                    <span 
                      key={t.id} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32] shadow-2xs"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: t.color }} 
                      />
                      <span className="font-medium">{t.name}</span>
                      {count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#f6f7f4] text-[#566266] border border-[#d8dddc]">
                          {count}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t.id, t.name)}
                        className="text-[#8c999e] hover:text-[#c43f17] ml-0.5 cursor-pointer"
                        title="Remover tag"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-[#8c999e] pt-2 border-t border-[#d8dddc]">
              {db.tags.length} etiquetas disponíveis para categorização ágil nos cartões e filtros.
            </p>
          </div>

          {/* Bloco 3: Motivos de Perda no Funil */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#d8dddc] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Métricas de Conversão
                  </span>
                  <h2 className="text-base font-semibold text-[#202d32]">Motivos de Perda no Funil</h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetReasons}
                  className="text-[11px] font-semibold text-[#566266] hover:text-[#ff6a36] underline cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>

              <form onSubmit={handleAddReason} className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Novo motivo (ex: Preferiu agência local)..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
                <button
                  type="submit"
                  style={{ color: '#ffffff' }}
                  className="px-4 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Adicionar
                </button>
              </form>

              <div className="flex flex-wrap gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
                {db.reasons.map((r, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32] shadow-2xs"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReason(r)}
                      className="text-[#8c999e] hover:text-[#c43f17] ml-0.5 cursor-pointer"
                      title="Remover motivo"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#8c999e] pt-2 border-t border-[#d8dddc]">
              Opções selecionáveis ao mover um negócio para o estado &quot;Perdido&quot;.
            </p>
          </div>

          {/* Bloco 4: Pontos de Auditoria Rápida GBP */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#d8dddc] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Auditoria Rápida GBP
                  </span>
                  <h2 className="text-base font-semibold text-[#202d32]">Critérios de Prospeção</h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetAnalysis}
                  className="text-[11px] font-semibold text-[#566266] hover:text-[#ff6a36] underline cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>

              <form onSubmit={handleAddAnalysis} className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Novo critério (ex: Sem fotos de interiores)..."
                  value={newAnalysis}
                  onChange={(e) => setNewAnalysis(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
                <button
                  type="submit"
                  style={{ color: '#ffffff' }}
                  className="px-4 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Adicionar
                </button>
              </form>

              <div className="flex flex-wrap gap-2 mt-4 max-h-56 overflow-y-auto pr-1">
                {db.analysis.map((a, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32] shadow-2xs"
                  >
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAnalysis(a)}
                      className="text-[#8c999e] hover:text-[#c43f17] ml-0.5 cursor-pointer"
                      title="Remover critério"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#8c999e] pt-2 border-t border-[#d8dddc]">
              Critérios de diagnóstico de ficha utilizados na prospeção comercial.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: NUVEM & SINCRONIZAÇÃO (SUPABASE)
      ======================================================== */}
      {activeSubTab === 'sincronizacao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Painel de Configuração */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
              <div className="border-b border-[#d8dddc] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                    Colaboração em Tempo Real
                  </span>
                  <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Nuvem Supabase Realtime</h2>
                  <p className="text-xs text-[#566266]">
                    Permite que todos os membros da equipa vejam atualizações em direto.
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  db.sync.enabled 
                    ? 'bg-[#236a50]/10 border-[#236a50]/30 text-[#236a50]' 
                    : 'bg-[#8c999e]/10 border-[#8c999e]/30 text-[#566266]'
                }`}>
                  {db.sync.enabled ? 'Sincronização Ativa' : 'Desativada'}
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                    URL do Projeto Supabase
                  </label>
                  <input
                    type="text"
                    placeholder="https://exemplo-projeto.supabase.co"
                    value={supaUrl}
                    onChange={(e) => setSupaUrl(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                    Chave Anónima (Anon Public Key)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supaKey}
                    onChange={(e) => setSupaKey(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Sala / Room da Agência
                    </label>
                    <input
                      type="text"
                      placeholder="gbp-team-default"
                      value={supaRoom}
                      onChange={(e) => setSupaRoom(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                      Código de Acesso
                    </label>
                    <input
                      type="password"
                      placeholder="Palavra-passe de sincronização"
                      value={supaPass}
                      onChange={(e) => setSupaPass(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                    />
                  </div>
                </div>

                {syncStatusMsg && (
                  <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                    syncStatusMsg.ok 
                      ? 'bg-white text-[#236a50] border-[#236a50]/30' 
                      : 'bg-white text-[#c43f17] border-[#c43f17]/30'
                  }`}>
                    {syncStatusMsg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{syncStatusMsg.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={testing}
                    onClick={handleTestConnection}
                    className="px-4 py-2 border border-[#d8dddc] text-[#202d32] hover:border-[#202d32] rounded-full text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {testing ? 'A testar ligação...' : 'Testar Ligação'}
                  </button>

                  <button
                    type="button"
                    disabled={testing}
                    onClick={() => handleSaveSync(true)}
                    style={{ color: '#ffffff' }}
                    className="px-5 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-full text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Ativar Sincronização
                  </button>

                  {db.sync.enabled && (
                    <button
                      type="button"
                      onClick={() => handleSaveSync(false)}
                      className="px-4 py-2 border border-[#c43f17] text-[#c43f17] hover:bg-[#c43f17] hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
                    >
                      Desligar Nuvem
                    </button>
                  )}

                  {db.sync.enabled && (
                    <button
                      type="button"
                      disabled={syncingManual}
                      onClick={handleManualSync}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d8dddc] text-[#566266] hover:text-[#202d32] hover:border-[#202d32] rounded-full text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} className={syncingManual ? 'animate-spin' : ''} />
                      <span>{syncingManual ? 'A sincronizar...' : 'Sincronizar Agora'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Guia Rápido de Instalação */}
            <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#fcfcfa] space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#236a50]">
                  Instruções Rápidas
                </span>
                <h3 className="text-sm font-semibold text-[#202d32] mt-0.5">Tabela de Armazenamento</h3>
                <p className="text-xs text-[#566266] mt-1 leading-relaxed">
                  Para sincronizar na nuvem, o projeto Supabase necessita de uma tabela chamada <code>team_storage</code> com colunas <code>id</code> (text) e <code>data</code> (jsonb).
                </p>

                <div className="mt-3 p-3 bg-[#202d32] text-[#d8dddc] rounded-lg font-mono text-[10px] overflow-x-auto select-all">
                  CREATE TABLE IF NOT EXISTS team_storage (
                  <br />&nbsp;&nbsp;id text PRIMARY KEY,
                  <br />&nbsp;&nbsp;data jsonb NOT NULL,
                  <br />&nbsp;&nbsp;updated_at timestamptz DEFAULT now()
                  <br />);
                </div>
              </div>

              <div className="pt-3 border-t border-[#d8dddc] text-xs text-[#566266]">
                <p>Mesmo sem Supabase ativo, a plataforma guarda tudo localmente via <strong>IndexedDB</strong> com zero perda de dados.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: CÓPIAS DE SEGURANÇA & MANUTENÇÃO
      ======================================================== */}
      {activeSubTab === 'dados' && (
        <div className="space-y-6">
          {/* Diagnóstico da Base de Dados */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">Empresas</span>
              <div className="text-2xl font-bold text-[#202d32] mt-1">{systemStats.totalCompanies}</div>
              <div className="text-[11px] text-[#566266] mt-0.5">
                {systemStats.clientCount} clientes • {systemStats.prospectCount} leads
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#236a50]">Tarefas na Rotina</span>
              <div className="text-2xl font-bold text-[#202d32] mt-1">{systemStats.weekTasksCount}</div>
              <div className="text-[11px] text-[#566266] mt-0.5">Checklists operacionais</div>
            </div>

            <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#202d32]">Ideias &amp; Agenda</span>
              <div className="text-2xl font-bold text-[#202d32] mt-1">{systemStats.ideasCount + systemStats.eventsCount}</div>
              <div className="text-[11px] text-[#566266] mt-0.5">
                {systemStats.ideasCount} ideias • {systemStats.eventsCount} eventos
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#d8dddc] bg-[#f6f7f4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#566266]">Lixeira de Notas</span>
              <div className="text-2xl font-bold text-[#202d32] mt-1">{systemStats.trashCount}</div>
              <div className="text-[11px] text-[#566266] mt-0.5">Notas arquivadas</div>
            </div>
          </div>

          {/* Exportações Especializadas */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
            <div className="border-b border-[#d8dddc] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                Portabilidade &amp; Relatórios
              </span>
              <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Exportação de Dados</h2>
              <p className="text-xs text-[#566266]">
                Descarrega os registos em formatos abertos para cópias de segurança ou análise em Excel / Google Sheets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Exportar JSON Completo */}
              <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-[#202d32] flex items-center gap-1.5">
                    <Database size={13} className="text-[#ff6a36]" />
                    <span>Backup Completo do Sistema (JSON)</span>
                  </div>
                  <div className="text-[11px] text-[#566266] mt-0.5">
                    Guarda tudo (empresas, rotinas, ideias, agenda e definições)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exportBackup}
                  className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Descarregar JSON
                </button>
              </div>

              {/* Exportar Clientes CSV */}
              <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-[#202d32] flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-[#236a50]" />
                    <span>Carteira de Clientes &amp; Avenças (CSV)</span>
                  </div>
                  <div className="text-[11px] text-[#566266] mt-0.5">
                    Tabela Excel com contactos, faturamento e progresso
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exportCSV}
                  className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#236a50] hover:text-[#236a50] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Exportar CSV
                </button>
              </div>

              {/* Exportar Ideias CSV */}
              <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-[#202d32] flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-[#3b82f6]" />
                    <span>Bloco de Ideias &amp; Estratégias (CSV)</span>
                  </div>
                  <div className="text-[11px] text-[#566266] mt-0.5">
                    {systemStats.ideasCount} ideias, autores, categorias e conteúdos
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exportIdeasCSV}
                  className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#3b82f6] hover:text-[#3b82f6] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Exportar CSV
                </button>
              </div>

              {/* Exportar Agenda CSV */}
              <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-[#202d32] flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-[#8b5cf6]" />
                    <span>Agenda &amp; Calendário Geral (CSV)</span>
                  </div>
                  <div className="text-[11px] text-[#566266] mt-0.5">
                    {systemStats.eventsCount} eventos com datas, prioridades e estados
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exportEventsCSV}
                  className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#8b5cf6] hover:text-[#8b5cf6] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Restauro e Importação Segura */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
            <div className="border-b border-[#d8dddc] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                Restauração Segura
              </span>
              <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Importar Backup JSON</h2>
              <p className="text-xs text-[#566266]">
                Carrega um ficheiro de backup gerado anteriormente. Os dados serão validados antes da confirmação.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Carregar Ficheiro JSON</div>
                <div className="text-[11px] text-[#566266]">Máximo 10 MB com validação estrutural estrita</div>
              </div>

              <label 
                style={{ color: '#ffffff' }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#202d32] hover:bg-[#2c3d44] !text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Upload size={14} className="shrink-0" />
                <span>Escolher Ficheiro</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleSelectImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Ambiente de Testes & Demonstração */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
            <div className="border-b border-[#d8dddc] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#236a50]">
                Ambiente de Demonstração
              </span>
              <h2 className="text-base font-semibold text-[#202d32] mt-0.5">Portfólio de Teste</h2>
              <p className="text-xs text-[#566266]">
                Preenche a plataforma com empresas e tarefas simuladas para testar fluxos ou formação interna.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Carregar Portfólio Modelo</div>
                <div className="text-[11px] text-[#566266]">5 empresas em diferentes fases com checklists completas</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Carregar dados de teste fictícios para demonstração?')) {
                    loadDemoData();
                  }
                }}
                className="px-4 py-2 rounded-full border border-[#236a50] text-[#236a50] hover:bg-[#236a50] hover:text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
              >
                Carregar Demonstração
              </button>
            </div>
          </div>

          {/* Zona de Perigo / Manutenção Crítica */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#c43f17]/30 bg-[#fdfaf9] space-y-4">
            <div className="border-b border-[#c43f17]/20 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c43f17]">
                Zona de Segurança
              </span>
              <h2 className="text-base font-semibold text-[#c43f17] mt-0.5">Manutenção &amp; Eliminação</h2>
              <p className="text-xs text-[#566266]">Ações irreversíveis que afetam o armazenamento permanente.</p>
            </div>

            <div className="space-y-3">
              {/* Esvaziar Lixeira */}
              <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#202d32]">Esvaziar Lixeira de Notas</div>
                  <div className="text-[11px] text-[#566266]">
                    Elimina em definitivo as {systemStats.trashCount} notas arquivadas
                  </div>
                </div>

                <button
                  type="button"
                  disabled={systemStats.trashCount === 0}
                  onClick={() => {
                    if (confirm(`Eliminar definitivamente as ${systemStats.trashCount} notas da lixeira?`)) {
                      clearTrashNotes();
                    }
                  }}
                  className="px-4 py-2 rounded-full border border-[#8c999e] text-[#566266] hover:text-[#c43f17] hover:border-[#c43f17] disabled:opacity-40 text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  Esvaziar Lixeira
                </button>
              </div>

              {/* Repor Tudo a Zero */}
              <div className="p-4 bg-white rounded-lg border border-[#c43f17]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#c43f17]">Repor Todo o Sistema a Zero</div>
                  <div className="text-[11px] text-[#566266]">
                    Apaga todas as empresas, tarefas, ideias, eventos e repõe o estado inicial
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetConfirmInput('');
                    setResetModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#c43f17] hover:bg-[#a83412] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Repor a Zero
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRMAÇÃO DE IMPORTAÇÃO DE BACKUP
      ======================================================== */}
      {importSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#d8dddc] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                Validação de Backup
              </span>
              <h3 className="text-lg font-semibold text-[#202d32] mt-0.5">Confirmar Restauro de Dados</h3>
              <p className="text-xs text-[#566266] mt-1">
                O ficheiro selecionado foi verificado com sucesso. Confere os registos que serão importados:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f6f7f4] border border-[#d8dddc] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#566266]">Empresas detetadas:</span>
                <span className="font-bold text-[#202d32]">{importSummary.companiesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#566266]">Ideias detetadas:</span>
                <span className="font-bold text-[#202d32]">{importSummary.ideasCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#566266]">Eventos de agenda:</span>
                <span className="font-bold text-[#202d32]">{importSummary.eventsCount}</span>
              </div>
            </div>

            <div className="p-3 bg-[#fff8f5] border border-[#ff6a36]/30 rounded-lg text-[11px] text-[#b5431c]">
              <strong>Atenção:</strong> Ao confirmar, os dados locais atuais serão substituídos pelos dados do ficheiro.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportSummary(null)}
                className="px-4 py-2 rounded-full border border-[#d8dddc] text-xs font-medium text-[#566266] hover:text-[#202d32] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                style={{ color: '#ffffff' }}
                className="px-5 py-2 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Restaurar Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SEGURANÇA CONTRA RESET ACIDENTAL
      ======================================================== */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#c43f17]/40 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c43f17]">
                Ação Crítica Irreversível
              </span>
              <h3 className="text-lg font-bold text-[#202d32] mt-0.5">Tens a certeza absoluta?</h3>
              <p className="text-xs text-[#566266] mt-1 leading-relaxed">
                Esta ação vai eliminar <strong>todas as empresas, tarefas, rotinas, ideias, eventos e notas</strong> da base de dados local. Os dados não poderão ser recuperados a menos que tenhas um backup JSON exportado.
              </p>
            </div>

            <div className="p-3 bg-[#fdfaf9] border border-[#c43f17]/30 rounded-lg space-y-2">
              <label className="block text-xs font-medium text-[#202d32]">
                Escreve <strong className="text-[#c43f17] select-all">LIMPAR</strong> abaixo para confirmar:
              </label>
              <input
                type="text"
                placeholder="LIMPAR"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c43f17]/40 rounded-lg text-[#202d32] focus:outline-none focus:border-[#c43f17] font-mono uppercase tracking-wider"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-full border border-[#d8dddc] text-xs font-medium text-[#566266] hover:text-[#202d32] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== 'LIMPAR'}
                onClick={handleExecuteFullReset}
                className="px-5 py-2 rounded-full bg-[#c43f17] hover:bg-[#a83412] disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Eliminar Tudo &amp; Repor a Zero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
