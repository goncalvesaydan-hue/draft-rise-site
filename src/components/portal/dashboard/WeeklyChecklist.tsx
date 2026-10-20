'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  Sparkles, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileText, 
  RotateCcw, 
  Layers, 
  Columns, 
  ListTodo,
  ExternalLink,
  MessageSquare,
  BadgeEuro
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { WEEKDAYS } from './constants';
import { getIsoWeekKey } from './utils';
import { WeekTask } from './types';

export const WeeklyChecklist: React.FC = () => {
  const { 
    db, 
    toggleWeekTask, 
    addWeekTask, 
    deleteWeekTask, 
    loadDefaultWeekRoutine,
    clearCompletedWeekTasks,
    setSelectedCompanyId,
    showToast 
  } = useDashboard();

  // Calcular o dia de hoje real (1 = Segunda, ..., 7 = Domingo)
  const realTodayId = useMemo(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  }, []);

  const currentRealWeekKey = getIsoWeekKey();
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(currentRealWeekKey);
  const [selectedDay, setSelectedDay] = useState<number>(realTodayId);
  const [viewMode, setViewMode] = useState<'daily' | 'board'>('daily');

  // Estados do Formulário de Adição
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCompanyId, setNewTaskCompanyId] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<WeekTask['category']>('seo');

  // Filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

  // Dados da semana selecionada
  const weekData = db.weeks[selectedWeekKey] || {};

  // Manipulação de Semanas (Navegação Anterior / Seguinte)
  const handleShiftWeek = (delta: number) => {
    const parts = selectedWeekKey.split('-W');
    if (parts.length === 2) {
      let year = parseInt(parts[0], 10);
      let week = parseInt(parts[1], 10) + delta;
      if (week < 1) {
        year -= 1;
        week = 52;
      } else if (week > 52) {
        year += 1;
        week = 1;
      }
      const newKey = `${year}-W${week < 10 ? '0' + week : week}`;
      setSelectedWeekKey(newKey);
    }
  };

  const handleJumpToToday = () => {
    setSelectedWeekKey(currentRealWeekKey);
    setSelectedDay(realTodayId);
    showToast('Navegado para a semana e dia de hoje!', 'info');
  };

  // Submissão do Formulário de Tarefa
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    addWeekTask(
      selectedDay, 
      newTaskText.trim(), 
      newTaskCompanyId || undefined, 
      newTaskCategory, 
      selectedWeekKey
    );

    setNewTaskText('');
    setNewTaskCompanyId('');
  };

  const handleAddPresetTask = (taskTitle: string, category: WeekTask['category'] = 'seo') => {
    addWeekTask(selectedDay, taskTitle, undefined, category, selectedWeekKey);
  };

  // Estatísticas da Semana
  const allWeekTasks = useMemo(() => {
    return WEEKDAYS.flatMap(d => weekData[d.id] || []);
  }, [weekData]);

  const totalTasks = allWeekTasks.length;
  const completedTasks = allWeekTasks.filter(t => t.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const weekPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Clientes com tarefas nesta semana
  const targetedCompaniesCount = useMemo(() => {
    const companyIds = new Set(allWeekTasks.map(t => t.companyId).filter(Boolean));
    return companyIds.size;
  }, [allWeekTasks]);

  const currentDayConfig = WEEKDAYS.find(d => d.id === selectedDay) || WEEKDAYS[0];
  const currentDayRawTasks = weekData[selectedDay] || [];
  const currentDayDone = currentDayRawTasks.filter(t => t.done).length;

  const currentDayTasks = useMemo(() => {
    if (statusFilter === 'all') return currentDayRawTasks;
    if (statusFilter === 'pending') return currentDayRawTasks.filter(t => !t.done);
    return currentDayRawTasks.filter(t => t.done);
  }, [currentDayRawTasks, statusFilter]);

  const AGENCY_PRESETS: Array<{ label: string; cat: WeekTask['category'] }> = [
    { label: 'Publicação semanal Google Meu Negócio', cat: 'content' },
    { label: 'Revisão de posições no Google Maps', cat: 'seo' },
    { label: 'Resposta a novas avaliações', cat: 'reputation' },
    { label: 'Contacto com leads em proposta', cat: 'finance' },
    { label: 'Verificação de avenças a vencer', cat: 'finance' }
  ];

  const CATEGORY_CONFIG: Record<NonNullable<WeekTask['category']>, { label: string; color: string; bg: string }> = {
    seo: { label: 'SEO & Maps', color: '#236a50', bg: 'bg-[#236a50]/10 dark:bg-[#236a50]/20 text-[#236a50] dark:text-[#34b785] border-[#236a50]/20 dark:border-[#236a50]/40' },
    content: { label: 'Conteúdo', color: '#ff6a36', bg: 'bg-[#ff6a36]/10 dark:bg-[#ff6a36]/20 text-[#ff6a36] dark:text-[#ff8f66] border-[#ff6a36]/20 dark:border-[#ff6a36]/40' },
    reputation: { label: 'Reputação', color: '#2563eb', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50' },
    finance: { label: 'Financeiro', color: '#9333ea', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50' },
    general: { label: 'Geral', color: '#566266', bg: 'bg-[#f6f7f4] dark:bg-[#223136] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41]' }
  };

  const activeCompanies = db.companies.filter(c => !c.deletedAt);

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. HEADER EXECUTIVO & NAVEGAÇÃO TEMPORAL
      ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#d8dddc] dark:border-[#2a3a41]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c] dark:text-[#ff8f66]">
              Operação Semanal &amp; Entregas
            </span>
            {selectedWeekKey === currentRealWeekKey && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#236a50]/15 dark:bg-[#236a50]/30 text-[#236a50] dark:text-[#34b785] border border-[#236a50]/30 dark:border-[#236a50]/50 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#236a50] dark:bg-[#34b785]" />
                Semana Corrente
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] dark:text-[#f5f7f7] tracking-tight mt-0.5">
            Rotina &amp; Entregas<span className="text-[#c74418]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#566266] dark:text-[#9cb0b7] mt-1">
            Cockpit operacional da equipa Draft &amp; Rise para acompanhamento diário e semanal.
          </p>
        </div>

        {/* Controlos de Semana & Vistas */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Seletor de Semana */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#f6f7f4] dark:bg-[#192327] border border-[#d8dddc] dark:border-[#2a3a41] shadow-xs">
            <button
              onClick={() => handleShiftWeek(-1)}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#25353d] text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7] transition-colors cursor-pointer"
              title="Semana Anterior"
            >
              <ChevronLeft size={14} />
            </button>
            
            <span className="px-3 text-xs font-bold text-[#202d32] dark:text-[#f5f7f7] font-mono">
              {selectedWeekKey}
            </span>

            <button
              onClick={() => handleShiftWeek(1)}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-[#25353d] text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7] transition-colors cursor-pointer"
              title="Semana Seguinte"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Botão Ir para Hoje */}
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-full border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#1c272c] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-semibold text-[#202d32] dark:text-[#f5f7f7] transition-colors cursor-pointer shadow-xs"
          >
            Hoje
          </button>

          {/* Alternador de Modo de Vista (Diária vs Panorama) */}
          <div className="inline-flex p-1 rounded-full bg-[#f6f7f4] dark:bg-[#192327] border border-[#d8dddc] dark:border-[#2a3a41] shadow-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'daily' 
                  ? 'bg-[#ff6a36] !text-white shadow-xs' 
                  : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
              }`}
            >
              <ListTodo size={13} />
              <span>Foco Diário</span>
            </button>

            <button
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'board' 
                  ? 'bg-[#ff6a36] !text-white shadow-xs' 
                  : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
              }`}
            >
              <Columns size={13} />
              <span>Quadro Semanal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. 3 CARTÕES DE MÉTRICAS OPERACIONAIS
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Taxa de Conclusão */}
        <div className="p-3.5 sm:p-5 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#1c272c] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#566266] dark:text-[#9cb0b7]">
            <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px] text-[#b5431c] dark:text-[#ff8f66]">
              Taxa de Conclusão
            </span>
            <span className="font-mono text-xs font-bold text-[#202d32] dark:text-[#f5f7f7]">{weekPercentage}%</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
            {completedTasks} de {totalTasks} concluídas
          </div>
          <div className="h-2 w-full bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-full overflow-hidden">
            <div 
              style={{ width: `${weekPercentage}%` }} 
              className="h-full bg-[#236a50] dark:bg-[#34b785] rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Card 2: Pendências Operacionais */}
        <div className="p-3.5 sm:p-5 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#1c272c] space-y-2">
          <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px] text-[#566266] dark:text-[#9cb0b7]">
            Volume de Entregas
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
            {pendingTasks} pendentes
          </div>
          <p className="text-xs text-[#566266] dark:text-[#9cb0b7]">
            Distribuição ativa nos 7 dias operacionais da semana.
          </p>
        </div>

        {/* Card 3: Clientes com Entregas & Ação Rápida */}
        <div className="p-3.5 sm:p-5 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#1c272c] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px] text-[#236a50] dark:text-[#34b785]">
              Empresas Atendidas
            </span>
            <button
              onClick={() => loadDefaultWeekRoutine(selectedWeekKey)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff6a36] hover:underline cursor-pointer"
              title="Preenche a semana com o fluxo completo de agência"
            >
              <Sparkles size={12} />
              <span>Carregar Rotina Padrão</span>
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
            {targetedCompaniesCount} clientes com tarefas
          </div>
          <p className="text-xs text-[#566266] dark:text-[#9cb0b7]">
            Alinhamento contínuo com entregas e cadências Google.
          </p>
        </div>
      </div>

      {/* ========================================================
          3. VISTA 1: MODO FOCO DIÁRIO
      ======================================================== */}
      {viewMode === 'daily' && (
        <div className="space-y-6">
          {/* Seletor de Dias da Semana (Grid de 7 Cards com Destaque de 'Hoje') */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => {
              const tasks = weekData[d.id] || [];
              const done = tasks.filter(t => t.done).length;
              const isSelected = selectedDay === d.id;
              const isToday = d.id === realTodayId && selectedWeekKey === currentRealWeekKey;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#ff6a36] !text-white border-[#ff6a36] shadow-sm shadow-[#ff6a36]/25'
                      : isToday
                      ? 'bg-white dark:bg-[#1c272c] border-[#236a50] dark:border-[#34b785] text-[#202d32] dark:text-[#f5f7f7] shadow-xs'
                      : 'bg-[#f6f7f4] dark:bg-[#1c272c] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] text-[#202d32] dark:text-[#f5f7f7]'
                  }`}
                >
                  {isToday && (
                    <span className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isSelected ? 'bg-white text-[#ff6a36]' : 'bg-[#236a50] text-white'
                    }`}>
                      Hoje
                    </span>
                  )}

                  <div className="flex items-center justify-between text-xs font-semibold gap-1">
                    <span className="truncate">
                      <span className="sm:hidden">{d.label.replace('-feira', '')}</span>
                      <span className="hidden sm:inline">{d.label}</span>
                    </span>
                    <span className={`text-[11px] font-mono shrink-0 ${isSelected ? 'text-white' : 'text-[#8c999e] dark:text-[#70848c]'}`}>
                      {done}/{tasks.length}
                    </span>
                  </div>

                  <div className="text-xs mt-1.5 sm:mt-2 opacity-90 truncate">
                    {tasks.length === 0 ? 'Sem tarefas' : done === tasks.length ? 'Concluído' : `${tasks.length - done} pendentes`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Painel Central do Dia Selecionado */}
          <div className="p-6 rounded-2xl border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#1c272c] shadow-xs space-y-5">
            
            {/* Header do Dia */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d8dddc] dark:border-[#2a3a41]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c] dark:text-[#ff8f66]">
                  Entregas do Dia
                </span>
                <h2 className="text-lg font-bold text-[#202d32] dark:text-[#f5f7f7] tracking-tight">
                  {currentDayConfig.label} ({currentDayDone}/{currentDayRawTasks.length} concluídas)
                </h2>
              </div>

              {/* Filtros de Tarefas e Limpeza */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex p-1 rounded-full bg-[#f6f7f4] dark:bg-[#192327] border border-[#d8dddc] dark:border-[#2a3a41]">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-[#ff6a36] !text-white shadow-xs' : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
                    }`}
                  >
                    Todas ({currentDayRawTasks.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'pending' ? 'bg-[#ff6a36] !text-white shadow-xs' : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
                    }`}
                  >
                    Pendentes ({currentDayRawTasks.length - currentDayDone})
                  </button>
                  <button
                    onClick={() => setStatusFilter('done')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'done' ? 'bg-[#236a50] !text-white shadow-xs' : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#236a50] dark:hover:text-[#34b785]'
                    }`}
                  >
                    Feitas ({currentDayDone})
                  </button>
                </div>

                {currentDayDone > 0 && (
                  <button
                    onClick={() => clearCompletedWeekTasks(selectedWeekKey, selectedDay)}
                    className="p-1.5 rounded-full border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#192327] hover:border-[#c43f17] hover:text-[#c43f17] text-[#8c999e] dark:text-[#70848c] transition-colors cursor-pointer"
                    title="Limpar tarefas concluídas deste dia"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Ações Frequentes de Agência (Presets Rápidos) */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c999e] dark:text-[#70848c] block mb-2">
                Ações Frequentes de Agência:
              </span>
              <div className="flex flex-wrap gap-2">
                {AGENCY_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetTask(preset.label, preset.cat)}
                    className="px-3 py-1.5 rounded-full border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#192327] hover:bg-white dark:hover:bg-[#25353d] hover:border-[#ff6a36] hover:text-[#ff6a36] text-xs font-medium text-[#202d32] dark:text-[#f5f7f7] transition-colors cursor-pointer shadow-2xs"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulário de Nova Tarefa com Associação a Cliente e Categoria */}
            <form onSubmit={handleAddTask} className="p-4 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#fcfcfa] dark:bg-[#192327] space-y-3">
              <input
                type="text"
                placeholder={`Adicionar tarefa para ${currentDayConfig.label}...`}
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] rounded-xl text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Seletor de Cliente */}
                  <div className="relative inline-block">
                    <select
                      value={newTaskCompanyId}
                      onChange={(e) => setNewTaskCompanyId(e.target.value)}
                      className="p-2 text-xs bg-white dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                    >
                      <option value="">Sem cliente associado (Geral)</option>
                      {activeCompanies.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.status === 'cliente' ? 'Cliente' : 'Lead'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seletor de Categoria */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(Object.keys(CATEGORY_CONFIG) as Array<WeekTask['category']>).map((catKey) => {
                      if (!catKey) return null;
                      const conf = CATEGORY_CONFIG[catKey];
                      const isCatSelected = newTaskCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setNewTaskCategory(catKey)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                            isCatSelected 
                              ? 'bg-[#202d32] dark:bg-[#f5f7f7] !text-white dark:!text-[#141c20] border-[#202d32] dark:border-[#f5f7f7]' 
                              : 'bg-white dark:bg-[#1c272c] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#202d32] dark:hover:border-[#9cb0b7]'
                          }`}
                        >
                          {conf.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-[#ff6a36]/20 transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
                >
                  Adicionar
                </button>
              </div>
            </form>

            {/* Lista de Tarefas do Dia */}
            <div className="space-y-2 pt-1">
              {currentDayTasks.map((t) => {
                const associatedCompany = t.companyId ? db.companies.find(c => c.id === t.companyId) : null;
                const catInfo = t.category ? CATEGORY_CONFIG[t.category] : CATEGORY_CONFIG.general;

                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      t.done 
                        ? 'bg-[#f6f7f4] dark:bg-[#192327]/60 border-[#d8dddc] dark:border-[#2a3a41] opacity-75' 
                        : 'bg-white dark:bg-[#192327] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 select-none">
                      {/* Checkbox customizada */}
                      <div
                        role="checkbox"
                        aria-checked={t.done}
                        onClick={() => toggleWeekTask(selectedDay, t.id, selectedWeekKey)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          t.done
                            ? 'bg-[#ff6a36] border-[#ff6a36] text-white shadow-xs'
                            : 'bg-white dark:bg-[#1c272c] border-[#c8cfd0] dark:border-[#384e59] hover:border-[#ff6a36]'
                        }`}
                      >
                        {t.done && <Check size={12} className="stroke-[3]" />}
                      </div>

                      {/* Texto da Tarefa */}
                      <span className={`text-xs sm:text-sm ${
                        t.done ? 'line-through text-[#8c999e] dark:text-[#70848c]' : 'text-[#202d32] dark:text-[#f5f7f7] font-semibold'
                      }`}>
                        {t.text}
                      </span>

                      {/* Badge da Empresa Associada */}
                      {associatedCompany && (
                        <button
                          type="button"
                          onClick={() => setSelectedCompanyId(associatedCompany.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white dark:bg-[#1c272c] hover:bg-[#f6f7f4] dark:hover:bg-[#25353d] border border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] text-[#202d32] dark:text-[#f5f7f7] hover:text-[#ff6a36] transition-colors cursor-pointer shadow-2xs shrink-0"
                          title="Abrir ficha da empresa"
                        >
                          <Building2 size={11} className="text-[#ff6a36]" />
                          <span>{associatedCompany.name}</span>
                          <ExternalLink size={10} className="text-[#8c999e] dark:text-[#70848c]" />
                        </button>
                      )}

                      {/* Badge de Categoria */}
                      {catInfo && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catInfo.bg} shrink-0`}>
                          {catInfo.label}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteWeekTask(selectedDay, t.id, selectedWeekKey)}
                      className="text-[#8c999e] dark:text-[#70848c] hover:text-[#c43f17] p-1.5 transition-colors cursor-pointer shrink-0 ml-2"
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

              {currentDayTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#8c999e] dark:text-[#70848c] border border-dashed border-[#d8dddc] dark:border-[#2a3a41] rounded-xl bg-[#f6f7f4] dark:bg-[#192327]/40">
                  Nenhuma tarefa registada para {currentDayConfig.label} com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. VISTA 2: PANORAMA SEMANAL (QUADRO KANBAN 7 COLUNAS)
      ======================================================== */}
      {viewMode === 'board' && (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-4 -mx-1 px-1">
            <div className="flex gap-3 min-w-[1240px]">
              {WEEKDAYS.map((d) => {
                const dayTasks = weekData[d.id] || [];
                const dayDone = dayTasks.filter(t => t.done).length;
                const isToday = d.id === realTodayId && selectedWeekKey === currentRealWeekKey;

                return (
                  <div 
                    key={d.id} 
                    className={`flex-1 min-w-[170px] p-3.5 rounded-2xl border flex flex-col bg-white dark:bg-[#1c272c] shadow-xs ${
                      isToday ? 'border-[#236a50] dark:border-[#34b785] ring-1 ring-[#236a50] dark:ring-[#34b785]' : 'border-[#d8dddc] dark:border-[#2a3a41]'
                    }`}
                  >
                    {/* Cabeçalho da Coluna */}
                    <div className="pb-2.5 border-b border-[#d8dddc] dark:border-[#2a3a41] mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#202d32] dark:text-[#f5f7f7]">
                          {d.label}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-[#236a50] dark:bg-[#34b785] text-white">
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#8c999e] dark:text-[#70848c] mt-1">
                        <span>{dayDone}/{dayTasks.length} feitas</span>
                        <button
                          onClick={() => {
                            setSelectedDay(d.id);
                            setViewMode('daily');
                          }}
                          className="text-[10px] text-[#ff6a36] hover:underline font-semibold cursor-pointer"
                        >
                          + Gerir
                        </button>
                      </div>
                    </div>

                    {/* Cartões de Tarefa da Coluna */}
                    <div className="space-y-2 flex-1 min-h-[140px] max-h-[460px] overflow-y-auto pr-1">
                      {dayTasks.map(t => {
                        const associatedCompany = t.companyId ? db.companies.find(c => c.id === t.companyId) : null;
                        const catInfo = t.category ? CATEGORY_CONFIG[t.category] : CATEGORY_CONFIG.general;

                        return (
                          <div
                            key={t.id}
                            className={`group p-2.5 rounded-xl border text-xs transition-all ${
                              t.done ? 'bg-[#f6f7f4] dark:bg-[#192327]/60 border-[#d8dddc] dark:border-[#2a3a41] opacity-75' : 'bg-white dark:bg-[#192327] border-[#d8dddc] dark:border-[#2a3a41] shadow-2xs hover:border-[#ff6a36]'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                onClick={() => toggleWeekTask(d.id, t.id, selectedWeekKey)}
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                                  t.done ? 'bg-[#ff6a36] border-[#ff6a36] text-white' : 'bg-white dark:bg-[#1c272c] border-[#c8cfd0] dark:border-[#384e59] hover:border-[#ff6a36]'
                                }`}
                              >
                                {t.done && <Check size={10} className="stroke-[3]" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold leading-relaxed break-words ${t.done ? 'line-through text-[#8c999e] dark:text-[#70848c]' : 'text-[#202d32] dark:text-[#f5f7f7]'}`}>
                                  {t.text}
                                </p>

                                {associatedCompany && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCompanyId(associatedCompany.id)}
                                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff6a36] hover:underline truncate max-w-full"
                                  >
                                    <Building2 size={10} />
                                    <span className="truncate">{associatedCompany.name}</span>
                                  </button>
                                )}

                                {catInfo && (
                                  <div className="mt-1">
                                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold border ${catInfo.bg}`}>
                                      {catInfo.label}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => deleteWeekTask(d.id, t.id, selectedWeekKey)}
                                className="text-[#8c999e] dark:text-[#70848c] hover:text-[#c43f17] p-0.5 transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                                title="Remover"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {dayTasks.length === 0 && (
                        <div className="py-8 text-center text-[11px] text-[#8c999e] dark:text-[#70848c] border border-dashed border-[#d8dddc] dark:border-[#2a3a41] rounded-xl bg-[#f6f7f4]/60 dark:bg-[#192327]/30">
                          Livre
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
