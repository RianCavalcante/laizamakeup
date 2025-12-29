import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const InputField = ({ label, ...props }: InputFieldProps) => (
  <div className="space-y-2 w-full text-left">
    {label && <label className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
    <input 
      {...props}
      className="w-full px-5 py-4 bg-[#FFDCD8]/10 border border-[#FFDCD8] rounded-[20px] focus:ring-4 focus:ring-[#BC2A1A]/10 focus:border-[#BC2A1A] outline-none transition-all text-sm placeholder:text-slate-300 shadow-sm"
    />
  </div>
);
