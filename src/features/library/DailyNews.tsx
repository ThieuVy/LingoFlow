import React, { useState, useEffect } from 'react';
// FIX: Go up two levels to reach services and types
import { fetchDailyNews } from '../../services/gemini';
import { NewsArticle } from '../../types';
// This one is correct (sibling folder in features)
import ContentReader from '../reader/ContentReader';

const DailyNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('Vietnam'); // Default to Vietnam
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  
  // Embedded Reader State
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const regions = [
      { id: 'Vietnam', label: 'Vietnam', icon: '🇻🇳' },
      { id: 'USA', label: 'USA', icon: '🇺🇸' },
      { id: 'UK', label: 'UK', icon: '🇬🇧' },
      { id: 'Global', label: 'World', icon: '🌍' },
      { id: 'Technology', label: 'Tech', icon: '💻' },
      { id: 'Business', label: 'Business', icon: '💼' }
  ];

  const loadNews = async () => {
    setLoading(true);
    setReadingArticle(null);
    setArticles([]); // Clear old
    try {
      const data = await fetchDailyNews(region, "English"); // Always translate to English (Target Lang)
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (readingArticle) {
      return (
          <ContentReader 
            initialContent={readingArticle.content} 
            initialTitle={readingArticle.title} 
            onBack={() => setReadingArticle(null)}
          />
      );
  }

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight font-serif">Global Digest</h2>
          <p className="text-slate-500 mt-2">Local news, translated to English for your learning.</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            {regions.map(r => (
                <button 
                  key={r.id}
                  onClick={() => { setRegion(r.id); setTimeout(loadNews, 0); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center space-x-2 ${
                      region === r.id 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 bg-slate-100 rounded-3xl"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {articles.length === 0 && (
               <div className="col-span-3 text-center text-slate-400 py-20 flex flex-col items-center">
                   <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                   No articles found for {region}. Try refreshing.
               </div>
           )}
           {articles.map((article) => (
               <div 
                  key={article.id || Math.random()} 
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between h-full relative overflow-hidden"
                  onClick={() => setReadingArticle(article)}
               >
                   <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <div className="bg-blue-50 text-blue-600 rounded-full p-2">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                       </div>
                   </div>
                   
                   {/* Image Thumbnail */}
                   <div className="h-40 -mx-6 -mt-6 mb-6 overflow-hidden bg-slate-100 relative">
                        <img 
                            src={article.imageUrl || `https://image.pollinations.ai/prompt/news%20image%20${encodeURIComponent(article.title)}?nologo=true`} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 p-3 bg-gradient-to-t from-black/60 to-transparent w-full">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                ['A1','A2'].includes(article.level) ? 'bg-green-500 text-white border-green-400' :
                                ['B1','B2'].includes(article.level) ? 'bg-blue-500 text-white border-blue-400' :
                                'bg-purple-500 text-white border-purple-400'
                            }`}>
                                {article.level}
                            </span>
                        </div>
                   </div>

                   <div>
                       <div className="flex items-center space-x-2 mb-3">
                           <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{article.source}</span>
                           <span className="text-xs text-slate-300">•</span>
                           <span className="text-xs text-slate-400 font-medium uppercase">{article.region}</span>
                       </div>
                       
                       <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                           {article.title}
                       </h3>
                       
                       <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                           {article.description}
                       </p>
                   </div>

                   <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Read Article</span>
                       <div className="flex -space-x-1">
                          {/* Decorative dots */}
                           <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                           <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                       </div>
                   </div>
               </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default DailyNews;