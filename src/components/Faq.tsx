'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Já tenho um Perfil da Empresa no Google. Vocês aproveitam o atual?',
    answer:
      'Sim. Nunca criamos perfis duplicados. Fazemos um diagnóstico ao perfil existente, ajudamos a recuperar ou organizar os acessos se necessário e trabalhamos sobre a base que já tem para conservar todo o histórico e avaliações.',
  },
  {
    question: 'Posso começar apenas pelo Perfil do Google e fazer o website mais tarde?',
    answer:
      'Claro. Cada negócio tem o seu ritmo e as suas prioridades. Podemos começar pela otimização do Perfil da Empresa no Google para gerar impacto imediato nas pesquisas locais e avançar para o website ou automações quando fizer sentido para si.',
  },
  {
    question: 'Em quanto tempo o perfil e o website ficam prontos?',
    answer:
      'A otimização inicial do Perfil da Empresa no Google fica concluída, em média, entre 5 a 10 dias úteis. No caso de um novo website ou sistema de automação, desenhamos e publicamos a estrutura habitualmente entre 2 a 4 semanas, consoante a dimensão do projeto.',
  },
  {
    question: 'Preciso de ter conhecimentos técnicos ou perder tempo com configurações?',
    answer:
      'Não. Tratamos de toda a configuração técnica, estrutura, textos, categorias e ligação ao WhatsApp ou domínio. Só precisamos de uma conversa inicial consigo para conhecer a essência e o funcionamento do seu negócio.',
  },
  {
    question: 'Como funcionam o WhatsApp Bot 24/7 e os Menus Online no dia a dia?',
    answer:
      'O WhatsApp Bot é configurado com as regras, horários e respostas do seu negócio: atende o cliente no segundo seguinte, responde às dúvidas frequentes e recolhe os dados da reserva ou orçamento antes de passar à sua equipa. Já o Menu Online abre instantaneamente por QR Code na mesa ou link no Google e Instagram, suporta vários idiomas e pode ser atualizado sempre que mudar pratos ou preços.',
  },
  {
    question: 'Como funciona o acompanhamento contínuo depois da otimização inicial?',
    answer:
      'O Google valoriza perfis ativos e atualizados. No acompanhamento contínuo, planeamos consigo a publicação recorrente de fotografias, vídeos, novidades e promoções, mantemos horários especiais atualizados e respondemos de forma profissional e estratégica a todas as avaliações.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="perguntas-frequentes" className="faq section-shell" aria-labelledby="faq-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="section-heading">
        <p className="section-label"><span /> Perguntas frequentes</p>
        <h2 id="faq-title">Tudo claro antes<br />do primeiro passo.</h2>
        <p>As respostas às dúvidas mais comuns<br className="desktop-break" /> de quem gere um negócio local.</p>
      </div>

      <div className="faq-list">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className={`method-step faq-item ${isOpen ? 'is-active' : ''}`}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                  onClick={() => setOpenIndex(current => (current === index ? null : index))}
                >
                  <span className="step-number">0{index + 1}</span>
                  <span>{item.question}</span>
                  <span className="step-toggle" aria-hidden="true" />
                </button>
              </h3>
              <div
                id={`faq-content-${index}`}
                className="disclosure-panel"
                data-open={isOpen}
                aria-hidden={!isOpen}
                inert={!isOpen}
              >
                <div className="disclosure-inner">
                  <div className="step-content faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

