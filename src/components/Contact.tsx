'use client';

import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';

const interests = ['Dar vida ao meu website', 'Ser encontrado no Google', 'Melhorar a experiência', 'Ainda estou a explorar'];

export default function Contact() {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const subject = selected ? `Vamos conversar: ${selected}` : 'Vamos dar o próximo passo';
  const href = `mailto:ola@draftrise.pt?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Olá, Draft & Rise!\n\nO meu negócio chama-se...\n\nGostava de conversar sobre...\n')}`;
  async function copyEmail() {
    try { await navigator.clipboard.writeText('ola@draftrise.pt'); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <section id="contacto" className="contact section-shell" aria-labelledby="contact-title">
    <div className="contact-top"><p className="section-label"><span /> O próximo passo é nosso.</p><span>Começa com uma conversa.</span></div>
    <div className="contact-heading"><h2 id="contact-title">Vamos pôr o seu<br />negócio no mapa?</h2><a href={href} className="contact-arrow" aria-label="Iniciar conversa por email"><ArrowUpRight strokeWidth={1.3} /></a></div>
    <div className="contact-bottom"><fieldset><legend>Por onde quer começar?</legend><div className="interest-chips">{interests.map(interest => <button key={interest} type="button" aria-pressed={selected === interest} onClick={() => setSelected(selected === interest ? null : interest)}>{selected === interest && <Check size={14} />}{interest}</button>)}</div></fieldset><div className="contact-actions"><a href={href} className="button button-dark">Vamos conversar <span><ArrowUpRight size={21} /></span></a><div className="email-copy"><a href="mailto:ola@draftrise.pt">ola@draftrise.pt</a><button type="button" onClick={copyEmail} aria-label={copied ? 'Email copiado' : 'Copiar endereço de email'}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div><span className="copy-status" role="status">{copyError ? 'Pode selecionar e copiar o endereço acima.' : copied ? 'Endereço copiado.' : 'Abre a sua aplicação de email.'}</span></div></div>
  </section>;
}
