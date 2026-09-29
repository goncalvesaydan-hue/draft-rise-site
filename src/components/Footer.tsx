import React from 'react';
import Image from 'next/image';
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-secondary px-5 pb-9 pt-20 text-white md:px-8">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="mx-auto max-w-7xl">
        {/* Brand statement */}
        <div className="relative mb-24 overflow-hidden border-y border-white/10 py-12 md:py-20">
          <div aria-hidden="true" className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />

          <h2 className="max-w-4xl font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.055em] md:text-6xl">
            O digital feito para elevar o que já funciona no seu negócio.
          </h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            Estratégia, tecnologia e experiência para tornar o seu negócio mais fácil de encontrar e escolher.
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="grid gap-12 pt-2 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="grid size-8 place-items-center overflow-hidden rounded-md bg-white p-0.5">
                <Image src="/brand/draft-rise-mark.png" alt="" width={600} height={600} className="size-full object-contain" />
              </span>
              <span className="font-heading font-bold text-lg tracking-tight">
                Draft & Rise
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Estratégia digital para negócios locais que querem crescer sem perder a clareza do que os torna especiais.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 font-bold text-white">Navegação</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#metodologia" className="hover:text-primary transition-colors">Metodologia</a></li>
              <li><a href="#tangibilidade" className="hover:text-primary transition-colors">Soluções NFC</a></li>
              <li><a href="#tangibilidade" className="hover:text-primary transition-colors">O Nosso Trabalho</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 font-bold text-white">Draft & Rise</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Presença digital com intenção: menos ruído, mais próximos passos.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-8 border-t border-white/5 text-gray-500 text-xs gap-4">
          <div>
            © {new Date().getFullYear()} Draft & Rise. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <span>Estratégia · Experiência · Presença</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
