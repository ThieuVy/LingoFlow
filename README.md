# 🚀 LingoFlow - AI Mastery

> **The Ultimate AI-Powered Language Learning Platform**

LingoFlow is a cutting-edge language learning application designed to help users master English and other languages through immersive, AI-driven experiences. Built with **React**, **Tailwind CSS**, and powered by the latest **Google Gemini Models** (2.5 Flash, 3.0 Pro, and Live API).

![LingoFlow Banner](https://image.pollinations.ai/prompt/luxury%20dark%20ui%20dashboard%20language%20learning%20app%20interface%20cyberpunk%20blue%20purple%20gradient?nologo=true)

## ✨ Key Features

### 🎧 Live Speaking Practice

Engage in real-time, low-latency voice conversations with an AI tutor.

- **Powered by:** Gemini 2.5 Flash Native Audio (Live API).
- **Features:** Real-time audio visualizer, instant feedback, and natural conversational flow.

### 📚 AI Library & Content Reader

Access a vast library of books and stories generated on demand.

- **Real Books:** Fetches content from public domain classics (e.g., Sherlock Holmes, Pride and Prejudice).
- **Smart Reader:** Built-in TTS (Text-to-Speech), click-to-define dictionary, and customizable reading settings (fonts, themes).
- **File Support:** Upload PDF, DOCX, TXT, or EPUB files to study your own documents.

### ✍️ Writing Lab (Thinking Mode)

Submit essays or paragraphs and receive structured feedback.

- **Powered by:** Gemini 3.0 Pro (Thinking Mode).
- **Features:** Grammar correction, vocabulary suggestions, and a proficiency score (0-100).

### 📰 Global Daily News

Stay updated with world events while learning.

- **Google Search Grounding:** Fetches real-time news from reliable sources (NYT, BBC, VnExpress).
- **Auto-Translation:** Automatically translates and summarizes local news into English for B1-C2 learners.

### 🎓 Exam Library (IELTS/TOEIC/...)

Simulate real exam environments.

- **Exam Generation:** AI creates unique reading, listening, and writing tests based on IELTS/TOEIC formats.
- **Simulation Mode:** Strict timer and standard UI for realistic practice.

### 📖 Master Dictionary

An integrated Oxford-style dictionary.

- **Features:** Phonetics, audio pronunciation, multiple meanings, examples, and synonyms.

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS (Luxury/Glassmorphism design system).
- **AI Models:**
  - `gemini-2.5-flash`: High-speed text generation, news, and dictionary lookups.
  - `gemini-3-pro-preview`: Complex reasoning for Writing Lab and image analysis.
  - `gemini-2.5-flash-native-audio`: Live Speaking interface.
  - `gemini-2.5-flash-tts`: High-quality Text-to-Speech.
- **Tools:** Google Search Grounding tool for news.
- **Assets:** Dynamic images generated via Pollinations.ai.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A Google Cloud Project with the **Gemini API** enabled.
- An API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lingoflow.git
   cd lingoflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your API key:

   ```env
   # Note: In the source code provided, process.env.API_KEY is used.
   # Depending on your bundler (Vite/Webpack), you might need VITE_API_KEY.
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm start
   # or
   npm run dev
   ```

## 🧠 AI Integration Details

| Feature      | Model Used                          | Reason                                                    |
| :----------- | :---------------------------------- | :-------------------------------------------------------- |
| **Speaking** | `gemini-2.5-flash-native-audio`     | Ultra-low latency for real-time conversation.             |
| **Writing**  | `gemini-3-pro-preview`              | High reasoning capability for detailed grading.           |
| **News**     | `gemini-2.5-flash` + `googleSearch` | Speed and access to real-time internet data.              |
| **TTS**      | `gemini-2.5-flash-preview-tts`      | Natural, human-like voice synthesis.                      |
| **Library**  | `gemini-2.5-flash`                  | Ability to generate/recall large context (book chapters). |

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**LingoFlow** - _Master languages with the power of AI._
