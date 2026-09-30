'use client';

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';

const interests = ['Dar vida ao meu website', 'Ser encontrado no Google', 'Melhorar a experiência', 'Ainda estou a explorar'];

export default function Contact() {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const subject = selected ? `Vamos conversar: ${selected}` : 'Vamos dar o próximo passo';
  const emailHref = `mailto:ola@draftrise.pt?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar sobre...\n')}`;
  const message = selected
    ? `Olá, Draft & Rise! Gostava de conversar sobre: ${selected}.`
    : 'Olá, Draft & Rise! Gostava de saber como podem ajudar o meu negócio.';
  const whatsappHref = `https://wa.me/351933880195?text=${encodeURIComponent(message)}`;
  async function copyEmail() {
    try { await navigator.clipboard.writeText('ola@draftrise.pt'); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <section id="contacto" className="contact section-shell" aria-labelledby="contact-title">
    <div className="contact-top"><p className="section-label"><span /> O próximo passo é nosso.</p><span>Começa com uma conversa.</span></div>
    <div className="contact-heading"><h2 id="contact-title">Vamos pôr o seu<br />negócio no mapa?</h2><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="contact-arrow" aria-label="Iniciar conversa pelo WhatsApp (abre num novo separador)"><ArrowUpRight strokeWidth={1.3} /></a></div>
    <div className="contact-bottom"><fieldset><legend>Por onde quer começar?</legend><div className="interest-chips">{interests.map(interest => <button key={interest} type="button" aria-pressed={selected === interest} onClick={() => setSelected(selected === interest ? null : interest)}>{selected === interest && <Check size={14} />}{interest}</button>)}</div></fieldset><div className="contact-actions"><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button button-dark">Falar pelo WhatsApp <span><ArrowUpRight size={21} /></span></a><div className="email-copy"><a href={emailHref}>ola@draftrise.pt</a><button type="button" onClick={copyEmail} aria-label={copied ? 'Email copiado' : 'Copiar endereço de email'}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><span className="copy-status" role="status">{copyError ? 'Pode selecionar e copiar o endereço acima.' : copied ? 'Endereço copiado.' : 'Ou envie-nos um email.'}</span></div></div>
  </section>;
}
