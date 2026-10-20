'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { CompanyStatus } from './types';

interface LossReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
  targetStatus: CompanyStatus;
}

export const LossReasonModal: React.FC<LossReasonModalProps> = ({
  isOpen,
  onClose,
  companyId,
  targetStatus
}) => {
  const { db, moveCompanyStatus } = useDashboard();
  const [selectedReason, setSelectedReason] = useState(db.reasons[0] || 'Preço / Orçamento');
  const [reasonDetail, setReasonDetail] = useState('');

  if (!isOpen || !companyId) return null;

  const company = db.companies.find(c => c.id === companyId);
  if (!company) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    moveCompanyStatus(company.id, targetStatus, selectedReason, reasonDetail.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202d32]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfcfa] dark:bg-[#1c272c] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[#d8dddc] dark:border-[#2a3a41]">
        <div className="p-5 bg-[#202d32] dark:bg-[#141c20] text-white flex items-center justify-between border-b border-[#35454b] dark:border-[#2a3a41]">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-[#c74418]" />
            <h2 className="font-semibold text-sm">
              Motivo de {targetStatus === 'perdido' ? 'Perda' : 'Abandono'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 text-[#a6b4b9] hover:text-white grid place-items-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#566266] dark:text-[#9cb0b7] leading-relaxed">
            A empresa <strong className="text-[#202d32] dark:text-[#f5f7f7]">{company.name}</strong> está a ser movida para <strong className="text-[#c43f17] dark:text-[#ff8f66]">{targetStatus}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
              Motivo Principal *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#c43f17]"
            >
              {db.reasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
              Observações
            </label>
            <textarea
              rows={3}
              placeholder="Ex.: Achou o orçamento elevado, pediu contacto daqui a 6 meses..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#c43f17]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#d8dddc] dark:border-[#2a3a41]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#d8dddc] dark:border-[#2a3a41] text-xs font-medium text-[#566266] dark:text-[#9cb0b7] hover:bg-[#f6f7f4] dark:hover:bg-[#25353d] hover:text-[#202d32] dark:hover:text-[#f5f7f7] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#c43f17] hover:bg-[#a83412] active:bg-[#8f2b0f] !text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
