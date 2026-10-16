import { ArrowUpRight, Check } from 'lucide-react';
import { getGoogleAuditWhatsAppHref } from '@/lib/constants';
import GoogleAreas from './GoogleAreas';

const pillars = [
  {
    name: 'SEO Local & Subida no Ranking',
    description:
      'Trabalhamos palavras-chave com intenção de compra, categorias estratégicas, geolocalização e sinais de relevância para fazer a sua empresa subir às primeiras posições do Google e Google Maps.',
  },
  {
    name: 'Copywriting que Converte',
    description:
      'Aparecer não chega — é preciso convencer. Escrevemos a descrição da empresa, os serviços, as publicações e as perguntas frequentes com copy persuasivo focado em gerar chamadas, visitas e reservas.',
  },
  {
    name: 'Autoridade & Confiança Contínua',
    description:
      'Reforçamos a credibilidade do negócio perante o algoritmo do Google com fotografias recorrentes, resposta estratégica às avaliações e registo em diretórios e plataformas de referência.',
  },
];

const goals = [
  'Subir posições no ranking local e ultrapassar a concorrência direta',
  'Transformar pesquisas no Google em mais chamadas, mensagens e reservas',
  'Atrair clientes prontos para comprar com copywriting claro e persuasivo',
  'Construir uma reputação sólida que inspira confiança antes da visita',
];

const areas = [
  {
    title: 'SEO Local, Categorias & Palavras-Chave de Intenção',
    text: 'Analisamos como os seus clientes pesquisam na sua zona e otimizamos as categorias principais e secundárias, os atributos do espaço e os termos estratégicos para o Google posicionar o seu negócio no topo.',
  },
  {
    title: 'Copywriting Estratégico (Descrição, Serviços & FAQ)',
    text: 'Reescrevemos a apresentação do seu negócio, estruturamos o catálogo de produtos e serviços com textos apelativos e configuramos as Perguntas e Respostas (Q&A) para eliminar dúvidas e acelerar a decisão do cliente.',
  },
  {
    title: 'Conteúdo Visual, Publicações & Gestão de Avaliações',
    text: 'Publicamos fotografias, vídeos e novidades sobre pratos especiais, eventos ou promoções. Respondemos a todas as avaliações de forma personalizada e estratégica, e registamos o negócio em diretórios locais de autoridade.',
  },
];

export default function GooglePresence() {
  const auditHref = getGoogleAuditWhatsAppHref();

  return (
    <section className="google-presence" aria-labelledby="google-presence-title">
      <div className="google-presence-intro">
        <p className="section-label"><span /> Google Business · Ranking, Copywriting &amp; SEO</p>
        <h3 id="google-presence-title">No topo das pesquisas.<br />À frente da concorrência.</h3>
        <p>
          O Perfil da Empresa no Google é a montra mais valiosa do seu negócio. Combinamos SEO local técnico e copywriting estratégico para aumentar a confiança do Google, subir o seu posicionamento no ranking e fazer com que os clientes o escolham a si.
        </p>
        <div className="google-goals" aria-label="Objetivos do Google Business e SEO">
          {goals.map(goal => (
            <span key={goal} className="google-goal-item">
              <Check size={14} aria-hidden="true" />
              {goal}
            </span>
          ))}
        </div>
        <div className="google-audit-cta">
          <a
            href={auditHref}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-dark"
          >
            Pedir análise gratuita ao meu perfil
            <span>
              <ArrowUpRight size={20} />
            </span>
          </a>
          <span className="google-audit-note">
            Descubra em que posição aparece hoje e como subir no ranking da sua zona.
          </span>
        </div>
      </div>

      <GoogleAreas areas={areas} />

      <div className="google-pillars">
        {pillars.map((pillar, index) => (
          <div key={pillar.name} className="google-pillar-card">
            <span className="google-presence-caption">Pilar 0{index + 1}</span>
            <h4>{pillar.name}</h4>
            <p>{pillar.description}</p>
          </div>
        ))}
      </div>

      <div className="google-presence-process">
        <div>
          <p className="google-presence-caption">Fase 01 · Fundação &amp; SEO</p>
          <h4>Auditoria, Copywriting &amp; Otimização Inicial</h4>
          <p>Reestruturamos todo o perfil: pesquisa de palavras-chave locais, categorias, copywriting da descrição e serviços, horários, links diretos para WhatsApp e perguntas frequentes.</p>
        </div>
        <div>
          <p className="google-presence-caption">Fase 02 · Subida &amp; Consolidação</p>
          <h4>Crescimento no Ranking &amp; Gestão Ativa</h4>
          <p>Alimentamos os sinais que o algoritmo do Google mais valoriza: publicações regulares com copy orientado à ação, imagens atualizadas, resposta estratégica a avaliações e autoridade em diretórios.</p>
        </div>
      </div>
    </section>
  );
}
