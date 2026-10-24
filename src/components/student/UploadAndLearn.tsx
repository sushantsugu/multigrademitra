import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DocumentAnalysisResult, ResourceType, SavedResource } from '../../types';
import {
  FileUp,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Download,
  Bookmark,
  Edit3,
  Layers,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface UploadAndLearnProps {
  onSavedResource: (resource: SavedResource) => void;
  onDownloadPdf: (data: any) => void;
}

export const UploadAndLearn: React.FC<UploadAndLearnProps> = ({ onSavedResource, onDownloadPdf }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<ResourceType>('notes');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSelectFile = (file: File) => {
    setError(null);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setFilePreview(null);
      setError('Please upload a valid image (JPEG, PNG, WEBP) or PDF document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setFilePreview(null);
      setError('File size exceeds 20MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);
    setEditableContent('');
    setIsSaved(false);
    setFilePreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFilePreview(event.target.result);
      } else {
        setError('Could not read this file. Please select it again.');
      }
    };
    reader.onerror = () => setError('Could not read this file. Please select it again.');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSelectFile(file);
    e.target.value = '';
  };

  const handleProcessDocument = async () => {
    if (!selectedFile || !filePreview) {
      setError('Please select a textbook photograph, lecture note, or document first.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      // Extract base64 part
      const base64Data = filePreview.split(',')[1];

      const res = await fetch('/api/learning/upload-and-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          mimeType: selectedFile.type,
          filename: selectedFile.name,
          outputType,
          educationLevel: currentUser?.studentProfile?.educationLevel || 'btech',
          customInstructions: customInstructions.trim() ? customInstructions : undefined
        })
      });

      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(responseData.error || `Document processing failed (${res.status}).`);
      }
      if (typeof responseData.generatedContent !== 'string' || !responseData.generatedContent.trim()) {
        throw new Error('The analysis response was incomplete. Please try again.');
      }

      const data = responseData as DocumentAnalysisResult;
      setAnalysisResult(data);
      setEditableContent(data.generatedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing document. Ensure the file is clear and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMaterials = async () => {
    if (!analysisResult || !currentUser) return;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: `${analysisResult.identifiedTopic} (${analysisResult.outputType.toUpperCase()})`,
          subject: analysisResult.identifiedSubject,
          topic: analysisResult.identifiedTopic,
          educationLevel: analysisResult.identifiedLevel,
          program: currentUser.studentProfile?.degree,
          branch: currentUser.studentProfile?.branch,
          semester: currentUser.studentProfile?.semester,
          resourceType: analysisResult.outputType,
          content: editableContent,
          metadata: {
            sourceDocument: analysisResult.documentName,
            concepts: analysisResult.extractedConcepts
          }
        })
      });

      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(responseData.error || 'Could not save this material.');
      setIsSaved(true);
      if (onSavedResource) onSavedResource(responseData.resource);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this material.');
      console.error('Failed to save document resource:', err);
    }
  };

  const handleDownloadPDFClick = () => {
    if (!analysisResult) return;
    onDownloadPdf({
      title: `${analysisResult.identifiedTopic} — ${analysisResult.outputType.toUpperCase()}`,
      subject: analysisResult.identifiedSubject,
      topic: analysisResult.identifiedTopic,
      educationLevel: analysisResult.identifiedLevel,
      program: currentUser?.studentProfile?.degree,
      resourceType: analysisResult.outputType,
      content: editableContent
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E8F0] shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">
              Universal Document-to-Learning Workflow
            </h2>
            <p className="text-xs text-[#687386]">
              Upload textbook pages, lecture slides, or scanned notes. Our multimodal AI extracts key concepts and transforms them into notes, formulas, or practice worksheets.
            </p>
          </div>
        </div>

        {/* Step 1: Upload Dropzone */}
        <div className="mt-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) handleSelectFile(file);
              }}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'}`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <FileUp className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Click to upload or drag & drop textbook photo / PDF
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports textbook pages, lecture handouts, handwritten notes (JPG, PNG, PDF up to 20MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={filePreview || undefined}
                    alt="Upload Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for processing</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  setAnalysisResult(null);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Change File
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Step 2: Output Selection */}
        {selectedFile && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-[#14263D] uppercase tracking-wider font-['Manrope']">
              Select Output Learning Material
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'notes', label: 'Detailed Study Notes', desc: 'Theory & breakdowns' },
                { id: 'revision_summary', label: 'Revision Summary', desc: 'Key takeaways' },
                { id: 'formula_sheet', label: 'Formula Sheet', desc: 'Equations & units' },
                { id: 'practice_questions', label: 'Practice Questions', desc: 'Problems & answers' },
                { id: 'quiz', label: 'Diagnostic Quiz', desc: 'Self-assessment' },
                { id: 'worksheet', label: 'Printable Worksheet', desc: 'With write-in lines' },
                { id: 'lesson_plan', label: 'Lesson Plan', desc: 'Pedagogical structure' },
                { id: 'assignment', label: 'Assignment Task', desc: 'Home exercise' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOutputType(opt.id as ResourceType)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    outputType === opt.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Focus / Specific Topics to Highlight (Optional)
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., Emphasize numerical formulas and step-by-step derivation of Theorem 4.2..."
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E8F0] text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleProcessDocument}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reading document and generating material...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process & Generate {outputType.replace('_', ' ')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Workspace */}
      {analysisResult && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E8F0] shadow-xs space-y-6 animate-in fade-in duration-300">
          {/* Document Intelligence Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  Document Processed
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1 font-['Manrope']">
                  Detected Subject: {analysisResult.identifiedSubject} — {analysisResult.identifiedTopic}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Source: {analysisResult.documentName}</span>
            </div>

            {/* Extracted Concepts Pill Tags */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Extracted Key Academic Concepts:</p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.extractedConcepts.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Controls for Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-['Manrope']">
                Editable Generated Study Sheet
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToMaterials}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isSaved ? 'Saved to Library' : 'Save Material'}</span>
              </button>

              <button
                onClick={handleDownloadPDFClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14263D] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Printable PDF</span>
              </button>
            </div>
          </div>

          {/* Markdown Content Editor / Viewer */}
          <div>
            <textarea
              rows={14}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Tip: You can edit or add custom remarks above before downloading or saving to your resource library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
