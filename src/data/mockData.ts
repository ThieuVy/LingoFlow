import { Book, Story, Exam } from "../types/types";

export const REAL_CLASSIC_BOOKS: Partial<Book>[] = [
    { title: "Pride and Prejudice", author: "Jane Austen", genre: "Classic Literature", level: "B2", description: "The romantic clash between the opinionated Elizabeth Bennet and the proud Mr. Darcy.", totalChapters: 61 },
    { title: "Moby Dick", author: "Herman Melville", genre: "Adventure", level: "C1", description: "The obsessive quest of Captain Ahab for revenge on Moby Dick, the white whale.", totalChapters: 135 },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic Literature", level: "B2", description: "A tragic story of Jay Gatsby's self-made fortune and his pursuit of Daisy Buchanan.", totalChapters: 9 },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Classic Literature", level: "B1", description: "A story about adolescent alienation and loss of innocence in the protagonist Holden Caulfield.", totalChapters: 26 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classic Literature", level: "B2", description: "A novel about the serious issues of rape and racial inequality.", totalChapters: 31 },
    { title: "Little Women", author: "Louisa May Alcott", genre: "Classic Literature", level: "A2", description: "The lives of the four March sisters—Meg, Jo, Beth, and Amy.", totalChapters: 47 },
    { title: "Jane Eyre", author: "Charlotte Brontë", genre: "Classic Literature", level: "B2", description: "The experiences of an orphaned governess who falls in love with her employer.", totalChapters: 38 },
    { title: "Wuthering Heights", author: "Emily Brontë", genre: "Classic Literature", level: "C1", description: "A tale of passion and revenge on the Yorkshire moors.", totalChapters: 34 },
    { title: "1984", author: "George Orwell", genre: "Sci-Fi & Fantasy", level: "C1", description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.", totalChapters: 24 },
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Sci-Fi & Fantasy", level: "B1", description: "The adventure of Bilbo Baggins as he journeys to the Lonely Mountain.", totalChapters: 19 },
    { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi & Fantasy", level: "C1", description: "A science fiction saga set on the desert planet Arrakis.", totalChapters: 22 },
    { title: "Sherlock Holmes", author: "Arthur Conan Doyle", genre: "Mystery", level: "B2", description: "A study in scarlet and other detective stories featuring the famous consulting detective.", totalChapters: 12 },
    { title: "Sapiens", author: "Yuval Noah Harari", genre: "History", level: "B2", description: "A brief history of humankind from the Stone Age to the twenty-first century.", totalChapters: 20 },
    { title: "The Art of War", author: "Sun Tzu", genre: "Philosophy", level: "C2", description: "An ancient Chinese military treatise dating from the Late Spring and Autumn Period.", totalChapters: 13 },
    { title: "Life of Pi", author: "Yann Martel", genre: "Adventure", level: "B2", description: "A young boy survives a shipwreck in the Pacific Ocean with a Bengal tiger.", totalChapters: 100 }
];

export const MOCK_STORIES: Story[] = [
    { id: 's1', title: 'The Golden Key', author: 'Grimm Brothers', genre: 'Fairy Tales', level: 'A2', description: 'A poor boy finds a key in the snow.' },
    { id: 's2', title: 'The Last Leaf', author: 'O. Henry', genre: 'Classic', level: 'B1', description: 'A story of hope and friendship during an illness.' },
    { id: 's3', title: 'A Martian Odyssey', author: 'Stanley G. Weinbaum', genre: 'Sci-Fi', level: 'B2', description: 'An astronaut discovers strange life forms on Mars.' },
    { id: 's4', title: 'The Tell-Tale Heart', author: 'Edgar Allan Poe', genre: 'Horror', level: 'C1', description: 'A narrator tries to convince the reader of his sanity while describing a murder.' },
    { id: 's5', title: 'The Gift of the Magi', author: 'O. Henry', genre: 'Romance', level: 'B2', description: 'A young husband and wife deal with the challenge of buying secret Christmas gifts.' },
    { id: 's14', title: 'Romeo and Juliet (Summary)', author: 'William Shakespeare', genre: 'Romance', level: 'B1', description: 'The tragic tale of two star-crossed lovers.' },
    { id: 's12', title: 'How to Win Friends', author: 'Dale Carnegie', genre: 'Business', level: 'B1', description: 'Key principles from the famous self-help book.' }
];

export const MOCK_EXAMS: Exam[] = [
    { id: 'e1', title: 'IELTS Academic Reading Test 1', type: 'IELTS', skill: 'Reading', duration: 60, questionCount: 40, participants: 12500, level: 'C1', tags: ['Academic', 'Environment'] },
    { id: 'e2', title: 'TOEIC Listening Practice', type: 'TOEIC', skill: 'Listening', duration: 45, questionCount: 100, participants: 34000, level: 'B1', tags: ['Business', 'Conversation'] },
    { id: 'e3', title: 'TOEFL iBT Speaking Simulation', type: 'TOEFL', skill: 'Speaking', duration: 20, questionCount: 6, participants: 8900, level: 'B2', tags: ['Integrated', 'Independent'] },
    { id: 'e4', title: 'General English Proficiency', type: 'General', skill: 'Full Test', duration: 90, questionCount: 60, participants: 50000, level: 'B1', tags: ['Grammar', 'Vocabulary'] },
    { id: 'e5', title: 'IELTS Writing Task 2', type: 'IELTS', skill: 'Writing', duration: 40, questionCount: 1, participants: 15000, level: 'C1', tags: ['Essay', 'Argumentative'] },
    { id: 'e6', title: 'HSK 4 Reading Practice', type: 'HSK', skill: 'Reading', duration: 40, questionCount: 40, participants: 5000, level: 'B1', tags: ['Chinese', 'Daily Life'] },
];