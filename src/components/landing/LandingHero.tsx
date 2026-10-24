import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  FileUp,
  Users,
  FileText,
  Layers,
  Code,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingHeroProps {
  onStartLearning: () => void;
  onStartTeaching: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartLearning, onStartTeaching }) => {
  const { allUsers, switchDemoUser } = useAuth();

  return (
    <div className="space-y-16 py-6 sm:py-10 animate-in fade-in duration-300">
      {/* Hero Headline Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Next-Generation AI Education Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#14263D] tracking-tight font-['Manrope'] leading-tight">
          From Classroom to Campus —{' '}
          <span className="bg-gradient-to-r from-[#4F46E5] via-[#3730A3] to-[#14263D] bg-clip-text text-transparent">
            Learn Smarter with AI.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-[#687386] leading-relaxed max-w-2xl mx-auto">
          "One Platform. Every Grade. Endless Possibilities." From Class 12 board preparations to 4-year
          B.Tech engineering and undergraduate degree mastery, MultiGrade Mitra bridges foundational intuition with technical rigor.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartLearning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enter Student Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onStartTeaching}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E4E8F0] text-[#14263D] font-semibold text-sm shadow-xs transition-all"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Enter Teacher Workspace</span>
          </button>
        </div>

        {/* 1-Click Fast Persona Switch Bar */}
        <div className="pt-6 border-t border-slate-200/80 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-slate-500 mb-2.5">
            Explore with Pre-configured Educational Personas:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allUsers.slice(0, 4).map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchDemoUser(user.id);
                  if (user.role === 'teacher') onStartTeaching();
                  else onStartLearning();
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-indigo-600 font-semibold truncate capitalize">
                  {user.role === 'teacher' ? 'Teacher' : user.studentProfile?.degree}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Target Education Levels Strip */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E4E8F0] shadow-xs max-w-6xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Continuous Academic Continuum
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14263D] mt-1 font-['Manrope']">
            Four Dedicated Educational Tiers
          </h2>
          <p className="text-xs text-[#687386] mt-1">
            Engineered with syllabus flexibility, ensuring concepts scale in depth as learners advance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level 1 */}
          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              LEVEL 1
            </span>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">Class 12 (Senior Secondary)</h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              Mathematics, Physics, Chemistry, Biology, Computer Science, Economics, and Accountancy.
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>• Chapter derivations & formula sheets</li>
              <li>• Board numerical worked solutions</li>
              <li>• Exam revision summaries</li>
            </ul>
          </div>

          {/* Level 2 */}
          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              LEVEL 2
            </span>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">Undergraduate Degrees</h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              B.Sc, BCA, B.Com, BBA, and BA degree programs across semester curricula.
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>• Semester-specific syllabus modules</li>
              <li>• Applied analytical problem sets</li>
              <li>• Printable revision guides</li>
            </ul>
          </div>

          {/* Level 3 */}
          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              LEVEL 3
            </span>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">B.Tech Engineering</h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              Dedicated engineering branch support: CSE, IT, ECE, EEE, Mechanical, and Civil.
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>• C & Python, Data Structures, OS, DBMS</li>
              <li>• Engineering Maths & Circuit Theorems</li>
              <li>• Complexity analysis & code tracing</li>
            </ul>
          </div>

          {/* Level 4 */}
          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              LEVEL 4
            </span>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">Advanced & Systems Mastery</h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              Postgraduate research, competitive GATE technical prep, and specialized systems engineering.
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>• High-performance system design</li>
              <li>• Machine learning algorithms</li>
              <li>• Research paper conceptual synthesis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Architectural Highlights */}
      <section className="max-w-6xl mx-auto space-y-8 px-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[#14263D] font-['Manrope']">
            Built for Real Academic Rigor
          </h2>
          <p className="text-xs text-[#687386] mt-1">
            Engineered with full-stack persistence, multimodal vision, and professional server-side PDF generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">
              Universal Document-to-Learning
            </h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              Upload physical textbook photos, handwritten notes, or lecture PDFs. Our multimodal vision system extracts concepts and generates editable study notes and quizzes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">
              MultiGrade Teaching Engine
            </h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              The signature MultiGrade Mitra capability: orchestrate mixed-grade classrooms where Class 12 and B.Tech cohorts explore the same topic across differentiated cognitive tiers.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">
              Server-Side PDF Generation
            </h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              Real vector PDF generation powered by PDFKit. Download beautifully structured worksheets, lesson plans, formula sheets, and exam papers with pagination and clean typography.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
