import React from 'react';
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Utensils,
  Dumbbell,
  DollarSign,
  Brain,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  Smile,
  Target,
  BookMarked,
  Check,
} from 'lucide-react';
import { PlannerCategory } from '../types/planner';

interface TemplatesLibraryProps {
  onSelectCategory: (category: PlannerCategory) => void;
}

interface TemplatePreset {
  category: PlannerCategory;
  title: string;
  subtitle: string;
  recommendedTrim: string;
  defaultPages: number;
  tags: string[];
  description: string;
  keyPages: string[];
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    category: 'Weekly Planner',
    title: 'Executive Weekly Momentum Planner',
    subtitle: '52-Week Strategic Habit & Action System',
    recommendedTrim: '6" x 9" or 7" x 10"',
    defaultPages: 120,
    tags: ['Best Seller', 'All-Around', 'Productivity'],
    description: 'Designed for professionals, freelancers, and students seeking structured weekly overviews and habit alignment.',
    keyPages: ['52 Weekly Action Spreads', 'Quarterly Goal Reviews', 'Monthly Milestones', '31-Day Habit Accelerator'],
  },
  {
    category: 'Daily Planner',
    title: 'Daily Deep-Work & Hourly Agenda',
    subtitle: '6:00 AM – 9:00 PM Time Blocking & Wins',
    recommendedTrim: '6" x 9" or 8" x 10"',
    defaultPages: 100,
    tags: ['High Volume', 'Hourly Schedule'],
    description: 'Hourly time-blocking layout with top 3 daily wins, daily water/wellness tracker, and dedicated brain dump space.',
    keyPages: ['Hourly Time-Block Schedule', 'Top 3 Priority Focus', 'Water & Movement Log', 'End-of-Day Gratitude'],
  },
  {
    category: 'ADHD Productivity Planner',
    title: 'Dopamine Focus & Low-Overwhelm Planner',
    subtitle: 'Micro-Steps, Brain Dumps & 25m Pomodoro Log',
    recommendedTrim: '7" x 10" or 8.5" x 11"',
    defaultPages: 110,
    tags: ['Neurodivergent', 'Micro-Steps', 'ADHD Friendly'],
    description: 'Constructed to break analysis paralysis. Clean, non-distracting layouts with visual reward loops.',
    keyPages: ['Unfiltered Brain Dump', '1-Thing Micro-Step Ladder', 'Pomodoro Session Trackers', 'Dopamine Boosters Menu'],
  },
  {
    category: 'Meal Planner',
    title: 'Weekly Culinary & Meal Prep Journal',
    subtitle: 'Budget Groceries, Pantry Audit & Menu Spreads',
    recommendedTrim: '7" x 10" or 8.5" x 11"',
    defaultPages: 104,
    tags: ['Family Favorite', 'Grocery Saver'],
    description: 'Streamline family nutrition, eliminate grocery waste, and organize favorite weekly dinner rotations.',
    keyPages: ['7-Day Meal Matrix', 'Aisle-Categorized Grocery Checklist', 'Pantry & Freezer Audit', 'Recipe Favorite Roster'],
  },
  {
    category: 'Budget Planner',
    title: 'Wealth Building & Monthly Cash Flow Planner',
    subtitle: 'Zero-Based Budget, Debt Snowball & Expense Logs',
    recommendedTrim: '8" x 10" or 8.5" x 11"',
    defaultPages: 96,
    tags: ['Finance', 'Debt Payoff', 'Savings'],
    description: 'Take charge of household finances, track variable daily spending, and calculate net-worth milestones.',
    keyPages: ['Monthly Income vs Fixed Expenses', 'Daily Variable Expense Ledger', 'Debt Snowball / Avalanche Trackers', 'Annual Savings Jar Tracker'],
  },
  {
    category: 'Fitness Planner',
    title: 'Strength Training & Body Performance Journal',
    subtitle: '12-Week Progressive Overload & Macro Log',
    recommendedTrim: '6" x 9" or 7" x 10"',
    defaultPages: 90,
    tags: ['Gym', 'Workouts', 'Health'],
    description: 'Track exercises, sets, weights, cardio distance, and personal bests with clean gym-ready tables.',
    keyPages: ['Strength Training Sets & Reps', 'Cardio & Heart Rate RPE Log', 'Weekly Body Metric Measurements', 'Trainer Reflection Notes'],
  },
  {
    category: 'Gratitude Journal',
    title: 'Daily Mindfulness & Joy Reflection Journal',
    subtitle: 'Morning Affirmations & Evening Peace Prompts',
    recommendedTrim: '6" x 9"',
    defaultPages: 120,
    tags: ['Mindfulness', 'Gift Book', 'Self-Care'],
    description: 'Uplifting guided daily prompts designed to foster intentional optimism, resilience, and emotional wellness.',
    keyPages: ['3 Daily Gratitudes', 'Morning Affirmation Callout', 'Joyful Moments Log', 'Evening Unwind & Sleep Intentions'],
  },
  {
    category: 'Reading Journal',
    title: 'The Book Lover’s Guided Reading Log',
    subtitle: 'Book Reviews, 5-Star Ratings & Reading Goals',
    recommendedTrim: '6" x 9" or 7" x 10"',
    defaultPages: 100,
    tags: ['Bookstagram', 'Book Club', 'Literature'],
    description: 'A keepsake reading companion for bibliophiles to document book reviews, favorite quotes, and reading goals.',
    keyPages: ['100-Book Spine Bookshelf Index', 'In-Depth Book Review Pages', 'Favorite Quotes & Passages', 'Annual Genre Breakdown'],
  },
  {
    category: 'Student Planner',
    title: 'Academic Semester & Assignment Organizer',
    subtitle: 'Syllabus Deadlines, Exam Study Plans & Grade Trackers',
    recommendedTrim: '7" x 10" or 8.5" x 11"',
    defaultPages: 110,
    tags: ['College', 'High School', 'Study'],
    description: 'Structured academic layout tailored for managing course syllabi, semester projects, and exam schedules.',
    keyPages: ['Semester Course Schedule', 'Assignment Due Date Master Roster', 'Study Session Prep Worksheets', 'Grade Weighting Tracker'],
  },
  {
    category: 'Business Planner',
    title: 'Quarterly Commercial OKR & Revenue Planner',
    subtitle: 'Quarterly Milestones, Launch Timelines & Client Logs',
    recommendedTrim: '8.5" x 11"',
    defaultPages: 120,
    tags: ['Executive', 'Startups', 'Small Business'],
    description: 'Created for entrepreneurs, founders, and small businesses tracking quarterly revenue and launch timelines.',
    keyPages: ['Quarterly OKRs & KPIs', 'Marketing Launch Calendar', 'Client Meeting Minutes', 'Monthly Profit & Loss Summary'],
  },
];

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ onSelectCategory }) => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
          <LayoutTemplate className="w-4 h-4" />
          KDP Ready Template Blueprints
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Curated Amazon KDP Paperback Templates
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Choose a pre-engineered layout optimized for commercial Amazon paperback sales. Every template includes KDP-compliant margins, alternating gutters, and custom worksheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_PRESETS.map((t) => (
          <div
            key={t.category}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 flex flex-col justify-between shadow-lg transition-all duration-200 group"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  {t.recommendedTrim}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                {t.title}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">{t.subtitle}</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{t.description}</p>

              {/* Key pages bullet list */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Included Layout Spreads:
                </span>
                {t.keyPages.map((pageTitle, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{pageTitle}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{t.defaultPages} Pages Recommended</span>
              <button
                onClick={() => onSelectCategory(t.category)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
