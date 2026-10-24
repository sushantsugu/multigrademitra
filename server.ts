import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import {
  isGeminiConfigured,
  generateConceptExplanation,
  analyzeUploadedDocument,
  generateLessonPlan,
  generateQuiz,
  generateMultiGradeActivities
} from './src/server/gemini';
import { generateEducationalPDF } from './src/server/pdfGenerator';
import { EDUCATION_PROGRAMS, CURRICULUM_SUBJECTS, SUPPORTED_LANGUAGES } from './src/lib/curriculumData';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'MultiGrade Mitra',
    version: '1.0.0',
    geminiConfigured: isGeminiConfigured(),
    timestamp: new Date().toISOString()
  });
});

// Curriculum API
app.get('/api/curriculum', (req: Request, res: Response) => {
  res.json({
    programs: EDUCATION_PROGRAMS,
    subjects: CURRICULUM_SUBJECTS,
    languages: SUPPORTED_LANGUAGES
  });
});

// Auth Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found. Please register or use a demo account.' });
  }

  res.json({ user, token: `token-${user.id}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, studentProfile, teacherProfile } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser = db.createUser({
    name,
    email,
    role,
    studentProfile,
    teacherProfile
  });

  res.status(201).json({ user: newUser, token: `token-${newUser.id}` });
});

app.get('/api/auth/demo-users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const userId = token.replace('token-', '');
  const user = db.getUserById(userId);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ user });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const userId = authHeader.replace('Bearer ', '').replace('token-', '');
  const { name, studentProfile, teacherProfile } = req.body;

  const updated = db.updateUser(userId, {
    ...(name ? { name } : {}),
    ...(studentProfile ? { studentProfile } : {}),
    ...(teacherProfile ? { teacherProfile } : {})
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ user: updated });
});

// AI Learning: Concept Explanation
app.post('/api/learning/explain', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (typeof payload.topic !== 'string' || !payload.topic.trim() || typeof payload.educationLevel !== 'string') {
      return res.status(400).json({ error: 'A topic and academic level are required.' });
    }
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to your .env file and restart the server.' });
    }

    const explanation = await generateConceptExplanation(payload);
    res.json(explanation);
  } catch (err: any) {
    console.error('Error in /api/learning/explain:', err);
    res.status(502).json({ error: err.message || 'Gemini could not generate this study material. Please try again.' });
  }
});

// AI Learning: Universal Document-to-Learning Upload
app.post('/api/learning/upload-and-learn', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, filename, outputType, educationLevel, customInstructions } = req.body;
    if (typeof fileBase64 !== 'string' || typeof filename !== 'string' || !filename.trim()) {
      return res.status(400).json({ error: 'Uploaded file data and filename are required.' });
    }
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to your .env file and restart the server.' });
    }

    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    if (typeof mimeType !== 'string' || !allowedMimeTypes.has(mimeType)) {
      return res.status(415).json({ error: 'Unsupported file type. Upload a JPEG, PNG, WEBP image, or PDF.' });
    }
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(fileBase64)) {
      return res.status(400).json({ error: 'The uploaded file could not be read. Please select it again.' });
    }

    const fileSize = Buffer.from(fileBase64, 'base64').byteLength;
    if (fileSize === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty.' });
    }
    if (fileSize > 20 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size exceeds the 20MB limit.' });
    }

    const supportedOutputTypes = new Set([
      'notes', 'revision_summary', 'formula_sheet', 'practice_questions',
      'quiz', 'worksheet', 'lesson_plan', 'assignment', 'multigrade'
    ]);
    if (outputType !== undefined && !supportedOutputTypes.has(outputType)) {
      return res.status(400).json({ error: 'Choose a valid learning material type.' });
    }
    if (customInstructions !== undefined && (typeof customInstructions !== 'string' || customInstructions.length > 2000)) {
      return res.status(400).json({ error: 'Custom instructions must be 2,000 characters or fewer.' });
    }

    const result = await analyzeUploadedDocument(
      fileBase64,
      mimeType || 'image/jpeg',
      filename,
      outputType || 'notes',
      educationLevel || 'btech',
      customInstructions
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/learning/upload-and-learn:', err);
    res.status(502).json({ error: err.message || 'Gemini could not process this document. Please try again.' });
  }
});

// AI Teaching: Lesson Plan
app.post('/api/teaching/lesson-plan', async (req: Request, res: Response) => {
  try {
    const plan = await generateLessonPlan(req.body);
    res.json(plan);
  } catch (err: any) {
    console.error('Error in /api/teaching/lesson-plan:', err);
    res.status(500).json({ error: err.message || 'Failed to generate lesson plan' });
  }
});

// AI Teaching: Quiz Generator
app.post('/api/teaching/quiz', async (req: Request, res: Response) => {
  try {
    const quiz = await generateQuiz(req.body);
    res.json(quiz);
  } catch (err: any) {
    console.error('Error in /api/teaching/quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// AI Teaching: MultiGrade Differentiated Instruction
app.post('/api/teaching/multigrade', async (req: Request, res: Response) => {
  try {
    const { overarchingTopic, selectedGrades, contextSubject } = req.body;
    if (!overarchingTopic || !selectedGrades || selectedGrades.length === 0) {
      return res.status(400).json({ error: 'Overarching topic and at least one target grade are required' });
    }

    const result = await generateMultiGradeActivities({
      overarchingTopic,
      selectedGrades,
      contextSubject: contextSubject || 'Interdisciplinary STEM'
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/teaching/multigrade:', err);
    res.status(500).json({ error: err.message || 'Failed to generate multigrade instruction plan' });
  }
});

// Resources CRUD
app.get('/api/resources', (req: Request, res: Response) => {
  const { userId, resourceType, educationLevel, query } = req.query;
  const list = db.getResources(userId as string | undefined, {
    resourceType: resourceType as string | undefined,
    educationLevel: educationLevel as string | undefined,
    query: query as string | undefined
  });
  res.json({ resources: list });
});

app.get('/api/resources/:id', (req: Request, res: Response) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json({ resource });
});

app.post('/api/resources', (req: Request, res: Response) => {
  const { userId, title, subject, topic, educationLevel, program, branch, semester, resourceType, content, structuredData, metadata } = req.body;
  if (!userId || !title || !content) {
    return res.status(400).json({ error: 'User ID, title, and content are required' });
  }

  const created = db.createResource({
    userId,
    title,
    subject: subject || 'General Academic',
    topic: topic || title,
    educationLevel: educationLevel || 'btech',
    program,
    branch,
    semester,
    resourceType: resourceType || 'notes',
    content,
    structuredData,
    metadata
  });

  res.status(201).json({ resource: created });
});

app.put('/api/resources/:id', (req: Request, res: Response) => {
  const updated = db.updateResource(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Resource not found' });
  res.json({ resource: updated });
});

app.delete('/api/resources/:id', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

  const deleted = db.deleteResource(req.params.id, userId);
  if (!deleted) return res.status(404).json({ error: 'Resource not found or unauthorized' });
  res.json({ success: true });
});

// Server-side PDF generation endpoint
app.post('/api/pdf/generate', (req: Request, res: Response) => {
  try {
    const { title, resourceType, subject, topic, educationLevel, difficulty, program, semester, authorName, institution, content, structuredData } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required for PDF generation' });
    }

    generateEducationalPDF(
      {
        title,
        resourceType: resourceType || 'notes',
        subject: subject || 'Academic Notes',
        topic: topic || title,
        educationLevel: educationLevel || 'Class 12 / Higher Ed',
        difficulty,
        program,
        semester,
        authorName,
        institution,
        content,
        structuredData
      },
      res
    );
  } catch (err: any) {
    console.error('Failed to generate PDF:', err);
    res.status(500).json({ error: err.message || 'PDF Generation failed' });
  }
});

// Vite dev server mounting
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MultiGrade Mitra server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
