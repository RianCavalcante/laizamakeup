import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => (
  <button 
    onClick={onClick}
    className="mb-6 flex items-center gap-2 text-[#BC2A1A] font-black text-[11px] uppercase tracking-widest hover:opacity-70 transition-opacity active:scale-95"
  >
    <div className="w-8 h-8 rounded-full bg-[#FFDCD8] flex items-center justify-center">
      <ArrowLeft size={16} strokeWidth={3} />
    </div>
    Voltar ao Início
  </button>
);
