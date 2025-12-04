import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types/types';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check session hiện tại
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) formatAndSetUser(session.user);
            else setLoading(false);
        });

        // Lắng nghe thay đổi auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) formatAndSetUser(session.user);
            else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const formatAndSetUser = async (authUser: any) => {
        // Lấy profile chi tiết từ bảng profiles
        const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        
        if (data) {
            setUser({
                id: data.id,
                name: data.full_name || authUser.email,
                email: authUser.email,
                avatar: data.avatar_url || '',
                nativeLanguage: data.native_language || 'English',
                targetLanguage: data.target_language || 'Spanish',
                plan: data.plan || 'Free',
                joinDate: new Date(data.join_date).toLocaleDateString(),
                themePreference: data.theme_preference || 'system'
            });
        }
        setLoading(false);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);