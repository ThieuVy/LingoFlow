import React from 'react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifs = [
      { id: 1, title: "Daily Goal Achieved!", desc: "You reached 45 mins of learning today.", time: "2h ago", type: "success", icon: "🏆" },
      { id: 2, title: "New Article Available", desc: "Tech Trends 2025 is now in your library.", time: "5h ago", type: "info", icon: "📰" },
      { id: 3, title: "Streak Risk", desc: "Don't forget to practice speaking today!", time: "1d ago", type: "warning", icon: "🔥" }
  ];

  return (
    <>
        <div className="fixed inset-0 z-40" onClick={onClose}></div>
        <div className="absolute left-24 bottom-20 w-80 bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-[#E9EDF7] z-50 p-5 animate-slideUp origin-bottom-left">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1B2559] text-lg">Notifications</h3>
                <span className="text-xs font-bold bg-[#4318FF] text-white px-2 py-0.5 rounded-full">3</span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifs.map(n => (
                    <div key={n.id} className="flex gap-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${n.type === 'success' ? 'bg-green-100' : n.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                            {n.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#1B2559] leading-tight">{n.title}</h4>
                            <p className="text-xs text-[#A3AED0] mt-1 line-clamp-2">{n.desc}</p>
                            <span className="text-[10px] text-[#A3AED0] font-medium mt-1 block">{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="pt-3 mt-2 border-t border-[#E9EDF7] text-center">
                <button className="text-xs font-bold text-[#4318FF] hover:underline">Mark all as read</button>
            </div>
        </div>
    </>
  );
};

export default NotificationsPanel;