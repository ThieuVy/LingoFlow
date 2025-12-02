import React from 'react';
import { UserStats } from '../../types';
import { View } from '../../types';

interface DashboardProps {
  stats: UserStats;
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, setView }) => {
  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
        <div>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Morning, John!</h2>
            <p className="text-slate-500 mt-2 text-lg">Ready to continue your journey to fluency?</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
             <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Today's Goal</span>
             <div className="text-2xl font-bold text-indigo-600">45 / 60 mins</div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Vocabulary', value: stats.vocabularySize, sub: '+15 words', icon: '📚', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Listening', value: `${stats.listeningHours}h`, sub: 'Target: 100h', icon: '🎧', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Streak', value: stats.currentStreak, sub: 'Keep it up!', icon: '🔥', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Level', value: stats.level, sub: 'Intermediate', icon: '🏆', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
        ].map((stat, i) => (
          <div key={i} className={`group bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} text-xl`}>{stat.icon}</div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Stat</div>
            </div>
            <div className="text-3xl font-bold text-slate-800 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium mt-1">{stat.label}</div>
            <div className={`text-xs mt-3 font-semibold ${stat.color} opacity-80`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Action Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20 cursor-pointer" onClick={() => setView(View.SPEAKING)}>
           {/* Abstract Background Shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-blue-500/30"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-3xl transition-all duration-700 group-hover:bg-purple-500/30"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                    <span className="bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">Recommended</span>
                    <h3 className="text-3xl font-bold mt-4 mb-2">Live Conversation Practice</h3>
                    <p className="text-slate-300 max-w-lg text-lg leading-relaxed">
                        Connect with Gemini Live AI to practice real-world scenarios. 
                        Improve your pronunciation and fluency instantly.
                    </p>
               </div>
               <div className="mt-8 flex items-center space-x-4">
                   <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 flex items-center">
                        Start Session 
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </button>
                   <span className="text-sm text-slate-400 font-medium">~15 mins</span>
               </div>
           </div>
        </div>

        {/* Sidebar Suggestions */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 px-1">Quick Actions</h3>
            
            <div 
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center space-x-4 group"
                onClick={() => setView(View.NEWS)}
            >
               <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
               </div>
               <div>
                 <h4 className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Daily News</h4>
                 <p className="text-xs text-slate-400">Read today's top stories</p>
               </div>
            </div>

            <div 
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer flex items-center space-x-4 group"
                onClick={() => setView(View.WRITING)}
            >
               <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               </div>
               <div>
                 <h4 className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">Writing Lab</h4>
                 <p className="text-xs text-slate-400">Analyze your text</p>
               </div>
            </div>

            <div 
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer flex items-center space-x-4 group"
                onClick={() => setView(View.READER)}
            >
               <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               </div>
               <div>
                 <h4 className="font-bold text-slate-700 group-hover:text-orange-700 transition-colors">Reader</h4>
                 <p className="text-xs text-slate-400">Import & study content</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
