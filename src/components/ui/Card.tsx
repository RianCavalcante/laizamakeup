import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const Card = ({ children, className = "", onClick, noPadding = false }: CardProps) => {
  // Se className já tem bg-, não adiciona bg-white
  const hasCustomBg = className.includes('bg-');
  const defaultBg = hasCustomBg ? '' : 'bg-white';
  const defaultBorder = className.includes('border-none') ? '' : 'border border-slate-100';
  
  return (
    <div 
      onClick={onClick}
      className={`${defaultBg} rounded-[24px] ${defaultBorder} shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200' : ''} ${noPadding ? '' : 'p-6 md:p-8'} ${className}`}
    >
      {children}
    </div>
  );
};
