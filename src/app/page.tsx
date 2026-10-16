import Image from 'next/image';

export default function Home() {
  return (
    <main id="main-content" className="maintenance-screen">
      <div className="maintenance-card">
        <div className="maintenance-top">
          <div className="wordmark" aria-label="Draft and Rise">
            <Image src="/brand/draft-rise-mark.png" alt="" width={36} height={36} sizes="36px" />
            <span>
              draft<span className="wordmark-amp">&</span>rise<span className="wordmark-dot">.</span>
            </span>
          </div>
          <span className="maintenance-pill">
            <span className="status-dot status-dot-pulse" />
            Em construção
          </span>
        </div>

        <div className="maintenance-center">
          <p className="maintenance-kicker">Estamos a trabalhar no site</p>
          <h1>
            Pronto em breve<span className="hero-period">.</span>
          </h1>
          <p className="maintenance-text">
            O nosso website está a ser trabalhado e muito em breve estará online.
          </p>
        </div>

        <div className="maintenance-bottom">
          <span>© {new Date().getFullYear()} Draft & Rise</span>
          <span>Grandes ideias. Negócios locais.</span>
        </div>
      </div>
    </main>
  );
}
