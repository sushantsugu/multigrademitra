import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AIExplanationPayload, AIExplanationResult, SavedResource, StudyOutputType } from '../../types';
import { MarkdownContent } from '../common/MarkdownContent';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
  Bookmark,
  Download,
  AlertCircle,
  Code2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileCheck,
  Layers
} from 'lucide-react';

interface AIStudyAssistantProps {
  initialTopic?: string;
  onSavedResource: (resource: SavedResource) => void;
  onDownloadPdf: (data: any) => void;
}

export const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({
  initialTopic = '',
  onSavedResource,
  onDownloadPdf
}) => {
  const { currentUser } = useAuth();
  const profile = currentUser?.studentProfile;

  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(profile?.branch || 'Physics');
  const [question, setQuestion] = useState('');
  const [outputType, setOutputType] = useState<StudyOutputType>('study_notes');
  const [format, setFormat] = useState<'simple' | 'step-by-step' | 'academic' | 'example-based'>('step-by-step');
  const [detailLevel, setDetailLevel] = useState<'short' | 'detailed' | 'concepts' | 'practice'>('detailed');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    profile?.difficulty || 'intermediate'
  );
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'English');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIExplanationResult | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedExample, setExpandedExample] = useState<number | null>(0);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      // Auto-trigger if initial topic provided
      handleGenerate(initialTopic);
    }
  }, [initialTopic]);

  const handleGenerate = async (targetTopic = topic) => {
    if (!targetTopic.trim()) return;

    setLoading(true);
    setIsSaved(false);
    setError(null);
    setResult(null);
    try {
      const payload: AIExplanationPayload = {
        subject: subject.trim() || profile?.branch || 'General Science',
        topic: targetTopic,
        outputType,
        question: question.trim() ? question : undefined,
        educationLevel: profile?.educationLevel || 'btech',
        degree: profile?.degree || 'Undergraduate',
        branch: profile?.branch,
        semester: profile?.semester,
        format,
        detailLevel,
        difficulty,
        language
      };

      const res = await fetch('/api/learning/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(responseData.error || `Study material generation failed (${res.status}).`);
      setResult(responseData as AIExplanationResult);
      setError(null);
    } catch (err) {
      console.error('Explanation request failed:', err);
      setError(err instanceof Error ? err.message : 'Study material generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleSaveToMaterials = async () => {
    if (!result || !currentUser) return;

    try {
      const markdownContent = `
# ${result.title}

${result.learningObjectives?.length ? `## Learning Objectives\n${result.learningObjectives.map((item) => `- ${item}`).join('\n')}\n` : ''}

${result.explanation}

${result.keyTerms?.length ? `## Key Terms\n${result.keyTerms.map((item) => `- **${item.term}:** ${item.definition}`).join('\n')}\n` : ''}

${result.derivations?.length ? `## Step-by-Step Derivations\n${result.derivations.map((item) => `### ${item.title}\n${item.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`).join('\n\n')}\n` : ''}

${result.applications?.length ? `## Applications\n${result.applications.map((item) => `- ${item}`).join('\n')}\n` : ''}

${result.examQuestions?.length ? `## Exam Questions with Answers\n${result.examQuestions.map((item, index) => `${index + 1}. **${item.question}**\n   ${item.answer}`).join('\n\n')}\n` : ''}

${result.practiceProblems?.length ? `## Practice Questions with Solutions\n${result.practiceProblems.map((item, index) => `${index + 1}. **${item.question}**\nHint: ${item.hint || 'Review the relevant formula.'}\nSolution: ${item.solution}`).join('\n\n')}\n` : ''}

${
  result.keyFormulas && result.keyFormulas.length > 0
    ? `## Key Formulas & Mathematical Formulations
${result.keyFormulas.map((f) => `- **${f.name}**: \`${f.formula}\`\n  _${f.explanation}_`).join('\n')}`
    : ''
}

${
  result.workedExamples && result.workedExamples.length > 0
    ? `## Worked Numerical & Conceptual Examples
${result.workedExamples
  .map(
    (ex, idx) => `### Example ${idx + 1}: ${ex.question}
**Solution Steps**:
${ex.stepByStepSolution.map((s, si) => `${si + 1}. ${s}`).join('\n')}
**Final Answer**: ${ex.finalAnswer}`
  )
  .join('\n\n')}`
    : ''
}

${
  result.commonMistakes && result.commonMistakes.length > 0
    ? `## Common Mistakes & Exam Traps
${result.commonMistakes.map((m) => `- ⚠️ ${m}`).join('\n')}`
    : ''
}

${
  result.codeSnippets && result.codeSnippets.length > 0
    ? `## Code Implementations
${result.codeSnippets.map((c) => `\`\`\`${c.language}\n${c.code}\n\`\`\`\n_${c.explanation}_`).join('\n\n')}`
    : ''
}

## Quick Revision Summary
${result.revisionSummary}

---
*${result.verifiedSourceDistinction}*
`;

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: result.title,
          subject: subject.trim() || result.subject || profile?.branch || 'Academic Concept',
          topic: result.topic,
          educationLevel: profile?.educationLevel || 'btech',
          program: profile?.degree,
          branch: profile?.branch,
          semester: profile?.semester,
          resourceType: result.outputType === 'revision_notes'
            ? 'revision_summary'
            : result.outputType === 'solved_questions' || result.outputType === 'practice_solutions'
              ? 'practice_questions'
              : 'notes',
          content: markdownContent,
          metadata: {
            difficulty,
            language,
            format,
            tags: [result.topic, profile?.educationLevel || 'btech']
          }
        })
      });

      if (res.ok) {
        const savedData = await res.json();
        setIsSaved(true);
        if (onSavedResource) onSavedResource(savedData.resource);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDownloadPDFClick = () => {
    if (!result) return;
    const content = `
# ${result.title}

## Learning Objectives
${result.learningObjectives?.map((item) => `- ${item}`).join('\n') || ''}

${result.explanation}

### Key Formulas
${result.keyFormulas?.map((f) => `### ${f.name}\n$$\n${f.formula}\n$$\n${f.explanation}`).join('\n\n') || 'No key formulas were identified.'}

### Key Terms
${result.keyTerms?.map((item) => `- **${item.term}:** ${item.definition}`).join('\n') || ''}

### Step-by-Step Derivations
${result.derivations?.map((derivation) => `#### ${derivation.title}\n${derivation.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`).join('\n\n') || ''}

### Worked Examples
${result.workedExamples?.map((ex, idx) => `#### Example ${idx + 1}: ${ex.question}\n${ex.stepByStepSolution.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n**Final Answer:** ${ex.finalAnswer}`).join('\n\n') || ''}

### Practice Questions with Solutions
${result.practiceProblems?.map((item, index) => `${index + 1}. **${item.question}**\nHint: ${item.hint || 'Review the relevant formula.'}\nSolution: ${item.solution}`).join('\n\n') || ''}

### Applications
${result.applications?.map((item) => `- ${item}`).join('\n') || ''}

### Exam Questions with Answers
${result.examQuestions?.map((item, index) => `${index + 1}. **${item.question}**\n   ${item.answer}`).join('\n\n') || ''}

### Common Exam Mistakes
${result.commonMistakes?.map((m) => `• ${m}`).join('\n') || ''}

### Quick Revision Summary
${result.revisionSummary}

### Source Note
${result.sourceNote || result.verifiedSourceDistinction}
`;

    onDownloadPdf({
      title: result.title,
      subject: subject.trim() || result.subject || profile?.branch || 'Academic Study Guide',
      topic: result.topic,
      educationLevel: profile?.educationLevel || 'Undergrad',
      program: profile?.degree,
      resourceType: result.outputType === 'revision_notes'
        ? 'revision_summary'
        : result.outputType === 'solved_questions' || result.outputType === 'practice_solutions'
          ? 'practice_questions'
          : 'notes',
      difficulty,
      content
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Configuration Header Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">AI Study Assistant</h2>
            <p className="text-xs text-[#687386]">
              Personalized concept explanations tailored to {profile?.degree || 'your syllabus'}.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Engineering Physics"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Topic or Chapter Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AVL Tree Rotations, Kirchhoff's Laws, Pointers in C, Limits & Derivatives..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Question or Problem (Optional)
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Why do we need a double rotation when inserting into the left-right subtree?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Config Controls Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Material Type</label>
              <select
                value={outputType}
                onChange={(e) => setOutputType(e.target.value as StudyOutputType)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="study_notes">Complete Study Notes</option>
                <option value="topic_explanation">Topic Explanation</option>
                <option value="solved_questions">Solved Questions</option>
                <option value="practice_solutions">Practice with Solutions</option>
                <option value="revision_notes">Exam Revision Notes</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pedagogical Format</label>
              <select
                value={format}
                onChange={(e: any) => setFormat(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="step-by-step">Step-by-Step</option>
                <option value="simple">Simple Language</option>
                <option value="academic">Detailed Academic</option>
                <option value="example-based">Example-Based</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Detail Level</label>
              <select
                value={detailLevel}
                onChange={(e: any) => setDetailLevel(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="detailed">Detailed Notes</option>
                <option value="short">Short Notes</option>
                <option value="concepts">Core Concepts</option>
                <option value="practice">Worked Practice</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Explanation Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="English">English</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Concept for {profile?.educationLevel?.toUpperCase() || 'Level'}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Explanation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Display Area */}
      {result && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E8F0] shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* Header & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                  {result.educationLevel}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{format.toUpperCase()} MODE</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#14263D] font-['Manrope']">{result.title}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToMaterials}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isSaved ? 'Saved to Materials' : 'Save Notes'}</span>
              </button>

              <button
                onClick={handleDownloadPDFClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14263D] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Core Explanation Paragraphs */}
          <MarkdownContent content={result.explanation} className="space-y-4 text-sm" />

          {result.learningObjectives && result.learningObjectives.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Learning Objectives</h3>
              <MarkdownContent content={result.learningObjectives.map((item) => `- ${item}`).join('\n')} className="text-sm" />
            </section>
          )}

          {result.keyTerms && result.keyTerms.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Key Terms</h3>
              <MarkdownContent content={result.keyTerms.map((item) => `- **${item.term}:** ${item.definition}`).join('\n')} className="text-sm" />
            </section>
          )}

          {result.derivations && result.derivations.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Step-by-Step Derivations</h3>
              {result.derivations.map((derivation, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-sm font-semibold text-indigo-800">{derivation.title}</h4>
                  <MarkdownContent content={derivation.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')} className="text-sm" />
                </div>
              ))}
            </section>
          )}

          {/* Key Formulas Section */}
          {result.keyFormulas && result.keyFormulas.length > 0 && (
            <div className="p-4 rounded-xl bg-[#F6F8FC] border border-[#E4E8F0] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3730A3] uppercase tracking-wider font-['Manrope']">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Key Mathematical Formulations & Laws</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.keyFormulas.map((form, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-800">{form.name}</p>
                    <MarkdownContent content={`$$\n${form.formula}\n$$`} className="overflow-x-auto rounded bg-slate-50 p-2 text-indigo-900" />
                    <p className="text-[11px] text-slate-500">{form.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worked Examples (Interactive Accordion) */}
          {result.workedExamples && result.workedExamples.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#14263D] uppercase tracking-wider font-['Manrope']">
                Step-by-Step Worked Problems
              </h3>
              {result.workedExamples.map((ex, idx) => {
                const isOpen = expandedExample === idx;
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <button
                      onClick={() => setExpandedExample(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left bg-slate-50/80 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">{ex.question}</p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="p-4 border-t border-slate-200 space-y-3 bg-white text-xs sm:text-sm">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Solution Steps:</p>
                          {ex.stepByStepSolution.map((st, si) => (
                            <div key={si} className="flex items-start gap-2 text-slate-700">
                              <span className="font-semibold text-slate-400 text-xs">{si + 1}.</span>
                              <MarkdownContent content={st} className="text-xs sm:text-sm" />
                            </div>
                          ))}
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                          <span className="font-bold">Final Answer:</span> <MarkdownContent content={ex.finalAnswer} className="inline" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {result.applications && result.applications.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Applications</h3>
              <MarkdownContent content={result.applications.map((item) => `- ${item}`).join('\n')} className="text-sm" />
            </section>
          )}

          {result.examQuestions && result.examQuestions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Exam Questions with Answers</h3>
              {result.examQuestions.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-3">
                  <MarkdownContent content={`**${index + 1}. ${item.question}**\n\n${item.answer}`} className="space-y-2 text-sm" />
                </div>
              ))}
            </section>
          )}

          {result.practiceProblems && result.practiceProblems.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#14263D]">Practice Questions with Solutions</h3>
              {result.practiceProblems.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-3">
                  <MarkdownContent content={`**${index + 1}. ${item.question}**${item.hint ? `\n\nHint: ${item.hint}` : ''}\n\n${item.solution}`} className="space-y-2 text-sm" />
                </div>
              ))}
            </section>
          )}

          {/* Code Snippets for Engineering / Computer Science */}
          {result.codeSnippets && result.codeSnippets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14263D] uppercase tracking-wider font-['Manrope']">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Code Implementation & Line-by-Line Breakdown</span>
              </div>
              {result.codeSnippets.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-[#0F172A] text-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <span>{c.language.toUpperCase()}</span>
                    <button
                      onClick={() => handleCopyCode(c.code, idx)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedCodeIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                    {c.code}
                  </pre>
                  <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400">
                    <p className="font-semibold text-slate-300">Explanation:</p>
                    <p>{c.explanation}</p>
                    {c.output && (
                      <p className="mt-1 font-mono text-[10px] text-amber-300">Output: {c.output}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Common Mistakes & Exam Pitfalls */}
          {result.commonMistakes && result.commonMistakes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider font-['Manrope']">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Common Exam Pitfalls & Conceptual Traps</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
                {result.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Revision Summary */}
          {result.revisionSummary && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 font-['Manrope']">
                Quick Revision Summary
              </h4>
              <MarkdownContent content={result.revisionSummary} className="text-xs text-indigo-950" />
            </div>
          )}

          {/* Source Distinction & Verification Tag */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              {result.verifiedSourceDistinction}
            </span>
            <span>MultiGrade Mitra AI Engine</span>
          </div>
        </div>
      )}
    </div>
  );
};
