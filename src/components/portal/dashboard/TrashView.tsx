'use client';

import React from 'react';
import { Trash2, RotateCcw, Building2 } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { formatDate } from './utils';

export const TrashView: React.FC = () => {
  const { db, restoreCompany, destroyCompany } = useDashboard();

  const trashedCompanies = db.companies.filter(c => c.deletedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#d8dddc]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5431c]">
          Arquivo de Empresas
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#202d32] tracking-tight mt-0.5">
          Lixeira do Sistema<span className="text-[#c74418]">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#566266] mt-1">
          Empresas removidas temporariamente. Podes restaurar ou eliminar definitivamente.
        </p>
      </div>

      <div className="border border-[#d8dddc] rounded-xl bg-white p-6 space-y-4">
        <div className="border-b border-[#d8dddc] pb-3">
          <h2 className="font-semibold text-sm text-[#202d32]">
            Empresas Arquivadas ({trashedCompanies.length})
          </h2>
        </div>

        {trashedCompanies.length > 0 ? (
          <div className="divide-y divide-[#d8dddc]">
            {trashedCompanies.map(c => (
              <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm text-[#202d32]">{c.name}</div>
                  <div className="text-xs text-[#566266] mt-0.5">
                    {c.category} · {c.city} · Removido em {formatDate(c.deletedAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreCompany(c.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f6f7f4] hover:bg-white hover:border-[#ff6a36] hover:text-[#ff6a36] border border-[#d8dddc] text-[#202d32] text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
                  >
                    <RotateCcw size={13} />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Eliminar definitivamente "${c.name}"? Esta ação não pode ser desfeita.`)) {
                        destroyCompany(c.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#c43f17] text-[#c43f17] hover:bg-[#c43f17] hover:text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#8c999e] text-xs">
            Nenhuma empresa no arquivo.
          </div>
        )}
      </div>
    </div>
  );
};
