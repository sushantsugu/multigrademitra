import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MultiGradeResult, SavedResource } from '../../types';
import {
  Users,
  Sparkles,
  Download,
  Bookmark,
  RefreshCw,
  Layers,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Compass
} from 'lucide-react';

interface MultiGradeTeachingProps {
  onSavedResource: (resource: SavedResource) => void;
  onDownloadPdf: (data: any) => void;
}

const PRESET_GRADE_OPTIONS = [
  'Class 12 (Board Foundations)',
  '1st Year B.Tech (Engineering Core)',
  '2nd Year B.Tech (Data Structures & Systems)',
  'Undergrad B.Sc / BCA (Applied Computing)',
  'Class 10 / Secondary Level'
];

export const MultiGradeTeaching: React.FC<MultiGradeTeachingProps> = ({ onSavedResource, onDownloadPdf }) => {
  const { currentUser } = useAuth();

  const [overarchingTopic, setOverarchingTopic] = useState('Rate of Change & Calculus: From Tangents to Gradient Descent');
  const [contextSubject, setContextSubject] = useState('Interdisciplinary STEM & Mathematics');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([
    'Class 12 (Board Foundations)',
    '1st Year B.Tech (Engineering Core)',
    '2nd Year B.Tech (Data Structures & Systems)'
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultiGradeResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleGrade = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      if (selectedGrades.length > 1) {
        setSelectedGrades(selectedGrades.filter((g) => g !== grade));
      }
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleGenerate = async () => {
    if (!overarchingTopic.trim() || selectedGrades.length === 0) return;

    setLoading(true);
    setIsSaved(false);
    try {
      const res = await fetch('/api/teaching/multigrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overarchingTopic,
          contextSubject,
          selectedGrades
        })
      });

      if (res.ok) {
        const data: MultiGradeResult = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('MultiGrade generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!result || !currentUser) return;

    const content = `
# MultiGrade Differentiated Instruction Plan: ${result.overarchingTopic}

**Domain**: ${result.subjectDomain}
**Target Cohorts**: ${result.tiers.map((t) => t.gradeLevel).join(', ')}

## Overarching Pedagogical Bridge
${result.introduction}

---

${result.tiers
  .map(
    (tier, idx) => `## ${tier.tierName} (${tier.gradeLevel})
- **Cognitive Target**: ${tier.cognitiveFocus}

### Concept Depth & Syllabus Focus
${tier.topicExplanation}

### Differentiated Classroom Activity
${tier.differentiatedActivity}

### Practice & Application Problems
${tier.practiceQuestions.map((q) => `- ${q}`).join('\n')}
`
  )
  .join('\n---\n\n')}

## Cross-Grade Peer Synthesis Activity
${result.crossGradeSynthesis}

## Teacher Classroom Orchestration Strategy
${result.teacherGuide}
`;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: `MultiGrade Plan: ${result.overarchingTopic}`,
          subject: result.subjectDomain,
          topic: result.overarchingTopic,
          educationLevel: 'btech',
          resourceType: 'multigrade',
          content,
          structuredData: result,
          metadata: {
            targetGrades: result.tiers.map((t) => t.gradeLevel),
            tags: ['MultiGrade', 'Pedagogy', 'Differentiated']
          }
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setIsSaved(true);
        if (onSavedResource) onSavedResource(saved.resource);
      }
    } catch (err) {
      console.error('Save multigrade plan failed:', err);
    }
  };

  const handleDownloadPDFClick = () => {
    if (!result) return;

    let content = `
### MultiGrade Differentiated Classroom Guide
Overarching Theme: ${result.overarchingTopic}
Subject: ${result.subjectDomain}

Pedagogical Overview:
${result.introduction}

`;

    result.tiers.forEach((tier) => {
      content += `========================================\n${tier.tierName.toUpperCase()} [${tier.gradeLevel}]\nCognitive Focus: ${tier.cognitiveFocus}\n\nConcept Depth:\n${tier.topicExplanation}\n\nAssigned Activity:\n${tier.differentiatedActivity}\n\nTarget Questions:\n${tier.practiceQuestions.join('\n')}\n\n`;
    });

    content += `Cross-Grade Peer Learning:\n${result.crossGradeSynthesis}\n\nTeacher Management Strategy:\n${result.teacherGuide}`;

    onDownloadPdf({
      title: `MultiGrade Guide: ${result.overarchingTopic}`,
      subject: result.subjectDomain,
      topic: result.overarchingTopic,
      educationLevel: 'MultiGrade (Class 12 - Higher Ed)',
      resourceType: 'multigrade',
      content
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro & Orchestrator Form */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">
              MultiGrade Mitra Differentiated Instruction
            </h2>
            <p className="text-xs text-[#687386]">
              Our signature feature: Teach students across multiple grade levels simultaneously on the same overarching academic concept with custom cognitive tiers.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Overarching Academic Topic / Theme <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={overarchingTopic}
              onChange={(e) => setOverarchingTopic(e.target.value)}
              placeholder="e.g. Rate of Change & Derivatives, Object-Oriented Design, Semiconductor Physics..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Domain</label>
            <input
              type="text"
              value={contextSubject}
              onChange={(e) => setContextSubject(e.target.value)}
              placeholder="e.g. Mathematics & Computer Science, Physical Sciences..."
              className="w-full px-3.5 py-2 rounded-lg border border-[#E4E8F0] text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Simultaneous Student Cohorts (Choose 2 or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_GRADE_OPTIONS.map((grade) => {
                const isSelected = selectedGrades.includes(grade);
                return (
                  <button
                    key={grade}
                    onClick={() => handleToggleGrade(grade)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {grade}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading || !overarchingTopic.trim() || selectedGrades.length < 1}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing MultiGrade Tiers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate MultiGrade Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated MultiGrade Results */}
      {result && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E8F0] shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">
                  MultiGrade Instruction
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{result.tiers.length} Differentiated Tiers</span>
              </div>
              <h2 className="text-lg font-bold text-[#14263D] font-['Manrope']">{result.overarchingTopic}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToVault}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isSaved ? 'Saved to Vault' : 'Save Plan'}</span>
              </button>

              <button
                onClick={handleDownloadPDFClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14263D] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Master Guide (PDF)</span>
              </button>
            </div>
          </div>

          {/* Overarching Pedagogical Bridge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Manrope']">
              Cross-Grade Pedagogical Bridge
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{result.introduction}</p>
          </div>

          {/* Differentiated Tiers (Side-by-side or stacked grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.tiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      TIER {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{tier.gradeLevel}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cognitive Focus</h4>
                    <p className="text-xs text-indigo-900 font-semibold mt-0.5">{tier.cognitiveFocus}</p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2">
                    <p className="font-semibold text-slate-700">Topic Scope & Rigor:</p>
                    <p className="leading-relaxed line-clamp-4">{tier.topicExplanation}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1">
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      Differentiated Classroom Task:
                    </p>
                    <p className="text-xs text-amber-950 leading-relaxed">{tier.differentiatedActivity}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-500">Practice Question Sample:</p>
                  <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                    {tier.practiceQuestions[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Peer Synthesis & Classroom Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider font-['Manrope']">
                Peer Learning & Cross-Grade Synthesis
              </h4>
              <p className="text-xs text-indigo-950 leading-relaxed">{result.crossGradeSynthesis}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-['Manrope']">
                Teacher Multi-Cohort Orchestration Guide
              </h4>
              <p className="text-xs text-emerald-950 leading-relaxed">{result.teacherGuide}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
