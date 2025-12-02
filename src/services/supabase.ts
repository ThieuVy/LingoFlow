import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserStats, DictionaryData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key are missing! Check your .env file.");
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

  // Map DB data sang Types của App
  const profile: UserProfile = {
    name: data.full_name || data.email,
    email: data.email,
    avatar: data.avatar_url || '',
    nativeLanguage: data.native_language,
    targetLanguage: data.target_language,
    plan: data.plan || 'Free',
    joinDate: new Date(data.join_date).toLocaleDateString()
  };

  const stats: UserStats = {
    vocabularySize: data.vocabulary_size,
    listeningHours: data.listening_hours,
    speakingMinutes: data.speaking_minutes,
    currentStreak: data.streak,
    level: data.level as any,
    totalPoints: data.points
  };

  return { profile, stats };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    // Chỉ update các trường cho phép
    const dbUpdates = {
        full_name: updates.name,
        native_language: updates.nativeLanguage,
        target_language: updates.targetLanguage,
    };
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    return error;
};

// --- VOCABULARY ---
export const saveVocabulary = async (userId: string, wordData: DictionaryData) => {
    // 1. Lưu từ vựng
    const { error } = await supabase.from('vocabulary').insert([{
        user_id: userId,
        word: wordData.word,
        phonetic: wordData.phonetic,
        meaning: wordData.meanings[0]?.definitions[0]?.definition || '',
        full_data: wordData, // Lưu JSON gốc
        status: 'learning'
    }]);

    if (!error) {
        // 2. Tăng thống kê từ vựng (Gọi RPC hoặc update thủ công)
        // Cách đơn giản (Update thủ công):
        const { count } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        await supabase.from('profiles').update({ vocabulary_size: count }).eq('id', userId);
    }
    return error;
};

export const getVocabularyList = async (userId: string) => {
    const { data } = await supabase.from('vocabulary').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data;
};

// --- HISTORY ---
export const addToHistory = async (userId: string, item: { title: string, type: string, score?: number }) => {
    await supabase.from('learning_history').insert([{
        user_id: userId,
        title: item.title,
        type: item.type,
        score: item.score || 0,
        status: 'Completed'
    }]);
    
    // Cộng điểm (ví dụ: 10 điểm cho mỗi hoạt động)
    // Cần lấy điểm hiện tại trước hoặc dùng function RPC increments
    const { data } = await supabase.from('profiles').select('points').eq('id', userId).single();
    if (data) {
        await supabase.from('profiles').update({ points: data.points + 10 }).eq('id', userId);
    }
};

export const getHistoryList = async (userId: string) => {
    const { data } = await supabase.from('learning_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
    return data;
};