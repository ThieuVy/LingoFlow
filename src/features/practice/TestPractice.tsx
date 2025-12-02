import React, { useState, useEffect } from 'react';
import { fetchExams, generateExamQuestions } from '../../services/gemini';
import { Exam } from '../../types/types';

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

  // --- Active Test View (Focus Mode) ---
  if (activeTest) {
      return (
          <div className="fixed inset-0 bg-[#F4F7FE] z-50 flex flex-col">
              {/* Test Header */}
              <div className="bg-white px-8 py-4 border-b border-[#E9EDF7] flex justify-between items-center shadow-sm">
                  <div>
                      <h2 className="text-xl font-bold text-[#1B2559]">{activeTest.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-[#A3AED0] mt-1">
                          <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {activeTest.duration} mins</span>
                          <span className="px-2 py-0.5 rounded bg-[#F4F7FE] text-[#4318FF] font-bold text-xs uppercase">{activeTest.skill}</span>
                      </div>
                  </div>
                  <button onClick={closeTest} className="p-2 hover:bg-rose-50 text-[#A3AED0] hover:text-rose-500 rounded-full transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>

              {/* Test Body */}
              <div className="flex-1 overflow-hidden relative">
                  {testLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                              <div className="w-12 h-12 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-[#1B2559] font-medium">Preparing simulation...</p>
                          </div>
                      </div>
                  ) : testContent ? (
                      <div className="h-full flex flex-col lg:flex-row">
                          {/* Split Screen: Reading Passage (Left) */}
                          <div className="lg:w-1/2 p-8 overflow-y-auto border-r border-[#E9EDF7] bg-white custom-scrollbar">
                              <div className="max-w-2xl mx-auto">
                                  <h3 className="font-bold text-[#A3AED0] uppercase tracking-wider mb-6 text-xs flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      Reading Passage
                                  </h3>
                                  <div className="prose prose-lg text-[#2B3674] leading-loose font-serif">
                                      {testContent.passage}
                                  </div>
                              </div>
                          </div>
                          
                          {/* Questions (Right) */}
                          <div className="lg:w-1/2 p-8 overflow-y-auto bg-[#F4F7FE] custom-scrollbar">
                              <div className="max-w-xl mx-auto space-y-8">
                                  {testContent.questions?.map((q: any, idx: number) => (
                                      <div key={q.id} className="bg-white p-6 rounded-[20px] shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-[#E9EDF7]">
                                          <div className="flex gap-4 mb-4">
                                              <span className="w-8 h-8 flex-shrink-0 bg-[#4318FF] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
                                                  {idx + 1}
                                              </span>
                                              <p className="font-bold text-[#1B2559] pt-1 text-lg">{q.text}</p>
                                          </div>
                                          <div className="space-y-3 ml-12">
                                              {q.options.map((opt: string) => {
                                                  const isSelected = answers[q.id] === opt;
                                                  const isCorrect = q.correctAnswer === opt;
                                                  let btnClass = "border-[#E9EDF7] hover:border-[#4318FF] hover:bg-[#F4F7FE] text-[#2B3674]";
                                                  
                                                  if (submitted) {
                                                      if (isCorrect) btnClass = "bg-green-50 border-green-200 text-green-700 font-bold";
                                                      else if (isSelected && !isCorrect) btnClass = "bg-red-50 border-red-200 text-red-600";
                                                      else btnClass = "opacity-50 border-transparent";
                                                  } else if (isSelected) {
                                                      btnClass = "bg-[#4318FF] border-[#4318FF] text-white shadow-lg shadow-indigo-200";
                                                  }

                                                  return (
                                                      <button 
                                                         key={opt}
                                                         disabled={submitted}
                                                         onClick={() => setAnswers({...answers, [q.id]: opt})}
                                                         className={`w-full text-left p-4 rounded-xl border transition-all text-base font-medium flex items-center ${btnClass}`}
                                                      >
                                                          <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center flex-shrink-0 ${isSelected ? (submitted ? (isCorrect ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600') : 'border-white bg-white') : 'border-[#A3AED0]'}`}>
                                                              {isSelected && <div className={`w-2 h-2 rounded-full ${submitted ? 'bg-white' : 'bg-[#4318FF]'}`}></div>}
                                                          </div>
                                                          {opt}
                                                      </button>
                                                  )
                                              })}
                                          </div>
                                      </div>
                                  ))}
                                  
                                  <div className="pt-4 pb-10">
                                      {!submitted ? (
                                          <button onClick={handleSubmit} className="w-full py-4 bg-[#4318FF] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-[#3311CC] transition-all transform hover:-translate-y-1">
                                              Submit Test
                                          </button>
                                      ) : (
                                          <div className="bg-[#1B2559] text-white p-8 rounded-[20px] text-center shadow-xl">
                                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏆</div>
                                              <h3 className="text-2xl font-bold mb-2">Test Completed</h3>
                                              <p className="text-slate-300 mb-6">Great job! Review your answers or return to the library.</p>
                                              <button onClick={closeTest} className="px-8 py-3 bg-white text-[#1B2559] rounded-xl font-bold hover:bg-slate-100 transition-colors">
                                                  Return to Library
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                     <div className="flex items-center justify-center h-full text-[#A3AED0]">Failed to load test.</div>
                  )}
              </div>
          </div>
      )
  }

  // --- Exam Library View ---
  return (
    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto min-h-screen animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-6 border-b border-[#E9EDF7]">
        <div>
          <h2 className="text-3xl font-bold text-[#1B2559]">Exam Simulation</h2>
          <p className="text-[#A3AED0] mt-2">Practice with real-world exam formats generated by AI.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="mt-6 md:mt-0 w-full md:w-auto flex flex-col gap-4">
            <div className="relative">
                <input type="text" placeholder="Search exams..." className="w-full md:w-72 pl-10 pr-4 py-3 rounded-full bg-white border border-[#E9EDF7] focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/20 outline-none shadow-sm text-[#1B2559]" />
                <svg className="w-5 h-5 text-[#A3AED0] absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {['All', 'IELTS', 'TOEIC', 'TOEFL', 'HSK'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            filter === cat ? 'bg-[#1B2559] text-white border-[#1B2559]' : 'bg-white text-[#A3AED0] border-[#E9EDF7] hover:border-[#A3AED0]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-72 bg-white rounded-[20px] shadow-sm animate-pulse"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map(exam => (
                <div key={exam.id} className="group bg-white rounded-[20px] p-6 shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#E9EDF7] flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                                exam.type === 'IELTS' ? 'bg-red-50 text-red-600 border-red-100' :
                                exam.type === 'TOEIC' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                                {exam.type}
                            </span>
                            <span className="text-xs font-bold text-[#A3AED0] bg-[#F4F7FE] px-2 py-1 rounded">Lvl {exam.level}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#1B2559] leading-snug mb-3 line-clamp-2 group-hover:text-[#4318FF] transition-colors">{exam.title}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {exam.tags.slice(0,3).map(tag => (
                                <span key={tag} className="text-[10px] text-[#A3AED0] bg-[#F4F7FE] px-2 py-1 rounded-md">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-[#F4F7FE]">
                        <div className="flex items-center justify-between text-xs text-[#A3AED0] font-medium mb-4">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {exam.duration} min
                            </div>
                             <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {exam.participants > 1000 ? `${(exam.participants/1000).toFixed(1)}k` : exam.participants}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleStartTest(exam)}
                            className="w-full py-3 bg-white border border-[#E9EDF7] text-[#1B2559] font-bold rounded-xl text-sm hover:bg-[#1B2559] hover:text-white hover:border-[#1B2559] transition-all shadow-sm group-hover:shadow-md"
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