import React, { useLayoutEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingHero } from './components/landing/LandingHero';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AIStudyAssistant } from './components/student/AIstudyAssistant';
import { UploadAndLearn } from './components/student/UploadAndLearn';
import { RevisionWorkspace } from './components/student/RevisionWorkspace';
import { TeacherDashboard } from './components/teachers/TeacherDashboard';
import { LessonPlanGenerator } from './components/teachers/LessonPlanGenerator';
import { QuizGenerator } from './components/teachers/QuizGenerator';
import { MultiGradeTeaching } from './components/teachers/MultiGradeTeaching';
import { ResourceLibrary } from './components/common/ResourceLibrary';
import { ProfileModal } from './components/common/ProfileModal';
import { PdfPreviewModal } from './components/common/PdfPreviewModal';
import { SavedResource } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem('mm_theme') === 'dark'
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [initialTopic, setInitialTopic] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<SavedResource | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('mm_theme', theme);
  }, [isDarkMode]);

  const isTeacher = currentUser?.role === 'teacher';

  const handleNavigateTab = (tab: string, topic?: string) => {
    setActiveTab(tab);
    if (topic) {
      setInitialTopic(topic);
    }
  };

  const handleDownloadPdf = async (resourceOrData: any) => {
    setDownloadingPdf(true);
    try {
      const payload = {
        title: resourceOrData.title,
        resourceType: resourceOrData.resourceType || 'notes',
        subject: resourceOrData.subject || 'Academic Subject',
        topic: resourceOrData.topic || resourceOrData.title,
        educationLevel: resourceOrData.educationLevel || 'Class 12 / Higher Ed',
        difficulty: resourceOrData.difficulty || resourceOrData.metadata?.difficulty,
        program: resourceOrData.program,
        semester: resourceOrData.semester,
        authorName: currentUser?.name || 'MultiGrade Mitra User',
        institution: currentUser?.teacherProfile?.institution,
        content: resourceOrData.content,
        structuredData: resourceOrData.structuredData
      };

      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `PDF generation failed (${res.status}).`);
      }

      const blob = await res.blob();
      if (blob.size === 0 || blob.type !== 'application/pdf') {
        throw new Error('The server returned an invalid PDF. Please try again.');
      }

      setPdfError(null);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(resourceOrData.title || 'MultiGrade_Mitra_Document').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to trigger PDF download:', err);
      setPdfError(err instanceof Error ? err.message : 'PDF generation failed. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FC] text-[#202939]">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((darkMode) => !darkMode)}
        setActiveTab={(t) => {
          setActiveTab(t);
          setInitialTopic('');
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If user clicks on 'landing' or wants to view platform vision */}
        {activeTab === 'landing' && (
          <LandingHero
            onStartLearning={() => setActiveTab('dashboard')}
            onStartTeaching={() => setActiveTab('dashboard')}
          />
        )}

        {/* Student Views */}
        {!isTeacher && activeTab !== 'landing' && (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard
                onNavigateTab={handleNavigateTab}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onPreviewResource={(r) => setPreviewResource(r)}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'study_assistant' && (
              <AIStudyAssistant
                initialTopic={initialTopic}
                onSavedResource={(r) => {}}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'upload_learn' && (
              <UploadAndLearn
                onSavedResource={(r) => {}}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'revision' && (
              <RevisionWorkspace
                onDownloadPdf={handleDownloadPdf}
                onSavedResource={(r) => {}}
              />
            )}

            {activeTab === 'materials' && (
              <ResourceLibrary
                onDownloadPdf={handleDownloadPdf}
                onPreviewResource={(r) => setPreviewResource(r)}
              />
            )}
          </>
        )}

        {/* Teacher Views */}
        {isTeacher && activeTab !== 'landing' && (
          <>
            {activeTab === 'dashboard' && (
              <TeacherDashboard
                onNavigateTab={handleNavigateTab}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onPreviewResource={(r) => setPreviewResource(r)}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'lesson_planner' && (
              <LessonPlanGenerator
                onSavedResource={(r) => {}}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'quiz_maker' && (
              <QuizGenerator
                onSavedResource={(r) => {}}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'multigrade' && (
              <MultiGradeTeaching
                onSavedResource={(r) => {}}
                onDownloadPdf={handleDownloadPdf}
              />
            )}

            {activeTab === 'materials' && (
              <ResourceLibrary
                onDownloadPdf={handleDownloadPdf}
                onPreviewResource={(r) => setPreviewResource(r)}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Resource Full Preview Modal */}
      <PdfPreviewModal
        resource={previewResource}
        isOpen={Boolean(previewResource)}
        onClose={() => setPreviewResource(null)}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* PDF Generation Notification Indicator */}
      {downloadingPdf && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#14263D] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Generating vector PDF with PDFKit...</span>
        </div>
      )}
      {pdfError && (
        <div role="alert" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p>{pdfError}</p>
            <button onClick={() => setPdfError(null)} className="shrink-0 font-semibold" aria-label="Dismiss PDF error">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
