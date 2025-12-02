import React from 'react';
import { View } from '../../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  userAvatar?: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, userAvatar, isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: View.NEWS, label: 'Daily News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: View.LIBRARY, label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: View.DICTIONARY, label: 'Dictionary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: View.SPEAKING, label: 'Live Speaking', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: View.WRITING, label: 'Writing Lab', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { id: View.TESTS, label: 'Exams', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-slate-900 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-all duration-300`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-500 z-50 border border-slate-900"
      >
        <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className={`p-6 ${isCollapsed ? 'items-center' : ''} flex flex-col`}>
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg">LF</div>
            {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap animate-fadeIn">
                    <h1 className="text-xl font-bold text-white">LingoFlow</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">AI Mastery</p>
                </div>
            )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'} py-3.5 rounded-xl transition-all duration-200 group relative ${
              currentView === item.id ? 'bg-blue-600 text-white shadow-blue-900/50 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
            {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            
            {/* Tooltip when collapsed */}
            {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                    {item.label}
                </div>
            )}
          </button>
        ))}
      </nav>

      {/* Settings & Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4 space-x-3'} py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2 group relative`}>
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
             {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                    Settings
                </div>
            )}
        </button>

        <button onClick={() => setView(View.PROFILE)} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'p-2 space-x-3'} rounded-xl hover:bg-slate-800 transition-colors`}>
          <img src={userAvatar || "https://ui-avatars.com/api/?name=User"} className="w-9 h-9 rounded-full border-2 border-slate-700 object-cover" alt="User" />
          {!isCollapsed && (
            <div className="text-left overflow-hidden animate-fadeIn">
              <p className="text-sm font-semibold text-white truncate">John Doe</p>
              <p className="text-xs text-blue-400 font-medium">Pro Plan</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navigation;