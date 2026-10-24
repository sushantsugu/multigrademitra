import React from 'react';
import { GraduationCap, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E4E8F0] mt-16 text-[#687386]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#14263D] flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-extrabold text-base text-[#14263D] font-['Manrope']">
                MultiGrade Mitra
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md text-slate-600">
              One Platform. Every Grade. Endless Possibilities. Designed to elevate school students,
              engineering undergraduates, and passionate teachers through personalized AI study support,
              lesson synthesis, and server-side printable materials.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1 text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Pedagogical Models
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Gemini 3.8 Multimodal AI
              </span>
            </div>
          </div>

          {/* Education Coverage */}
          <div>
            <h4 className="text-xs font-bold text-[#14263D] uppercase tracking-wider mb-2.5 font-['Manrope']">
              Education Tiers
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Class 12 (Board Prep & Formulas)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>B.Tech CSE & Engineering Branches</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>B.Sc, B.Com, BBA & BCA Programs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Advanced & Systems Mastery</span>
              </li>
            </ul>
          </div>

          {/* Pedagogical Integrity & Privacy */}
          <div>
            <h4 className="text-xs font-bold text-[#14263D] uppercase tracking-wider mb-2.5 font-['Manrope']">
              Academic Support
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500 mb-2">
              MultiGrade Mitra acts as an educational amplifier. All generated questions, answer keys, and
              notes are intended for conceptual reinforcement and should be verified for institutional exam variants.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-medium">
              <span>Private & Non-invasive Architecture</span>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MultiGrade Mitra. From Classrooms to Campuses, Helping Everyone Learn Smarter.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Made by shivam,uditya,sushant</span>
            <span>•</span>
            <span>Server-side PDF Kit Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
