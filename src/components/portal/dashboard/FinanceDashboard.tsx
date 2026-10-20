'use client';

import React, { useState, useMemo } from 'react';
import { 
  BadgeEuro, 
  TrendingUp, 
  Building2,
  Check,
  MessageSquare
} from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { formatCurrency } from './utils';
import { PaymentStatus } from './types';

export const FinanceDashboard: React.FC = () => {
  const { db, updateFinance, setSelectedCompanyId, showToast } = useDashboard();
  const [filter, setFilter] = useState<'all' | 'pago' | 'pendente' | 'atrasado'>('all');

  const activeClients = db.companies.filter(c => !c.deletedAt && c.status === 'cliente');

  const totalMrr = activeClients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
  const annualProjection = totalMrr * 12;
  const avgTicket = activeClients.length > 0 ? Math.round(totalMrr / activeClients.length) : 0;

  const paidClients = activeClients.filter(c => c.paymentStatus === 'pago');
  const paidTotal = paidClients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);

  const pendingClients = activeClients.filter(c => c.paymentStatus === 'pendente');
  const pendingTotal = pendingClients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);

  const lateClients = activeClients.filter(c => c.paymentStatus === 'atrasado');
  const lateTotal = lateClients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0);

  const collectionRate = totalMrr > 0 ? Math.round((paidTotal / totalMrr) * 100) : 0;

  const filteredClients = useMemo(() => {
    if (filter === 'all') return activeClients;
    return activeClients.filter(c => c.paymentStatus === filter);
  }, [activeClients, filter]);

  const handleMarkPaid = (clientId: string, clientName: string, fee: number, due: number) => {
    updateFinance(clientId, fee, due, 'pago');
    showToast(`Pagamento de ${formatCurrency(fee)} registado para ${clientName}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#d8dddc]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
            Faturação Recorrente
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] tracking-tight mt-0.5">
            Controlo de Avenças<span className="text-[#c74418]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#566266] mt-1">
            Gestão de mensalidades, vencimentos e histórico de recebimentos.
          </p>
        </div>

        <div className="bg-[#f6f7f4] px-4 py-2 rounded-xl border border-[#d8dddc] text-xs self-start sm:self-auto">
          <span className="text-[#566266]">Ticket médio: </span>
          <strong className="text-[#202d32] font-semibold">{formatCurrency(avgTicket)}/mês</strong>
        </div>
      </div>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
            MRR Total
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#202d32] mt-1.5 sm:mt-2 tracking-tight">
            {formatCurrency(totalMrr)}
          </div>
          <p className="text-[10px] sm:text-xs text-[#566266] mt-2 pt-2 border-t border-[#d8dddc] truncate">
            {activeClients.length} contratos ativos
          </p>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#236a50]">
            Recebido no Mês
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#236a50] mt-1.5 sm:mt-2 tracking-tight">
            {formatCurrency(paidTotal)}
          </div>
          <p className="text-[10px] sm:text-xs text-[#566266] mt-2 pt-2 border-t border-[#d8dddc] truncate">
            {paidClients.length}/{activeClients.length} ({collectionRate}%)
          </p>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#c43f17]">
            Por Liquidar
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#c43f17] mt-1.5 sm:mt-2 tracking-tight">
            {formatCurrency(lateTotal + pendingTotal)}
          </div>
          <p className="text-[10px] sm:text-xs text-[#566266] mt-2 pt-2 border-t border-[#d8dddc] truncate">
            {lateClients.length} atrasados
          </p>
        </div>

        <div className="p-3.5 sm:p-6 rounded-xl border border-[#d8dddc] bg-[#f6f7f4] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#566266]">
            Projeção Anual
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-[#202d32] mt-1.5 sm:mt-2 tracking-tight">
            {formatCurrency(annualProjection)}
          </div>
          <p className="text-[10px] sm:text-xs text-[#566266] mt-2 pt-2 border-t border-[#d8dddc] truncate">
            ARR (MRR × 12)
          </p>
        </div>
      </div>

      {/* Barra de Cobrança do Mês */}
      <div className="p-5 rounded-xl border border-[#d8dddc] bg-[#fcfcfa] space-y-2">
        <div className="flex items-center justify-between text-xs text-[#566266]">
          <span>Cobrança do mês corrente: <strong className="text-[#202d32]">{collectionRate}%</strong></span>
          <span>{formatCurrency(paidTotal)} de {formatCurrency(totalMrr)}</span>
        </div>
        <div className="h-2 w-full bg-[#f6f7f4] border border-[#d8dddc] rounded-full overflow-hidden">
          <div 
            style={{ width: `${collectionRate}%` }} 
            className="h-full bg-[#236a50] rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Tabela de Clientes e Pagamentos */}
      <div className="border border-[#d8dddc] rounded-xl overflow-hidden bg-white">
        <div className="p-4 bg-[#f6f7f4] border-b border-[#d8dddc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-sm text-[#202d32]">Mensalidades por Cliente</h2>
          </div>

          {/* Filter Pills com Alta Visibilidade */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border shrink-0 ${
                filter === 'all' ? 'bg-[#ff6a36] text-white border-[#ff6a36] shadow-xs' : 'bg-white text-[#566266] border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#202d32]'
              }`}
            >
              Todos ({activeClients.length})
            </button>
            <button
              onClick={() => setFilter('pago')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border shrink-0 ${
                filter === 'pago' ? 'bg-[#236a50] text-white border-[#236a50] shadow-xs' : 'bg-white text-[#566266] border-[#d8dddc] hover:border-[#236a50] hover:text-[#236a50]'
              }`}
            >
              Pagos ({paidClients.length})
            </button>
            <button
              onClick={() => setFilter('pendente')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border shrink-0 ${
                filter === 'pendente' ? 'bg-[#ff6a36] text-white border-[#ff6a36] shadow-xs' : 'bg-white text-[#566266] border-[#d8dddc] hover:border-[#ff6a36] hover:text-[#202d32]'
              }`}
            >
              Pendentes ({pendingClients.length})
            </button>
            <button
              onClick={() => setFilter('atrasado')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border shrink-0 ${
                filter === 'atrasado' ? 'bg-[#c43f17] text-white border-[#c43f17] shadow-xs' : 'bg-white text-[#566266] border-[#d8dddc] hover:border-[#c43f17] hover:text-[#c43f17]'
              }`}
            >
              Atrasados ({lateClients.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#fcfcfa] border-b border-[#d8dddc] text-[10px] font-bold uppercase tracking-wider text-[#566266]">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Mensalidade</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dddc]">
              {filteredClients.map((client) => {
                const politeMsg = `Olá ${client.name}! Da equipa Draft & Rise, enviamos este lembrete relativo ao vencimento da avença mensal de ${formatCurrency(client.monthlyFee)}. Caso já tenham efetuado a transferência, por favor desconsiderem. Muito obrigado!`;

                return (
                  <tr 
                    key={client.id}
                    className="hover:bg-[#f6f7f4] transition-colors cursor-pointer group"
                    onClick={() => setSelectedCompanyId(client.id)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#202d32] group-hover:text-[#ff6a36]">
                      {client.name}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-[#566266]">{client.city || '—'}</td>

                    <td className="py-3.5 px-4 text-xs text-[#202d32]">
                      Dia {client.dueDay || 5}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#202d32]">
                      {formatCurrency(client.monthlyFee)}
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={client.paymentStatus}
                        onChange={(e) => {
                          updateFinance(client.id, client.monthlyFee || 0, client.dueDay || 5, e.target.value as PaymentStatus);
                          showToast(`Estado de ${client.name} atualizado`, 'info');
                        }}
                        className="text-xs p-1 bg-[#f6f7f4] border border-[#d8dddc] rounded cursor-pointer focus:outline-none focus:border-[#ff6a36]"
                      >
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                        <option value="atrasado">Atrasado</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {client.paymentStatus !== 'pago' && client.whatsapp && (
                          <a
                            href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(politeMsg)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#566266] hover:text-[#ff6a36] hover:bg-white rounded transition-colors"
                            title="Enviar lembrete amigável via WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>
                        )}

                        {client.paymentStatus !== 'pago' ? (
                          <button
                            onClick={() => handleMarkPaid(client.id, client.name, client.monthlyFee || 0, client.dueDay || 5)}
                            className="px-3.5 py-1.5 rounded-full bg-[#236a50] hover:bg-[#1b523e] active:bg-[#154131] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            Marcar pago
                          </button>
                        ) : (
                          <span className="text-xs text-[#236a50] font-medium inline-flex items-center gap-1">
                            <Check size={12} /> Pago
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8c999e]">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
