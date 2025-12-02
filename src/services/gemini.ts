// File: src/services/gemini.ts

import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { NewsArticle, Book, Story, Exam, DictionaryData } from "../types";

// Initialize Gemini Client
// Lưu ý: Trong môi trường thực tế, nên dùng Proxy server để ẩn API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

// --- CACHING HELPER (Tăng tốc độ load) ---
const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error("Cache parse error", e);
  }
  return null;
};

const setCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Cache set error", e);
  }
};

// --- TTS QUEUE (Xử lý đọc văn bản dài) ---
export const playLongTextTTS = async (text: string, voiceName = 'Puck', speed = 1.0) => {
    // Ngắt kết nối audio cũ nếu đang chạy (cần cơ chế quản lý global audio nếu muốn chặt chẽ hơn)
    // Chia văn bản thành các câu hoặc mệnh đề dựa trên dấu câu
    const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    
    const playChunk = async (index: number) => {
        if (index >= chunks.length) return;
        
        const chunkText = chunks[index].trim();
        if (!chunkText) {
            playChunk(index + 1);
            return;
        }

        try {
             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: chunkText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audio = new Audio("data:audio/wav;base64," + base64Audio);
                audio.playbackRate = speed;
                audio.onended = () => playChunk(index + 1); // Đệ quy: Đọc xong đoạn này thì đọc đoạn tiếp
                audio.play();
            } else {
                playChunk(index + 1); // Lỗi thì bỏ qua đọc tiếp
            }
        } catch (error) {
            console.error("TTS Error on chunk", index, error);
            playChunk(index + 1);
        }
    };

    playChunk(0);
};

// Wrapper để tương thích ngược với các component cũ đang gọi playTTS
export const playTTS = async (text: string, voiceName = 'Kore', speed = 1.0): Promise<void> => {
    return playLongTextTTS(text, voiceName, speed);
};

// --- API FUNCTIONS ---

export const generateText = async (prompt: string, model = 'gemini-2.5-flash-lite'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });
  return response.text || "";
};

export const lookupDictionary = async (word: string): Promise<DictionaryData | null> => {
    // 1. Check Cache First
    const cacheKey = `dict_${word.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const prompt = `Act as a comprehensive Oxford/Cambridge English dictionary. Define the word "${word}".
    Return a STRICT JSON object with this structure:
    {
        "word": "${word}",
        "phonetic": "/IPA/",
        "meanings": [
            {
                "partOfSpeech": "noun/verb/adjective etc",
                "definitions": [
                    {
                        "definition": "The precise definition.",
                        "example": "A sentence using the word in this context.",
                        "synonyms": ["synonym1", "synonym2"]
                    }
                ]
            }
        ]
    }
    Include at least 2 meanings/parts of speech if applicable.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const result = JSON.parse(response.text || "null");
        if(result) setCache(cacheKey, result); // Save to cache
        return result;
    } catch (e) {
        console.error("Dictionary lookup error", e);
        return null;
    }
};

// Hàm cũ, giữ lại để tương thích ngược nếu cần
export const getDefinition = async (word: string, context: string): Promise<any> => {
    return lookupDictionary(word); 
};

export const fetchDailyNews = async (region: string, targetLanguage: string = "English"): Promise<NewsArticle[]> => {
  const cacheKey = `news_${region}_${targetLanguage}_v2`; 
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const prompt = `Find 6 distinct, recent news headlines from ${region} sources.
  IMPORTANT: Even if the source news is in Vietnamese, French, etc., you MUST translate and write the content in ${targetLanguage} suitable for a B2 learner.
  Using the Google Search tool is mandatory.
  Return a STRICT JSON array (no markdown) where each object has:
  "id", 
  "title" (Translated to ${targetLanguage}), 
  "level" (e.g., B1, B2, C1), 
  "description" (One sentence summary in ${targetLanguage}), 
  "content" (Full article summary approx 3 paragraphs in ${targetLanguage}), 
  "source" (The original publisher name), 
  "region" ("${region}").`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }] 
      }
    });
    
    const text = response.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let data = [];
    if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
        // Tự động thêm ảnh minh họa bằng Pollinations AI
        data = data.map((item: any) => ({
            ...item,
            imageUrl: `https://image.pollinations.ai/prompt/news%20image%20${encodeURIComponent(item.title)}?nologo=true`
        }));
    }
    
    if (data.length > 0) setCache(cacheKey, data);
    return data;
  } catch (e) {
    console.error("News fetch error", e);
    return [];
  }
};

// --- Library & Exam Functions (Keep Existing Logic) ---

// Helper for dynamic book images
const getBookCoverUrl = (title: string, author: string) => {
    const encoded = encodeURIComponent((title + " " + author).substring(0, 30));
    return `https://image.pollinations.ai/prompt/book%20cover%20${encoded}%20minimalist%20classic?nologo=true`;
};

export const fetchBooks = async (genre: string): Promise<Book[]> => {
  const prompt = `Provide a list of 12 REAL, FAMOUS books in the "${genre}" genre. 
  Prioritize Public Domain classics.
  Return a STRICT JSON array: "id", "title", "author", "genre", "level" (A2-C1), "description", "totalChapters" (int), "coverColor".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.map((item: any) => ({
            ...item,
            coverImage: getBookCoverUrl(item.title, item.author)
        }));
    }
    return [];
  } catch (e) {
    console.error("Library fetch error", e);
    return [];
  }
};

export const fetchStories = async (genre: string): Promise<Story[]> => {
  const prompt = `Generate a list of 8 classic short stories in "${genre}". JSON array: id, title, author, genre, level, description.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    const match = (response.text || "").match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch (e) {
    return [];
  }
};

export const fetchChapterContent = async (bookTitle: string, author: string, chapter: number): Promise<string> => {
  const prompt = `Write the full content for Chapter ${chapter} of "${bookTitle}" by ${author}. 
  If public domain, provide original text. If copyrighted, provide a detailed creative retelling.
  Output plain text, formatted with paragraphs.`;

  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text || "Content unavailable.";
  } catch (e) {
    return "Error loading content.";
  }
};

export const fetchExams = async (category: string): Promise<Exam[]> => {
    const prompt = `Generate 8 practice exams for "${category}". JSON array: id, title, type, skill, duration, questionCount, participants, level, tags.`;
    try {
        const response = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const generateExamQuestions = async (examTitle: string): Promise<any> => {
    const prompt = `Create test content for "${examTitle}": reading passage (~300 words) and 5 MCQs. JSON: { passage, questions: [{id, text, options, correctAnswer}] }`;
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { return null; }
};

export const analyzeWriting = async (text: string, level: string): Promise<string> => {
  const prompt = `Analyze this writing (Level ${level}): "${text}". JSON: score, corrected, feedback.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 1024 }, responseMimeType: "application/json" }
  });
  return response.text || "{}";
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: 'Describe this image to learn vocabulary. List 5 key words with definitions.' },
      ],
    },
  });
  return response.text || "";
};

// --- Live API (Conversational) ---

export const connectLiveSession = async (
  onAudioData: (buffer: AudioBuffer) => void,
  onTranscription: (text: string, type: 'user' | 'model') => void
) => {
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        console.log("Live session connected");
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        
        source.connect(scriptProcessor);
        const gainNode = inputAudioContext.createGain();
        gainNode.gain.value = 0;
        scriptProcessor.connect(gainNode);
        gainNode.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
           const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
           onAudioData(audioBuffer);
        }
      },
      onclose: () => console.log("Live session closed"),
      onerror: (err) => console.error("Live session error", err)
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      systemInstruction: "You are a helpful language tutor.",
    }
  });

  return sessionPromise;
};

// --- Audio Helpers ---

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}