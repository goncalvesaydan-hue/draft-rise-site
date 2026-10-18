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
  title: 'Política de Privacidade e Cookies — Draft & Rise',
  description:
    'Saiba como a Draft & Rise recolhe, utiliza e protege os seus dados pessoais ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD).',
  alternates: {
    canonical: '/privacidade',
  },
};

export default function PrivacidadePage() {
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
            <p className="section-label"><span /> Informação legal · RGPD</p>
            <h1>Política de Privacidade<br />e Cookies<span className="hero-period">.</span></h1>
            <p className="legal-updated">Última atualização: outubro de 2026</p>
          </header>

          <div className="legal-body">
            <section>
              <h2>1. Responsável pelo Tratamento de Dados</h2>
              <p>
                A <strong>Draft &amp; Rise</strong> (doravante designada por «Draft &amp; Rise» ou «nós»), com atuação em Portugal, é a entidade responsável pelo tratamento dos dados pessoais recolhidos através deste website e dos seus canais digitais, em conformidade com o Regulamento (UE) 2016/679 (Regulamento Geral sobre a Proteção de Dados — <strong>RGPD</strong>) e com a Lei n.º 58/2019, de 8 de agosto.
              </p>
              <p>
                Para qualquer questão relacionada com a proteção dos seus dados pessoais ou para o exercício dos seus direitos legais, pode contactar-nos diretamente através do endereço de email:{' '}
                <a href={getEmailHref('Privacidade e Proteção de Dados (RGPD)')}>{CONTACT_EMAIL}</a>{' '}
                ou através do contacto telefónico / WhatsApp:{' '}
                <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE_DISPLAY}</a>.
              </p>
            </section>

            <section>
              <h2>2. Dados Pessoais Recolhidos e Finalidades</h2>
              <p>
                Recolhemos apenas os dados estritamente necessários, adequados e pertinentes para as finalidades determinadas em cada ponto de contacto:
              </p>
              <ul>
                <li>
                  <strong>Pedidos de contacto (Email e WhatsApp):</strong> Nome, endereço de email, contacto telefónico, nome do negócio e conteúdo da mensagem, com a finalidade de responder a pedidos de esclarecimento, diagnóstico ou apresentação de propostas comerciais.
                </li>
                <li>
                  <strong>Questionário de diagnóstico e planeamento:</strong> Dados de identificação do cliente e da empresa, setor de atividade, processos operacionais, ferramentas utilizadas e prioridades do projeto, com a finalidade de analisar as necessidades do negócio e desenhar soluções de presença digital ou automação.
                </li>
                <li>
                  <strong>Acesso e sessão no portal:</strong> Endereço de email para envio de código temporário de verificação e registo técnico de sessão, exclusivamente para permitir guardar e retomar o preenchimento do questionário com segurança.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Fundamento Jurídico do Tratamento</h2>
              <p>
                O tratamento dos dados pessoais baseia-se nos seguintes fundamentos legais previstos no artigo 6.º, n.º 1 do RGPD:
              </p>
              <ul>
                <li>
                  <strong>Diligências pré-contratuais ou execução de contrato (alínea b):</strong> Quando nos contacta ou preenche o questionário de diagnóstico para receber uma análise ou proposta de serviços.
                </li>
                <li>
                  <strong>Consentimento do titular (alínea a):</strong> Quando nos envia voluntariamente informações através dos nossos canais de comunicação.
                </li>
                <li>
                  <strong>Interesse legítimo e cumprimento de obrigações legais (alíneas c e f):</strong> Para garantir a segurança técnica da plataforma e cumprir obrigações fiscais ou legais aplicáveis em Portugal.
                </li>
              </ul>
            </section>

            <section>
              <h2>4. Prazo de Conservação dos Dados</h2>
              <p>
                Os dados pessoais são conservados apenas durante o período necessário para cumprir as finalidades para as quais foram recolhidos:
              </p>
              <ul>
                <li>
                  <strong>Pedidos de contacto e diagnósticos sem adjudicação:</strong> Conservados pelo período máximo de 12 meses após o último contacto, salvo pedido de eliminação anterior por parte do titular.
                </li>
                <li>
                  <strong>Dados contratuais e de clientes ativos:</strong> Conservados durante a vigência da relação comercial e pelos prazos legalmente exigidos pela legislação portuguesa aplicável.
                </li>
              </ul>
            </section>

            <section>
              <h2>5. Partilha de Dados e Subcontratantes</h2>
              <p>
                A Draft &amp; Rise <strong>não vende, aluga nem cede</strong> os seus dados pessoais a terceiros para fins comerciais ou publicitários. Os dados podem apenas ser processados por prestadores tecnológicos estritamente necessários ao funcionamento seguro do website e da base de dados (como serviços de alojamento web e infraestrutura cloud), os quais atuam sob compromisso de confidencialidade e em cumprimento das normas europeias de proteção de dados.
              </p>
            </section>

            <section>
              <h2>6. Direitos dos Titulares dos Dados</h2>
              <p>
                Nos termos do RGPD, assiste-lhe a qualquer momento o direito de solicitar:
              </p>
              <ul>
                <li>O <strong>acesso</strong> aos seus dados pessoais;</li>
                <li>A <strong>retificação</strong> de dados inexatos ou incompletos;</li>
                <li>O <strong>apagamento</strong> dos dados («direito a ser esquecido»);</li>
                <li>A <strong>limitação</strong> ou <strong>oposição</strong> ao tratamento;</li>
                <li>A <strong>portabilidade</strong> dos dados fornecidos.</li>
              </ul>
              <p>
                Pode exercer qualquer um destes direitos enviando um email para{' '}
                <a href={getEmailHref('Exercício de Direitos RGPD')}>{CONTACT_EMAIL}</a>. Tem ainda o direito de apresentar reclamação junto da autoridade de controlo nacional — a{' '}
                <strong>CNPD (Comissão Nacional de Proteção de Dados)</strong>, através de{' '}
                <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>.
              </p>
            </section>

            <section>
              <h2>7. Política de Cookies</h2>
              <p>
                Este website privilegia a privacidade e a rapidez de navegação. Utilizamos apenas <strong>cookies estritamente necessários e técnicos</strong> (como o cookie de sessão autenticada quando acede à área de preenchimento do questionário). Não utilizamos cookies de rastreamento publicitário de terceiros nem perfis comportamentais invasivos.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

