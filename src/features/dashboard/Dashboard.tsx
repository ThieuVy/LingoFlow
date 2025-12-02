import React from 'react';
import { UserStats, View, UserProfile } from '../../types';

interface DashboardProps {
  stats: UserStats;
  setView: (view: View) => void;
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setView, user }) => {
  return (
    <div className="p-8 sm:p-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center animate-fadeIn">
        <div>
            <p className="text-[#A3AED0] font-medium text-sm mb-1">Hi {user.name},</p>
            <h2 className="text-4xl font-bold text-[#1B2559] tracking-tight">Ready to start your day?</h2>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white px-5 py-2.5 rounded-full shadow-sm border border-[#F4F7FE]">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
            <span className="text-sm font-bold text-[#1B2559]">{user.targetLanguage} Mastery</span>
        </div>
      </div>

      {/* Main Stats Grid - Glassmorphism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Vocabulary', value: stats.vocabularySize, unit: 'words', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-[#4318FF]', bg: 'bg-[#F4F7FE]' },
          { label: 'Listening', value: stats.listeningHours, unit: 'hours', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'text-[#00BCD4]', bg: 'bg-cyan-50' },
          { label: 'Streak', value: stats.currentStreak, unit: 'days', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Total Points', value: stats.totalPoints, unit: 'pts', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-4">
               <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
               </div>
               <div>
                  <p className="text-sm text-[#A3AED0] font-medium">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-[#1B2559]">
                    {stat.value} <span className="text-xs text-[#A3AED0] font-normal">{stat.unit}</span>
                  </h4>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Featured Card */}
        <div className="xl:col-span-2 relative bg-gradient-to-br from-[#4318FF] to-[#868CFF] rounded-[30px] p-10 text-white overflow-hidden shadow-2xl shadow-indigo-500/40 cursor-pointer group" onClick={() => setView(View.SPEAKING)}>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.05] rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-700 group-hover:opacity-[0.1]"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00BCD4] opacity-[0.2] rounded-full -ml-20 -mb-20 blur-3xl"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between min-h-[280px]">
              <div>
                 <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">Recommended for you</span>
                 <h3 className="text-4xl font-bold mt-6 mb-4 leading-tight">Master Speaking <br/>with AI Tutor</h3>
                 <p className="text-indigo-100 text-lg max-w-lg leading-relaxed">
                    Practice real-world conversations in a safe environment. Get instant feedback on pronunciation and grammar.
                 </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                 <button className="bg-white text-[#4318FF] px-8 py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:bg-indigo-50 transition-all flex items-center">
                    Start Session 
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
                 <span className="text-indigo-200 font-medium text-sm">~15 mins session</span>
              </div>
           </div>
        </div>

        {/* Quick Actions List */}
        <div className="bg-white rounded-[30px] p-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
           <h3 className="text-xl font-bold text-[#1B2559] mb-6">Explore Features</h3>
           <div className="space-y-4">
              {[
                { id: View.NEWS, label: 'Daily News', desc: 'Read world news adapted to your level', icon: '📰', color: 'bg-emerald-100 text-emerald-600' },
                { id: View.WRITING, label: 'Writing Lab', desc: 'Get AI corrections on your essays', icon: '✍️', color: 'bg-purple-100 text-purple-600' },
                { id: View.LIBRARY, label: 'Library', desc: 'Read books and short stories', icon: '📚', color: 'bg-orange-100 text-orange-600' },
              ].map((item, i) => (
                <div 
                    key={i} 
                    onClick={() => setView(item.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F4F7FE] cursor-pointer transition-colors group"
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}>
                        {item.icon}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[#1B2559] font-bold group-hover:text-[#4318FF] transition-colors">{item.label}</h4>
                        <p className="text-xs text-[#A3AED0] line-clamp-1">{item.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-[#A3AED0] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;