export enum View {
  DASHBOARD = 'DASHBOARD',
  READER = 'READER',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  NEWS = 'NEWS',
  LIBRARY = 'LIBRARY',
  TESTS = 'TESTS',
  DICTIONARY = 'DICTIONARY',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE'
}

export interface UserStats {
  vocabularySize: number;
  readingHours: number;
  speakingMinutes: number;
  currentStreak: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  totalPoints: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinDate: string;
  themePreference?: 'light' | 'dark' | 'system'; // Cập nhật backend sync
}

// Interface Notification mới
export interface AppNotification {
    id: string;
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
    icon?: string;
}

export interface ReadingHistoryItem {
    id: string;
    title: string;
    type: 'News' | 'Book';
    progress: number;
    lastRead: number;
    coverUrl?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  level: string;
  description: string;
  content: string;
  source: string;
  region: string;
  imageUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  level: string;
  description: string;
  coverImage?: string; 
  totalChapters: number;
  content?: string;
  chapters?: string[];
}

export interface Story {
  id: string;
  title: string;
  author: string;
  genre: string;
  level: string;
  description: string;
}

export interface Exam {
  id: string;
  title: string;
  type: 'IELTS' | 'TOEIC' | 'TOEFL' | 'HSK' | 'JLPT' | 'General';
  skill: 'Reading' | 'Listening' | 'Writing' | 'Speaking' | 'Full Test';
  duration: number; // minutes
  questionCount: number;
  participants: number;
  level: string;
  tags: string[];
}

export interface DictionaryData {
  word: string;
  phonetic: string;
  audioUrl?: string;
  meanings: {
      partOfSpeech: string;
      definitions: {
        definition: string;
        example?: string;
        synonyms?: string[];
        antonyms?: string[];
      }[];
  }[];
}

export interface SavedWord {
    id: string;
    word: string;
    phonetic: string;
    meaning: string;
    full_data: DictionaryData;
    created_at: string;
    status: 'new' | 'reviewing' | 'mastered';
}

export interface WritingSubmission {
  text: string;
  feedback: string;
  score: number;
  correctedText: string;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: 'Serif' | 'Sans';
  theme: 'Light' | 'Sepia' | 'Dark';
  lineHeight: number;
  ttsSpeed: number;
  ttsVoice: 'Male' | 'Female';
}

export interface Highlight {
    id: string;
    text: string;
    color: 'yellow' | 'green' | 'blue' | 'pink';
    startOffset: number;
}