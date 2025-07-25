# Career Site

A modern job search and career assistant web app, built with Next.js 15 and OpenAI’s GPT. Find jobs, filter by your interests, chat with an AI assistant, and extract keywords from your resume—all in one place.

---

## Features

- 🔎 **Job Search & Filtering** – Browse jobs and filter by category, location, and more.
- 🤖 **AI Career Assistant** – Chat with an OpenAI-powered assistant for job advice or resume tips.
- 📄 **Resume Parsing** – Upload your resume and extract relevant keywords to improve your job matches.
- 🌐 **Deployed on Vercel** – Fast, reliable hosting.

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

## Deployment

- Deploys automatically to [Vercel](https://vercel.com).
- Set your `OPENAI_API_KEY` in the Vercel dashboard under Project → Settings → Environment Variables.

---

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React](https://react.dev/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Tailwind CSS](https://tailwindcss.com/)

---

## License

MIT

---

**Made with ❤️ by Shreya Kochar**
