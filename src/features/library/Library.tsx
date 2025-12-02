import React, { useState, useEffect } from 'react';
// FIX: Go up two levels
import { fetchBooks, fetchChapterContent } from '../../services/gemini';
import { Book } from '../../types';
import ContentReader from '../reader/ContentReader';

const Library: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('Classic Literature');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapterLoading, setChapterLoading] = useState<number | null>(null);
  
  // Embedded Reader State
  const [readingContent, setReadingContent] = useState<string | null>(null);
  const [readingTitle, setReadingTitle] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    setSelectedBook(null);
    setReadingContent(null);
    try {
      const data = await fetchBooks(genre);
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChapterClick = async (chapterNum: number) => {
      if (!selectedBook) return;
      setChapterLoading(chapterNum);
      try {
          const content = await fetchChapterContent(selectedBook.title, selectedBook.author, chapterNum);
          setReadingTitle(`${selectedBook.title} - Ch. ${chapterNum}`);
          setReadingContent(content);
      } catch(e) {
          console.error(e);
      } finally {
          setChapterLoading(null);
      }
  };

  const handleBackFromReader = () => {
      setReadingContent(null);
      setReadingTitle(null);
  };

  const genres = ['Classic Literature', 'Sci-Fi & Fantasy', 'Mystery & Thriller', 'History & Biography', 'Romance', 'Adventure', 'Philosophy', 'Young Adult'];

  // 1. Embedded Reader View
  if (readingContent) {
      return <ContentReader initialContent={readingContent} initialTitle={readingTitle || ''} onBack={handleBackFromReader} />;
  }

  // 2. Main Library View
  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
           <h2 className="text-4xl font-bold text-slate-900 tracking-tight font-serif">The Library</h2>
           <p className="text-slate-500 mt-2">Authentic books and classics for your reading journey.</p>
        </div>
        {selectedBook && (
            <button 
                onClick={() => setSelectedBook(null)}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center mb-1"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Shelves
            </button>
        )}
      </div>

      {!selectedBook ? (
        <>
            {/* Genre Navigation */}
            <div className="flex overflow-x-auto pb-4 mb-8 space-x-3 custom-scrollbar">
                {genres.map(g => (
                    <button
                        key={g}
                        onClick={() => { setGenre(g); setTimeout(loadBooks, 0); }}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all border ${
                            genre === g 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-[2/3] bg-slate-200 rounded-lg shadow-sm"></div>
                            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 xl:gap-8">
                    {books.map(book => (
                        <div 
                            key={book.id || Math.random()}
                            onClick={() => setSelectedBook(book)}
                            className="group cursor-pointer flex flex-col"
                        >
                            {/* Book Cover */}
                            <div 
                                className="relative aspect-[2/3] rounded-lg shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 overflow-hidden mb-3 bg-slate-200"
                            >
                                <img 
                                    src={book.coverImage || `https://image.pollinations.ai/prompt/book%20cover%20${encodeURIComponent(book.title)}?nologo=true`} 
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold text-center">
                                        Read Now
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-white/30">
                                    {book.level}
                                </div>
                            </div>
                            
                            {/* Metadata */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{book.title}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{book.author}</p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add more books trigger */}
                     <div 
                        onClick={loadBooks}
                        className="aspect-[2/3] rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 cursor-pointer transition-all"
                    >
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-xs font-bold">Refresh / More</span>
                    </div>
                </div>
            )}
        </>
      ) : (
          /* Book Detail View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fadeIn">
              <div className="md:col-span-1">
                  <div 
                    className="aspect-[2/3] rounded-xl shadow-2xl overflow-hidden relative mb-6 max-w-xs mx-auto md:mx-0 bg-slate-200"
                  >
                        <img 
                            src={selectedBook.coverImage || `https://image.pollinations.ai/prompt/book%20cover%20${encodeURIComponent(selectedBook.title)}?nologo=true`} 
                            alt={selectedBook.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                             <p className="text-lg opacity-90 font-serif italic">{selectedBook.author}</p>
                        </div>
                  </div>
                  <div className="text-center md:text-left">
                      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm mb-4">
                          Level {selectedBook.level}
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 leading-tight">{selectedBook.title}</h2>
                      <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Synopsis</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                          {selectedBook.description}
                      </p>
                  </div>
              </div>

              <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 font-serif border-b border-slate-100 pb-2">Table of Contents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: Math.min(selectedBook.totalChapters, 20) }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            onClick={() => handleChapterClick(num)}
                            disabled={chapterLoading !== null}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group text-left"
                          >
                              <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 font-bold flex items-center justify-center text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                      {num}
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-blue-700">Chapter {num}</span>
                              </div>
                              {chapterLoading === num ? (
                                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                  <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              )}
                          </button>
                      ))}
                      {selectedBook.totalChapters > 20 && (
                          <div className="p-4 text-center text-slate-400 italic text-sm">
                              + {selectedBook.totalChapters - 20} more chapters...
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Library;