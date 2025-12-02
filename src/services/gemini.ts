import { GoogleGenAI, Modality } from "@google/genai";
import { NewsArticle, Book, Story, Exam, DictionaryData } from "../types/types";
import { pcmToWav, base64ToFloat32Array } from "../utils/audioUtils";

// --- CONFIGURATION & LOGGING ---
const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const apiKey = rawApiKey.trim();

// Log kiểm tra Key (đã che)
const maskedKey = apiKey.length > 10 ? `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}` : "MISSING";
console.log(`🚀 [Gemini Service] Init with Key: ${maskedKey} (Length: ${apiKey.length})`);

if (!apiKey) {
    console.error("❌ [Gemini Service] CRITICAL: API Key is missing!");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- UTILS ---

// Hàm đợi (Sleep) để xử lý Rate Limit
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) { console.error("Cache read error:", e); }
  return null;
};

const setCache = (key: string, data: any) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error("Cache write error:", e); }
};

const createSimpleContent = (prompt: string) => {
    return [{ parts: [{ text: prompt }] }];
};

// --- TTS ENGINE ---
let audioCtx: AudioContext | null = null;

// Fallback: Sử dụng Web Speech API của trình duyệt nếu Gemini hết quota
const speakWebSpeech = (text: string, lang = 'en-US', speed = 1.0) => {
    console.warn("⚠️ [TTS] Switching to Web Speech API fallback due to API limit.");
    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speed * 0.9; // WebSpeech thường nhanh hơn Gemini chút
    
    // Chọn giọng Google nếu có
    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(v => v.name.includes('Google US English'));
    if (googleVoice) utterance.voice = googleVoice;

    window.speechSynthesis.speak(utterance);
};

// Logic chia văn bản thông minh: Gom câu lại thành đoạn lớn (~2500 ký tự)
// Thay vì chia nhỏ thành từng câu (gây tốn request), ta gom lại để tận dụng tối đa context window
const splitTextSmartly = (text: string, maxLength: number = 2500): string[] => {
    // Regex này tách câu dựa trên . ! ? nhưng vẫn giữ lại dấu câu
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        // Nếu cộng thêm câu mới mà vượt quá giới hạn thì đẩy chunk cũ vào mảng
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    // Đẩy phần còn dư lại
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    
    return chunks;
};

export const playLongTextTTS = async (text: string, voiceName = 'Puck', speed = 1.0) => {
    console.log("🔊 [TTS] Starting Smart TTS for text length:", text.length);
    
    // 1. Khởi tạo AudioContext
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // 2. Chia text thành các chunk lớn để giảm số lượng request
    const chunks = splitTextSmartly(text, 2500); 
    console.log(`📦 [TTS] Text split into ${chunks.length} optimized chunks.`);

    let nextScheduleTime = audioCtx.currentTime + 0.1;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // 3. RATE LIMIT HANDLING:
        // Nếu đây là chunk thứ 2 trở đi, ta phải đợi 22 giây để tuân thủ giới hạn 3 requests/phút của gói Free.
        // Chunk đầu tiên chạy ngay lập tức. Người dùng nghe chunk 1 (dài ~2 phút) thì trong lúc đó code đợi để tải chunk 2.
        if (i > 0) {
            console.log(`⏳ [TTS] Waiting 22s before processing chunk ${i + 1} to avoid Rate Limit...`);
            await sleep(22000); 
        }

        try {
            console.log(`🔄 [TTS] Requesting API for chunk ${i + 1}...`);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts", 
                contents: createSimpleContent(chunk),
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data received");

            const float32Data = base64ToFloat32Array(base64Audio);
            const wavBlob = pcmToWav(float32Data, 24000); 
            const arrayBuffer = await wavBlob.arrayBuffer();
            
            if (audioCtx) {
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.playbackRate.value = speed;
                source.connect(audioCtx.destination);

                // Lên lịch phát nối tiếp nhau không bị gián đoạn
                const startTime = Math.max(nextScheduleTime, audioCtx.currentTime);
                source.start(startTime);
                
                // Cập nhật thời gian bắt đầu cho chunk tiếp theo
                nextScheduleTime = startTime + (audioBuffer.duration / speed);
                console.log(`✅ [TTS] Chunk ${i + 1} queued successfully. Duration: ${audioBuffer.duration.toFixed(1)}s`);
            }

        } catch (e: any) {
            console.error(`❌ [TTS] Chunk ${i + 1} failed:`, e);
            
            // 4. FALLBACK: Nếu vẫn bị lỗi 429 hoặc lỗi khác, dùng browser TTS cho phần còn lại
            if (e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('400')) {
                console.error("⛔ [TTS] API Error/Quota Exceeded. Switching to fallback.");
                const remainingText = chunks.slice(i).join(" "); // Gom hết phần chưa đọc
                speakWebSpeech(remainingText, 'en-US', speed);
                break; // Thoát vòng lặp, không gọi API nữa
            }
        }
    }
};

export const playTTS = async (text: string, voiceName = 'Kore', speed = 1.0): Promise<void> => {
    // Wrapper đơn giản gọi hàm xử lý chính
    return playLongTextTTS(text, voiceName, speed);
};

// --- CORE FEATURES ---

export const generateText = async (prompt: string, model = 'gemini-2.5-flash'): Promise<string> => {
  try {
      const response = await ai.models.generateContent({ 
          model: model, 
          contents: createSimpleContent(prompt)
      });
      return response.text || "";
  } catch (e: any) {
      console.error("❌ [Gemini] generateText failed:", e);
      return "";
  }
};

export const lookupDictionary = async (word: string): Promise<DictionaryData | null> => {
    console.log(`🔍 [Dictionary] Looking up: ${word}`);
    const cacheKey = `dict_${word.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Define "${word}". Strict JSON: { "word": "${word}", "phonetic": "/IPA/", "meanings": [{ "partOfSpeech": "noun", "definitions": [{ "definition": "...", "example": "...", "synonyms": [] }] }] }`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createSimpleContent(prompt),
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "null");
        if(result) setCache(cacheKey, result);
        return result;
    } catch (e) { 
        console.error("❌ [Dictionary] Lookup failed:", e);
        return null; 
    }
};

// --- NEWS ---
export const fetchDailyNews = async (region: string, targetLanguage: string = "English"): Promise<NewsArticle[]> => {
  console.log(`📰 [News] Fetching list for: ${region}`);
  const cacheKey = `news_list_${region}_${targetLanguage}_v6`; // Update version
  const cachedData = getCache(cacheKey);
  if (cachedData) {
      console.log("📦 [News] Returning cached data");
      return cachedData;
  }

  const prompt = `Find 12 recent trending news headlines from ${region}. 
  Return a JSON array. Each object must have:
  - "title": The headline.
  - "level": "B1" or "B2".
  - "description": A short summary (2 sentences).
  - "source": Newspaper name.
  - "region": "${region}".
  Translate title/description to ${targetLanguage}. 
  Do NOT generate full content yet.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createSimpleContent(prompt),
      config: { responseMimeType: "application/json" }
    });
    
    console.log("✅ [News] API Success");
    const text = response.text || "[]";
    let data = JSON.parse(text);
    
    // FIX Duplicate Key: Tạo ID ngẫu nhiên duy nhất cho mỗi bài báo
    data = data.map((item: any, index: number) => ({
        ...item,
        // Sử dụng random string kết hợp timestamp để đảm bảo unique tuyệt đối
        id: `news_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`, 
        content: "", 
        imageUrl: `https://image.pollinations.ai/prompt/news%20image%20${encodeURIComponent(item.title)}?nologo=true`
    }));
    
    if (data.length > 0) setCache(cacheKey, data);
    return data;
  } catch (e: any) { 
      console.error("❌ [News] Fetch failed:", e);
      return []; 
  }
};

export const fetchFullArticleContent = async (title: string, region: string): Promise<string> => {
    console.log(`📝 [News] Generating full content: ${title}`);
    const prompt = `Write a journalistic article about "${title}" (${region}). 
    Length: >800 words. Format: Headline, Lead, Body (5 paragraphs), Conclusion. 
    Style: Professional, engaging. English language.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createSimpleContent(prompt)
        });
        return response.text || "Content generation failed.";
    } catch (e) {
        console.error("❌ [News] Content gen failed:", e);
        return "Error generating content.";
    }
};

export const analyzeWriting = async (text: string, level: string): Promise<string> => {
  const prompt = `Analyze writing (Level ${level}): "${text}". JSON: score, corrected, feedback.`;
  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: createSimpleContent(prompt),
        config: { responseMimeType: "application/json" }
      });
      return response.text || "{}";
  } catch (e) { return "{}"; }
};

export const fetchBooks = async (genre: string): Promise<Book[]> => {
    const prompt = `List 12 famous "${genre}" books. JSON array: title, author, genre, level, description, totalChapters.`;
    try {
        const response = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: createSimpleContent(prompt), 
            config: { responseMimeType: "application/json" } 
        });
        const data = JSON.parse(response.text || "[]");
        return data.map((item: any, idx: number) => ({ 
            ...item, 
            id: `book_${idx}_${Date.now()}`, 
            coverImage: `https://image.pollinations.ai/prompt/book%20cover%20${encodeURIComponent(item.title)}?nologo=true` 
        }));
    } catch { return []; }
};

export const fetchChapterContent = async (t: string, a: string, c: number): Promise<string> => { 
    const prompt = `Write COMPLETE text of Chapter ${c} from "${t}" by ${a}. Unabridged.`;
    try {
        const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: createSimpleContent(prompt) });
        return r.text || ""; 
    } catch { return "Error loading chapter."; }
};

export const fetchStories = async (g: string): Promise<Story[]> => { 
    try {
        const r = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: createSimpleContent(`8 short stories genre "${g}". JSON array: title, author, genre, level, description.`), 
            config: { responseMimeType: "application/json" } 
        });
        const data = JSON.parse(r.text || "[]");
        return data.map((item: any, idx: number) => ({ ...item, id: `story_${idx}_${Date.now()}` }));
    } catch { return []; }
};

export const fetchFullStoryContent = async (title: string, author: string): Promise<string> => {
    const prompt = `Write the full short story "${title}" by ${author}. Min 1000 words.`;
    try {
        const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: createSimpleContent(prompt) });
        return r.text || "";
    } catch { return "Error writing story."; }
}

export const fetchExams = async (c: string): Promise<Exam[]> => { 
    try {
        const r = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: createSimpleContent(`8 practice exams for "${c}". JSON array.`), 
            config: { responseMimeType: "application/json" } 
        });
        const data = JSON.parse(r.text || "[]");
        return data.map((item: any, idx: number) => ({ ...item, id: `exam_${idx}_${Date.now()}` }));
    } catch { return []; }
};

export const generateExamQuestions = async (t: string): Promise<any> => { 
    try {
        const r = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: createSimpleContent(`Test content for "${t}": passage + 5 MCQs. JSON.`), 
            config: { responseMimeType: "application/json" } 
        });
        return JSON.parse(r.text || "{}");
    } catch { return {}; }
};

export const analyzeImage = async (b: string, m: string): Promise<string> => { 
    const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ inlineData: { data: b, mimeType: m } }, { text: 'Describe this.' }] } });
    return r.text || "";
};

export const connectLiveSession = async (onAudio: any, onText: any) => {
  return { sendRealtimeInput: (data: any) => console.log("Audio data"), disconnect: () => {} };
};