'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AppDatabase, 
  Company, 
  CompanyStatus, 
  PaymentStatus, 
  Note, 
  NavigationTab, 
  WeekTask,
  ChecklistItem,
  PostEntry,
  KeywordRank,
  QAEntry,
  BeforeAfter,
  Idea,
  IdeaCategory,
  IdeaStatus,
  CalendarEvent,
  CalendarEventType,
  CalendarEventPriority
} from './types';
import { loadDatabase, saveDatabase, createInitialDatabase, createBlankCompany } from './storage';
import { pushDatabaseToCloud, pullDatabaseFromCloud } from './supabase';
import { generateId, getIsoWeekKey } from './utils';
import { DEMO_COMPANIES, DEMO_TAGS } from './demoData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface DashboardContextType {
  db: AppDatabase;
  loading: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  // Ações de Empresas
  createCompany: (companyData: Partial<Company>, area?: 'client' | 'prospect') => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void; // Soft delete
  restoreCompany: (id: string) => void;
  destroyCompany: (id: string) => void; // Permanent delete
  moveCompanyStatus: (id: string, status: CompanyStatus, reason?: string, reasonDetail?: string) => void;
  // Notas e Timeline
  addNote: (companyId: string, text: string, priority: 1 | 2 | 3) => void;
  deleteNote: (companyId: string, noteId: string) => void;
  // Checklist e SEO
  toggleChecklistItem: (companyId: string, key: string) => void;
  addChecklistItem: (companyId: string, label: string) => void;
  addPost: (companyId: string, date: string, notes: string) => void;
  addRanking: (companyId: string, keyword: string, position: number) => void;
  deleteRanking: (companyId: string, rankId: string) => void;
  // Perguntas & Respostas Google Q&A e Antes/Depois
  addQA: (companyId: string, q: string, a: string) => void;
  deleteQA: (companyId: string, qaId: string) => void;
  addBeforeAfter: (companyId: string, field: string, before: string, after: string, notes?: string) => void;
  deleteBeforeAfter: (companyId: string, id: string) => void;
  toggleCompanyTag: (companyId: string, tagId: string) => void;
  // Financeiro
  updateFinance: (companyId: string, monthlyFee: number, dueDay: number, paymentStatus: PaymentStatus) => void;
  // Checklist Semanal
  toggleWeekTask: (dayId: number, taskId: string, weekKey?: string) => void;
  addWeekTask: (dayId: number, text: string, companyId?: string, category?: WeekTask['category'], weekKey?: string) => void;
  deleteWeekTask: (dayId: number, taskId: string, weekKey?: string) => void;
  loadDefaultWeekRoutine: (weekKey?: string) => void;
  clearCompletedWeekTasks: (weekKey?: string, dayId?: number) => void;
  // Bloco de Ideias
  createIdea: (data: Partial<Idea>) => Idea;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  // Agenda & Calendário Geral
  createCalendarEvent: (eventData: Partial<CalendarEvent>) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEventCompleted: (id: string) => void;
  // Configurações, Exportação & Sincronização
  updateSettings: (updates: Partial<AppDatabase>) => void;
  syncCloud: () => Promise<{ ok: boolean; error?: string }>;
  exportBackup: () => void;
  exportCSV: () => void;
  exportIdeasCSV: () => void;
  exportEventsCSV: () => void;
  clearTrashNotes: () => void;
  importBackup: (jsonData: string) => boolean;
  loadDemoData: () => void;
  clearAllData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(createInitialDatabase());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Carregar dados no arranque (iniciação 100% limpa / zerada)
  useEffect(() => {
    loadDatabase().then((loaded) => {
      setDb(loaded);
      setLoading(false);
    });
  }, []);

  // Salvar sempre que db mudar
  const persist = useCallback((newDb: AppDatabase) => {
    setDb(newDb);
    saveDatabase(newDb).catch(saveErr => {
      console.error('Erro ao salvar banco de dados localmente:', saveErr);
    });
    if (newDb.sync.enabled) {
      pushDatabaseToCloud(newDb).catch(pushErr => {
        console.error('Erro ao sincronizar com a nuvem:', pushErr);
      });
    }
  }, []);

  const createCompany = useCallback((data: Partial<Company>, area: 'client' | 'prospect' = 'prospect'): Company => {
    const blank = createBlankCompany(area);
    const newCompany: Company = {
      ...blank,
      ...data,
      id: generateId(),
      area,
      status: data.status || (area === 'client' ? 'cliente' : 'novo'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    persist({
      ...db,
      companies: [newCompany, ...db.companies]
    });

    showToast(`"${newCompany.name || 'Nova empresa'}" registada com sucesso!`, 'success');
    return newCompany;
  }, [db, persist, showToast]);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    persist({ ...db, companies: updatedCompanies });
  }, [db, persist]);

  const deleteCompany = useCallback((id: string) => {
    const now = new Date().toISOString();
    let name = '';
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === id) {
        name = c.name;
        return { ...c, deletedAt: now };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    if (selectedCompanyId === id) setSelectedCompanyId(null);
    showToast(`"${name || 'Empresa'}" movida para a lixeira.`, 'info');
  }, [db, persist, selectedCompanyId, showToast]);

  const restoreCompany = useCallback((id: string) => {
    let name = '';
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === id) {
        name = c.name;
        return { ...c, deletedAt: null };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast(`"${name || 'Empresa'}" restaurada com sucesso!`, 'success');
  }, [db, persist, showToast]);

  const destroyCompany = useCallback((id: string) => {
    const updatedCompanies = db.companies.filter((c) => c.id !== id);
    persist({ ...db, companies: updatedCompanies });
    if (selectedCompanyId === id) setSelectedCompanyId(null);
    showToast('Empresa eliminada permanentemente.', 'info');
  }, [db, persist, selectedCompanyId, showToast]);

  const moveCompanyStatus = useCallback((id: string, status: CompanyStatus, reason?: string, reasonDetail?: string) => {
    const now = new Date().toISOString();
    let companyName = '';
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === id) {
        const prev = c.status;
        companyName = c.name;
        const isClient = status === 'cliente';
        return {
          ...c,
          status,
          area: (isClient ? 'client' : c.area) as 'client' | 'prospect',
          lossReason: reason || c.lossReason,
          lossText: reasonDetail !== undefined ? reasonDetail : c.lossText,
          updatedAt: now,
          timeline: [
            {
              id: generateId(),
              type: 'status',
              title: `Fase alterada: ${prev} → ${status}`,
              detail: reason ? `Motivo: ${reason} ${reasonDetail ? `(${reasonDetail})` : ''}` : '',
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    });

    persist({ ...db, companies: updatedCompanies });
    showToast(`"${companyName}" movida para "${status.toUpperCase()}".`, 'success');
  }, [db, persist, showToast]);

  const addNote = useCallback((companyId: string, text: string, priority: 1 | 2 | 3) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      text,
      at: now,
      author: 'Equipa',
      pri: priority
    };

    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          notes: [newNote, ...c.notes],
          timeline: [
            {
              id: generateId(),
              type: 'note',
              title: 'Nova anotação interna',
              detail: text.slice(0, 100),
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    });

    persist({ ...db, companies: updatedCompanies });
    showToast('Anotação guardada!', 'success');
  }, [db, persist, showToast]);

  const deleteNote = useCallback((companyId: string, noteId: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          notes: c.notes.filter(n => n.id !== noteId)
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Nota removida.', 'info');
  }, [db, persist, showToast]);

  const toggleChecklistItem = useCallback((companyId: string, key: string) => {
    const now = new Date().toISOString();
    let isNowDone = false;
    let label = '';
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        const item = c.checklist.find(i => i.key === key);
        const nextDone = item ? !item.done : false;
        isNowDone = nextDone;
        label = item?.label || '';
        return {
          ...c,
          checklist: c.checklist.map(i => i.key === key ? { ...i, done: nextDone, doneAt: nextDone ? now : null } : i),
          timeline: nextDone ? [
            {
              id: generateId(),
              type: 'checklist',
              title: `Otimização concluída: ${item?.label || key}`,
              detail: '',
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ] : c.timeline
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    if (isNowDone) {
      showToast(`Otimização concluída: ${label}`, 'success');
    }
  }, [db, persist, showToast]);

  const addChecklistItem = useCallback((companyId: string, label: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          checklist: [
            ...c.checklist,
            { key: generateId(), label, done: false, doneAt: null, preset: false }
          ]
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Item adicionado à checklist!', 'success');
  }, [db, persist, showToast]);

  const addPost = useCallback((companyId: string, date: string, notes: string) => {
    const now = new Date().toISOString();
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          posts: [{ id: generateId(), at: date, notes }, ...c.posts],
          timeline: [
            {
              id: generateId(),
              type: 'post',
              title: 'Publicação no Google registada',
              detail: notes || `Data: ${date}`,
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Publicação registada no Perfil Google!', 'success');
  }, [db, persist, showToast]);

  const addRanking = useCallback((companyId: string, keyword: string, position: number) => {
    const now = new Date().toISOString();
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          rankings: [
            ...c.rankings,
            { id: generateId(), kw: keyword, pos: position, at: now, ord: c.rankings.length + 1 }
          ]
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast(`Palavra-chave "${keyword}" adicionada na posição #${position}!`, 'success');
  }, [db, persist, showToast]);

  const deleteRanking = useCallback((companyId: string, rankId: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          rankings: c.rankings.filter(r => r.id !== rankId)
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Palavra-chave removida.', 'info');
  }, [db, persist, showToast]);

  const addQA = useCallback((companyId: string, q: string, a: string) => {
    const now = new Date().toISOString();
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          qa: [{ id: generateId(), q, a, at: now, ord: (c.qa?.length || 0) + 1 }, ...(c.qa || [])],
          timeline: [
            {
              id: generateId(),
              type: 'qa',
              title: 'Pergunta & Resposta (Q&A) adicionada',
              detail: q,
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Pergunta & Resposta configurada!', 'success');
  }, [db, persist, showToast]);

  const deleteQA = useCallback((companyId: string, qaId: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          qa: (c.qa || []).filter(item => item.id !== qaId)
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Item Q&A removido.', 'info');
  }, [db, persist, showToast]);

  const addBeforeAfter = useCallback((companyId: string, field: string, before: string, after: string, notes: string = '') => {
    const now = new Date().toISOString();
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          beforeAfter: [
            { id: generateId(), field, before, after, notes, at: now },
            ...(c.beforeAfter || [])
          ],
          timeline: [
            {
              id: generateId(),
              type: 'beforeAfter',
              title: `Otimização Antes/Depois: ${field}`,
              detail: `Antes: ${before} → Depois: ${after}`,
              at: now,
              author: 'Equipa'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Registo Antes & Depois guardado!', 'success');
  }, [db, persist, showToast]);

  const deleteBeforeAfter = useCallback((companyId: string, id: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        return {
          ...c,
          beforeAfter: (c.beforeAfter || []).filter(item => item.id !== id)
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast('Registo removido.', 'info');
  }, [db, persist, showToast]);

  const toggleCompanyTag = useCallback((companyId: string, tagId: string) => {
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        const hasTag = (c.tagIds || []).includes(tagId);
        const nextTagIds = hasTag
          ? c.tagIds.filter(id => id !== tagId)
          : [...(c.tagIds || []), tagId];
        return {
          ...c,
          tagIds: nextTagIds
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
  }, [db, persist]);

  const updateFinance = useCallback((companyId: string, monthlyFee: number, dueDay: number, paymentStatus: PaymentStatus) => {
    let clientName = '';
    const updatedCompanies = db.companies.map((c) => {
      if (c.id === companyId) {
        clientName = c.name;
        return {
          ...c,
          monthlyFee,
          dueDay,
          paymentStatus,
          lastPaymentDate: paymentStatus === 'pago' ? new Date().toISOString() : c.lastPaymentDate
        };
      }
      return c;
    });
    persist({ ...db, companies: updatedCompanies });
    showToast(`Estado de "${clientName}" atualizado para ${paymentStatus.toUpperCase()}!`, 'success');
  }, [db, persist, showToast]);

  // Gestão da Semana
  const currentWeekKey = getIsoWeekKey();
  const toggleWeekTask = useCallback((dayId: number, taskId: string, weekKey?: string) => {
    const targetWeek = weekKey || currentWeekKey;
    const weekData = db.weeks[targetWeek] || {};
    const dayTasks = weekData[dayId] || [];
    const updatedDayTasks = dayTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);

    persist({
      ...db,
      weeks: {
        ...db.weeks,
        [targetWeek]: {
          ...weekData,
          [dayId]: updatedDayTasks
        }
      }
    });
  }, [db, currentWeekKey, persist]);

  const addWeekTask = useCallback((dayId: number, text: string, companyId?: string, category?: WeekTask['category'], weekKey?: string) => {
    const targetWeek = weekKey || currentWeekKey;
    const weekData = db.weeks[targetWeek] || {};
    const dayTasks = weekData[dayId] || [];
    const newTask: WeekTask = { 
      id: generateId(), 
      text, 
      done: false,
      companyId: companyId || undefined,
      category: category || 'general'
    };

    persist({
      ...db,
      weeks: {
        ...db.weeks,
        [targetWeek]: {
          ...weekData,
          [dayId]: [...dayTasks, newTask]
        }
      }
    });
    showToast('Tarefa semanal adicionada!', 'success');
  }, [db, currentWeekKey, persist, showToast]);

  const deleteWeekTask = useCallback((dayId: number, taskId: string, weekKey?: string) => {
    const targetWeek = weekKey || currentWeekKey;
    const weekData = db.weeks[targetWeek] || {};
    const dayTasks = weekData[dayId] || [];

    persist({
      ...db,
      weeks: {
        ...db.weeks,
        [targetWeek]: {
          ...weekData,
          [dayId]: dayTasks.filter(t => t.id !== taskId)
        }
      }
    });
    showToast('Tarefa eliminada.', 'info');
  }, [db, currentWeekKey, persist, showToast]);

  const loadDefaultWeekRoutine = useCallback((weekKey?: string) => {
    const targetWeek = weekKey || currentWeekKey;
    const defaultAgencyTasks: Record<number, WeekTask[]> = {
      1: [
        { id: generateId(), text: 'Reunião de alinhamento & prioridades da semana', done: false, category: 'general' },
        { id: generateId(), text: 'Planeamento & criação de posts para o Perfil Google', done: false, category: 'content' },
        { id: generateId(), text: 'Revisão de novos contactos e leads de prospecção', done: false, category: 'finance' }
      ],
      2: [
        { id: generateId(), text: 'Auditoria de posições e rankings no Google Maps', done: false, category: 'seo' },
        { id: generateId(), text: 'Otimização de categorias secundárias e atributos GBP', done: false, category: 'seo' },
        { id: generateId(), text: 'Publicação semanal nos perfis dos clientes ativos', done: false, category: 'content' }
      ],
      3: [
        { id: generateId(), text: 'Monitorização e resposta a novas avaliações Google', done: false, category: 'reputation' },
        { id: generateId(), text: 'Elaboração e publicação de Perguntas & Respostas (Q&A)', done: false, category: 'content' },
        { id: generateId(), text: 'Envio de link curto para recolha de novas opiniões', done: false, category: 'reputation' }
      ],
      4: [
        { id: generateId(), text: 'Contacto com clientes para recolha de fotos de trabalhos', done: false, category: 'content' },
        { id: generateId(), text: 'Follow-up a propostas comerciais enviadas', done: false, category: 'finance' },
        { id: generateId(), text: 'Auditoria visual de fotos e consistência de moradas', done: false, category: 'seo' }
      ],
      5: [
        { id: generateId(), text: 'Conferência de avenças a vencer e cobranças pendentes', done: false, category: 'finance' },
        { id: generateId(), text: 'Geração e partilha de relatórios de desempenho via WhatsApp', done: false, category: 'reputation' },
        { id: generateId(), text: 'Fecho operacional da semana e arquivo de tarefas', done: false, category: 'general' }
      ],
      6: [
        { id: generateId(), text: 'Verificação de horários especiais de fim de semana', done: false, category: 'seo' }
      ],
      7: [
        { id: generateId(), text: 'Preparação do plano de ação para a semana seguinte', done: false, category: 'general' }
      ]
    };

    const weekData = db.weeks[targetWeek] || {};
    const mergedWeek: Record<number, WeekTask[]> = {};
    for (let day = 1; day <= 7; day++) {
      const existing = weekData[day] || [];
      const presets = defaultAgencyTasks[day] || [];
      mergedWeek[day] = [...existing, ...presets];
    }

    persist({
      ...db,
      weeks: {
        ...db.weeks,
        [targetWeek]: mergedWeek
      }
    });
    showToast('Rotina padrão de agência carregada para a semana!', 'success');
  }, [db, currentWeekKey, persist, showToast]);

  const clearCompletedWeekTasks = useCallback((weekKey?: string, dayId?: number) => {
    const targetWeek = weekKey || currentWeekKey;
    const weekData = db.weeks[targetWeek] || {};
    const updatedWeek: Record<number, WeekTask[]> = { ...weekData };

    if (dayId !== undefined) {
      updatedWeek[dayId] = (weekData[dayId] || []).filter(t => !t.done);
    } else {
      for (let day = 1; day <= 7; day++) {
        updatedWeek[day] = (weekData[day] || []).filter(t => !t.done);
      }
    }

    persist({
      ...db,
      weeks: {
        ...db.weeks,
        [targetWeek]: updatedWeek
      }
    });
    showToast('Tarefas concluídas limpas com sucesso.', 'info');
  }, [db, currentWeekKey, persist, showToast]);

  // Ações de Ideias
  const createIdea = useCallback((ideaData: Partial<Idea>): Idea => {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: generateId(),
      title: ideaData.title?.trim() || 'Nova Ideia',
      content: ideaData.content?.trim() || '',
      category: ideaData.category || 'geral',
      status: ideaData.status || 'ideia',
      images: Array.isArray(ideaData.images) ? ideaData.images : [],
      author: ideaData.author || 'Equipa',
      companyId: ideaData.companyId || undefined,
      tags: Array.isArray(ideaData.tags) ? ideaData.tags : [],
      createdAt: now,
      updatedAt: now
    };

    persist({
      ...db,
      ideas: [newIdea, ...(db.ideas || [])]
    });

    showToast('Ideia guardada no bloco de ideias!', 'success');
    return newIdea;
  }, [db, persist, showToast]);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    const now = new Date().toISOString();
    const currentIdeas = db.ideas || [];
    const updated = currentIdeas.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...updates,
        updatedAt: now
      };
    });

    persist({
      ...db,
      ideas: updated
    });
    showToast('Ideia atualizada com sucesso!', 'info');
  }, [db, persist, showToast]);

  const deleteIdea = useCallback((id: string) => {
    const currentIdeas = db.ideas || [];
    persist({
      ...db,
      ideas: currentIdeas.filter(i => i.id !== id)
    });
    showToast('Ideia removida.', 'info');
  }, [db, persist, showToast]);

  const createCalendarEvent = useCallback((eventData: Partial<CalendarEvent>): CalendarEvent => {
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: eventData.title?.trim() || 'Novo Evento',
      description: eventData.description?.trim() || '',
      date: eventData.date || new Date().toISOString().slice(0, 10),
      time: eventData.time || undefined,
      endDate: eventData.endDate || undefined,
      companyId: eventData.companyId || undefined,
      type: (['reuniao', 'campanha', 'entrega', 'producao', 'followup', 'geral'].includes(eventData.type || '')
        ? eventData.type
        : 'geral') as CalendarEventType,
      priority: (['alta', 'media', 'baixa'].includes(eventData.priority || '')
        ? eventData.priority
        : 'media') as CalendarEventPriority,
      completed: Boolean(eventData.completed),
      author: eventData.author || 'Equipa',
      createdAt: now,
      updatedAt: now
    };

    persist({
      ...db,
      events: [newEvent, ...(db.events || [])]
    });

    showToast('Evento agendado com sucesso!', 'success');
    return newEvent;
  }, [db, persist, showToast]);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    const now = new Date().toISOString();
    const currentEvents = db.events || [];
    const updated = currentEvents.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...updates,
        updatedAt: now
      };
    });

    persist({
      ...db,
      events: updated
    });
    showToast('Evento atualizado!', 'info');
  }, [db, persist, showToast]);

  const deleteCalendarEvent = useCallback((id: string) => {
    const currentEvents = db.events || [];
    persist({
      ...db,
      events: currentEvents.filter(e => e.id !== id)
    });
    showToast('Evento removido do calendário.', 'info');
  }, [db, persist, showToast]);

  const toggleCalendarEventCompleted = useCallback((id: string) => {
    const now = new Date().toISOString();
    const currentEvents = db.events || [];
    let newStatus = false;
    const updated = currentEvents.map(item => {
      if (item.id !== id) return item;
      newStatus = !item.completed;
      return {
        ...item,
        completed: newStatus,
        updatedAt: now
      };
    });

    persist({
      ...db,
      events: updated
    });
    showToast(newStatus ? 'Evento concluído!' : 'Evento reaberto.', 'info');
  }, [db, persist, showToast]);

  const updateSettings = useCallback((updates: Partial<AppDatabase>) => {
    persist({ ...db, ...updates });
    showToast('Definições guardadas!', 'success');
  }, [db, persist, showToast]);

  const syncCloud = useCallback(async () => {
    const pullRes = await pullDatabaseFromCloud(db);
    if (!pullRes.ok) {
      showToast(pullRes.error || 'Erro ao sincronizar.', 'error');
      return { ok: false, error: pullRes.error };
    }
    if (pullRes.data) {
      persist(pullRes.data);
      showToast('Dados sincronizados da nuvem!', 'success');
      return { ok: true };
    }
    const pushRes = await pushDatabaseToCloud(db);
    if (pushRes.ok) {
      showToast('Base de dados guardada na nuvem!', 'success');
    } else {
      showToast(pushRes.error || 'Falha ao sincronizar.', 'error');
    }
    return pushRes;
  }, [db, persist, showToast]);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draftandrise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exportado com sucesso!', 'success');
  }, [db, showToast]);

  const exportCSV = useCallback(() => {
    const headers = [
      'Nome da Empresa',
      'Categoria / Nicho',
      'Cidade',
      'Telefone',
      'WhatsApp',
      'Website',
      'Redes Sociais',
      'Tipo (Área)',
      'Fase do Funil',
      'Mensalidade (€)',
      'Dia Vencimento',
      'Estado Pagamento',
      'Cadência Posts (dias)',
      'Total Rankings',
      'Checklist Concluída (%)',
      'Último Pagamento',
      'Data de Registo'
    ];

    // Mitigação OWASP CSV Formula Injection: neutraliza células iniciadas por =, +, -, @, %
    const sanitizeCSVCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (/^[=+\-@%]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = db.companies.filter(c => !c.deletedAt).map(c => {
      const doneCheck = c.checklist.filter(i => i.done).length;
      const pct = c.checklist.length > 0 ? Math.round((doneCheck / c.checklist.length) * 100) : 0;
      return [
        sanitizeCSVCell(c.name || ''),
        sanitizeCSVCell(c.category || ''),
        sanitizeCSVCell(c.city || ''),
        sanitizeCSVCell(c.phone || ''),
        sanitizeCSVCell(c.whatsapp || ''),
        sanitizeCSVCell(c.website || ''),
        sanitizeCSVCell(c.social || ''),
        sanitizeCSVCell(c.area === 'client' ? 'Cliente Ativo' : 'Prospecção'),
        sanitizeCSVCell(c.status),
        sanitizeCSVCell(c.monthlyFee || 0),
        sanitizeCSVCell(c.dueDay || 5),
        sanitizeCSVCell(c.paymentStatus || 'pendente'),
        sanitizeCSVCell(c.cadence || 7),
        sanitizeCSVCell(c.rankings.length),
        sanitizeCSVCell(`${pct}%`),
        sanitizeCSVCell(c.lastPaymentDate ? c.lastPaymentDate.slice(0, 10) : '—'),
        sanitizeCSVCell(c.createdAt ? c.createdAt.slice(0, 10) : '—')
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `draftandrise-carteira-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Ficheiro CSV de carteira exportado com sucesso!', 'success');
  }, [db.companies, showToast]);

  const exportIdeasCSV = useCallback(() => {
    const sanitizeCSVCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (/^[=+\-@%]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Título da Ideia',
      'Categoria',
      'Estado',
      'Autor',
      'Empresa Associada',
      'Imagens Anexadas',
      'Data de Criação',
      'Conteúdo / Notas'
    ];

    const rows = (db.ideas || []).map(i => {
      const comp = i.companyId ? db.companies.find(c => c.id === i.companyId)?.name || '—' : 'Geral';
      return [
        sanitizeCSVCell(i.title || ''),
        sanitizeCSVCell(i.category || 'geral'),
        sanitizeCSVCell(i.status || 'ideia'),
        sanitizeCSVCell(i.author || 'Equipa'),
        sanitizeCSVCell(comp),
        sanitizeCSVCell(i.images?.length ? `${i.images.length} imagem(ns)` : '0'),
        sanitizeCSVCell(i.createdAt ? i.createdAt.slice(0, 10) : '—'),
        sanitizeCSVCell((i.content || '').replace(/\r?\n/g, ' '))
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `draftandrise-ideias-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Ficheiro CSV de ideias exportado com sucesso!', 'success');
  }, [db.ideas, db.companies, showToast]);

  const exportEventsCSV = useCallback(() => {
    const sanitizeCSVCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      if (/^[=+\-@%]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Título do Evento',
      'Data Início',
      'Hora',
      'Data Fim',
      'Tipo de Evento',
      'Prioridade',
      'Estado',
      'Empresa / Cliente',
      'Autor',
      'Descrição'
    ];

    const rows = (db.events || []).map(e => {
      const comp = e.companyId ? db.companies.find(c => c.id === e.companyId)?.name || '—' : 'Geral';
      return [
        sanitizeCSVCell(e.title || ''),
        sanitizeCSVCell(e.date || ''),
        sanitizeCSVCell(e.time || '—'),
        sanitizeCSVCell(e.endDate || '—'),
        sanitizeCSVCell(e.type || 'geral'),
        sanitizeCSVCell(e.priority || 'media'),
        sanitizeCSVCell(e.completed ? 'Concluído' : 'Pendente'),
        sanitizeCSVCell(comp),
        sanitizeCSVCell(e.author || 'Equipa'),
        sanitizeCSVCell((e.description || '').replace(/\r?\n/g, ' '))
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `draftandrise-agenda-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Ficheiro CSV de agenda exportado com sucesso!', 'success');
  }, [db.events, db.companies, showToast]);

  const clearTrashNotes = useCallback(() => {
    persist({ ...db, trashNotes: [] });
    showToast('Lixeira de notas esvaziada com sucesso.', 'info');
  }, [db, persist, showToast]);

  const importBackup = useCallback((jsonData: string) => {
    try {
      // 1. Limite de tamanho de payload (10 MB máx)
      if (typeof jsonData !== 'string' || jsonData.length > 10 * 1024 * 1024) {
        showToast('Ficheiro de backup excede o tamanho permitido.', 'error');
        return false;
      }

      // 2. Prevenção de Prototype Pollution: rejeitar se contiver chaves perigosas
      if (/"(__proto__|constructor|prototype)"\s*:/i.test(jsonData)) {
        showToast('Ficheiro de backup rejeitado por integridade e segurança.', 'error');
        return false;
      }

      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        showToast('Formato de backup inválido.', 'error');
        return false;
      }

      if (!Array.isArray(parsed.companies)) {
        showToast('Ficheiro de backup não contém lista válida de empresas.', 'error');
        return false;
      }

      // 3. Sanitização estrutural estrita de cada empresa importada
      const cleanCompanies: Company[] = (parsed.companies as unknown[])
        .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object' && 'id' in c && 'name' in c && typeof (c as Record<string, unknown>).id === 'string' && typeof (c as Record<string, unknown>).name === 'string'))
        .map((c) => ({
          ...createBlankCompany('client'),
          ...c,
          id: String(c.id).slice(0, 80),
          name: String(c.name).slice(0, 200),
          category: String(c.category || '').slice(0, 100),
          city: String(c.city || '').slice(0, 100),
          phone: String(c.phone || '').slice(0, 50),
          whatsapp: String(c.whatsapp || '').slice(0, 50),
          website: String(c.website || '').slice(0, 300),
          social: String(c.social || '').slice(0, 300),
          status: ['lead', 'contactado', 'proposta', 'fechado', 'perdido', 'cliente', 'pausado', 'cancelado'].includes(String(c.status))
            ? (c.status as CompanyStatus)
            : 'lead',
          area: c.area === 'prospect' ? 'prospect' : 'client',
          checklist: Array.isArray(c.checklist) ? (c.checklist as ChecklistItem[]) : [],
          posts: Array.isArray(c.posts) ? (c.posts as PostEntry[]) : [],
          rankings: Array.isArray(c.rankings) ? (c.rankings as KeywordRank[]) : [],
          qa: Array.isArray(c.qa) ? (c.qa as QAEntry[]) : [],
          beforeAfter: Array.isArray(c.beforeAfter) ? (c.beforeAfter as BeforeAfter[]) : [],
          notes: Array.isArray(c.notes) ? (c.notes as Note[]) : [],
          tagIds: Array.isArray(c.tagIds) ? (c.tagIds as string[]) : []
        })) as Company[];

      const cleanDb: AppDatabase = {
        ...createInitialDatabase(),
        ...db,
        companies: cleanCompanies,
        tags: Array.isArray(parsed.tags) ? parsed.tags : db.tags,
        categories: Array.isArray(parsed.categories) ? parsed.categories : db.categories,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : db.reasons,
        analysis: Array.isArray(parsed.analysis) ? parsed.analysis : db.analysis,
        trashNotes: Array.isArray(parsed.trashNotes) ? parsed.trashNotes : db.trashNotes,
        weeks: parsed.weeks && typeof parsed.weeks === 'object' && !Array.isArray(parsed.weeks) ? parsed.weeks : (db.weeks || {}),
        ideas: Array.isArray(parsed.ideas)
          ? parsed.ideas
              .filter((i: any) => i && typeof i === 'object' && typeof i.id === 'string')
              .map((i: any) => ({
                id: String(i.id).slice(0, 80),
                title: String(i.title || '').slice(0, 300),
                content: String(i.content || '').slice(0, 20000),
                category: (['oferta', 'marketing', 'processo', 'conteudo', 'geral'].includes(i.category) ? i.category : 'geral') as IdeaCategory,
                status: (['ideia', 'estudo', 'aprovada', 'arquivada'].includes(i.status) ? i.status : 'ideia') as IdeaStatus,
                images: Array.isArray(i.images) ? i.images : [],
                author: String(i.author || 'Equipa').slice(0, 100),
                companyId: i.companyId ? String(i.companyId).slice(0, 80) : undefined,
                tags: Array.isArray(i.tags) ? i.tags : [],
                createdAt: i.createdAt || new Date().toISOString(),
                updatedAt: i.updatedAt || new Date().toISOString()
              }))
          : (db.ideas || []),
        events: Array.isArray(parsed.events)
          ? parsed.events
              .filter((e: any) => e && typeof e === 'object' && typeof e.id === 'string')
              .map((e: any) => ({
                id: String(e.id).slice(0, 80),
                title: String(e.title || '').slice(0, 300),
                description: String(e.description || '').slice(0, 5000),
                date: String(e.date || '').slice(0, 10),
                time: e.time ? String(e.time).slice(0, 8) : undefined,
                endDate: e.endDate ? String(e.endDate).slice(0, 10) : undefined,
                companyId: e.companyId ? String(e.companyId).slice(0, 80) : undefined,
                type: (['reuniao', 'campanha', 'entrega', 'producao', 'followup', 'geral'].includes(e.type) ? e.type : 'geral') as CalendarEventType,
                priority: (['alta', 'media', 'baixa'].includes(e.priority) ? e.priority : 'media') as CalendarEventPriority,
                completed: Boolean(e.completed),
                author: String(e.author || 'Equipa').slice(0, 100),
                createdAt: e.createdAt || new Date().toISOString(),
                updatedAt: e.updatedAt || new Date().toISOString()
              }))
          : (db.events || []),
        staleDays: typeof parsed.staleDays === 'number' ? parsed.staleDays : db.staleDays,
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        sync: parsed.sync && typeof parsed.sync === 'object' ? { ...db.sync, ...parsed.sync } : db.sync,
        agency: parsed.agency && typeof parsed.agency === 'object' ? { ...db.agency, ...parsed.agency } : db.agency
      };

      persist(cleanDb);
      showToast(`Backup importado com sucesso (${cleanCompanies.length} empresas)!`, 'success');
      return true;
    } catch {
      showToast('Erro ao ler ou processar ficheiro de backup.', 'error');
      return false;
    }
  }, [db, persist, showToast]);

  const loadDemoData = useCallback(() => {
    const newDb: AppDatabase = {
      ...db,
      companies: DEMO_COMPANIES,
      tags: [...DEMO_TAGS, ...db.tags.filter(t => !DEMO_TAGS.some(dt => dt.id === t.id))]
    };
    persist(newDb);
    showToast('Dados de demonstração carregados com sucesso!', 'success');
  }, [db, persist, showToast]);

  const clearAllData = useCallback(() => {
    const blank = createInitialDatabase();
    persist(blank);
    showToast('Base de dados limpa com sucesso.', 'info');
  }, [persist, showToast]);

  return (
    <DashboardContext.Provider
      value={{
        db,
        loading,
        activeTab,
        setActiveTab,
        selectedCompanyId,
        setSelectedCompanyId,
        searchQuery,
        setSearchQuery,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toasts,
        showToast,
        createCompany,
        updateCompany,
        deleteCompany,
        restoreCompany,
        destroyCompany,
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
        toggleWeekTask,
        addWeekTask,
        deleteWeekTask,
        loadDefaultWeekRoutine,
        clearCompletedWeekTasks,
        createIdea,
        updateIdea,
        deleteIdea,
        createCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEventCompleted,
        updateSettings,
        syncCloud,
        exportBackup,
        exportCSV,
        exportIdeasCSV,
        exportEventsCSV,
        clearTrashNotes,
        importBackup,
        loadDemoData,
        clearAllData
      }}
    >
      {children}

      {/* Toast Notification Container — Estilo Draft & Rise */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map(t => (
            <div 
              key={t.id}
              className={`pointer-events-auto px-4 py-2.5 rounded-full shadow-lg border text-xs font-medium flex items-center gap-2.5 transition-all ${
                t.type === 'error' 
                  ? 'bg-[#c43f17] text-white border-[#c43f17]' 
                  : 'bg-[#202d32] text-white border-[#35454b]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                t.type === 'error' ? 'bg-white' : 'bg-[#ff6a36]'
              }`} />
              <span className="leading-snug">{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
