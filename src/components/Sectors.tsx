import { ArrowUpRight, Briefcase, Scissors, Stethoscope, UtensilsCrossed } from 'lucide-react';
import { getWhatsAppHref } from '@/lib/constants';
import ServicesCarousel from './ServicesCarousel';

const sectors = [
  {
    name: 'Restaurantes, Cafés & Pastelarias',
    focus: 'Menu Online QR · Google Ranking · Reservas no WhatsApp',
    description:
      'Menus digitais que abrem o apetite no telemóvel, subida às primeiras posições quando pesquisam onde comer na zona e respostas automáticas para reservas de mesa.',
    icon: UtensilsCrossed,
    interest: 'Restaurante / Café (Menu Online, Google Ranking e WhatsApp)',
  },
  {
    name: 'Clínicas, Saúde & Bem-Estar',
    focus: 'Website de Autoridade · SEO Local · Triagem WhatsApp Bot',
    description:
      'Websites que transmitem credibilidade clínica desde o primeiro clique, posicionamento no Google por especialidade e bot no WhatsApp para encaminhar marcações 24/7.',
    icon: Stethoscope,
    interest: 'Clínica / Saúde (Website, SEO Local e Bot de Marcações)',
  },
  {
    name: 'Barbearias, Salões & Estética',
    focus: 'Google Business #1 · Marcações WhatsApp · Reputação 5★',
    description:
      'Destaque imediato nas pesquisas locais, catálogo de serviços com copy apelativo e atendimento automático no WhatsApp enquanto a equipa está concentrada nos clientes.',
    icon: Scissors,
    interest: 'Barbearia / Estética (Google Business e Automação WhatsApp)',
  },
  {
    name: 'Empresas, Comércio & Serviços Locais',
    focus: 'Website Empresarial · Copy & SEO · Orçamentos Rápidos',
    description:
      'Presença digital sólida para imobiliárias, oficinas, lojas, hotéis e serviços técnicos que querem ser encontrados primeiro no Google e receber pedidos qualificados.',
    icon: Briefcase,
    interest: 'Empresa / Comércio Local (Website, Google SEO e Automação)',
  },
];

export default function Sectors() {
  return (
    <section id="setores" className="sectors section-shell" aria-labelledby="sectors-title">
      <div className="section-heading">
        <p className="section-label"><span /> Para quem desenhamos</p>
        <h2 id="sectors-title">Pensado para a realidade<br className="desktop-break" /> do seu setor.</h2>
        <p>
          Combinamos os serviços certos para o ritmo<br className="desktop-break" /> e as necessidades do seu tipo de negócio.
        </p>
      </div>

      <ServicesCarousel
        labels={sectors.map(sector => sector.name)}
        gridClassName="sectors-grid"
        groupLabel="Escolher setor"
        itemLabelPrefix="Ver setor"
      >
        {sectors.map(sector => {
          const Icon = sector.icon;
          return (
            <article key={sector.name} className="sector-card">
              <div className="sector-top">
                <span className="sector-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="sector-focus">{sector.focus}</span>
              </div>
              <h3>{sector.name}</h3>
              <p>{sector.description}</p>
              <a
                href={getWhatsAppHref(sector.interest, 'comercial')}
                target="_blank"
                rel="noopener noreferrer"
                className="sector-link"
              >
                Ver solução para o meu setor <ArrowUpRight size={16} />
              </a>
            </article>
          );
        })}
      </ServicesCarousel>
    </section>
  );
}

