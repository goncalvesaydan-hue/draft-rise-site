import React from 'react';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="container max-w-6xl mx-auto">
        {/* Final CTA Section */}
        <div className="text-center mb-24 p-12 md:p-20 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/40 transition-colors duration-500" />

          <h2 className="text-3xl md:text-6xl font-heading font-extrabold mb-8 leading-tight">
            Pronto para elevar o nível <br />
            <span className="text-primary">do seu negócio?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Não deixe o seu potencial escondido. Vamos transformar a sua presença digital em lucro real hoje mesmo.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,79,0,0.3)]">
            Agendar Digitalização
          </Button>
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
              <li><a href="#" className="hover:text-primary transition-colors">Metodologia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Soluções NFC</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white mb-2">Conecte-se</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Lucide.Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Lucide.Link className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                <Lucide.Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
              <Lucide.MapPin className="w-4 h-4" />
              <span>Atendimento Presencial & Remoto</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-20 pt-8 border-t border-white/5 text-gray-500 text-xs">
          © {new Date().getFullYear()} Draft & Rise. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}