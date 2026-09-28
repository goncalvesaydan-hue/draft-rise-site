import React from 'react';
export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="container max-w-6xl mx-auto">
        {/* Brand statement */}
        <div className="text-center mb-24 p-12 md:p-20 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/40 transition-colors duration-500" />

          <h2 className="text-3xl md:text-6xl font-heading font-extrabold mb-8 leading-tight">
            O digital feito para elevar <br />
            <span className="text-primary">do seu negócio?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Estratégia, tecnologia e experiência para tornar o seu negócio mais visível, eficiente e memorável.
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-white/10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center font-bold text-white text-xs">
                D&R
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">
                Draft & Rise
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Especialistas em digitalização de negócios locais. Transformamos visibilidade em conversão através de ecossistemas digitais de alta performance.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white mb-2">Navegação</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#metodologia" className="hover:text-primary transition-colors">Metodologia</a></li>
              <li><a href="#tangibilidade" className="hover:text-primary transition-colors">Soluções NFC</a></li>
              <li><a href="#tangibilidade" className="hover:text-primary transition-colors">O Nosso Trabalho</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white mb-2">Draft & Rise</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Soluções digitais para negócios locais que querem crescer com clareza e consistência.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-8 border-t border-white/5 text-gray-500 text-xs gap-4">
          <div>
            © {new Date().getFullYear()} Draft & Rise. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <span>Conteúdo institucional</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
