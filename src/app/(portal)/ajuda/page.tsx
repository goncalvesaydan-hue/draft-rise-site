import Link from 'next/link';
import { Header, Footer } from '@/components/portal/brand';
export default function Help() {
  const questions=[
    ['Posso parar e voltar mais tarde?','Sim. Quando aparecer “Guardado”, as respostas estão registadas. Pode voltar a entrar para continuar. Na demonstração local, use o mesmo perfil fictício.'],
    ['E se ainda não souber uma resposta?','Escolha “Ainda não sei” quando a opção estiver disponível. Nome da empresa, responsável, email, setor e objetivos são necessários para submeter.'],
    ['Posso enviar documentos?','O envio de ficheiros ainda não está disponível. Pode listar os documentos que vai preparar e escrever exemplos sem dados pessoais dos seus clientes.'],
    ['O que acontece depois de submeter?','A ficha fica disponível para consulta e exportação, e a equipa pode analisá-la no painel. As notificações por email ainda não estão ativas.'],
    ['Posso corrigir uma ficha enviada?','A submissão original fica preservada. Se precisar de corrigir alguma informação, contacte a Draft & Rise.'],
    ['Como posso pedir ajuda?','Use os contactos disponíveis no site da Draft & Rise. Não inclua palavras-passe, chaves de acesso ou dados sensíveis nas respostas.'],
  ];
  return <><Header /><main id="conteudo" className="p-narrow-page"><h1>Uma pergunta de cada vez.</h1><p className="p-lead">Não precisa de ter tudo decidido para começar.</p><div className="p-faq">{questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div><Link href="/acesso" className="p-button p-primary">Abrir o meu espaço</Link></main><Footer /></>;
}
