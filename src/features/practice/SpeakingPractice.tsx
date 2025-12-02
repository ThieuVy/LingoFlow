import React, { useEffect, useRef, useState } from 'react';
import { connectLiveSession } from '../../services/gemini';

const SpeakingPractice: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [transcripts, setTranscripts] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
        if (session) {
            setConnected(false);
        }
        sourcesRef.current.forEach(source => source.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const handleStart = async () => {
    try {
      if (!outputAudioContextRef.current) {
         outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }

      const s = await connectLiveSession(
        (audioBuffer) => {
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
            
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), audioBuffer.duration * 1000);
        },
        (text, role) => {
            setTranscripts(prev => [...prev, { role, text }]);
        }
      );
      setSession(s);
      setConnected(true);
    } catch (e) {
      console.error("Failed to connect live session", e);
      alert("Could not connect to microphone or API.");
    }
  };

  const handleEndSession = () => {
      // Logic ngắt kết nối thực tế sẽ phức tạp hơn tùy thuộc vào API client
      setConnected(false);
      setSession(null);
      // Reload page hoặc reset state để ngắt sạch
      window.location.reload(); 
  };

  return (
    <div className="p-6 h-screen max-h-screen flex flex-col max-w-[1600px] mx-auto animate-fadeIn">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center bg-white p-6 rounded-[20px] shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
        <div>
           <h2 className="text-3xl font-bold text-[#1B2559]">Live Speaking Coach</h2>
           <p className="text-[#A3AED0] text-sm mt-1">Real-time AI conversation partner powered by Gemini 2.5.</p>
        </div>
        <div className={`flex items-center space-x-3 px-5 py-2.5 rounded-full border transition-all ${connected ? 'bg-red-50 border-red-100' : 'bg-[#F4F7FE] border-transparent'}`}>
            <span className={`h-3 w-3 rounded-full shadow-sm ${connected ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className={`text-sm font-bold uppercase tracking-wider ${connected ? 'text-red-600' : 'text-[#A3AED0]'}`}>
                {connected ? 'Live Session' : 'Offline'}
            </span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
         {/* Left Column: Visualizer & Controls */}
         <div className="lg:col-span-2 flex flex-col">
             <div className="flex-1 bg-gradient-to-br from-[#111C44] to-[#1B2559] rounded-[30px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 text-center group">
                 {/* Decorative background elements */}
                 <div className="absolute top-0 right-0 w-96 h-96 bg-[#4318FF] opacity-20 blur-[150px] rounded-full pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00BCD4] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
                 
                 {/* Main Visualizer Circle */}
                 <div className="relative z-10 mb-12">
                     <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${connected ? 'shadow-[0_0_60px_rgba(67,24,255,0.4)]' : 'shadow-none'}`}>
                         <div className={`absolute inset-0 bg-gradient-to-tr from-[#4318FF] to-[#00BCD4] rounded-full opacity-20 animate-ping ${isSpeaking ? 'block' : 'hidden'}`}></div>
                         <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden">
                             {connected ? (
                                 <div className="flex gap-1.5 items-end h-16">
                                     {[1,2,3,4,5].map((i) => (
                                         <div 
                                            key={i} 
                                            className={`w-2 bg-gradient-to-t from-[#4318FF] to-[#00BCD4] rounded-full transition-all duration-150 ${isSpeaking ? `h-${Math.floor(Math.random() * 12) + 4} animate-bounce` : 'h-2'}`}
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                         ></div>
                                     ))}
                                 </div>
                             ) : (
                                <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Status Text */}
                 <h3 className="text-white text-2xl font-bold mb-2 relative z-10">
                     {connected ? (isSpeaking ? "AI is speaking..." : "Listening to you...") : "Ready to practice?"}
                 </h3>
                 <p className="text-indigo-200 mb-10 max-w-md relative z-10">
                     {connected ? "Speak clearly. The AI will respond naturally." : "Start a session to practice pronunciation and fluency with instant feedback."}
                 </p>

                 {/* Controls */}
                 <div className="relative z-10">
                     {!connected ? (
                         <button 
                            onClick={handleStart}
                            className="px-10 py-4 bg-white text-[#4318FF] rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-105 hover:shadow-indigo-500/40 transition-all flex items-center"
                         >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Start Conversation
                         </button>
                     ) : (
                         <button 
                            onClick={handleEndSession}
                            className="px-10 py-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl font-bold text-lg hover:bg-red-500 hover:text-white transition-all backdrop-blur-sm"
                         >
                            End Session
                         </button>
                     )}
                 </div>
             </div>
         </div>

         {/* Right Column: Transcript */}
         <div className="lg:col-span-1 bg-white rounded-[30px] shadow-[0_20px_50px_rgba(8,112,184,0.07)] flex flex-col overflow-hidden border border-[#E9EDF7]">
             <div className="p-6 border-b border-[#E9EDF7] bg-white">
                 <h3 className="font-bold text-[#1B2559]">Live Transcript</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F4F7FE]">
                 {transcripts.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-[#A3AED0] opacity-70">
                         <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                         <p className="text-sm font-medium">Conversation history will appear here</p>
                     </div>
                 ) : (
                     transcripts.map((t, i) => (
                         <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                 t.role === 'user' 
                                 ? 'bg-[#4318FF] text-white rounded-br-none' 
                                 : 'bg-white text-[#2B3674] border border-[#E9EDF7] rounded-bl-none'
                             }`}>
                                 {t.text}
                             </div>
                         </div>
                     ))
                 )}
                 <div ref={messagesEndRef} />
             </div>
         </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;