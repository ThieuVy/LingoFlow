import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/types';

interface NavigationProps {
  user: UserProfile;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Map path to label/icon
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/news', label: 'Daily News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { path: '/library', label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/dictionary', label: 'Dictionary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/speaking', label: 'Live Speaking', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { path: '/writing', label: 'Writing Lab', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { path: '/tests', label: 'Exams', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-80'} bg-white dark:bg-slate-900 h-screen fixed left-0 top-0 flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.02)] z-50 transition-all duration-300 border-r border-slate-100 dark:border-slate-800`}>
      {/* Brand */}
      <div className={`p-8 ${isCollapsed ? 'items-center' : ''} flex flex-col justify-center min-h-[100px]`}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4318FF] to-[#868CFF] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">LF</div>
            {!isCollapsed && <h1 className="text-2xl font-bold text-[#1B2559] dark:text-white tracking-tight animate-fadeIn">LingoFlow</h1>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar my-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-5'} py-4 rounded-2xl transition-all duration-300 group relative mb-1 ${isActive ? 'bg-gradient-to-r from-[#4318FF] to-[#7050FF] text-white shadow-xl shadow-indigo-500/20' : 'text-[#A3AED0] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#4318FF] dark:hover:text-white'}`}
            >
              <svg className={`w-6 h-6 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-current'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {!isCollapsed && <span className="font-bold text-sm ml-4 whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* ... (Phần Profile/Settings giữ nguyên logic nhưng dùng navigate('/profile')) ... */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
         {/* ... Settings & Notifs Buttons ... */}
         <button onClick={() => navigate('/profile')} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'p-3 bg-gradient-to-br from-[#F4F7FE] to-white dark:from-slate-800 dark:to-slate-700 border border-[#E9EDF7] dark:border-slate-700'} rounded-2xl hover:shadow-md transition-all group`}>
            {/* ... Avatar User ... */}
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=4318FF&color=fff`} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm" alt="User" />
            {!isCollapsed && <div className="ml-3 overflow-hidden"><p className="text-sm font-bold text-[#1B2559] dark:text-white truncate">{user.name}</p></div>}
         </button>
      </div>
      
      {/* Collapse Toggle */}
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-24 bg-white dark:bg-slate-900 text-[#A3AED0] dark:text-slate-400 p-1.5 rounded-full shadow-lg border border-slate-100 z-50">
        <svg className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    </div>
  );
};

export default Navigation;