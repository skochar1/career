# Career Site

A comprehensive job search and career platform built with Next.js 15, featuring AI-powered job recommendations, smart search, and personalized career assistance. This application combines modern web technologies with machine learning to create an intelligent job discovery experience.

---

## ✨ Core Features

### 🔍 Advanced Job Search & Discovery
- **Smart Search Engine**: Custom-built search with fuzzy matching, prefix matching, and relevance scoring
- **AI-Enhanced Search**: OpenAI integration enhances search queries with synonyms and related terms
- **Advanced Filtering**: Filter by department, seniority level, employment type, location, and work arrangements
- **Work Type Support**: Remote, On-site, and Hybrid job filtering with intelligent matching
- **Real-time Results**: Instant search results with pagination and load-more functionality

### 🤖 Personalized AI Recommendations
- **Resume-Based Matching**: Upload your resume for personalized job recommendations
- **Skill Extraction**: AI-powered parsing extracts skills, experience level, and preferences from resumes
- **Match Scoring**: Each job gets a compatibility score based on your profile
- **Skill Highlighting**: Visual indicators show which of your skills match job requirements

### 💬 AI Career Assistant
- **Interactive Chat Interface**: Real-time conversation with OpenAI-powered career advisor
- **Contextual Advice**: Get personalized career guidance, interview tips, and resume feedback
- **Job-Specific Guidance**: Ask questions about specific positions or career paths

### 📊 Smart Job Analytics
- **Match Visualization**: See how well you match with each position
- **Skill Gap Analysis**: Understand what skills you're missing for target roles
- **Career Progression**: Get insights on potential career paths based on your background

### 🎯 Enhanced User Experience
- **Responsive Design**: Fully responsive interface optimized for all devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance Optimized**: Fast loading with caching and efficient database queries
- **Dark/Light Mode**: User preference-based theming (if implemented)

---

## Getting Started

1. **Clone the repository:**
   ```
   git clone https://github.com/skochar1/career.git
   cd career
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up your OpenAI API Key:**
   - Create a file named `.env.local` in the root:
     ```
     OPENAI_API_KEY=sk-your-openai-key
     ```
   - (Never commit this file! It’s in `.gitignore`.)

4. **Run the development server:**
   ```
   npm run dev
   ```

5. **Visit [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 🚀 Deployment

### For Vercel (Recommended)

1. **Database Setup**: 
   ```bash
   # Add Vercel Postgres to your project
   vercel add postgres
   ```

2. **Environment Variables**:
   Set in Vercel dashboard under Project → Settings → Environment Variables:
   ```
   OPENAI_API_KEY=your-openai-api-key
   POSTGRES_URL=your-postgres-connection-string (auto-configured by Vercel)
   ```

3. **Initialize Database**:
   After deployment, visit `/api/init-db` to set up tables and seed data.

### Local Development Database
- **Development**: Uses SQLite (`career.db`) for local development
- **Production**: Automatically switches to PostgreSQL on Vercel

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - Component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & AI
- **[OpenAI API](https://platform.openai.com/)** - GPT-4 for search enhancement and chat
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Production database
- **[Better SQLite3](https://github.com/WiseLibs/better-sqlite3)** - Local development database
- **Custom Search Engine** - In-memory full-text search with scoring

### Key Libraries
- **PDF Processing** - Resume parsing and text extraction
- **Form Handling** - File uploads with validation
- **Caching** - In-memory caching for API responses
- **Session Management** - UUID-based user sessions

---

## License

MIT

---

**Made with ❤️ by Shreya Kochar**
