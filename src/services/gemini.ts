// FILE: src/services/gemini.ts
import { GoogleGenAI, Modality } from "@google/genai";
import { NewsArticle, Book, Story, Exam, DictionaryData } from "../types/types";
import { REAL_CLASSIC_BOOKS, MOCK_STORIES, MOCK_EXAMS } from "../data/mockData";

// --- SECURITY WARNING ---
// Hiện tại key đang để ở Client để Demo. 
// Trong Production, thay thế việc gọi trực tiếp 'ai.models.generateContent' 
// bằng 'fetch("https://your-backend.com/api/generate", ...)'
// ------------------------

const getApiKey = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) console.warn("Missing Gemini API Key");
    return key || "";
};
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const createSimpleContent = (prompt: string) => [{ parts: [{ text: prompt }] }];

// Helper để xử lý lỗi tập trung
const safeGenerate = async (prompt: string, jsonMode = false) => {
    try {
        const config = jsonMode ? { responseMimeType: "application/json" } : {};
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createSimpleContent(prompt),
            config
        });
        return response.text || "";
    } catch (error) {
        console.error("AI Generation Error:", error);
        return null;
    }
};

// --- SERVICES ---

export const generateText = async (prompt: string): Promise<string> => {
    const text = await safeGenerate(prompt);
    return text || "Sorry, service is unavailable.";
};

export const lookupDictionary = async (word: string): Promise<DictionaryData | null> => {
    const prompt = `Define "${word}" in English learning context. JSON format with phonetic, meanings (partOfSpeech, definitions array with definition and example).`;
    const jsonStr = await safeGenerate(prompt, true);
    return jsonStr ? JSON.parse(jsonStr) : null;
};

// Các hàm fetch dữ liệu khác (Mock + AI Enhanced)
export const fetchBooks = async (genre: string): Promise<Book[]> => {
    // Kết hợp dữ liệu tĩnh để giảm chi phí API
    let filtered = REAL_CLASSIC_BOOKS; 
    if (genre !== 'All' && genre !== 'Classic Literature') {
        filtered = REAL_CLASSIC_BOOKS.filter(b => b.genre === genre || genre === 'All');
        if (filtered.length === 0) filtered = REAL_CLASSIC_BOOKS.slice(0, 5); 
    }
    return filtered.map((item: any, idx: number) => ({ 
        ...item, 
        id: `book_real_${idx}`, 
        coverImage: `https://image.pollinations.ai/prompt/vintage%20book%20cover%20${encodeURIComponent(item.title)}%20minimalist?nologo=true` 
    }));
};

export const fetchStories = async (genre: string): Promise<Story[]> => {
    return MOCK_STORIES.filter(s => genre === 'All' || s.genre === genre || Math.random() > 0.5);
};

export const fetchExams = async (filter: string): Promise<Exam[]> => {
    return (filter === 'General' || filter === 'All') 
        ? MOCK_EXAMS 
        : MOCK_EXAMS.filter(e => e.type === filter);
};

export const generateExamQuestions = async (title: string) => {
    const prompt = `Generate a mini exam simulation for "${title}". JSON Format: { "passage": "Reading text (300 words)...", "questions": [ { "id": 1, "text": "Question?", "options": ["A", "B", "C", "D"], "correctAnswer": "A" } ] }`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createSimpleContent(prompt),
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch { return null; }
};

export const fetchDailyNews = async (region: string, targetLanguage: string): Promise<NewsArticle[]> => {
    const prompt = `Find 6 recent news headlines from ${region}. JSON array: title, level (B1/B2), description, source.`;
    const jsonStr = await safeGenerate(prompt, true);
    if (!jsonStr) return [];
    
    const data = JSON.parse(jsonStr);
    return data.map((item:any, i:number) => ({ 
        ...item, 
        id: `news_${i}`, 
        content: '', 
        imageUrl: `https://image.pollinations.ai/prompt/news%20${encodeURIComponent(item.title)}?nologo=true` 
    }));
};

export const fetchFullArticleContent = async (t:string, r:string) => {
        const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: createSimpleContent(`Write a full article "${t}" (${r}). >600 words.`) });
        return res.text || "";
};

export const fetchChapterContent = async (t: string, a: string, c: number): Promise<string> => { 
    const prompt = `Write content for Chapter ${c} of "${t}" by ${a}.`;
    try {
        const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: createSimpleContent(prompt) });
        return r.text || "Content unavailable."; 
    } catch { return "Error loading chapter."; }
};

export const classifyUploadedBook = async (fileContent: string): Promise<Partial<Book>> => {
    const snippet = fileContent.slice(0, 2000);
    const prompt = `Analyze this book excerpt and generate metadata. Excerpt: "${snippet}...". JSON: title, author, genre, level, description.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: createSimpleContent(prompt), config: { responseMimeType: "application/json" } });
        return JSON.parse(response.text || "{}");
    } catch { return { title: "Uploaded Book" }; }
};

export const analyzeWriting = async (t:string, l:string) => { return `{"score": 85, "feedback": "Good job!", "corrected": "${t}"}`; };

// --- TTS ENGINE ---
let audioCtx: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null; 

export const initAudioContext = async () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    return audioCtx;
};

const base64ToFloat32Array = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { 
        bytes[i] = binaryString.charCodeAt(i); 
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) { 
        float32Array[i] = int16Array[i] / 32768.0; 
    }
    return float32Array;
};

export const playLongTextTTS = async (text: string, voiceName = 'Puck', speed = 1.0) => {
    await initAudioContext();
    if (!audioCtx) return;
    if (currentAudioSource) try { currentAudioSource.stop(); } catch (e) {}

    const chunk = text.slice(0, 1000); 
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts", 
            contents: createSimpleContent(chunk),
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        const float32Data = base64ToFloat32Array(base64Audio);
        const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = speed;
        source.connect(audioCtx.destination);
        
        currentAudioSource = source;
        source.onended = () => { if (currentAudioSource === source) currentAudioSource = null; };
        source.start(0);
        return { duration: buffer.duration, source };
    } catch (e) { 
        console.error("TTS Error:", e);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        window.speechSynthesis.speak(utterance);
        return { duration: text.length / 10, source: null };
    }
};

export const playTTS = async (text: string) => playLongTextTTS(text);

export const connectLiveSession = async (onAudioData: any, onTranscript: any) => {
    // Mock Implementation
    return { start: () => {}, stop: () => {}, disconnect: () => {} };
};