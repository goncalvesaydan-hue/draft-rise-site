'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Phone, 
  ExternalLink, 
  Trash2,
  MessageSquare,
  ArrowUpDown,
  LayoutGrid,
  List,
  ArrowRight,
  Download
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { PIPELINE_STAGES } from './constants';
import { formatCurrency } from './utils';
import { PaymentStatus } from './types';

interface ClientListProps {
  onOpenNewModal: (area: 'client' | 'prospect') => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onOpenNewModal }) => {
  const { db, setSelectedCompanyId, deleteCompany, updateFinance, exportCSV, searchQuery, showToast } = useDashboard();
  const [filter, setFilter] = useState<'all' | 'client' | 'prospect' | 'late'>('client');
  const [sortBy, setSortBy] = useState<'name' | 'fee' | 'due'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'grid';
    return 'table';
  });

  const companies = db.companies.filter(c => !c.deletedAt);

  const filtered = useMemo(() => {
    return companies
      .filter(c => {
        if (filter === 'client' && c.status !== 'cliente') return false;
        if (filter === 'prospect' && c.area !== 'prospect') return false;
        if (filter === 'late' && (c.status !== 'cliente' || c.paymentStatus !== 'atrasado')) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const tagNames = c.tagIds.map(tid => db.tags.find(t => t.id === tid)?.name || '').join(' ').toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.whatsapp.toLowerCase().includes(q) ||
          tagNames.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'fee') return (b.monthlyFee || 0) - (a.monthlyFee || 0);
        if (sortBy === 'due') return (a.dueDay || 5) - (b.dueDay || 5);
        return a.name.localeCompare(b.name, 'pt-PT');
      });
  }, [companies, filter, searchQuery, sortBy, db.tags]);

  const activeCount = companies.filter(c => c.status === 'cliente').length;
  const prospectCount = companies.filter(c => c.area === 'prospect').length;
  const lateCount = companies.filter(c => c.status === 'cliente' && c.paymentStatus === 'atrasado').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#d8dddc] dark:border-[#2a3a41] transition-colors">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
            Carteira &amp; Contratos
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] dark:text-[#f5f7f7] tracking-tight mt-0.5">
            Empresas &amp; Clientes<span className="text-[#c74418]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#566266] dark:text-[#9cb0b7] mt-1">
            Fichas cadastrais, acompanhamento de avenças e histórico de otimizações.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#1c272c] hover:bg-[#f6f7f4] dark:hover:bg-[#223136] border border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] text-[#202d32] dark:text-[#f5f7f7] hover:text-[#ff6a36] dark:hover:text-[#ff6a36] rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Descarregar ficheiro CSV com todas as empresas e contactos"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => onOpenNewModal('client')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white rounded-full text-xs font-semibold shadow-xs shadow-[#ff6a36]/25 transition-all cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & View Mode & Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#d8dddc] dark:border-[#2a3a41] transition-colors">
        {/* Pills no estilo Draft & Rise com Alta Visibilidade */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-4 max-w-full">
          <button
            onClick={() => setFilter('client')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              filter === 'client'
                ? 'bg-[#ff6a36] !text-white border-[#ff6a36] shadow-xs'
                : 'bg-white dark:bg-[#1c272c] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            Clientes Ativos ({activeCount})
          </button>

          <button
            onClick={() => setFilter('prospect')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              filter === 'prospect'
                ? 'bg-[#ff6a36] !text-white border-[#ff6a36] shadow-xs'
                : 'bg-white dark:bg-[#1c272c] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            Prospecção ({prospectCount})
          </button>

          <button
            onClick={() => setFilter('late')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              filter === 'late'
                ? 'bg-[#c43f17] !text-white border-[#c43f17] shadow-xs'
                : 'bg-white dark:bg-[#1c272c] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#c43f17] hover:text-[#c43f17]'
            }`}
          >
            Atrasados ({lateCount})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
              filter === 'all'
                ? 'bg-[#ff6a36] !text-white border-[#ff6a36] shadow-xs'
                : 'bg-white dark:bg-[#1c272c] text-[#566266] dark:text-[#9cb0b7] border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
            }`}
          >
            Todos ({companies.length})
          </button>
        </div>

        {/* View Switcher & Sorting */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
          {/* Switcher Tabela / Grelha */}
          <div className="inline-flex p-1 rounded-full bg-white dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#ff6a36] !text-white shadow-xs' : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
              }`}
              title="Vista em tabela"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#ff6a36] !text-white shadow-xs' : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
              }`}
              title="Vista em cartões"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5 text-xs text-[#566266] dark:text-[#9cb0b7]">
            <ArrowUpDown size={12} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 bg-[#f6f7f4] dark:bg-[#1c272c] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs font-medium text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#ff6a36] cursor-pointer"
            >
              <option value="name" className="bg-white dark:bg-[#1c272c] text-[#202d32] dark:text-[#f5f7f7]">Nome (A-Z)</option>
              <option value="fee" className="bg-white dark:bg-[#1c272c] text-[#202d32] dark:text-[#f5f7f7]">Mensalidade (€)</option>
              <option value="due" className="bg-white dark:bg-[#1c272c] text-[#202d32] dark:text-[#f5f7f7]">Dia de Vencimento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Card View — Estilo Sector-Card */}
      {viewMode === 'grid' ? (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => {
              const stage = PIPELINE_STAGES.find(s => s.id === company.status);
              const lastPost = company.posts[0];
              const daysAgo = lastPost 
                ? Math.floor((Date.now() - new Date(lastPost.at).getTime()) / (1000 * 60 * 60 * 24))
                : null;
              const isLatePost = daysAgo !== null && daysAgo > (company.cadence || 7);

              return (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className="p-6 rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] bg-[#f6f7f4] dark:bg-[#1c272c] hover:bg-[#fcfcfa] dark:hover:bg-[#223136] hover:border-[#ff6a36] dark:hover:border-[#ff6a36] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c] dark:text-[#ff8f66]">
                        {company.category}
                      </span>
                      <span className="text-[11px] font-medium text-[#566266] dark:text-[#9cb0b7] border border-[#d8dddc] dark:border-[#2a3a41] bg-white dark:bg-[#223136] px-2 py-0.5 rounded-full">
                        {stage?.label || company.status}
                      </span>
                    </div>

                    <h2 className="font-semibold text-base text-[#202d32] dark:text-[#f5f7f7] group-hover:text-[#ff6a36] transition-colors mt-2">
                      {company.name}
                    </h2>
                    <p className="text-xs text-[#566266] dark:text-[#9cb0b7] mt-0.5">{company.city || 'Portugal'}</p>

                    <div className="mt-4 pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-xs">
                      {company.status === 'cliente' ? (
                        <>
                          <span className="text-base font-semibold text-[#202d32] dark:text-[#f5f7f7]">
                            {formatCurrency(company.monthlyFee)}
                            <span className="text-xs font-normal text-[#566266] dark:text-[#9cb0b7]">/mês</span>
                          </span>
                          <span className={`text-[11px] font-medium ${
                            company.paymentStatus === 'pago' 
                              ? 'text-[#236a50] dark:text-[#4ade80]' 
                              : company.paymentStatus === 'atrasado'
                              ? 'text-[#c43f17] dark:text-[#f87171]'
                              : 'text-[#b57a14] dark:text-[#fbbf24]'
                          }`}>
                            {company.paymentStatus === 'pago' ? 'Em dia' : company.paymentStatus === 'atrasado' ? 'Atrasado' : 'Pendente'} (dia {company.dueDay || 5})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#566266] dark:text-[#9cb0b7]">Em prospecção</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41] flex items-center justify-between text-xs text-[#566266] dark:text-[#9cb0b7]">
                    <span>{daysAgo !== null ? `Post há ${daysAgo}d` : 'Sem posts'}</span>
                    <span className="text-[#202d32] dark:text-[#f5f7f7] font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Ver ficha <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#f6f7f4] dark:bg-[#1c272c] rounded-xl border border-[#d8dddc] dark:border-[#2a3a41]">
            <p className="text-sm font-semibold text-[#202d32] dark:text-[#f5f7f7]">Nenhuma empresa registada</p>
            <p className="text-xs text-[#566266] dark:text-[#9cb0b7] mt-1">
              A base de dados está limpa. Clique em &ldquo;Nova Empresa&rdquo; no canto superior para adicionar a sua primeira lead ou cliente.
            </p>
          </div>
        )
      ) : (
        /* Table View */
        <div className="border border-[#d8dddc] dark:border-[#2a3a41] rounded-xl overflow-hidden bg-white dark:bg-[#1c272c]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f6f7f4] dark:bg-[#162024] border-b border-[#d8dddc] dark:border-[#2a3a41] text-[10px] font-bold uppercase tracking-wider text-[#566266] dark:text-[#9cb0b7]">
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Localização &amp; Categoria</th>
                  <th className="py-3 px-4">Contactos</th>
                  <th className="py-3 px-4">Fase</th>
                  <th className="py-3 px-4">Mensalidade</th>
                  <th className="py-3 px-4">Cadência</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dddc] dark:divide-[#2a3a41] text-[#202d32] dark:text-[#f5f7f7]">
                {filtered.map((company) => {
                  const stage = PIPELINE_STAGES.find(s => s.id === company.status);
                  const lastPost = company.posts[0];
                  const daysAgo = lastPost 
                    ? Math.floor((Date.now() - new Date(lastPost.at).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isLatePost = daysAgo !== null && daysAgo > (company.cadence || 7);

                  return (
                    <tr 
                      key={company.id}
                      className="hover:bg-[#f6f7f4] dark:hover:bg-[#223136] transition-colors cursor-pointer group"
                      onClick={() => setSelectedCompanyId(company.id)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#202d32] dark:text-[#f5f7f7] group-hover:text-[#ff6a36]">
                        {company.name}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#566266] dark:text-[#9cb0b7]">
                        <span className="text-[#202d32] dark:text-[#f5f7f7] font-medium">{company.city || '—'}</span>
                        <span className="block text-[11px] text-[#8c999e] dark:text-[#70848c]">{company.category}</span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#566266] dark:text-[#9cb0b7] font-mono">
                        {company.whatsapp || company.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[#566266] dark:text-[#9cb0b7] font-medium">
                          {stage?.label || company.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {company.status === 'cliente' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#202d32] dark:text-[#f5f7f7]">
                              {formatCurrency(company.monthlyFee)}
                            </span>
                            <select
                              value={company.paymentStatus}
                              onChange={(e) => {
                                updateFinance(company.id, company.monthlyFee || 0, company.dueDay || 5, e.target.value as PaymentStatus);
                                showToast(`Estado atualizado para ${company.name}`, 'info');
                              }}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border cursor-pointer focus:outline-none transition-colors ${
                                company.paymentStatus === 'pago'
                                  ? 'bg-[#eaf4ed] text-[#236a50] dark:bg-[#153426] dark:text-[#4ade80] border-[#236a50]/30'
                                  : company.paymentStatus === 'atrasado'
                                  ? 'bg-[#fdf2f0] text-[#c43f17] dark:bg-[#3a1814] dark:text-[#f87171] border-[#c43f17]/30'
                                  : 'bg-[#fef9ee] text-[#b57a14] dark:bg-[#34270f] dark:text-[#fbbf24] border-[#d49622]/30'
                              }`}
                            >
                              <option value="pago" className="bg-white dark:bg-[#1c272c] text-[#236a50] dark:text-[#4ade80]">Pago</option>
                              <option value="pendente" className="bg-white dark:bg-[#1c272c] text-[#b57a14] dark:text-[#fbbf24]">Pendente</option>
                              <option value="atrasado" className="bg-white dark:bg-[#1c272c] text-[#c43f17] dark:text-[#f87171]">Atrasado</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs text-[#8c999e]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {company.status === 'cliente' ? (
                          <span className={isLatePost ? 'text-[#c43f17] dark:text-[#f87171] font-semibold' : 'text-[#566266] dark:text-[#9cb0b7]'}>
                            {daysAgo !== null ? `${daysAgo} dias` : 'Sem post'}
                          </span>
                        ) : (
                          <span className="text-[#8c999e] dark:text-[#70848c]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remover "${company.name}" para a lixeira?`)) {
                              deleteCompany(company.id);
                            }
                          }}
                          className="p-1.5 text-[#8c999e] dark:text-[#70848c] hover:text-[#c43f17] dark:hover:text-[#f87171] rounded transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8c999e] dark:text-[#70848c]">
                      Nenhuma empresa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
