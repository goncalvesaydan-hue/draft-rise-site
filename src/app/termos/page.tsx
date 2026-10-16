import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  getEmailHref,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Condições de Utilização — Draft & Rise',
  description:
    'Termos e condições de utilização do website e dos serviços digitais da Draft & Rise.',
};

export default function TermosPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Saltar para o conteúdo</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="legal-section section-shell">
        <div className="legal-container">
          <Link href="/" className="legal-back">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>

          <header className="legal-header">
            <p className="section-label"><span /> Informação legal · Termos</p>
            <h1>Condições de<br />Utilização<span className="hero-period">.</span></h1>
            <p className="legal-updated">Última atualização: outubro de 2026</p>
          </header>

          <div className="legal-body">
            <section>
              <h2>1. Objeto e Âmbito</h2>
              <p>
                As presentes Condições de Utilização regulam o acesso e a navegação no website da <strong>Draft &amp; Rise</strong>, bem como a utilização do questionário de diagnóstico e dos canais de contacto disponibilizados aos visitantes e clientes. O acesso e utilização deste website implicam a aceitação das presentes condições.
              </p>
            </section>

            <section>
              <h2>2. Serviços Apresentados e Propostas Comerciais</h2>
              <p>
                A Draft &amp; Rise desenvolve serviços de crescimento e presença digital para empresas e negócios locais, incluindo produção e desenvolvimento de websites empresariais, otimização e gestão de Google Business (subida no ranking, copywriting e SEO local), automação de WhatsApp Bot 24/7 e criação de menus online digitais para restaurantes e hotelaria.
              </p>
              <p>
                Os conteúdos, exemplos e demonstrações presentes neste website têm caráter informativo e ilustrativo. A prestação efetiva de qualquer serviço é sempre precedida de diagnóstico e regulada por uma proposta comercial ou contrato específico acordado com cada cliente, onde constam o âmbito, os prazos e as condições financeiras aplicáveis.
              </p>
            </section>

            <section>
              <h2>3. Propriedade Intelectual</h2>
              <p>
                Todos os elementos que compõem este website — incluindo textos, identidade visual, logótipo, design, ilustrações, estrutura e código-fonte — são propriedade exclusiva da <strong>Draft &amp; Rise</strong> ou encontram-se devidamente licenciados, estando protegidos pelo Código do Direito de Autor e dos Direitos Conexos e demais legislação aplicável em Portugal.
              </p>
              <p>
                Não é permitida a cópia, reprodução, modificação ou distribuição total ou parcial dos conteúdos deste website para fins comerciais sem autorização prévia e por escrito da Draft &amp; Rise.
              </p>
            </section>

            <section>
              <h2>4. Utilização Correta e Questionário de Diagnóstico</h2>
              <p>
                O utilizador compromete-se a fazer uma utilização lícita e responsável do website e do questionário de diagnóstico, garantindo a veracidade das informações comerciais fornecidas e abstendo-se de:
              </p>
              <ul>
                <li>Introduzir palavras-passe, credenciais bancárias ou dados pessoais sensíveis de terceiros (como dados clínicos de clientes finais) nos campos de resposta livre;</li>
                <li>Tentar aceder a áreas restritas ou interferir com o normal funcionamento técnico e segurança da plataforma;</li>
                <li>Utilizar os conteúdos ou canais de contacto para envio de comunicações não solicitadas (spam) ou fins ilícitos.</li>
              </ul>
            </section>

            <section>
              <h2>5. Responsabilidade e Ligações Externas</h2>
              <p>
                A Draft &amp; Rise procura assegurar que toda a informação disponibilizada no website é rigorosa e atualizada, bem como manter o serviço contínuo e seguro. Contudo, não pode ser responsabilizada por interrupções temporárias decorrentes de manutenção técnica ou falhas de redes externas.
              </p>
              <p>
                Os serviços que envolvem plataformas de terceiros (como o Perfil da Empresa no Google ou o WhatsApp) estão igualmente sujeitos às políticas e regras técnicas definidas pelos respetivos fornecedores externos.
              </p>
            </section>

            <section>
              <h2>6. Lei Aplicável e Contacto</h2>
              <p>
                As presentes Condições de Utilização regem-se pela <strong>Lei Portuguesa</strong>. Para o esclarecimento de qualquer dúvida sobre estes termos, pode contactar-nos a qualquer momento através do email{' '}
                <a href={getEmailHref('Esclarecimento — Condições de Utilização')}>{CONTACT_EMAIL}</a>{' '}
                ou através do contacto telefónico / WhatsApp:{' '}
                <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE_DISPLAY}</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

