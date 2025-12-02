import React, { useState } from 'react';
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
import Profile from './features/profile/Profile';
import { View, UserStats, UserProfile, NewsArticle } from './types';

// Auth State Enum
enum AuthState {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
  AUTHENTICATED
}

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOGIN);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New layout state
  
  // Data State for passing content to Reader (legacy support for Library/News redirects)
  const [readerContent, setReaderContent] = useState<{content: string, title: string} | undefined>(undefined);

  // Mock User Data
  const [user, setUser] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Spanish',
    plan: 'Pro',
    joinDate: 'Sept 2023'
  });

  // Mock Stats
  const [stats] = useState<UserStats>({
    vocabularySize: 1240,
    listeningHours: 42,
    speakingMinutes: 180,
    currentStreak: 5,
    level: 'B2',
    totalPoints: 4500
  });

  const handleLogin = () => {
    setAuthState(AuthState.AUTHENTICATED);
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setAuthState(AuthState.LOGIN);
    setReaderContent(undefined);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard stats={stats} setView={setCurrentView} />;
      case View.READER:
        return <ContentReader initialContent={readerContent?.content} initialTitle={readerContent?.title} />;
      case View.SPEAKING:
        return <SpeakingPractice />;
      case View.WRITING:
        return <WritingLab />;
      case View.NEWS:
        return <DailyNews />;
      case View.LIBRARY:
        return <Library />;
      case View.TESTS:
        return <TestPractice />;
      case View.DICTIONARY:
        return <Dictionary />;
      case View.PROFILE:
        return <Profile user={user} stats={stats} onLogout={handleLogout} onUpdateUser={setUser} />;
      default:
        return <Dashboard stats={stats} setView={setCurrentView} />;
    }
  };

  // Auth Routing
  if (authState === AuthState.LOGIN) {
    return <Login onLogin={handleLogin} onRegisterClick={() => setAuthState(AuthState.REGISTER)} onForgotClick={() => setAuthState(AuthState.FORGOT_PASSWORD)} />;
  }
  if (authState === AuthState.REGISTER) {
    return <Register onRegister={handleLogin} onLoginClick={() => setAuthState(AuthState.LOGIN)} />;
  }
  if (authState === AuthState.FORGOT_PASSWORD) {
    return <ForgotPassword onBackToLogin={() => setAuthState(AuthState.LOGIN)} />;
  }

  // Authenticated App Layout
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        userAvatar={user.avatar} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      {/* Dynamic Margin based on Sidebar State */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {renderView()}
      </main>
    </div>
  );
};

export default App;