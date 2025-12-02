import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { NewsArticle, Book, Story, Exam, DictionaryData } from "../types/types";
import { pcmToWav, base64ToFloat32Array } from "../utils/audioUtils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CACHING HELPER ---
const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) { console.error(e); }
  return null;
};

const setCache = (key: string, data: any) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(e); }
};

// --- OPTIMIZED TTS ENGINE (AudioContext Pipeline) ---
let audioCtx: AudioContext | null = null;

export const playLongTextTTS = async (text: string, voiceName = 'Puck', speed = 1.0) => {
    // 1. Init AudioContext (Singleton)
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // 2. Smart Splitting: Ưu tiên tách câu ngắn để phản hồi nhanh đoạn đầu
    // Regex này tách theo dấu chấm câu, nhưng giữ lại dấu câu
    const rawChunks = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const chunks = rawChunks.map(c => c.trim()).filter(c => c.length > 0);

    let nextScheduleTime = audioCtx.currentTime + 0.1; // Buffer nhỏ 100ms
    
    // Hàm fetch và decode 1 chunk
    const processChunk = async (chunk: string) => {
        try {
             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: chunk }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) return;

            // Decode dữ liệu âm thanh
            const float32Data = base64ToFloat32Array(base64Audio);
            const wavBlob = pcmToWav(float32Data, 24000); // 24kHz là sample rate chuẩn của Gemini
            const arrayBuffer = await wavBlob.arrayBuffer();
            
            if (audioCtx) {
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.playbackRate.value = speed;
                source.connect(audioCtx.destination);

                // Lên lịch phát: Nếu thời điểm định phát đã qua (do lag mạng), phát ngay lập tức
                const startTime = Math.max(nextScheduleTime, audioCtx.currentTime);
                source.start(startTime);

                // Cập nhật thời gian cho chunk tiếp theo
                nextScheduleTime = startTime + (audioBuffer.duration / speed);
            }
        } catch (e) {
            console.error("TTS Processing Error:", e);
        }
    };

    // 3. Pipeline Execution (Chạy song song có kiểm soát)
    // Fetch chunk đầu tiên và chờ nó (để đảm bảo user nghe thấy đoạn đầu sớm nhất)
    if (chunks.length > 0) {
        await processChunk(chunks[0]);
    }

    // Các chunk sau fetch song song (prefetching)
    // Dùng reduce promise để đảm bảo thứ tự phát nhưng tận dụng network
    // Tuy nhiên, để đơn giản và hiệu quả, ta loop và await processChunk. 
    // Do audioCtx schedule dựa trên timeline, việc await ở đây chỉ là chờ tải về, 
    // còn việc phát đã được queue vào AudioContext nên sẽ liền mạch.
    for (let i = 1; i < chunks.length; i++) {
        await processChunk(chunks[i]);
    }
};

// Wrapper tương thích
export const playTTS = async (text: string, voiceName = 'Kore', speed = 1.0): Promise<void> => {
    return playLongTextTTS(text, voiceName, speed);
};

// --- EXISTING API FUNCTIONS (Giữ nguyên) ---

export const generateText = async (prompt: string, model = 'gemini-2.5-flash-lite'): Promise<string> => {
  const response = await ai.models.generateContent({ model: model, contents: prompt });
  return response.text || "";
};

export const lookupDictionary = async (word: string): Promise<DictionaryData | null> => {
    const cacheKey = `dict_${word.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Define "${word}". Strict JSON: { "word": "${word}", "phonetic": "/IPA/", "meanings": [{ "partOfSpeech": "noun", "definitions": [{ "definition": "...", "example": "...", "synonyms": [] }] }] }`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "null");
        if(result) setCache(cacheKey, result);
        return result;
    } catch (e) { return null; }
};

export const fetchDailyNews = async (region: string, targetLanguage: string = "English"): Promise<NewsArticle[]> => {
  const cacheKey = `news_${region}_${targetLanguage}_v2`; 
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const prompt = `Find 6 recent news from ${region}. Translate to ${targetLanguage}. JSON array: "id", "title", "level", "description", "content", "source", "region".`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const text = response.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let data = [];
    if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
        data = data.map((item: any) => ({
            ...item,
            imageUrl: `https://image.pollinations.ai/prompt/news%20image%20${encodeURIComponent(item.title)}?nologo=true`
        }));
    }
    
    if (data.length > 0) setCache(cacheKey, data);
    return data;
  } catch (e) { return []; }
};

export const analyzeWriting = async (text: string, level: string): Promise<string> => {
  const prompt = `Analyze writing (Level ${level}): "${text}". JSON: score, corrected, feedback.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 1024 }, responseMimeType: "application/json" }
  });
  return response.text || "{}";
};

export const fetchBooks = async (genre: string): Promise<Book[]> => {
    const prompt = `List 12 famous "${genre}" books. JSON: id, title, author, genre, level, description, totalChapters.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
        const data = JSON.parse(response.text || "[]");
        return data.map((item: any) => ({ ...item, coverImage: `https://image.pollinations.ai/prompt/book%20cover%20${encodeURIComponent(item.title)}?nologo=true` }));
    } catch { return []; }
};

export const fetchChapterContent = async (t: string, a: string, c: number): Promise<string> => { 
    const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `Write Chapter ${c} of "${t}" by ${a}. Full text.` });
    return r.text || ""; 
};

export const fetchStories = async (g: string): Promise<Story[]> => { 
    const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `8 short stories genre "${g}". JSON array.`, config: { responseMimeType: "application/json" } });
    return JSON.parse(r.text || "[]"); 
};

export const fetchExams = async (c: string): Promise<Exam[]> => { 
    const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `8 practice exams for "${c}". JSON array.`, config: { responseMimeType: "application/json" } });
    return JSON.parse(r.text || "[]");
};

export const generateExamQuestions = async (t: string): Promise<any> => { 
    const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `Test content for "${t}": passage + 5 MCQs. JSON.`, config: { responseMimeType: "application/json" } });
    return JSON.parse(r.text || "{}");
};

export const analyzeImage = async (b: string, m: string): Promise<string> => { 
    const r = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts: [{ inlineData: { data: b, mimeType: m } }, { text: 'Describe for vocabulary learning.' }] } });
    return r.text || "";
};

export const connectLiveSession = async (
  onAudioData: (buffer: AudioBuffer) => void,
  onTranscription: (text: string, type: 'user' | 'model') => void
) => {
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Fake input processing for demo structure (Real implementation requires WebSocket/WebRTC specific to Gemini Live)
  // Returning a mock promise structure to satisfy the interface used in components
  return {
      sendRealtimeInput: (data: any) => console.log("Sending audio chunk...", data),
      disconnect: () => console.log("Disconnecting...")
  };
};