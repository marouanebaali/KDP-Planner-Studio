import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Layers,
  Eye,
  Sliders,
} from 'lucide-react';
import { PlannerProject, PlannerPage } from '../types/planner';
import { TRIM_PRESETS, calculateInteriorDimensions } from '../utils/kdpCalculator';

interface BookPreviewerProps {
  project: PlannerProject;
  onNavigateToEditor: (pageIndex: number) => void;
}

export const BookPreviewer: React.FC<BookPreviewerProps> = ({
  project,
  onNavigateToEditor,
}) => {
  // View mode: 'cover_front' | 'spread' | 'cover_back'
  const [viewMode, setViewMode] = useState<'cover_front' | 'spread' | 'cover_back'>('spread');
  // Left page index for two-page spread (even page numbers are left: 2, 4, 6...)
  // We represent left page 0-indexed: index 1 is page 2 (left), index 2 is page 3 (right).
  const [leftPageIndex, setLeftPageIndex] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showMargins, setShowMargins] = useState<boolean>(false);

  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidthInches = project.customDimensions?.width || trim.widthInches;
  const trimHeightInches = project.customDimensions?.height || trim.heightInches;
  const pages = project.pages;
  const totalPages = pages.length;

  const leftPage: PlannerPage | undefined = pages[leftPageIndex];
  const rightPage: PlannerPage | undefined = pages[leftPageIndex + 1];

  const handlePrevSpread = () => {
    if (viewMode === 'cover_back') {
      setViewMode('spread');
      setLeftPageIndex(Math.max(1, totalPages - (totalPages % 2 === 0 ? 1 : 2)));
      return;
    }
    if (viewMode === 'spread') {
      if (leftPageIndex <= 1) {
        setViewMode('cover_front');
      } else {
        setLeftPageIndex((prev) => Math.max(1, prev - 2));
      }
    }
  };

  const handleNextSpread = () => {
    if (viewMode === 'cover_front') {
      setViewMode('spread');
      setLeftPageIndex(1);
      return;
    }
    if (viewMode === 'spread') {
      if (leftPageIndex + 2 >= totalPages) {
        setViewMode('cover_back');
      } else {
        setLeftPageIndex((prev) => prev + 2);
      }
    }
  };

  // Render Page Content Box
  const renderSinglePage = (page: PlannerPage | undefined, isEven: boolean) => {
    if (!page) {
      return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs italic">
          [Blank End Page]
        </div>
      );
    }

    const dims = calculateInteriorDimensions({
      trimWidthInches,
      trimHeightInches,
      hasBleed: project.hasBleed,
      pageCount: totalPages,
      isEvenPage: isEven,
    });

    return (
      <div className="relative w-full h-full bg-white text-slate-900 select-none overflow-hidden flex flex-col justify-between">
        {/* Margin Guide Overlays */}
        {showMargins && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              style={{
                left: `${(dims.marginLeftPt / dims.pageTotalWidthPt) * 100}%`,
                right: `${(dims.marginRightPt / dims.pageTotalWidthPt) * 100}%`,
                top: `${(dims.marginTopPt / dims.pageTotalHeightPt) * 100}%`,
                bottom: `${(dims.marginBottomPt / dims.pageTotalHeightPt) * 100}%`,
              }}
              className="absolute border border-emerald-500/50 bg-emerald-500/[0.03]"
            />
          </div>
        )}

        {/* Printable Elements */}
        <div
          style={{
            paddingLeft: `${(dims.marginLeftPt / dims.pageTotalWidthPt) * 100}%`,
            paddingRight: `${(dims.marginRightPt / dims.pageTotalWidthPt) * 100}%`,
            paddingTop: `${(dims.marginTopPt / dims.pageTotalHeightPt) * 100}%`,
            paddingBottom: `${(dims.marginBottomPt / dims.pageTotalHeightPt) * 100}%`,
          }}
          className="relative w-full h-full"
        >
          {page.elements.map((el) => (
            <div
              key={el.id}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
              }}
              className="absolute p-0.5"
            >
              {el.type === 'header' && (
                <div>
                  <h4
                    style={{ textAlign: el.textAlign || 'left' }}
                    className="font-bold text-xs text-slate-900 leading-tight"
                  >
                    {el.title}
                  </h4>
                  {el.text && <p className="text-[8px] text-slate-500 italic">{el.text}</p>}
                  <div className="h-px w-full bg-slate-300 mt-0.5" />
                </div>
              )}

              {el.type === 'lines' && (
                <div className="h-full flex flex-col justify-between">
                  {el.title && <span className="text-[8px] font-bold">{el.title}</span>}
                  <div className="flex-1 flex flex-col justify-evenly">
                    {Array.from({ length: el.rowCount || 5 }).map((_, rIdx) => (
                      <div key={rIdx} className="h-px bg-slate-300 w-full" />
                    ))}
                  </div>
                </div>
              )}

              {el.type === 'checklist' && (
                <div className="h-full flex flex-col justify-between">
                  {el.title && <span className="text-[8px] font-bold">{el.title}</span>}
                  <div className="flex-1 flex flex-col justify-evenly">
                    {(el.items || ['Task 1', 'Task 2']).map((it, i) => (
                      <div key={i} className="flex items-center gap-1 text-[8px]">
                        <div className="w-2 h-2 rounded-xs border border-slate-600 shrink-0" />
                        <span className="truncate">{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {el.type === 'table' && (
                <div className="h-full flex flex-col border border-slate-400 text-[7px]">
                  <div className="flex bg-slate-100 font-bold border-b border-slate-300">
                    {(el.headers || ['Col 1', 'Col 2']).map((h, i) => (
                      <div key={i} className="flex-1 p-0.5 border-r last:border-r-0 truncate">
                        {h}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 flex flex-col justify-evenly">
                    {Array.from({ length: el.rowCount || 3 }).map((_, r) => (
                      <div key={r} className="flex flex-1 border-b last:border-b-0 border-slate-200" />
                    ))}
                  </div>
                </div>
              )}

              {el.type === 'habit_matrix' && (
                <div className="h-full border border-slate-300 p-0.5 flex flex-col justify-between">
                  <span className="text-[7px] font-bold">{el.title || 'Habit Tracker'}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 14 }).map((_, d) => (
                      <div key={d} className="flex-1 h-2.5 border border-slate-300 text-[5px] text-center">
                        {d + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {el.type === 'dot_grid' && (
                <div className="w-full h-full flex flex-wrap gap-1.5 p-1 overflow-hidden opacity-60">
                  {Array.from({ length: 40 }).map((_, dot) => (
                    <div key={dot} className="w-0.5 h-0.5 rounded-full bg-slate-500" />
                  ))}
                </div>
              )}

              {el.type === 'box' && (
                <div className="w-full h-full border border-slate-800 p-1">
                  {el.title && <span className="text-[7px] font-bold">{el.title}</span>}
                </div>
              )}

              {el.type === 'quote' && (
                <p className="text-[7px] italic text-slate-500 text-center">{el.text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Page Number */}
        <div
          className={`absolute bottom-2 text-[8px] font-mono text-slate-500 ${
            isEven ? 'left-4' : 'right-4'
          }`}
        >
          {page.pageNumber}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Preview Controls Bar */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm text-white">{project.title}</h3>
            <p className="text-xs text-slate-400">
              Interactive 2-Page Paperback Spread Simulator • {project.trimSize.toUpperCase()} ({project.pages.length} Pages)
            </p>
          </div>
        </div>

        {/* Spread Navigation Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('cover_front')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cover_front' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Front Cover
            </button>
            <button
              onClick={() => {
                setViewMode('spread');
                setLeftPageIndex(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'spread' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Interior Spreads
            </button>
            <button
              onClick={() => setViewMode('cover_back')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cover_back' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Back Cover
            </button>
          </div>

          <button
            onClick={() => setShowMargins(!showMargins)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showMargins
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>KDP Safe Margins</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:text-white text-slate-400"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
              className="p-1 hover:text-white text-slate-400"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Flipbook Stage */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative bg-slate-950">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrevSpread}
          className="absolute left-6 z-30 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 shadow-xl flex items-center justify-center transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Book Container with 3D drop-shadow and realistic spine fold */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transition: 'transform 0.15s ease-out',
          }}
          className="relative flex items-center justify-center shadow-[0_30px_70px_rgba(0,0,0,0.85)] rounded-lg"
        >
          {/* FRONT COVER VIEW */}
          {viewMode === 'cover_front' && (
            <div
              style={{
                width: '420px',
                height: `${(trimHeightInches / trimWidthInches) * 420}px`,
                backgroundColor: project.cover.primaryColor,
                color: project.cover.textColor,
              }}
              className="relative rounded-r-lg shadow-2xl p-8 flex flex-col justify-between border-l-8 border-slate-950"
            >
              <div
                style={{ borderColor: project.cover.accentColor }}
                className="absolute inset-6 border-2 border-dashed pointer-events-none rounded-xs opacity-70"
              />
              <div className="text-center pt-8">
                <span
                  style={{ color: project.cover.accentColor }}
                  className="text-xs font-black tracking-widest uppercase"
                >
                  {project.year} ANNUAL EDITION
                </span>
              </div>
              <div className="text-center space-y-4 px-4 z-10">
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  {project.cover.title || project.title}
                </h1>
                {project.cover.subtitle && (
                  <p
                    style={{ color: project.cover.accentColor }}
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    {project.cover.subtitle}
                  </p>
                )}
              </div>
              <div className="text-center pb-8 z-10">
                <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
                  {project.cover.author || project.author}
                </span>
              </div>
            </div>
          )}

          {/* BACK COVER VIEW */}
          {viewMode === 'cover_back' && (
            <div
              style={{
                width: '420px',
                height: `${(trimHeightInches / trimWidthInches) * 420}px`,
                backgroundColor: project.cover.primaryColor,
                color: project.cover.textColor,
              }}
              className="relative rounded-l-lg shadow-2xl p-8 flex flex-col justify-between border-r-8 border-slate-950"
            >
              <div className="space-y-4 max-w-[280px]">
                <h4
                  style={{ color: project.cover.accentColor }}
                  className="text-xs font-black uppercase tracking-wider"
                >
                  ABOUT THIS PLANNER
                </h4>
                <p className="text-xs leading-relaxed opacity-90">{project.cover.backCoverBlurb}</p>
              </div>

              {/* Barcode area */}
              <div className="w-36 h-22 rounded bg-white text-slate-900 border border-slate-300 p-2 flex flex-col items-center justify-center self-end">
                <span className="text-[8px] font-bold text-slate-600">AMAZON KDP BARCODE</span>
                <div className="flex gap-0.5 my-1.5 h-6">
                  {Array.from({ length: 28 }).map((_, b) => (
                    <div key={b} className="h-full w-1 bg-slate-900" />
                  ))}
                </div>
                <span className="text-[7px] font-mono text-slate-500">2.0" x 1.2" Reserved</span>
              </div>
            </div>
          )}

          {/* TWO-PAGE SPREAD VIEW (Left Even Page + Right Odd Page) */}
          {viewMode === 'spread' && (
            <div className="flex rounded-md overflow-hidden bg-slate-100 shadow-2xl">
              {/* Left Page (Even) */}
              <div
                style={{
                  width: '380px',
                  height: `${(trimHeightInches / trimWidthInches) * 380}px`,
                }}
                className="relative border-r border-slate-300"
              >
                {renderSinglePage(leftPage, true)}
                {/* Center gutter fold gradient shadow on left page */}
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Spine Crease Center Divider */}
              <div className="w-1.5 bg-slate-400 shadow-inner" />

              {/* Right Page (Odd) */}
              <div
                style={{
                  width: '380px',
                  height: `${(trimHeightInches / trimWidthInches) * 380}px`,
                }}
                className="relative"
              >
                {renderSinglePage(rightPage, false)}
                {/* Center gutter fold gradient shadow on right page */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNextSpread}
          className="absolute right-6 z-30 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 shadow-xl flex items-center justify-center transition cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Page Scrubbing Footer */}
      <div className="h-14 border-t border-slate-800 px-6 flex items-center justify-between bg-slate-900/90">
        <div className="text-xs text-slate-400 font-mono">
          {viewMode === 'cover_front' && 'Front Cover View'}
          {viewMode === 'cover_back' && 'Back Cover View'}
          {viewMode === 'spread' && `Spread: Page ${leftPage?.pageNumber || ''} & ${rightPage?.pageNumber || ''} of ${totalPages}`}
        </div>

        {/* Spread jumper slider */}
        {viewMode === 'spread' && (
          <div className="flex items-center gap-3 w-72">
            <span className="text-xs text-slate-400">p.1</span>
            <input
              type="range"
              min="1"
              max={totalPages - 1}
              step="2"
              value={leftPageIndex}
              onChange={(e) => setLeftPageIndex(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400">p.{totalPages}</span>
          </div>
        )}

        {viewMode === 'spread' && leftPage && (
          <button
            onClick={() => onNavigateToEditor(leftPageIndex)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Edit this Spread in Page Designer →
          </button>
        )}
      </div>
    </div>
  );
};
