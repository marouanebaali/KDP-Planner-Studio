import React, { useRef } from 'react';
import {
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Calendar,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PlannerProject } from '../types/planner';
import { exportProjectToJson, saveProject } from '../utils/storage';
import { calculateSpineWidthInches } from '../utils/kdpCalculator';

interface SavedProjectsProps {
  projects: PlannerProject[];
  activeProjectId: string;
  onSelectProject: (project: PlannerProject) => void;
  onDuplicateProject: (project: PlannerProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewPlanner: () => void;
  onRefreshProjects: () => void;
}

export const SavedProjects: React.FC<SavedProjectsProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onDuplicateProject,
  onDeleteProject,
  onNewPlanner,
  onRefreshProjects,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.pages && parsed.trimSize) {
          // Generate fresh ID to prevent collision
          const imported: PlannerProject = {
            ...parsed,
            id: `project_${Date.now()}_imported`,
            name: `${parsed.name || parsed.title} (Imported)`,
            updatedAt: new Date().toISOString(),
          };
          saveProject(imported);
          onRefreshProjects();
          onSelectProject(imported);
        } else {
          alert('Invalid KDP Planner project file format.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FolderOpen className="w-4 h-4" />
            Project Archive
          </div>
          <h2 className="text-2xl font-extrabold text-white">Your Saved KDP Planners</h2>
          <p className="text-xs text-slate-400 mt-1">
            All designs are persistently stored locally. You can export JSON backups or restore previous projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <button
            onClick={onNewPlanner}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Planner</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          const spineWidth = calculateSpineWidthInches(p.pages.length, p.paperType);

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {p.category}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active In Studio
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white truncate">{p.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{p.subtitle || 'Custom Guided Planner'}</p>

                <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-xl bg-slate-800/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trim</span>
                    <span className="font-bold text-slate-200">{p.trimSize}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pages</span>
                    <span className="font-bold text-slate-200">{p.pages.length}p</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Spine</span>
                    <span className="font-bold text-amber-400 font-mono">{spineWidth.toFixed(3)}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Modified: {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDuplicateProject(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Duplicate Project"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportProjectToJson(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Export JSON Backup"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                        onDeleteProject(p.id);
                      }
                    }}
                    disabled={projects.length <= 1}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectProject(p)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <span>{isActive ? 'Editing Now' : 'Open'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
