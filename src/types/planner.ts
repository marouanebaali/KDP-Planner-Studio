export type TrimSizeKey = '6x9' | '7x10' | '8x10' | '8.5x11' | 'custom';

export interface TrimDimension {
  key: TrimSizeKey;
  label: string;
  widthInches: number;
  heightInches: number;
  widthPt: number;
  heightPt: number;
  description: string;
}

export type PaperType = 'white' | 'cream' | 'color';

export type InteriorStyle =
  | 'black_and_white'
  | 'grayscale'
  | 'full_color'
  | 'minimalist'
  | 'modern'
  | 'elegant'
  | 'floral'
  | 'luxury'
  | 'minimal_ink';

export type PlannerCategory =
  | 'Daily Planner'
  | 'Weekly Planner'
  | 'Monthly Planner'
  | 'Yearly Planner'
  | 'Meal Planner'
  | 'Fitness Planner'
  | 'Budget Planner'
  | 'Financial Planner'
  | 'ADHD Productivity Planner'
  | 'Business Planner'
  | 'Student Planner'
  | 'Wedding Planner'
  | 'Pregnancy Planner'
  | 'Travel Planner'
  | 'Retirement Planner'
  | 'Gratitude Journal'
  | 'Goal Setting Planner'
  | 'Reading Journal'
  | 'Custom Planner';

export type CoverTheme =
  | 'minimalist'
  | 'modern'
  | 'luxury'
  | 'floral'
  | 'botanical'
  | 'abstract'
  | 'vintage'
  | 'business'
  | 'seasonal';

export type CoverPattern =
  | 'none'
  | 'dots'
  | 'grid'
  | 'stripes'
  | 'geometric'
  | 'leaves'
  | 'stars'
  | 'art_deco'
  | 'marble';

export type ElementType =
  | 'header'
  | 'text'
  | 'lines'
  | 'checklist'
  | 'table'
  | 'box'
  | 'habit_matrix'
  | 'calendar_month'
  | 'calendar_year'
  | 'dot_grid'
  | 'quote'
  | 'divider';

export interface PageElement {
  id: string;
  type: ElementType;
  title?: string;
  text?: string;
  x: number; // percentage 0-100 of printable area
  y: number; // percentage 0-100 of printable area
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  rowCount?: number;
  columnCount?: number;
  items?: string[];
  headers?: string[];
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  lineSpacing?: number;
  customData?: Record<string, any>;
}

export type PageLayoutType =
  | 'title_page'
  | 'copyright'
  | 'intro_guide'
  | 'calendar_annual'
  | 'calendar_monthly'
  | 'weekly_spread'
  | 'daily_schedule'
  | 'habit_tracker'
  | 'budget_tracker'
  | 'meal_planner'
  | 'adhd_focus'
  | 'fitness_log'
  | 'checklist'
  | 'lined_notes'
  | 'dot_grid'
  | 'recipe_page'
  | 'reading_log'
  | 'custom';

export interface PlannerPage {
  id: string;
  pageNumber: number;
  title: string;
  layoutType: PageLayoutType;
  elements: PageElement[];
  notes?: string;
}

export interface CoverConfig {
  theme: CoverTheme;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  author: string;
  spineText: string;
  backCoverBlurb: string;
  backCoverQuotes: string[];
  pattern: CoverPattern;
  finish: 'matte' | 'glossy';
  showSpineGuides: boolean;
  showBarcodeGuide: boolean;
  showBleedGuides: boolean;
}

export interface PlannerProject {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  author: string;
  category: PlannerCategory;
  year: number;
  language: string;
  targetAudience: string;
  trimSize: TrimSizeKey;
  customDimensions?: { width: number; height: number };
  paperType: PaperType;
  interiorStyle: InteriorStyle;
  pageCount: number;
  hasBleed: boolean;
  isDoubleSided: boolean;
  includeIntro: boolean;
  includeNotes: boolean;
  startDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
  pages: PlannerPage[];
  cover: CoverConfig;
  createdAt: string;
  updatedAt: string;
  kdpMetadata?: {
    keywords: string[];
    categories: string[];
    description: string;
  };
}

export interface KdpValidationCheck {
  id: string;
  name: string;
  category: 'dimensions' | 'margins' | 'spine' | 'cover' | 'bleed';
  status: 'PASS' | 'WARNING' | 'ERROR';
  message: string;
  details: string;
  recommendation?: string;
}

export interface KdpValidationReport {
  overallStatus: 'PASS' | 'WARNING' | 'ERROR';
  checks: KdpValidationCheck[];
  spineWidthInches: number;
  coverTotalWidthInches: number;
  coverTotalHeightInches: number;
  interiorWidthInches: number;
  interiorHeightInches: number;
  outerMarginInches: number;
  gutterMarginInches: number;
  minPageCount: number;
  maxPageCount: number;
  spineTextAllowed: boolean;
}
