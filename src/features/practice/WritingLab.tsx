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
    <div className="p-8 sm:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Writing Lab</h2>
        <p className="text-slate-500 mt-2">Advanced analysis powered by Gemini 3.0 Pro Thinking Mode.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col h-[700px]">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 p-6 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft Editor</label>
                <div className="text-xs text-slate-400 font-mono">{input.length} chars</div>
            </div>
            
            <textarea
              className="flex-1 w-full resize-none outline-none text-slate-700 text-lg leading-relaxed bg-transparent placeholder:text-slate-300"
              placeholder="Start writing your essay or paragraph here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading || !input}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg transform active:scale-95 ${
                  loading 
                    ? 'bg-slate-400 cursor-wait' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:-translate-y-1'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="h-[700px] overflow-y-auto custom-scrollbar pr-2">
           {loading && (
             <div className="flex flex-col items-center justify-center h-full space-y-6 bg-white/50 rounded-3xl border border-dashed border-slate-200">
               <div className="relative">
                   <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                   <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
               </div>
               <div className="text-center">
                   <h4 className="text-lg font-bold text-slate-700">Thinking Deeply</h4>
                   <p className="text-slate-400 text-sm mt-1">Evaluating grammar, coherence, and style...</p>
               </div>
             </div>
           )}

           {!loading && !result && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
               <svg className="w-20 h-20 mb-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               <p className="font-medium">Submit text to receive detailed AI feedback.</p>
             </div>
           )}

           {result && (
             <div className="space-y-6 animate-fadeIn">
                {/* Score Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>
                   <div className="relative z-10">
                     <h3 className="text-xl font-bold text-slate-800">Overall Score</h3>
                     <p className="text-sm text-slate-400 mt-1">Proficiency Assessment</p>
                   </div>
                   <div className="relative z-10 text-right">
                       <div className={`text-5xl font-bold tracking-tighter ${result.score > 80 ? 'text-emerald-500' : result.score > 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                         {result.score}
                       </div>
                       <div className="text-xs font-bold text-slate-300 uppercase">/ 100 Points</div>
                   </div>
                </div>

                {/* Feedback */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      AI Feedback
                  </h3>
                  <div className="prose prose-slate text-slate-700 leading-relaxed">
                    <p>{result.feedback}</p>
                  </div>
                </div>

                {/* Correction */}
                <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Improved Version
                  </h3>
                  <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                    {result.correctedText}
                  </p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WritingLab;
