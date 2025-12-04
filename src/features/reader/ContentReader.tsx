// FILE: src/features/reader/ContentReader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { lookupDictionary } from '../../services/gemini';
import { ReaderSettings, NewsArticle, Highlight, ReadingHistoryItem } from '../../types/types';
import { saveVocabulary } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import DefinitionPopup from './components/DefinitionPopup';
import HighlightMenu from './components/HighlightMenu';

interface ContentReaderProps {
    initialContent?: string;
    initialTitle?: string;
    articleData?: NewsArticle; 
    onBack?: () => void;
}

const ContentReader: React.FC<ContentReaderProps> = ({ initialContent, initialTitle, articleData, onBack }) => {
    const { user, updateStats, stats } = useAuth();
    
    // Data State
    const [content] = useState<string>(initialContent || articleData?.content || '');
    const [title] = useState<string>(initialTitle || articleData?.title || 'Untitled Document');
    
    // UI Interaction State
    const [selectedWord, setSelectedWord] = useState<{word: string, def: any, rect: DOMRect} | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [selectionRange, setSelectionRange] = useState<Range | null>(null);
    const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
    const [settings] = useState<ReaderSettings>({ fontSize: 20, fontFamily: 'Serif', theme: 'Light', lineHeight: 1.8, ttsSpeed: 1.0, ttsVoice: 'Male' });

    const startTimeRef = useRef<number>(Date.now());
    const contentRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedHours = (now - startTimeRef.current) / 1000 / 3600;
            startTimeRef.current = now; 
            
            if(stats) updateStats({ readingHours: stats.readingHours + elapsedHours });
            
            const historyItem: ReadingHistoryItem = {
                id: articleData?.id || 'doc_' + Date.now(),
                title: title,
                type: articleData ? 'News' : 'Book',
                progress: 0, 
                lastRead: Date.now(),
                coverUrl: articleData?.imageUrl
            };
            
            const existingHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
            const newHistory = [historyItem, ...existingHistory.filter((h: any) => h.title !== title)].slice(0, 10);
            localStorage.setItem('reading_history', JSON.stringify(newHistory));
        }, 30000); 

        return () => clearInterval(interval);
    }, [title, stats, articleData, updateStats]);

    // --- HANDLERS ---
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionRange(range);
            setSelectionRect(rect);
            setSelectedWord(null); 
        } else {
            setTimeout(() => {
                if (!window.getSelection()?.toString()) {
                    setSelectionRange(null);
                    setSelectionRect(null);
                }
            }, 200);
        }
    };

    const handleHighlight = (color: 'yellow' | 'green' | 'blue' | 'pink') => {
        if (!selectionRange) return;
        const text = selectionRange.toString();
        const span = document.createElement('span');
        span.className = `bg-${color}-200 dark:bg-${color}-900/50 rounded px-0.5 cursor-pointer hover:opacity-80 transition-opacity`;
        span.textContent = text;
        selectionRange.deleteContents();
        selectionRange.insertNode(span);
        window.getSelection()?.removeAllRanges();
        setSelectionRange(null);
        setSelectionRect(null);
    };

    const handleWordClick = async (e: React.MouseEvent) => {
        if (window.getSelection()?.toString().length) return;
        const s = window.getSelection();
        s?.modify('move', 'backward', 'word');
        s?.modify('extend', 'forward', 'word');
        const word = s?.toString().trim();
        
        if (word && /^[a-zA-Z]+$/.test(word)) {
            const rect = s?.getRangeAt(0).getBoundingClientRect();
            if (rect) {
                setIsLookingUp(true);
                setSelectedWord({ word, def: null, rect });
                const data = await lookupDictionary(word);
                setSelectedWord({ word, def: data, rect });
                setIsLookingUp(false);
                if (user && user.id && data) await saveVocabulary(user.id, data);
            }
        }
    };

    return (
        <div className={`flex-1 min-h-screen pb-20 relative font-serif transition-colors duration-300 ${settings.theme === 'Dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="font-bold text-lg truncate max-w-md">{title}</h1>
                <div className="w-10"></div>
            </div>

            {/* Sub-Components */}
            {selectionRect && <HighlightMenu rect={selectionRect} onHighlight={handleHighlight} />}
            {selectedWord && <DefinitionPopup selectedWord={selectedWord} isLookingUp={isLookingUp} onClose={() => setSelectedWord(null)} />}

            {/* Content Area */}
            <div 
                className="max-w-3xl mx-auto px-6 py-24 outline-none" 
                ref={contentRef} 
                onMouseUp={handleTextSelection}
                onClick={handleWordClick}
            >
                <div style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }} className="whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
};
export default ContentReader;