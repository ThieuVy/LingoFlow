import React, { useState } from 'react';
import { analyzeWriting } from '../../services/gemini';
import { WritingSubmission } from '../../types';

const WritingLab: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingSubmission | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const jsonStr = await analyzeWriting(input, 'B2');
      const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      setResult({
        text: input,
        score: data.score,
        correctedText: data.corrected,
        feedback: data.feedback
      });
    } catch (e) {
      console.error("Parsing error", e);
      alert("Error analyzing text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1B2559]">Writing Laboratory</h2>
        <p className="text-[#A3AED0] mt-2">Get instant, AI-powered feedback on your essays and paragraphs.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Input Column */}
        <div className="flex flex-col h-[700px] lg:h-auto">
          <div className="bg-white rounded-[30px] shadow-[0_20px_50px_rgba(8,112,184,0.07)] p-1 flex flex-col h-full border border-[#E9EDF7]">
            <div className="bg-[#F4F7FE] rounded-t-[28px] px-6 py-4 flex justify-between items-center border-b border-[#E9EDF7]">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">{input.length} characters</span>
            </div>
            
            <textarea
              className="flex-1 w-full resize-none outline-none p-8 text-lg leading-relaxed text-[#2B3674] placeholder:text-[#A3AED0]/50 rounded-b-[28px]"
              placeholder="Start typing your essay here... (e.g., 'The benefits of learning a second language')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>
            
            <div className="p-6 bg-white rounded-b-[28px] border-t border-[#F4F7FE] flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || !input}
                className="px-8 py-4 bg-gradient-to-r from-[#4318FF] to-[#868CFF] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Analyzing...
                    </>
                ) : (
                    <>
                        Analyze Text
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="h-[700px] lg:h-auto overflow-y-auto custom-scrollbar pr-2">
           {loading && (
             <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white/50 rounded-[30px] border-2 border-dashed border-[#E9EDF7]">
               <div className="relative">
                   <div className="w-20 h-20 border-4 border-[#F4F7FE] rounded-full"></div>
                   <div className="w-20 h-20 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
               </div>
               <div className="text-center">
                   <h4 className="text-xl font-bold text-[#1B2559]">AI is thinking</h4>
                   <p className="text-[#A3AED0] mt-2">Checking grammar, vocabulary, and style...</p>
               </div>
             </div>
           )}

           {!loading && !result && (
             <div className="h-full flex flex-col items-center justify-center text-[#A3AED0] bg-white rounded-[30px] border border-[#E9EDF7] shadow-sm p-10 text-center">
               <div className="w-24 h-24 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-6 text-[#4318FF]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <h3 className="text-xl font-bold text-[#1B2559] mb-2">Detailed Analysis</h3>
               <p className="max-w-xs mx-auto">Submit your writing to receive a comprehensive report card with scores and corrections.</p>
             </div>
           )}

           {result && (
             <div className="space-y-6 animate-slideUp">
                {/* Score Card */}
                <div className="bg-gradient-to-r from-[#4318FF] to-[#868CFF] p-8 rounded-[30px] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                   <div className="relative z-10 flex justify-between items-center">
                       <div>
                           <p className="text-indigo-100 font-medium mb-1 uppercase tracking-wider text-xs">Overall Score</p>
                           <h3 className="text-3xl font-bold">Proficiency Level</h3>
                       </div>
                       <div className="text-right">
                           <span className="text-6xl font-bold tracking-tighter">{result.score}</span>
                           <span className="text-xl opacity-80">/100</span>
                       </div>
                   </div>
                </div>

                {/* Feedback */}
                <div className="bg-white p-8 rounded-[30px] shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-[#E9EDF7]">
                   <h3 className="text-lg font-bold text-[#1B2559] mb-4 flex items-center gap-2">
                       <span className="p-2 rounded-lg bg-orange-100 text-orange-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></span>
                       AI Feedback
                   </h3>
                   <div className="prose prose-slate text-[#2B3674] leading-relaxed">
                       <p>{result.feedback}</p>
                   </div>
                </div>

                {/* Correction */}
                <div className="bg-emerald-50/50 p-8 rounded-[30px] border border-emerald-100">
                   <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                       <span className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                       Improved Version
                   </h3>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100/50">
                       <p className="text-[#2B3674] text-lg leading-loose font-serif whitespace-pre-wrap">
                           {result.correctedText}
                       </p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WritingLab;