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

  useEffect(() => {
    return () => {
        if (session) {
            setConnected(false);
        }
        sourcesRef.current.forEach(source => source.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white p-8">
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 tracking-tight">Live Conversation</h2>
           <p className="text-slate-400 text-sm mt-1">Real-time interaction powered by Gemini 2.5 Live API</p>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{connected ? 'Live Session' : 'Offline'}</span>
        </div>
      </header>

      {/* Main Visualizer Area */}
      <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center relative overflow-hidden mb-8 border border-slate-700/50 shadow-2xl">
         
         {/* Background Glow */}
         <div className={`absolute inset-0 bg-blue-500/10 blur-[100px] transition-opacity duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-20'}`}></div>

         {/* Visualizer */}
         <div className="relative z-10 flex items-center justify-center space-x-3">
            {connected && (
                <>
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3 bg-gradient-to-t from-blue-500 to-teal-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(59,130,246,0.5)] ${isSpeaking ? `h-${16 + Math.random() * 32} animate-bounce` : 'h-4'}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                ))}
                </>
            )}
            {!connected && (
                <div className="text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <button 
                    onClick={handleStart}
                    className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all transform"
                    >
                        Start Speaking
                    </button>
                    <p className="mt-4 text-slate-500 text-sm">Microphone permission required</p>
                </div>
            )}
         </div>
      </div>

      {/* Transcript Area */}
      <div className="h-56 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
         {transcripts.length === 0 ? (
             <div className="flex items-center justify-center h-full text-slate-600 text-sm italic">
                 Conversation transcript will appear here in real-time...
             </div>
         ) : (
             <div className="space-y-4">
                 {transcripts.map((t, i) => (
                     <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${t.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                             {t.text}
                         </div>
                     </div>
                 ))}
                 <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
             </div>
         )}
      </div>
    </div>
  );
};

export default SpeakingPractice;
