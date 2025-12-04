import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, variant = 'primary', isLoading, className = '', ...props 
}) => {
    const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center";
    const variants = {
        primary: "bg-[#4318FF] text-white shadow-lg shadow-indigo-500/30 hover:bg-[#3311CC]",
        secondary: "bg-white border border-[#E9EDF7] text-[#1B2559] hover:bg-[#F4F7FE]",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
        ghost: "bg-transparent text-[#A3AED0] hover:text-[#4318FF]"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : null}
            {children}
        </button>
    );
};