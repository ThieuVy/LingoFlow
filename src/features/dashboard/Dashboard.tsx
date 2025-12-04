import React, { useEffect, useState } from 'react';
import { UserStats, View, UserProfile, ReadingHistoryItem } from '../../types/types';
import StatsCard from '../dashboard/components/StatsCard';
import ActivityChart from './components/ActivityChart';
import { formatTimeAgo } from '../../utils/formatDate';
// IMPORT MỚI để xử lý đọc trực tiếp
import ContentReader from '../reader/ContentReader';
import { fetchFullArticleContent, fetchChapterContent } from '../../services/gemini';

interface DashboardProps {
  stats: UserStats;
  setView: (view: View) => void;
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setView, user }) => {
  const [recentReads, setRecentReads] = useState<ReadingHistoryItem[]>([]);
  
  // States cho tính năng Đọc trực tiếp (Overlay)
  const [readingItem, setReadingItem] = useState<ReadingHistoryItem | null>(null);
  const [readingContent, setReadingContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
      const savedHistory = localStorage.getItem('reading_history');
      if (savedHistory) {
          setRecentReads(JSON.parse(savedHistory));
      }
  }, []);

  // Xử lý khi click vào item trong lịch sử
  const handleContinueReading = async (item: ReadingHistoryItem) => {
      setReadingItem(item);
      setIsLoadingContent(true);
      
      try {
          let content = "";
          if (item.type === 'News') {
              // Fetch lại tin tức (hoặc nên lưu cache content trong history nếu có thể)
              content = await fetchFullArticleContent(item.title, "Global");
          } else {
              // Fetch chapter sách (mặc định chapter 1 hoặc chapter từ progress)
              content = await fetchChapterContent(item.title, "Unknown Author", 1);
          }
          setReadingContent(content);
      } catch (e) {
          console.error("Failed to load content", e);
          setReadingContent("Sorry, could not load this content again.");
      } finally {
          setIsLoadingContent(false);
      }
  };

  // Nếu đang đọc, hiển thị ContentReader đè lên Dashboard
  if (readingItem) {
      return (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              {isLoadingContent ? (
                  <div className="h-screen flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
              ) : (
                  <ContentReader 
                      initialContent={readingContent} 
                      initialTitle={readingItem.title}
                      onBack={() => {
                          setReadingItem(null);
                          setReadingContent('');
                      }} 
                  />
              )}
          </div>
      );
  }

  return (
    <div className="p-8 sm:p-10 max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h2 className="text-3xl font-bold text-[#1B2559] dark:text-white tracking-tight">Dashboard</h2>
            <p className="text-[#A3AED0] mt-1">Welcome back, {user.name}!</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E9EDF7] dark:border-slate-700 flex items-center gap-3">
             <span className="text-sm font-bold text-[#1B2559] dark:text-white">Current Level:</span>
             <span className="px-2 py-0.5 bg-[#4318FF] text-white text-xs rounded font-bold">{stats.level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Vocabulary" value={stats.vocabularySize} unit="words" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="text-[#4318FF]" bg="bg-[#F4F7FE] dark:bg-slate-800" />
        <StatsCard 
            label="Reading Time" 
            value={stats.readingHours.toFixed(1)} 
            unit="hours" 
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
            color="text-[#00BCD4]" 
            bg="bg-cyan-50 dark:bg-slate-800" 
        />
        <StatsCard label="Day Streak" value={stats.currentStreak} unit="days" icon="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" color="text-orange-500" bg="bg-orange-50 dark:bg-slate-800" />
        <StatsCard label="Total Points" value={stats.totalPoints} unit="pts" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="text-emerald-500" bg="bg-emerald-50 dark:bg-slate-800" />
      </div>

      {/* Content Grid: Charts & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80">
              <ActivityChart />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] dark:border-slate-700 h-80 flex flex-col">
              <h3 className="text-lg font-bold text-[#1B2559] dark:text-white mb-4">Continue Reading</h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {recentReads.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[#A3AED0] opacity-70">
                          <span className="text-4xl mb-2">📚</span>
                          <p className="text-sm">No recent history.</p>
                          <button onClick={() => setView(View.LIBRARY)} className="mt-2 text-[#4318FF] dark:text-blue-400 text-xs font-bold hover:underline">Go to Library</button>
                      </div>
                  ) : (
                      recentReads.map(item => (
                          <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-[#F4F7FE] dark:hover:bg-slate-700 transition-colors cursor-pointer group" onClick={() => handleContinueReading(item)}>
                              <div className="w-12 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                  {item.coverUrl ? <img src={item.coverUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs">📖</div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4318FF] dark:text-blue-400 bg-indigo-50 dark:bg-slate-600 px-1.5 py-0.5 rounded">{item.type}</span>
                                      <span className="text-[10px] text-[#A3AED0]">{formatTimeAgo(new Date(item.lastRead).toISOString())}</span>
                                  </div>
                                  <h4 className="font-bold text-[#1B2559] dark:text-slate-200 text-sm truncate mt-1 group-hover:text-[#4318FF] dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                  
                                  <div className="mt-2 w-full bg-slate-100 dark:bg-slate-600 rounded-full h-1.5">
                                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;