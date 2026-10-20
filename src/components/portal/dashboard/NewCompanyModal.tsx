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
    <div className="fixed inset-0 z-50 bg-[#202d32]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfcfa] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[#d8dddc] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#202d32] text-white flex items-center justify-between border-b border-[#35454b]">
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-[#ff6a36]" />
            <h2 className="font-semibold text-sm">
              {area === 'client' ? 'Adicionar Novo Cliente' : 'Registar Nova Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 text-[#a6b4b9] hover:text-white grid place-items-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Switcher & Bot Import */}
          <div className="flex items-center gap-2">
            <div className="inline-flex flex-1 p-1 rounded-full bg-[#f6f7f4] border border-[#d8dddc]">
              <button
                type="button"
                onClick={() => setArea('prospect')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  area === 'prospect' ? 'bg-[#ff6a36] text-white shadow-xs' : 'text-[#566266] hover:text-[#202d32]'
                }`}
              >
                Prospecção (Lead)
              </button>
              <button
                type="button"
                onClick={() => setArea('client')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  area === 'client' ? 'bg-[#ff6a36] text-white shadow-xs' : 'text-[#566266] hover:text-[#202d32]'
                }`}
              >
                Cliente Ativo
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!showIntakePicker) loadIntakes();
                setShowIntakePicker(!showIntakePicker);
              }}
              className="px-3 py-1.5 rounded-full border border-[#d8dddc] hover:border-[#ff6a36] text-xs font-semibold text-[#202d32] hover:text-[#ff6a36] bg-[#f6f7f4] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Importar dados de questionário submetido no site"
            >
              <Bot size={13} className="text-[#ff6a36]" />
              <span className="hidden sm:inline">Do Bot</span>
            </button>
          </div>

          {/* Intake Selector Panel */}
          {showIntakePicker && (
            <div className="p-3 bg-[#f6f7f4] rounded-xl border border-[#d8dddc] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#202d32]">Questionários Recebidos no Site</span>
                <span className="text-[11px] text-[#566266]">{intakes.length} disponíveis</span>
              </div>

              {loadingIntakes ? (
                <p className="text-xs text-[#8c999e] py-2 text-center">A carregar questionários...</p>
              ) : intakes.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {intakes.map((it) => {
                    const compName = it.answers?.['company.name']?.value || it.owner || 'Sem nome';
                    const compCity = it.answers?.['company.location']?.value || '';
                    return (
                      <div
                        key={it.id}
                        onClick={() => handleSelectIntake(it)}
                        className="p-2 bg-white rounded-lg border border-[#d8dddc] hover:border-[#ff6a36] text-xs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <strong className="text-[#202d32] block">{compName}</strong>
                          <span className="text-[11px] text-[#566266]">{compCity || 'Portugal'} · {it.status}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#ff6a36]">Preencher</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#8c999e] py-2 text-center">
                  Nenhum questionário encontrado ou sessão expirada.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Clínica Dentária São Bento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                Categoria / Nicho *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              >
                {db.categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                Cidade *
              </label>
              <input
                type="text"
                placeholder="Ex.: Lisboa, Porto..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                Telefone
              </label>
              <input
                type="text"
                placeholder="Ex.: 912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ex.: 912 345 678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
              Website
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-xs sm:text-sm text-[#202d32] focus:outline-none focus:border-[#ff6a36]"
            />
          </div>

          {area === 'client' && (
            <div className="pt-2 border-t border-[#d8dddc] grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                  Avença Mensal (€)
                </label>
                <input
                  type="number"
                  placeholder="150"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-sm font-semibold text-[#202d32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566266] uppercase tracking-wider mb-1">
                  Dia Vencimento
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f6f7f4] border border-[#d8dddc] rounded-lg text-sm font-semibold text-[#202d32]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#d8dddc]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#d8dddc] text-xs font-medium text-[#566266] hover:bg-[#f6f7f4] hover:text-[#202d32] transition-colors cursor-pointer"
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
