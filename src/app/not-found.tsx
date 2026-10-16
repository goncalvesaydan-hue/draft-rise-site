import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT_EMAIL, getEmailHref } from '@/lib/constants';

export default function NotFound() {
  return (
    <main id="main-content" className="maintenance-screen">
      <div className="maintenance-card">
        <div className="maintenance-top">
          <Link href="/" className="wordmark" aria-label="Draft and Rise — início">
            <Image src="/brand/draft-rise-mark.png" alt="" width={36} height={36} sizes="36px" />
            <span>
              draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span>
            </span>
          </Link>
          <span className="maintenance-pill">
            <span className="status-dot" />
            Erro 404
          </span>
        </div>

        <div className="maintenance-center">
          <p className="maintenance-kicker">Página não encontrada</p>
          <h1>
            Esta página<br />
            mudou de rua<span className="hero-period">.</span>
          </h1>
          <p className="maintenance-text">
            O endereço que procura não existe ou foi alterado. Mas o caminho de regresso ao início é simples.
          </p>
          <Link href="/" className="button button-dark maintenance-cta">
            Voltar à página inicial
            <span>
              <ArrowUpRight size={20} />
            </span>
          </Link>
        </div>

        <div className="maintenance-bottom">
          <span>© {new Date().getFullYear()} Draft & Rise</span>
          <span>Grandes ideias. Negócios locais.</span>
          <a href={getEmailHref()} className="maintenance-mail-link">
            {CONTACT_EMAIL} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}

