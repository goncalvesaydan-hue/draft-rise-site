'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Video, 
  Megaphone, 
  Flag, 
  Camera, 
  CheckCircle2, 
  Circle, 
  Building2, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Layers, 
  CalendarDays, 
  ListFilter,
  Check,
  CalendarCheck
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { CalendarEvent, CalendarEventType, CalendarEventPriority } from './types';

// ========================================================
// CONFIGURAÇÕES VISUAIS POR TIPO DE EVENTO (SEM EMOJIS)
// ========================================================
export const EVENT_TYPE_CONFIG: Record<
  CalendarEventType, 
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge: string; dot: string; border: string }
> = {
  reuniao: { 
    label: 'Reunião / Call', 
    icon: Video, 
    badge: 'bg-[#236a50]/10 text-[#236a50] border-[#236a50]/25',
    dot: 'bg-[#236a50]',
    border: 'border-l-[#236a50]'
  },
  campanha: { 
    label: 'Campanha Sazonal', 
    icon: Megaphone, 
    badge: 'bg-[#ff6a36]/10 text-[#ff6a36] border-[#ff6a36]/25',
    dot: 'bg-[#ff6a36]',
    border: 'border-l-[#ff6a36]'
  },
  entrega: { 
    label: 'Entrega / Relatório', 
    icon: Flag, 
    badge: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/25',
    dot: 'bg-[#7c3aed]',
    border: 'border-l-[#7c3aed]'
  },
  producao: { 
    label: 'Produção / Captação', 
    icon: Camera, 
    badge: 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/25',
    dot: 'bg-[#0284c7]',
    border: 'border-l-[#0284c7]'
  },
  followup: { 
    label: 'Follow-up', 
    icon: Clock, 
    badge: 'bg-[#b45309]/10 text-[#b45309] border-[#b45309]/25',
    dot: 'bg-[#b45309]',
    border: 'border-l-[#b45309]'
  },
  geral: { 
    label: 'Geral / Agência', 
    icon: Layers, 
    badge: 'bg-[#202d32]/10 text-[#202d32] border-[#202d32]/20',
    dot: 'bg-[#202d32]',
    border: 'border-l-[#202d32]'
  }
};

export const PRIORITY_CONFIG: Record<CalendarEventPriority, { label: string; text: string; bg: string }> = {
  alta: { label: 'Alta', text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  media: { label: 'Média', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  baixa: { label: 'Baixa', text: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const CalendarView: React.FC = () => {
  const { 
    db, 
    createCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent, 
    toggleCalendarEventCompleted,
    setSelectedCompanyId
  } = useDashboard();

  // Estados de navegação do calendário
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => today.getMonth()); // 0-11
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterCompanyId, setFilterCompanyId] = useState<string>('todos');
  const [includeReminders, setIncludeReminders] = useState<boolean>(true);

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  // Campos do formulário
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(() => today.toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('reuniao');
  const [formPriority, setFormPriority] = useState<CalendarEventPriority>('media');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formCompleted, setFormCompleted] = useState(false);

  // Mapa de empresas ativas para lookup rápido
  const companiesMap = useMemo(() => {
    const map = new Map<string, string>();
    db.companies.forEach(c => {
      map.set(c.id, c.name);
    });
    return map;
  }, [db.companies]);

  // Lista normalizada de todos os eventos (eventos manuais + lembretes automáticos de empresas)
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [...(db.events || [])];

    // Se a opção de incluir lembretes de clientes estiver ativa:
    if (includeReminders) {
      db.companies.forEach(company => {
        if (company.deletedAt) return;
        (company.reminders || []).forEach(r => {
          if (!r.due) return;
          const dueDayStr = r.due.slice(0, 10);
          events.push({
            id: `reminder-${company.id}-${r.id}`,
            title: r.note || `Lembrete: ${company.name}`,
            description: `Lembrete agendado na ficha de ${company.name}`,
            date: dueDayStr,
            companyId: company.id,
            type: 'followup',
            priority: 'alta',
            completed: Boolean(r.done),
            author: 'Sistema',
            createdAt: dueDayStr,
            updatedAt: dueDayStr
          });
        });
      });
    }

    return events;
  }, [db.events, db.companies, includeReminders]);

  // Eventos filtrados pela pesquisa e seletores
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      if (filterType !== 'todos' && ev.type !== filterType) return false;
      if (filterCompanyId !== 'todos' && ev.companyId !== filterCompanyId) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const compName = ev.companyId ? (companiesMap.get(ev.companyId) || '').toLowerCase() : '';
        const matchTitle = ev.title.toLowerCase().includes(query);
        const matchDesc = (ev.description || '').toLowerCase().includes(query);
        const matchComp = compName.includes(query);
        if (!matchTitle && !matchDesc && !matchComp) return false;
      }

      return true;
    });
  }, [allEvents, filterType, filterCompanyId, searchQuery, companiesMap]);

  // Navegação de Mês
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Cálculo da Grelha Mensal (7 colunas Seg-Dom)
  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    
    // Dia da semana do 1º dia (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    // Convertemos para Seg = 0, Ter = 1, ..., Dom = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Dias do mês anterior para preenchimento
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().slice(0, 10)
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().slice(0, 10)
      });
    }

    // Dias do mês seguinte para completar linhas de 7 (mínimo 35 ou 42 células)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(n).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().slice(0, 10)
      });
    }

    return days;
  }, [currentYear, currentMonth, today]);

  // Mapa de eventos agrupados por data (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach(ev => {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    });
    return map;
  }, [filteredEvents]);

  // Indicadores de Topo
  const todayIso = today.toISOString().slice(0, 10);
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const totalUpcoming = allEvents.filter(e => !e.completed && e.date >= todayIso).length;
  const thisMonthCount = allEvents.filter(e => e.date.startsWith(currentMonthPrefix)).length;
  const meetingsAndShootsCount = allEvents.filter(e => e.date >= todayIso && (e.type === 'reuniao' || e.type === 'producao')).length;
  const campaignsAndDeliveries = allEvents.filter(e => e.date >= todayIso && (e.type === 'campanha' || e.type === 'entrega')).length;

  // Abrir Modal para Criação
  const handleOpenNew = (datePreset?: string) => {
    setEditingEventId(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(datePreset || today.toISOString().slice(0, 10));
    setFormTime('');
    setFormEndDate('');
    setFormType('reuniao');
    setFormPriority('media');
    setFormCompanyId('');
    setFormCompleted(false);
    setIsFormOpen(true);
  };

  // Abrir Modal para Edição
  const handleOpenEdit = (ev: CalendarEvent) => {
    // Se for lembrete do sistema de empresa, abre ficha da empresa
    if (ev.id.startsWith('reminder-') && ev.companyId) {
      setSelectedCompanyId(ev.companyId);
      return;
    }
    setEditingEventId(ev.id);
    setFormTitle(ev.title);
    setFormDescription(ev.description || '');
    setFormDate(ev.date);
    setFormTime(ev.time || '');
    setFormEndDate(ev.endDate || '');
    setFormType(ev.type);
    setFormPriority(ev.priority || 'media');
    setFormCompanyId(ev.companyId || '');
    setFormCompleted(Boolean(ev.completed));
    setIsFormOpen(true);
  };

  // Submeter Formulário
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (editingEventId) {
      updateCalendarEvent(editingEventId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        date: formDate,
        time: formTime || undefined,
        endDate: formEndDate || undefined,
        type: formType,
        priority: formPriority,
        companyId: formCompanyId || undefined,
        completed: formCompleted
      });
    } else {
      createCalendarEvent({
        title: formTitle.trim(),
        description: formDescription.trim(),
        date: formDate,
        time: formTime || undefined,
        endDate: formEndDate || undefined,
        type: formType,
        priority: formPriority,
        companyId: formCompanyId || undefined,
        completed: formCompleted
      });
    }

    setIsFormOpen(false);
  };

  // Toggle de conclusão (suporta eventos normais)
  const handleToggleEvent = (ev: CalendarEvent) => {
    if (ev.id.startsWith('reminder-')) {
      if (ev.companyId) setSelectedCompanyId(ev.companyId);
      return;
    }
    toggleCalendarEventCompleted(ev.id);
  };

  // Eliminar evento
  const handleDeleteEvent = (id: string) => {
    if (id.startsWith('reminder-')) return;
    if (confirm('Tens a certeza que desejas remover este evento do calendário?')) {
      deleteCalendarEvent(id);
      if (selectedDayDate) {
        // atualiza vista de detalhe
      }
    }
  };

  // Eventos do dia selecionado no Drawer
  const selectedDayEvents = useMemo(() => {
    if (!selectedDayDate) return [];
    return eventsByDate.get(selectedDayDate) || [];
  }, [selectedDayDate, eventsByDate]);

  // Agrupamento para Linha Temporal (Lista por Mês)
  const timelineGrouped = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => {
      const comp = a.date.localeCompare(b.date);
      if (comp !== 0) return comp;
      return (a.time || '').localeCompare(b.time || '');
    });

    const groups: Record<string, CalendarEvent[]> = {};
    sorted.forEach(ev => {
      const [y, m] = ev.date.split('-');
      const mIdx = parseInt(m, 10) - 1;
      const groupKey = `${MONTH_NAMES[mIdx]} de ${y}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(ev);
    });

    return groups;
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. CABEÇALHO DA AGENDA & CALENDÁRIO
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d8dddc]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff6a36]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b5431c]">
              Planeamento Estratégico &amp; Agendamentos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202d32] mt-1">
            Agenda &amp; Calendário Geral
          </h1>
          <p className="text-xs text-[#566266] mt-1">
            Marcação de reuniões, produções de conteúdo, campanhas sazonais e entregas a semanas ou meses de antecedência.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Seletor de Modo de Visualização */}
          <div className="flex items-center justify-between sm:justify-start bg-[#f6f7f4] border border-[#d8dddc] rounded-full p-1 shadow-2xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={viewMode === 'grid' ? { color: '#ffffff' } : undefined}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#202d32] !text-white shadow-xs'
                  : 'text-[#566266] hover:text-[#202d32]'
              }`}
            >
              <CalendarDays size={14} />
              <span>Grelha Mensal</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? { color: '#ffffff' } : undefined}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#202d32] !text-white shadow-xs'
                  : 'text-[#566266] hover:text-[#202d32]'
              }`}
            >
              <ListFilter size={14} />
              <span>Linha Temporal</span>
            </button>
          </div>

          {/* Botão Novo Evento */}
          <button
            type="button"
            onClick={() => handleOpenNew()}
            style={{ color: '#ffffff' }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white text-xs font-semibold transition-all shadow-xs shadow-[#ff6a36]/25 cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Plus size={15} className="shrink-0" />
            <span>Marcar Evento</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. INDICADORES (SECTOR CARDS ESTILO DRAFT & RISE)
      ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
              Total Agendado
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ffcaa8]/40 text-[#c74418] grid place-items-center">
              <CalendarCheck size={14} className="sm:hidden" />
              <CalendarCheck size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#202d32]">
              {totalUpcoming}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Eventos futuros
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
              Mês Selecionado
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] grid place-items-center">
              <CalendarIcon size={14} className="sm:hidden" />
              <CalendarIcon size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0284c7]">
              {thisMonthCount}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#236a50]">
              Reuniões &amp; Produção
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#dcfce7] text-[#236a50] grid place-items-center">
              <Video size={14} className="sm:hidden" />
              <Video size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#236a50]">
              {meetingsAndShootsCount}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Calls e gravações
          </div>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
              Campanhas &amp; Prazos
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ede9fe] text-[#7c3aed] grid place-items-center">
              <Flag size={14} className="sm:hidden" />
              <Flag size={16} className="hidden sm:block" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#7c3aed]">
              {campaignsAndDeliveries}
            </div>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-[#d8dddc] text-[10px] sm:text-xs text-[#566266] truncate">
            Lançamentos e metas
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BARRA DE NAVEGAÇÃO TEMPORAL (MÊS / ANO / HOJE)
      ======================================================== */}
      <div className="p-3 sm:p-4 rounded-xl border border-[#d8dddc] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Controlo de Mês com Setas e Dropdowns Rápidos */}
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="p-1.5 sm:p-2 rounded-lg border border-[#d8dddc] bg-[#f6f7f4] hover:bg-[#e8ecea] text-[#202d32] transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Seletores de Mês e Ano */}
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              className="py-1.5 px-2 sm:px-3 w-[114px] sm:w-auto rounded-lg border border-[#d8dddc] bg-[#f6f7f4] text-xs font-semibold text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              className="py-1.5 px-1.5 sm:px-2.5 w-[66px] sm:w-auto rounded-lg border border-[#d8dddc] bg-[#f6f7f4] text-xs font-semibold text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer font-mono"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-1.5 sm:p-2 rounded-lg border border-[#d8dddc] bg-[#f6f7f4] hover:bg-[#e8ecea] text-[#202d32] transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Botão Hoje */}
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#d8dddc] bg-white hover:bg-[#f6f7f4] text-xs font-medium text-[#566266] transition-colors cursor-pointer shrink-0"
          >
            Hoje
          </button>
        </div>

        {/* Alternador de Lembretes de Clientes */}
        <div className="flex items-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f2ef]">
          <label className="flex items-center gap-2 text-xs font-medium text-[#566266] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeReminders}
              onChange={(e) => setIncludeReminders(e.target.checked)}
              className="w-4 h-4 rounded border-[#d8dddc] text-[#ff6a36] focus:ring-[#ff6a36] accent-[#ff6a36] cursor-pointer"
            />
            <span>Incluir Lembretes de Empresas</span>
          </label>
        </div>
      </div>

      {/* ========================================================
          4. BARRA DE FILTROS & PESQUISA
      ======================================================== */}
      <div className="p-3 sm:p-4 rounded-xl border border-[#d8dddc] bg-white space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Campo de Pesquisa */}
          <div className="relative flex-1">
            <Search size={14} className="text-[#8c999e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar evento por título, descrição ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full !pl-9 pr-8 py-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] placeholder:text-[#8c999e] focus:outline-none focus:border-[#ff6a36]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c999e] hover:text-[#202d32] p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Empresa */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <Building2 size={14} className="text-[#8c999e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterCompanyId}
              onChange={(e) => setFilterCompanyId(e.target.value)}
              className="w-full !pl-8 pr-8 py-2 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer truncate"
            >
              <option value="todos">Todas as Empresas</option>
              {db.companies
                .filter(c => !c.deletedAt)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Pílulas de Tipo de Evento (Segmented Control com scroll horizontal suave no mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[#f0f2ef]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c999e] mr-1 shrink-0">
            Tipo:
          </span>

          <button
            type="button"
            onClick={() => setFilterType('todos')}
            style={filterType === 'todos' ? { color: '#ffffff' } : undefined}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'todos'
                ? 'bg-[#202d32] !text-white'
                : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#e8ecea]'
            }`}
          >
            Todos ({allEvents.length})
          </button>

          {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map(typeKey => {
            const cfg = EVENT_TYPE_CONFIG[typeKey];
            const isSelected = filterType === typeKey;
            const count = allEvents.filter(e => e.type === typeKey).length;
            const Icon = cfg.icon;

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setFilterType(typeKey)}
                style={isSelected ? { color: '#ffffff' } : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#202d32] !text-white'
                    : 'bg-[#f6f7f4] text-[#566266] hover:bg-[#e8ecea]'
                }`}
              >
                <Icon size={12} className={isSelected ? 'text-white' : ''} />
                <span>{cfg.label}</span>
                <span className={`text-[10px] opacity-75 font-mono ${isSelected ? 'text-white' : ''}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          5. VISTA EM GRELHA MENSAL (CALENDAR GRID)
      ======================================================== */}
      {viewMode === 'grid' && (
        <div className="bg-white border border-[#d8dddc] rounded-2xl overflow-hidden shadow-2xs">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 border-b border-[#d8dddc] bg-[#f6f7f4]">
            {WEEK_DAYS.map((dayName, idx) => (
              <div 
                key={dayName}
                className={`py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  idx >= 5 ? 'text-[#8c999e]' : 'text-[#202d32]'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Grelha de Células dos Dias */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#e8ecea] bg-[#e8ecea]">
            {calendarGridDays.map((day) => {
              const dayEvents = eventsByDate.get(day.dateStr) || [];
              const maxDisplay = 3;
              const hasMore = dayEvents.length > maxDisplay;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDayDate(day.dateStr)}
                  className={`min-h-[58px] sm:min-h-[130px] p-1 sm:p-2 bg-white flex flex-col justify-between transition-colors group cursor-pointer hover:bg-[#fafbfa] ${
                    !day.isCurrentMonth ? 'opacity-40 bg-[#fbfcfb]' : ''
                  }`}
                >
                  {/* Topo da Célula: Número do Dia + Botão Rápido Add */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span
                      className={`text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full font-mono transition-transform group-hover:scale-105 ${
                        day.isToday
                          ? 'bg-[#ff6a36] text-white font-bold shadow-xs'
                          : day.isCurrentMonth
                          ? 'text-[#202d32]'
                          : 'text-[#8c999e]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNew(day.dateStr);
                      }}
                      title="Adicionar evento neste dia"
                      className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 text-[#8c999e] hover:text-[#ff6a36] hover:bg-[#ff6a36]/10 rounded-md transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Indicadores Visuais em Ecrãs Pequenos (Mobile: Pontos de Cor) */}
                  <div className="flex sm:hidden items-center justify-center gap-1 mt-1 flex-wrap">
                    {dayEvents.slice(0, 3).map(ev => {
                      const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.geral;
                      return (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${ev.completed ? 'bg-slate-300' : cfg.dot}`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#202d32]" />
                    )}
                  </div>

                  {/* Lista de Pílulas de Eventos no Dia (Desktop / Ecrãs Médios) */}
                  <div className="hidden sm:block flex-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, maxDisplay).map(ev => {
                      const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.geral;
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(ev);
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium border border-transparent truncate flex items-center gap-1.5 transition-all ${
                            ev.completed
                              ? 'bg-[#f1f5f9] text-[#64748b] line-through opacity-70'
                              : `${cfg.badge} hover:brightness-95`
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.completed ? 'bg-slate-400' : cfg.dot}`} />
                          {ev.time && (
                            <span className="font-mono text-[10px] font-semibold shrink-0">
                              {ev.time}
                            </span>
                          )}
                          <span className="truncate flex-1">
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}

                    {hasMore && (
                      <div className="text-[10px] font-semibold text-[#8c999e] hover:text-[#202d32] px-1 pt-0.5">
                        +{dayEvents.length - maxDisplay} mais...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          6. VISTA EM LINHA TEMPORAL / LISTA AGRUPADA POR MÊS
      ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {Object.keys(timelineGrouped).length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#d8dddc] bg-white">
              <div className="w-12 h-12 rounded-full bg-[#f6f7f4] text-[#8c999e] mx-auto flex items-center justify-center mb-3">
                <CalendarIcon size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#202d32]">Nenhum evento encontrado</h3>
              <p className="text-xs text-[#566266] mt-1 max-w-sm mx-auto">
                Não existem eventos marcados que correspondam aos filtros selecionados.
              </p>
              <button
                type="button"
                onClick={() => handleOpenNew()}
                style={{ color: '#ffffff' }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff6a36] !text-white text-xs font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Marcar Primeiro Evento</span>
              </button>
            </div>
          ) : (
            Object.entries(timelineGrouped).map(([monthGroup, events]) => (
              <div key={monthGroup} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#202d32]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#202d32]">
                    {monthGroup}
                  </h3>
                  <span className="text-xs font-mono text-[#8c999e]">
                    ({events.length} {events.length === 1 ? 'evento' : 'eventos'})
                  </span>
                </div>

                <div className="bg-white border border-[#d8dddc] rounded-2xl divide-y divide-[#e8ecea] overflow-hidden shadow-2xs">
                  {events.map((ev) => {
                    const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.geral;
                    const prioCfg = PRIORITY_CONFIG[ev.priority] || PRIORITY_CONFIG.media;
                    const [y, m, d] = ev.date.split('-');
                    const isOverdue = !ev.completed && ev.date < todayIso;

                    return (
                      <div
                        key={ev.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafbfa] transition-colors ${
                          ev.completed ? 'opacity-60 bg-[#fbfcfb]' : ''
                        }`}
                      >
                        {/* Bloco Esquerda: Checkbox + Data + Detalhes */}
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox de Conclusão */}
                          <button
                            type="button"
                            onClick={() => handleToggleEvent(ev)}
                            title={ev.completed ? 'Reabrir evento' : 'Marcar como concluído'}
                            className={`mt-0.5 sm:mt-0 p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                              ev.completed
                                ? 'text-[#236a50]'
                                : 'text-[#8c999e] hover:text-[#202d32]'
                            }`}
                          >
                            {ev.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>

                          {/* Data Box */}
                          <div className="w-12 h-12 rounded-xl bg-[#f6f7f4] border border-[#d8dddc] flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs font-bold font-mono text-[#202d32]">
                              {d}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8c999e]">
                              {MONTH_NAMES[parseInt(m, 10) - 1].slice(0, 3)}
                            </span>
                          </div>

                          {/* Informação do Evento */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`text-xs font-bold text-[#202d32] ${ev.completed ? 'line-through text-[#8c999e]' : ''}`}>
                                {ev.title}
                              </h4>

                              {ev.time && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#566266] bg-[#f6f7f4] px-2 py-0.5 rounded-md border border-[#d8dddc]">
                                  <Clock size={10} />
                                  {ev.time}
                                </span>
                              )}

                              {isOverdue && (
                                <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                  Atrasado
                                </span>
                              )}
                            </div>

                            {ev.description && (
                              <p className="text-xs text-[#566266] mt-0.5 line-clamp-2">
                                {ev.description}
                              </p>
                            )}

                            {/* Tags de Empresa e Categoria */}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>

                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${prioCfg.bg} ${prioCfg.text}`}>
                                Prioridade {prioCfg.label}
                              </span>

                              {ev.companyId && companiesMap.has(ev.companyId) && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCompanyId(ev.companyId!)}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0284c7] hover:underline cursor-pointer"
                                >
                                  <Building2 size={11} />
                                  <span>{companiesMap.get(ev.companyId)}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bloco Direita: Ações */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 rounded-lg text-[#8c999e] hover:text-[#202d32] hover:bg-[#f6f7f4] transition-colors cursor-pointer"
                            title="Editar evento"
                          >
                            <Edit3 size={15} />
                          </button>

                          {!ev.id.startsWith('reminder-') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1.5 rounded-lg text-[#8c999e] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remover evento"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          7. MODAL / DRAWER DE DETALHES DO DIA SELECIONADO
      ======================================================== */}
      {selectedDayDate && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDayDate(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-xl border border-[#d8dddc] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Dia */}
            <div className="flex items-center justify-between pb-3 border-b border-[#d8dddc]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  Eventos do Dia
                </span>
                <h3 className="text-lg font-bold text-[#202d32]">
                  {selectedDayDate.split('-').reverse().join('/')}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayDate(null)}
                className="p-1.5 text-[#8c999e] hover:text-[#202d32] rounded-lg hover:bg-[#f6f7f4]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de Eventos no Dia */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8c999e]">
                  Nenhum evento agendado para este dia.
                </div>
              ) : (
                selectedDayEvents.map(ev => {
                  const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.geral;
                  return (
                    <div 
                      key={ev.id}
                      className="p-3 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleEvent(ev)}
                          className="text-[#8c999e] hover:text-[#236a50] cursor-pointer"
                        >
                          {ev.completed ? <CheckCircle2 size={16} className="text-[#236a50]" /> : <Circle size={16} />}
                        </button>
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold text-[#202d32] truncate ${ev.completed ? 'line-through text-[#8c999e]' : ''}`}>
                            {ev.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#566266]">
                            {ev.time && <span className="font-mono">{ev.time}</span>}
                            <span className={cfg.badge}>{cfg.label}</span>
                            {ev.companyId && companiesMap.has(ev.companyId) && (
                              <span>• {companiesMap.get(ev.companyId)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayDate(null);
                            handleOpenEdit(ev);
                          }}
                          className="p-1 text-[#8c999e] hover:text-[#202d32]"
                        >
                          <Edit3 size={14} />
                        </button>
                        {!ev.id.startsWith('reminder-') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1 text-[#8c999e] hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Botão de Adicionar neste Dia */}
            <div className="pt-2 border-t border-[#d8dddc] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetDate = selectedDayDate;
                  setSelectedDayDate(null);
                  handleOpenNew(targetDate);
                }}
                style={{ color: '#ffffff' }}
                className="px-4 py-2 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] !text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Adicionar Evento neste Dia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. MODAL DE CRIAÇÃO / EDIÇÃO DE EVENTO
      ======================================================== */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-xl border border-[#d8dddc] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d8dddc]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
                  {editingEventId ? 'Modificar Agendamento' : 'Novo Agendamento Estratégico'}
                </span>
                <h3 className="text-lg font-bold text-[#202d32]">
                  {editingEventId ? 'Editar Evento' : 'Marcar Evento no Calendário'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-[#8c999e] hover:text-[#202d32] rounded-lg hover:bg-[#f6f7f4] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião Trimestral de Alinhamento / Lançamento Campanha de Verão"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] font-mono cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Hora (Opcional)
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] font-mono cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Data Final (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Tipo de Evento e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CalendarEventType)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                  >
                    <option value="reuniao">Reunião / Call</option>
                    <option value="campanha">Campanha Sazonal</option>
                    <option value="entrega">Entrega / Relatório</option>
                    <option value="producao">Produção / Captação de Conteúdo</option>
                    <option value="followup">Follow-up a Médio/Longo Prazo</option>
                    <option value="geral">Geral / Agência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202d32] mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as CalendarEventPriority)}
                    className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Associação a Empresa */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1">
                  Associar a Cliente / Empresa (Opcional)
                </label>
                <select
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
                >
                  <option value="">Nenhuma empresa associada (Interno / Agência)</option>
                  {db.companies
                    .filter(c => !c.deletedAt)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.area === 'client' ? 'Cliente' : 'Prospecto'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Descrição / Notas */}
              <div>
                <label className="block text-xs font-semibold text-[#202d32] mb-1">
                  Notas &amp; Instruções
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes da reunião, temas a abordar, objetivos da campanha ou itens a preparar..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-xl text-xs text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
                />
              </div>

              {/* Concluído */}
              {editingEventId && (
                <label className="flex items-center gap-2 text-xs font-medium text-[#202d32] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formCompleted}
                    onChange={(e) => setFormCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-[#d8dddc] text-[#236a50] accent-[#236a50] cursor-pointer"
                  />
                  <span>Marcar este evento como concluído</span>
                </label>
              )}

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d8dddc]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#566266] hover:bg-[#f6f7f4] border border-[#d8dddc] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formTitle.trim() || !formDate}
                  style={{ color: '#ffffff' }}
                  className="px-6 py-2.5 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] !text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingEventId ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
