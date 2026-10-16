import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getEmailHref } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="footer section-shell">
      <div className="footer-top">
        <Link href="/#main-content" className="footer-wordmark" aria-label="Draft and Rise — voltar ao início">
          draft<span>&</span>rise.
        </Link>
        <p>Grandes ideias.<br />Negócios locais.</p>
        <a href="#main-content" className="back-top">Voltar ao topo <ArrowUpRight size={20} /></a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Draft &amp; Rise · Feito com intenção, em Portugal.</span>
        <nav aria-label="Informação legal" className="footer-legal">
          <Link href="/privacidade">Política de Privacidade</Link>
          <Link href="/termos">Condições de Utilização</Link>
        </nav>
        <a href={getEmailHref()}>Diga-nos olá <ArrowUpRight size={15} /></a>
      </div>
    </footer>
  );
}
