'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
    }}>
      <Link className="wordmark" href="/#main-content" aria-label="Draft and Rise — início">
        <Image src="/brand/draft-rise-mark.png" alt="" width={38} height={38} sizes="38px" />
        <span>draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span></span>
      </Link>
      <nav aria-label="Navegação principal" className="desktop-nav">
        <Link href="/#metodologia">O nosso método</Link>
        <Link href="/#solucoes">Serviços</Link>
        <Link href="/#setores">Setores</Link>
        <Link href="/#perguntas-frequentes">Dúvidas</Link>
        <Link href="/questionario">Questionário</Link>
      </nav>
      <Link href="/#contacto" className="nav-contact">Vamos conversar <ArrowUpRight size={17} /></Link>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="mobile-navigation" aria-label="Navegação móvel" className="mobile-nav" hidden={!open}>
        <Link href="/#metodologia" onClick={() => setOpen(false)}>O nosso método <ArrowUpRight /></Link>
        <Link href="/#solucoes" onClick={() => setOpen(false)}>Serviços <ArrowUpRight /></Link>
        <Link href="/#setores" onClick={() => setOpen(false)}>Setores <ArrowUpRight /></Link>
        <Link href="/#perguntas-frequentes" onClick={() => setOpen(false)}>Dúvidas <ArrowUpRight /></Link>
        <Link href="/questionario" onClick={() => setOpen(false)}>Iniciar questionário <ArrowUpRight /></Link>
        <Link href="/#contacto" onClick={() => setOpen(false)}>Vamos conversar <ArrowUpRight /></Link>
      </nav>
    </header>
  );
}
