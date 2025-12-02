import React, { useState, useEffect } from 'react';
import { lookupDictionary, playTTS } from '../../services/gemini';
import { supabase, saveVocabulary, getVocabularyList } from '../../services/supabase';
import { DictionaryData } from '../../types';

const Dictionary: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) { setUserId(user.id); loadSavedWords(user.id); }
      });
  }, []);

  const loadSavedWords = async (uid: string) => {
      const list = await getVocabularyList(uid);
      if (list) setSavedWords(list);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const result = await lookupDictionary(query);
    setData(result);
    setLoading(false);
  };

  const handleSave = async () => {
      if (!userId || !data) return;
      await saveVocabulary(userId, data);
      loadSavedWords(userId);
  };

  return (
    <div className="p-8 sm:p-12 max-w-[1200px] mx-auto min-h-screen">
       <div className="text-center mb-16">
           <h2 className="text-4xl font-bold text-[#1B2559] mb-6">Smart Dictionary</h2>
           <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
               <div className="absolute -inset-1 bg-gradient-to-r from-[#4318FF] to-[#00BCD4] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
               <div className="relative">
                   <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type a word..."
                      className="w-full px-8 py-6 rounded-full bg-white text-lg font-medium text-[#1B2559] shadow-xl border-none outline-none focus:ring-0 placeholder:text-[#A3AED0]"
                   />
                   <button type="submit" disabled={loading} className="absolute right-3 top-3 p-3 bg-[#4318FF] text-white rounded-full hover:bg-[#3311CC] transition-all shadow-lg">
                       {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                   </button>
               </div>
           </form>
       </div>

       {data && (
           <div className="bg-white rounded-[30px] p-10 shadow-2xl shadow-indigo-100/50 mb-12 animate-slideUp relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F4F7FE] to-transparent rounded-bl-[100px] -z-0 pointer-events-none"></div>
               
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-8">
                       <div>
                           <h1 className="text-5xl font-bold text-[#1B2559] capitalize font-serif mb-2">{data.word}</h1>
                           <div className="flex items-center gap-4">
                               <span className="text-xl text-[#A3AED0] font-mono">{data.phonetic}</span>
                               <button onClick={() => playTTS(data.word)} className="p-2 rounded-full bg-[#F4F7FE] text-[#4318FF] hover:bg-[#4318FF] hover:text-white transition-all">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                               </button>
                           </div>
                       </div>
                       {userId && (
                           <button onClick={handleSave} className="px-5 py-2.5 bg-[#F4F7FE] text-[#4318FF] rounded-xl font-bold text-sm hover:bg-[#E9EDF7] transition-colors">
                               + Save Card
                           </button>
                       )}
                   </div>

                   <div className="space-y-8">
                       {data.meanings.map((m, i) => (
                           <div key={i} className="border-l-4 border-[#4318FF] pl-6">
                               <h3 className="text-lg font-bold text-[#1B2559] italic mb-3">{m.partOfSpeech}</h3>
                               <ul className="space-y-4">
                                   {m.definitions.map((def, j) => (
                                       <li key={j}>
                                           <p className="text-[#2B3674] text-lg font-medium">{def.definition}</p>
                                           {def.example && <p className="text-[#A3AED0] mt-1">"{def.example}"</p>}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       )}

       <div className="border-t border-[#E9EDF7] pt-10">
           <h3 className="text-xl font-bold text-[#1B2559] mb-6 flex items-center gap-2">
               <span className="text-2xl">🗂️</span> Flashcards ({savedWords.length})
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {savedWords.map((item) => (
                   <div key={item.id} onClick={() => { setData(item.full_data); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-[#F4F7FE] hover:border-[#4318FF] hover:shadow-lg transition-all cursor-pointer group"
                   >
                       <div className="flex justify-between items-center mb-2">
                           <h4 className="font-bold text-lg text-[#1B2559] capitalize group-hover:text-[#4318FF] transition-colors">{item.word}</h4>
                           <span className="text-xs text-[#A3AED0] font-mono">{item.phonetic}</span>
                       </div>
                       <p className="text-sm text-[#A3AED0] line-clamp-2">{item.meaning}</p>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

export default Dictionary;