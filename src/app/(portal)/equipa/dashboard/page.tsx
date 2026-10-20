import type { Metadata } from 'next';
import { DashboardApp } from '@/components/portal/dashboard/DashboardApp';

export const metadata: Metadata = {
  title: 'draftandrise dashboard | Draft & Rise',
  description: 'Painel operacional da equipa Draft & Rise — Gestão de clientes, SEO local e avenças recorrentes.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DashboardApp />;
}
