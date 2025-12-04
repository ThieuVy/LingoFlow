import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats } from '../types/types';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface StatsContextType {
    stats: UserStats | null;
    updateStats: (newStats: Partial<UserStats>) => void;
    loading: boolean;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(false);

    // Load stats khi User thay đổi
    useEffect(() => {
        if (!user) {
            setStats(null);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('vocabulary_size, listening_hours, speaking_minutes, streak, level, points')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setStats({
                    vocabularySize: data.vocabulary_size || 0,
                    readingHours: data.listening_hours || 0,
                    speakingMinutes: data.speaking_minutes || 0,
                    currentStreak: data.streak || 0,
                    level: (data.level as any) || 'A1',
                    totalPoints: data.points || 0
                });
            } else {
                // Default stats
                setStats({ vocabularySize: 0, readingHours: 0, speakingMinutes: 0, currentStreak: 1, level: 'A1', totalPoints: 0 });
            }
            setLoading(false);
        };

        fetchStats();
    }, [user]);

    const updateStats = (newStats: Partial<UserStats>) => {
        setStats(prev => prev ? { ...prev, ...newStats } : null);
        // TODO: Debounce call to Supabase to save stats here
    };

    return (
        <StatsContext.Provider value={{ stats, updateStats, loading }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) throw new Error('useStats must be used within a StatsProvider');
    return context;
};