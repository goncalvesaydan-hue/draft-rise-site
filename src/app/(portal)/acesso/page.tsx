import { Header, Footer } from '@/components/portal/brand';
import { EmailAccess } from '@/components/portal/email-access';

export const dynamic = 'force-dynamic';

export default async function Access() {
  return (
    <>
      <Header />
      <main id="conteudo" className="p-narrow-page">
        <span className="p-eyeline">O seu espaço de trabalho</span>
        <h1>Vamos continuar?</h1>
        <p className="p-lead">
          Preencha os seus dados para iniciar ou retomar o questionário, ou entre com a sua conta da equipa Draft &amp; Rise.
        </p>
        <EmailAccess />
      </main>
      <Footer />
    </>
  );
}

