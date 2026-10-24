import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X,
  Compass,
  CheckCircle2,
  FileUp,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
  onOpenProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  isDarkMode,
  onToggleDarkMode,
  setActiveTab,
  onOpenProfileModal
}) => {
  const { currentUser, allUsers, switchDemoUser } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const themeToggle = (
    <button
      type="button"
      onClick={onToggleDarkMode}
      className="theme-toggle"
      role="switch"
      aria-label="Dark mode"
      aria-checked={isDarkMode}
      title={`Dark mode ${isDarkMode ? 'on' : 'off'}`}
    >
      <Moon className="w-4 h-4" aria-hidden="true" />
      <span>Dark mode</span>
      <span className={`theme-switch-track${isDarkMode ? ' is-active' : ''}`} aria-hidden="true">
        <span className="theme-switch-thumb" />
      </span>
    </button>
  );

  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="font-extrabold text-lg tracking-tight text-[#14263D] font-['Manrope']">
            MultiGrade Mitra
          </span>
          {themeToggle}
        </div>
      </header>
    );
  }

  const isTeacher = currentUser.role === 'teacher';

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'study_assistant', label: 'AI Study Assistant', icon: Sparkles },
    { id: 'upload_learn', label: 'Upload & Learn', icon: FileUp },
    { id: 'revision', label: 'Revision Workspace', icon: Layers },
    { id: 'materials', label: 'My Materials', icon: FileText }
  ];

  const teacherTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'lesson_planner', label: 'Create Lesson', icon: BookOpen },
    { id: 'quiz_maker', label: 'Generate Quizzes', icon: CheckCircle2 },
    { id: 'multigrade', label: 'MultiGrade Teaching', icon: Users },
    { id: 'materials', label: 'Resource Library', icon: FileText }
  ];

  const currentTabs = isTeacher ? teacherTabs : studentTabs;

  const getRoleBadge = () => {
    if (isTeacher) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Teacher Workspace
        </span>
      );
    }
    const level = currentUser.studentProfile?.educationLevel;
    const levelLabel =
      level === 'btech'
        ? `B.Tech ${currentUser.studentProfile?.year || ''}`
        : level === 'class12'
        ? 'Class 12'
        : level === 'undergrad'
        ? 'Undergrad'
        : 'Learner';

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        {levelLabel}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E8F0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14263D] via-[#3730A3] to-[#4F46E5] flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-[#14263D] font-['Manrope']">
                    MultiGrade Mitra
                  </span>
                  {getRoleBadge()}
                </div>
                <p className="text-[11px] font-medium text-[#687386] hidden sm:block">
                  From Classroom to Campus — Learn Smarter with AI
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
                      : 'text-[#687386] hover:text-[#202939] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Account & Fast Demo Switcher */}
          <div className="flex items-center gap-2.5">
            {themeToggle}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-[#E4E8F0] hover:border-indigo-300 hover:bg-slate-50 transition-all text-left"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <p className="font-semibold text-[#202939]">{currentUser.name}</p>
                  <p className="text-[10px] text-[#687386] capitalize">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Fast Switch Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E4E8F0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#E4E8F0]">
                    <p className="text-xs font-semibold text-[#202939]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#687386] truncate">{currentUser.email}</p>
                    <div className="mt-1.5 text-[10px] text-slate-500">
                      {isTeacher ? (
                        <span>{currentUser.teacherProfile?.institution || 'Academic Educator'}</span>
                      ) : (
                        <span>
                          {currentUser.studentProfile?.degree} • {currentUser.studentProfile?.branch || currentUser.studentProfile?.year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Edit Trigger */}
                  <div className="px-2 py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Learning & Curriculum Profile</span>
                    </button>
                  </div>

                  {/* Fast Switch Demo Profiles */}
                  <div className="px-4 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Fast Switch Persona
                  </div>
                  <div className="px-2 space-y-1">
                    {allUsers.map((user) => {
                      const isCurrent = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchDemoUser(user.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {user.role === 'teacher'
                                ? `Teacher (${user.teacherProfile?.educationLevelsTaught?.join(', ') || 'Higher Ed'})`
                                : `${user.studentProfile?.degree || 'Student'} (${user.studentProfile?.educationLevel})`}
                            </p>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E4E8F0] space-y-1 bg-white">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 px-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 py-2 text-xs font-medium text-slate-700"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Curriculum & Learning Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
