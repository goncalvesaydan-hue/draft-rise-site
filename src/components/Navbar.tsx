'use client';

import Image from 'next/image';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
    }}>
      <a className="wordmark" href="#main-content" aria-label="Draft and Rise — início">
        <Image src="/brand/draft-rise-mark.png" alt="" width={38} height={38} sizes="38px" />
        <span>draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span></span>
      </a>
      <nav aria-label="Navegação principal" className="desktop-nav">
        <a href="#metodologia">O nosso método</a>
        <a href="#solucoes">O que fazemos</a>
      </nav>
      <a href="#contacto" className="nav-contact">Vamos conversar <ArrowUpRight size={17} /></a>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="mobile-navigation" aria-label="Navegação móvel" className="mobile-nav" hidden={!open}>
        <a href="#metodologia" onClick={() => setOpen(false)}>O nosso método <ArrowUpRight /></a>
        <a href="#solucoes" onClick={() => setOpen(false)}>O que fazemos <ArrowUpRight /></a>
        <a href="#contacto" onClick={() => setOpen(false)}>Vamos conversar <ArrowUpRight /></a>
      </nav>
    </header>
  );
}
