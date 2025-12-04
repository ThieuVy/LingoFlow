import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllNotificationsRead, deleteNotification } from '../../services/supabase';
import { AppNotification } from '../../types/types';
import { formatTimeAgo } from '../../utils/formatDate';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Load notifications khi panel mở
  useEffect(() => {
      if (isOpen && user) {
          loadData();
      }
  }, [isOpen, user]);

  const loadData = async () => {
      setLoading(true);
      if (user) {
          const data = await getNotifications(user.id);
          setNotifications(data);
      }
      setLoading(false);
  };

  const handleMarkAllRead = async () => {
      if (!user) return;
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleClearAll = () => {
      // Vì Supabase không có hàm xóa all (để an toàn), ta xóa local state demo
      // Trong thực tế sẽ gọi API xóa hết
      if (window.confirm("Clear all notifications?")) {
          setNotifications([]);
      }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
        <div className="fixed inset-0 z-40" onClick={onClose}></div>
        <div className="absolute left-24 bottom-20 w-80 bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E9EDF7] dark:border-slate-700 z-50 p-5 animate-slideUp origin-bottom-left">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1B2559] dark:text-white text-lg">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && <span className="text-xs font-bold bg-[#4318FF] text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    {notifications.length > 0 && (
                        <button onClick={handleClearAll} className="text-xs text-[#A3AED0] hover:text-rose-500 p-1" title="Clear All">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="text-center py-4 text-[#A3AED0]">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 opacity-50">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-sm text-[#A3AED0]">No notifications</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id} 
                            className={`flex gap-3 p-3 rounded-xl transition-all cursor-pointer group relative ${n.is_read ? 'bg-white dark:bg-slate-800 opacity-60' : 'bg-[#F4F7FE] dark:bg-slate-700'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${n.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : n.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                {n.icon || '🔔'}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-bold leading-tight ${n.is_read ? 'text-[#A3AED0]' : 'text-[#1B2559] dark:text-white'}`}>{n.title}</h4>
                                    {!n.is_read && <div className="w-2 h-2 bg-[#4318FF] rounded-full mt-1"></div>}
                                </div>
                                <p className="text-xs text-[#A3AED0] mt-1 line-clamp-2">{n.description}</p>
                                <span className="text-[10px] text-[#A3AED0] font-medium mt-1 block">{formatTimeAgo(n.created_at)}</span>
                            </div>
                            
                            <button 
                                onClick={(e) => handleDismiss(n.id, e)}
                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            {unreadCount > 0 && (
                <div className="pt-3 mt-2 border-t border-[#E9EDF7] dark:border-slate-700 text-center">
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#4318FF] hover:underline">Mark all as read</button>
                </div>
            )}
        </div>
    </>
  );
};

export default NotificationsPanel;