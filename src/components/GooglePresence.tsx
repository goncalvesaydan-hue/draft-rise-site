import { Plus } from 'lucide-react';

const areas = [
  {
    title: 'Informação que ajuda a decidir',
    text: 'Revemos horários, contactos, categorias e descrição. Organizamos os produtos e serviços para que seja mais fácil perceber o que o seu negócio oferece e como chegar até si.',
  },
  {
    title: 'Uma presença atualizada',
    text: 'Damos espaço às fotografias, aos vídeos e às novidades do seu negócio. Planeamos conteúdos sobre serviços, eventos ou ofertas para manter o perfil ligado ao que acontece no seu espaço.',
  },
  {
    title: 'Uma reputação acompanhada',
    text: 'Acompanhamos as avaliações e preparamos respostas cuidadas, com a voz do seu negócio. Revemos também a consistência da informação em diretórios e plataformas relevantes.',
  },
];

export default function GooglePresence() {
  return (
    <section className="google-presence" aria-labelledby="google-presence-title">
      <div className="google-presence-intro">
        <p className="section-label"><span /> Perfil da Empresa no Google</p>
        <h3 id="google-presence-title">O seu negócio,<br />mais fácil de encontrar.</h3>
        <p>Antes de uma visita, há uma pesquisa. Organizamos a sua presença no Google para que os clientes encontrem informação clara, conheçam os seus serviços e saibam como chegar até si.</p>
      </div>
      <div className="google-presence-areas">
        <p className="google-presence-caption">O que trabalhamos no seu perfil</p>
        {areas.map(area => (
          <details className="google-presence-detail" key={area.title}>
            <summary>{area.title}<Plus size={18} aria-hidden="true" /></summary>
            <p>{area.text}</p>
          </details>
        ))}
      </div>
      <div className="google-presence-process">
        <div>
          <p className="google-presence-caption">Para começar</p>
          <h4>Otimização inicial</h4>
          <p>Revemos o perfil e organizamos a base: informação essencial, categorias, descrição, produtos e serviços.</p>
        </div>
        <div>
          <p className="google-presence-caption">Para dar continuidade</p>
          <h4>Acompanhamento contínuo</h4>
          <p>Mantemos a informação atualizada, planeamos publicações e acompanhamos as avaliações. O ritmo e o âmbito são definidos consigo.</p>
        </div>
      </div>
    </section>
  );
}
