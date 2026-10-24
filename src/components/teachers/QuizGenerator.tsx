import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuizResult, QuizQuestionItem, SavedResource } from '../../types';
import {
  CheckCircle2,
  Sparkles,
  Download,
  Bookmark,
  RefreshCw,
  Edit2,
  Trash2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface QuizGeneratorProps {
  onSavedResource: (resource: SavedResource) => void;
  onDownloadPdf: (data: any) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onSavedResource, onDownloadPdf }) => {
  const { currentUser } = useAuth();
  const profile = currentUser?.teacherProfile;

  const [topic, setTopic] = useState('Data Structures: Binary Trees & Heaps');
  const [subject, setSubject] = useState(profile?.subjectsTaught?.[0] || 'Computer Science');
  const [educationLevel, setEducationLevel] = useState('btech');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setIsSaved(false);
    setIsReviewed(false);
    try {
      const res = await fetch('/api/teaching/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          educationLevel,
          questionCount,
          difficulty,
          includeAnswerKey
        })
      });

      if (res.ok) {
        const data: QuizResult = await res.json();
        setQuiz(data);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = (index: number, updatedFields: Partial<QuizQuestionItem>) => {
    if (!quiz) return;
    const questions = [...quiz.questions];
    questions[index] = { ...questions[index], ...updatedFields };
    setQuiz({ ...quiz, questions });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!quiz) return;
    const questions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions });
  };

  const handleSaveToVault = async () => {
    if (!quiz || !currentUser) return;

    const content = `
# ${quiz.title}

**Subject**: ${quiz.subject} | **Topic**: ${quiz.topic} | **Level**: ${quiz.educationLevel.toUpperCase()}
**Total Marks**: ${quiz.totalMarks} | **Status**: ${isReviewed ? 'Teacher Verified' : 'AI Draft - Pending Review'}

## Question Paper
${quiz.questions
  .map(
    (q, idx) => `### Question ${idx + 1} (${q.marks} Marks) [${q.type.toUpperCase()}]
${q.question}
${q.options && q.options.length > 0 ? q.options.map((o) => `  - ${o}`).join('\n') : ''}
`
  )
  .join('\n')}

---

## Answer Key & Grading Rubric (${isReviewed ? 'Verified by Teacher' : 'AI-Generated Preview'})
${quiz.questions
  .map(
    (q, idx) => `### Q${idx + 1} Answer & Evaluation:
- **Correct Response**: ${q.correctAnswer}
- **Pedagogical Explanation**: ${q.explanation}
`
  )
  .join('\n')}
`;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: quiz.title,
          subject: quiz.subject,
          topic: quiz.topic,
          educationLevel: quiz.educationLevel,
          resourceType: 'quiz',
          content,
          structuredData: quiz,
          metadata: {
            isReviewedByTeacher: isReviewed,
            questionCount: quiz.questions.length
          }
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setIsSaved(true);
        if (onSavedResource) onSavedResource(saved.resource);
      }
    } catch (err) {
      console.error('Failed to save quiz:', err);
    }
  };

  const handleDownloadPDF = (includeSolutions = false) => {
    if (!quiz) return;

    let content = `
### Examination Paper (${quiz.subject})
Topic: ${quiz.topic} | Level: ${quiz.educationLevel.toUpperCase()}
Total Marks: ${quiz.totalMarks} | Time Allowed: ${quiz.timeLimitMinutes} Minutes

Instructions: Answer all questions. Clearly state all intermediate steps for full credit.

`;

    quiz.questions.forEach((q, idx) => {
      content += `Question ${idx + 1} [${q.marks} Marks]:\n${q.question}\n`;
      if (q.options && q.options.length > 0) {
        content += q.options.join('\n') + '\n';
      }
      if (includeSolutions) {
        content += `\n[ANSWER KEY]: ${q.correctAnswer}\n[SOLUTION/EXPLANATION]: ${q.explanation}\n\n`;
      } else {
        content += '\n\n';
      }
    });

    onDownloadPdf({
      title: `${quiz.title} ${includeSolutions ? '(Answer Key)' : '(Student Paper)'}`,
      subject: quiz.subject,
      topic: quiz.topic,
      educationLevel: quiz.educationLevel.toUpperCase(),
      resourceType: includeSolutions ? 'quiz' : 'worksheet',
      content
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">
              Diagnostic Quiz & Question Paper Maker
            </h2>
            <p className="text-xs text-[#687386]">
              Generate multi-format tests with questions, mark allocations, and editable AI answer keys.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Topic <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Trees and Heaps, Kirchhoff's Laws..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Domain</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Grade</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="btech">B.Tech Engineering</option>
                <option value="class12">Class 12 (Board Prep)</option>
                <option value="undergrad">Undergrad (B.Sc / BCA / B.Com)</option>
                <option value="advanced">Advanced / Gate Prep</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value={4}>4 Questions (Quick Check)</option>
                <option value={6}>6 Questions (Standard Quiz)</option>
                <option value={10}>10 Questions (Midterm Paper)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Difficulty Target</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="beginner">Foundational / Direct</option>
                <option value="intermediate">Intermediate / Standard</option>
                <option value="advanced">Advanced / Analytical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Exam Paper & Answer Keys...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Question Paper & Keys</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Quiz Review Workspace */}
      {quiz && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E8F0] shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {quiz.educationLevel.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {quiz.questions.length} Questions ({quiz.totalMarks} Marks)
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#14263D] font-['Manrope']">{quiz.title}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownloadPDF(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600"
                title="Download Clean Student Worksheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Student Paper (PDF)</span>
              </button>

              <button
                onClick={() => handleDownloadPDF(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14263D] hover:bg-slate-800 text-white text-xs font-semibold"
                title="Download Teacher Answer Key"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Answer Key (PDF)</span>
              </button>

              <button
                onClick={handleSaveToVault}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>{isSaved ? 'Saved in Vault' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>

          {/* Teacher Review Status Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2.5">
              {isReviewed ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isReviewed
                    ? 'Verified by Educator'
                    : 'AI-Generated Draft — Pending Teacher Review'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isReviewed
                    ? 'Answer keys and point distributions have been audited and confirmed.'
                    : 'Please review and adjust any question phrasing or answers before distributing to students.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReviewed(!isReviewed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                isReviewed
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isReviewed ? 'Re-open for Edit' : 'Mark as Reviewed & Verified'}
            </button>
          </div>

          {/* Editable Questions List */}
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id || idx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {q.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => handleUpdateQuestion(idx, { marks: Number(e.target.value) })}
                      className="w-16 px-2 py-1 rounded border border-slate-200 text-xs text-center"
                      title="Marks allocation"
                    />
                    <span className="text-xs text-slate-400">marks</span>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Input */}
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                />

                {/* Options if MCQ */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-1 pl-4 border-l-2 border-indigo-100">
                    <p className="text-[11px] font-semibold text-slate-500">Options:</p>
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(q.options || [])];
                          newOpts[oi] = e.target.value;
                          handleUpdateQuestion(idx, { options: newOpts });
                        }}
                        className="w-full p-1.5 rounded border border-slate-200 text-xs text-slate-700 my-0.5"
                      />
                    ))}
                  </div>
                )}

                {/* Answer Key & Explanation */}
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-900">Correct Answer:</span>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => handleUpdateQuestion(idx, { correctAnswer: e.target.value })}
                      className="px-2 py-0.5 rounded border border-emerald-200 text-xs bg-white text-emerald-900 font-semibold"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 block mb-0.5">Pedagogical Solution Key:</span>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                      className="w-full p-2 rounded border border-emerald-200 text-xs bg-white text-slate-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
