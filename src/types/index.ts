export type UserRole = 'student' | 'teacher';

export type EducationLevel = 'class12' | 'undergrad' | 'btech' | 'advanced';

export type StudyOutputType =
  | 'study_notes'
  | 'topic_explanation'
  | 'solved_questions'
  | 'practice_solutions'
  | 'revision_notes';

export interface StudentProfile {
  educationLevel: EducationLevel;
  degree: string; // e.g. "B.Tech", "Class 12 (Science)", "B.Sc"
  branch?: string; // e.g. "Computer Science & Engineering", "Mechanical", "Commerce"
  year?: string; // e.g. "1st Year", "2nd Year", "12th Grade"
  semester?: string; // e.g. "Semester 3", "Semester 1"
  preferredLanguage: string; // "English", "Hindi", "Hinglish", etc.
  learningStyle: 'visual' | 'step-by-step' | 'example-heavy' | 'academic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TeacherProfile {
  institution?: string;
  subjectsTaught: string[];
  educationLevelsTaught: EducationLevel[];
  preferredLanguage: string;
  experienceYears?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  createdAt: string;
}

export type ResourceType =
  | 'notes'
  | 'revision_summary'
  | 'formula_sheet'
  | 'practice_questions'
  | 'quiz'
  | 'worksheet'
  | 'lesson_plan'
  | 'assignment'
  | 'multigrade';

export interface SavedResource {
  id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  educationLevel: EducationLevel;
  program?: string;
  branch?: string;
  semester?: string;
  resourceType: ResourceType;
  content: string; // Markdown or rich formatted text
  structuredData?: any; // parsed JSON if quiz or multi-grade
  metadata?: {
    difficulty?: string;
    language?: string;
    duration?: string;
    targetGrades?: string[];
    isReviewedByTeacher?: boolean;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumSubject {
  id: string;
  name: string;
  code?: string;
  educationLevel: EducationLevel;
  program: string;
  branch?: string;
  semester?: string;
  chapters: string[];
}

export interface AIExplanationPayload {
  subject: string;
  topic: string;
  outputType: StudyOutputType;
  question?: string;
  educationLevel: EducationLevel;
  degree: string;
  branch?: string;
  semester?: string;
  format: 'simple' | 'step-by-step' | 'academic' | 'example-based';
  detailLevel: 'short' | 'detailed' | 'concepts' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

export interface AIExplanationResult {
  title: string;
  topic: string;
  subject?: string;
  outputType?: StudyOutputType;
  educationLevel: string;
  learningObjectives?: string[];
  explanation: string;
  derivations?: { title: string; steps: string[] }[];
  keyFormulas?: { name: string; formula: string; explanation: string }[];
  workedExamples?: { question: string; stepByStepSolution: string[]; finalAnswer: string }[];
  applications?: string[];
  examQuestions?: { question: string; answer: string }[];
  keyTerms?: { term: string; definition: string }[];
  commonMistakes?: string[];
  practiceProblems?: { question: string; hint?: string; solution: string }[];
  codeSnippets?: { language: string; code: string; explanation: string; output?: string }[];
  revisionSummary: string;
  sourceNote?: string;
  verifiedSourceDistinction: string;
}

export interface DocumentAnalysisResult {
  documentName: string;
  extractedConcepts: string[];
  identifiedSubject: string;
  identifiedTopic: string;
  identifiedLevel: string;
  outputType: ResourceType;
  generatedContent: string;
  structuredDetails?: any;
}

export interface LessonPlanResult {
  topic: string;
  subject: string;
  educationLevel: string;
  duration: string;
  learningObjectives: string[];
  pedagogicalApproach: string;
  prerequisiteKnowledge: string[];
  timeline: { time: string; phase: string; activity: string; teachingAid: string }[];
  blackboardSummary: string;
  discussionPrompts: string[];
  homeworkOrFollowUp: string;
}

export interface QuizQuestionItem {
  id: string;
  type: 'mcq' | 'short' | 'long' | 'conceptual' | 'application';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  marks: number;
}

export interface QuizResult {
  title: string;
  subject: string;
  topic: string;
  educationLevel: string;
  totalMarks: number;
  timeLimitMinutes: number;
  isReviewedByTeacher: boolean;
  questions: QuizQuestionItem[];
}

export interface MultiGradeActivityTier {
  gradeLevel: string;
  tierName: string;
  cognitiveFocus: string; // e.g. "Fundamental Intuition", "Analytical Rigor", "Applied Engineering / Algorithms"
  topicExplanation: string;
  coreConcepts: string[];
  differentiatedActivity: string;
  practiceQuestions: string[];
}

export interface MultiGradeResult {
  overarchingTopic: string;
  subjectDomain: string;
  introduction: string;
  tiers: MultiGradeActivityTier[];
  crossGradeSynthesis: string;
  teacherGuide: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  subject: string;
  level: string;
}
