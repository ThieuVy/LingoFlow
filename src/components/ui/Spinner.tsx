import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg', color?: string }> = ({ size = 'md', color = 'border-blue-600' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}></div>
    );
};