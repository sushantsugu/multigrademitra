import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SavedResource, ResourceType } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Check,
  X,
  FileCheck,
  Eye,
  Plus
} from 'lucide-react';

interface ResourceLibraryProps {
  onDownloadPdf: (data: any) => void;
  onPreviewResource: (res: SavedResource) => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ onDownloadPdf, onPreviewResource }) => {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Edit modal
  const [editingResource, setEditingResource] = useState<SavedResource | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentUser?.id) params.append('userId', currentUser.id);
      if (filterType !== 'all') params.append('resourceType', filterType);
      if (filterLevel !== 'all') params.append('educationLevel', filterLevel);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [currentUser?.id, filterType, filterLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        setResources(resources.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const handleStartEdit = (res: SavedResource) => {
    setEditingResource(res);
    setEditedTitle(res.title);
    setEditedContent(res.content);
  };

  const handleSaveEdit = async () => {
    if (!editingResource) return;

    try {
      const res = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResources(resources.map((r) => (r.id === editingResource.id ? data.resource : r)));
        setEditingResource(null);
      }
    } catch (err) {
      console.error('Failed to update resource:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#14263D] font-['Manrope']">
              {currentUser?.role === 'teacher' ? 'Teaching Resource Vault' : 'My Saved Learning Materials'}
            </h2>
            <p className="text-xs text-[#687386]">
              Search, edit, preview, and generate clean PDF documents from your saved library.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{resources.length} Saved Items</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, subject..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="notes">Study Notes</option>
              <option value="revision_summary">Revision Summaries</option>
              <option value="formula_sheet">Formula Sheets</option>
              <option value="quiz">Quizzes & Tests</option>
              <option value="worksheet">Worksheets</option>
              <option value="lesson_plan">Lesson Plans</option>
              <option value="multigrade">MultiGrade Guides</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">All Levels</option>
              <option value="class12">Class 12</option>
              <option value="btech">B.Tech Engineering</option>
              <option value="undergrad">Undergrad Degree</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading educational vault...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No saved materials matched your criteria</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Try adjusting your search query or generate new materials from the AI Study Assistant or Lesson Planner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl p-5 border border-[#E4E8F0] shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {res.resourceType.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {res.educationLevel?.toUpperCase()}
                  </span>
                </div>

                <h3
                  onClick={() => onPreviewResource(res)}
                  className="text-xs sm:text-sm font-bold text-[#14263D] hover:text-indigo-600 cursor-pointer font-['Manrope'] line-clamp-2"
                >
                  {res.title}
                </h3>

                <p className="text-xs text-[#687386] line-clamp-3 leading-relaxed">
                  {res.content.replace(/[#*`]/g, '').slice(0, 150)}...
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                  <span>{res.subject}</span>
                  <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPreviewResource(res)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
                    title="Preview full resource"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(res)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
                    title="Edit content"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDownloadPdf(res)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    title="Download Clean Printable PDF"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Content Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-['Manrope']">
                Edit Resource: {editingResource.title}
              </h3>
              <button
                onClick={() => setEditingResource(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Markdown Body</label>
              <textarea
                rows={12}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingResource(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
