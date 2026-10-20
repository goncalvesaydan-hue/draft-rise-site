'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/portal/client';
import { DashboardProvider } from './DashboardContext';
import { DashboardView } from './DashboardView';
import { Lock, ArrowLeft } from 'lucide-react';

export function DashboardApp() {
  const [session, setSession] = useState<{
    identity: { id: string; role: string; name: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ identity: { id: string; role: string; name: string } | null }>('/api/session')
      .then((res) => {
        setSession(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao verificar sessão.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#1a2428] text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#253339] border border-[#32454d] flex items-center justify-center p-2 mb-3 shadow-md animate-pulse">
          <Image 
            src="/brand/draft-rise-mark.png" 
            alt="Draft & Rise" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        <div className="font-bold text-sm tracking-wide">draftandrise dashboard</div>
        <div className="text-xs text-[#8c999e] mt-1">A validar credenciais da equipa…</div>
      </div>
    );
  }

  const isTeam = session?.identity?.role === 'team';

  if (!isTeam || error) {
    return (
      <div className="min-h-screen bg-[#141c20] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#253339] border border-[#32454d] flex items-center justify-center p-3 mb-4 shadow-lg shadow-black/30">
          <Image 
            src="/brand/draft-rise-mark.png" 
            alt="Draft & Rise" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-[#ffcaa8] mb-1">
          Área Reservada
        </div>
        <h1 className="text-2xl font-bold mb-2">draftandrise dashboard</h1>
        <p className="text-[#a6b4b9] text-sm max-w-md mb-6 leading-relaxed">
          O painel operacional de gestão de clientes, rankings locais no Google e avenças é de acesso exclusivo à equipa Draft & Rise.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/acesso?tab=team"
            className="px-6 py-2.5 bg-[#ff6a36] hover:bg-[#e85a28] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#ff6a36]/25"
          >
            Iniciar Sessão na Equipa
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#253339] hover:bg-[#304149] text-[#c2cbcf] hover:text-white rounded-xl text-sm font-semibold transition-all border border-[#32454d]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <DashboardView />
    </DashboardProvider>
  );
}
