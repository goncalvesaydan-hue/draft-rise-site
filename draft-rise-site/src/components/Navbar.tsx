import React from 'react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-background/80 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
          D&R
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-secondary">
          Draft & Rise
        </span>
      </div>
      <Button variant="outline" className="hidden md:flex border-primary text-secondary hover:bg-primary hover:text-white transition-all">
        Área de Cliente
      </Button>
    </nav>
  );
}