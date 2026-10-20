import { Company, Tag } from './types';
import { DEFAULT_CHECKLIST_ITEMS } from './constants';

export const DEMO_TAGS: Tag[] = [
  { id: 'tag-vip', name: 'Cliente VIP', color: '#ff6a36' },
  { id: 'tag-urgente', name: 'Urgente', color: '#a02d24' },
  { id: 'tag-indicacao', name: 'Indicação', color: '#236a50' },
  { id: 'tag-mensal', name: 'Avença Mensal', color: '#202d32' },
];

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'demo-1',
    name: 'Clínica Dentária Sorriso Nobre',
    category: 'Dentista / Clínica Odontológica',
    city: 'Lisboa',
    phone: '+351 210 123 456',
    whatsapp: '+351912345678',
    website: 'https://sorrisonobre.pt',
    social: 'https://instagram.com/sorrisonobre_lisboa',
    area: 'client',
    origin: 'direct',
    status: 'cliente',
    tagIds: ['tag-vip', 'tag-mensal'],
    analysis: ['Perfil otimizado', 'Boas fotos', 'Reviews regulares'],
    notes: [
      {
        id: 'note-1',
        text: 'Dra. Inês pediu para reforçar as palavras-chave de "Implantes Dentários Lisboa" e "Invisalign".',
        at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise',
        pri: 1
      },
      {
        id: 'note-2',
        text: 'Campanha de pedidos de avaliação por SMS gerou +14 avaliações 5 estrelas no Maps!',
        at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise',
        pri: 2
      }
    ],
    rankings: [
      { id: 'rank-1', kw: 'dentista em lisboa centro', pos: 1, at: new Date().toISOString() },
      { id: 'rank-2', kw: 'clinica dentaria avenidas novas', pos: 2, at: new Date().toISOString() },
      { id: 'rank-3', kw: 'implantes dentarios lisboa', pos: 3, at: new Date().toISOString() },
      { id: 'rank-4', kw: 'urgencia dentaria lisboa 24h', pos: 5, at: new Date().toISOString() },
    ],
    reminders: [
      {
        id: 'rem-1',
        due: new Date().toISOString().slice(0, 10),
        note: 'Enviar relatório mensal de métricas de chamadas do Google Maps',
        done: false,
        kind: 'custom'
      }
    ],
    timeline: [
      {
        id: 't-1',
        type: 'status_change',
        title: 'Contrato Assinado',
        detail: 'Início da avença SEO Local & Google Meu Negócio',
        at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise'
      }
    ],
    checklist: DEFAULT_CHECKLIST_ITEMS.map(([k, l], idx) => ({
      key: k,
      label: l,
      done: idx < 7,
      doneAt: idx < 7 ? new Date(Date.now() - (7 - idx) * 24 * 3600 * 1000).toISOString() : null,
      preset: true
    })),
    beforeAfter: [],
    posts: [
      {
        id: 'post-1',
        at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        notes: 'Publicação sobre dicas de higiene oral e fotos da equipa na clínica.'
      },
      {
        id: 'post-2',
        at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        notes: 'Post sobre vantagens dos alinhadores invisíveis.'
      }
    ],
    qa: [],
    cadence: 7,
    lossReason: '',
    lossText: '',
    monthlyFee: 290,
    dueDay: 5,
    paymentStatus: 'pago',
    lastPaymentDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    id: 'demo-2',
    name: 'Auto Mecânica Preciso & Filhos',
    category: 'Oficina Mecânica',
    city: 'Porto',
    phone: '+351 220 987 654',
    whatsapp: '+351923456789',
    website: 'https://autopreciso.pt',
    social: '',
    area: 'client',
    origin: 'prospect',
    status: 'cliente',
    tagIds: ['tag-mensal'],
    analysis: ['Poucas avaliações', 'Sem publicações semanais'],
    notes: [
      {
        id: 'note-3',
        text: 'Sr. Carlos confirmou que o fluxo de revisões pré-inspeção aumentou 35% após otimização do perfil.',
        at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise',
        pri: 2
      }
    ],
    rankings: [
      { id: 'rank-5', kw: 'oficina mecanica porto', pos: 2, at: new Date().toISOString() },
      { id: 'rank-6', kw: 'revisao automovel porto', pos: 4, at: new Date().toISOString() },
      { id: 'rank-7', kw: 'troca de oleo bonfim porto', pos: 1, at: new Date().toISOString() },
    ],
    reminders: [
      {
        id: 'rem-2',
        due: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        note: 'Publicação semanal em atraso: pedir fotos de carros finalizados',
        done: false,
        kind: 'followup'
      }
    ],
    timeline: [
      {
        id: 't-2',
        type: 'post',
        title: 'Postagem no Google',
        detail: 'Post sobre preparação para Inspeção Periódica Obrigatória',
        at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
        author: 'Equipa'
      }
    ],
    checklist: DEFAULT_CHECKLIST_ITEMS.map(([k, l], idx) => ({
      key: k,
      label: l,
      done: idx < 6,
      doneAt: idx < 6 ? new Date(Date.now() - (6 - idx) * 24 * 3600 * 1000).toISOString() : null,
      preset: true
    })),
    beforeAfter: [],
    posts: [
      {
        id: 'post-3',
        at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        notes: 'Post com fotos de manutenção e alinhamento de direção.'
      }
    ],
    qa: [],
    cadence: 7, // 11 dias sem post = alerta!
    lossReason: '',
    lossText: '',
    monthlyFee: 195,
    dueDay: 10,
    paymentStatus: 'atrasado',
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    id: 'demo-3',
    name: 'Restaurante & Marisqueira O Farol',
    category: 'Restaurante / Bar',
    city: 'Cascais',
    phone: '+351 214 800 111',
    whatsapp: '+351934567890',
    website: 'https://marisqueiraofarol.pt',
    social: 'https://instagram.com/ofarol_cascais',
    area: 'prospect',
    origin: 'prospect',
    status: 'interessado',
    tagIds: ['tag-indicacao', 'tag-urgente'],
    analysis: ['Horário de funcionamento incorreto no Maps', 'Sem menu atualizado'],
    notes: [
      {
        id: 'note-4',
        text: 'Proprietário António demonstrou grande interesse na proposta de 250€/mês. Reunião de fecho agendada.',
        at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise',
        pri: 1
      }
    ],
    rankings: [
      { id: 'rank-8', kw: 'melhor marisco cascais', pos: 6, at: new Date().toISOString() },
      { id: 'rank-9', kw: 'restaurante peixe fresco cascais', pos: 8, at: new Date().toISOString() },
    ],
    reminders: [
      {
        id: 'rem-3',
        due: new Date().toISOString().slice(0, 10),
        note: 'Ligar para Sr. António para confirmar contrato e dados de faturação',
        done: false,
        kind: 'followup'
      }
    ],
    timeline: [
      {
        id: 't-3',
        type: 'stage_change',
        title: 'Avançou para "Interessado"',
        detail: 'Recebeu auditoria gratuita do Google Maps e gostou dos pontos de melhoria',
        at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise'
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
    monthlyFee: 250,
    dueDay: 1,
    paymentStatus: 'pendente',
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    id: 'demo-4',
    name: 'Barbearia Gentleman D’Ouro',
    category: 'Barbearia / Cabeleireiro',
    city: 'Braga',
    phone: '+351 253 400 900',
    whatsapp: '+351961234567',
    website: '',
    social: 'https://instagram.com/gentlemandouro_braga',
    area: 'prospect',
    origin: 'prospect',
    status: 'respondeu',
    tagIds: [],
    analysis: ['Sem botão de agendamento online', 'Sem catálogo de serviços'],
    notes: [
      {
        id: 'note-5',
        text: 'Responderam à mensagem de abordagem no WhatsApp. Querem ver exemplos de barbearias que posicionamos em 1º lugar.',
        at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        author: 'Equipa',
        pri: 2
      }
    ],
    rankings: [
      { id: 'rank-10', kw: 'barbearia braga centro', pos: 9, at: new Date().toISOString() }
    ],
    reminders: [
      {
        id: 'rem-4',
        due: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        note: 'Enviar PDF com estudo de caso de barbearia no Porto',
        done: false,
        kind: 'followup'
      }
    ],
    timeline: [
      {
        id: 't-4',
        type: 'contact',
        title: 'Mensagem Respondida',
        detail: 'Contacto inicial via WhatsApp com interesse em posicionamento Maps',
        at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise'
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
    monthlyFee: 140,
    dueDay: 15,
    paymentStatus: 'pendente',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    id: 'demo-5',
    name: 'Estética & Spa Serenidade',
    category: 'Estética / Spa / Bem-estar',
    city: 'Coimbra',
    phone: '+351 239 123 789',
    whatsapp: '+351919876543',
    website: 'https://spaserenidade.pt',
    social: 'https://instagram.com/serenidade_spa',
    area: 'client',
    origin: 'direct',
    status: 'cliente',
    tagIds: ['tag-mensal'],
    analysis: ['Perfil otimizado', 'Tratamentos cadastrados como produtos'],
    notes: [
      {
        id: 'note-6',
        text: 'Aumentou a procura de massagens de casal no fim de semana graças às publicações no perfil Google.',
        at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        author: 'Draft & Rise',
        pri: 3
      }
    ],
    rankings: [
      { id: 'rank-11', kw: 'spa coimbra centro', pos: 1, at: new Date().toISOString() },
      { id: 'rank-12', kw: 'massagem relaxamento coimbra', pos: 2, at: new Date().toISOString() },
      { id: 'rank-13', kw: 'limpeza de pele coimbra', pos: 3, at: new Date().toISOString() },
    ],
    reminders: [],
    timeline: [],
    checklist: DEFAULT_CHECKLIST_ITEMS.map(([k, l], idx) => ({
      key: k,
      label: l,
      done: idx < 8,
      doneAt: idx < 8 ? new Date().toISOString() : null,
      preset: true
    })),
    beforeAfter: [],
    posts: [
      {
        id: 'post-4',
        at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        notes: 'Promoção de Primavera: Pack Spa & Hidratação Facial.'
      }
    ],
    qa: [],
    cadence: 7,
    lossReason: '',
    lossText: '',
    monthlyFee: 210,
    dueDay: 5,
    paymentStatus: 'pago',
    lastPaymentDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  }
];

