import { AppDatabase, Company } from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ANALYSIS_POINTS,
  DEFAULT_TAGS,
  DEFAULT_LOSS_REASONS,
  DEFAULT_CHECKLIST_ITEMS,
  DEFAULT_AGENCY_SETTINGS
} from './constants';
import { generateId } from './utils';

const DB_NAME = 'draftandrise-team-manager-v1';
const STORE_NAME = 'kv';
const DB_VERSION = 1;
const STORAGE_KEY = 'draftandrise_dashboard_v1';

export function createInitialDatabase(): AppDatabase {
  return {
    companies: [],
    tags: DEFAULT_TAGS,
    categories: DEFAULT_CATEGORIES,
    reasons: DEFAULT_LOSS_REASONS,
    analysis: DEFAULT_ANALYSIS_POINTS,
    trashNotes: [],
    weeks: {},
    ideas: [],
    events: [],
    staleDays: 7,
    theme: 'light',
    sync: {
      enabled: false,
      url: '',
      key: '',
      password: '',
      room: 'gbp-team-default'
    },
    agency: DEFAULT_AGENCY_SETTINGS
  };
}

export function createBlankCompany(area: 'client' | 'prospect' = 'prospect'): Company {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: '',
    category: DEFAULT_CATEGORIES[0] || 'Geral',
    city: '',
    phone: '',
    whatsapp: '',
    website: '',
    social: '',
    area,
    origin: area === 'client' ? 'direct' : 'prospect',
    status: area === 'client' ? 'cliente' : 'novo',
    tagIds: [],
    analysis: [],
    notes: [],
    rankings: [],
    reminders: [],
    timeline: [
      {
        id: generateId(),
        type: 'created',
        title: area === 'client' ? 'Cliente registado' : 'Lead registada',
        detail: 'Criação inicial da ficha da empresa',
        at: now,
        author: 'Equipa'
      }
    ],
    checklist: DEFAULT_CHECKLIST_ITEMS.map(([k, l]) => ({
      key: k,
      label: l,
      done: false,
      doneAt: null,
      preset: true
    })),
    beforeAfter: [],
    posts: [],
    qa: [],
    cadence: 7,
    lossReason: '',
    lossText: '',
    monthlyFee: 0,
    dueDay: 5,
    paymentStatus: 'pendente',
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  };
}

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadDatabase(): Promise<AppDatabase> {
  if (typeof window === 'undefined') {
    return createInitialDatabase();
  }

  // Limpeza de bases ou chaves legadas de demonstração para garantir estado 100% limpo / zerado
  try {
    localStorage.removeItem('gbp_dashboard_data_v2');
    localStorage.removeItem('gbp_dashboard_data_v1');
    if (window.indexedDB) {
      window.indexedDB.deleteDatabase('gbp-team-manager');
    }
  } catch {}

  let dbData: AppDatabase | null = null;

  try {
    const idb = await openIDB();
    dbData = await new Promise<AppDatabase | null>((resolve) => {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('database');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Erro ao ler IndexedDB, tentando localStorage...', err);
  }

  if (!dbData) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dbData = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Falha ao ler localStorage:', e);
    }
  }

  if (!dbData) {
    dbData = createInitialDatabase();
  } else {
    // Garantir integridade de campos em versões novas
    const init = createInitialDatabase();
    dbData = {
      ...init,
      ...dbData,
      companies: (dbData.companies || []).map(c => ({
        ...createBlankCompany(c.area),
        ...c
      })),
      ideas: Array.isArray(dbData.ideas) ? dbData.ideas : [],
      events: Array.isArray(dbData.events) ? dbData.events : [],
      agency: {
        ...DEFAULT_AGENCY_SETTINGS,
        ...(dbData.agency || {})
      }
    };
  }

  return dbData;
}

export async function saveDatabase(data: AppDatabase): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const idb = await openIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, 'database');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erro ao gravar no IndexedDB, usando localStorage:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao gravar no localStorage:', err);
  }
}

