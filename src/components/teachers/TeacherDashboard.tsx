import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SavedResource } from '../../types';
import {
  Compass,
  BookOpen,
  CheckCircle2,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  Download,
  Clock,
  Plus,
  Layers,
  Settings
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string, initialTopic?: string) => void;
  onOpenProfile: () => void;
  onPreviewResource: (res: SavedResource) => void;
  onDownloadPdf: (res: SavedResource) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateTab,
  onOpenProfile,
  onPreviewResource,
  onDownloadPdf
}) => {
  const { currentUser } = useAuth();
  const [recentResources, setRecentResources] = useState<SavedResource[]>([]);
  const profile = currentUser?.teacherProfile;

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`/api/resources?userId=${currentUser?.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecentResources(data.resources || []);
        }
      } catch (err) {
        console.error('Error fetching teacher resources:', err);
      }
    };
    fetchResources();
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Teacher Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14263D] via-[#1E3A5F] to-[#16845B] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pedagogical & Instructional Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Manrope'] mb-2">
            Welcome Back, {currentUser?.name?.split(' ')[0] || 'Professor'}.
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            "Welcome Back. Let's Make Learning Easier." Streamline your lesson preparation, generate differentiated multi-grade worksheets, and export exam-ready PDFs in seconds.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('lesson_planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 font-semibold text-xs sm:text-sm text-white shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create New Lesson Plan</span>
            </button>
            <button
              onClick={() => onNavigateTab('multigrade')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-xs sm:text-sm text-white backdrop-blur-md transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>MultiGrade Orchestrator</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Teaching Profile Context */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Active Educator Profile
              </span>
              <h3 className="text-base font-bold text-[#14263D] mt-0.5 font-['Manrope']">
                {profile?.institution || 'Academic Institution'}
              </h3>
              <p className="text-xs text-[#687386] mt-1">
                Subjects: <span className="font-semibold text-slate-700">{profile?.subjectsTaught?.join(', ') || 'Interdisciplinary'}</span>
              </p>
            </div>
            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Configure Courses</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              Tiers Taught: {profile?.educationLevelsTaught?.map((l) => l.toUpperCase()).join(', ') || 'All Grades'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
              Language: {profile?.preferredLanguage || 'English'}
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-[11px]">
              Pedagogical Engine Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructional Vault</h4>
          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="p-3 rounded-lg bg-[#F6F8FC] border border-slate-100">
              <span className="text-2xl font-extrabold text-[#14263D]">{recentResources.length}</span>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Teaching Aids</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-2xl font-extrabold text-emerald-700">
                {profile?.subjectsTaught?.length || 3}
              </span>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">Active Courses</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('materials')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-1"
          >
            <span>Open Teaching Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4 Teaching Launchpads */}
      <section>
        <h3 className="text-sm font-bold text-[#14263D] uppercase tracking-wider mb-4 font-['Manrope']">
          Instructional Toolset
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Create Lesson */}
          <div
            onClick={() => onNavigateTab('lesson_planner')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              Structured Lesson Plans
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Generate objectives, minute-by-minute timeline, discussion prompts, and board blueprints.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600">
              <span>Plan a lecture</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 2. Quizzes & Tests */}
          <div
            onClick={() => onNavigateTab('quiz_maker')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              Quizzes & Question Papers
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Create balanced MCQs, numericals, and conceptual questions with verified answer keys.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <span>Generate paper</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 3. MultiGrade Teaching */}
          <div
            onClick={() => onNavigateTab('multigrade')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              MultiGrade Teaching
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Signature feature: Teach multiple grades simultaneously with synchronized differentiated tiers.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-amber-600">
              <span>Orchestrate classroom</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 4. Resource Library */}
          <div
            onClick={() => onNavigateTab('materials')}
            className="group cursor-pointer bg-white rounded-xl p-5 border border-[#E4E8F0] hover:border-indigo-400 hover:shadow-md transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <h4 className="text-sm font-bold text-[#14263D] group-hover:text-indigo-600 transition-colors font-['Manrope']">
              Teaching Vault & PDFs
            </h4>
            <p className="text-xs text-[#687386] mt-1 line-clamp-2">
              Manage saved lesson plans, worksheets, assignments, and export high-res PDFs.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-slate-700">
              <span>Open vault</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Teaching Materials */}
      <section className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#14263D] font-['Manrope']">Recent Teaching Materials & Plans</h3>
            <p className="text-xs text-[#687386]">Download printable lesson handouts or student worksheets</p>
          </div>
          <button
            onClick={() => onNavigateTab('materials')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All ({recentResources.length})
          </button>
        </div>

        {recentResources.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>No teaching resources created yet. Click 'Create New Lesson Plan' to generate your first plan!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentResources.map((res) => (
              <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
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
                    <span>Created on {new Date(res.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPreviewResource(res)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={() => onDownloadPdf(res)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
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
