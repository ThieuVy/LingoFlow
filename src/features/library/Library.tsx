import React, { useState, useEffect } from 'react';
import { fetchBooks, fetchChapterContent } from '../../services/gemini';
import { Book } from '../../types';
import ContentReader from '../reader/ContentReader';

const Library: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('Classic Literature');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapterLoading, setChapterLoading] = useState<number | null>(null);
  
  const [readingContent, setReadingContent] = useState<string | null>(null);
  const [readingTitle, setReadingTitle] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks(genre);
      setBooks(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadBooks(); }, []); // eslint-disable-line

  const handleChapterClick = async (chapterNum: number) => {
      if (!selectedBook) return;
      setChapterLoading(chapterNum);
      try {
          const content = await fetchChapterContent(selectedBook.title, selectedBook.author, chapterNum);
          setReadingTitle(`${selectedBook.title} - Ch. ${chapterNum}`);
          setReadingContent(content);
      } catch(e) { console.error(e); } 
      finally { setChapterLoading(null); }
  };

  const genres = ['Classic Literature', 'Sci-Fi & Fantasy', 'Mystery', 'History', 'Romance', 'Adventure', 'Philosophy'];

  if (readingContent) {
      return <ContentReader initialContent={readingContent} initialTitle={readingTitle || ''} onBack={() => { setReadingContent(null); setReadingTitle(null); }} />;
  }

  return (
    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="mb-10 pb-6 border-b border-[#E9EDF7] flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-[#1B2559]">Digital Library</h2>
           <p className="text-[#A3AED0] mt-2">Curated collection of world classics.</p>
        </div>
        {selectedBook && (
            <button onClick={() => setSelectedBook(null)} className="text-[#4318FF] font-bold text-sm hover:underline flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Shelves
            </button>
        )}
      </div>

      {!selectedBook ? (
        <>
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 custom-scrollbar">
                {genres.map(g => (
                    <button key={g} onClick={() => { setGenre(g); setTimeout(loadBooks, 0); }}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            genre === g ? 'bg-[#4318FF] text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559]'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {[...Array(12)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse shadow-sm"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    {books.map(book => (
                        <div key={book.id} onClick={() => setSelectedBook(book)} className="group cursor-pointer perspective-1000">
                            <div className="relative aspect-[2/3] rounded-2xl shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden bg-[#F4F7FE]">
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider bg-[#4318FF] w-fit px-2 py-1 rounded mb-2">Read</span>
                                </div>
                            </div>
                            <h3 className="mt-4 font-bold text-[#1B2559] text-sm leading-tight line-clamp-1">{book.title}</h3>
                            <p className="text-xs text-[#A3AED0] mt-1">{book.author}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
      ) : (
          <div className="bg-white rounded-[30px] p-8 shadow-xl shadow-indigo-100/50 flex flex-col md:flex-row gap-10 animate-slideUp">
              <div className="md:w-1/3 xl:w-1/4">
                  <div className="aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden relative">
                      <img src={selectedBook.coverImage} alt={selectedBook.title} className="w-full h-full object-cover" />
                  </div>
              </div>
              <div className="flex-1">
                  <div className="mb-2">
                      <span className="px-3 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">Level {selectedBook.level}</span>
                  </div>
                  <h2 className="text-4xl font-bold text-[#1B2559] mb-2 font-serif">{selectedBook.title}</h2>
                  <p className="text-lg text-[#A3AED0] font-medium mb-6">by {selectedBook.author}</p>
                  
                  <div className="prose prose-slate text-[#2B3674] mb-8 max-w-none">
                      <p>{selectedBook.description}</p>
                  </div>

                  <h4 className="font-bold text-[#1B2559] mb-4 uppercase text-xs tracking-wider border-b border-[#E9EDF7] pb-2">Table of Contents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[...Array(Math.min(selectedBook.totalChapters, 15))].map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleChapterClick(i + 1)}
                            disabled={chapterLoading !== null}
                            className="flex items-center justify-between p-3 rounded-xl border border-[#E9EDF7] hover:border-[#4318FF] hover:bg-[#F4F7FE] transition-all group"
                          >
                              <span className="text-sm font-bold text-[#1B2559] group-hover:text-[#4318FF]">Chapter {i + 1}</span>
                              {chapterLoading === i + 1 ? (
                                  <div className="w-4 h-4 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                  <svg className="w-4 h-4 text-[#A3AED0] group-hover:text-[#4318FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              )}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Library;