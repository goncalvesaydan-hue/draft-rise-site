'use client';

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';

const interests = ['Dar vida ao meu website', 'Ser encontrado no Google', 'Melhorar a experiência', 'Ainda estou a explorar'];

function getEmailHref(interest?: string) {
  const subject = interest ? `Vamos conversar: ${interest}` : 'Vamos dar o próximo passo';
  return `mailto:ola@draftrise.pt?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar sobre...\n')}`;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const emailHref = getEmailHref();
  const message = 'Olá, Draft & Rise! Gostava de saber como podem ajudar o meu negócio.';
  const whatsappHref = `https://wa.me/351933880195?text=${encodeURIComponent(message)}`;
  async function copyEmail() {
    try { await navigator.clipboard.writeText('ola@draftrise.pt'); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <section id="contacto" className="contact section-shell" aria-labelledby="contact-title">
    <div className="contact-top"><p className="section-label"><span /> O próximo passo é nosso.</p><span>Começa com uma conversa.</span></div>
    <div className="contact-heading"><h2 id="contact-title">Vamos pôr o seu<br />negócio no mapa?</h2><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="contact-arrow" aria-label="Iniciar conversa pelo WhatsApp (abre num novo separador)"><ArrowUpRight strokeWidth={1.3} /></a></div>
    <div className="contact-bottom"><fieldset><legend>Por onde quer começar?</legend><div className="interest-chips">{interests.map(interest => <a key={interest} href={getEmailHref(interest)}>{interest}</a>)}</div></fieldset><div className="contact-actions"><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button button-dark">Falar pelo WhatsApp <span><ArrowUpRight size={21} /></span></a><div className="email-copy"><a href={emailHref}>ola@draftrise.pt</a><button type="button" onClick={copyEmail} aria-label={copied ? 'Email copiado' : 'Copiar endereço de email'}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><span className="copy-status" role="status">{copyError ? 'Pode selecionar e copiar o endereço acima.' : copied ? 'Endereço copiado.' : 'Ou envie-nos um email.'}</span></div></div>
  </section>;
}
