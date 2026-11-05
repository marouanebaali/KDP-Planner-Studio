import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Book,
  FileSpreadsheet,
  Palette,
  Sliders,
  Info,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  PlannerCategory,
  TrimSizeKey,
  PaperType,
  InteriorStyle,
  PlannerProject,
} from '../types/planner';
import { TRIM_PRESETS, calculateSpineWidthInches } from '../utils/kdpCalculator';
import { buildStarterPages } from '../data/defaultTemplates';

interface PlannerWizardProps {
  initialCategory?: PlannerCategory;
  onComplete: (newProject: PlannerProject) => void;
  onCancel: () => void;
}

const CATEGORIES: PlannerCategory[] = [
  'Daily Planner',
  'Weekly Planner',
  'Monthly Planner',
  'Yearly Planner',
  'Meal Planner',
  'Fitness Planner',
  'Budget Planner',
  'Financial Planner',
  'ADHD Productivity Planner',
  'Business Planner',
  'Student Planner',
  'Wedding Planner',
  'Pregnancy Planner',
  'Travel Planner',
  'Retirement Planner',
  'Gratitude Journal',
  'Goal Setting Planner',
  'Reading Journal',
  'Custom Planner',
];

const INTERIOR_STYLES: { id: InteriorStyle; label: string; desc: string }[] = [
  { id: 'minimalist', label: 'Minimalist Clean', desc: 'Sleek black & white lines, maximum writing space.' },
  { id: 'modern', label: 'Modern Editorial', desc: 'Distinct typography and subtle tonal hierarchy.' },
  { id: 'elegant', label: 'Classic Elegant', desc: 'Serif headings and balanced traditional margins.' },
  { id: 'luxury', label: 'Luxury Executive', desc: 'Refined structure, quarterly milestones & dark accents.' },
  { id: 'floral', label: 'Botanical & Floral', desc: 'Gentle organic dividers and botanical motifs.' },
  { id: 'minimal_ink', label: 'Minimal Ink Consumption', desc: 'Ultra-light 0.5pt rules designed to conserve ink.' },
  { id: 'grayscale', label: 'Soft Grayscale', desc: '10%-20% gray tone headers for effortless readability.' },
  { id: 'full_color', label: 'Full Color Premium', desc: 'Vibrant section coding for high-end gift planners.' },
];

export const PlannerWizard: React.FC<PlannerWizardProps> = ({
  initialCategory = 'Weekly Planner',
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<PlannerCategory>(initialCategory);
  const [trimSize, setTrimSize] = useState<TrimSizeKey>('6x9');
  const [customWidth, setCustomWidth] = useState<number>(6.0);
  const [customHeight, setCustomHeight] = useState<number>(9.0);

  const [paperType, setPaperType] = useState<PaperType>('white');
  const [interiorStyle, setInteriorStyle] = useState<InteriorStyle>('minimalist');
  const [pageCount, setPageCount] = useState<number>(100);
  const [hasBleed, setHasBleed] = useState<boolean>(false);
  const [isDoubleSided, setIsDoubleSided] = useState<boolean>(true);
  const [includeIntro, setIncludeIntro] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);

  // Planner Info
  const [title, setTitle] = useState<string>(`${initialCategory} 2026`);
  const [subtitle, setSubtitle] = useState<string>('A Guided 52-Week Framework for Focus and Consistency');
  const [author, setAuthor] = useState<string>('Studio Publishing');
  const [year, setYear] = useState<number>(2026);
  const [targetAudience, setTargetAudience] = useState<string>('Goal-oriented professionals and busy individuals');
  const [language, setLanguage] = useState<string>('English');

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  const spineWidth = calculateSpineWidthInches(pageCount, paperType);

  // Update title when category changes if unmodified
  const handleCategorySelect = (cat: PlannerCategory) => {
    setCategory(cat);
    setTitle(`${cat} ${year}`);
  };

  // Trigger Gemini AI generation
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/generate-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          subtitle,
          targetAudience,
          pageCount,
          trimSize,
          interiorStyle,
          year,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate planner structure');
      }

      if (data.data) {
        setAiResult(data.data);
        if (data.data.title) setTitle(data.data.title);
        if (data.data.recommendedSubtitle) setSubtitle(data.data.recommendedSubtitle);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'AI generation encountered an error. You can still proceed with standard templates.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Final submission and creation of the project
  const handleFinish = () => {
    const starterPages = buildStarterPages(category, pageCount, title, author, year);

    const newProject: PlannerProject = {
      id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: title,
      title,
      subtitle,
      author,
      category,
      year,
      language,
      targetAudience,
      trimSize,
      customDimensions: trimSize === 'custom' ? { width: customWidth, height: customHeight } : undefined,
      paperType,
      interiorStyle,
      pageCount: starterPages.length,
      hasBleed,
      isDoubleSided,
      includeIntro,
      includeNotes,
      startDayOfWeek: 1,
      pages: starterPages,
      cover: {
        theme: 'luxury',
        primaryColor: '#0f172a',
        secondaryColor: '#1e293b',
        textColor: '#f8fafc',
        accentColor: '#eab308',
        title: title.toUpperCase(),
        subtitle: subtitle.toUpperCase(),
        author,
        spineText: pageCount >= 79 ? title.toUpperCase() : '',
        backCoverBlurb:
          aiResult?.bookDescription?.slice(0, 300) ||
          'Designed specifically for effortless daily productivity, focus, and intentional living. Manufactured to official Amazon KDP physical paperback distribution standards.',
        backCoverQuotes: ['"Plan with clarity. Execute with confidence."'],
        pattern: 'art_deco',
        finish: 'matte',
        showSpineGuides: true,
        showBarcodeGuide: true,
        showBleedGuides: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kdpMetadata: aiResult
        ? {
            keywords: aiResult.kdpKeywords || [],
            categories: aiResult.kdpCategories || [],
            description: aiResult.bookDescription || '',
          }
        : undefined,
    };

    onComplete(newProject);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Wizard Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Step {step} of 4 • Planner Creation Wizard
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {step === 1 && 'Select Planner Category'}
            {step === 2 && 'Choose Physical Book Format'}
            {step === 3 && 'Interior Options & Specifications'}
            {step === 4 && 'AI Blueprint & Final Review'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition"
        >
          Cancel
        </button>
      </div>

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {['Category', 'Dimensions', 'Interior & Pages', 'AI Generation'].map((label, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div
              key={label}
              className={`h-2 rounded-full transition-all ${
                isDone ? 'bg-amber-500' : isCurrent ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            Select the primary category for your Amazon KDP paperback. Each category generates tailored, non-repetitive worksheets and tracking systems.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{cat}</span>
                  {category === cat && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: BOOK FORMAT & DIMENSIONS */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Trim Size (Amazon KDP Standard Formats)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['6x9', '7x10', '8x10', '8.5x11', 'custom'] as TrimSizeKey[]).map((key) => {
                const info = TRIM_PRESETS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTrimSize(key)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      trimSize === key
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base text-white">{info.label}</span>
                      {trimSize === key && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {trimSize === 'custom' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Width (Inches, 4"–8.5")</label>
                <input
                  type="number"
                  step="0.1"
                  min="4"
                  max="8.5"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 6)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Height (Inches, 6"–11.69")</label>
                <input
                  type="number"
                  step="0.1"
                  min="6"
                  max="11.69"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 9)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>
          )}

          {/* Paper Type Selection */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Paper Stock & Ink Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'white', label: 'White Paper (Black & White)', desc: 'Sharp high-contrast, lowest printing cost on KDP.' },
                { id: 'cream', label: 'Cream Paper (Black & White)', desc: 'Warm traditional tone, perfect for reading & gratitude.' },
                { id: 'color', label: 'Premium Color Paper', desc: 'Vibrant color saturation for deluxe visual planners.' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaperType(p.id as PaperType)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    paperType === p.id
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{p.label}</span>
                    {paperType === p.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: INTERIOR OPTIONS & PAGE COUNT */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Page Count Slider */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Interior Page Count</h3>
                <p className="text-xs text-slate-400">Amazon KDP paperback range: 24 to 828 pages.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">{pageCount}</span>
                <span className="text-xs text-slate-400 ml-1">pages</span>
              </div>
            </div>

            <input
              type="range"
              min="50"
              max="300"
              step="2"
              value={pageCount}
              onChange={(e) => setPageCount(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Spine Thickness: <strong className="text-white">{spineWidth.toFixed(4)}"</strong> ({(spineWidth * 25.4).toFixed(2)} mm)</span>
              <span>
                Spine Text:{' '}
                {pageCount >= 79 ? (
                  <strong className="text-emerald-400">Allowed (79+ pages)</strong>
                ) : (
                  <strong className="text-amber-400">No spine text (&lt;79p)</strong>
                )}
              </span>
            </div>
          </div>

          {/* Interior Styles Grid */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Interior Aesthetic Theme</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INTERIOR_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setInteriorStyle(st.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    interiorStyle === st.id
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">{st.label}</span>
                    {interiorStyle === st.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Bleed & Layout Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Bleed Setting</span>
                <span className="text-[11px] text-slate-400">
                  {hasBleed ? '+0.125" for edge graphics' : 'Standard (No Bleed)'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasBleed}
                onChange={(e) => setHasBleed(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Double-Sided Gutter</span>
                <span className="text-[11px] text-slate-400">Alternating inside margins</span>
              </div>
              <input
                type="checkbox"
                checked={isDoubleSided}
                onChange={(e) => setIsDoubleSided(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Intro & Guide Pages</span>
                <span className="text-[11px] text-slate-400">Title & copyright pages</span>
              </div>
              <input
                type="checkbox"
                checked={includeIntro}
                onChange={(e) => setIncludeIntro(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* STEP 4: PLANNER INFORMATION & AI BLUEPRINT */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Metadata Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Book Title (Front Cover & Spine)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Author / Publisher Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Year / Edition</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          {/* AI Generator Action Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900 border border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Gemini AI Planner Content Generator</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Let Gemini analyze your category ({category}) and formulate a tailored book distribution, sales copy, and 7 KDP keywords.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Blueprint</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {aiError}
              </div>
            )}

            {aiResult && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>AI Planner Outline Ready</span>
                </div>

                {aiResult.kdpKeywords && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Suggested KDP 7-Slot Keywords:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiResult.kdpKeywords.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition cursor-pointer shadow-md shadow-amber-500/20"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer shadow-lg shadow-amber-500/25"
          >
            <Check className="w-4 h-4" />
            <span>Create & Launch Studio</span>
          </button>
        )}
      </div>
    </div>
  );
};
