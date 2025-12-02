import React, { useState } from 'react';
import { UserStats, UserProfile, HistoryItem } from '../../types';

interface ProfileProps {
  user: UserProfile;
  stats: UserStats;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, stats, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');
  const [editForm, setEditForm] = useState(user);

  // Mock History
  const history: HistoryItem[] = [
    { id: '1', title: 'Tech Trends 2024', type: 'Article', date: 'Oct 24, 2023', status: 'Completed' },
    { id: '2', title: 'The Lost Key', type: 'Story', date: 'Oct 23, 2023', status: 'In Progress' },
    { id: '3', title: 'Essay on Climate', type: 'Writing', date: 'Oct 20, 2023', score: 85, status: 'Completed' },
  ];

  const handleSave = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50">
      {/* Cover Image */}
      <div className="h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 -mt-20 pb-12">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between relative mb-8 backdrop-blur-sm bg-white/90">
          <div className="flex items-end w-full sm:w-auto">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt="Profile" 
                  className="w-full h-full rounded-2xl object-cover bg-white"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-4 border-white">
                {stats.level}
              </div>
            </div>
            
            <div className="ml-6 mb-2 flex-1">
              {isEditing ? (
                  <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="text-xl font-bold border-b border-slate-300 focus:border-blue-500 outline-none"
                      />
                      <input 
                        type="text" 
                        value={editForm.email} 
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                        className="block text-sm text-slate-500 border-b border-slate-300 focus:border-blue-500 outline-none"
                      />
                  </div>
              ) : (
                  <>
                    <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                    <p className="text-slate-500 font-medium">{user.email}</p>
                  </>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                  {user.plan} Plan
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-sm">Joined {user.joinDate}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex space-x-3 w-full sm:w-auto">
             {isEditing ? (
                 <>
                    <button onClick={handleSave} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                        Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">
                        Cancel
                    </button>
                 </>
             ) : (
                 <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        Edit Profile
                    </button>
                    <button onClick={onLogout} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all shadow-sm">
                        Sign Out
                    </button>
                 </>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-slate-200 mb-8">
            <button 
                onClick={() => setActiveTab('stats')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Statistics
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Activity History
            </button>
        </div>

        {activeTab === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Left Column: Stats */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Learning Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <div className="text-blue-500 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{stats.vocabularySize}</div>
                      <div className="text-sm text-slate-500">Words Learned</div>
                   </div>
                   <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                      <div className="text-purple-500 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{stats.listeningHours}h</div>
                      <div className="text-sm text-slate-500">Listening Time</div>
                   </div>
                   <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                      <div className="text-orange-500 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{stats.currentStreak}</div>
                      <div className="text-sm text-slate-500">Day Streak</div>
                   </div>
                   <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                      <div className="text-teal-500 mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{stats.totalPoints}</div>
                      <div className="text-sm text-slate-500">Total Points</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-8">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-6">Language Settings</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-slate-400 uppercase">Native Language</label>
                         <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 flex justify-between items-center">
                             {user.nativeLanguage}
                         </div>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-400 uppercase">Target Language</label>
                         <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 flex justify-between items-center">
                             {user.targetLanguage}
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
        ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {history.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    item.type === 'Article' ? 'bg-blue-100 text-blue-600' :
                                    item.type === 'Story' ? 'bg-purple-100 text-purple-600' :
                                    item.type === 'Writing' ? 'bg-orange-100 text-orange-600' :
                                    'bg-teal-100 text-teal-600'
                                }`}>
                                   {item.type === 'Article' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" /></svg>}
                                   {item.type === 'Story' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                   {item.type === 'Writing' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-400">{item.type} • {item.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {item.status === 'Completed' ? (
                                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Completed {item.score ? `(${item.score})` : ''}</span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">In Progress</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
