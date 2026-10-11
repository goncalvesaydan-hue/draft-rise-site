import Link from 'next/link';
import { ArrowUpRight, Check, FileText } from 'lucide-react';
import { Header, Footer } from '@/components/portal/brand';
export default function Questionnaire() {
  return <><Header /><main id="conteudo">
    <section className="p-hero">
      <div className="p-hero-copy">
        <div className="p-intro-line"><span className="p-orange-dot" /> Automações para o seu negócio</div>
        <h1>O próximo passo começa no seu dia a dia.</h1>
        <p className="p-lead">Onde perde tempo? O que repete todos os dias? Conte-nos como funciona o seu negócio para prepararmos uma automação à sua medida.</p>
        <Link href="/acesso" className="p-button p-primary p-large">Iniciar questionário <ArrowUpRight size={21} /></Link>
        <p className="p-quiet">Já começou? Entre para retomar as suas respostas.</p>
      </div>
      <div className="p-project-preview">
        <div className="p-preview-top"><span>Do seu dia a dia ao plano de trabalho</span></div>
        <div className="p-preview-content"><h2>Menos tarefas repetidas.<br />Mais tempo para o negócio.</h2>
          {['O negócio e a equipa','As tarefas que quer simplificar','Os detalhes do seu setor'].map(label => <div className="p-preview-row" key={label}><span className="p-check-circle"><Check size={16} /></span><strong>{label}</strong></div>)}
          <p>Oito etapas, com espaço para o que torna o seu negócio diferente.</p>
        </div>
      </div>
    </section>
    <section className="p-process-section"><div className="p-section-heading"><span>Como funciona</span><h2>Uma conversa organizada.<br /> Ao seu ritmo.</h2></div>
      <ol className="p-process-list">
        <li><span className="p-process-number">01</span><h3>Conte-nos como trabalha</h3><p>As perguntas adaptam-se ao setor e às prioridades que escolher.</p></li>
        <li><span className="p-process-number">02</span><h3>Guarde e reveja</h3><p>Pode retomar mais tarde. Antes de enviar, veja tudo o que partilhou.</p></li>
        <li><span className="p-process-number">03</span><h3>Prepare o próximo passo</h3><p>A ficha fica organizada para a equipa analisar o projeto consigo.</p></li>
      </ol>
    </section>
    <section className="p-prepare-section"><FileText size={32} /><div><h2>O que convém ter à mão?</h2><p>Horários, serviços e ferramentas que já utiliza. Pode indicar o que ainda está por decidir.</p></div><Link href="/ajuda" className="p-text-link">Dúvidas frequentes <ArrowUpRight size={18} /></Link></section>
  </main><Footer /></>;
}
