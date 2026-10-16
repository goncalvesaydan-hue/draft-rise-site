import {
  ArrowUpRight,
  Bot,
  Globe2,
  MessageCircle,
  QrCode,
  Sparkles,
  Star,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import Contact from './Contact';
import ServiceDetails from './ServiceDetails';
import ServicesCarousel from './ServicesCarousel';
import GooglePresence from './GooglePresence';
import BeforeAfter from './BeforeAfter';
import InteractiveDemo from './InteractiveDemo';
import Sectors from './Sectors';
import Faq from './Faq';

const services = [
  {
    badge: '01 · Produção de Websites',
    title: 'Websites para empresas feitos para converter.',
    description:
      'Desenhamos e desenvolvemos websites rápidos, pensados para telemóvel e com copywriting estratégico. Uma presença própria que transmite autoridade no primeiro segundo e transforma visitas em clientes.',
    icon: Globe2,
    className: 'service-web',
    tags: 'Websites empresariais · Copywriting · SEO técnico · Mobile-first',
    offerings: [
      {
        title: 'Design à medida da sua empresa',
        text: 'Nada de modelos genéricos. Criamos uma estrutura clara, rápida no telemóvel e alinhada com a identidade do seu negócio.',
      },
      {
        title: 'Copywriting & SEO de raiz',
        text: 'Escrevemos textos persuasivos que explicam o valor da sua empresa sem rodeios e preparamos toda a base de SEO para o Google.',
      },
      {
        title: 'Foco em chamadas, reservas e orçamentos',
        text: 'Botões de ação no lugar certo, integração direta com WhatsApp e percursos curtos até ao contacto.',
      },
    ],
  },
  {
    badge: '02 · Google Business · Ranking & SEO',
    title: 'Suba no ranking do Google e lidere a sua zona.',
    description:
      'Quem procura pelo seu serviço no Google já quer comprar. Trabalhamos o SEO local e o copywriting do seu Perfil da Empresa para o fazer subir posições e ser escolhido antes da concorrência.',
    icon: TrendingUp,
    className: 'service-reputation',
    tags: 'Subida no ranking · SEO local · Copywriting persuasivo · Google Maps',
    offerings: [
      {
        title: 'Subida real no ranking local',
        text: 'Otimizamos categorias, palavras-chave de intenção de compra e sinais geográficos para posicionar a sua empresa nas primeiras pesquisas.',
      },
      {
        title: 'Copywriting que atrai cliques e chamadas',
        text: 'Descrições de empresa, serviços, publicações e respostas escritas de forma estratégica para convencer tanto o cliente como o algoritmo.',
      },
      {
        title: 'Gestão ativa de autoridade e avaliações',
        text: 'Fotografias recorrentes, perguntas e respostas otimizadas, resposta estratégica a críticas e registo em diretórios locais.',
      },
    ],
  },
  {
    badge: '03 · Automação de WhatsApp Bot',
    title: 'Um bot no WhatsApp que atende e qualifica 24/7.',
    description:
      'Nunca mais perca um cliente por demora na resposta. Criamos automações e bots inteligentes no WhatsApp que respondem no segundo seguinte, tiram dúvidas e organizam marcações ou pedidos.',
    icon: Bot,
    className: 'service-experience',
    tags: 'WhatsApp Bot · Atendimento 24/7 · Triagem de clientes · Marcações',
    offerings: [
      {
        title: 'Resposta imediata a qualquer hora',
        text: 'Mesmo fora do horário ou em horas de ponta, o cliente recebe atenção instantânea com a voz da sua empresa.',
      },
      {
        title: 'Qualificação e filtragem inteligente',
        text: 'O bot apresenta serviços, responde às dúvidas mais frequentes, recolhe os dados necessários e encaminha apenas os pedidos prontos para a equipa.',
      },
      {
        title: 'Mais vendas com menos trabalho manual',
        text: 'Automatize confirmações, envio de catálogos, orçamentos iniciais ou marcações sem prender a sua equipa ao telemóvel.',
      },
    ],
  },
  {
    badge: '04 · Menus Online para Restaurantes',
    title: 'Menus digitais que abrem o apetite e aumentam o pedido.',
    description:
      'Substitua os PDFs lentos e difíceis de ler por um menu online rápido, visual e pensado para restaurantes, cafés e pastelarias. Acessível por QR Code na mesa, no Instagram ou no Google.',
    icon: UtensilsCrossed,
    className: 'service-menu',
    tags: 'Menus digitais · QR Code na mesa · Restauração · Sempre atualizado',
    offerings: [
      {
        title: 'Abertura instantânea no telemóvel',
        text: 'Sem aplicações para descarregar nem zoom em ficheiros pesados. O cliente abre o menu num segundo e navega por categorias claras.',
      },
      {
        title: 'Fotografia, copy gastronómico e destaques',
        text: 'Descrições que dão vontade de provar, destaque para pratos do dia, entradas, sobremesas, sugestões do chef e informação de alergénios.',
      },
      {
        title: 'Atualização simples e ligação ao Google',
        text: 'Altere preços ou pratos sazonais sempre que precisar e ligue o menu diretamente ao seu Perfil da Empresa no Google e redes sociais.',
      },
    ],
  },
];

export default function Tangibility() {
  return (
    <>
      <section id="solucoes" className="solutions section-shell" aria-labelledby="solutions-title">
        <div className="solutions-heading">
          <div>
            <p className="section-label"><span /> Os nossos serviços principais</p>
            <h2 id="solutions-title">Quatro frentes para fazer<br />o seu negócio crescer.</h2>
          </div>
          <p>
            Websites de alta conversão, subida no ranking do Google,<br className="desktop-break" />{' '}
            automação de WhatsApp e menus digitais para restauração.
          </p>
        </div>

        <ServicesCarousel labels={services.map(service => service.title)}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article className={`service-card ${service.className}`} key={service.title}>
                <div className="service-art" aria-hidden="true">
                  {index === 0 && (
                    <div className="mini-browser">
                      <div className="browser-chrome">
                        <i /><i /><i />
                        <span>a-sua-empresa.pt</span>
                      </div>
                      <div className="browser-body">
                        <Globe2 size={34} strokeWidth={1.3} />
                        <span>Presença que<br />gera clientes.</span>
                        <div className="browser-button"><ArrowUpRight size={17} /></div>
                      </div>
                      <div className="map-tag"><Sparkles size={14} /> Copy &amp; SEO incluídos</div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="reputation-art">
                      <span className="reputation-star">
                        <TrendingUp size={58} strokeWidth={1.3} />
                      </span>
                      <span className="reputation-note">
                        #1 nas pesquisas<br />da sua zona.
                      </span>
                      <span className="reputation-rating">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                        <strong className="rating-badge">SEO + Copy</strong>
                      </span>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="appointment-art">
                      <span className="appointment-zap"><Zap size={25} /></span>
                      <span className="appointment-title">24/7</span>
                      <div className="appointment-line">
                        <span>WhatsApp Bot ativo</span>
                        <CheckMark />
                      </div>
                      <div className="appointment-message">
                        <MessageCircle size={18} />
                        <span>
                          Resposta em segundos.<br />
                          <strong>Cliente qualificado.</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {index === 3 && (
                    <div className="menu-art">
                      <span className="menu-qr-badge">
                        <QrCode size={22} />
                      </span>
                      <div className="menu-art-header">
                        <span>Menu Online</span>
                        <strong>Casa cheia.</strong>
                      </div>
                      <div className="menu-art-items">
                        <div className="menu-art-row">
                          <span>Especialidade da casa</span>
                          <strong>Destaque ★</strong>
                        </div>
                        <div className="menu-art-row">
                          <span>Acesso rápido por QR</span>
                          <strong>Sem PDF</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="service-content">
                  <div className="service-meta">
                    <Icon className="service-icon" size={20} />
                    <span className="service-badge">{service.badge}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ServiceDetails details="" tags={service.tags}>
                    <div className="service-offerings">
                      {service.offerings.map(item => (
                        <div key={item.title}>
                          <h4>{item.title}</h4>
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </ServiceDetails>
                </div>
              </article>
            );
          })}
        </ServicesCarousel>

        <GooglePresence />
        <InteractiveDemo />
        <BeforeAfter />
      </section>

      <Sectors />

      <section className="manifesto section-shell">
        <span className="manifesto-symbol" aria-hidden="true">&amp;</span>
        <div>
          <p>O que nos move</p>
          <h2>
            Por trás de cada negócio,<br />
            há alguém que acredita.<br />
            Nós também.
          </h2>
        </div>
        <p className="manifesto-copy">
          Trabalhamos perto de quem faz acontecer. Ouvimos primeiro, escrevemos com intenção e construímos ferramentas que trazem resultados reais ao dia a dia da sua empresa.
        </p>
      </section>

      <Faq />
      <Contact />
    </>
  );
}

function CheckMark() {
  return <span className="appointment-check">✓</span>;
}
