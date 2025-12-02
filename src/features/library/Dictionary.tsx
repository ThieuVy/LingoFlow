import React, { useState } from 'react';
// FIX: Go up two levels
import { lookupDictionary, playTTS } from '../../services/gemini';
import { DictionaryData } from '../../types';

const Dictionary: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const result = await lookupDictionary(query);
    setData(result);
    if (result && !recent.includes(result.word)) {
        setRecent(prev => [result.word, ...prev].slice(0, 5));
    }
    setLoading(false);
  };

  const playAudio = () => {
      if (data?.word) {
          playTTS(data.word, 'Puck', 0.8);
      }
  };

  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto min-h-screen">
       {/* Hero Search Section */}
       <div className="text-center mb-12">
           <h2 className="text-4xl font-bold text-slate-900 tracking-tight font-serif mb-6">Master Dictionary</h2>
           <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
               <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Look up a word (e.g. 'serendipity')..."
                  className="w-full px-8 py-5 rounded-full text-lg shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300"
               />
               <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-3 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
               >
                   {loading ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   )}
               </button>
           </form>
           
           {/* Recent Searches */}
           {recent.length > 0 && (
               <div className="mt-4 flex justify-center space-x-2">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1">Recent:</span>
                   {recent.map(w => (
                       <button 
                         key={w} 
                         onClick={() => { setQuery(w); handleSearch(); }}
                         className="text-xs text-blue-500 hover:text-blue-700 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                       >
                           {w}
                       </button>
                   ))}
               </div>
           )}
       </div>

       {/* Result Display */}
       {data ? (
           <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 animate-fadeIn">
               <div className="flex items-start justify-between border-b border-slate-100 pb-8 mb-8">
                   <div>
                       <h1 className="text-5xl font-bold text-slate-900 font-serif mb-4 capitalize">{data.word}</h1>
                       <div className="flex items-center space-x-4">
                           <span className="text-xl text-slate-500 font-mono tracking-wide">{data.phonetic}</span>
                           <button onClick={playAudio} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                           </button>
                       </div>
                   </div>
               </div>

               <div className="space-y-10">
                   {data.meanings.map((meaning, idx) => (
                       <div key={idx}>
                           <h3 className="text-lg font-bold text-slate-900 italic mb-4 flex items-center">
                               {meaning.partOfSpeech}
                               <span className="ml-3 h-px flex-1 bg-slate-100"></span>
                           </h3>
                           
                           <ul className="space-y-6">
                               {meaning.definitions.map((def, i) => (
                                   <li key={i} className="relative pl-6 sm:pl-0 sm:flex sm:space-x-4">
                                       <span className="absolute left-0 top-0 sm:static sm:flex-shrink-0 text-slate-300 font-bold">{i + 1}.</span>
                                       <div>
                                           <p className="text-lg text-slate-800 leading-relaxed font-medium">
                                               {def.definition}
                                           </p>
                                           {def.example && (
                                               <p className="mt-2 text-slate-500 italic pl-4 border-l-2 border-slate-200">
                                                   "{def.example}"
                                               </p>
                                           )}
                                           {def.synonyms && def.synonyms.length > 0 && (
                                               <div className="mt-3 flex flex-wrap gap-2">
                                                   {def.synonyms.map(syn => (
                                                       <span key={syn} className="inline-block px-2 py-1 bg-slate-50 text-slate-500 rounded text-xs font-bold uppercase tracking-wider">
                                                           {syn}
                                                       </span>
                                                   ))}
                                               </div>
                                           )}
                                       </div>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   ))}
               </div>
           </div>
       ) : (
           !loading && (
               <div className="text-center py-20 opacity-50">
                   <svg className="w-24 h-24 mx-auto mb-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                   <p className="text-xl font-serif text-slate-400">Search for any word to begin.</p>
               </div>
           )
       )}
    </div>
  );
};

export default Dictionary;