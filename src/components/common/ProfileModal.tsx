import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EducationLevel, StudentProfile, TeacherProfile } from '../../types';
import { X, Check, Settings, GraduationCap, School } from 'lucide-react';
import { EDUCATION_PROGRAMS, SUPPORTED_LANGUAGES } from '../../lib/curriculumData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  if (!isOpen || !currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';

  // Student form state
  const [eduLevel, setEduLevel] = useState<EducationLevel>(
    currentUser.studentProfile?.educationLevel || 'btech'
  );
  const [degree, setDegree] = useState(currentUser.studentProfile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(currentUser.studentProfile?.branch || 'Computer Science and Engineering (CSE)');
  const [year, setYear] = useState(currentUser.studentProfile?.year || '2nd Year');
  const [semester, setSemester] = useState(currentUser.studentProfile?.semester || 'Semester 3');
  const [prefLang, setPrefLang] = useState(currentUser.studentProfile?.preferredLanguage || 'English');
  const [learningStyle, setLearningStyle] = useState<any>(currentUser.studentProfile?.learningStyle || 'step-by-step');
  const [difficulty, setDifficulty] = useState<any>(currentUser.studentProfile?.difficulty || 'intermediate');

  // Teacher form state
  const [institution, setInstitution] = useState(currentUser.teacherProfile?.institution || '');
  const [subjectsTaught, setSubjectsTaught] = useState(
    currentUser.teacherProfile?.subjectsTaught?.join(', ') || 'Data Structures and Algorithms, Programming in C'
  );
  const [teacherLang, setTeacherLang] = useState(currentUser.teacherProfile?.preferredLanguage || 'English');

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (isTeacher) {
      await updateProfile({
        teacherProfile: {
          institution,
          subjectsTaught: subjectsTaught.split(',').map((s) => s.trim()),
          preferredLanguage: teacherLang
        }
      });
    } else {
      await updateProfile({
        studentProfile: {
          educationLevel: eduLevel,
          degree,
          branch,
          year,
          semester,
          preferredLanguage: prefLang,
          learningStyle,
          difficulty
        }
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-[#14263D] font-['Manrope']">
              Learning & Curriculum Profile
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {!isTeacher ? (
            /* Student Configuration */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
                <select
                  value={eduLevel}
                  onChange={(e) => {
                    const newLevel = e.target.value as EducationLevel;
                    setEduLevel(newLevel);
                    if (newLevel === 'class12') {
                      setDegree('Class 12');
                      setBranch('Science (PCM)');
                      setYear('12th Grade');
                    } else if (newLevel === 'btech') {
                      setDegree('B.Tech');
                      setBranch('Computer Science and Engineering (CSE)');
                      setYear('2nd Year');
                    } else if (newLevel === 'undergrad') {
                      setDegree('B.Sc Computer Science');
                      setBranch('Computer Science');
                      setYear('2nd Year');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="class12">Level 1: Class 12 (Senior Secondary)</option>
                  <option value="btech">Level 3: B.Tech Engineering (All Branches)</option>
                  <option value="undergrad">Level 2: Undergraduate Degrees (B.Sc / B.Com / BCA)</option>
                  <option value="advanced">Level 4: Advanced / Postgraduate / Gate</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Program</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Stream</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2nd Year, 12th Grade"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (if applicable)</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Semester 3"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation Language</label>
                  <select
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.name.split(' ')[0]}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Preference</label>
                  <select
                    value={learningStyle}
                    onChange={(e: any) => setLearningStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="step-by-step">Step-by-Step Derivation</option>
                    <option value="example-heavy">Example-Heavy</option>
                    <option value="visual">Visual & Intuitive</option>
                    <option value="academic">Academic & Rigorous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Teacher Configuration */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Apex Academy..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subjects Taught (comma separated)
                </label>
                <input
                  type="text"
                  value={subjectsTaught}
                  onChange={(e) => setSubjectsTaught(e.target.value)}
                  placeholder="e.g. Data Structures, Engineering Mathematics, Physics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instruction Language</label>
                <select
                  value={teacherLang}
                  onChange={(e) => setTeacherLang(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Hinglish">Hinglish</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Curriculum Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
