import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/supabase';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ThemeOption = 'light' | 'dark' | 'system';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth(); 
    const [settings, setSettings] = useState({
        publicProfile: true,
        theme: 'system' as ThemeOption,
        notifications: true
    });
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            let currentTheme: ThemeOption = 'system';
            if (parsed.theme) currentTheme = parsed.theme;
            else if (typeof parsed.darkMode !== 'undefined') currentTheme = parsed.darkMode ? 'dark' : 'light';

            setSettings(prev => ({ ...prev, ...parsed, theme: currentTheme }));
        }
    }, []);

    const updateTheme = async (newTheme: ThemeOption) => {
        // 1. Cập nhật UI ngay lập tức
        const newSettings = { ...settings, theme: newTheme };
        setSettings(newSettings);
        localStorage.setItem('app_settings', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('theme-change')); // Trigger layout update

        // 2. Cố gắng đồng bộ lên server (Backend)
        if (user && user.id) {
            try {
                await updateUserProfile(user.id, { themePreference: newTheme });
            } catch (e) {
                console.warn("Theme sync failed (backend might restrict this field):", e);
            }
        }
    };

    const toggleSetting = (key: keyof typeof settings) => {
        if (key === 'theme') return;
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        localStorage.setItem('app_settings', JSON.stringify(newSettings));
    };

    const handleDeleteAccount = () => { setShowDeleteConfirm(true); };
    const confirmDelete = () => {
        alert("Account deletion request sent.");
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2559]/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-[30px] w-full max-w-lg shadow-2xl p-8 relative animate-scaleIn border border-transparent dark:border-slate-700 transition-colors duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 hover:opacity-70 text-[#A3AED0] dark:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-[#1B2559] dark:text-white">Settings</h2>
                
                {!showDeleteConfirm ? (
                    <div className="space-y-6">
                        {/* --- THEME SETTINGS --- */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#A3AED0] dark:text-slate-400">Appearance</h3>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F7FE] dark:bg-slate-700 rounded-2xl">
                                {(['light', 'dark', 'system'] as ThemeOption[]).map((themeOption) => (
                                    <button
                                        key={themeOption}
                                        onClick={() => updateTheme(themeOption)}
                                        className={`py-2 px-3 rounded-xl text-sm font-bold capitalize transition-all duration-200 flex items-center justify-center gap-2
                                            ${settings.theme === themeOption 
                                                ? 'bg-white dark:bg-slate-600 text-[#4318FF] dark:text-white shadow-sm' 
                                                : 'text-[#A3AED0] hover:text-[#1B2559] dark:hover:text-slate-300'}`}
                                    >
                                        {themeOption === 'light' && '☀️ Light'}
                                        {themeOption === 'dark' && '🌙 Dark'}
                                        {themeOption === 'system' && '💻 System'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferences */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#A3AED0] dark:text-slate-400">Preferences</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E9EDF7] dark:border-slate-600 hover:border-[#4318FF] dark:hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => toggleSetting('publicProfile')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-600 text-[#4318FF] dark:text-indigo-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="font-bold text-[#1B2559] dark:text-white">Public Profile</span>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full relative transition-colors ${settings.publicProfile ? 'bg-[#4318FF]' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform ${settings.publicProfile ? 'translate-x-full' : ''}`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E9EDF7] dark:border-slate-600 hover:border-[#4318FF] dark:hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => toggleSetting('notifications')}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🔔</span>
                                        <span className="font-bold text-[#1B2559] dark:text-white">Notifications</span>
                                    </div>
                                    <span className={`text-sm font-bold ${settings.notifications ? 'text-[#4318FF] dark:text-indigo-400' : 'text-[#A3AED0]'}`}>
                                        {settings.notifications ? 'On' : 'Off'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Danger Zone */}
                        <div>
                            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Danger Zone</h3>
                            <button onClick={handleDeleteAccount} className="w-full p-4 rounded-2xl border border-rose-200/30 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 font-bold text-left hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors flex items-center justify-between group">
                                <span>Delete Account</span>
                                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 animate-fadeIn">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[#1B2559] dark:text-white">Are you sure?</h3>
                        <p className="mb-8 text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 font-bold rounded-xl transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg">Yes, Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;