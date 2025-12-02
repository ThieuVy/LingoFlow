
import React, { useState, useEffect } from 'react';
import { fetchExams, generateExamQuestions } from '../../services/gemini';
import { Exam } from '../../types';

const TestPractice: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [exams, setExams] = useState<Exam[]>([]);
  
  // Test Taking Mode
  const [activeTest, setActiveTest] = useState<Exam | null>(null);
  const [testContent, setTestContent] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
        setLoading(true);
        const data = await fetchExams(filter === 'All' ? 'General' : filter);
        setExams(data);
        setLoading(false);
    };
    loadExams();
  }, [filter]);

  const handleStartTest = async (exam: Exam) => {
      setActiveTest(exam);
      setTestLoading(true);
      const content = await generateExamQuestions(exam.title);
      setTestContent(content);
      setTestLoading(false);
  };

  const handleSubmit = () => {
      setSubmitted(true);
  };

  const closeTest = () => {
      setActiveTest(null);
      setTestContent(null);
      setAnswers({});
      setSubmitted(false);
  };

  // --- Active Test View ---
  if (activeTest) {
      return (
          <div className="h-screen flex flex-col bg-slate-50">
             {/* Test Header */}
             <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                 <div>
                     <h2 className="text-xl font-bold text-slate-800">{activeTest.title}</h2>
                     <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                         <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {activeTest.duration} mins</span>
                         <span>•</span>
                         <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{activeTest.skill}</span>
                     </div>
                 </div>
                 <button onClick={closeTest} className="text-slate-400 hover:text-red-500 transition-colors">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             </div>

             {/* Test Body */}
             <div className="flex-1 overflow-hidden relative">
                 {testLoading ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
                         <div className="text-center">
                             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                             <p className="text-slate-600 font-medium">Generating Test Simulation...</p>
                         </div>
                     </div>
                 ) : testContent ? (
                     <div className="h-full flex flex-col lg:flex-row">
                         {/* Split Screen: Reading Passage (Left) */}
                         <div className="lg:w-1/2 p-8 overflow-y-auto border-r border-slate-200 bg-white">
                             <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-4 text-xs">Reading Passage / Transcript</h3>
                             <div className="prose prose-slate max-w-none text-slate-800 leading-loose">
                                 {testContent.passage}
                             </div>
                         </div>
                         
                         {/* Questions (Right) */}
                         <div className="lg:w-1/2 p-8 overflow-y-auto bg-slate-50">
                             <div className="max-w-xl mx-auto space-y-8">
                                 {testContent.questions?.map((q: any, idx: number) => (
                                     <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                         <div className="flex space-x-3 mb-4">
                                             <span className="w-8 h-8 flex-shrink-0 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                                 {idx + 1}
                                             </span>
                                             <p className="font-semibold text-slate-800 pt-1">{q.text}</p>
                                         </div>
                                         <div className="space-y-2 ml-11">
                                             {q.options.map((opt: string) => {
                                                 const isSelected = answers[q.id] === opt;
                                                 const isCorrect = q.correctAnswer === opt;
                                                 let btnClass = "border-slate-200 hover:bg-slate-50";
                                                 
                                                 if (submitted) {
                                                     if (isCorrect) btnClass = "bg-green-100 border-green-300 text-green-800";
                                                     else if (isSelected && !isCorrect) btnClass = "bg-red-50 border-red-200 text-red-600";
                                                 } else if (isSelected) {
                                                     btnClass = "bg-blue-50 border-blue-300 text-blue-700";
                                                 }

                                                 return (
                                                     <button 
                                                        key={opt}
                                                        disabled={submitted}
                                                        onClick={() => setAnswers({...answers, [q.id]: opt})}
                                                        className={`w-full text-left p-3 rounded-xl border ${btnClass} transition-all text-sm font-medium`}
                                                     >
                                                         {opt}
                                                     </button>
                                                 )
                                             })}
                                         </div>
                                     </div>
                                 ))}
                                 
                                 {!submitted ? (
                                     <button onClick={handleSubmit} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                                         Submit Test
                                     </button>
                                 ) : (
                                     <div className="bg-slate-800 text-white p-6 rounded-xl text-center">
                                         <h3 className="text-xl font-bold mb-2">Test Completed</h3>
                                         <button onClick={closeTest} className="px-6 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100">
                                             Back to Library
                                         </button>
                                     </div>
                                 )}
                             </div>
                         </div>
                     </div>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">Failed to load test.</div>
                 )}
             </div>
          </div>
      )
  }

  // --- Exam Library View ---
  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight font-serif">Exam Library</h2>
          <p className="text-slate-500 mt-2">Simulation tests generated from open sources.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative mb-4">
                <input type="text" placeholder="Search exams..." className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
                {['All', 'IELTS', 'TOEIC', 'TOEFL', 'HSK'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            filter === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-64 bg-slate-100 rounded-3xl"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map(exam => (
                <div key={exam.id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                                exam.type === 'IELTS' ? 'bg-red-50 text-red-600 border-red-100' :
                                exam.type === 'TOEIC' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                                {exam.type}
                            </span>
                            <span className="text-xs font-bold text-slate-300">Level {exam.level}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 line-clamp-2">{exam.title}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {exam.tags.slice(0,3).map(tag => (
                                <span key={tag} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {exam.duration} min
                            </div>
                             <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {exam.participants.toLocaleString()}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleStartTest(exam)}
                            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                        >
                            Start Simulation
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TestPractice;
