import { useState, useEffect } from 'react';
import { supabase, fetchFullUserProfile } from '../services/supabase';
import { UserProfile, UserStats } from '../types/types';

export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) 
                loadData(session.user.id, session.user);
            else 
                setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) 
                loadData(session.user.id, session.user);
            else {
                setUser(null);
                setStats(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadData = async (userId: string, authUser: any) => {
        const data = await fetchFullUserProfile(userId);
        if (data) {
            setUser({ ...data.profile, email: authUser.email });
            setStats(data.stats);
        }
        setLoading(false);
    };

    return { user, stats, loading, setUser };
};