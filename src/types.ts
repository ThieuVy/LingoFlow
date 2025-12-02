export enum View {
  DASHBOARD = 'DASHBOARD',
  READER = 'READER',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  NEWS = 'NEWS',
  LIBRARY = 'LIBRARY',
  TESTS = 'TESTS',
  DICTIONARY = 'DICTIONARY',
  PROFILE = 'PROFILE'
}

export interface UserStats {
  vocabularySize: number;
  listeningHours: number;
  speakingMinutes: number;
  currentStreak: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  totalPoints: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinDate: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: 'Article' | 'Book' | 'Writing' | 'Speaking' | 'Story' | 'Test';
  date: string;
  score?: number;
  status: 'Completed' | 'In Progress';
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
  coverColor: string; 
  coverImage?: string; 
  totalChapters: number;
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
      }[];
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isAudio?: boolean;
}

export interface WritingSubmission {
  text: string;
  feedback: string;
  score: number;
  correctedText: string;
}

export interface ReaderSettings {
  fontSize: number; // px
  fontFamily: 'Serif' | 'Sans';
  theme: 'Light' | 'Sepia' | 'Dark';
  lineHeight: number;
  ttsSpeed: number;
  ttsVoice: 'Male' | 'Female';
}