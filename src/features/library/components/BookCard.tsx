// FILE: src/features/library/components/BookCard.tsx
import React from 'react';
import { Book } from '../../../types/types';

interface Props {
    book: Book;
    isLocal?: boolean;
    onClick: () => void;
}

const BookCard: React.FC<Props> = ({ book, isLocal, onClick }) => {
    return (
        <div onClick={onClick} className="group cursor-pointer perspective-1000">
            <div className={`relative aspect-[2/3] rounded-2xl shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden ${isLocal ? 'border-2 border-emerald-100 dark:border-emerald-900' : 'bg-[#F4F7FE] dark:bg-slate-800'}`}>
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                {isLocal && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">LOCAL</div>
                )}
            </div>
            <h3 className="mt-4 font-bold text-[#1B2559] dark:text-white text-sm leading-tight line-clamp-1">{book.title}</h3>
            <p className="text-xs text-[#A3AED0] mt-1">{book.author}</p>
        </div>
    );
};
export default BookCard;