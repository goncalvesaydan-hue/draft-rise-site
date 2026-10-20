export type CompanyStatus = 
  | 'novo'
  | 'follow_up'
  | 'abandonado'
  | 'respondeu'
  | 'interessado'
  | 'cliente'
  | 'perdido';

export type CompanyArea = 'prospect' | 'client';

export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export interface Note {
  id: string;
  text: string;
  at: string;
  author: string;
  pri: 1 | 2 | 3; // 1: Alta, 2: Média, 3: Baixa
}

export interface Reminder {
  id: string;
  due: string;
  note: string;
  done: boolean;
  kind: 'followup' | 'custom';
  auto?: boolean;
}

export interface KeywordRank {
  id: string;
  kw: string;
  pos: number;
  at: string;
  ord?: number;
}

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  doneAt: string | null;
  preset?: boolean;
}

export interface PostEntry {
  id: string;
  at: string;
  notes: string;
}

export interface QAEntry {
  id: string;
  q: string;
  a: string;
  at: string;
  ord?: number;
}

export interface BeforeAfter {
  id: string;
  field: string;
  before: string;
  after: string;
  notes: string;
  at: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  detail: string;
  at: string;
  author: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Company {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  whatsapp: string;
  website: string;
  social: string;
  area: CompanyArea;
  origin: 'direct' | 'prospect';
  status: CompanyStatus;
  tagIds: string[];
  analysis: string[];
  notes: Note[];
  rankings: KeywordRank[];
  reminders: Reminder[];
  timeline: TimelineEvent[];
  checklist: ChecklistItem[];
  beforeAfter: BeforeAfter[];
  posts: PostEntry[];
  qa: QAEntry[];
  cadence: number; // dias (ex: 7)
  lossReason: string;
  lossText: string;
  // Gestão Financeira Interna
  monthlyFee: number;
  dueDay: number;
  paymentStatus: PaymentStatus;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WeekTask {
  id: string;
  text: string;
  done: boolean;
  companyId?: string;
  category?: 'seo' | 'content' | 'reputation' | 'finance' | 'general';
}

export interface AppDatabase {
  companies: Company[];
  tags: Tag[];
  categories: string[];
  reasons: string[];
  analysis: string[];
  trashNotes: Array<Note & { companyId: string; companyName: string; deletedAt: string }>;
  weeks: Record<string, Record<number, WeekTask[]>>;
  staleDays: number;
  theme: 'light' | 'dark';
  sync: {
    enabled: boolean;
    url: string;
    key: string;
    password: string;
    room: string;
  };
}

export type NavigationTab = 
  | 'dashboard'
  | 'prospeccao'
  | 'clientes'
  | 'semana'
  | 'financeiro'
  | 'lixeira'
  | 'configuracoes';

