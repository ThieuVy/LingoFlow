import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">{label}</label>}
            <input 
                className={`w-full px-5 py-4 rounded-xl bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
};