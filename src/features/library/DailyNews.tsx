import React, { useState, useEffect } from 'react';
import { fetchDailyNews } from '../../services/gemini';
import { NewsArticle } from '../../types';
import ContentReader from '../reader/ContentReader';
import { CardSkeleton } from '../../components/ui/Skeleton'; // Import Skeleton

const DailyNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('Global');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  // ... (Giữ nguyên các const regions và useEffect)
  const regions = [
      { id: 'Global', label: 'World', icon: '🌍' },
      { id: 'Vietnam', label: 'Vietnam', icon: '🇻🇳' },
      { id: 'USA', label: 'USA', icon: '🇺🇸' },
      { id: 'UK', label: 'UK', icon: '🇬🇧' },
      { id: 'Technology', label: 'Tech', icon: '💻' },
      { id: 'Business', label: 'Business', icon: '💼' }
  ];

  const loadNews = async () => {
    setLoading(true);
    setReadingArticle(null);
    // Không clear articles ngay lập tức để tránh flash trắng xóa, chỉ loading=true
    try {
      const data = await fetchDailyNews(region, "English");
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(); }, []);

  if (readingArticle) {
      return <ContentReader initialContent={readingArticle.content} initialTitle={readingArticle.title} articleData={readingArticle} onBack={() => setReadingArticle(null)} />;
  }

  return (
    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header giữ nguyên */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-6 border-b border-[#E9EDF7]">
        <div>
          <h2 className="text-3xl font-bold text-[#1B2559]">Daily Digest</h2>
          <p className="text-[#A3AED0] mt-2 font-medium">Curated news adapted to your reading level.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 overflow-x-auto pb-2 custom-scrollbar">
            {regions.map(r => (
                <button 
                  key={r.id}
                  onClick={() => { setRegion(r.id); setTimeout(loadNews, 0); }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border shadow-sm ${region === r.id ? 'bg-[#4318FF] text-white border-[#4318FF] shadow-indigo-200' : 'bg-white text-[#A3AED0] border-transparent hover:bg-[#F4F7FE] hover:text-[#1B2559]'}`}
                >
                  <span className="text-base">{r.icon}</span> {r.label}
                </button>
            ))}
        </div>
      </div>

      {/* Update Loading State with Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {articles.map((article) => (
               <div 
                  key={article.id || Math.random()} 
                  className="group bg-white rounded-[20px] p-4 shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#E9EDF7] flex flex-col h-full"
                  onClick={() => setReadingArticle(article)}
               >
                   <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md text-white bg-blue-500/80 shadow-sm">{article.level}</span>
                        </div>
                   </div>
                   <div className="px-2 flex-1 flex flex-col">
                       <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#A3AED0] uppercase tracking-wide">
                           <span className="text-[#4318FF]">{article.source}</span> <span>•</span> <span>{article.region}</span>
                       </div>
                       <h3 className="text-xl font-bold text-[#1B2559] mb-3 leading-snug group-hover:text-[#4318FF] transition-colors line-clamp-2">{article.title}</h3>
                       <p className="text-[#A3AED0] text-sm leading-relaxed line-clamp-3 mb-6">{article.description}</p>
                   </div>
               </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default DailyNews;