import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatsProvider } from './context/StatsContext';
import MainLayout from './components/layout/MainLayout';

// Features (Lazy loading để tối ưu performance ban đầu)
import Dashboard from './features/dashboard/Dashboard';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
// Các component khác import bình thường hoặc lazy load tùy nhu cầu
import Library from './features/library/Library';
import DailyNews from './features/library/DailyNews';
import Dictionary from './features/library/Dictionary';
import SpeakingPractice from './features/practice/SpeakingPractice';
import WritingLab from './features/practice/WritingLab';
import TestPractice from './features/practice/TestPractice';
import Profile from './features/profile/Profile';

// Component bảo vệ Route (chỉ cho user đã login)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="library" element={<Library />} />
                <Route path="news" element={<DailyNews />} />
                <Route path="dictionary" element={<Dictionary />} />
                <Route path="speaking" element={<SpeakingPractice />} />
                <Route path="writing" element={<WritingLab />} />
                <Route path="tests" element={<TestPractice />} />
                <Route path="profile" element={<Profile />} />
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <StatsProvider>
            <AppRoutes />
        </StatsProvider>
    </AuthProvider>
);

export default App;