'use client';

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  type DepartmentKey,
  getEmailHref,
  getWhatsAppHref,
} from '@/lib/constants';

const interests = [
  'Produção de Website para Empresa',
  'Google Business (Subir no Ranking, Copy & SEO)',
  'Automação de WhatsApp Bot',
  'Menu Online para Restaurante',
];

const departments: { id: DepartmentKey; label: string }[] = [
  { id: 'comercial', label: 'Novos projetos' },
  { id: 'suporte', label: 'Já sou cliente · Suporte' },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [department, setDepartment] = useState<DepartmentKey>('comercial');

  const emailHref = getEmailHref(selectedInterests, department);
  const whatsappHref = getWhatsAppHref(selectedInterests, department);

  function toggleInterest(interest: string) {
    setSelectedInterests(current =>
      current.includes(interest)
        ? current.filter(item => item !== interest)
        : [...current, interest],
    );
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <section id="contacto" className="contact section-shell" aria-labelledby="contact-title">
      <div className="contact-top">
        <p className="section-label"><span /> O próximo passo é nosso.</p>
        <div className="department-switch" role="group" aria-label="Escolher departamento de contacto">
          {departments.map(item => (
            <button
              key={item.id}
              type="button"
              className="department-pill"
              aria-pressed={department === item.id}
              onClick={() => setDepartment(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="contact-heading">
        <h2 id="contact-title">Vamos pôr o seu<br />negócio no mapa?</h2>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-arrow"
          aria-label="Iniciar conversa pelo WhatsApp (abre num novo separador)"
        >
          <ArrowUpRight strokeWidth={1.3} />
        </a>
      </div>

      <div className="contact-bottom">
        <fieldset>
          <legend>
            Por onde quer começar?{' '}
            <span className="legend-hint">(pode escolher um ou mais temas)</span>
          </legend>
          <div className="interest-chips">
            {interests.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleInterest(interest)}
                >
                  {isSelected && <Check size={13} aria-hidden="true" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="contact-actions">
          <div className="contact-buttons">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark"
            >
              {department === 'suporte' ? 'Falar com o suporte' : 'Falar pelo WhatsApp'}{' '}
              <span><ArrowUpRight size={21} /></span>
            </a>
          </div>
          <div className="contact-direct-links">
            <div className="email-copy">
              <a href={emailHref}>{CONTACT_EMAIL}</a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? 'Email copiado' : 'Copiar endereço de email'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <span className="contact-divider" aria-hidden="true">·</span>
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="contact-phone-link"
              aria-label={`Ligar para ${CONTACT_PHONE_DISPLAY}`}
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
          <span className="copy-status" role="status">
            {copyError
              ? 'Pode selecionar e copiar o endereço acima.'
              : copied
                ? 'Endereço copiado.'
                : selectedInterests.length > 0
                  ? `${selectedInterests.length} ${selectedInterests.length === 1 ? 'tema incluído' : 'temas incluídos'} na mensagem de WhatsApp e email.`
                  : 'Ou fale connosco diretamente por email ou telefone.'}
          </span>
        </div>
      </div>
    </section>
  );
}
