import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2559]/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl p-8 relative animate-scaleIn">
                <button onClick={onClose} className="absolute top-6 right-6 text-[#A3AED0] hover:text-[#1B2559]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {title && <h2 className="text-2xl font-bold text-[#1B2559] mb-6">{title}</h2>}
                {children}
            </div>
        </div>
    );
};