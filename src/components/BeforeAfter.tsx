'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

const beforeItems = [
  'Empresa invisível nas pesquisas locais do Google e ultrapassada pela concorrência direta',
  'Sem website próprio ou com uma página antiga, lenta no telemóvel e com textos genéricos',
  'Clientes perdidos no WhatsApp por falta de resposta fora de horas ou em picos de trabalho',
  'Menus em PDF pesados, desatualizados e difíceis de ler no ecrã do telemóvel',
];

const afterItems = [
  'Perfil Google Business no topo do ranking local, com SEO técnico e copywriting que gera chamadas',
  'Website empresarial rápido, persuasivo e desenhado à medida para converter visitas em clientes',
  'WhatsApp Bot 24/7 que responde num segundo, tira dúvidas e qualifica reservas ou orçamentos',
  'Menu online editorial em 4 idiomas, com abertura instantânea por QR Code e fotografias reais',
];

type Side = 'before' | 'after';

export default function BeforeAfter() {
  // Only affects mobile: on desktop both cards are always shown side by side.
  const [side, setSide] = useState<Side>('after');

  return (
    <div className="before-after-wrap">
      <div className="ba-switch" role="group" aria-label="Comparar antes e depois">
        <button type="button" aria-pressed={side === 'before'} onClick={() => setSide('before')}>
          <X size={13} aria-hidden="true" /> Sem presença digital
        </button>
        <button type="button" aria-pressed={side === 'after'} onClick={() => setSide('after')}>
          <Check size={13} aria-hidden="true" /> Com a Draft &amp; Rise
        </button>
      </div>

      <div className="before-after" aria-label="Comparação antes e depois da otimização">
        <div className="before-after-card is-before" data-mobile-hidden={side !== 'before'}>
          <span className="google-presence-caption">Quando a presença digital fica esquecida</span>
          <h4>Um bom negócio que passa despercebido.</h4>
          <ul>
            {beforeItems.map(item => (
              <li key={item}>
                <span className="ba-icon is-muted" aria-hidden="true">
                  <X size={13} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="before-after-card is-after" data-mobile-hidden={side !== 'after'}>
          <span className="google-presence-caption">Com a Draft &amp; Rise</span>
          <h4>Escolhido antes mesmo de ser visitado.</h4>
          <ul>
            {afterItems.map(item => (
              <li key={item}>
                <span className="ba-icon is-active" aria-hidden="true">
                  <Check size={13} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
