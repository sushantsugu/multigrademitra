import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SavedResource, CurriculumSubject } from '../../types';
import {
  Sparkles,
  BookOpen,
  FileUp,
  Layers,
  FileText,
  Download,
  ArrowRight,
  Clock,
  CheckCircle,
  HelpCircle,
  Code,
  Search,
  Settings,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string, initialTopic?: string) => void;
  onOpenProfile: () => void;
  onPreviewResource: (res: SavedResource) => void;
  onDownloadPdf: (res: SavedResource) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onOpenProfile,
  onPreviewResource,
  onDownloadPdf
}) => {
  const { currentUser } = useAuth();
  const [recentResources, setRecentResources] = useState<SavedResource[]>([]);
  const [quickSearchTopic, setQuickSearchTopic] = useState('');
  const [curriculumSubjects, setCurriculumSubjects] = useState<CurriculumSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const profile = currentUser?.studentProfile;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch resources
        const res = await fetch(`/api/resources?userId=${currentUser?.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecentResources(data.resources?.slice(0, 5) || []);
        }

        // Fetch curriculum
        const currRes = await fetch('/api/curriculum');
        if (currRes.ok) {
          const currData = await currRes.json();
          // Filter by student level if applicable
          const allSubs: CurriculumSubject[] = currData.subjects || [];
          if (profile?.educationLevel) {
            setCurriculumSubjects(
              allSubs.filter(
                (s) =>
                  s.educationLevel === profile.educationLevel ||
                  (profile.educationLevel === 'btech' && s.educationLevel === 'btech')
              )
            );
          } else {
            setCurriculumSubjects(allSubs.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, profile?.educationLevel]);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchTopic.trim()) {
      onNavigateTab('study_assistant', quickSearchTopic.trim());
    }
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const popularPrompts =
    profile?.educationLevel === 'btech'
      ? [
          'AVL Tree Rotations and Balance Factor',
          'Process Synchronization & Semaphores in OS',
          'Eigenvalues and Diagonalization in Engineering Maths',
          'Pointers and Dynamic Memory in C'
        ]
      : [
          'Kirchhoff\'s Laws and Wheatstone Bridge',
          'Continuity and Differentiability Rules',
          'Electrochemistry & Nernst Equation',
          'Python File Handling and CSV Files'
        ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#14263D] via-[#1E3A5F] to-[#3730A3] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Academic Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Manrope'] mb-2">
            {getGreetingTime()}, {currentUser?.name?.split(' ')[0] || 'Learner'}.
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            "Welcome Back. Let's Learn Something New." Your personalized workspace for understanding
            difficult academic concepts, practicing questions, and preparing for exams.
          </p>

          {/* Quick Concept Ask Bar */}
          <form onSubmit={handleQuickSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearchTopic}
                onChange={(e) => setQuickSearchTopic(e.target.value)}
                placeholder="Ask about any chapter, theorem, code, or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 text-xs sm:text-sm focus:outline-hidden focus:bg-white/15 focus:border-indigo-300 transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 font-semibold text-xs sm:text-sm text-white shadow-md shadow-indigo-900/40 transition-colors shrink-0"
            >
              <span>Explain Topic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Prompt chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400">Trending:</span>
            {popularPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onNavigateTab('study_assistant', p)}
                className="px-2.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] text-slate-200 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Curriculum Context & Stats Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Profile Card */}
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Current Curriculum Target
              </span>
              <h3 className="text-base font-bold text-[#14263D] mt-0.5 font-['Manrope']">
                {profile?.degree || 'Academic Degree'}
                {profile?.branch ? ` — ${profile.branch}` : ''}
              </h3>
              <p className="text-xs text-[#687386] mt-1">
                {profile?.year || 'Current Year'} {profile?.semester ? `• ${profile.semester}` : ''} • Preferred Language:{' '}
                <span className="font-semibold text-slate-700">{profile?.preferredLanguage || 'English'}</span>
              </p>
            </div>
            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Curriculum</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              Learning Style: {profile?.learningStyle || 'Step-by-Step'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              Difficulty: {profile?.difficulty || 'Intermediate'}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Active Study Plan Synced
            </span>
          </div>
        </div>

        {/* Quick Numbers Card */}
        <div className="bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Summary</h4>
          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="p-3 rounded-lg bg-[#F6F8FC] border border-slate-100">
              <span className="text-2xl font-extrabold text-[#14263D]">{recentResources.length}</span>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Saved Materials</p>
            </div>
            <div className="p-3 rounded-lg bg-[#EEF2FF] border border-indigo-100">
              <span className="text-2xl font-extrabold text-[#4F46E5]">{curriculumSubjects.length}</span>
              <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Enrolled Subjects</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('materials')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-1"
          >
            <span>Open Resource Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4 Feature Launchpads */}
      <section>
        <h3 className="text-sm font-bold text-[#14263D] uppercase tracking-wider mb-4 font-['Manrope']">
          Core Learning Modalities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. AI Study Assistant */}
          <div
            onClick={() => onNavigateTab('study_assistant')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              AI Study Assistant
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Deep concept explanations in simple, step-by-step, academic, and code formats.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600">
              <span>Ask a question</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Upload & Learn */}
          <div
            onClick={() => onNavigateTab('upload_learn')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              Upload and Learn
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Upload textbook pages, lecture notes, or diagrams for automated concept synthesis.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <span>Upload document</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Revision Workspace */}
          <div
            onClick={() => onNavigateTab('revision')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              Revision Workspace
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Formula summaries, interactive flashcards, and diagnostic practice quizzes.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-amber-600">
              <span>Start revision</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. My Materials */}
          <div
            onClick={() => onNavigateTab('materials')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              My Saved Materials
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Access your personal library of study sheets, worksheets, and downloadable PDFs.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-slate-700">
              <span>View all files</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Subjects Explorer */}
      {curriculumSubjects.length > 0 && (
        <section className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">
                Subjects in Your Active Curriculum ({profile?.degree || 'Undergrad'})
              </h3>
              <p className="text-xs text-[#687386]">Click any subject or chapter to instantly study with AI</p>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:block">Configurable Syllabus</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculumSubjects.slice(0, 6).map((sub) => (
              <div key={sub.id} className="p-4 rounded-lg bg-[#F6F8FC] border border-[#E4E8F0] hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {sub.code || sub.educationLevel.toUpperCase()}
                  </span>
                  {sub.semester && <span className="text-[10px] text-slate-400 font-medium">{sub.semester}</span>}
                </div>
                <h4 className="text-xs font-bold text-[#14263D] mt-2 font-['Manrope']">{sub.name}</h4>
                <div className="mt-2.5 space-y-1">
                  {sub.chapters.slice(0, 3).map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigateTab('study_assistant', `${sub.name}: ${ch}`)}
                      className="w-full text-left text-[11px] text-slate-600 hover:text-indigo-600 truncate flex items-center gap-1.5 py-0.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span className="truncate">{ch}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Saved Materials */}
      <section className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">Recently Studied & Saved Materials</h3>
            <p className="text-xs text-[#687386]">Download high-resolution server-side printable PDFs</p>
          </div>
          <button
            onClick={() => onNavigateTab('materials')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Library ({recentResources.length})
          </button>
        </div>

        {recentResources.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>No saved materials yet. Ask the AI assistant or upload a textbook page to generate your first notes!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentResources.map((res) => (
              <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {res.resourceType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{res.subject}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#14263D] hover:text-indigo-600 cursor-pointer" onClick={() => onPreviewResource(res)}>
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>Saved on {new Date(res.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPreviewResource(res)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDownloadPdf(res)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    title="Download Clean Printable PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
