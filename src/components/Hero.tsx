import React from 'react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 px-6 overflow-hidden bg-secondary text-white">
      {/* Background Ambient Light */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />

      <div className="container max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Digitalização de Negócios Locais
        </div>

        <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tighter leading-[1.1] mb-6 animate-slide-up">
          Tornamos o seu negócio local <br />
          <span className="text-primary">invisível para a concorrência</span> <br />
          e irresistível para o cliente.
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up-delayed">
          Do Google ao pagamento NFC: construímos o ecossistema de conversão que transforma a visibilidade em lucro real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delayed-more">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,79,0,0.4)]">
            Quero Digitalizar
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full backdrop-blur-sm">
            Conhecer Metodologia
          </Button>
        </div>

        {/* Placeholder for Visuals */}
        <div className="mt-20 relative w-full max-w-5xl mx-auto aspect-video bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center group overflow-hidden">
          <div className="text-center p-8">
            <p className="text-gray-400 italic">Visual: Mockup de alta qualidade (Smartphone + Placa NFC)</p>
            <div className="mt-4 flex justify-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">📱</div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">🪪</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}