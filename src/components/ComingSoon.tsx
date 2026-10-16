'use client';

import Image from 'next/image';
import { ArrowUpRight, Check, Copy, MapPin, MousePointer2, Sparkles } from 'lucide-react';
import { useState } from 'react';

const EMAIL = 'Suporte.draftandrise@gmail.com';
const WHATSAPP_MESSAGE = 'Olá, Draft & Rise! Vi que o site está em atualização e gostava de conversar sobre o meu negócio.';
const WHATSAPP_HREF = `https://wa.me/351933880195?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const EMAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Vamos dar o próximo passo')}&body=${encodeURIComponent('Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar sobre...\n')}`;

export default function ComingSoon() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="coming-soon-page">
      <header className="site-header">
        <a className="wordmark" href="#main-content" aria-label="Draft and Rise — início">
          <Image src="/brand/draft-rise-mark.png" alt="" width={38} height={38} sizes="38px" />
          <span>
            draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span>
          </span>
        </a>
        <div className="coming-soon-badge" aria-live="polite">
          <span className="status-dot status-dot-pulse" />
          <span>Em atualização</span>
        </div>
        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="nav-contact">
          Vamos conversar <ArrowUpRight size={17} />
        </a>
      </header>

      <main id="main-content" tabIndex={-1} className="coming-soon-main">
        <section className="hero coming-soon-hero" aria-labelledby="coming-soon-title">
          <div className="hero-copy coming-soon-copy">
            <p className="hero-intro">
              <span className="status-dot status-dot-pulse" /> Estamos a trabalhar no website · Em breve online
            </p>
            <h1 id="coming-soon-title">
              Estamos a<br />
              preparar algo<br />
              novo<span className="hero-period">.</span>
            </h1>
            <p className="hero-description coming-soon-description">
              O nosso site está a ser trabalhado ao detalhe e estará disponível muito em breve.
              <br />
              Enquanto cuidamos desta nova etapa, continuamos disponíveis para conversar sobre o seu negócio.
            </p>

            <div className="coming-soon-actions">
              <a
                className="button button-dark"
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar pelo WhatsApp <span><ArrowUpRight size={21} /></span>
              </a>

              <div className="coming-soon-email">
                <a href={EMAIL_HREF}>{EMAIL}</a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? 'Email copiado' : 'Copiar endereço de email'}
                  title={copied ? 'Email copiado' : 'Copiar email'}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="hero-visual coming-soon-visual">
            <div className="hero-photo">
              <Image
                src="/images/neighbourhood-cafe.webp"
                alt="Esplanada de um café de bairro, com portas azuis e luz de fim de tarde"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                preload
              />
            </div>
            <div className="hero-sticker" aria-hidden="true">
              <span>Em breve</span>
              <Sparkles strokeWidth={1.5} />
              <span>online.</span>
            </div>
            <div className="location-card">
              <span className="location-icon"><MapPin size={24} /></span>
              <div>
                <span className="location-label">Grandes ideias. Negócios locais.</span>
                <strong>Já voltamos com novidades.</strong>
              </div>
              <span className="location-dot" />
            </div>
            <span className="cursor-note" aria-hidden="true">
              <MousePointer2 size={24} fill="currentColor" />
              <span>A ser trabalhado com intenção</span>
            </span>
            <span className="image-caption">Da rua ao ecrã — muito em breve.</span>
          </div>

          <div className="hero-bottom">
            <span>Estratégia que se vê. Resultados que se sentem.</span>
            <div>
              <span>Presença digital</span>
              <span>Experiência local</span>
              <span>Crescimento</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-shell coming-soon-footer">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Draft & Rise</span>
          <span>Feito com intenção, em Portugal.</span>
          <a href={EMAIL_HREF}>
            Diga-nos olá <ArrowUpRight size={15} />
          </a>
        </div>
      </footer>
    </div>
  );
}

