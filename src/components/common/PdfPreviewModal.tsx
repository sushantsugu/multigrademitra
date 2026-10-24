import React from 'react';
import { SavedResource } from '../../types';
import { MarkdownContent } from './MarkdownContent';
import { X, Download, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface PdfPreviewModalProps {
  resource: SavedResource | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: (res: SavedResource) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  resource,
  isOpen,
  onClose,
  onDownloadPdf
}) => {
  if (!isOpen || !resource) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                {resource.resourceType.replace('_', ' ')}
              </span>
              <h3 className="text-sm font-bold text-slate-800 font-['Manrope'] truncate max-w-md">
                {resource.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => onDownloadPdf(resource)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Simulation Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#F6F8FC]">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-12 space-y-6">
            {/* MultiGrade Mitra Paper Header */}
            <div className="p-4 bg-[#14263D] text-white rounded-lg flex items-center justify-between">
              <div>
                <p className="font-extrabold text-base tracking-tight font-['Manrope']">MultiGrade Mitra</p>
                <p className="text-[10px] text-amber-300">From Classroom to Campus — Learn Smarter with AI</p>
              </div>
              <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">
                {resource.resourceType.replace('_', ' ')}
              </span>
            </div>

            {/* Metadata Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-bold text-slate-500">SUBJECT: </span>
                {resource.subject}
              </div>
              <div>
                <span className="font-bold text-slate-500">LEVEL: </span>
                {resource.educationLevel.toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-500">TOPIC: </span>
                {resource.topic}
              </div>
              <div>
                <span className="font-bold text-slate-500">DATE: </span>
                {new Date(resource.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-[#14263D] font-['Manrope'] border-b border-indigo-200 pb-2">
              {resource.title}
            </h1>

            {/* Formatted Content */}
            <MarkdownContent content={resource.content} className="space-y-4 text-sm" />

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>MultiGrade Mitra — Verified Academic Material</span>
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
