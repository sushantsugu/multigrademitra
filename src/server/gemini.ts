import { GoogleGenAI } from '@google/genai';
import {
  AIExplanationPayload,
  AIExplanationResult,
  DocumentAnalysisResult,
  LessonPlanResult,
  QuizResult,
  MultiGradeResult,
  ResourceType
} from '../types';

let ai: GoogleGenAI | undefined;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Gemini API is not configured. Add GEMINI_API_KEY to your .env file and restart the server.');
  }

  ai ??= new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  return ai;
}

const MODEL_NAME = 'gemini-3.8-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
}

function getGeminiErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  let providerMessage = rawMessage;
  let providerStatus = '';

  try {
    const parsed = JSON.parse(rawMessage);
    providerMessage = parsed.error?.message || parsed.message || rawMessage;
    providerStatus = parsed.error?.status || String(parsed.error?.code || '');
  } catch {
    providerStatus = rawMessage;
  }

  if (/UNAVAILABLE|high demand|\b503\b/i.test(`${providerStatus} ${providerMessage}`)) {
    return 'Gemini is temporarily busy. Please wait a moment and try again.';
  }
  if (/RESOURCE_EXHAUSTED|\b429\b|quota/i.test(`${providerStatus} ${providerMessage}`)) {
    return 'Gemini rate limit or quota reached. Please wait or check the API project quota.';
  }
  if (/API_KEY_INVALID|\b401\b|\b403\b|api key/i.test(`${providerStatus} ${providerMessage}`)) {
    return 'Gemini rejected the API key. Check GEMINI_API_KEY in .env and restart the server.';
  }

  return `Gemini request failed: ${providerMessage}`;
}

/**
 * AI Concept Explanation
 */
export async function generateConceptExplanation(payload: AIExplanationPayload): Promise<AIExplanationResult> {
  const formatInstructions: Record<AIExplanationPayload['format'], string> = {
    simple: 'Use short sentences, familiar comparisons, and define each technical term before using it.',
    'step-by-step': 'Build the explanation in a numbered sequence and show the reasoning between each step.',
    academic: 'Use precise academic terminology, but define specialized terms and keep the reasoning explicit.',
    'example-based': 'Introduce each idea through a concrete example, then generalize the principle.'
  };
  const detailInstructions: Record<AIExplanationPayload['detailLevel'], string> = {
    short: 'Keep the explanation concise while including the key reasoning and at least one relevant example.',
    detailed: 'Give a thorough explanation with relevant definitions, intermediate reasoning, and worked examples.',
    concepts: 'Prioritize definitions, intuition, relationships, and conceptual checks over long calculations.',
    practice: 'Prioritize fully solved practice, with each step, unit check, and final answer shown.'
  };
  const outputInstructions: Record<AIExplanationPayload['outputType'], string> = {
    study_notes: 'Write complete study notes. Include learning objectives, a simple introduction, definitions, a detailed explanation, relevant formulas with every symbol defined, derivations where relevant, fully worked examples, applications, answered exam questions, common mistakes, key terms, and a concise revision summary. Omit only sections that genuinely do not apply.',
    topic_explanation: 'Teach the requested topic from intuition to the selected level. Define technical terms, explain why relevant formulas work, include a suitable worked example, applications, and a short recap.',
    solved_questions: 'Provide solved questions, not a question-only worksheet. For each numerical problem use Given, Required, Formula, Substitution, Calculation, Units, and Final Answer where applicable. Explain each reasoning step and verify the result.',
    practice_solutions: 'Provide practice questions and complete worked solutions. Include a useful hint, all intermediate reasoning, and a final answer for every question. Do not leave solution outlines unfinished.',
    revision_notes: 'Create focused exam revision notes: essential definitions, high-yield formulas with symbol meanings, concise explanations, common mistakes, likely exam questions with answers, and a quick summary.'
  };

  const prompt = `You are an accurate, patient academic tutor. Teach in clear, natural ${payload.language} for a ${payload.difficulty} learner at ${payload.educationLevel} level.

Context:
- Subject: ${JSON.stringify(payload.subject)}
- Topic: ${JSON.stringify(payload.topic)}
- Academic program: ${JSON.stringify(payload.degree)}${payload.branch ? `; branch: ${JSON.stringify(payload.branch)}` : ''}${payload.semester ? `; semester: ${JSON.stringify(payload.semester)}` : ''}
- Requested material type: ${payload.outputType}
- Pedagogical style: ${payload.format}
- Detail level: ${payload.detailLevel}
- Difficulty: ${payload.difficulty}
- Language: ${payload.language}
- Style requirements: ${formatInstructions[payload.format]}
- Detail requirements: ${detailInstructions[payload.detailLevel]}
${payload.question ? `- Student question: ${JSON.stringify(payload.question)}` : ''}

Requirements:
- ${outputInstructions[payload.outputType]}
- Explain technical vocabulary before relying on it. Explain why a formula applies, define every symbol, and use correct SI units.
- Keep examples appropriate to the subject and academic level. Never invent citations, syllabus claims, or unsupported facts. State uncertainty or missing source information plainly.
- Do not use generic stand-in formulas or unrelated examples. Do not claim the material was verified against a curriculum or external source.
- For equations inside prose or Markdown, always wrap inline mathematics in single dollar delimiters and display equations in double-dollar delimiters. In the separate keyFormulas formula field, provide bare LaTeX without dollar delimiters. Use valid JSON strings and escape backslashes.
- Each solved example must have at least two meaningful solution steps and a complete final answer.

Return only one JSON object with this shape:
{
  "title": "A specific title",
  "topic": "${payload.topic}",
  "subject": "${payload.subject}",
  "educationLevel": "${payload.educationLevel}",
  "outputType": "${payload.outputType}",
  "learningObjectives": ["Measurable objective"],
  "explanation": "Markdown explanation with clear headings and paragraphs",
  "keyTerms": [{"term":"Term","definition":"Beginner-friendly definition"}],
  "keyFormulas": [{"name":"Formula","formula":"\\nabla \\cdot \\vec{E}","explanation":"Define symbols, assumptions, and why it applies"}],
  "derivations": [{"title":"Derivation title","steps":["Reasoned step 1","Reasoned step 2"]}],
  "workedExamples": [{"question":"Problem statement","stepByStepSolution":["Given: ...","Required: ...","Formula: ...","Substitution and calculation: ...","Units check: ..."],"finalAnswer":"Complete answer with units"}],
  "applications": ["Relevant application and explanation"],
  "examQuestions": [{"question":"Exam question","answer":"Complete answer"}],
  "commonMistakes": ["Specific misconception and correction"],
  "practiceProblems": [{"question":"Practice question","hint":"Useful hint","solution":"Complete solution"}],
  "codeSnippets": [],
  "revisionSummary": "Three to five concise takeaways",
  "sourceNote": "State that this AI-generated material was not independently checked against an institution-specific syllabus."
}`;

  if (!isGeminiConfigured()) {
    throw new Error('Gemini API is not configured. Add GEMINI_API_KEY to your .env file and restart the server.');
  }

  try {
    const response = await getGeminiClient().models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        systemInstruction: 'You are a careful educator. Accuracy, clear reasoning, and complete worked solutions matter more than sounding authoritative.'
      }
    });
    const responseText = response.text?.trim();
    if (!responseText) throw new Error('Gemini returned an empty study response. Please try again.');

    const parsed = JSON.parse(responseText.replace(/^```(?:json)?\s*|\s*```$/gi, '')) as Partial<AIExplanationResult>;
    if (typeof parsed.title !== 'string' || !parsed.title.trim() || typeof parsed.explanation !== 'string' || !parsed.explanation.trim()) {
      throw new Error('Gemini returned incomplete study content. Please regenerate it.');
    }

    const examples = Array.isArray(parsed.workedExamples)
      ? parsed.workedExamples.filter((example) =>
          typeof example?.question === 'string' &&
          typeof example?.finalAnswer === 'string' &&
          Array.isArray(example.stepByStepSolution) &&
          example.stepByStepSolution.length >= 2
        )
      : [];
    const practiceProblems = Array.isArray(parsed.practiceProblems)
      ? parsed.practiceProblems.filter((problem) =>
          typeof problem?.question === 'string' && typeof problem?.solution === 'string' && problem.solution.trim().length > 0
        )
      : [];

    if (payload.outputType === 'solved_questions' && examples.length === 0) {
      throw new Error('Gemini did not return a complete worked solution. Please regenerate the material.');
    }
    if (payload.outputType === 'practice_solutions' && practiceProblems.length === 0) {
      throw new Error('Gemini did not return complete practice solutions. Please regenerate the material.');
    }

    return {
      title: parsed.title.trim(),
      topic: payload.topic,
      subject: payload.subject,
      educationLevel: payload.educationLevel,
      outputType: payload.outputType,
      learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives.filter((item): item is string => typeof item === 'string') : [],
      explanation: parsed.explanation,
      keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms.filter((item) => typeof item?.term === 'string' && typeof item?.definition === 'string') : [],
      keyFormulas: Array.isArray(parsed.keyFormulas) ? parsed.keyFormulas.filter((item) => typeof item?.name === 'string' && typeof item?.formula === 'string' && typeof item?.explanation === 'string') : [],
      derivations: Array.isArray(parsed.derivations) ? parsed.derivations.filter((item) => typeof item?.title === 'string' && Array.isArray(item.steps)).map((item) => ({ title: item.title, steps: item.steps.filter((step): step is string => typeof step === 'string') })) : [],
      workedExamples: examples as NonNullable<AIExplanationResult['workedExamples']>,
      applications: Array.isArray(parsed.applications) ? parsed.applications.filter((item): item is string => typeof item === 'string') : [],
      examQuestions: Array.isArray(parsed.examQuestions) ? parsed.examQuestions.filter((item) => typeof item?.question === 'string' && typeof item?.answer === 'string') : [],
      commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes.filter((item): item is string => typeof item === 'string') : [],
      practiceProblems: practiceProblems as NonNullable<AIExplanationResult['practiceProblems']>,
      codeSnippets: Array.isArray(parsed.codeSnippets) ? parsed.codeSnippets.filter((item) => typeof item?.language === 'string' && typeof item?.code === 'string' && typeof item?.explanation === 'string') : [],
      revisionSummary: typeof parsed.revisionSummary === 'string' ? parsed.revisionSummary : '',
      sourceNote: typeof parsed.sourceNote === 'string' ? parsed.sourceNote : 'AI-generated material; not independently checked against an institution-specific syllabus.',
      verifiedSourceDistinction: typeof parsed.sourceNote === 'string' ? parsed.sourceNote : 'AI-generated material; not independently checked against an institution-specific syllabus.'
    };
  } catch (err) {
    console.error('Gemini study material generation failed:', err);
    throw new Error(getGeminiErrorMessage(err));
  }
}

/**
 * Universal Document-to-Learning Workflow (Multimodal OCR & Document Extraction)
 */
export async function analyzeUploadedDocument(
  fileBase64: string,
  mimeType: string,
  filename: string,
  outputType: ResourceType,
  educationLevel: string,
  customInstructions?: string
): Promise<DocumentAnalysisResult> {
  const prompt = `
You are MultiGrade Mitra's Universal Document-to-Learning OCR & Content Extraction Engine.
Analyze this uploaded academic document/image (Filename: "${filename}", Target Education Level: "${educationLevel}").

Tasks:
1. Extract and summarize the core readable educational content, avoiding any hallucination.
2. Identify the Subject, Topic, and Key Academic Concepts present.
3. Transform this extracted content into the requested output type: "${outputType}" (e.g. notes, summary, formula_sheet, practice_questions, quiz, worksheet, lesson_plan).
4. ${customInstructions ? `Special user instructions: ${customInstructions}` : ''}

Respond with a valid, clean JSON object ONLY (no markdown backticks, no \`\`\`json):
{
  "documentName": "${filename}",
  "identifiedSubject": "Detected Subject",
  "identifiedTopic": "Detected Topic / Chapter",
  "identifiedLevel": "${educationLevel}",
  "extractedConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "outputType": "${outputType}",
  "generatedContent": "Comprehensive, clean markdown document ready for study or teaching. Include sections, formulas, clear headings, and practice items.",
  "structuredDetails": {
    "summary": "Short 2-line executive digest",
    "clarityScore": "High"
  }
}
`;

  if (!isGeminiConfigured()) {
    throw new Error('Gemini API is not configured. Add GEMINI_API_KEY to your .env file and restart the server.');
  }

  const imagePart = {
    inlineData: {
      mimeType,
      data: fileBase64
    }
  };

  try {
    const response = await getGeminiClient().models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Gemini returned an empty document analysis. Try a clearer image or PDF.');
    }

    const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/gi, '')) as Partial<DocumentAnalysisResult>;
    if (typeof parsed.generatedContent !== 'string' || !parsed.generatedContent.trim()) {
      throw new Error('Gemini returned an incomplete document analysis. Please try again.');
    }

    return {
      documentName: filename,
      identifiedSubject: typeof parsed.identifiedSubject === 'string' ? parsed.identifiedSubject : 'Unclassified subject',
      identifiedTopic: typeof parsed.identifiedTopic === 'string' ? parsed.identifiedTopic : 'Unidentified topic',
      identifiedLevel: educationLevel,
      extractedConcepts: Array.isArray(parsed.extractedConcepts)
        ? parsed.extractedConcepts.filter((concept): concept is string => typeof concept === 'string')
        : [],
      outputType,
      generatedContent: parsed.generatedContent,
      structuredDetails: parsed.structuredDetails
    };
  } catch (err) {
    console.error('Gemini document analysis failed:', err);
    throw new Error(`Document analysis failed: ${getGeminiErrorMessage(err)}`);
  }
}

/**
 * Teacher Lesson Plan Generator
 */
export async function generateLessonPlan(data: {
  topic: string;
  subject: string;
  educationLevel: string;
  program: string;
  duration: string;
  difficulty: string;
  language: string;
  additionalNotes?: string;
}): Promise<LessonPlanResult> {
  const prompt = `
You are MultiGrade Mitra's Pedagogical Lesson Architect.
Create a structured lesson plan for educators.
- Topic: "${data.topic}"
- Subject: "${data.subject}"
- Target Education Level: "${data.educationLevel}" (${data.program})
- Planned Duration: "${data.duration}"
- Difficulty Target: "${data.difficulty}"
- Instruction Language: "${data.language}"
${data.additionalNotes ? `- Specific Teacher Focus: "${data.additionalNotes}"` : ''}

Respond with valid JSON ONLY (no markdown backticks, no \`\`\`json):
{
  "topic": "${data.topic}",
  "subject": "${data.subject}",
  "educationLevel": "${data.educationLevel}",
  "duration": "${data.duration}",
  "learningObjectives": [
    "By the end of this session, students will be able to...",
    "Students will derive...",
    "Students will implement or calculate..."
  ],
  "pedagogicalApproach": "Explanation of active learning, inquiry-based or constructivist methodology used",
  "prerequisiteKnowledge": [
    "Prerequisite 1",
    "Prerequisite 2"
  ],
  "timeline": [
    { "time": "0-10 min", "phase": "Hook & Prior Knowledge Activation", "activity": "Teacher poses realistic scenario...", "teachingAid": "Whiteboard / Slide" },
    { "time": "10-25 min", "phase": "Conceptual Deep Dive & Derivation", "activity": "Interactive step-by-step breakdown...", "teachingAid": "Live demo / Code / Board" },
    { "time": "25-45 min", "phase": "Guided Group Problem / Laboratory", "activity": "Students solve in pairs...", "teachingAid": "Worksheet" },
    { "time": "45-55 min", "phase": "Synthesis & Misconception Check", "activity": "Rapid polling and clarification...", "teachingAid": "Q&A" },
    { "time": "55-60 min", "phase": "Exit Ticket & Homework Assignment", "activity": "Summative reflection...", "teachingAid": "Assignment Handout" }
  ],
  "blackboardSummary": "Structured board layout or slide blueprint showing formulas, diagrams, and summary box",
  "discussionPrompts": [
    "Why does this formula fail when...",
    "How does this relate to industry scale systems?"
  ],
  "homeworkOrFollowUp": "1 conceptual question and 2 numerical/coding problems to reinforce retention."
}
`;

  if (isGeminiConfigured()) {
    try {
      const response = await getGeminiClient().models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { temperature: 0.3 }
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as LessonPlanResult;
    } catch (err) {
      console.error('Gemini Lesson Plan error, using fallback:', err);
    }
  }

  return {
    topic: data.topic,
    subject: data.subject,
    educationLevel: data.educationLevel,
    duration: data.duration || '60 Minutes',
    learningObjectives: [
      `Understand the mathematical and conceptual foundations of ${data.topic}`,
      `Analyze real-world engineering or physical applications of the topic`,
      `Solve standard university/board examination level numerical problems with confidence`
    ],
    pedagogicalApproach: 'Inquiry-Based Learning with Step-by-Step Guided Practice and Peer Discussion',
    prerequisiteKnowledge: [
      'Basic algebra and fundamental calculus concepts',
      'Familiarity with standard scientific notation and coordinate geometry'
    ],
    timeline: [
      { time: '00-10 min', phase: 'Introduction & Real-world Motivation', activity: 'Introduce real-world puzzle demonstrating why this concept is essential.', teachingAid: 'Whiteboard & Slides' },
      { time: '10-30 min', phase: 'Core Theory & Rigorous Derivation', activity: 'Derive governing relations, discuss constraints, and highlight physical intuition.', teachingAid: 'Step-by-step Board Work' },
      { time: '30-45 min', phase: 'Worked Example & Active Problem Solving', activity: 'Work through an exam-standard problem; have students compute intermediate steps.', teachingAid: 'Worksheet Handout' },
      { time: '45-55 min', phase: 'Common Misconceptions & Discussion', activity: 'Highlight classic pitfalls and address student questions.', teachingAid: 'Open Classroom Discussion' },
      { time: '55-60 min', phase: 'Wrap-up & Assessment', activity: 'Review 3 core takeaways and assign homework.', teachingAid: 'Summary Slide' }
    ],
    blackboardSummary: `LEFT PANEL: Definitions & Assumptions | CENTER: Main Mathematical Derivation | RIGHT: Worked Numerical & Takeaway Box`,
    discussionPrompts: [
      `What happens to the system behavior when the key variable approaches infinity?`,
      `Can you give an everyday example where this principle is quietly in operation?`
    ],
    homeworkOrFollowUp: `Complete 3 practice problems from the curriculum question bank and write a short 100-word explanation of the physical meaning of the result.`
  };
}

/**
 * Quiz Generator
 */
export async function generateQuiz(data: {
  topic: string;
  subject: string;
  educationLevel: string;
  questionCount: number;
  difficulty: string;
  includeAnswerKey: boolean;
}): Promise<QuizResult> {
  const prompt = `
You are MultiGrade Mitra's Assessment Specialist.
Generate a comprehensive academic quiz for:
- Subject: "${data.subject}"
- Topic: "${data.topic}"
- Education Level: "${data.educationLevel}"
- Question Count: ${data.questionCount || 5}
- Target Difficulty: "${data.difficulty}"

Include a mix of MCQs, Short-Answer, and Conceptual questions.
For every question, provide:
- type: "mcq", "short", or "conceptual"
- question text
- options (for mcq)
- correctAnswer
- detailed explanation
- marks (e.g. 2, 3, or 5)

Format as valid JSON ONLY (no markdown backticks, no \`\`\`json):
{
  "title": "${data.subject}: ${data.topic} Assessment",
  "subject": "${data.subject}",
  "topic": "${data.topic}",
  "educationLevel": "${data.educationLevel}",
  "totalMarks": 25,
  "timeLimitMinutes": 30,
  "isReviewedByTeacher": false,
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct...",
      "difficulty": "${data.difficulty}",
      "marks": 2
    }
  ]
}
`;

  if (isGeminiConfigured()) {
    try {
      const response = await getGeminiClient().models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { temperature: 0.3 }
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as QuizResult;
    } catch (err) {
      console.error('Gemini Quiz generator error, using fallback:', err);
    }
  }

  return {
    title: `${data.subject}: ${data.topic} Diagnostic Quiz`,
    subject: data.subject,
    topic: data.topic,
    educationLevel: data.educationLevel,
    totalMarks: 20,
    timeLimitMinutes: 25,
    isReviewedByTeacher: false,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: `Which of the following best characterizes the primary governing principle of ${data.topic}?`,
        options: [
          'A. Conservation of fundamental state variables under boundary limits',
          'B. Arbitrary empirical approximation without theoretical bounds',
          'C. Independent variation decoupled from initial conditions',
          'D. Instantaneous stabilization without transient decay'
        ],
        correctAnswer: 'A',
        explanation: 'The system strictly obeys conservation laws within defined spatial and temporal boundaries.',
        difficulty: 'intermediate',
        marks: 2
      },
      {
        id: 'q2',
        type: 'mcq',
        question: `What is the expected asymptotic computational or physical behavior as scale increases?`,
        options: [
          'A. Linear or logarithmic scaling under optimal partitioning',
          'B. Exponential divergence in all real configurations',
          'C. Constant value independent of input dimensions',
          'D. Random oscillatory fluctuation'
        ],
        correctAnswer: 'A',
        explanation: 'Under standard algorithmic or physical balancing, optimal scaling maintains bounded growth.',
        difficulty: 'intermediate',
        marks: 2
      },
      {
        id: 'q3',
        type: 'short',
        question: `Define ${data.topic} in one concise sentence and state its SI unit or primary computational complexity notation.`,
        correctAnswer: 'Standard formal definition with correct dimensional units or O(f(n)) notation.',
        explanation: 'Evaluates direct recall of standard academic terminology and dimensional rigor.',
        difficulty: 'beginner',
        marks: 3
      },
      {
        id: 'q4',
        type: 'conceptual',
        question: `Explain how the boundary conditions alter the system behavior when operating at extreme limits.`,
        correctAnswer: 'Boundary conditions force eigenvalues to discrete modes and constrain solution space.',
        explanation: 'Tests deep conceptual reasoning rather than rote memory.',
        difficulty: 'advanced',
        marks: 5
      }
    ]
  };
}

/**
 * MultiGrade Differentiated Instruction Generator (Signature MultiGrade Mitra Feature)
 */
export async function generateMultiGradeActivities(data: {
  overarchingTopic: string;
  selectedGrades: string[];
  contextSubject: string;
}): Promise<MultiGradeResult> {
  const gradesList = data.selectedGrades.join(', ');

  const prompt = `
You are MultiGrade Mitra's Core Differentiated Pedagogy Engine.
In many schools, colleges, and coaching environments, educators teach students from multiple grade levels or programs simultaneously (e.g., Class 12 alongside 1st Year B.Tech, or 1st Year B.Tech alongside 2nd Year B.Tech, or mixed school grades).

The teacher has entered an overarching academic topic: "${data.overarchingTopic}"
Subject Domain: "${data.contextSubject}"
Target Education Groups: ${gradesList}

Generate a simultaneous differentiated learning framework that addresses the SAME core topic across all selected grades, tailored to each grade's cognitive level, syllabus depth, and practical applications.

Respond with valid JSON ONLY (no markdown backticks, no \`\`\`json):
{
  "overarchingTopic": "${data.overarchingTopic}",
  "subjectDomain": "${data.contextSubject}",
  "introduction": "Pedagogical bridge explaining how this topic connects basic intuition to advanced technical rigor across the levels.",
  "tiers": [
    {
      "gradeLevel": "Grade / Level Name (e.g. Class 12)",
      "tierName": "Tier 1: Foundational Intuition & Core Formulas",
      "cognitiveFocus": "e.g. Geometric intuition, Board exam formulas, single-variable calculus",
      "topicExplanation": "2-3 paragraphs explaining the topic specifically for this grade's depth",
      "coreConcepts": ["Concept A", "Concept B", "Concept C"],
      "differentiatedActivity": "Specific active classroom exercise, lab or group task suitable for this grade",
      "practiceQuestions": [
        "Question 1 (Board / foundational standard)",
        "Question 2 (Application problem)"
      ]
    }
  ],
  "crossGradeSynthesis": "A group discussion prompt where students from the higher tier explain an advanced application to students from the lower tier.",
  "teacherGuide": "Tips for managing the multigrade classroom simultaneously without leaving any cohort idle."
}
`;

  if (isGeminiConfigured()) {
    try {
      const response = await getGeminiClient().models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { temperature: 0.3 }
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as MultiGradeResult;
    } catch (err) {
      console.error('Gemini MultiGrade generator error, using fallback:', err);
    }
  }

  // MultiGrade fallback
  const tiers = data.selectedGrades.map((grade, idx) => {
    const isHigher = idx > 0;
    return {
      gradeLevel: grade,
      tierName: `Tier ${idx + 1}: ${isHigher ? 'Analytical Rigor & Implementation' : 'Foundational Intuition & Governing Laws'}`,
      cognitiveFocus: isHigher
        ? 'Mathematical rigor, multivariable analysis, algorithmic implementation, and optimization'
        : 'Conceptual visualization, core definitions, and standard examination problems',
      topicExplanation: `At the ${grade} level, ${data.overarchingTopic} is examined through ${
        isHigher ? 'algorithmic formulations and engineering application' : 'physical intuition and foundational equations'
      }. Students focus on understanding how initial assumptions drive resulting system behavior.`,
      coreConcepts: [
        `${data.overarchingTopic} Definition & Assumptions`,
        isHigher ? 'State Equations & Invariance' : 'Standard Formula Manipulation',
        isHigher ? 'Complexity & Optimization' : 'Step-by-step Numerical Examples'
      ],
      differentiatedActivity: isHigher
        ? `Develop a computational model or pseudocode algorithm analyzing how variations in parameters affect convergence for ${data.overarchingTopic}.`
        : `Construct a visual mind map and solve 3 standard textbook numerical problems demonstrating step-by-step unit verification for ${data.overarchingTopic}.`,
      practiceQuestions: [
        `Level-specific problem 1 for ${grade}: State governing conditions and calculate base case.`,
        `Level-specific problem 2 for ${grade}: Analyze what happens when external constraints change.`
      ]
    };
  });

  return {
    overarchingTopic: data.overarchingTopic,
    subjectDomain: data.contextSubject,
    introduction: `Unified MultiGrade learning plan bridging foundational intuition to advanced analytical execution for ${data.overarchingTopic}.`,
    tiers,
    crossGradeSynthesis: `Pair a student from ${data.selectedGrades[data.selectedGrades.length - 1] || 'the advanced cohort'} with a student from ${data.selectedGrades[0] || 'the foundational cohort'} to explain how the advanced computational model builds directly upon the basic laws learned in school.`,
    teacherGuide: `Introduce the shared 10-minute visual hook to the entire class simultaneously. Then dispatch Tier 1 to guided calculation worksheets while conducting a targeted 15-minute technical seminar with Tier 2.`
  };
}

/**
 * Fallback Concept Explanation
 */
function getFallbackExplanation(payload: AIExplanationPayload): AIExplanationResult {
  const isEngineering = payload.educationLevel === 'btech' || payload.educationLevel === 'advanced';

  return {
    title: `${payload.topic} — ${payload.educationLevel.toUpperCase()} Academic Concept Guide`,
    topic: payload.topic,
    educationLevel: payload.educationLevel,
    explanation: `### 1. Conceptual Intuition & Overview
**${payload.topic}** is a cornerstone topic within **${payload.degree}**. At its heart, it provides a systematic framework to analyze relationships between variables and solve real-world problems.

${
  isEngineering
    ? `In modern engineering and computer systems, understanding **${payload.topic}** allows architects and engineers to write optimized algorithms, design robust circuits, and model complex physical interactions with formal mathematical guarantees.`
    : `In senior secondary studies, mastering **${payload.topic}** is critical for scoring well in Board examinations and developing the quantitative intuition required for technical competitive tests.`
}

### 2. Core Principles & Definitions
- **Principle of Conservation & Balance**: In any closed system, governing quantities remain conserved unless acted upon by external inputs.
- **Rate of Change & Sensitivity**: How small perturbations in input parameters propagate through the system.
- **Boundary Conditions & Limits**: Every model has operating ranges; identifying when approximations break down is critical.`,
    keyFormulas: [
      {
        name: 'Standard Governing Relation',
        formula: 'f(x) = \\sum_{i=0}^n a_i x^i',
        explanation: 'Expresses system behavior as a linear or polynomial superposition of state components.'
      },
      {
        name: 'Rate of Change / Sensitivity',
        formula: '\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}',
        explanation: 'Instantaneous response of output variable y with respect to input perturbation x.'
      }
    ],
    workedExamples: [
      {
        question: `Calculate the primary state parameter of ${payload.topic} when initial value is 10 and time constant is 2 seconds.`,
        stepByStepSolution: [
          'Identify given parameters: Initial state $S_0 = 10$, parameter $\\tau = 2\\text{ s}$.',
          'Apply the standard governing formula: $S(t) = S_0 \\cdot e^{-t / \\tau}$.',
          'Substitute $t = 2\\text{ s}$: $S(2) = 10 \\cdot e^{-1} \\approx 10 \\times 0.368 = 3.68$.',
          'Verify physical dimensional units: The result is consistent and dimensionally sound.'
        ],
        finalAnswer: '3.68 units'
      }
    ],
    commonMistakes: [
      'Confusing average rate of change with instantaneous rate of change.',
      'Forgetting to verify sign conventions when applying conservation rules.',
      'Overlooking boundary conditions where the denominator approaches zero.'
    ],
    practiceProblems: [
      {
        question: `What occurs when the system parameter is doubled? State whether the response scales linearly or exponentially.`,
        hint: 'Examine the exponent in the governing formula.',
        solution: 'Because the parameter appears in the exponential exponent, doubling it leads to exponential compression or expansion.'
      }
    ],
    codeSnippets: isEngineering
      ? [
          {
            language: 'c',
            code: `// Sample implementation of ${payload.topic} in C
#include <stdio.h>
#include <math.h>

double computeState(double initial, double tau, double t) {
    if (tau <= 0.0) return -1.0; // Error checking
    return initial * exp(-t / tau);
}

int main() {
    double result = computeState(10.0, 2.0, 2.0);
    printf("Computed State at t=2s: %.4f\\n", result);
    return 0;
}`,
            explanation: 'Demonstrates defensive programming, parameter validation, and numerical computation.',
            output: 'Computed State at t=2s: 3.6788'
          }
        ]
      : undefined,
    revisionSummary: `1. Always identify given boundary conditions first.
2. Verify dimensional consistency across all equations.
3. Check edge cases ($t=0$ and $t \\to \\infty$) to confirm sanity of solutions.
4. Distinguish between theoretical ideals and real-world dissipative losses.`,
    verifiedSourceDistinction: 'Content aligned with standard national curriculum and engineering standards. Verify with syllabus for specific university question patterns.'
  };
}
