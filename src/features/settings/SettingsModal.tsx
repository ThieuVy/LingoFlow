import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2559]/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[30px] w-full max-w-lg shadow-2xl p-8 relative animate-scaleIn">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#A3AED0] hover:text-[#1B2559]">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-bold text-[#1B2559] mb-6">Settings</h2>
        
        <div className="space-y-6">
            {/* Account */}
            <div>
                <h3 className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-3">Account</h3>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-[#4318FF]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                        <span className="font-bold text-[#1B2559]">Public Profile</span>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle-checkbox w-10 h-6 rounded-full bg-slate-200 appearance-none checked:bg-[#4318FF] cursor-pointer transition-colors relative after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-1 after:left-1 checked:after:left-5 after:transition-all" />
                </div>
            </div>

            {/* Preferences */}
            <div>
                <h3 className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider mb-3">Preferences</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E9EDF7] hover:border-[#4318FF] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                             <span className="text-xl">🌙</span>
                             <span className="font-bold text-[#1B2559]">Dark Mode</span>
                        </div>
                        <span className="text-sm text-[#A3AED0] group-hover:text-[#4318FF]">Off</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E9EDF7] hover:border-[#4318FF] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                             <span className="text-xl">🔔</span>
                             <span className="font-bold text-[#1B2559]">Notifications</span>
                        </div>
                        <span className="text-sm text-[#4318FF] font-bold">On</span>
                    </div>
                </div>
            </div>
            
            {/* Danger Zone */}
            <div>
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Danger Zone</h3>
                <button className="w-full p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 font-bold text-left hover:bg-rose-100 transition-colors">
                    Delete Account
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;