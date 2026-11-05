import React from 'react';
import {
  Layers,
  Palette,
  Eye,
  Type,
  ShieldCheck,
  AlertTriangle,
  Info,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { PlannerProject, CoverTheme, CoverPattern, CoverConfig } from '../types/planner';
import {
  TRIM_PRESETS,
  calculateSpineWidthInches,
  isSpineTextAllowed,
  calculateCoverDimensions,
} from '../utils/kdpCalculator';
import { COVER_PRESETS } from '../data/defaultTemplates';

interface CoverDesignerProps {
  project: PlannerProject;
  onUpdateProject: (updated: PlannerProject) => void;
}

const THEME_OPTIONS: { id: CoverTheme; label: string; desc: string }[] = [
  { id: 'luxury', label: 'Luxury Navy & Gold', desc: 'Midnight navy with gold typography & geometric accent.' },
  { id: 'botanical', label: 'Botanical Emerald', desc: 'Forest green, sage highlights & organic botanical motif.' },
  { id: 'minimalist', label: 'Minimalist Slate', desc: 'Clean, understated charcoal with high-legibility type.' },
  { id: 'modern', label: 'Modern Indigo', desc: 'Electric indigo with crisp modern sans-serif typography.' },
  { id: 'floral', label: 'Floral Berry', desc: 'Rich plum and delicate pastel rose accents.' },
  { id: 'abstract', label: 'Abstract Terracotta', desc: 'Warm earth, clay, and minimalist stone tones.' },
  { id: 'vintage', label: 'Vintage Leather', desc: 'Classic cognac brown with timeless embossed elegance.' },
  { id: 'business', label: 'Business Executive', desc: 'Corporate deep navy with clean sky-blue rules.' },
  { id: 'seasonal', label: 'Warm Harvest Amber', desc: 'Golden amber and rustic bronze palette.' },
];

const PATTERN_OPTIONS: { id: CoverPattern; label: string }[] = [
  { id: 'none', label: 'Solid Clean' },
  { id: 'art_deco', label: 'Art Deco Frame' },
  { id: 'geometric', label: 'Geometric Lines' },
  { id: 'leaves', label: 'Botanical Foliage' },
  { id: 'dots', label: 'Faint Stipple Dots' },
  { id: 'grid', label: 'Architectural Grid' },
  { id: 'stripes', label: 'Pinstripe' },
  { id: 'stars', label: 'Constellation Stars' },
  { id: 'marble', label: 'Fine Texture' },
];

export const CoverDesigner: React.FC<CoverDesignerProps> = ({ project, onUpdateProject }) => {
  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidthInches = project.customDimensions?.width || trim.widthInches;
  const trimHeightInches = project.customDimensions?.height || trim.heightInches;
  const pageCount = project.pages.length || project.pageCount;

  const spineWidth = calculateSpineWidthInches(pageCount, project.paperType);
  const spineAllowed = isSpineTextAllowed(pageCount);

  const coverDims = calculateCoverDimensions({
    trimWidthInches,
    trimHeightInches,
    pageCount,
    paperType: project.paperType,
  });

  const cover = project.cover;

  const handleUpdateCover = (updates: Partial<CoverConfig>) => {
    onUpdateProject({
      ...project,
      cover: {
        ...project.cover,
        ...updates,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectTheme = (themeId: CoverTheme) => {
    const preset = COVER_PRESETS[themeId] || {};
    handleUpdateCover({
      theme: themeId,
      ...preset,
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. LEFT WORKSPACE: Live Full Spread Wrap Preview */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Top Spec Banner */}
        <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400">
              Paperback Spread Wrap ({coverDims.totalWidthInches.toFixed(3)}" x {coverDims.totalHeightInches.toFixed(3)}")
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Spine: {spineWidth.toFixed(4)}" ({(spineWidth * 25.4).toFixed(2)} mm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateCover({ showSpineGuides: !cover.showSpineGuides })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                cover.showSpineGuides ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Spine Folds
            </button>
            <button
              onClick={() => handleUpdateCover({ showBarcodeGuide: !cover.showBarcodeGuide })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                cover.showBarcodeGuide ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Barcode Zone
            </button>
            <button
              onClick={() => handleUpdateCover({ showBleedGuides: !cover.showBleedGuides })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                cover.showBleedGuides ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              0.125" Bleed
            </button>
          </div>
        </div>

        {/* Live Visual Paperback Spread Preview */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-950">
          <div
            style={{
              width: '820px',
              height: `${(coverDims.totalHeightInches / coverDims.totalWidthInches) * 820}px`,
              backgroundColor: cover.primaryColor,
              color: cover.textColor,
            }}
            className="relative rounded-sm shadow-2xl transition-all duration-150 flex overflow-hidden border border-slate-700 select-none"
          >
            {/* 0.125" Bleed Boundary Guide */}
            {cover.showBleedGuides && (
              <div className="absolute inset-2 border border-rose-500/40 border-dashed pointer-events-none z-30">
                <span className="absolute top-1 left-2 text-[8px] font-mono text-rose-400">
                  Cut Line (0.125" Bleed)
                </span>
              </div>
            )}

            {/* BACK COVER (Left Section) */}
            <div
              style={{
                width: `${(trimWidthInches / coverDims.totalWidthInches) * 100}%`,
              }}
              className="h-full relative p-8 flex flex-col justify-between border-r border-slate-800/40"
            >
              {/* Back Blurb Content */}
              <div className="space-y-4 max-w-[280px]">
                <h4
                  style={{ color: cover.accentColor }}
                  className="text-xs font-black uppercase tracking-wider"
                >
                  ABOUT THIS PLANNER
                </h4>
                <p className="text-[11px] leading-relaxed opacity-90">{cover.backCoverBlurb}</p>

                {cover.backCoverQuotes.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-[10px] italic opacity-75">{cover.backCoverQuotes[0]}</p>
                  </div>
                )}
              </div>

              {/* Amazon KDP Barcode Reserved Area (Bottom Right of Back Cover) */}
              <div
                className={`w-36 h-22 rounded bg-white text-slate-900 border border-slate-300 shadow-md p-2 flex flex-col items-center justify-center text-center self-end ${
                  cover.showBarcodeGuide ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <span className="text-[8px] font-bold tracking-tight text-slate-600">
                  AMAZON KDP BARCODE
                </span>
                <div className="flex gap-0.5 my-1.5 h-6 items-center">
                  {Array.from({ length: 28 }).map((_, b) => (
                    <div
                      key={b}
                      className="h-full bg-slate-900"
                      style={{ width: b % 3 === 0 ? '2px' : '1px' }}
                    />
                  ))}
                </div>
                <span className="text-[7px] font-mono text-slate-500">2.0" x 1.2" Reserved</span>
              </div>
            </div>

            {/* SPINE (Center Section) */}
            <div
              style={{
                width: `${(coverDims.spineWidthInches / coverDims.totalWidthInches) * 100}%`,
                backgroundColor: cover.secondaryColor,
              }}
              className="h-full relative flex items-center justify-center border-x border-black/30"
            >
              {/* Spine Fold Lines */}
              {cover.showSpineGuides && (
                <>
                  <div className="absolute inset-y-0 left-0 w-px bg-amber-400/50 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-px bg-amber-400/50 pointer-events-none" />
                </>
              )}

              {/* Rotated Spine Title */}
              {spineAllowed && cover.spineText ? (
                <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold tracking-widest uppercase">
                  {cover.spineText}
                </div>
              ) : (
                <div className="transform -rotate-90 whitespace-nowrap text-[8px] text-slate-400 font-mono">
                  {pageCount < 79 ? '<79p (No Spine Text)' : ''}
                </div>
              )}
            </div>

            {/* FRONT COVER (Right Section) */}
            <div
              style={{
                width: `${(trimWidthInches / coverDims.totalWidthInches) * 100}%`,
              }}
              className="h-full relative p-8 flex flex-col justify-between"
            >
              {/* Outer Decorative Frame */}
              <div
                style={{ borderColor: cover.accentColor }}
                className="absolute inset-6 border-2 border-dashed pointer-events-none rounded-xs opacity-70"
              />

              {/* Top Year / Badge */}
              <div className="text-center pt-6">
                <span
                  style={{ color: cover.accentColor }}
                  className="text-xs font-black tracking-widest uppercase"
                >
                  {project.year} ANNUAL EDITION
                </span>
              </div>

              {/* Main Front Title */}
              <div className="text-center space-y-3 z-10 px-4">
                <h1
                  style={{ color: cover.textColor }}
                  className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight"
                >
                  {cover.title || project.title}
                </h1>
                {cover.subtitle && (
                  <p
                    style={{ color: cover.accentColor }}
                    className="text-xs font-medium tracking-wide uppercase max-w-xs mx-auto"
                  >
                    {cover.subtitle}
                  </p>
                )}
              </div>

              {/* Bottom Author */}
              <div className="text-center pb-6 z-10">
                <span className="text-[11px] font-medium tracking-wider uppercase opacity-90">
                  {cover.author || project.author}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SIDEBAR: Cover Customization Controls */}
      <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-6">
        {/* Amazon KDP Spine Alert */}
        <div
          className={`p-3.5 rounded-xl border text-xs ${
            spineAllowed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {spineAllowed ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>Spine Width: {spineWidth.toFixed(4)}"</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {spineAllowed
              ? `Book has ${pageCount} pages. Spine text is permitted and will be printed.`
              : `Book has ${pageCount} pages. Amazon KDP strictly forbids spine text under 79 pages.`}
          </p>
        </div>

        {/* Theme Presets */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Cover Themes
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {THEME_OPTIONS.map((th) => (
              <button
                key={th.id}
                onClick={() => handleSelectTheme(th.id)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  cover.theme === th.id
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{th.label}</span>
                  {cover.theme === th.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{th.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Customization */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Color Palette
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cover.primaryColor}
                  onChange={(e) => handleUpdateCover({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={cover.primaryColor}
                  onChange={(e) => handleUpdateCover({ primaryColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Spine Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cover.secondaryColor}
                  onChange={(e) => handleUpdateCover({ secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={cover.secondaryColor}
                  onChange={(e) => handleUpdateCover({ secondaryColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cover.textColor}
                  onChange={(e) => handleUpdateCover({ textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={cover.textColor}
                  onChange={(e) => handleUpdateCover({ textColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Accent Gold</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cover.accentColor}
                  onChange={(e) => handleUpdateCover({ accentColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={cover.accentColor}
                  onChange={(e) => handleUpdateCover({ accentColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Text Editor */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cover Typography
          </h4>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Book Title (Front)</label>
            <input
              type="text"
              value={cover.title}
              onChange={(e) => handleUpdateCover({ title: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Subtitle</label>
            <input
              type="text"
              value={cover.subtitle}
              onChange={(e) => handleUpdateCover({ subtitle: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Author Name</label>
            <input
              type="text"
              value={cover.author}
              onChange={(e) => handleUpdateCover({ author: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Spine Title {pageCount < 79 && '(Disabled: <79 Pages)'}
            </label>
            <input
              type="text"
              disabled={!spineAllowed}
              value={cover.spineText}
              onChange={(e) => handleUpdateCover({ spineText: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white disabled:opacity-40"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Back Cover Blurb</label>
            <textarea
              rows={3}
              value={cover.backCoverBlurb}
              onChange={(e) => handleUpdateCover({ backCoverBlurb: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
