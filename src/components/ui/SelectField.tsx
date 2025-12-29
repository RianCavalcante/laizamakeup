import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export const SelectField = ({ label, children, ...props }: SelectFieldProps) => (
  <div className="space-y-2 w-full text-left">
    {label && <label className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
    <div className="relative">
      <select 
        {...props}
        className="w-full px-5 py-4 bg-[#FFDCD8]/10 border border-[#FFDCD8] rounded-[20px] focus:ring-4 focus:ring-[#BC2A1A]/10 focus:border-[#BC2A1A] outline-none transition-all text-sm appearance-none shadow-sm pr-10"
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#BC2A1A]">
        <ChevronRight size={18} className="rotate-90" />
      </div>
    </div>
  </div>
);
