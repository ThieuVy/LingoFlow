import React, { useState, useEffect } from 'react';
import { supabase, fetchFullUserProfile } from './services/supabase';
import Navigation from './components/layout/Navigation';
import Dashboard from './features/dashboard/Dashboard';
import ContentReader from './features/reader/ContentReader';
import SpeakingPractice from './features/practice/SpeakingPractice';
import WritingLab from './features/practice/WritingLab';
import DailyNews from './features/library/DailyNews';
import Library from './features/library/Library';
import TestPractice from './features/practice/TestPractice';
import Dictionary from './features/library/Dictionary';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import VerifyEmail from './features/auth/VerifyEmail';
import Profile from './features/profile/Profile';
import EditProfile from './features/profile/EditProfile';
import { View, UserStats, UserProfile } from './types/types';

enum AuthState {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
  VERIFY_EMAIL,
  AUTHENTICATED
}

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // ... (Giữ nguyên logic state User và Stats như cũ)
  const [user, setUser] = useState<UserProfile>({
    name: 'Guest',
    email: '',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Spanish',
    plan: 'Free',
    joinDate: new Date().toLocaleDateString()
  });
  const [stats, setStats] = useState<UserStats>({
    vocabularySize: 0, listeningHours: 0, speakingMinutes: 0, currentStreak: 0, level: 'A1', totalPoints: 0
  });

  // ... (Giữ nguyên useEffect Authentication như cũ)
  useEffect(() => {
    const updateFromSession = (session: any) => {
      if (session?.user) {
        const { user_metadata, email } = session.user;
        setUser(prev => ({ ...prev, name: user_metadata?.full_name || prev.name, avatar: user_metadata?.avatar_url || prev.avatar, email: email || prev.email }));
        setAuthState(AuthState.AUTHENTICATED);
        loadUserData(session.user.id);
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) updateFromSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) updateFromSession(session);
      else { setAuthState(AuthState.LOGIN); setUser({ ...user, name: 'Guest' }); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
      setLoadingData(true);
      const data = await fetchFullUserProfile(userId);
      if (data) { setUser(prev => ({...prev, ...data.profile})); setStats(data.stats); }
      setLoadingData(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState(AuthState.LOGIN);
  };

  // --- Render View Logic ---
  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard stats={stats} setView={setCurrentView} user={user} />;
      case View.READER: return <ContentReader />;
      case View.SPEAKING: return <SpeakingPractice />;
      case View.WRITING: return <WritingLab />;
      case View.NEWS: return <DailyNews />;
      case View.LIBRARY: return <Library />;
      case View.TESTS: return <TestPractice />;
      case View.DICTIONARY: return <Dictionary />;
      case View.PROFILE: return <Profile user={user} stats={stats} onLogout={handleLogout} onEditClick={() => setCurrentView(View.EDIT_PROFILE)} />;
      case View.EDIT_PROFILE: return <EditProfile user={user} onCancel={() => setCurrentView(View.PROFILE)} onSaveSuccess={(u) => { setUser(u); setCurrentView(View.PROFILE); }} />;
      default: return <Dashboard stats={stats} setView={setCurrentView} user={user} />;
    }
  };

  if (authState === AuthState.LOGIN) return <Login onLogin={() => {}} onRegisterClick={() => setAuthState(AuthState.REGISTER)} onForgotClick={() => setAuthState(AuthState.FORGOT_PASSWORD)} />;
  if (authState === AuthState.REGISTER) return <Register onRegisterSuccess={() => setAuthState(AuthState.VERIFY_EMAIL)} onLoginClick={() => setAuthState(AuthState.LOGIN)} />;
  if (authState === AuthState.FORGOT_PASSWORD) return <ForgotPassword onBackToLogin={() => setAuthState(AuthState.LOGIN)} />;
  if (authState === AuthState.VERIFY_EMAIL) return <VerifyEmail onBackToLogin={() => setAuthState(AuthState.LOGIN)} />;

  // FIX RESPONSIVE: Thêm overflow-hidden để tránh scroll ngang toàn trang
  return (
    <div className="flex bg-[#F4F7FE] min-h-screen w-full font-sans text-[#2B3674] selection:bg-[#4318FF] selection:text-white overflow-hidden">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      {/* Main Content Area: Fix Width & Scroll */}
      <main className={`flex-1 transition-all duration-300 relative h-screen overflow-y-auto overflow-x-hidden ${isSidebarCollapsed ? 'ml-24' : 'ml-80'}`}>
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#F4F7FE] via-[#F4F7FE] to-[#F4F7FE] -z-10"></div>
        <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#4318FF] opacity-[0.03] blur-[120px] pointer-events-none"></div>
        <div className="fixed top-[20%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#00BCD4] opacity-[0.05] blur-[100px] pointer-events-none"></div>
        
        <div className="w-full max-w-full">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;