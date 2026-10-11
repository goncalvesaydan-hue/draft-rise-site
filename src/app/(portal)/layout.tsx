import type { Metadata } from 'next';
import '@/components/portal/portal.css';
export const metadata: Metadata = {
  title: { default: 'Questionário | Draft & Rise', template: '%s | Draft & Rise' },
  robots: { index: false, follow: false },
};
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="dr-portal"><a className="p-skip-link" href="#conteudo">Saltar para o conteúdo</a>{children}</div>;
}
