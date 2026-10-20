import { CompanyStatus, Tag } from './types';

export const PIPELINE_STAGES: { id: CompanyStatus; label: string; color: string; badgeClass: string }[] = [
  { id: 'novo', label: 'Novo', color: '#3b82f6', badgeClass: 'bg-blue-100 text-blue-800' },
  { id: 'follow_up', label: 'Follow up', color: '#f59e0b', badgeClass: 'bg-amber-100 text-amber-800' },
  { id: 'respondeu', label: 'Respondeu', color: '#8b5cf6', badgeClass: 'bg-purple-100 text-purple-800' },
  { id: 'interessado', label: 'Interessado', color: '#f97316', badgeClass: 'bg-orange-100 text-orange-800' },
  { id: 'cliente', label: 'Cliente', color: '#10b981', badgeClass: 'bg-emerald-100 text-emerald-800' },
  { id: 'abandonado', label: 'Abandonado', color: '#64748b', badgeClass: 'bg-slate-100 text-slate-800' },
  { id: 'perdido', label: 'Perdido', color: '#ef4444', badgeClass: 'bg-rose-100 text-rose-800' },
];

export const CLIENT_STATUS_FILTERS = [
  { id: 'cliente', label: 'Clientes Ativos' },
  { id: 'perdido', label: 'Perdidos' },
  { id: 'abandonado', label: 'Abandonados' },
];

export const DEFAULT_CHECKLIST_ITEMS: [string, string][] = [
  ['infos', 'Informações essenciais, horários, contactos e WhatsApp'],
  ['categorias', 'Categorias principais e secundárias otimizadas'],
  ['descricao', 'Descrição do negócio com palavras-chave e SEO local'],
  ['catalogo', 'Catálogo de produtos e serviços cadastrado com fotos'],
  ['fotos', 'Fotos e vídeos em alta resolução (espaço, equipa, trabalhos)'],
  ['qa', 'Perguntas e Respostas (Q&A) configuradas estrategicamente'],
  ['avaliacoes', 'Responder a todas as avaliações com foco em confiança'],
  ['shortlink', 'Link direto de pedido de avaliações configurado'],
  ['postagens', 'Publicações regulares (novidades, promoções, eventos)'],
  ['diretorios', 'Registo em diretórios de referência e consistência NAP'],
  ['redes', 'Integração de website e canais de redes sociais'],
];

export const DEFAULT_CATEGORIES: string[] = [
  'Restaurante / Gastronomia',
  'Clínica Médica & Saúde',
  'Advocacia & Jurídico',
  'Odontologia & Medicina Dentária',
  'Imobiliária & Construção',
  'Comércio Local & Retalho',
  'Serviços Especializados',
  'Hotelaria / Alojamento Local',
  'Beleza, Estética & Bem-Estar',
  'Fitness, Ginásios & Performance'
];

export const DEFAULT_ANALYSIS_POINTS: string[] = [
  'WhatsApp visível',
  'Redes sociais adicionadas',
  'Serviços/produtos cadastrados',
  'Perfil pouco otimizado',
  'Poucas avaliações',
  'Não responde avaliações',
  'Sem website'
];

export const DEFAULT_TAGS: Tag[] = [
  { id: 't1', name: 'Nicho: Odontologia', color: '#0ea5e9' },
  { id: 't2', name: 'Ticket Alto', color: '#f59e0b' },
  { id: 't3', name: 'Urgente', color: '#ef4444' },
  { id: 't4', name: 'Indicação', color: '#10b981' }
];

export const DEFAULT_LOSS_REASONS: string[] = [
  'Preço / Orçamento',
  'Concorrência',
  'Sem retorno / Desapareceu',
  'Insatisfação',
  'Timing inadequado',
  'Outro'
];

export const DEFAULT_AGENCY_SETTINGS = {
  name: 'Draft & Rise',
  email: 'contacto@draftandrise.com',
  phone: '+351 912 345 678',
  currency: 'EUR',
  defaultDueDay: 5,
  defaultCadence: 7,
  alertDaysBeforeDue: 3
};

export const WEEKDAYS = [
  { id: 1, short: 'SEG', label: 'Segunda-feira', color: '#10b981' },
  { id: 2, short: 'TER', label: 'Terça-feira', color: '#3b82f6' },
  { id: 3, short: 'QUA', label: 'Quarta-feira', color: '#8b5cf6' },
  { id: 4, short: 'QUI', label: 'Quinta-feira', color: '#f59e0b' },
  { id: 5, short: 'SEX', label: 'Sexta-feira', color: '#ec4899' },
  { id: 6, short: 'SÁB', label: 'Sábado', color: '#f97316' },
  { id: 7, short: 'DOM', label: 'Domingo', color: '#06b6d4' }
];

