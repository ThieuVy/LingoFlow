// FILE: src/features/reader/components/HighlightMenu.tsx
import React from 'react';

interface Props {
    rect: DOMRect;
    onHighlight: (color: 'yellow' | 'green' | 'blue' | 'pink') => void;
}

const HighlightMenu: React.FC<Props> = ({ rect, onHighlight }) => {
    return (
        <div 
            className="fixed z-50 flex gap-2 bg-slate-800 p-2 rounded-full shadow-xl animate-scaleIn"
            style={{ top: rect.top - 50, left: rect.left + rect.width / 2 - 80 }}
        >
            <button onClick={() => onHighlight('yellow')} className="w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 transition-transform"></button>
            <button onClick={() => onHighlight('green')} className="w-6 h-6 rounded-full bg-green-400 hover:scale-110 transition-transform"></button>
            <button onClick={() => onHighlight('blue')} className="w-6 h-6 rounded-full bg-blue-400 hover:scale-110 transition-transform"></button>
            <button onClick={() => onHighlight('pink')} className="w-6 h-6 rounded-full bg-pink-400 hover:scale-110 transition-transform"></button>
        </div>
    );
};
export default HighlightMenu;