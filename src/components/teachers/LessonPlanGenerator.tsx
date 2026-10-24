import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LessonPlanResult, SavedResource } from '../../types';
import {
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  Bookmark,
  Download,
  RefreshCw,
  HelpCircle,
  FileCheck,
  ListOrdered
} from 'lucide-react';

interface LessonPlanGeneratorProps {
  onSavedResource: (resource: SavedResource) => void;
  onDownloadPdf: (data: any) => void;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({ onSavedResource, onDownloadPdf }) => {
  const { currentUser } = useAuth();
  const profile = currentUser?.teacherProfile;

  const [topic, setTopic] = useState('Dynamic Memory Allocation & Pointers in C');
  const [subject, setSubject] = useState(profile?.subjectsTaught?.[0] || 'Programming & Data Structures');
  const [educationLevel, setEducationLevel] = useState<string>('btech');
  const [duration, setDuration] = useState('60 Minutes');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'English');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlanResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setIsSaved(false);
    try {
      const res = await fetch('/api/teaching/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          educationLevel,
          program: educationLevel === 'class12' ? 'Class 12' : 'B.Tech Engineering',
          duration,
          difficulty,
          language,
          additionalNotes: additionalNotes.trim() ? additionalNotes : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error('Lesson plan generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan || !currentUser) return;

    const markdown = `
# Lesson Plan: ${plan.topic}

**Subject**: ${plan.subject} | **Level**: ${plan.educationLevel.toUpperCase()} | **Duration**: ${plan.duration}

### 1. Learning Objectives
${plan.learningObjectives.map((o) => `- ${o}`).join('\n')}

### 2. Pedagogical Methodology
${plan.pedagogicalApproach}

### 3. Prerequisite Knowledge
${plan.prerequisiteKnowledge.map((p) => `- ${p}`).join('\n')}

### 4. Instructional Timeline Breakdown
| Time | Phase | Activity Description | Teaching Aid |
| :--- | :--- | :--- | :--- |
${plan.timeline.map((t) => `| ${t.time} | ${t.phase} | ${t.activity} | ${t.teachingAid} |`).join('\n')}

### 5. Blackboard / Slide Blueprint
${plan.blackboardSummary}

### 6. Classroom Discussion Prompts
${plan.discussionPrompts.map((d) => `- ❓ ${d}`).join('\n')}

### 7. Homework & Extension Task
${plan.homeworkOrFollowUp}
`;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: `Lesson Plan: ${plan.topic} (${plan.duration})`,
          subject: plan.subject,
          topic: plan.topic,
          educationLevel: plan.educationLevel,
          resourceType: 'lesson_plan',
          content: markdown,
          metadata: {
            duration: plan.duration,
            difficulty,
            language
          }
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setIsSaved(true);
        if (onSavedResource) onSavedResource(saved.resource);
      }
    } catch (err) {
      console.error('Save plan failed:', err);
    }
  };

  const handleDownloadPDFClick = () => {
    if (!plan) return;
    const content = `
### 1. Learning Objectives
${plan.learningObjectives.map((o) => `• ${o}`).join('\n')}

### 2. Pedagogical Approach
${plan.pedagogicalApproach}

### 3. Prerequisite Knowledge
${plan.prerequisiteKnowledge.map((p) => `• ${p}`).join('\n')}

### 4. Class Timeline Breakdown
${plan.timeline.map((t) => `[${t.time}] ${t.phase}\nActivity: ${t.activity}\nAid: ${t.teachingAid}`).join('\n\n')}

### 5. Blackboard / Slide Blueprint
${plan.blackboardSummary}

### 6. Key Discussion Questions
${plan.discussionPrompts.map((d) => `• ${d}`).join('\n')}

### 7. Homework & Follow-up
${plan.homeworkOrFollowUp}
`;

    onDownloadPdf({
      title: `Lesson Plan: ${plan.topic}`,
      subject: plan.subject,
      topic: plan.topic,
      educationLevel: plan.educationLevel.toUpperCase(),
      resourceType: 'lesson_plan',
      content
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">Structured Lesson Planner</h2>
            <p className="text-xs text-[#687386]">
              Design comprehensive pedagogical lesson blueprints complete with timeline allocations, discussion prompts, and blackboard layouts.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Topic / Chapter <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Memory Allocation in C, Kirchhoff's Laws..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Course Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Programming in C, Physics..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E8F0] text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Grade / Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="btech">B.Tech Engineering</option>
                <option value="class12">Class 12 (Secondary)</option>
                <option value="undergrad">Undergrad (B.Sc/BCA/B.Com)</option>
                <option value="advanced">Advanced / Postgraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Session Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="45 Minutes">45 Minutes (School Period)</option>
                <option value="60 Minutes">60 Minutes (Standard Lecture)</option>
                <option value="90 Minutes">90 Minutes (Block Seminar)</option>
                <option value="120 Minutes">120 Minutes (Lab Session)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="beginner">Beginner / Foundation</option>
                <option value="intermediate">Intermediate / Standard</option>
                <option value="advanced">Advanced / Honors</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instruction Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Pedagogical Focus (Optional)</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Focus on interactive live coding demo, memory leak demonstration in valgrind..."
              className="w-full px-3.5 py-2 rounded-lg border border-[#E4E8F0] text-xs text-slate-800"
            />
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
                  <span>Synthesizing Pedagogical Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Lesson Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Lesson Plan View */}
      {plan && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E8F0] shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {plan.educationLevel.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{plan.duration}</span>
              </div>
              <h2 className="text-lg font-bold text-[#14263D] font-['Manrope']">{plan.topic}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSavePlan}
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
                <span>Export Lesson PDF</span>
              </button>
            </div>
          </div>

          {/* Objectives & Pedagogy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider font-['Manrope']">
                Learning Objectives (Bloom's Taxonomy Aligned)
              </h3>
              <ul className="space-y-1 text-xs text-indigo-950 list-disc list-inside">
                {plan.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-['Manrope']">
                Pedagogical Approach & Active Learning
              </h3>
              <p className="text-xs text-emerald-950 leading-relaxed">{plan.pedagogicalApproach}</p>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#14263D] uppercase tracking-wider font-['Manrope']">
              Instructional Timeline & Classroom Activities
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5 w-24">Time</th>
                    <th className="px-4 py-2.5 w-48">Phase</th>
                    <th className="px-4 py-2.5">Activity Description</th>
                    <th className="px-4 py-2.5 w-40">Teaching Aid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plan.timeline.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-indigo-700 whitespace-nowrap">{t.time}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{t.phase}</td>
                      <td className="px-4 py-3 text-slate-600 leading-relaxed">{t.activity}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{t.teachingAid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Blackboard Blueprint */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-300">Blackboard / Whiteboard Organization Blueprint</span>
              <span className="text-[10px]">Layout Visualizer</span>
            </div>
            <p className="whitespace-pre-line text-emerald-300 leading-relaxed">{plan.blackboardSummary}</p>
          </div>

          {/* Discussion Prompts & Homework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Socratic Discussion Questions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {plan.discussionPrompts.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">?</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Post-Class Homework & Follow-up
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{plan.homeworkOrFollowUp}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
