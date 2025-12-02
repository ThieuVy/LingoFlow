import React, { useState, useEffect } from 'react';
import { generateText, playLongTextTTS, analyzeImage, lookupDictionary } from '../../services/gemini';
import { ReaderSettings, NewsArticle } from '../../types/types';

interface ContentReaderProps {
    initialContent?: string;
    initialTitle?: string;
    // Optional full article data for richer UI
    articleData?: NewsArticle; 
    onBack?: () => void;
}

const ContentReader: React.FC<ContentReaderProps> = ({ initialContent, initialTitle, articleData, onBack }) => {
    // --- STATE ---
    const [content, setContent] = useState<string>(initialContent || articleData?.content || '');
    const [title, setTitle] = useState<string>(initialTitle || articleData?.title || 'Untitled Document');
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [inputMode, setInputMode] = useState<'none' | 'file' | 'url'>('none');
    const [urlInput, setUrlInput] = useState('');
    const [selectedWord, setSelectedWord] = useState<{word: string, def: any, x: number, y: number} | null>(null);

    // Settings State
    const [settings, setSettings] = useState<ReaderSettings>({
        fontSize: 20, // Tăng font mặc định cho dễ đọc
        fontFamily: 'Serif',
        theme: 'Light',
        lineHeight: 1.8,
        ttsSpeed: 1.0,
        ttsVoice: 'Male'
    });
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if(initialContent) {
            setContent(initialContent);
            setInputMode('none');
        }
        if(initialTitle) setTitle(initialTitle);
    }, [initialContent, initialTitle]);


    // --- HANDLERS ---

    // 1. File Upload Logic
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setLoading(true);
        setUploadStatus(`Uploading ${file.name}...`);

        setTimeout(() => {
            if (file.type.includes('image')) {
                 setUploadStatus('Analyzing image structure with Gemini Vision...');
                 const reader = new FileReader();
                 reader.onloadend = async () => {
                     const base64Data = (reader.result as string).split(',')[1];
                     const text = await analyzeImage(base64Data, file.type);
                     setContent(text);
                     setTitle(file.name);
                     setLoading(false);
                     setInputMode('none');
                 };
                 reader.readAsDataURL(file);
            } else {
                 setUploadStatus('Extracting text content...');
                 const reader = new FileReader();
                 reader.onload = (event) => {
                     if (typeof event.target?.result === 'string') {
                         const cleanText = event.target.result; 
                         setContent(cleanText);
                         setTitle(file.name);
                     }
                     setLoading(false);
                     setInputMode('none');
                 };
                 reader.readAsText(file); 
            }
        }, 1500);
    };

    // 2. URL Extraction Logic
    const handleUrlSubmit = async () => {
        if(!urlInput) return;
        setLoading(true);
        setUploadStatus('Crawling URL...');
        
        // Mocking the crawler - in real app would use backend or proxy
        setTimeout(() => {
             setUploadStatus('Cleaning navigation and ads...');
             setTimeout(() => {
                 setContent(`Extracted content from ${urlInput}...\n\nArtificial Intelligence is transforming the way we learn languages. By leveraging large language models, applications can provide personalized feedback, generate content on the fly, and simulate real conversations. This article explores the impact of AI on education and how tools like LingoFlow are leading the charge.`);
                 setTitle('Extracted Article from Web');
                 setLoading(false);
                 setInputMode('none');
             }, 1000);
        }, 1000);
    };

    // 3. Dictionary Lookup Logic
    const handleTextMouseUp = async () => {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
            setSelectedWord(null); 
            return;
        }
        
        const word = selection.toString().trim();
        // Heuristic: Only define single words or short idioms (<= 3 words)
        if (word.split(' ').length > 3) return; 

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Show loading state immediately at the selection coordinates
        setSelectedWord({ 
            word, 
            def: null, 
            x: rect.left + window.scrollX, 
            y: rect.top + window.scrollY - 10 
        });

        // Call API
        const data = await lookupDictionary(word);
        setSelectedWord(prev => prev ? { ...prev, def: data } : null);
    };

    // 4. TTS Logic
    const handlePlayAudio = () => {
        playLongTextTTS(content, settings.ttsVoice === 'Male' ? 'Puck' : 'Kore', settings.ttsSpeed); 
    };

    // --- RENDER ---
    
    // Dynamic styles based on theme
    const themeStyles = settings.theme === 'Dark' 
        ? 'bg-slate-900 text-slate-200 selection:bg-blue-900 selection:text-white' 
        : settings.theme === 'Sepia' 
            ? 'bg-[#f4ecd8] text-[#5b4636] selection:bg-[#e4dcc8]' 
            : 'bg-white text-slate-800 selection:bg-blue-100 selection:text-blue-900';

    const stickyBg = settings.theme === 'Dark' ? 'bg-slate-900/95 border-slate-800' : settings.theme === 'Sepia' ? 'bg-[#f4ecd8]/95 border-[#e4dcc8]' : 'bg-white/95 border-slate-100';

    return (
        <div className={`flex-1 min-h-screen pb-20 relative font-serif transition-colors duration-300 ${themeStyles}`}>
            
            {/* Sticky Toolbar */}
            <div className={`sticky top-0 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center z-40 shadow-sm ${stickyBg}`}>
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <button 
                            onClick={onBack} 
                            className="flex items-center opacity-60 hover:opacity-100 transition-opacity font-sans text-sm font-bold uppercase tracking-wider group"
                        >
                            <div className="p-2 rounded-full group-hover:bg-black/5 mr-2 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </div>
                            Back
                        </button>
                    )}
                    
                    {!onBack && (
                        <div className="flex space-x-1 border-r border-slate-300/30 pr-4 mr-2">
                             <button onClick={() => setInputMode('file')} className="p-2 rounded-xl hover:bg-black/5 transition-colors" title="Upload File">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </button>
                            <button onClick={() => setInputMode('url')} className="p-2 rounded-xl hover:bg-black/5 transition-colors" title="From URL">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    {/* TTS Button */}
                    <button 
                        onClick={handlePlayAudio} 
                        className={`px-5 py-2.5 rounded-full font-sans text-sm font-bold shadow-lg hover:scale-105 transition-all flex items-center ${settings.theme === 'Dark' ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Listen
                    </button>

                     {/* Settings Toggle */}
                     <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'hover:bg-black/5'}`}
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                     </button>
                </div>
            </div>

            {/* Settings Dropdown */}
            {showSettings && (
                <div className="absolute top-20 right-6 w-72 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700 p-5 z-50 text-slate-800 dark:text-slate-200 font-sans">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Font Size</label>
                                <span className="text-xs font-mono">{settings.fontSize}px</span>
                            </div>
                            <input 
                                type="range" min="14" max="32" 
                                value={settings.fontSize} 
                                onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400 block mb-2">Theme</label>
                            <div className="flex space-x-2">
                                {['Light', 'Sepia', 'Dark'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setSettings({...settings, theme: t as any})}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                                            settings.theme === t 
                                            ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20' 
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold uppercase text-slate-400 block mb-2">Voice Speed</label>
                             <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                 {[0.75, 1.0, 1.25, 1.5].map(speed => (
                                     <button
                                        key={speed}
                                        onClick={() => setSettings({...settings, ttsSpeed: speed})}
                                        className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${settings.ttsSpeed === speed ? 'bg-white dark:bg-slate-600 shadow text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}
                                     >
                                         {speed}x
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Container */}
            <div className="max-w-3xl mx-auto px-6 py-12" onMouseUp={handleTextMouseUp}>
                
                {/* 1. Header Image (Only if article data exists) */}
                {articleData?.imageUrl && (
                    <div className="relative h-64 md:h-96 w-full mb-10 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500">
                        <img src={articleData.imageUrl} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-2 inline-block shadow-md ${
                                ['A1','A2'].includes(articleData.level) ? 'bg-green-500' :
                                ['B1','B2'].includes(articleData.level) ? 'bg-blue-600' : 'bg-purple-600'
                            }`}>
                                {articleData.level}
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. Title & Meta */}
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">{title}</h1>
                
                <div className="flex items-center space-x-4 mb-10 opacity-60 font-sans text-sm border-b border-current pb-8">
                     <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="font-bold">{articleData?.source || 'Imported Content'}</span>
                     </div>
                     <span>•</span>
                     <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{Math.ceil(content.length / 500)} min read</span>
                     </div>
                </div>

                {/* 3. Description (Summary) */}
                {articleData?.description && (
                    <p className="text-xl italic mb-10 border-l-4 border-blue-500 pl-6 py-2 leading-relaxed opacity-80">
                        {articleData.description}
                    </p>
                )}

                {/* Empty State / Loading */}
                {!content && !loading && (
                    <div className="text-center py-20 opacity-50 border-2 border-dashed border-current rounded-3xl">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <p className="text-xl font-sans font-medium">No content loaded</p>
                        <p className="text-sm font-sans mt-2">Upload a file or paste a URL to begin</p>
                    </div>
                )}

                {/* 4. Main Content */}
                <div 
                    style={{ 
                        fontSize: `${settings.fontSize}px`,
                        fontFamily: settings.fontFamily === 'Serif' ? 'Georgia, serif' : 'Inter, sans-serif',
                        lineHeight: settings.lineHeight
                    }}
                    className="whitespace-pre-wrap outline-none pb-10"
                >
                    {content}
                </div>

                {/* 5. Footer Tags */}
                {content && (
                    <div className="mt-16 pt-8 border-t border-slate-200/50 flex flex-wrap gap-2 font-sans">
                        {['Learn English', articleData?.region || 'General', articleData?.level || 'Reading'].map((tag, i) => (
                            <span key={i} className="bg-black/5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black/10 transition-colors cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODALS & POPOVERS --- */}

            {/* Input Modal */}
            {inputMode !== 'none' && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-slate-900">
                  <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scaleIn">
                      <h3 className="text-xl font-bold mb-4">
                          {inputMode === 'file' ? 'Import Document' : 'Import from Web'}
                      </h3>
                      
                      {inputMode === 'file' && (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
                              <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".txt,.pdf,.docx,.epub,image/*" />
                              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                              </div>
                              <p className="font-bold text-slate-700">Click to upload or drag file</p>
                              <p className="text-xs text-slate-400 mt-2">Supports PDF, DOCX, TXT, Images (Max 10MB)</p>
                          </div>
                      )}

                      {inputMode === 'url' && (
                          <div className="space-y-4">
                              <div className="relative">
                                  <input 
                                    type="url" 
                                    placeholder="https://cnn.com/article..." 
                                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                  />
                                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              </div>
                              <button onClick={handleUrlSubmit} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-600/30">
                                  Extract Content
                              </button>
                          </div>
                      )}

                      <button onClick={() => setInputMode('none')} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 w-full">Cancel</button>
                  </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center font-sans">
                  <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-800 font-bold text-lg animate-pulse">{uploadStatus}</p>
              </div>
            )}

            {/* Dictionary Popover (In-place) */}
            {selectedWord && (
                <div 
                    style={{ 
                        position: 'absolute', 
                        top: selectedWord.y - 180, // Position above the word
                        left: Math.min(Math.max(20, selectedWord.x - 20), window.innerWidth - 340), // Responsive positioning
                        zIndex: 100 
                    }}
                    className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl w-80 animate-fadeIn border border-slate-700/50 font-sans"
                >
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-2xl font-bold capitalize font-serif tracking-tight">{selectedWord.word}</h4>
                        {selectedWord.def && selectedWord.def.meanings?.[0]?.partOfSpeech && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md uppercase font-bold tracking-wider">
                                {selectedWord.def.meanings[0].partOfSpeech}
                            </span>
                        )}
                    </div>
                    
                    {!selectedWord.def ? (
                        <div className="flex items-center space-x-3 text-sm text-slate-400 py-2">
                             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                             <span>AI is defining...</span>
                        </div>
                    ) : (
                        <>
                            <div className="text-slate-400 text-sm font-mono mb-4 flex items-center">
                                {selectedWord.def.phonetic}
                                <div className="h-px bg-slate-700 flex-1 ml-4"></div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-200 font-medium">
                                {selectedWord.def.meanings?.[0]?.definitions?.[0]?.definition}
                            </p>
                            {selectedWord.def.meanings?.[0]?.definitions?.[0]?.example && (
                                <p className="mt-3 text-xs text-slate-400 italic pl-3 border-l-2 border-slate-600">
                                    "{selectedWord.def.meanings[0].definitions[0].example}"
                                </p>
                            )}
                        </>
                    )}
                    
                    {/* Pointer Arrow */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-900 transform rotate-45 border-b border-r border-slate-700/50"></div>
                </div>
            )}
        </div>
    );
};

export default ContentReader;