import Link from 'next/link';
import { headers } from 'next/headers';
import { Header, Footer } from '@/components/portal/brand';
import { LocalAccess } from '@/components/portal/local-access';
import { EmailAccess } from '@/components/portal/email-access';
import { localMode, remoteReady } from '@/lib/portal/config';
export const dynamic='force-dynamic';
export default async function Access() {
  const host=(await headers()).get('host')||'';
  const demo=localMode() && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const ready=remoteReady() && process.env.PORTAL_AUTH_EMAILS_ENABLED==='1';
  return <><Header /><main id="conteudo" className="p-narrow-page">
    <span className="p-eyeline">O seu espaço de trabalho</span><h1>Vamos continuar?</h1>
    {demo ? <><p className="p-lead">Escolha um perfil fictício para experimentar o percurso.</p><div className="p-notice">Demonstração local. Use apenas dados fictícios. Nenhum email será enviado.</div><LocalAccess /></> : ready ? <><p className="p-lead">Confirme o seu email para iniciar ou retomar o questionário.</p><EmailAccess /></> : <><p className="p-lead">Estamos a preparar o questionário online.</p><p>Pode falar connosco para começar a planear a automação do seu negócio.</p><Link href="/#contacto" className="p-button p-primary">Contactar a Draft & Rise</Link></>}
  </main><Footer /></>;
}
