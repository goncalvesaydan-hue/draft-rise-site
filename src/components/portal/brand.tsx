import Image from "next/image";
import Link from "next/link";
export function Brand() {
  return (
    <Link
      href="/"
      className="p-brand"
      aria-label="Draft & Rise — página inicial"
    >
      <Image src="/brand/draft-rise-mark.png" alt="" width={38} height={38} />
      <span>
        draft&rise.<span className="p-brand-caption">O seu próximo passo</span>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="p-site-header">
      <Brand />
      <nav aria-label="Navegação principal">
        <Link href="/questionario">Questionário</Link>
        <Link href="/ajuda">Ajuda</Link>
        <Link href="/equipa" className="p-subtle-link">
          Área da equipa
        </Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="p-site-footer">
      <span>Um bom projeto começa por uma boa conversa.</span>
      <Link href="/privacidade">Privacidade do questionário</Link>
      <Link href="/#contacto">Fale connosco</Link>
    </footer>
  );
}
