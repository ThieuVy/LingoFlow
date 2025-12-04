// FILE: src/features/reader/components/DefinitionPopup.tsx
import React from 'react';
import { DictionaryData } from '../../../types/types';
import { playTTS } from '../../../services/gemini';

interface Props {
    selectedWord: { word: string; def: DictionaryData | null; rect: DOMRect };
    isLookingUp: boolean;
    onClose: () => void;
}

const DefinitionPopup: React.FC<Props> = ({ selectedWord, isLookingUp, onClose }) => {
    const { word, def, rect } = selectedWord;
    const top = rect.bottom + 10;
    const left = Math.min(window.innerWidth - 300, Math.max(10, rect.left - 100));

    return (
        <div className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 w-72 border border-slate-100 dark:border-slate-700 animate-fadeIn" style={{ top, left }}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-indigo-600 capitalize">{word}</h4>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {isLookingUp ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    Defining...
                </div>
            ) : def ? (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-mono bg-slate-100 dark:bg-slate-700 px-2 rounded text-slate-600 dark:text-slate-300">{def.phonetic}</span>
                        <button onClick={() => playTTS(word)} className="text-indigo-600 hover:scale-110 transition-transform">🔊</button>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                        {def.meanings.slice(0, 2).map((m, i) => (
                            <div key={i}>
                                <span className="italic font-bold text-slate-500 text-xs">{m.partOfSpeech}</span>
                                <p className="leading-snug">{m.definitions[0].definition}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-green-600 font-bold flex items-center">
                        ✓ Saved to Dictionary
                    </div>
                </div>
            ) : (
                <p className="text-sm text-red-500">Definition not found.</p>
            )}
        </div>
    );
};
export default DefinitionPopup;