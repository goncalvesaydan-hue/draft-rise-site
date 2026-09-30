import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return <footer className="footer section-shell"><div className="footer-top"><a href="#main-content" className="footer-wordmark" aria-label="Draft and Rise — voltar ao início">draft<span>&</span>rise.</a><p>Grandes ideias.<br />Negócios locais.</p><a href="#main-content" className="back-top">Voltar ao topo <ArrowUpRight size={20} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Draft & Rise</span><span>Feito com intenção, em Portugal.</span><a href="mailto:ola@draftrise.pt">Diga-nos olá <ArrowUpRight size={15} /></a></div></footer>;
}
