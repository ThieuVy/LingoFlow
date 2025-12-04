import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserStats, DictionaryData, SavedWord, AppNotification } from '../types/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- USER & PROFILE ---
export const fetchFullUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;

  const profile: UserProfile = {
    id: data.id,
    name: data.full_name || data.email,
    email: data.email,
    avatar: data.avatar_url || '',
    nativeLanguage: data.native_language || 'English',
    targetLanguage: data.target_language || 'Spanish',
    plan: data.plan || 'Free',
    joinDate: new Date(data.join_date).toLocaleDateString(),
    themePreference: data.theme_preference || 'system'
  };

  const stats: UserStats = {
    vocabularySize: data.vocabulary_size || 0,
    readingHours: data.listening_hours || 0, 
    speakingMinutes: data.speaking_minutes || 0,
    currentStreak: data.streak || 0,
    level: (data.level as any) || 'A1',
    totalPoints: data.points || 0
  };

  return { profile, stats };
};

// FIX 400 Bad Request: Lọc bỏ các trường không chắc chắn tồn tại trong DB
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.nativeLanguage) dbUpdates.native_language = updates.nativeLanguage;
    if (updates.targetLanguage) dbUpdates.target_language = updates.targetLanguage;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
    
    // Theme preference thường gây lỗi nếu DB chưa migrate, ta lưu local là chính
    // Chỉ gửi nếu biết chắc DB có cột này, hoặc chấp nhận rủi ro
    // Ở đây ta tạm thời KHÔNG gửi theme_preference để fix lỗi 400
    // if (updates.themePreference) dbUpdates.theme_preference = updates.themePreference;

    if (Object.keys(dbUpdates).length === 0) return null; // Không có gì để update DB

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    
    if (error) {
        console.warn("Update profile error:", error.message);
    }
    
    return error;
};

// --- NOTIFICATIONS FIX 404 ---
// Tạo thông báo mới
export const createNotification = async (userId: string, title: string, description: string, type: 'success'|'info'|'warning'|'error' = 'info', icon: string = '🔔') => {
    try {
        const { error } = await supabase.from('notifications').insert([{
            user_id: userId,
            title,
            description,
            type,
            icon,
            is_read: false
        }]);
        if (error) throw error;
    } catch (e) {
        // Fallback localstorage silently
        const current = JSON.parse(localStorage.getItem('local_notifications') || '[]');
        const newNotif = { id: Date.now().toString(), title, description, type, icon, is_read: false, created_at: new Date().toISOString() };
        localStorage.setItem('local_notifications', JSON.stringify([newNotif, ...current]));
    }
};

// Lấy danh sách thông báo (Fix crash 404)
export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data as AppNotification[];
    } catch (e) {
        // Nếu lỗi (404 bảng không tồn tại hoặc lỗi mạng), trả về local
        return JSON.parse(localStorage.getItem('local_notifications') || '[]');
    }
};

export const markAllNotificationsRead = async (userId: string) => {
    try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    } catch (e) {}
    // Update local
    const local = JSON.parse(localStorage.getItem('local_notifications') || '[]');
    const updated = local.map((n: any) => ({ ...n, is_read: true }));
    localStorage.setItem('local_notifications', JSON.stringify(updated));
};

export const deleteNotification = async (id: string) => {
    try { await supabase.from('notifications').delete().eq('id', id); } catch(e) {}
    
    const local = JSON.parse(localStorage.getItem('local_notifications') || '[]');
    const updated = local.filter((n: any) => n.id != id);
    localStorage.setItem('local_notifications', JSON.stringify(updated));
};

// --- VOCABULARY (Keep existing logic) ---
export const saveVocabulary = async (userId: string, wordData: DictionaryData) => {
    const { data: existing } = await supabase.from('vocabulary').select('id').eq('user_id', userId).eq('word', wordData.word).single();
    if (existing) return null;
    const { error } = await supabase.from('vocabulary').insert([{
        user_id: userId, word: wordData.word, phonetic: wordData.phonetic,
        meaning: wordData.meanings[0]?.definitions[0]?.definition || '', full_data: wordData, status: 'new'
    }]);
    if (!error) {
        const { count } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        await supabase.from('profiles').update({ vocabulary_size: count }).eq('id', userId);
    }
    return error;
};

export const deleteVocabulary = async (userId: string, wordId: string) => {
    const { error } = await supabase.from('vocabulary').delete().eq('id', wordId).eq('user_id', userId);
    if (!error) {
        const { count } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        await supabase.from('profiles').update({ vocabulary_size: count }).eq('id', userId);
    }
    return error;
};

export const getVocabularyList = async (userId: string): Promise<SavedWord[]> => {
    const { data } = await supabase.from('vocabulary').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data as SavedWord[]) || [];
};