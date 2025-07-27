# Career Site

A comprehensive job search and career platform built with Next.js 15, featuring cutting-edge AI-powered job recommendations, advanced semantic search, and personalized career guidance. This application combines modern web technologies with state-of-the-art machine learning to create an intelligent job discovery and career development experience.

---

## ✨ Core Features

### 🔍 Advanced Job Search & Discovery
- **Smart Search Engine**: Custom-built search with fuzzy matching, prefix matching, and relevance scoring
- **AI-Enhanced Search**: OpenAI integration enhances search queries with synonyms and related terms
- **Semantic Search**: Vector embeddings for finding conceptually similar jobs beyond keyword matching
- **Advanced Filtering**: Filter by department, seniority level, employment type, location, and work arrangements
- **Work Type Support**: Remote, On-site, and Hybrid job filtering with intelligent matching
- **Real-time Results**: Instant search results with pagination and load-more functionality

### 🤖 AI-Powered Career Intelligence

#### Enhanced Resume Analysis
- **Comprehensive Resume Processing**: Advanced AI parsing supporting PDF, DOC, DOCX, and TXT formats
- **Skill Proficiency Assessment**: AI evaluates technical and soft skills with proficiency levels
- **Career Progression Analysis**: Tracks career growth patterns and advancement rate
- **Domain Expertise Identification**: Recognizes industry-specific knowledge and experience
- **Skill Gap Analysis**: Identifies missing skills for career advancement

#### Intelligent Job Matching
- **Semantic Job Matching**: Uses OpenAI embeddings for deep compatibility analysis
- **Multi-factor Scoring**: Combines skill overlap, experience level, and career fit
- **Personalized Match Explanations**: AI-generated explanations for each job match
- **Salary Alignment Analysis**: Evaluates compensation fit based on experience and market data
- **Career Progression Fit**: Assesses how jobs align with career trajectory

#### AI Career Guidance
- **Personalized Career Advice**: Tailored recommendations based on background and goals
- **Next Steps Identification**: AI suggests specific actions for career advancement
- **Market Insights**: Industry trends and demand analysis for skill sets
- **Role Recommendations**: AI suggests optimal career moves and transitions

### 💬 AI Career Assistant
- **Interactive Chat Interface**: Real-time conversation with OpenAI-powered career advisor
- **Contextual Advice**: Get personalized career guidance, interview tips, and resume feedback
- **Job-Specific Guidance**: Ask questions about specific positions or career paths
- **Resume Enhancement**: AI-powered suggestions for improving your resume

### 📊 Advanced Analytics & Insights
- **Match Visualization**: Detailed compatibility scores and explanations
- **Skill Mapping**: Visual representation of skill alignment with jobs
- **Career Trajectory Analysis**: Insights on potential career paths
- **Strength Assessment**: Identifies unique selling points and competitive advantages
- **Improvement Recommendations**: Specific suggestions for skill development

### 🎯 Enhanced User Experience
- **Mobile-First Design**: Fully responsive interface optimized for all devices
- **Accessibility Compliant**: WCAG guidelines with proper ARIA labels and keyboard navigation
- **Performance Optimized**: Fast loading with intelligent caching and efficient queries
- **Session Persistence**: Maintains user preferences and search history
- **Progressive Enhancement**: Works with or without JavaScript enabled

---

## 🧠 AI Technology Stack

### Machine Learning & AI
- **OpenAI GPT-4o**: Advanced language model for text analysis and generation
- **Text Embeddings**: Semantic similarity matching using OpenAI's embedding models
- **Natural Language Processing**: Sophisticated text parsing and understanding
- **Personalization Engine**: ML-driven job recommendations and career guidance

### AI Features Implementation
- **Resume Intelligence**: Multi-stage AI analysis extracting 20+ data points
- **Semantic Matching**: Vector similarity search for job compatibility
- **Career Modeling**: AI assessment of career progression and fit
- **Intelligent Insights**: Automated generation of career advice and recommendations

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/skochar1/career.git
   cd career
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API Key:**
   - Create a file named `.env.local` in the root:
     ```env
     OPENAI_API_KEY=sk-your-openai-key
     ```
   - (Never commit this file! It's in `.gitignore`.)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Visit [http://localhost:3000](http://localhost:3000) in your browser.**

6. **Initialize the database:**
   - Visit `/api/init-db` to set up tables and seed sample data

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
   ```env
   OPENAI_API_KEY=your-openai-api-key
   POSTGRES_URL=your-postgres-connection-string (auto-configured by Vercel)
   ```

3. **Initialize Database**:
   After deployment, visit `/api/init-db` to set up tables and seed data.

### Local Development Database
- **Development**: Uses SQLite (`career.db`) for local development
- **Production**: Automatically switches to PostgreSQL on Vercel
- **Schema Management**: Automatic migration handling between environments

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 18](https://react.dev/)** - Component library with Suspense and Concurrent Features
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and enhanced developer experience
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework with custom design system
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives and dialog systems
- **[Lucide React](https://lucide.dev/)** - Comprehensive icon library

### Backend & AI
- **[OpenAI API](https://platform.openai.com/)** - GPT-4o for advanced AI analysis and embeddings
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Production database with edge optimization
- **[Better SQLite3](https://github.com/WiseLibs/better-sqlite3)** - High-performance local development database
- **Custom AI Engine** - Proprietary algorithms for job matching and career analysis

### AI & Machine Learning
- **Vector Embeddings** - Semantic similarity and intelligent matching
- **Natural Language Processing** - Advanced text analysis and understanding
- **Career Modeling** - Proprietary algorithms for career progression analysis
- **Personalization Engine** - ML-driven recommendations and insights

### Key Libraries & Tools
- **Document Processing** - Multi-format resume parsing (PDF, DOC, DOCX, TXT)
- **File Upload Handling** - Secure file processing with validation
- **Caching Layer** - In-memory caching for optimal performance
- **Session Management** - Secure UUID-based user sessions
- **Search Engine** - Custom full-text search with semantic enhancement

---

## 📁 Project Structure

```
career/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── jobs/         # Job search and filtering
│   │   ├── recommendations/ # AI-powered job matching
│   │   ├── upload-resume/ # Resume processing
│   │   └── chat/         # AI career assistant
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── JobSearch.tsx     # Search interface
│   ├── JobListings.tsx   # Job display and filtering
│   ├── Header.tsx        # Navigation
│   └── ui/               # Reusable UI components
├── lib/                  # Core business logic
│   ├── ai-resume-analyzer.ts    # Advanced AI resume processing
│   ├── ai-job-matcher.ts        # Semantic job matching engine
│   ├── resume-parser.ts         # File processing and text extraction
│   ├── job-matcher.ts           # Job compatibility algorithms
│   ├── search.ts               # Search engine implementation
│   ├── database.ts             # SQLite operations
│   └── database-postgres.ts    # PostgreSQL operations
└── README.md             # This file
```

---

## 🔧 API Endpoints

### Core APIs
- `GET /api/jobs` - Job search and filtering
- `GET /api/recommendations` - AI-powered job recommendations
- `POST /api/upload-resume` - Resume processing and analysis
- `POST /api/chat` - AI career assistant
- `GET /api/init-db` - Database initialization

### Features
- **Intelligent Caching** - Optimized response times
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript integration
- **Validation** - Input validation and sanitization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ and AI by Shreya Kochar**

*Empowering careers through intelligent technology*