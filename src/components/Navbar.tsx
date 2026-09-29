import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 top-0 z-50 border-b border-secondary/10 bg-background/85 px-5 py-4 text-secondary backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#main-content" className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-secondary">
          <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white p-1 shadow-sm">
            <Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" priority />
          </span>
          <span className="font-heading text-lg font-semibold tracking-[-0.04em]">Draft <span className="text-primary">&amp;</span> Rise</span>
        </a>
        <div className="flex items-center gap-5 text-sm font-medium text-secondary/65 md:gap-8">
          <a className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary" href="#metodologia">Método</a>
          <a className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary" href="#solucoes">Soluções</a>
          <a href="#contacto" className="hidden rounded-full bg-secondary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary sm:inline-flex">Falar connosco</a>
        </div>
      </div>
    </nav>
  );
}
