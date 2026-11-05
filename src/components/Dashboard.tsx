import React from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  Edit3,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Printer,
  Calendar,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { PlannerProject, PlannerCategory, KdpValidationReport } from '../types/planner';
import { TRIM_PRESETS, calculateSpineWidthInches } from '../utils/kdpCalculator';

interface DashboardProps {
  project: PlannerProject;
  projects: PlannerProject[];
  validationReport: KdpValidationReport;
  onNavigate: (tab: string) => void;
  onNewPlanner: (category?: PlannerCategory) => void;
  onSelectProject: (project: PlannerProject) => void;
  onDuplicateProject: (project: PlannerProject) => void;
  onExport: () => void;
}

const CATEGORY_CARDS: {
  category: PlannerCategory;
  desc: string;
  recommendedTrim: string;
  iconBg: string;
}[] = [
  {
    category: 'Weekly Planner',
    desc: 'Structured 52-week action plan, weekly goals, habit tracks & review spreads.',
    recommendedTrim: '6x9 or 7x10',
    iconBg: 'from-blue-500 to-indigo-600',
  },
  {
    category: 'Daily Planner',
    desc: 'Hourly schedules (6am-9pm), top 3 priorities, task checklist & reflection.',
    recommendedTrim: '6x9 or 8x10',
    iconBg: 'from-amber-500 to-orange-600',
  },
  {
    category: 'Meal Planner',
    desc: 'Weekly menu planning, categorized grocery lists, pantry audit & recipe index.',
    recommendedTrim: '7x10 or 8.5x11',
    iconBg: 'from-emerald-500 to-teal-600',
  },
  {
    category: 'ADHD Productivity Planner',
    desc: 'Dopamine-friendly micro-steps, visual brain dump, Pomodoro logs & low-overwhelm grids.',
    recommendedTrim: '7x10 or 8.5x11',
    iconBg: 'from-purple-500 to-pink-600',
  },
  {
    category: 'Budget Planner',
    desc: 'Monthly cash flow, 50/30/20 budget framework, debt payoff tracker & daily expense logs.',
    recommendedTrim: '8x10 or 8.5x11',
    iconBg: 'from-emerald-600 to-green-700',
  },
  {
    category: 'Fitness Planner',
    desc: 'Strength exercise logs, sets x reps tables, cardio metrics, body measurement charts.',
    recommendedTrim: '6x9 or 7x10',
    iconBg: 'from-rose-500 to-red-600',
  },
  {
    category: 'Gratitude Journal',
    desc: 'Daily prompts, 3 thankful items, morning affirmations & evening unwinding reflections.',
    recommendedTrim: '6x9',
    iconBg: 'from-amber-400 to-yellow-600',
  },
  {
    category: 'Reading Journal',
    desc: 'Book review spreads, reading goal trackers, favorite quotes & annual bookshelf index.',
    recommendedTrim: '6x9 or 7x10',
    iconBg: 'from-cyan-500 to-blue-600',
  },
  {
    category: 'Business Planner',
    desc: 'Quarterly OKRs, revenue targets, marketing campaign planner & client meeting logs.',
    recommendedTrim: '8.5x11',
    iconBg: 'from-slate-700 to-slate-900',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  project,
  projects,
  validationReport,
  onNavigate,
  onNewPlanner,
  onSelectProject,
  onDuplicateProject,
  onExport,
}) => {
  const trim = TRIM_PRESETS[project.trimSize];
  const spineWidth = calculateSpineWidthInches(project.pages.length, project.paperType);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Amazon KDP Paperback Publishing Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Design & Publish Retail-Quality Planners on Amazon KDP
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Generate vector-sharp interior pages, automatic spine calculations, barcode-safe paperback covers, and accurate calendar spreads. 100% compliant with physical print-on-demand specifications.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNewPlanner()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Planner with AI</span>
            </button>
            <button
              onClick={() => onNavigate('pages')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Interior Pages ({project.pages.length}p)</span>
            </button>
            <button
              onClick={() => onNavigate('cover')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Design Paperback Cover</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export KDP Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Book Snapshot & KDP Print Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Project Card */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex flex-col items-center justify-center p-1 text-center shadow-inner">
                  <span className="text-[10px] text-amber-400 font-bold leading-tight">
                    {project.trimSize}
                  </span>
                  <span className="text-[9px] text-slate-400">{project.pages.length}p</span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Active Project
                  </span>
                  <h3 className="text-lg font-bold text-white truncate max-w-md">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {project.category} • Author: {project.author} • Year: {project.year}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    validationReport.overallStatus === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {validationReport.overallStatus === 'PASS' ? '100% KDP Compliant' : 'Needs Review'}
                </span>
              </div>
            </div>

            {/* Spec Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Trim Size</span>
                <p className="text-base font-bold text-white mt-0.5">{trim.label.split(' ')[0]}</p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {trim.widthInches}" x {trim.heightInches}"
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Total Pages</span>
                <p className="text-base font-bold text-white mt-0.5">{project.pages.length} Pages</p>
                <span className="text-[10px] text-slate-400">
                  {project.isDoubleSided ? 'Double-Sided' : 'Single-Sided'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Spine Width</span>
                <p className="text-base font-bold text-amber-300 mt-0.5">
                  {spineWidth.toFixed(4)}"
                </p>
                <span className="text-[10px] text-slate-400">
                  {(spineWidth * 25.4).toFixed(2)} mm • {project.paperType} paper
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Inside Gutter</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {validationReport.gutterMarginInches}"
                </p>
                <span className="text-[10px] text-slate-400">
                  {(validationReport.gutterMarginInches * 72).toFixed(0)} pt binding safety
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Last saved: {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDuplicateProject(project)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Duplicate
              </button>
              <button
                onClick={() => onNavigate('preview')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
              >
                Open Flipbook Preview →
              </button>
            </div>
          </div>
        </div>

        {/* Amazon KDP Physical Print Source of Truth Rules Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-900/40 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Printer className="w-4 h-4" />
              Amazon KDP Paperback Specifications
            </div>
            <h4 className="text-base font-bold text-white mt-1">Physical Print Standards</h4>

            <ul className="mt-4 space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gutter Margins:</strong> 0.375" for 24-150p; 0.500" for 151-300p; 0.625" for 301-500p.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Outer Margins:</strong> Minimum 0.25" without bleed, or 0.375" with bleed to prevent cutting text.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Spine Text Threshold:</strong> Amazon KDP strictly forbids spine text when book has under <strong>79 pages</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Barcode Clear Zone:</strong> 2.0" x 1.2" rectangle on lower back cover must remain clear of text.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onExport}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Run Automated Preflight Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Planner Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Select a Planner Category to Generate</h2>
            <p className="text-xs text-slate-400">
              Each template generates authentic, non-repetitive page layouts ready for KDP printing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('templates')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Browse all 19 categories →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_CARDS.map((item) => (
            <div
              key={item.category}
              className="group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.iconBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  >
                    {item.category.charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.recommendedTrim}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition">
                  {item.category}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Standard 50–120p</span>
                <button
                  onClick={() => onNewPlanner(item.category)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <span>Build with AI</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Row */}
      {projects.length > 1 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Saved Planner Projects ({projects.length})
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Manage all projects →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  p.id === project.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{p.category}</span>
                    <span className="font-mono">{p.trimSize}</span>
                  </div>
                  <h4 className="font-bold text-sm truncate text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{p.pages.length} Pages</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  <span className="text-amber-400 font-semibold">Open →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
