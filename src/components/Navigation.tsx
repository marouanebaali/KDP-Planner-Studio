import React from 'react';
import {
  BookOpen,
  LayoutTemplate,
  Edit3,
  Layers,
  Eye,
  Download,
  FolderOpen,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookCheck,
} from 'lucide-react';
import { PlannerProject, KdpValidationReport } from '../types/planner';
import { calculateSpineWidthInches } from '../utils/kdpCalculator';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  project: PlannerProject;
  validationReport: KdpValidationReport;
  onNewPlanner: () => void;
  onOpenExport: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  project,
  validationReport,
  onNewPlanner,
  onOpenExport,
}) => {
  const spineWidth = calculateSpineWidthInches(project.pages.length, project.paperType);

  const getStatusBadge = () => {
    if (validationReport.overallStatus === 'PASS') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          KDP Ready
        </span>
      );
    }
    if (validationReport.overallStatus === 'WARNING') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Needs Review
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        Preflight Issue
      </span>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'pages', label: 'Page Designer', icon: Edit3 },
    { id: 'cover', label: 'Cover Designer', icon: Layers },
    { id: 'preview', label: 'Book Preview', icon: Eye },
    { id: 'export', label: 'KDP Export & Preflight', icon: BookCheck },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'projects', label: 'Saved Projects', icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-xl">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  KDP Planner Studio
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Paperback POD
                </span>
              </div>
              <p className="text-xs text-slate-400">Amazon Print-on-Demand Book Publishing Engine</p>
            </div>
          </div>

          {/* Active Book Info Pill */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs">
              <span className="text-slate-400">Active Book: </span>
              <span className="font-semibold text-slate-200 max-w-[180px] truncate inline-block align-bottom">
                {project.title}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-xs text-slate-300 font-mono">
              {project.trimSize.toUpperCase()} • {project.pages.length}p • Spine: {spineWidth.toFixed(3)}"
            </div>
            <div className="h-4 w-px bg-slate-700" />
            {getStatusBadge()}
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewPlanner}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Create a new planner from scratch or AI wizard"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">New Planner</span>
            </button>
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export for KDP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
