'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Bot, DownloadCloud, Check } from 'lucide-react';
import { useDashboard } from './DashboardContext';

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultArea: 'prospect' | 'client';
}

export const NewCompanyModal: React.FC<NewCompanyModalProps> = ({ isOpen, onClose, defaultArea }) => {
  const { db, createCompany, setSelectedCompanyId, showToast } = useDashboard();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(db.categories[0] || 'Geral');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(defaultArea === 'client' ? 150 : 0);
  const [dueDay, setDueDay] = useState<number>(5);
  const [area, setArea] = useState<'prospect' | 'client'>(defaultArea);

  const handleAreaChange = (newArea: 'prospect' | 'client') => {
    setArea(newArea);
    if (newArea === 'client' && (!monthlyFee || monthlyFee === 0)) {
      setMonthlyFee(150);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setArea(defaultArea);
      setMonthlyFee(defaultArea === 'client' ? 150 : 0);
      setName('');
      setCity('');
      setPhone('');
      setWhatsapp('');
      setWebsite('');
      setShowIntakePicker(false);
    }
  }, [isOpen, defaultArea]);

  // Integração com Questionários Bot
  const [showIntakePicker, setShowIntakePicker] = useState(false);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loadingIntakes, setLoadingIntakes] = useState(false);

  const loadIntakes = async () => {
    setLoadingIntakes(true);
    try {
      const res = await fetch('/api/intakes');
      if (res.ok) {
        const data = await res.json();
        setIntakes(data.intakes || []);
      }
    } catch {
      // Ignora erro se não autenticado no portal
    } finally {
      setLoadingIntakes(false);
    }
  };

  const handleSelectIntake = (intake: any) => {
    const answers = intake.answers || {};
    const compName = answers['company.name']?.value || intake.owner || '';
    const compCity = answers['company.location']?.value || '';
    const compPhone = answers['contact.phone']?.value || '';
    const compSector = answers['company.sector']?.value || '';

    if (compName) setName(compName);
    if (compCity) setCity(compCity);
    if (compPhone) {
      setPhone(compPhone);
      setWhatsapp(compPhone);
    }
    if (compSector && db.categories.includes(compSector)) {
      setCategory(compSector);
    }

    setShowIntakePicker(false);
    showToast(`Dados de "${compName || 'Questionário'}" importados para o formulário!`, 'info');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = createCompany(
      {
        name: name.trim(),
        category,
        city: city.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        website: website.trim(),
        monthlyFee: Number(monthlyFee) || 0,
        dueDay: Number(dueDay) || 5,
      },
      area
    );

    onClose();
    setSelectedCompanyId(created.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202d32]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="new-company-modal bg-[#fcfcfa] dark:bg-[#1c272c] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[#d8dddc] dark:border-[#2a3a41] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#202d32] dark:bg-[#141c20] text-white flex items-center justify-between border-b border-[#35454b] dark:border-[#2a3a41]">
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-[#ff6a36]" />
            <h2 className="font-semibold text-sm sm:text-base">
              {area === 'client' ? 'Adicionar Novo Cliente' : 'Registar Nova Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 text-[#a6b4b9] hover:text-white grid place-items-center transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Switcher & Bot Import */}
          <div className="space-y-3">
            <div className="relative w-full p-1.5 rounded-full bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] flex select-none">
              {/* Barra Laranja Deslizante (Animated Pill Indicator) */}
              <div
                className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-[#ff6a36] shadow-sm shadow-[#ff6a36]/25 transition-transform duration-250 ease-out pointer-events-none ${
                  area === 'prospect' ? 'translate-x-0' : 'translate-x-full'
                }`}
              />

              {/* Botão Prospecção */}
              <button
                type="button"
                onClick={() => handleAreaChange('prospect')}
                className={`relative z-10 flex-1 py-3 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                  area === 'prospect'
                    ? '!text-white'
                    : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
                }`}
              >
                <span>Prospecção (Lead)</span>
              </button>

              {/* Botão Cliente Ativo */}
              <button
                type="button"
                onClick={() => handleAreaChange('client')}
                className={`relative z-10 flex-1 py-3 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                  area === 'client'
                    ? '!text-white'
                    : 'text-[#566266] dark:text-[#9cb0b7] hover:text-[#202d32] dark:hover:text-[#f5f7f7]'
                }`}
              >
                <span>Cliente Ativo</span>
              </button>
            </div>

            {/* Acesso rápido ao Questionário do Site (Bot) */}
            <button
              type="button"
              onClick={() => {
                if (!showIntakePicker) loadIntakes();
                setShowIntakePicker(!showIntakePicker);
              }}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] dark:hover:border-[#ff6a36] bg-[#f6f7f4]/60 dark:bg-[#141c20]/60 hover:bg-[#ff6a36]/5 dark:hover:bg-[#ff6a36]/10 flex items-center justify-between transition-all cursor-pointer group"
              title="Importar dados de questionário submetido no site"
            >
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#566266] dark:text-[#9cb0b7] group-hover:text-[#202d32] dark:group-hover:text-[#f5f7f7] transition-colors">
                <Bot size={14} className="!text-[#ff6a36] shrink-0" />
                <span>Importar do Questionário Bot</span>
              </span>
              <span className="text-[11px] font-semibold !text-[#ff6a36] group-hover:underline">
                {showIntakePicker ? 'Fechar' : 'Ver fichas'}
              </span>
            </button>
          </div>

          {/* Intake Selector Panel */}
          {showIntakePicker && (
            <div className="p-3 bg-[#f6f7f4] dark:bg-[#141c20] rounded-xl border border-[#d8dddc] dark:border-[#2a3a41] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#202d32] dark:text-[#f5f7f7]">Questionários Recebidos no Site</span>
                <span className="text-[11px] text-[#566266] dark:text-[#9cb0b7]">{intakes.length} disponíveis</span>
              </div>

              {loadingIntakes ? (
                <p className="text-xs text-[#8c999e] dark:text-[#70848c] py-2 text-center">A carregar questionários...</p>
              ) : intakes.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {intakes.map((it) => {
                    const compName = it.answers?.['company.name']?.value || it.owner || 'Sem nome';
                    const compCity = it.answers?.['company.location']?.value || '';
                    return (
                      <div
                        key={it.id}
                        onClick={() => handleSelectIntake(it)}
                        className="p-2 bg-white dark:bg-[#1c272c] rounded-lg border border-[#d8dddc] dark:border-[#2a3a41] hover:border-[#ff6a36] text-xs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <strong className="text-[#202d32] dark:text-[#f5f7f7] block">{compName}</strong>
                          <span className="text-[11px] text-[#566266] dark:text-[#9cb0b7]">{compCity || 'Portugal'} · {it.status}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#ff6a36]">Preencher</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#8c999e] dark:text-[#70848c] py-2 text-center">
                  Nenhum questionário encontrado ou sessão expirada.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Clínica Dentária São Bento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                Categoria / Nicho *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] focus:outline-none focus:border-[#ff6a36]"
              >
                {db.categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                Cidade *
              </label>
              <input
                type="text"
                placeholder="Ex.: Lisboa, Porto..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                Telefone
              </label>
              <input
                type="text"
                placeholder="Ex.: 912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ex.: 912 345 678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
              Website
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-xs sm:text-sm text-[#202d32] dark:text-[#f5f7f7] placeholder:text-[#8c999e] dark:placeholder:text-[#70848c] focus:outline-none focus:border-[#ff6a36]"
            />
          </div>

          {area === 'client' && (
            <div className="pt-2 border-t border-[#d8dddc] dark:border-[#2a3a41] grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                  Avença Mensal (€)
                </label>
                <input
                  type="number"
                  placeholder="150"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-sm font-semibold text-[#202d32] dark:text-[#f5f7f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566266] dark:text-[#9cb0b7] uppercase tracking-wider mb-1">
                  Dia Vencimento
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f6f7f4] dark:bg-[#141c20] border border-[#d8dddc] dark:border-[#2a3a41] rounded-lg text-sm font-semibold text-[#202d32] dark:text-[#f5f7f7]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#d8dddc] dark:border-[#2a3a41]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#d8dddc] dark:border-[#2a3a41] text-xs font-medium text-[#566266] dark:text-[#9cb0b7] hover:bg-[#f6f7f4] dark:hover:bg-[#25353d] hover:text-[#202d32] dark:hover:text-[#f5f7f7] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#ff6a36] hover:bg-[#e85a28] active:bg-[#d64e1e] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Registar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
