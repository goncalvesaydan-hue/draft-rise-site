import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const EMAIL = 'geral@draftandrise.com';
const EMAIL_SUBJECT = 'Vamos conversar — Draft & Rise';
const EMAIL_BODY =
  'Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar convosco sobre...\n';
const MAILTO_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;

export default function Home() {
  return (
    <main id="main-content" className="maintenance-screen">
      <div className="maintenance-card">
        <div className="maintenance-top">
          <div className="wordmark" aria-label="Draft and Rise">
            <Image src="/brand/draft-rise-mark.png" alt="" width={36} height={36} sizes="36px" />
            <span>
              draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span>
            </span>
          </div>
          <span className="maintenance-pill">
            <span className="status-dot status-dot-pulse" />
            Em construção
          </span>
        </div>

        <div className="maintenance-center">
          <p className="maintenance-kicker">Estamos a trabalhar no site</p>
          <h1>
            Pronto em breve<span className="hero-period">.</span>
          </h1>
          <p className="maintenance-text">
            O nosso website está a ser trabalhado e muito em breve estará online.
            Enquanto isso, pode falar diretamente connosco por email.
          </p>
          <a href={MAILTO_HREF} className="button button-dark maintenance-cta">
            {EMAIL}
            <span>
              <ArrowUpRight size={20} />
            </span>
          </a>
        </div>

        <div className="maintenance-bottom">
          <span>© {new Date().getFullYear()} Draft & Rise</span>
          <span>Grandes ideias. Negócios locais.</span>
          <a href={MAILTO_HREF} className="maintenance-mail-link">
            {EMAIL} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </main>
  );
}
