import React from 'react';
import { UserStats, UserProfile } from '../../types/types';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onLogout: () => void;
  onEditClick: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, stats, onLogout, onEditClick }) => {
  return (
    <div className="min-h-screen p-8 bg-[#F4F7FE] dark:bg-slate-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Luxury Glass Card */}
        <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/20 dark:border-slate-700">
            
            {/* Header Art */}
            <div className="h-64 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4318FF] via-[#7B2CBF] to-[#FF006E] opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                
                {/* Stats Overlay */}
                <div className="absolute bottom-6 right-8 flex gap-6 text-white/90">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{stats.totalPoints}</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-70">Points</p>
                    </div>
                    <div className="w-px bg-white/20"></div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{stats.currentStreak} 🔥</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-70">Streak</p>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-10 pb-10 relative">
                {/* Avatar Floating */}
                <div className="absolute -top-16 left-10 p-2 bg-white dark:bg-slate-800 rounded-[30px] shadow-2xl">
                    <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-[24px] object-cover"
                    />
                </div>

                <div className="ml-40 pt-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1B2559] dark:text-white tracking-tight">{user.name}</h1>
                        <p className="text-[#A3AED0] dark:text-slate-400 font-medium">{user.email}</p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/20">Level {stats.level}</span>
                            <span className="px-3 py-1 bg-white border border-[#E9EDF7] dark:bg-slate-700 dark:border-slate-600 text-[#1B2559] dark:text-slate-300 text-xs font-bold rounded-lg uppercase">{user.plan} Member</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onEditClick} className="px-6 py-3 rounded-2xl bg-[#F4F7FE] dark:bg-slate-700 text-[#4318FF] dark:text-blue-400 font-bold hover:bg-[#E9EDF7] dark:hover:bg-slate-600 transition-colors">
                            Edit
                        </button>
                        <button onClick={onLogout} className="px-6 py-3 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-[24px] bg-[#F4F7FE] dark:bg-slate-700/50 hover:bg-[#eef2ff] transition-colors group cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-[#A3AED0] dark:text-slate-400 uppercase tracking-wide">Reading Hours</span>
                            <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-[#4318FF] dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">📚</div>
                        </div>
                        <p className="text-3xl font-black text-[#1B2559] dark:text-white">{stats.readingHours.toFixed(1)}<span className="text-lg text-[#A3AED0] ml-1 font-medium">hrs</span></p>
                        <p className="text-xs text-[#A3AED0] mt-2 leading-relaxed">Total time spent reading books & news.</p>
                    </div>

                    <div className="p-6 rounded-[24px] bg-[#FFF8F5] dark:bg-orange-900/10 hover:bg-[#fff0e6] transition-colors group cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-[#A3AED0] dark:text-slate-400 uppercase tracking-wide">Speaking</span>
                            <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-orange-500 shadow-sm group-hover:scale-110 transition-transform">🎙️</div>
                        </div>
                        <p className="text-3xl font-black text-[#1B2559] dark:text-white">{stats.speakingMinutes}<span className="text-lg text-[#A3AED0] ml-1 font-medium">mins</span></p>
                        <p className="text-xs text-[#A3AED0] mt-2 leading-relaxed">Practice time with AI Tutor.</p>
                    </div>

                    <div className="p-6 rounded-[24px] bg-[#F6F8FD] dark:bg-cyan-900/10 hover:bg-[#eaf0ff] transition-colors group cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-[#A3AED0] dark:text-slate-400 uppercase tracking-wide">Vocabulary</span>
                            <div className="p-2 bg-white dark:bg-slate-600 rounded-xl text-cyan-500 shadow-sm group-hover:scale-110 transition-transform">🧠</div>
                        </div>
                        <p className="text-3xl font-black text-[#1B2559] dark:text-white">{stats.vocabularySize}<span className="text-lg text-[#A3AED0] ml-1 font-medium">words</span></p>
                        <p className="text-xs text-[#A3AED0] mt-2 leading-relaxed">Words saved & mastered.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;