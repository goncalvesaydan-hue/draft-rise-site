import { Header, Footer } from '@/components/portal/brand';
export default function Privacy() {
  return (
    <>
      <Header />
      <main id="conteudo" className="p-narrow-page p-prose">
        <h1>Os seus dados, com contexto.</h1>
        <div className="p-notice">
          O questionário encontra-se em preparação. As demonstrações destinam-se exclusivamente a dados fictícios.
          O aviso de privacidade de produção ainda não está aprovado.
        </div>
        <h2>O que é guardado nesta versão</h2>
        <p>
          Na demonstração local, as respostas ficam no computador que executa a aplicação e a sessão dura oito horas. O acesso online está preparado para usar Supabase e cookies de autenticação. A ativação para clientes reais depende da configuração e validação desse serviço. As notificações da aplicação ainda não são enviadas.
        </p>
        <h2>Antes de receber clientes reais</h2>
        <p>
          Será necessário identificar a empresa responsável, o contacto para pedidos sobre os dados,
          as finalidades e regras de tratamento, os prestadores envolvidos e o período de
          conservação. Estes elementos ainda estão por definir.
        </p>
        <h2>O que não deve ser introduzido</h2>
        <p>
          Não introduza palavras-passe, chaves de acesso, dados de clientes reais nem processos
          clínicos. Os exemplos de conversas devem estar anonimizados.
        </p>
      </main>
      <Footer />
    </>
  );
}
