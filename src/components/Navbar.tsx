import React from 'react';

export default function Navbar() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-secondary/90 px-5 py-4 text-white backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#main-content" className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-secondary">
          <span className="grid size-9 place-items-center rounded-full border border-primary bg-primary text-xs font-black tracking-tight text-white">D&R</span>
          <span className="font-heading text-lg font-semibold tracking-[-0.04em]">Draft &amp; Rise</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
          <a className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white" href="#metodologia">Método</a>
          <a className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white" href="#solucoes">Soluções</a>
        </div>
      </div>
    </nav>
  );
}
