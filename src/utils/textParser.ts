export const splitBookIntoChapters = (fullText: string): string[] => {
    // Regex tìm các mẫu tiêu đề chương phổ biến (Chapter 1, Chương I, ONE, Chapter One...)
    // Giữ nguyên định dạng xuống dòng của nội dung
    const chapterRegex = /(?:^|\n)(?:CHAPTER|Chapter|PART|Part|Book|Chương|Phần)\s+(?:\d+|[IVXLCDM]+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)(?::|\.|(?=\n))/i;
    
    // Tách văn bản
    const parts = fullText.split(chapterRegex);
    
    // Lọc bỏ các phần rỗng do hàm split tạo ra ở đầu mảng
    const chapters = parts.filter(part => part.trim().length > 100); // Giữ các phần có nội dung đáng kể

    // Nếu không tìm thấy chương nào (sách ngắn hoặc định dạng lạ), trả về nguyên văn bản là 1 chương
    if (chapters.length === 0) {
        return [fullText];
    }

    return chapters.map(c => c.trim());
};