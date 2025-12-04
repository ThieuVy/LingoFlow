// FILE: src/features/library/Library.tsx
import React, { useState, useEffect } from 'react';
import { fetchBooks, fetchChapterContent, classifyUploadedBook } from '../../services/gemini';
import { Book } from '../../types/types';
import ContentReader from '../reader/ContentReader';
import { splitBookIntoChapters } from '../../utils/textParser';
import { createNotification } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import BookCard from './components/BookCard';

interface LocalBook extends Book { chapters?: string[]; }

const Library: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [genre, setGenre] = useState('All');
    const [books, setBooks] = useState<Book[]>([]);
    const [localBooks, setLocalBooks] = useState<LocalBook[]>([]); 
    const [selectedBook, setSelectedBook] = useState<LocalBook | null>(null);
    const [chapterLoading, setChapterLoading] = useState<number | null>(null);
    
    // Reader States
    const [readingContent, setReadingContent] = useState<string | null>(null);
    const [readingTitle, setReadingTitle] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const apiBooks = await fetchBooks(genre);
            const savedBooks = localStorage.getItem('my_uploaded_books');
            setLocalBooks(savedBooks ? JSON.parse(savedBooks) : []);
            setBooks(apiBooks);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { loadBooks(); }, [genre]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (text) {
                const metadata = await classifyUploadedBook(text);
                const chapters = splitBookIntoChapters(text);
                const newBook: LocalBook = {
                    id: `local_${Date.now()}`,
                    title: metadata.title || file.name.replace('.txt', ''),
                    author: metadata.author || 'Unknown',
                    genre: metadata.genre || 'General',
                    level: (metadata.level as any) || 'B1',
                    description: metadata.description || 'Uploaded book.',
                    coverImage: `https://image.pollinations.ai/prompt/book%20cover%20${encodeURIComponent(metadata.title || 'book')}?nologo=true`,
                    totalChapters: chapters.length, 
                    content: text,
                    chapters: chapters
                };
                const updated = [newBook, ...localBooks];
                setLocalBooks(updated);
                localStorage.setItem('my_uploaded_books', JSON.stringify(updated));
                if (user) await createNotification(user.id, "Book Uploaded", `Added "${newBook.title}" to library.`, 'success', '📚');
            }
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleChapterClick = async (chapterNum: number) => {
        if (!selectedBook) return;
        if (selectedBook.id.startsWith('local_')) {
            const content = selectedBook.chapters?.[chapterNum - 1] || selectedBook.content || "";
            setReadingTitle(`${selectedBook.title} - Chapter ${chapterNum}`);
            setReadingContent(content);
            return;
        }
        setChapterLoading(chapterNum);
        try {
            const content = await fetchChapterContent(selectedBook.title, selectedBook.author, chapterNum);
            setReadingTitle(`${selectedBook.title} - Ch. ${chapterNum}`);
            setReadingContent(content);
        } catch(e) { console.error(e); } 
        finally { setChapterLoading(null); }
    };

    if (readingContent) {
        return <ContentReader initialContent={readingContent} initialTitle={readingTitle || ''} onBack={() => { setReadingContent(null); setReadingTitle(null); }} />;
    }

    const genres = ['All', 'Classic Literature', 'Sci-Fi & Fantasy', 'Mystery', 'History', 'Romance', 'Adventure'];

    return (
        <div className="p-8 sm:p-12 max-w-[1600px] mx-auto animate-fadeIn">
            <div className="mb-10 pb-6 border-b border-[#E9EDF7] dark:border-slate-700 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#1B2559] dark:text-white">Digital Library</h2>
                    <p className="text-[#A3AED0] mt-2">Curated world classics & Your personal collection.</p>
                </div>
                <div className="relative">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 transition-all flex items-center disabled:opacity-70">
                        {isUploading ? "Uploading..." : "Upload Book (.txt)"}
                    </button>
                </div>
            </div>

            {!selectedBook ? (
                <>
                    <div className="flex gap-3 mb-10 overflow-x-auto pb-2 custom-scrollbar">
                        {genres.map(g => (
                            <button key={g} onClick={() => { setGenre(g); setTimeout(loadBooks, 0); }} className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${genre === g ? 'bg-[#4318FF] text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-[#A3AED0]'}`}>{g}</button>
                        ))}
                    </div>
                    {localBooks.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-[#1B2559] dark:text-white mb-4">📂 Your Uploads</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {localBooks.map(book => <BookCard key={book.id} book={book} isLocal onClick={() => setSelectedBook(book)} />)}
                            </div>
                            <div className="h-px w-full bg-[#E9EDF7] dark:bg-slate-700 my-8"></div>
                        </div>
                    )}
                    {loading ? <div className="text-center py-10 text-[#A3AED0]">Loading Library...</div> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                            {books.map(book => <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />)}
                        </div>
                    )}
                </>
            ) : (
                <div className="animate-slideUp">
                    <button onClick={() => setSelectedBook(null)} className="mb-6 flex items-center px-4 py-2 bg-white dark:bg-slate-700 text-[#4318FF] dark:text-white rounded-xl shadow-sm font-bold">
                        ← Back to Library
                    </button>
                    <div className="bg-white dark:bg-slate-800 rounded-[30px] p-8 shadow-xl flex flex-col md:flex-row gap-10">
                        <div className="md:w-1/3 xl:w-1/4">
                            <div className="aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden"><img src={selectedBook.coverImage} alt={selectedBook.title} className="w-full h-full object-cover" /></div>
                        </div>
                        <div className="flex-1">
                            <div className="mb-2 flex gap-2"><span className="px-3 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold">Level {selectedBook.level}</span></div>
                            <h2 className="text-4xl font-bold text-[#1B2559] dark:text-white mb-2 font-serif">{selectedBook.title}</h2>
                            <p className="text-lg text-[#A3AED0] font-medium mb-6">by {selectedBook.author}</p>
                            <p className="text-[#2B3674] dark:text-slate-300 mb-8">{selectedBook.description}</p>
                            <h4 className="font-bold text-[#1B2559] dark:text-white mb-4 uppercase text-xs tracking-wider border-b border-[#E9EDF7] pb-2">Table of Contents</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[...Array(selectedBook.totalChapters)].map((_, i) => (
                                    <button key={i} onClick={() => handleChapterClick(i + 1)} disabled={chapterLoading !== null} className="flex items-center justify-between p-3 rounded-xl border border-[#E9EDF7] dark:border-slate-700 hover:border-[#4318FF] transition-all group">
                                        <span className="text-sm font-bold text-[#1B2559] dark:text-white group-hover:text-[#4318FF]">Chapter {i + 1}</span>
                                        {chapterLoading === i + 1 && <div className="w-4 h-4 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Library;