'use client';

import React, { useState } from 'react';
import { 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Tag as TagIcon
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { testSupabaseConnection } from './supabase';
import { generateId } from './utils';

export const SettingsView: React.FC = () => {
  const { 
    db, 
    updateSettings, 
    exportBackup, 
    exportCSV,
    importBackup, 
    syncCloud, 
    loadDemoData, 
    clearAllData,
    showToast 
  } = useDashboard();

  const [supaUrl, setSupaUrl] = useState(db.sync.url || '');
  const [supaKey, setSupaKey] = useState(db.sync.key || '');
  const [supaRoom, setSupaRoom] = useState(db.sync.room || 'gbp-team-default');
  const [supaPass, setSupaPass] = useState(db.sync.password || '');
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [testing, setTesting] = useState(false);

  const [newCat, setNewCat] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#ff6a36');

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
        url: supaUrl,
        key: supaKey,
        password: supaPass,
        room: supaRoom || 'gbp-team-default'
      }
    });

    setTesting(false);
    if (enable) {
      const syncResult = await syncCloud();
      if (syncResult.ok) {
        setSyncStatusMsg({
          text: 'Sincronização ativada.',
          ok: true
        });
      } else {
        setSyncStatusMsg({
          text: syncResult.error || 'Falha ao sincronizar com a nuvem.',
          ok: false
        });
      }
    } else {
      setSyncStatusMsg({
        text: 'Sincronização desativada.',
        ok: true
      });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      if (success) {
        showToast('Backup restaurado.', 'success');
      } else {
        showToast('Ficheiro inválido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    updateSettings({
      categories: [...db.categories, newCat.trim()]
    });
    setNewCat('');
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;
    updateSettings({
      reasons: [...db.reasons, newReason.trim()]
    });
    setNewReason('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    updateSettings({
      tags: [...db.tags, { id: generateId(), name: newTagName.trim(), color: newTagColor }]
    });
    setNewTagName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#d8dddc]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
          Sistema &amp; Definições
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] tracking-tight mt-0.5">
          Configurações da Equipa<span className="text-[#c74418]">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#566266] mt-1">
          Personalização de nichos, regras de funil, cópias de segurança e sincronização.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sincronização em Nuvem (Supabase) */}
        <div className="p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
          <div className="border-b border-[#d8dddc] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Partilha em Tempo Real
            </span>
            <h2 className="text-base font-semibold text-[#202d32]">Nuvem Supabase</h2>
            <p className="text-xs text-[#566266]">Partilha dados com todos os membros da equipa em direto.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">URL do Projeto</label>
              <input
                type="text"
                placeholder="https://xxxx.supabase.co"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">Chave Anónima (anon key)</label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">Sala / Room</label>
                <input
                  type="text"
                  placeholder="gbp-team-default"
                  value={supaRoom}
                  onChange={(e) => setSupaRoom(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">Código de Acesso</label>
                <input
                  type="text"
                  placeholder="ex.: equipa2026"
                  value={supaPass}
                  onChange={(e) => setSupaPass(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
              </div>
            </div>

            {syncStatusMsg && (
              <div className={`p-3 rounded-lg text-xs font-medium border ${
                syncStatusMsg.ok ? 'bg-white text-[#236a50] border-[#236a50]/30' : 'bg-white text-[#c43f17] border-[#c43f17]/30'
              }`}>
                {syncStatusMsg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={testing}
                onClick={() => handleSaveSync(true)}
                className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-full text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {testing ? 'A testar...' : 'Ativar Sincronização'}
              </button>

              {db.sync.enabled && (
                <button
                  type="button"
                  onClick={() => handleSaveSync(false)}
                  className="px-4 py-2 border border-[#d8dddc] text-[#566266] hover:text-[#202d32] hover:border-[#202d32] rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  Desligar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cópia de Segurança & Demonstração */}
        <div className="p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
          <div className="border-b border-[#d8dddc] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Armazenamento Local
            </span>
            <h2 className="text-base font-semibold text-[#202d32]">Backup &amp; Dados</h2>
            <p className="text-xs text-[#566266]">Exporta ficheiros JSON ou restaura carteiras anteriores.</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Exportar Base de Dados</div>
                <div className="text-[11px] text-[#566266]">Descarrega ficheiro JSON de segurança</div>
              </div>
              <button
                onClick={exportBackup}
                className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs"
              >
                Descarregar
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Exportar Carteira em CSV</div>
                <div className="text-[11px] text-[#566266]">Tabela Excel com clientes, contactos e avenças</div>
              </div>
              <button
                onClick={exportCSV}
                className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs"
              >
                Exportar CSV
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Importar Backup JSON</div>
                <div className="text-[11px] text-[#566266]">Substitui com dados de ficheiro anterior</div>
              </div>
              <label className="px-3.5 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] bg-[#fcfcfa] hover:bg-white transition-colors cursor-pointer shadow-xs">
                <span>Escolher ficheiro</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#d8dddc] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#202d32]">Portfólio de Demonstração</div>
                <div className="text-[11px] text-[#566266]">Preenche com 5 empresas reais para teste</div>
              </div>
              <button
                type="button"
                onClick={loadDemoData}
                className="px-3.5 py-1.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Carregar demo
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#c43f17]/30 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#c43f17]">Repor Sistema a Zero</div>
                <div className="text-[11px] text-[#566266]">Apaga todos os dados e repõe a vazio</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tens a certeza de que queres apagar todos os dados locais?')) {
                    clearAllData();
                  }
                }}
                className="px-3.5 py-1.5 rounded-full border border-[#c43f17] text-[#c43f17] hover:bg-[#c43f17] hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Limpar tudo
              </button>
            </div>
          </div>
        </div>

        {/* Categorias & Nichos */}
        <div className="p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
          <div className="border-b border-[#d8dddc] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Segmentação
            </span>
            <h2 className="text-base font-semibold text-[#202d32]">Categorias / Nichos</h2>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Novo nicho (ex: Barbearia)..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 p-2 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
            />
            <button type="submit" className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs">
              Adicionar
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {db.categories.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32]">
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = db.categories.filter((_, idx) => idx !== i);
                    updateSettings({ categories: next });
                  }}
                  className="text-[#8c999e] hover:text-[#c43f17] cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Motivos de Perda */}
        <div className="p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] space-y-4">
          <div className="border-b border-[#d8dddc] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Análise de Funil
            </span>
            <h2 className="text-base font-semibold text-[#202d32]">Motivos de Perda</h2>
          </div>

          <form onSubmit={handleAddReason} className="flex gap-2">
            <input
              type="text"
              placeholder="Novo motivo (ex: Orçamento)..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="flex-1 p-2 text-xs bg-white border border-[#d8dddc] rounded-lg text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
            />
            <button type="submit" className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs">
              Adicionar
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {db.reasons.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d8dddc] rounded-full text-xs text-[#202d32]">
                <span>{r}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = db.reasons.filter((_, idx) => idx !== i);
                    updateSettings({ reasons: next });
                  }}
                  className="text-[#8c999e] hover:text-[#c43f17] cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
