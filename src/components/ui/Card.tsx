import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-transparent ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-[#E9EDF7] transition-all duration-300' : ''} ${className}`}
        >
            {children}
        </div>
    );
};