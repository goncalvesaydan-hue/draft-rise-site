import { IntakeWorkspace } from '@/components/portal/workspace';
import { notFound } from 'next/navigation';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; view: string[] }>;
}) {
  const { id, view } = await params;
  let step = 1;
  if (view[0] === 'preencher' && view.length === 2 && /^[1-8]$/.test(view[1]))
    step = Number(view[1]);
  else if (view.length === 1 && ['rever', 'confirmacao'].includes(view[0])) step = 8;
  else notFound();
  return <IntakeWorkspace id={id} initialStep={step} />;
}
