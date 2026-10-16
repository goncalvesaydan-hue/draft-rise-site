import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  getEmailHref,
  getWhatsAppHref,
} from '@/lib/constants';

const EMAIL = CONTACT_EMAIL;
const PHONE = CONTACT_PHONE_DISPLAY;
const MAILTO_HREF = getEmailHref();
const WHATSAPP_HREF = getWhatsAppHref();

export default function MaintenancePage() {
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
            O nosso website está a ser preparado e muito em breve estará online.
            Enquanto isso, pode falar diretamente connosco por WhatsApp ou email.
          </p>
          <div className="maintenance-actions">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark maintenance-cta"
            >
              Falar pelo WhatsApp
              <span>
                <ArrowUpRight size={20} />
              </span>
            </a>
            <a
              href={MAILTO_HREF}
              className="button button-secondary maintenance-cta"
            >
              {EMAIL}
              <span>
                <ArrowUpRight size={20} />
              </span>
            </a>
          </div>
        </div>

        <div className="maintenance-bottom">
          <span>© {new Date().getFullYear()} Draft &amp; Rise</span>
          <span>Grandes ideias. Negócios locais.</span>
          <div className="maintenance-bottom-contacts">
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="maintenance-mail-link">
              {PHONE} <ArrowUpRight size={14} />
            </a>
            <a href={MAILTO_HREF} className="maintenance-mail-link">
              {EMAIL} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

