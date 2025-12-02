import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserStats, DictionaryData, SavedWord } from '../types/types';

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
    joinDate: new Date(data.join_date).toLocaleDateString()
  };

  const stats: UserStats = {
    vocabularySize: data.vocabulary_size || 0,
    listeningHours: data.listening_hours || 0,
    speakingMinutes: data.speaking_minutes || 0,
    currentStreak: data.streak || 0,
    level: (data.level as any) || 'A1',
    totalPoints: data.points || 0
  };

  return { profile, stats };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const dbUpdates = {
        full_name: updates.name,
        native_language: updates.nativeLanguage,
        target_language: updates.targetLanguage,
        avatar_url: updates.avatar
    };
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    return error;
};

// --- VOCABULARY (FIXED) ---
export const saveVocabulary = async (userId: string, wordData: DictionaryData) => {
    // 1. Kiểm tra từ đã tồn tại chưa để tránh trùng
    const { data: existing } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('user_id', userId)
        .eq('word', wordData.word)
        .single();

    if (existing) return null; // Đã có rồi thì không lưu nữa

    // 2. Lưu từ mới
    const { error } = await supabase.from('vocabulary').insert([{
        user_id: userId,
        word: wordData.word,
        phonetic: wordData.phonetic,
        meaning: wordData.meanings[0]?.definitions[0]?.definition || '',
        full_data: wordData, 
        status: 'new'
    }]);

    if (!error) {
        // 3. Tăng counter (RPC hoặc query count)
        const { count } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        await supabase.from('profiles').update({ vocabulary_size: count }).eq('id', userId);
    }
    return error;
};

export const getVocabularyList = async (userId: string): Promise<SavedWord[]> => {
    const { data } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    return (data as SavedWord[]) || [];
};

// --- HISTORY ---
export const getHistoryList = async (userId: string) => {
    const { data } = await supabase.from('learning_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
    return data;
};