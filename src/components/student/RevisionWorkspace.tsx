import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Flashcard, QuizResult, SavedResource } from '../../types';
import {
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Download
} from 'lucide-react';

interface RevisionWorkspaceProps {
  onDownloadPdf: (data: any) => void;
  onSavedResource: (resource: SavedResource) => void;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'Engineering Mathematics / Class 12',
    subject: 'Calculus',
    level: 'Class 12 / B.Tech',
    front: 'What is Euler\'s Formula for Homogeneous Functions of degree n?',
    back: 'If u = f(x, y) is a homogeneous function of degree n in x and y, then:\nx·(∂u/∂x) + y·(∂u/∂y) = n·u'
  },
  {
    id: 'fc-2',
    category: 'Data Structures & Algorithms',
    subject: 'Trees',
    level: 'B.Tech CSE',
    front: 'What are the Balance Factor constraints for an AVL tree node?',
    back: 'Balance Factor = Height(Left Subtree) - Height(Right Subtree).\nValid values must be strictly in {-1, 0, +1}. If BF becomes +2 or -2, a rotation is triggered.'
  },
  {
    id: 'fc-3',
    category: 'Physics / Electrical',
    subject: 'Current Electricity',
    level: 'Class 12 / B.Tech 1st Year',
    front: 'State Kirchhoff\'s Voltage Law (KVL) and its underlying conservation principle.',
    back: 'The algebraic sum of all potential differences around any closed electrical loop is zero: Σ ΔV = 0. It is based on the Law of Conservation of Energy.'
  },
  {
    id: 'fc-4',
    category: 'Operating Systems',
    subject: 'Concurrency',
    level: 'B.Tech CSE',
    front: 'What are the four necessary conditions for a Deadlock to occur?',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait'
  },
  {
    id: 'fc-5',
    category: 'Chemistry / Physical',
    subject: 'Electrochemistry',
    level: 'Class 12',
    front: 'Write the Nernst Equation at 298 K for a general redox reaction.',
    back: 'E_cell = E°_cell - (0.0591 / n) · log10(Q)\nwhere n is the number of moles of electrons transferred and Q is the reaction quotient.'
  }
];

export const RevisionWorkspace: React.FC<RevisionWorkspaceProps> = ({ onDownloadPdf, onSavedResource }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'flashcards' | 'formulas' | 'quiz'>('flashcards');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);

  // Interactive Quiz state
  const [quizTopic, setQuizTopic] = useState('Data Structures: AVL Trees & Binary Heaps');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentCard = SAMPLE_FLASHCARDS[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % SAMPLE_FLASHCARDS.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + SAMPLE_FLASHCARDS.length) % SAMPLE_FLASHCARDS.length);
  };

  const handleToggleMastered = (cardId: string) => {
    if (masteredCards.includes(cardId)) {
      setMasteredCards(masteredCards.filter((id) => id !== cardId));
    } else {
      setMasteredCards([...masteredCards, cardId]);
    }
  };

  const handleStartQuiz = async () => {
    setQuizLoading(true);
    setQuizSubmitted(false);
    setUserAnswers({});
    try {
      const res = await fetch('/api/teaching/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          subject: currentUser?.studentProfile?.branch || 'Academic Foundations',
          educationLevel: currentUser?.studentProfile?.educationLevel || 'btech',
          questionCount: 4,
          difficulty: 'intermediate',
          includeAnswerKey: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectAnswer = (qId: string, option: string) => {
    if (quizSubmitted) return;
    setUserAnswers({ ...userAnswers, [qId]: option });
  };

  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 0 };
    let correctCount = 0;
    quizData.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      // Compare option letter or text
      if (ans && (ans.startsWith(q.correctAnswer) || ans === q.correctAnswer)) {
        correctCount += q.marks;
      }
    });
    return { score: correctCount, total: quizData.totalMarks };
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl p-2 border border-[#E4E8F0] shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'flashcards'
              ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive Flashcards ({SAMPLE_FLASHCARDS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'quiz'
              ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Diagnostic Practice Quizzes</span>
        </button>

        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'formulas'
              ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quick Formula Summaries</span>
        </button>
      </div>

      {/* Tab 1: Interactive Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card {currentCardIndex + 1} of {SAMPLE_FLASHCARDS.length}
            </span>
            <span className="font-semibold text-emerald-600">
              {masteredCards.length} of {SAMPLE_FLASHCARDS.length} Mastered
            </span>
          </div>

          {/* Flashcard Component */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[260px] bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-400 shadow-md flex flex-col justify-between transition-all duration-300 relative group"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {currentCard.category}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click card to flip</span>
            </div>

            {/* Content Body */}
            <div className="my-auto py-4 text-center">
              {!isFlipped ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Question / Theorem</p>
                  <p className="text-base sm:text-lg font-bold text-[#14263D] leading-snug font-['Manrope']">
                    {currentCard.front}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Formula / Core Concept</p>
                  <div className="p-3 bg-indigo-50/50 rounded-xl text-xs sm:text-sm font-mono text-indigo-950 whitespace-pre-line leading-relaxed text-left border border-indigo-100">
                    {currentCard.back}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>{currentCard.level}</span>
              <span className="text-indigo-600 font-semibold group-hover:underline">
                {isFlipped ? 'Show Question' : 'Reveal Answer'}
              </span>
            </div>
          </div>

          {/* Card Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrevCard}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              Previous Card
            </button>

            <button
              onClick={() => handleToggleMastered(currentCard.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                masteredCards.includes(currentCard.id)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {masteredCards.includes(currentCard.id) ? '✓ Marked Mastered' : 'Mark as Mastered'}
            </button>

            <button
              onClick={handleNextCard}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-xs font-semibold text-white shadow-xs"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Diagnostic Practice Quizzes */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">
                  Practice Assessment & Diagnostic Quiz
                </h3>
                <p className="text-xs text-[#687386]">
                  Immediate scoring with conceptual explanations for each answer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Enter topic..."
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-60"
                />
                <button
                  onClick={handleStartQuiz}
                  disabled={quizLoading}
                  className="px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
                >
                  {quizLoading ? 'Generating...' : 'Start New Quiz'}
                </button>
              </div>
            </div>

            {!quizData && !quizLoading && (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Ready to test your concept mastery?</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click 'Start New Quiz' to generate a 4-question diagnostic test on {quizTopic}.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Start Assessment
                </button>
              </div>
            )}

            {/* Active Quiz Items */}
            {quizData && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{quizData.title}</h4>
                  <span className="text-xs text-slate-500">
                    Total Marks: {quizData.totalMarks} • Time: {quizData.timeLimitMinutes} mins
                  </span>
                </div>

                <div className="space-y-4">
                  {quizData.questions.map((q, idx) => {
                    const isSelected = userAnswers[q.id];
                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800">{q.question}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {q.marks} pts
                          </span>
                        </div>

                        {/* Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-1.5 pl-7">
                            {q.options.map((opt, oi) => {
                              const optLetter = opt.charAt(0);
                              const isPicked = userAnswers[q.id] === optLetter;
                              let optionClass = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                              if (quizSubmitted) {
                                if (optLetter === q.correctAnswer) {
                                  optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                                } else if (isPicked && optLetter !== q.correctAnswer) {
                                  optionClass = 'border-red-400 bg-red-50 text-red-900 line-through';
                                }
                              } else if (isPicked) {
                                optionClass = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold';
                              }

                              return (
                                <button
                                  key={oi}
                                  onClick={() => handleSelectAnswer(q.id, optLetter)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 ${optionClass}`}
                                >
                                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                                    {optLetter}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation & Feedback (after submission) */}
                        {quizSubmitted && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 pl-7">
                            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {userAnswers[q.id] === q.correctAnswer ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                              )}
                              <span>Correct Answer: {q.correctAnswer}</span>
                            </p>
                            <p className="text-slate-600 text-[11px] leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Score & Submission Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Submit Assessment & View Explanations
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-800">
                          Score: {calculateScore().score} / {calculateScore().total} points
                        </span>
                      </div>
                      <button
                        onClick={handleStartQuiz}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                      >
                        Retake Another Diagnostic Test
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Formula Summaries */}
      {activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E4E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                CLASS 12 / ENG MATH
              </span>
              <span className="text-xs text-slate-400">Calculus & Limits</span>
            </div>
            <h4 className="text-sm font-bold text-[#14263D] font-['Manrope']">Derivatives & Standard Integrals</h4>
            <div className="space-y-1.5 text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p>• d/dx [sin(ax)] = a · cos(ax)</p>
              <p>• d/dx [ln(x)] = 1/x (for x &gt; 0)</p>
              <p>• ∫ (1 / √(a² - x²)) dx = sin⁻¹(x/a) + C</p>
              <p>• ∫ e^(ax) dx = (1/a) e^(ax) + C</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E4E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                B.TECH CSE (SEM 3)
              </span>
              <span className="text-xs text-slate-400">Algorithms & Complexity</span>
            </div>
            <h4 className="text-sm font-bold text-[#14263D] font-['Manrope']">Master Theorem for Recurrences</h4>
            <div className="space-y-1.5 text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p>T(n) = a·T(n/b) + f(n), where a ≥ 1, b &gt; 1</p>
              <p>• Case 1: f(n) = O(n^(log_b(a) - ε)) ⇒ T(n) = Θ(n^(log_b(a)))</p>
              <p>• Case 2: f(n) = Θ(n^(log_b(a))) ⇒ T(n) = Θ(n^(log_b(a)) · log n)</p>
              <p>• Case 3: f(n) = Ω(n^(log_b(a) + ε)) ⇒ T(n) = Θ(f(n))</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
