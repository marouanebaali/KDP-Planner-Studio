import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  Sliders,
  Sparkles,
  Type,
  ListTodo,
  Table as TableIcon,
  AlignLeft,
  Calendar,
  Grid,
  Square,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  PlannerProject,
  PlannerPage,
  PageElement,
  ElementType,
  PageLayoutType,
} from '../types/planner';
import { TRIM_PRESETS, calculateInteriorDimensions } from '../utils/kdpCalculator';
import {
  createLinedNotesPage,
  createDotGridPage,
  createWeeklySpreadPage,
  createDailyPlannerPage,
  createMealPlannerPage,
  createBudgetTrackerPage,
  createAdhdFocusPage,
  createFitnessLogPage,
  createReadingLogPage,
  createMonthlyCalendarPage,
} from '../data/defaultTemplates';

interface PageDesignerProps {
  project: PlannerProject;
  onUpdateProject: (updated: PlannerProject) => void;
}

export const PageDesigner: React.FC<PageDesignerProps> = ({ project, onUpdateProject }) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showKdpGuides, setShowKdpGuides] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidthInches = project.customDimensions?.width || trim.widthInches;
  const trimHeightInches = project.customDimensions?.height || trim.heightInches;
  const pages = project.pages;

  const currentPage = pages[activePageIndex] || pages[0];
  const isEvenPage = (activePageIndex + 1) % 2 === 0;

  const interiorDims = calculateInteriorDimensions({
    trimWidthInches,
    trimHeightInches,
    hasBleed: project.hasBleed,
    pageCount: pages.length,
    isEvenPage,
  });

  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId) || null;

  // Page Operations
  const handleSelectPage = (index: number) => {
    setActivePageIndex(index);
    setSelectedElementId(null);
  };

  const handleDuplicatePage = () => {
    const copy: PlannerPage = {
      ...JSON.parse(JSON.stringify(currentPage)),
      id: `page_${Date.now()}`,
      title: `${currentPage.title} (Copy)`,
    };
    const updatedPages = [...pages];
    updatedPages.splice(activePageIndex + 1, 0, copy);
    renumberPages(updatedPages);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) return; // Keep at least 1 page
    const updatedPages = pages.filter((_, idx) => idx !== activePageIndex);
    const nextIdx = Math.max(0, activePageIndex - 1);
    renumberPages(updatedPages, nextIdx);
  };

  const handleMovePage = (direction: 'up' | 'down') => {
    if (direction === 'up' && activePageIndex === 0) return;
    if (direction === 'down' && activePageIndex === pages.length - 1) return;

    const targetIdx = direction === 'up' ? activePageIndex - 1 : activePageIndex + 1;
    const updatedPages = [...pages];
    const [moved] = updatedPages.splice(activePageIndex, 1);
    updatedPages.splice(targetIdx, 0, moved);
    renumberPages(updatedPages, targetIdx);
  };

  const renumberPages = (newPages: PlannerPage[], newActiveIdx?: number) => {
    const renumbered = newPages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
    }));
    onUpdateProject({
      ...project,
      pages: renumbered,
      pageCount: renumbered.length,
      updatedAt: new Date().toISOString(),
    });
    if (typeof newActiveIdx === 'number') {
      setActivePageIndex(newActiveIdx);
    }
  };

  // Add a new template page
  const handleAddNewPage = (layoutType: PageLayoutType) => {
    let newPage: PlannerPage;
    const nextNum = pages.length + 1;

    switch (layoutType) {
      case 'lined_notes':
        newPage = createLinedNotesPage('Notes & Action Items');
        break;
      case 'dot_grid':
        newPage = createDotGridPage('Dot Grid Workspace');
        break;
      case 'weekly_spread':
        newPage = createWeeklySpreadPage(Math.floor(nextNum / 4) + 1);
        break;
      case 'daily_schedule':
        newPage = createDailyPlannerPage(nextNum);
        break;
      case 'meal_planner':
        newPage = createMealPlannerPage();
        break;
      case 'budget_tracker':
        newPage = createBudgetTrackerPage();
        break;
      case 'adhd_focus':
        newPage = createAdhdFocusPage();
        break;
      case 'fitness_log':
        newPage = createFitnessLogPage();
        break;
      case 'reading_log':
        newPage = createReadingLogPage();
        break;
      case 'calendar_monthly':
        newPage = createMonthlyCalendarPage('Monthly Plan', project.year);
        break;
      default:
        newPage = createLinedNotesPage('Custom Worksheet');
        break;
    }

    newPage.id = `page_${Date.now()}`;
    const updatedPages = [...pages, newPage];
    renumberPages(updatedPages, updatedPages.length - 1);
  };

  // Element Operations
  const handleAddElement = (type: ElementType) => {
    if (!currentPage) return;

    const newEl: PageElement = {
      id: `el_${Date.now()}`,
      type,
      title: type === 'header' ? 'New Section Header' : type === 'lines' ? 'Notes' : 'Tasks',
      x: 5,
      y: 20,
      width: 90,
      height: type === 'header' ? 10 : 25,
      rowCount: type === 'lines' ? 8 : type === 'checklist' ? 5 : 4,
      items: type === 'checklist' ? ['First task item', 'Second task item', 'Third task item'] : undefined,
      headers: type === 'table' ? ['Item', 'Category', 'Target', 'Status'] : undefined,
      fontSize: type === 'header' ? 16 : 10,
      textAlign: 'left',
    };

    const updatedElements = [...currentPage.elements, newEl];
    updateCurrentPageElements(updatedElements);
    setSelectedElementId(newEl.id);
  };

  const handleUpdateSelectedElement = (updates: Partial<PageElement>) => {
    if (!selectedElement) return;
    const updatedElements = currentPage.elements.map((el) =>
      el.id === selectedElement.id ? { ...el, ...updates } : el
    );
    updateCurrentPageElements(updatedElements);
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElement) return;
    const updatedElements = currentPage.elements.filter((el) => el.id !== selectedElement.id);
    updateCurrentPageElements(updatedElements);
    setSelectedElementId(null);
  };

  const updateCurrentPageElements = (elements: PageElement[]) => {
    const updatedPages = pages.map((p, idx) =>
      idx === activePageIndex ? { ...p, elements } : p
    );
    onUpdateProject({
      ...project,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    });
  };

  // AI Page Assistant
  const handleAiRefinePage = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: project.category,
          pageType: currentPage.layoutType,
          currentTitle: currentPage.title,
          theme: project.interiorStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI layout assistance failed');

      if (data.data) {
        const aiData = data.data;
        const newElements: PageElement[] = [];

        // Header element
        newElements.push({
          id: `el_head_${Date.now()}`,
          type: 'header',
          title: aiData.pageTitle || currentPage.title,
          text: aiData.pageSubtitle || '',
          x: 5,
          y: 5,
          width: 90,
          height: 10,
          fontSize: 16,
        });

        // Add generated sections
        let currentY = 18;
        if (Array.isArray(aiData.sections)) {
          aiData.sections.forEach((sec: any, idx: number) => {
            const h = Math.min(35, Math.max(15, sec.heightPercent || 20));
            newElements.push({
              id: `el_sec_${Date.now()}_${idx}`,
              type: sec.type === 'checklist' ? 'checklist' : sec.type === 'table' ? 'table' : 'lines',
              title: sec.title || `Section ${idx + 1}`,
              x: 5,
              y: currentY,
              width: 90,
              height: h,
              rowCount: sec.rowCount || 6,
              items: sec.items || undefined,
              headers: sec.columns || ['Item', 'Details', 'Done'],
            });
            currentY += h + 4;
          });
        }

        // Footer quote if available
        if (aiData.footerQuote) {
          newElements.push({
            id: `el_quote_${Date.now()}`,
            type: 'quote',
            text: aiData.footerQuote,
            x: 5,
            y: 90,
            width: 90,
            height: 6,
          });
        }

        const updatedPage: PlannerPage = {
          ...currentPage,
          title: aiData.pageTitle || currentPage.title,
          elements: newElements,
        };

        const updatedPages = pages.map((p, idx) => (idx === activePageIndex ? updatedPage : p));
        onUpdateProject({
          ...project,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI generation failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. LEFT SIDEBAR: Page Thumbnails & Navigation */}
      <div className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Pages ({pages.length})
            </h3>
          </div>
          {/* Add Page Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Page</span>
            </button>
            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 hidden group-hover:block z-50">
              <button
                onClick={() => handleAddNewPage('lined_notes')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Lined Notes
              </button>
              <button
                onClick={() => handleAddNewPage('dot_grid')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Dot Grid (Bullet)
              </button>
              <button
                onClick={() => handleAddNewPage('weekly_spread')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Weekly Action Spread
              </button>
              <button
                onClick={() => handleAddNewPage('daily_schedule')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Daily Focus Sheet
              </button>
              <button
                onClick={() => handleAddNewPage('meal_planner')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Meal & Grocery Plan
              </button>
              <button
                onClick={() => handleAddNewPage('budget_tracker')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Budget & Expense Sheet
              </button>
              <button
                onClick={() => handleAddNewPage('adhd_focus')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + ADHD Dopamine Focus
              </button>
              <button
                onClick={() => handleAddNewPage('fitness_log')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Fitness & Workout Log
              </button>
              <button
                onClick={() => handleAddNewPage('reading_log')}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-700 text-slate-200"
              >
                + Reading Log & Review
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {pages.map((p, idx) => {
            const isActive = idx === activePageIndex;
            const isEven = (idx + 1) % 2 === 0;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPage(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                {/* Mini page thumbnail preview */}
                <div
                  className={`w-9 h-12 rounded border flex flex-col justify-between p-1 shrink-0 ${
                    isActive ? 'bg-white text-slate-900 border-amber-400' : 'bg-slate-200 text-slate-700 border-slate-400'
                  }`}
                >
                  <div className="text-[7px] font-bold truncate">{p.pageNumber}</div>
                  <div className="space-y-0.5">
                    <div className="h-0.5 w-full bg-slate-400 rounded-full" />
                    <div className="h-0.5 w-3/4 bg-slate-300 rounded-full" />
                  </div>
                  <div className="text-[6px] text-right font-mono">{isEven ? 'L' : 'R'}</div>
                </div>

                {/* Page details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate text-white">
                      p.{p.pageNumber} {p.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {p.elements.length} element(s) • {isEven ? 'Even (Left Gutter)' : 'Odd (Right Gutter)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Page Actions Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMovePage('up')}
              disabled={activePageIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="Move Page Earlier"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMovePage('down')}
              disabled={activePageIndex === pages.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="Move Page Later"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicatePage}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Duplicate Page"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDeletePage}
            disabled={pages.length <= 1}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 disabled:opacity-30 transition"
            title="Delete Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER WORKSPACE: Interactive Canvas Preview */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Workspace Top Toolbar */}
        <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-400">
              Page {currentPage.pageNumber} of {pages.length}
            </span>
            <input
              type="text"
              value={currentPage.title}
              onChange={(e) => {
                const updated = { ...currentPage, title: e.target.value };
                const updatedPages = pages.map((p, idx) => (idx === activePageIndex ? updated : p));
                onUpdateProject({ ...project, pages: updatedPages });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white w-56 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* KDP Guides Toggle */}
            <button
              onClick={() => setShowKdpGuides(!showKdpGuides)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                showKdpGuides
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>KDP Safe Guides</span>
            </button>

            {/* AI Assistant */}
            <button
              onClick={handleAiRefinePage}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
            >
              {isAiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>AI Page Layout</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1 hover:text-white text-slate-400"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 hover:text-white text-slate-400"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area with live margins */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-950">
          <div
            style={{
              width: `${(trimWidthInches / 9) * 440 * (zoomLevel / 100)}px`,
              height: `${(trimHeightInches / 9) * 440 * (zoomLevel / 100)}px`,
            }}
            className="relative bg-white text-slate-900 rounded-sm shadow-2xl transition-all duration-100 flex flex-col justify-between overflow-hidden select-none border border-slate-300"
          >
            {/* KDP Visual Margin Guides Overlay */}
            {showKdpGuides && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* Outer Cut Bleed Guide */}
                <div className="absolute inset-0 border border-rose-500/30 border-dashed" />

                {/* Printable Safe Boundary */}
                <div
                  style={{
                    left: `${(interiorDims.marginLeftPt / interiorDims.pageTotalWidthPt) * 100}%`,
                    right: `${(interiorDims.marginRightPt / interiorDims.pageTotalWidthPt) * 100}%`,
                    top: `${(interiorDims.marginTopPt / interiorDims.pageTotalHeightPt) * 100}%`,
                    bottom: `${(interiorDims.marginBottomPt / interiorDims.pageTotalHeightPt) * 100}%`,
                  }}
                  className="absolute border border-emerald-500/50 bg-emerald-500/[0.02]"
                >
                  {/* Gutter Label on appropriate side */}
                  <span
                    className={`absolute text-[8px] font-bold text-amber-600 uppercase tracking-tighter ${
                      isEvenPage ? 'right-1 top-1' : 'left-1 top-1'
                    }`}
                  >
                    Gutter {interiorDims.gutterInches}"
                  </span>
                </div>
              </div>
            )}

            {/* Printable Elements Container */}
            <div
              style={{
                paddingLeft: `${(interiorDims.marginLeftPt / interiorDims.pageTotalWidthPt) * 100}%`,
                paddingRight: `${(interiorDims.marginRightPt / interiorDims.pageTotalWidthPt) * 100}%`,
                paddingTop: `${(interiorDims.marginTopPt / interiorDims.pageTotalHeightPt) * 100}%`,
                paddingBottom: `${(interiorDims.marginBottomPt / interiorDims.pageTotalHeightPt) * 100}%`,
              }}
              className="relative w-full h-full"
            >
              {currentPage.elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                return (
                  <div
                    key={el.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                    }}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                    }}
                    className={`absolute p-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-amber-500 bg-amber-50/50'
                        : 'hover:outline-1 hover:outline-dashed hover:outline-slate-400'
                    }`}
                  >
                    {/* Element Render based on type */}
                    {el.type === 'header' && (
                      <div className="h-full flex flex-col justify-center">
                        <h4
                          style={{
                            fontSize: `${Math.max(11, (el.fontSize || 16) * (zoomLevel / 100))}px`,
                            textAlign: el.textAlign || 'left',
                          }}
                          className="font-bold text-slate-900 leading-tight"
                        >
                          {el.title}
                        </h4>
                        {el.text && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">{el.text}</p>
                        )}
                        <div className="h-0.5 w-full bg-slate-300 mt-1" />
                      </div>
                    )}

                    {el.type === 'lines' && (
                      <div className="h-full flex flex-col justify-between">
                        {el.title && (
                          <span className="text-[10px] font-bold text-slate-800">{el.title}</span>
                        )}
                        <div className="flex-1 flex flex-col justify-evenly">
                          {Array.from({ length: el.rowCount || 6 }).map((_, rIdx) => (
                            <div key={rIdx} className="h-px bg-slate-300 w-full" />
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'checklist' && (
                      <div className="h-full flex flex-col justify-between">
                        {el.title && (
                          <span className="text-[10px] font-bold text-slate-800">{el.title}</span>
                        )}
                        <div className="flex-1 flex flex-col justify-evenly space-y-1">
                          {(el.items || ['Item 1', 'Item 2', 'Item 3']).map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center gap-1.5 text-[9px]">
                              <div className="w-2.5 h-2.5 rounded-xs border border-slate-600 shrink-0" />
                              <span className="text-slate-700 truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'table' && (
                      <div className="h-full flex flex-col border border-slate-400 text-[8px]">
                        <div className="flex bg-slate-100 font-bold border-b border-slate-400">
                          {(el.headers || ['Col 1', 'Col 2', 'Col 3']).map((h, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex-1 p-0.5 border-r last:border-r-0 border-slate-300 truncate"
                            >
                              {h}
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 flex flex-col justify-evenly">
                          {Array.from({ length: el.rowCount || 4 }).map((_, rIdx) => (
                            <div key={rIdx} className="flex flex-1 border-b last:border-b-0 border-slate-200">
                              {(el.headers || ['Col 1', 'Col 2', 'Col 3']).map((_, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="flex-1 border-r last:border-r-0 border-slate-200"
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'habit_matrix' && (
                      <div className="h-full flex flex-col justify-between border border-slate-400 p-1">
                        <span className="text-[9px] font-bold text-slate-800">{el.title || 'Habit Tracker'}</span>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 14 }).map((_, d) => (
                            <div key={d} className="flex-1 h-3 border border-slate-300 text-[6px] text-center">
                              {d + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'calendar_month' && (
                      <div className="h-full border border-slate-400 p-1 flex flex-col">
                        <span className="text-[10px] font-bold text-center text-slate-800">
                          {el.title}
                        </span>
                        <div className="grid grid-cols-7 gap-0.5 flex-1 mt-1">
                          {Array.from({ length: 35 }).map((_, c) => (
                            <div key={c} className="border border-slate-200 rounded-xs" />
                          ))}
                        </div>
                      </div>
                    )}

                    {el.type === 'dot_grid' && (
                      <div className="w-full h-full flex flex-wrap gap-2 p-1 overflow-hidden">
                        {Array.from({ length: 60 }).map((_, dot) => (
                          <div key={dot} className="w-1 h-1 rounded-full bg-slate-400" />
                        ))}
                      </div>
                    )}

                    {el.type === 'box' && (
                      <div className="w-full h-full border border-slate-800 rounded-sm p-1.5 flex flex-col justify-between">
                        {el.title && <span className="text-[9px] font-bold text-slate-800">{el.title}</span>}
                      </div>
                    )}

                    {el.type === 'quote' && (
                      <p className="text-[9px] italic text-slate-600 text-center">{el.text}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Page Number (Print margin) */}
            <div
              className={`absolute bottom-2 text-[9px] font-mono text-slate-500 ${
                isEvenPage ? 'left-6' : 'right-6'
              }`}
            >
              {currentPage.pageNumber}
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: Element Library & Properties Inspector */}
      <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
        {/* Element Library Toolbar */}
        <div className="p-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Add Printable Elements
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'header', label: 'Heading', icon: Type },
              { type: 'lines', label: 'Writing Lines', icon: AlignLeft },
              { type: 'checklist', label: 'Checklist', icon: ListTodo },
              { type: 'table', label: 'Table / Grid', icon: TableIcon },
              { type: 'habit_matrix', label: 'Habit Tracker', icon: Calendar },
              { type: 'calendar_month', label: 'Month Grid', icon: Calendar },
              { type: 'box', label: 'Focus Box', icon: Square },
              { type: 'dot_grid', label: 'Dot Grid', icon: Grid },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.type}
                  onClick={() => handleAddElement(btn.type as ElementType)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Element Properties Inspector */}
        <div className="p-4 flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {selectedElement ? 'Element Properties' : 'Page Overview'}
            </h4>
            {selectedElement && (
              <button
                onClick={handleDeleteSelectedElement}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Delete
              </button>
            )}
          </div>

          {selectedElement ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Title / Header</label>
                <input
                  type="text"
                  value={selectedElement.title || ''}
                  onChange={(e) => handleUpdateSelectedElement({ title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              {selectedElement.type === 'header' && (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Subtitle / Note</label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => handleUpdateSelectedElement({ text: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Font Size</label>
                    <input
                      type="number"
                      min="10"
                      max="36"
                      value={selectedElement.fontSize || 16}
                      onChange={(e) =>
                        handleUpdateSelectedElement({ fontSize: parseInt(e.target.value) || 16 })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {(selectedElement.type === 'lines' || selectedElement.type === 'table') && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Row Count</label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={selectedElement.rowCount || 6}
                    onChange={(e) =>
                      handleUpdateSelectedElement({ rowCount: parseInt(e.target.value) || 6 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              )}

              {/* Position & Sizing */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block">Width %</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={selectedElement.width}
                    onChange={(e) =>
                      handleUpdateSelectedElement({ width: parseInt(e.target.value) || 50 })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Height %</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={selectedElement.height}
                    onChange={(e) =>
                      handleUpdateSelectedElement({ height: parseInt(e.target.value) || 20 })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">X Pos %</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={selectedElement.x}
                    onChange={(e) =>
                      handleUpdateSelectedElement({ x: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Y Pos %</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={selectedElement.y}
                    onChange={(e) =>
                      handleUpdateSelectedElement({ y: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 space-y-3">
              <p>Click on any element in the canvas to adjust its properties, text, and rows.</p>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="font-bold text-white block">Amazon KDP Margin Check:</span>
                <div className="flex justify-between">
                  <span>Page Side:</span>
                  <span className="text-amber-400 font-semibold">
                    {isEvenPage ? 'Even (Left-Hand Page)' : 'Odd (Right-Hand Page)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inside Gutter:</span>
                  <span className="text-slate-200">{interiorDims.gutterInches}"</span>
                </div>
                <div className="flex justify-between">
                  <span>Outside Margin:</span>
                  <span className="text-slate-200">{interiorDims.outerInches}"</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
