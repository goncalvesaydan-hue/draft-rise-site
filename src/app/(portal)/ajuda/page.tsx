import Link from "next/link";
import { Header, Footer } from "@/components/portal/brand";
export default function Help() {
  const questions = [
    [
      "Posso parar e voltar mais tarde?",
      "Sim. Sempre que aparecer “Guardado”, as suas respostas estão seguras. Para retomar noutro momento ou noutro dispositivo, basta entrar em /acesso com o seu e-mail e o código de 6 dígitos fornecido pela equipa Draft & Rise.",
    ],
    [
      "E se ainda não souber uma resposta?",
      "Escolha “Ainda não sei” quando a opção estiver disponível. O nome da empresa, responsável, e-mail, setor e objetivos principais são necessários para submeter a ficha final.",
    ],
    [
      "Posso enviar menus, tabelas de preços ou documentos?",
      "Na Etapa 7 pode colocar links diretos (Google Drive, site, Instagram, PDFs online) ou listar os documentos que vai partilhar com a nossa equipa pelo WhatsApp.",
    ],
    [
      "O que acontece depois de submeter?",
      "A ficha fica imediatamente disponível no painel da equipa Draft & Rise para estruturarmos e treinarmos o seu Agente Oficial de WhatsApp Business (API da Meta).",
    ],
    [
      "Posso corrigir uma ficha depois de enviada?",
      "Sim. Caso precise de atualizar algum horário, preço ou regra depois de submeter, basta avisar a equipa Draft & Rise para reabrirmos a sua ficha ou ajustarmos diretamente.",
    ],
    [
      "Como posso pedir ajuda?",
      "Fale diretamente connosco pelo WhatsApp ou através de geral@draftandrise.com. Por segurança, nunca escreva palavras-passe pessoais nas respostas do questionário.",
    ],
  ];
  return (
    <>
      <Header />
      <main id="conteudo" className="p-narrow-page">
        <h1>Uma pergunta de cada vez.</h1>
        <p className="p-lead">
          Não precisa de ter tudo decidido para começar.
        </p>
        <div className="p-faq">
          {questions.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <Link href="/acesso" className="p-button p-primary">
          Abrir o meu espaço
        </Link>
      </main>
      <Footer />
    </>
  );
}

