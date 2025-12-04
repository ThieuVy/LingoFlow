import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { View } from '../../types/types';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: View;
    setView: (view: View) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, setView }) => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // --- LOGIC MỚI: Xử lý Theme (Light / Dark / System) ---
    useEffect(() => {
        const applyTheme = () => {
            const savedSettings = localStorage.getItem('app_settings');
            let theme = 'system'; // Mặc định
            
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Ưu tiên format mới (theme), fallback cũ (darkMode)
                if (parsed.theme) {
                    theme = parsed.theme;
                } else if (typeof parsed.darkMode !== 'undefined') {
                    theme = parsed.darkMode ? 'dark' : 'light';
                }
            }

            const root = document.documentElement;
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (theme === 'dark' || (theme === 'system' && isSystemDark)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        // 1. Áp dụng ngay khi load
        applyTheme();

        // 2. Lắng nghe thay đổi hệ thống
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
            if (!settings.theme || settings.theme === 'system') {
                applyTheme();
            }
        };
        mediaQuery.addEventListener('change', handleSystemChange);

        // 3. Lắng nghe thay đổi từ SettingsModal (event custom)
        window.addEventListener('theme-change', applyTheme);
        window.addEventListener('storage', applyTheme);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange);
            window.removeEventListener('theme-change', applyTheme);
            window.removeEventListener('storage', applyTheme);
        };
    }, []);

    if (!user) return <>{children}</>;

    return (
        <div className="flex bg-[#F4F7FE] dark:bg-slate-900 min-h-screen w-full font-sans text-[#2B3674] dark:text-slate-200 selection:bg-[#4318FF] selection:text-white overflow-hidden transition-colors duration-300">
            <Navigation 
                currentView={currentView} 
                setView={setView} 
                user={user} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            
            <main className={`flex-1 transition-all duration-300 relative h-screen overflow-y-auto overflow-x-hidden ${isCollapsed ? 'ml-24' : 'ml-80'}`}>
                {/* Background Gradients */}
                <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#F4F7FE] dark:from-slate-900 via-[#F4F7FE] dark:via-slate-900 to-transparent -z-10"></div>
                <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#4318FF] opacity-[0.03] dark:opacity-[0.1] blur-[120px] pointer-events-none"></div>
                
                <div className="w-full max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;