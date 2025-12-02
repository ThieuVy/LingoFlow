import React, { useState, useEffect } from 'react';
import { lookupDictionary, playTTS } from '../../services/gemini';
import { supabase, saveVocabulary, getVocabularyList } from '../../services/supabase';
import { DictionaryData, SavedWord } from '../../types/types';
import { formatTimeAgo } from '../../utils/formatDate';

const Dictionary: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'sets'>('search');
  const [selectedSet, setSelectedSet] = useState<SavedWord[] | null>(null);

  useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) { 
              setUserId(user.id); 
              loadSavedWords(user.id); 
          }
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
    
    // Tự động lưu lịch sử tra từ (nhưng chưa đánh dấu là 'Saved' để học, chỉ là history)
    // Ở đây ta có thể chọn: Tra là lưu luôn, hoặc bấm Save mới lưu.
    // Theo yêu cầu của bạn: "có thêm lịch sử tra từ và cũng cho vào database" -> Tôi sẽ lưu luôn.
    if (userId && result) {
        await saveVocabulary(userId, result);
        await loadSavedWords(userId);
    }

    setLoading(false);
  };

  // Logic chia nhóm 20 từ
  const wordSets = [];
  for (let i = 0; i < savedWords.length; i += 20) {
      wordSets.push(savedWords.slice(i, i + 20));
  }

  return (
    <div className="p-6 sm:p-10 w-full max-w-7xl mx-auto min-h-screen animate-fadeIn">
       {/* Navigation Tabs */}
       <div className="flex justify-center mb-8">
           <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex">
               <button 
                onClick={() => { setActiveTab('search'); setSelectedSet(null); }}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-[#4318FF] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                   Search & Learn
               </button>
               <button 
                onClick={() => setActiveTab('sets')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'sets' ? 'bg-[#4318FF] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                   Review Sets ({wordSets.length})
               </button>
           </div>
       </div>

       {activeTab === 'search' ? (
           <>
               <div className="text-center mb-12">
                   <h2 className="text-4xl font-bold text-[#1B2559] mb-4">Smart Dictionary</h2>
                   <p className="text-[#A3AED0] mb-8">Look up words, get AI definitions, and automatically save to your history.</p>
                   
                   <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group z-20">
                       <div className="absolute -inset-1 bg-gradient-to-r from-[#4318FF] to-[#00BCD4] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                       <div className="relative">
                           <input 
                              type="text" 
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Type a word (e.g. 'Serendipity')..."
                              className="w-full px-8 py-5 rounded-full bg-white text-lg font-medium text-[#1B2559] shadow-xl border-none outline-none focus:ring-0 placeholder:text-[#A3AED0]"
                           />
                           <button type="submit" disabled={loading} className="absolute right-2 top-2 p-3 bg-[#4318FF] text-white rounded-full hover:bg-[#3311CC] transition-all shadow-lg">
                               {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                           </button>
                       </div>
                   </form>
               </div>

               {data && (
                   <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-[0_20px_60px_rgba(67,24,255,0.08)] mb-12 animate-slideUp relative overflow-hidden border border-[#E9EDF7]">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-[100px] -z-0 pointer-events-none opacity-50"></div>
                       
                       <div className="relative z-10">
                           <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                               <div>
                                   <h1 className="text-5xl font-bold text-[#1B2559] capitalize font-serif mb-2">{data.word}</h1>
                                   <div className="flex items-center gap-4">
                                       <span className="text-xl text-[#4318FF] font-mono bg-indigo-50 px-3 py-1 rounded-lg">{data.phonetic}</span>
                                       <button onClick={() => playTTS(data.word)} className="p-2.5 rounded-full bg-[#F4F7FE] text-[#4318FF] hover:bg-[#4318FF] hover:text-white transition-all shadow-sm">
                                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                       </button>
                                   </div>
                               </div>
                           </div>

                           <div className="space-y-8">
                               {data.meanings.map((m, i) => (
                                   <div key={i} className="border-l-4 border-[#4318FF] pl-6 py-1">
                                       <h3 className="text-lg font-bold text-[#1B2559] italic mb-3 flex items-center">
                                           {m.partOfSpeech}
                                           <span className="ml-3 h-px flex-1 bg-slate-100"></span>
                                       </h3>
                                       <ul className="space-y-4">
                                           {m.definitions.map((def, j) => (
                                               <li key={j}>
                                                   <p className="text-[#2B3674] text-lg font-medium leading-relaxed">{def.definition}</p>
                                                   {def.example && <p className="text-[#A3AED0] mt-1 italic pl-4 border-l-2 border-slate-200">"{def.example}"</p>}
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>
               )}

               {/* Recent History List */}
               <div className="border-t border-[#E9EDF7] pt-10">
                   <h3 className="text-xl font-bold text-[#1B2559] mb-6 flex items-center gap-2">
                       <span className="text-2xl">🕒</span> Recent Searches
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       {savedWords.slice(0, 8).map((item) => (
                           <div key={item.id} onClick={() => { setData(item.full_data); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-[#E9EDF7] hover:border-[#4318FF] hover:shadow-md transition-all cursor-pointer group"
                           >
                               <div className="flex justify-between items-center mb-1">
                                   <h4 className="font-bold text-[#1B2559] capitalize group-hover:text-[#4318FF] transition-colors">{item.word}</h4>
                                   <span className="text-[10px] text-[#A3AED0]">{formatTimeAgo(item.created_at)}</span>
                               </div>
                               <p className="text-xs text-[#A3AED0] line-clamp-1">{item.phonetic}</p>
                           </div>
                       ))}
                   </div>
               </div>
           </>
       ) : (
           <div className="animate-fadeIn">
               {!selectedSet ? (
                   <>
                       <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-[#1B2559]">Vocabulary Sets</h2>
                            <p className="text-[#A3AED0] mt-2">Every 20 words are grouped into a set for easier review.</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {wordSets.map((set, index) => (
                               <div 
                                   key={index} 
                                   onClick={() => setSelectedSet(set)}
                                   className="bg-white p-8 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-[#E9EDF7] hover:border-[#4318FF] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                               >
                                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                       <svg className="w-24 h-24 text-[#4318FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                                   </div>
                                   <div className="relative z-10">
                                       <div className="w-12 h-12 rounded-2xl bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-[#4318FF] group-hover:text-white transition-colors">
                                           {index + 1}
                                       </div>
                                       <h3 className="text-xl font-bold text-[#1B2559] mb-2">Set #{index + 1}</h3>
                                       <p className="text-[#A3AED0] font-medium">{set.length} words</p>
                                       <div className="mt-6 pt-4 border-t border-[#E9EDF7] flex items-center text-sm font-bold text-[#4318FF]">
                                           Start Review <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                       </div>
                                   </div>
                               </div>
                           ))}
                           {wordSets.length === 0 && (
                               <div className="col-span-full text-center py-20 bg-white rounded-[30px] border-2 border-dashed border-[#E9EDF7]">
                                   <p className="text-[#A3AED0] font-medium">No words saved yet. Search words to build your collection!</p>
                               </div>
                           )}
                       </div>
                   </>
               ) : (
                   // --- REVIEW MODE (Flashcard UI) ---
                   <div className="max-w-3xl mx-auto">
                       <button onClick={() => setSelectedSet(null)} className="mb-6 flex items-center text-[#A3AED0] hover:text-[#1B2559] font-bold transition-colors">
                           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                           Back to Sets
                       </button>
                       
                       <div className="grid gap-4">
                           {selectedSet.map((item, i) => (
                               <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9EDF7] flex flex-col md:flex-row justify-between items-center gap-4 animate-slideUp" style={{ animationDelay: `${i * 0.05}s` }}>
                                   <div className="flex-1 w-full md:w-auto text-center md:text-left">
                                       <h4 className="text-xl font-bold text-[#1B2559] capitalize">{item.word}</h4>
                                       <p className="text-sm text-[#4318FF] font-mono bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">{item.phonetic}</p>
                                   </div>
                                   <div className="flex-1 w-full md:w-auto text-center md:text-left">
                                       <p className="text-[#2B3674] font-medium">{item.meaning}</p>
                                   </div>
                                   <button onClick={() => playTTS(item.word)} className="p-3 rounded-full bg-[#F4F7FE] text-[#4318FF] hover:bg-[#4318FF] hover:text-white transition-colors shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                   </button>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};

export default Dictionary;