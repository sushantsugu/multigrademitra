# MultiGrade Mitra (मल्टी-ग्रेड मित्र)
> **"One Platform. Every Grade. Endless Possibilities."**  
> *"From Classroom to Campus — Learn Smarter with AI."*

MultiGrade Mitra is a production-grade, AI-powered educational and instructional platform designed to support students and educators from **Class 12** through **Undergraduate Degree Programs (B.Tech, B.Sc, B.Com, BBA, BCA)**, and advanced postgraduate learning.

---

## 🏛️ Vision & Architectural Philosophy

Traditional education platforms force a one-size-fits-all approach: school tools are too juvenile for engineering students, while higher-education platforms ignore the foundational pedagogical needs of high-schoolers and multi-grade educators.

**MultiGrade Mitra bridges this divide through 4 Target Educational Tiers:**
1. **Level 1 — Class 12 (Senior Secondary)**: Board exam derivations, formula sheets, NCERT/ISC numericals, step-by-step problem solving, and chapter revision guides.
2. **Level 2 — Undergraduate Degree Programs**: B.Sc, BCA, B.Com, BBA, BA semester-specific modules, applied case analyses, and printable worksheets.
3. **Level 3 — B.Tech Engineering**: Computer Science (CSE), Information Technology (IT), Electronics (ECE), Electrical (EEE), Mechanical (ME), and Civil (CE) branches with code tracing (C, Python), data structure rotations, complexity proofs, and circuit theorems.
4. **Level 4 — Advanced & Systems Learning**: Postgraduate research synthesis, GATE technical preparation, distributed systems, and machine learning optimizations.

---

## 🚀 Key Features

### For Students
- **AI Study Assistant**: Concept explanations in four formats (*Simple Language*, *Step-by-Step*, *Detailed Academic*, and *Example-Based*) with LaTeX formulas, worked numericals, exam mistake alerts, and code execution outputs.
- **Universal Document-to-Learning Workflow**: Multimodal vision OCR allows students to photograph textbook pages or upload lecture PDFs and transform them into study notes, formula sheets, practice questions, or diagnostic quizzes.
- **Revision Workspace**: Interactive 3D flip flashcards, subject formula sheets, and self-scoring diagnostic quizzes with pedagogical feedback.
- **My Saved Materials**: Searchable, database-backed personal library with 1-click server-side PDF exports.

### For Teachers
- **Structured Lesson Planner**: Generate complete pedagogical blueprints including Bloom's taxonomy objectives, active learning approaches, prerequisite checks, minute-by-minute timeline tables, blackboard/slide organization layouts, and homework assignments.
- **Diagnostic Quiz & Question Paper Maker**: Formulate balanced MCQs, short-answer, and conceptual questions with editable AI answer keys (clearly labeled for verification until teacher review) and point distributions.
- **MultiGrade Teaching Engine (Signature Feature)**: Orchestrate mixed-grade classrooms where Class 12 and B.Tech students explore the same overarching concept (e.g., *Rates of Change & Calculus*) across simultaneous, differentiated cognitive tiers.
- **Server-Side PDF Generation**: High-fidelity vector PDF generation powered by `pdfkit` on the Express backend, formatting margins, header branding, and pagination.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend SPA** | React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons |
| **Backend Fullstack** | Node.js Express, TypeScript (`tsx`), Vite middleware mode |
| **AI Multimodal Model**| Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK) |
| **Document Generation**| Server-Side `pdfkit` Vector PDF streaming engine |
| **Data Persistence** | Runtime-generated JSON store (`data/multigrade_store.json`, gitignored) + PostgreSQL DDL (`src/db/schema.sql`) + SQLAlchemy ORM (`backend/models.py`) |

---

## 📁 Repository Structure

```
├── .env.example              # Environment variable configurations
├── backend/
│   └── models.py             # SQLAlchemy 2.0 ORM models for Python/PostgreSQL
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Fullstack dependencies & npm scripts
├── server.ts                 # Fullstack Express server mounting Vite & APIs
├── src/
│   ├── App.tsx               # Primary application component
│   ├── index.css             # Tailwind theme & typography tokens
│   ├── main.tsx              # React DOM entry point
│   ├── components/
│   │   ├── common/           # ResourceLibrary, ProfileModal, PdfPreviewModal
│   │   ├── landing/          # LandingHero & tier cards
│   │   ├── layout/           # Navbar & Footer
│   │   ├── student/          # StudentDashboard, AIStudyAssistant, UploadAndLearn, RevisionWorkspace
│   │   └── teacher/          # TeacherDashboard, LessonPlanGenerator, QuizGenerator, MultiGradeTeaching
│   ├── context/
│   │   └── AuthContext.tsx   # User sessions & fast persona switcher
│   ├── db/
│   │   └── schema.sql        # Production PostgreSQL schema DDL
│   ├── lib/
│   │   └── curriculumData.ts # Configurable Class 12 & Engineering syllabi
│   ├── server/
│   │   ├── db.ts             # Persistence engine & seed data
│   │   ├── gemini.ts         # Gemini 3.8 Flash multimodal integration
│   │   └── pdfGenerator.ts   # Server-side PDF generation pipeline
│   └── types/
│       └── index.ts          # Complete TypeScript domain contracts
└── vite.config.ts            # Vite configuration
```

---

## 🏃 Local Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm

### 1. Installation
```bash
git clone <repo-url>
cd multigrade-mitra
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your Gemini API key is configured:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run Dev Server
```bash
npm run dev
```
The full-stack application will boot at `http://localhost:3000`.

---

## 🐳 Docker Setup

A production Dockerfile for containerized deployments:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```

---

## 📡 API Documentation

### 1. Health & Configuration
- `GET /api/health`: Returns health status and verifies Gemini AI readiness.
- `GET /api/curriculum`: Returns predefined curriculum catalog for Class 12 and B.Tech branches.

### 2. Authentication & Profiles
- `POST /api/auth/login`: Authenticate with email.
- `POST /api/auth/register`: Create student or teacher profile.
- `GET /api/auth/demo-users`: Retrieve pre-seeded student and teacher demo personas.
- `PUT /api/auth/profile`: Update curriculum level, branch, learning style, or teacher courses.

### 3. AI Learning & Extraction
- `POST /api/learning/explain`: Generate structured concept explanation (formulas, worked examples, code, revision summary).
- `POST /api/learning/upload-and-learn`: Multimodal OCR document ingestion converting uploaded images/PDFs into selected learning artifacts.

### 4. Teaching & Pedagogy
- `POST /api/teaching/lesson-plan`: Generate structured pedagogical blueprint with minute-by-minute timeline.
- `POST /api/teaching/quiz`: Generate multi-format test paper with verified answer keys.
- `POST /api/teaching/multigrade`: Formulate multi-tier differentiated learning framework for simultaneous cohorts.

### 5. Document & Storage Vault
- `GET /api/resources`: Filter and search saved materials.
- `POST /api/resources`: Save newly synthesized materials.
- `DELETE /api/resources/:id`: Delete a saved resource.
- `POST /api/pdf/generate`: Direct server-side streaming vector PDF generation via `pdfkit`.

---

## 🛡️ Privacy, Security & Academic Integrity
- **No Private Data Exposure**: Student profiles are private to each user; there are no public student feeds or surveillance metrics.
- **Pedagogical AI Disclaimer**: MultiGrade Mitra clearly labels all generated test keys and explanations as educational tools to be verified against university course textbooks and laboratory manuals.
- **Secure File Ingestion**: Uploaded documents are validated against strict MIME types and file size boundaries (20MB limit).

---

## 🤝 Brand Message
> *"MultiGrade Mitra — From Classrooms to Campuses, Helping Everyone Learn Smarter."*
