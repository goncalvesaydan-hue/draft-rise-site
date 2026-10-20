'use client';

import React, { useState } from 'react';
import { 
  Users, 
  BadgeEuro, 
  Target, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Check
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { PIPELINE_STAGES } from './constants';
import { formatCurrency, formatDateOnly } from './utils';

export const OverviewDashboard: React.FC = () => {
  const { 
    db, 
    setActiveTab, 
    setSelectedCompanyId, 
    updateCompany, 
    addPost,
    showToast 
  } = useDashboard();

  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderCompanyId, setNewReminderCompanyId] = useState('');

  const companies = db.companies.filter(c => !c.deletedAt);
  const activeClients = companies.filter(c => c.status === 'cliente');
  const prospects = companies.filter(c => c.area === 'prospect');

  // Cálculos Financeiros
  const totalMrr = activeClients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
  const annualProjection = totalMrr * 12;
  const paidClients = activeClients.filter(c => c.paymentStatus === 'pago');
  const lateClients = activeClients.filter(c => c.paymentStatus === 'atrasado');
  const paidPercentage = activeClients.length > 0 
    ? Math.round((paidClients.length / activeClients.length) * 100) 
    : 0;

  // Taxa de Conversão
  const totalHistorically = companies.length;
  const conversionRate = totalHistorically > 0
    ? Math.round((activeClients.length / totalHistorically) * 100)
    : 0;

  // Alertas de Cadência de Postagens (Google Meu Negócio)
  const todayMs = Date.now();
  const latePosts = activeClients
    .map(c => {
      const lastPostDate = c.posts[0]?.at || c.createdAt.slice(0, 10);
      const diffDays = Math.max(0, Math.floor((todayMs - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)));
      const cadence = c.cadence || 7;
      const isLate = diffDays > cadence;
      return { company: c, lastPostDate, diffDays, cadence, isLate };
    })
    .filter(item => item.isLate)
    .sort((a, b) => b.diffDays - a.diffDays);

  // Lembretes Abertos
  const todayIso = new Date().toISOString().slice(0, 10);
  const allReminders = companies.flatMap(c => 
    c.reminders
      .filter(r => !r.done)
      .map(r => ({ ...r, companyName: c.name, companyId: c.id }))
  );
  const todayReminders = allReminders.filter(r => r.due === todayIso);
  const overdueReminders = allReminders.filter(r => r.due < todayIso);

  const handleToggleReminder = (companyId: string, reminderId: string) => {
    const comp = db.companies.find(c => c.id === companyId);
    if (!comp) return;
    const updated = comp.reminders.map(r => r.id === reminderId ? { ...r, done: !r.done } : r);
    updateCompany(companyId, { reminders: updated });
    showToast('Lembrete atualizado.', 'info');
  };

  const handleQuickAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const targetCompId = newReminderCompanyId || companies[0]?.id;
    if (!targetCompId) return;

    const comp = db.companies.find(c => c.id === targetCompId);
    if (!comp) return;

    const newRem = {
      id: Date.now().toString(36),
      due: todayIso,
      note: newReminderText.trim(),
      done: false,
      kind: 'custom' as const
    };
    updateCompany(targetCompId, {
      reminders: [...comp.reminders, newRem]
    });
    setNewReminderText('');
    showToast(`Lembrete associado a ${comp.name}.`, 'success');
  };

  const handleQuickRecordPost = (companyId: string, companyName: string) => {
    addPost(companyId, todayIso, 'Publicação efetuada no Perfil Google.');
    showToast(`Post registado para ${companyName}.`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Editorial Hero Banner — Estilo Autêntico Draft & Rise */}
      <section className="bg-[#dce9ee] dark:bg-[#1a282e] rounded-2xl p-6 sm:p-10 border border-[#c9dbe2] dark:border-[#2a3e47] relative transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7]">
              <span className="w-2 h-2 rounded-full bg-[#ff6a36]" />
              <span>Painel Operacional · Draft &amp; Rise</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.05em] text-[#202d32] dark:text-[#f5f7f7] leading-[1.05]">
              Resultados locais.<br />Controlo absoluto<span className="text-[#c74418]">.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#566266] dark:text-[#9cb0b7] leading-relaxed pt-1">
              Supervisão central de clientes ativos, avenças recorrentes e cadência de publicações no Google Maps.
            </p>
          </div>

          {/* Action Button — Formato Característico do Site em Laranja de Alta Visibilidade */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('prospeccao')}
              className="inline-flex items-center gap-4 pl-5 pr-2 py-1.5 min-h-[48px] rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold shadow-md shadow-[#ff6a36]/25 transition-all group cursor-pointer"
            >
              <span>Abrir Funil Prospecção</span>
              <span className="w-8 h-8 rounded-full bg-white text-[#ff6a36] grid place-items-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </span>
            </button>

            <button
              onClick={() => setActiveTab('semana')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white dark:bg-[#25353d] hover:bg-[#f6f7f4] dark:hover:bg-[#2c3f48] border border-[#d8dddc] dark:border-[#354852] text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7] hover:border-[#ff6a36] transition-colors cursor-pointer shadow-xs"
            >
              <Calendar size={14} className="text-[#ff6a36]" />
              <span>Rotina Semanal</span>
            </button>

            <button
              onClick={() => setActiveTab('financeiro')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white dark:bg-[#25353d] hover:bg-[#f6f7f4] dark:hover:bg-[#2c3f48] border border-[#d8dddc] dark:border-[#354852] text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7] hover:border-[#236a50] transition-colors cursor-pointer shadow-xs"
            >
              <BadgeEuro size={14} className="text-[#236a50]" />
              <span>Avenças</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid de 4 Indicadores Operacionais — Estilo Sector-Card Responsivo */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Clientes Ativos */}
        <div 
          onClick={() => setActiveTab('clientes')}
          className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-[#fcfcfa] dark:hover:bg-[#223136] hover:border-[#ff6a36] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Carteira Ativa
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dce9ee] dark:bg-[#25353d] text-[#202d32] dark:text-[#f5f7f7] grid place-items-center">
              <Users size={14} className="sm:hidden" />
              <Users size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-3">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32] dark:text-[#f5f7f7]">
              {activeClients.length}
            </div>
          </div>
          <div className="pt-2 sm:pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-[10px] sm:text-xs text-[#566266] dark:text-[#9cb0b7]">
            <span>{paidClients.length} em dia</span>
            <span className="font-semibold text-[#202d32] dark:text-[#f5f7f7]">{paidPercentage}% regular</span>
          </div>
        </div>

        {/* Faturação Recorrente (MRR) */}
        <div 
          onClick={() => setActiveTab('financeiro')}
          className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-[#fcfcfa] dark:hover:bg-[#223136] hover:border-[#236a50] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Avenças Mensais
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dce9ee] dark:bg-[#25353d] text-[#202d32] dark:text-[#f5f7f7] grid place-items-center">
              <BadgeEuro size={14} className="sm:hidden" />
              <BadgeEuro size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-3">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32] dark:text-[#f5f7f7]">
              {formatCurrency(totalMrr)}
            </div>
          </div>
          <div className="pt-2 sm:pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-[10px] sm:text-xs text-[#566266] dark:text-[#9cb0b7]">
            <span>ARR:</span>
            <span className="font-semibold text-[#202d32] dark:text-[#f5f7f7] truncate">{formatCurrency(annualProjection)}</span>
          </div>
        </div>

        {/* Funil de Prospecção */}
        <div 
          onClick={() => setActiveTab('prospeccao')}
          className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-[#fcfcfa] dark:hover:bg-[#223136] hover:border-[#ff6a36] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Em Negociação
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dce9ee] dark:bg-[#25353d] text-[#202d32] dark:text-[#f5f7f7] grid place-items-center">
              <Target size={14} className="sm:hidden" />
              <Target size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-3">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32] dark:text-[#f5f7f7]">
              {prospects.length}
            </div>
          </div>
          <div className="pt-2 sm:pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-[10px] sm:text-xs text-[#566266] dark:text-[#9cb0b7]">
            <span>Conversão:</span>
            <span className="font-semibold text-[#202d32] dark:text-[#f5f7f7]">{conversionRate}%</span>
          </div>
        </div>

        {/* Alertas */}
        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Atenção Requerida
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dce9ee] dark:bg-[#25353d] text-[#202d32] dark:text-[#f5f7f7] grid place-items-center">
              <AlertTriangle size={14} className="sm:hidden" />
              <AlertTriangle size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-3">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32] dark:text-[#f5f7f7]">
              {latePosts.length + overdueReminders.length}
            </div>
          </div>
          <div className="pt-2 sm:pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-[10px] sm:text-xs text-[#566266] dark:text-[#9cb0b7]">
            <span>{latePosts.length} posts atrasados</span>
            <span>{overdueReminders.length} lembretes</span>
          </div>
        </div>
      </section>

      {/* Conteúdo Central */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Distribuição do Funil e Monitor Google Maps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribuição das Etapas */}
          <div className="p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#162024] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Ciclo de Vendas
                </span>
                <h2 className="text-lg font-semibold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
                  Distribuição do Funil
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('prospeccao')}
                className="text-xs font-medium text-[#202d32] dark:text-[#f5f7f7] hover:text-[#c43f17] dark:hover:text-[#ff6a36] inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ver quadro</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PIPELINE_STAGES.filter(s => s.id !== 'cliente').map((stage) => {
                const count = prospects.filter(p => p.status === stage.id).length;
                return (
                  <div 
                    key={stage.id} 
                    onClick={() => setActiveTab('prospeccao')}
                    className="p-4 rounded-lg border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-white dark:hover:bg-[#223136] hover:border-[#ff6a36] transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-semibold text-[#566266] dark:text-[#9cb0b7] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="truncate">{stage.label}</span>
                    </div>
                    <div className="text-2xl font-semibold text-[#202d32] dark:text-[#f5f7f7] mt-2">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cadência no Google Meu Negócio */}
          <div className="p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#162024] transition-colors">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d8dddc] dark:border-[#2a3a41]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Google Business Profile
                </span>
                <h2 className="text-lg font-semibold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
                  Cadência de Publicações
                </h2>
              </div>

              {latePosts.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fff4ef] dark:bg-[#2f1f1a] border border-[#ff6a36]/30 text-[#b5431c] dark:text-[#ff8f66]">
                  {latePosts.length} em atraso
                </span>
              )}
            </div>

            {latePosts.length > 0 ? (
              <div className="space-y-3">
                {latePosts.map(({ company: c, diffDays, cadence }) => (
                  <div 
                    key={c.id} 
                    className="p-4 rounded-lg border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#ff6a36] transition-colors"
                  >
                    <div 
                      onClick={() => setSelectedCompanyId(c.id)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-semibold text-sm text-[#202d32] dark:text-[#f5f7f7] hover:text-[#ff6a36]">
                        {c.name}
                        <span className="text-xs font-normal text-[#566266] dark:text-[#9cb0b7] ml-2">({c.city})</span>
                      </div>
                      <div className="text-xs text-[#566266] dark:text-[#9cb0b7] mt-1">
                        Sem publicação há <strong className="text-[#c43f17] dark:text-[#ff8f66]">{diffDays} dias</strong> (objetivo: a cada {cadence} dias)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${c.name}, da equipa Draft & Rise! Estamos a preparar as próximas publicações no vosso Perfil do Google. Têm novidades ou fotos desta semana que queiram partilhar?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full border border-[#202d32]/20 dark:border-[#2a3a41] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-medium text-[#202d32] dark:text-[#f5f7f7] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleQuickRecordPost(c.id, c.name)}
                        className="px-3.5 py-1.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer"
                      >
                        ✓ Post feito hoje
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#f6f7f4] dark:bg-[#1c272c] rounded-lg border border-[#d8dddc] dark:border-[#2a3a41]">
                <p className="text-xs text-[#566266] dark:text-[#9cb0b7]">
                  Todas as empresas ativas têm publicações no Google em dia.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Lembretes Operacionais da Equipa */}
        <div className="p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#162024] flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <div className="border-b border-[#d8dddc] dark:border-[#2a3a41] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                Tarefas &amp; Agenda
              </span>
              <h2 className="text-lg font-semibold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
                Lembretes Internos
              </h2>
            </div>

            {/* Quick Add */}
            {companies.length > 0 && (
              <form onSubmit={handleQuickAddReminder} className="space-y-2">
                <input
                  type="text"
                  placeholder="Novo lembrete para hoje..."
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#ff6a36]"
                />
                <div className="flex gap-2">
                  <select
                    value={newReminderCompanyId || companies[0]?.id}
                    onChange={(e) => setNewReminderCompanyId(e.target.value)}
                    className="flex-1 p-2 bg-[#f6f7f4] dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#ff6a36]"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-lg text-xs font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            )}

            {/* Lista Hoje */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider">
                Hoje ({todayReminders.length})
              </div>
              {todayReminders.length > 0 ? (
                todayReminders.map(r => (
                  <div 
                    key={r.id} 
                    className="p-3 rounded-lg border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] text-xs flex items-start justify-between gap-2"
                  >
                    <div 
                      onClick={() => setSelectedCompanyId(r.companyId)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-semibold text-[#202d32] dark:text-[#f5f7f7]">{r.companyName}</div>
                      <div className="text-[#566266] dark:text-[#9cb0b7] mt-0.5">{r.note}</div>
                    </div>
                    <button
                      onClick={() => handleToggleReminder(r.companyId, r.id)}
                      className="w-6 h-6 rounded-md border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#223136] grid place-items-center text-[#202d32] dark:text-[#f5f7f7] hover:bg-[#236a50] hover:text-white hover:border-[#236a50] transition-colors cursor-pointer"
                      title="Concluir"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#566266] dark:text-[#9cb0b7] py-2">Sem tarefas marcadas para hoje.</p>
              )}
            </div>

            {/* Atrasados */}
            {overdueReminders.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41]">
                <div className="text-xs font-semibold text-[#c43f17] dark:text-[#ff8f66] uppercase tracking-wider">
                  Em Atraso ({overdueReminders.length})
                </div>
                {overdueReminders.slice(0, 3).map(r => (
                  <div 
                    key={r.id} 
                    className="p-3 rounded-lg border border-[#c43f17]/30 dark:border-[#ff6a36]/30 bg-[#f6f7f4] dark:bg-[#1c272c] text-xs flex items-start justify-between gap-2"
                  >
                    <div 
                      onClick={() => setSelectedCompanyId(r.companyId)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-semibold text-[#c43f17] dark:text-[#ff8f66]">{r.companyName}</div>
                      <div className="text-[#566266] dark:text-[#9cb0b7] mt-0.5">{r.note}</div>
                    </div>
                    <button
                      onClick={() => handleToggleReminder(r.companyId, r.id)}
                      className="w-6 h-6 rounded-md border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#223136] grid place-items-center text-[#202d32] dark:text-[#f5f7f7] hover:bg-[#236a50] hover:text-white hover:border-[#236a50] transition-colors cursor-pointer"
                      title="Concluir"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#d8dddc] dark:border-[#2a3a41]">
            <button
              onClick={() => setActiveTab('semana')}
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1c272c] hover:bg-[#f6f7f4] dark:hover:bg-[#223136] border border-[#d8dddc] dark:border-[#2a3a41] text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7] hover:border-[#ff6a36] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Consultar rotina completa</span>
              <ArrowRight size={13} className="text-[#ff6a36]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
