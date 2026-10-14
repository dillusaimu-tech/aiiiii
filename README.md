# 🎓 StudyMate AI — Modern Academic & Study AI Chatbot

**StudyMate AI** is a polished, responsive web application designed **exclusively for studying, academic learning, exam preparation, and learning productivity**. It acts as a 24/7 personal tutor, providing step-by-step problem solutions, concept explanations, note summarization, interactive scored quizzes, revision flashcards, and customized study schedules.

---

## ✨ Features

- **🎓 AI Study Chat**: Context-aware natural conversation with contextual follow-up recommendations.
- **💡 Explain Topics (ELI5)**: Simplifies difficult academic topics into everyday language with intuitive analogies.
- **📐 Step-by-Step Problem Solver**: Detailed derivations, formula application, and verification checks for math, physics, chemistry, and computer science.
- **📋 Study Note Summarizer**: Transform messy lecture transcripts and textbook excerpts into structured key takeaways, definition tables, and cheat sheets.
- **📝 Interactive Quiz Studio**: Generates diagnostic MCQs and true/false questions with instant feedback, scoring, and explanations.
- **🗂️ 3D Flashcard Deck**: Active-recall question-and-answer revision flip cards with difficulty ratings and mastery tracking (*Mastered* vs *Needs Review*).
- **📅 Exam Study Planner**: Creates daily and weekly revision schedules based on target exam dates, daily hours, and weak areas.
- **🛡️ Academic Boundary Enforcement**: Strictly dedicated to education. Politely redirects unrelated or off-topic queries back to academic learning.
- **📐 Mathematical Formula Rendering**: Seamless LaTeX and KaTeX math rendering ($...$ and $$...$$).
- **💻 Code Syntax Highlighting**: Formatted code blocks with language labels and one-click copy buttons.
- **💾 Local Persistence & Export**: Save, reopen, rename, and delete conversations locally. One-click export to Markdown (`.md`).
- **🌓 Light & Dark Modes**: Accessible academic color palette (deep slate and vibrant indigo accents).
- **🔊 Text-to-Speech (Audio)**: Listen out loud to explanations for auditory revision.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Markdown & Math**: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`.
- **Backend**: Node.js & Express 5 API server.
- **Security**:
  - API keys remain strictly on the backend and are never exposed to browser clients.
  - Educational system prompt is securely enforced server-side.
  - Rate limiting (35 requests/minute per client) and input validation (8,000 char maximum).
- **Dual AI Engine**:
  - **Live AI Providers**: Native integration with Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`) or OpenAI (`gpt-4o-mini`).
  - **Academic Demo Mode**: Offline educational intelligence engine that works immediately without requiring API keys, with full quiz, flashcard, and step-by-step problem-solving capabilities.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 20+ installed.

### 2. Installation
```bash
# Clone or navigate to the project root directory
cd dilee

# Install dependencies
npm install
```

### 3. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your preferred AI provider in `.env`:
```env
PORT=5001

# Option 1: Google Gemini (Recommended - Free key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Option 2: OpenAI API
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4o-mini

# Option 3: Groq API
# GROQ_API_KEY=your_groq_api_key_here
# GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note**: If `GEMINI_API_KEY` and `OPENAI_API_KEY` are left blank, StudyMate AI automatically runs in **Academic Demo Mode**, providing full offline functionality with clear demo indicators.

---

## 🖥️ Running the Application

### Development Mode (Concurrent Frontend & Backend)
Runs the Express backend on port `5001` and Vite dev server on port `3000` with hot module reloading:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Production Build & Server
Builds the optimized frontend bundle and runs the unified Express server:
```bash
npm run build
npm start
```
Open **`http://localhost:5001`** in your browser.

---

## 🧪 Testing User Flows
1. **Explain a Concept**: Click the *"Explain Complex Topic"* prompt card or select the *Simple / ELI5* mode.
2. **Step-by-Step Solver**: Ask *"Solve 2x^2 + 7x + 3 = 0"* and view the step-by-step mathematical reasoning.
3. **Interactive Quiz**: Open *"Interactive Quiz Studio"*, enter any topic (e.g. *Cell Respiration* or *Calculus*), pick options, and review your score.
4. **Flashcards**: Open *"Flashcard Deck"*, generate cards, click to 3D flip, and mark cards as *Mastered* or *Review*.
5. **Study Planner**: Open *"Exam Study Planner"*, choose your exam date and study hours, and generate a customized study timetable.
6. **Academic Redirection**: Try asking off-topic questions (e.g. celebrity gossip or gaming cheats) to observe StudyMate politely redirecting back to study assistance.
7. **Export & Audio**: Click the download icon to save your study session as Markdown, or click the *Listen* button to hear answers read out loud.

---

## 📄 License
MIT — Dedicated to open, accessible, and distraction-free academic learning.
