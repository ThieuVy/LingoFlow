import React, { useState, useEffect } from 'react';
import { supabase, getHistoryList } from '../../services/supabase';
import { UserStats, UserProfile } from '../../types';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onLogout: () => void;
  onEditClick: () => void; // Chuyển sang màn hình Edit
}

const Profile: React.FC<ProfileProps> = ({ user, stats, onLogout, onEditClick }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
      const loadHistory = async () => {
          setLoadingHistory(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const list = await getHistoryList(user.id);
              setHistory(list || []);
          }
          setLoadingHistory(false);
      };
      loadHistory();
  }, []);

  return (
    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto">
      {/* Profile Header (Glassmorphism Banner) */}
      <div className="relative rounded-[30px] overflow-hidden bg-white shadow-xl shadow-slate-100/50 mb-8 animate-fadeIn">
         {/* Background Cover */}
         <div className="h-48 w-full bg-gradient-to-r from-[#4318FF] to-[#00BCD4] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
         </div>

         <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 relative z-10">
            {/* Avatar */}
            <div className="p-1.5 bg-white rounded-full shadow-lg">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-50"
                />
            </div>
            
            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1B2559]">{user.name}</h1>
                        <p className="text-[#A3AED0] font-medium mt-1">{user.email}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 rounded-lg bg-[#E9EDF7] text-[#4318FF] text-xs font-bold uppercase tracking-wider">{user.plan} Plan</span>
                            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100">Level {stats.level}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6 md:mt-0">
                        <button onClick={onEditClick} className="px-6 py-3 bg-[#4318FF] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-[#3311CC] transition-all flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Profile
                        </button>
                        <button onClick={onLogout} className="px-6 py-3 bg-white border border-[#E9EDF7] text-rose-500 font-bold rounded-xl hover:bg-rose-50 transition-all">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Column - Stats Overview */}
         <div className="xl:col-span-1 space-y-8">
            <div className="bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
                <h3 className="text-lg font-bold text-[#1B2559] mb-6">General Information</h3>
                <div className="space-y-6">
                    <div className="p-4 rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] bg-white flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#F4F7FE] text-[#4318FF]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-[#A3AED0]">Native Language</p>
                            <p className="text-base font-bold text-[#1B2559]">{user.nativeLanguage}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] bg-white flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#F4F7FE] text-[#00BCD4]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-[#A3AED0]">Target Language</p>
                            <p className="text-base font-bold text-[#1B2559]">{user.targetLanguage}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] bg-white flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#F4F7FE] text-orange-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-[#A3AED0]">Joined Date</p>
                            <p className="text-base font-bold text-[#1B2559]">{user.joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
                <h3 className="text-lg font-bold text-[#1B2559] mb-6">Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F4F7FE] to-white rounded-2xl border border-[#E9EDF7]">
                        <span className="text-3xl font-bold text-[#4318FF]">{stats.vocabularySize}</span>
                        <span className="text-xs text-[#A3AED0] mt-1 uppercase tracking-wide">Words</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F4F7FE] to-white rounded-2xl border border-[#E9EDF7]">
                        <span className="text-3xl font-bold text-[#00BCD4]">{stats.listeningHours}h</span>
                        <span className="text-xs text-[#A3AED0] mt-1 uppercase tracking-wide">Listening</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F4F7FE] to-white rounded-2xl border border-[#E9EDF7]">
                        <span className="text-3xl font-bold text-orange-500">{stats.currentStreak}</span>
                        <span className="text-xs text-[#A3AED0] mt-1 uppercase tracking-wide">Day Streak</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F4F7FE] to-white rounded-2xl border border-[#E9EDF7]">
                        <span className="text-3xl font-bold text-purple-600">{stats.totalPoints}</span>
                        <span className="text-xs text-[#A3AED0] mt-1 uppercase tracking-wide">Points</span>
                    </div>
                </div>
            </div>
         </div>

         {/* Right Column - Activity History */}
         <div className="xl:col-span-2">
            <div className="bg-white rounded-[20px] p-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)] min-h-[500px]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-[#1B2559]">Learning History</h3>
                    <button className="p-2 bg-[#F4F7FE] text-[#4318FF] rounded-lg hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    </button>
                </div>

                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#A3AED0]">Retrieving data...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#E9EDF7] rounded-3xl">
                        <svg className="w-12 h-12 text-[#A3AED0] mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[#A3AED0] italic">No learning history recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="group flex items-center justify-between p-5 bg-white border border-[#E9EDF7] rounded-2xl hover:shadow-[0_18px_40px_rgba(112,144,176,0.12)] transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                                        item.type === 'Article' ? 'bg-blue-100 text-blue-600' :
                                        item.type === 'Story' ? 'bg-purple-100 text-purple-600' :
                                        item.type === 'Writing' ? 'bg-orange-100 text-orange-600' :
                                        'bg-teal-100 text-teal-600'
                                    }`}>
                                        {item.type === 'Article' ? '📰' : item.type === 'Story' ? '📖' : item.type === 'Writing' ? '✍️' : '🗣️'}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-[#1B2559] group-hover:text-[#4318FF] transition-colors">{item.title}</h4>
                                        <p className="text-sm text-[#A3AED0] mt-1 flex items-center gap-2">
                                            {item.type}
                                            <span className="w-1 h-1 rounded-full bg-[#A3AED0]"></span>
                                            {new Date(item.created_at || item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    {item.status === 'Completed' ? (
                                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Done
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider">In Progress</span>
                                    )}
                                    {item.score > 0 && (
                                        <span className="text-sm font-bold text-[#1B2559] mt-2">{item.score} pts</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;