import {
  PlannerCategory,
  PlannerPage,
  PageElement,
  CoverConfig,
  TrimSizeKey,
} from '../types/planner';

// Default Cover Config presets
export const COVER_PRESETS: Record<string, Partial<CoverConfig>> = {
  minimalist: {
    theme: 'minimalist',
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    textColor: '#f8fafc',
    accentColor: '#cbd5e1',
    pattern: 'none',
    finish: 'matte',
  },
  luxury: {
    theme: 'luxury',
    primaryColor: '#131b2e',
    secondaryColor: '#0a0e17',
    textColor: '#fef08a',
    accentColor: '#eab308',
    pattern: 'art_deco',
    finish: 'matte',
  },
  botanical: {
    theme: 'botanical',
    primaryColor: '#14342b',
    secondaryColor: '#0c221c',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
    pattern: 'leaves',
    finish: 'matte',
  },
  modern: {
    theme: 'modern',
    primaryColor: '#1e1b4b',
    secondaryColor: '#312e81',
    textColor: '#ffffff',
    accentColor: '#818cf8',
    pattern: 'geometric',
    finish: 'matte',
  },
  floral: {
    theme: 'floral',
    primaryColor: '#4a154b',
    secondaryColor: '#2b0d2b',
    textColor: '#fdf2f8',
    accentColor: '#f472b6',
    pattern: 'dots',
    finish: 'matte',
  },
  abstract: {
    theme: 'abstract',
    primaryColor: '#1c1917',
    secondaryColor: '#292524',
    textColor: '#fafaf9',
    accentColor: '#fb923c',
    pattern: 'marble',
    finish: 'matte',
  },
  vintage: {
    theme: 'vintage',
    primaryColor: '#3d2514',
    secondaryColor: '#2b1a0e',
    textColor: '#fef3c7',
    accentColor: '#d97706',
    pattern: 'art_deco',
    finish: 'matte',
  },
  business: {
    theme: 'business',
    primaryColor: '#0f2942',
    secondaryColor: '#081726',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    pattern: 'grid',
    finish: 'matte',
  },
  seasonal: {
    theme: 'seasonal',
    primaryColor: '#78350f',
    secondaryColor: '#451a03',
    textColor: '#fef3c7',
    accentColor: '#f59e0b',
    pattern: 'stars',
    finish: 'matte',
  },
};

// Builder helpers for standard page types
export function createTitlePage(title: string, subtitle: string, author: string, year: number): PlannerPage {
  return {
    id: 'page_title',
    pageNumber: 1,
    title: 'Title Page',
    layoutType: 'title_page',
    elements: [
      {
        id: 'el_title_year',
        type: 'header',
        title: `${year}`,
        x: 10,
        y: 20,
        width: 80,
        height: 10,
        textAlign: 'center',
        fontSize: 24,
      },
      {
        id: 'el_title_main',
        type: 'header',
        title: title.toUpperCase(),
        text: subtitle,
        x: 10,
        y: 35,
        width: 80,
        height: 18,
        textAlign: 'center',
        fontSize: 28,
      },
      {
        id: 'el_title_divider',
        type: 'divider',
        x: 30,
        y: 56,
        width: 40,
        height: 2,
      },
      {
        id: 'el_title_owner',
        type: 'lines',
        title: 'THIS PLANNER BELONGS TO:',
        x: 15,
        y: 65,
        width: 70,
        height: 15,
        rowCount: 3,
      },
      {
        id: 'el_title_author',
        type: 'quote',
        text: `Created by ${author}`,
        x: 10,
        y: 88,
        width: 80,
        height: 5,
        textAlign: 'center',
      },
    ],
  };
}

export function createCopyrightPage(title: string, author: string, year: number): PlannerPage {
  return {
    id: 'page_copyright',
    pageNumber: 2,
    title: 'Copyright & Publishing Info',
    layoutType: 'copyright',
    elements: [
      {
        id: 'el_cr_heading',
        type: 'header',
        title: title,
        text: `Published in ${year}`,
        x: 10,
        y: 40,
        width: 80,
        height: 12,
        fontSize: 14,
      },
      {
        id: 'el_cr_text',
        type: 'quote',
        text: `Copyright © ${year} by ${author}. All rights reserved.\n\nNo part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, or otherwise, without prior written permission of the publisher.\n\nPrinted on Demand by Amazon Kindle Direct Publishing (KDP).\nFirst Edition: ${year}`,
        x: 10,
        y: 54,
        width: 80,
        height: 25,
      },
    ],
  };
}

export function createIntroGuidePage(category: PlannerCategory): PlannerPage {
  return {
    id: 'page_intro',
    pageNumber: 3,
    title: 'How to Get the Most Out of This Planner',
    layoutType: 'intro_guide',
    elements: [
      {
        id: 'el_intro_head',
        type: 'header',
        title: 'WELCOME TO YOUR PLANNER',
        text: `Your comprehensive framework for ${category.toLowerCase()} success`,
        x: 5,
        y: 5,
        width: 90,
        height: 12,
        fontSize: 16,
      },
      {
        id: 'el_intro_boxes',
        type: 'box',
        title: 'THE THREE PILLARS',
        x: 5,
        y: 20,
        width: 90,
        height: 25,
      },
      {
        id: 'el_intro_checklist',
        type: 'checklist',
        title: 'DAILY COMMITMENT HABITS',
        items: [
          'Review top 3 non-negotiables before opening email or social media',
          'Record daily tracking metrics each evening',
          'Conduct a weekly retrospective review and adjustment',
          'Celebrate incremental wins and consistency',
        ],
        x: 5,
        y: 50,
        width: 90,
        height: 25,
      },
      {
        id: 'el_intro_quote',
        type: 'quote',
        text: '"Success is the product of daily habits—not once-in-a-lifetime transformations." — James Clear',
        x: 5,
        y: 82,
        width: 90,
        height: 8,
      },
    ],
  };
}

export function createAnnualCalendarPage(year: number): PlannerPage {
  return {
    id: 'page_annual_cal',
    pageNumber: 4,
    title: `${year} Year-at-a-Glance`,
    layoutType: 'calendar_annual',
    elements: [
      {
        id: 'el_annual_head',
        type: 'header',
        title: `${year} ANNUAL CALENDAR OVERVIEW`,
        text: 'Master dates, quarterly milestones, and major deadlines',
        x: 5,
        y: 5,
        width: 90,
        height: 10,
        fontSize: 16,
      },
      {
        id: 'el_annual_table',
        type: 'table',
        title: 'QUARTERLY TARGETS & KEY DATES',
        headers: ['Quarter', 'Primary Focus Milestone', 'Target Completion', 'Status'],
        rowCount: 4,
        x: 5,
        y: 18,
        width: 90,
        height: 24,
      },
      {
        id: 'el_annual_grid',
        type: 'calendar_month',
        title: 'Q1 & Q2 MASTER SPREAD',
        x: 5,
        y: 45,
        width: 90,
        height: 24,
      },
      {
        id: 'el_annual_notes',
        type: 'lines',
        title: 'ANNUAL MILESTONES & DATES TO REMEMBER',
        rowCount: 5,
        x: 5,
        y: 72,
        width: 90,
        height: 20,
      },
    ],
  };
}

export function createMonthlyCalendarPage(monthName: string, year: number): PlannerPage {
  return {
    id: `page_monthly_${monthName.toLowerCase()}`,
    pageNumber: 5,
    title: `${monthName} ${year} Monthly Overview`,
    layoutType: 'calendar_monthly',
    elements: [
      {
        id: 'el_month_head',
        type: 'header',
        title: `${monthName.toUpperCase()} ${year}`,
        text: 'Monthly master plan & high-level calendar',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 18,
      },
      {
        id: 'el_month_grid',
        type: 'calendar_month',
        title: `${monthName} Days`,
        x: 5,
        y: 15,
        width: 65,
        height: 50,
      },
      {
        id: 'el_month_goals',
        type: 'checklist',
        title: 'MONTHLY PRIORITIES',
        items: [
          'Goal #1 (High Impact)',
          'Goal #2 (Growth Target)',
          'Goal #3 (Personal Habit)',
          'Key Deadline A',
          'Key Deadline B',
        ],
        x: 72,
        y: 15,
        width: 23,
        height: 48,
      },
      {
        id: 'el_month_tracker',
        type: 'habit_matrix',
        title: 'MONTHLY HABIT ACCELERATOR',
        items: ['Hydration', 'Exercise', 'Reading', 'Planning', 'Sleep 8h'],
        columnCount: 31,
        x: 5,
        y: 68,
        width: 90,
        height: 24,
      },
    ],
  };
}

export function createWeeklySpreadPage(weekNum: number): PlannerPage {
  return {
    id: `page_weekly_${weekNum}`,
    pageNumber: 6,
    title: `Week ${weekNum} Action Plan`,
    layoutType: 'weekly_spread',
    elements: [
      {
        id: 'el_week_head',
        type: 'header',
        title: `WEEK ${weekNum} STRATEGY`,
        text: 'Top objectives and day-by-day execution',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_week_table',
        type: 'table',
        title: 'WEEKLY SCHEDULE & DELIVERABLES',
        headers: ['Day', 'Top Priority Focus', 'Appointments & Tasks', 'Done'],
        rowCount: 7,
        x: 5,
        y: 15,
        width: 90,
        height: 52,
      },
      {
        id: 'el_week_notes',
        type: 'lines',
        title: 'WEEKEND REVIEW & NOTES FOR NEXT WEEK',
        rowCount: 5,
        x: 5,
        y: 70,
        width: 90,
        height: 22,
      },
    ],
  };
}

export function createDailyPlannerPage(dayNum: number): PlannerPage {
  return {
    id: `page_daily_${dayNum}`,
    pageNumber: 7,
    title: `Daily Focus & Schedule`,
    layoutType: 'daily_schedule',
    elements: [
      {
        id: 'el_daily_head',
        type: 'header',
        title: 'DAILY EXECUTION MATRIX',
        text: 'Date: ____________________  Day: M  T  W  T  F  S  S',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_daily_priorities',
        type: 'checklist',
        title: 'TOP 3 CRITICAL WINS TODAY',
        items: ['Priority 1 (Must finish)', 'Priority 2', 'Priority 3'],
        x: 5,
        y: 15,
        width: 90,
        height: 16,
      },
      {
        id: 'el_daily_timeblock',
        type: 'table',
        title: 'HOURLY TIME BLOCKS (6:00 AM - 9:00 PM)',
        headers: ['Time Block', 'Scheduled Task / Deep Work Focus', 'Completed'],
        rowCount: 8,
        x: 5,
        y: 33,
        width: 55,
        height: 42,
      },
      {
        id: 'el_daily_notes',
        type: 'lines',
        title: 'NOTES & BRAIN DUMP',
        rowCount: 10,
        x: 62,
        y: 33,
        width: 33,
        height: 42,
      },
      {
        id: 'el_daily_habits',
        type: 'checklist',
        title: 'DAILY WELLNESS METRICS',
        items: [
          'Water Intake: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]',
          '30 Min Movement: [ ]',
          'Evening Gratitude Log: [ ]',
        ],
        x: 5,
        y: 78,
        width: 90,
        height: 14,
      },
    ],
  };
}

export function createMealPlannerPage(): PlannerPage {
  return {
    id: 'page_meal_planner',
    pageNumber: 8,
    title: 'Weekly Meal Prep & Grocery Roster',
    layoutType: 'meal_planner',
    elements: [
      {
        id: 'el_meal_head',
        type: 'header',
        title: 'WEEKLY MEAL PLANNER & PANTRY GUIDE',
        text: 'Plan balanced nutrition, eliminate food waste, stay on budget',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_meal_table',
        type: 'table',
        title: 'WEEK AT A GLANCE MENU',
        headers: ['Day', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        rowCount: 7,
        x: 5,
        y: 15,
        width: 90,
        height: 45,
      },
      {
        id: 'el_meal_grocery',
        type: 'checklist',
        title: 'GROCERY SHOPPING LIST (CATEGORIZED)',
        items: [
          'Produce / Greens: ________________________',
          'Proteins / Meat / Fish: ____________________',
          'Dairy & Eggs: ____________________________',
          'Pantry Staples: ___________________________',
          'Spices & Oils: ____________________________',
        ],
        x: 5,
        y: 63,
        width: 90,
        height: 29,
      },
    ],
  };
}

export function createBudgetTrackerPage(): PlannerPage {
  return {
    id: 'page_budget_tracker',
    pageNumber: 9,
    title: 'Monthly Budget & Expense Tracker',
    layoutType: 'budget_tracker',
    elements: [
      {
        id: 'el_budget_head',
        type: 'header',
        title: 'FINANCIAL WEALTH & BUDGET AUDIT',
        text: 'Month: ________________  Starting Balance: $___________',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_budget_table',
        type: 'table',
        title: 'INCOME & FIXED EXPENSES',
        headers: ['Category / Source', 'Budgeted', 'Actual', 'Difference'],
        rowCount: 6,
        x: 5,
        y: 15,
        width: 90,
        height: 35,
      },
      {
        id: 'el_budget_expenses',
        type: 'table',
        title: 'DAILY VARIABLE EXPENSE LOG',
        headers: ['Date', 'Description', 'Category', 'Amount', 'Payment Method'],
        rowCount: 7,
        x: 5,
        y: 53,
        width: 90,
        height: 40,
      },
    ],
  };
}

export function createAdhdFocusPage(): PlannerPage {
  return {
    id: 'page_adhd_focus',
    pageNumber: 10,
    title: 'ADHD Dopamine & High-Focus Dashboard',
    layoutType: 'adhd_focus',
    elements: [
      {
        id: 'el_adhd_head',
        type: 'header',
        title: 'FOCUS MATRIX (LOW OVERWHELM)',
        text: 'Break paralysis into tiny wins',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_adhd_braindump',
        type: 'lines',
        title: 'UNFILTERED BRAIN DUMP (EMPTY YOUR MIND)',
        rowCount: 7,
        x: 5,
        y: 15,
        width: 48,
        height: 38,
      },
      {
        id: 'el_adhd_microsteps',
        type: 'checklist',
        title: 'THE 1-THING & MICRO-STEPS',
        items: [
          'The ONE Must-Do: ________________',
          'Step 1 (2-minute start): _________',
          'Step 2: _________________________',
          'Step 3: _________________________',
          'Reward: _________________________',
        ],
        x: 55,
        y: 15,
        width: 40,
        height: 38,
      },
      {
        id: 'el_adhd_pomodoro',
        type: 'box',
        title: 'POMODORO SESSIONS: [25m Focus + 5m Break] x 4',
        x: 5,
        y: 56,
        width: 90,
        height: 16,
      },
      {
        id: 'el_adhd_dopamine',
        type: 'checklist',
        title: 'DOPAMINE BOOSTERS (HEALTHY REST)',
        items: [
          'Drink a tall glass of ice water',
          'Step outside for 3 minutes of natural sunlight',
          'Put on an instrumental playlist with no lyrics',
        ],
        x: 5,
        y: 75,
        width: 90,
        height: 18,
      },
    ],
  };
}

export function createFitnessLogPage(): PlannerPage {
  return {
    id: 'page_fitness_log',
    pageNumber: 11,
    title: 'Workout Performance & Cardio Log',
    layoutType: 'fitness_log',
    elements: [
      {
        id: 'el_fit_head',
        type: 'header',
        title: 'FITNESS & TRAINING LOG',
        text: 'Workout Focus: ____________________  Duration: ______ min',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_fit_strength',
        type: 'table',
        title: 'STRENGTH TRAINING (EXERCISES & SETS)',
        headers: ['Exercise Name', 'Set 1 (W/R)', 'Set 2 (W/R)', 'Set 3 (W/R)', 'Set 4 (W/R)'],
        rowCount: 6,
        x: 5,
        y: 15,
        width: 90,
        height: 40,
      },
      {
        id: 'el_fit_cardio',
        type: 'table',
        title: 'CARDIO, RECOVERY & BODY METRICS',
        headers: ['Metric', 'Target', 'Actual Result', 'RPE (1-10)'],
        rowCount: 3,
        x: 5,
        y: 58,
        width: 90,
        height: 22,
      },
      {
        id: 'el_fit_notes',
        type: 'lines',
        title: 'TRAINER NOTES & HOW BODY FELT',
        rowCount: 3,
        x: 5,
        y: 82,
        width: 90,
        height: 13,
      },
    ],
  };
}

export function createReadingLogPage(): PlannerPage {
  return {
    id: 'page_reading_log',
    pageNumber: 12,
    title: 'Reading Journal & Book Review',
    layoutType: 'reading_log',
    elements: [
      {
        id: 'el_read_head',
        type: 'header',
        title: 'BOOK REFLECTION & SUMMARY',
        text: 'Book Title: ____________________  Author: ____________________',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_read_meta',
        type: 'box',
        title: 'GENRE | PAGES | START DATE | FINISH DATE | RATING: ★★★★★',
        x: 5,
        y: 15,
        width: 90,
        height: 12,
      },
      {
        id: 'el_read_summary',
        type: 'lines',
        title: 'KEY THEMES & EXECUTIVE SUMMARY',
        rowCount: 7,
        x: 5,
        y: 30,
        width: 90,
        height: 32,
      },
      {
        id: 'el_read_quotes',
        type: 'lines',
        title: 'FAVORITE QUOTES & MEMORABLE PASSAGES',
        rowCount: 6,
        x: 5,
        y: 65,
        width: 90,
        height: 28,
      },
    ],
  };
}

export function createLinedNotesPage(title = 'Notes & Action Items'): PlannerPage {
  return {
    id: `page_notes_${Date.now()}`,
    pageNumber: 13,
    title,
    layoutType: 'lined_notes',
    elements: [
      {
        id: 'el_notes_head',
        type: 'header',
        title: title.toUpperCase(),
        text: 'Date: ____________________',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_notes_lines',
        type: 'lines',
        rowCount: 24,
        x: 5,
        y: 15,
        width: 90,
        height: 78,
      },
    ],
  };
}

export function createDotGridPage(title = 'Dot Grid / Bullet Workspace'): PlannerPage {
  return {
    id: `page_dots_${Date.now()}`,
    pageNumber: 14,
    title,
    layoutType: 'dot_grid',
    elements: [
      {
        id: 'el_dot_head',
        type: 'header',
        title: title.toUpperCase(),
        text: '5mm Grid Spacing',
        x: 5,
        y: 5,
        width: 90,
        height: 8,
        fontSize: 14,
      },
      {
        id: 'el_dot_grid',
        type: 'dot_grid',
        x: 5,
        y: 15,
        width: 90,
        height: 80,
      },
    ],
  };
}

/**
 * Builds a complete starter planner tailored to category and desired page count
 */
export function buildStarterPages(
  category: PlannerCategory,
  pageCount: number,
  title: string,
  author: string,
  year: number
): PlannerPage[] {
  const pages: PlannerPage[] = [];

  // 1. Mandatory Front Matter
  pages.push(createTitlePage(title, `The Comprehensive ${category}`, author, year));
  pages.push(createCopyrightPage(title, author, year));
  pages.push(createIntroGuidePage(category));
  pages.push(createAnnualCalendarPage(year));

  // Determine category core page builder
  let coreBuilder = () => createWeeklySpreadPage(1);
  if (category === 'Meal Planner') coreBuilder = () => createMealPlannerPage();
  else if (category === 'Fitness Planner') coreBuilder = () => createFitnessLogPage();
  else if (category === 'Budget Planner' || category === 'Financial Planner')
    coreBuilder = () => createBudgetTrackerPage();
  else if (category === 'ADHD Productivity Planner') coreBuilder = () => createAdhdFocusPage();
  else if (category === 'Daily Planner') coreBuilder = () => createDailyPlannerPage(1);
  else if (category === 'Reading Journal') coreBuilder = () => createReadingLogPage();
  else if (category === 'Monthly Planner') coreBuilder = () => createMonthlyCalendarPage('January', year);

  // Fill up pages to requested pageCount
  const remainingPages = Math.max(0, pageCount - pages.length);

  // Insert periodic monthly overviews if multi-month
  for (let i = 0; i < remainingPages; i++) {
    const pageIndex = pages.length + 1;
    let newPage: PlannerPage;

    if (category === 'Daily Planner') {
      newPage = createDailyPlannerPage(i + 1);
    } else if (category === 'Meal Planner') {
      newPage = createMealPlannerPage();
    } else if (category === 'Budget Planner' || category === 'Financial Planner') {
      newPage = i % 4 === 0 ? createBudgetTrackerPage() : createLinedNotesPage(`Financial Log & Receipts`);
    } else if (category === 'ADHD Productivity Planner') {
      newPage = createAdhdFocusPage();
    } else if (category === 'Fitness Planner') {
      newPage = createFitnessLogPage();
    } else if (category === 'Reading Journal') {
      newPage = createReadingLogPage();
    } else if (category === 'Gratitude Journal') {
      newPage = {
        id: `page_gratitude_${i}`,
        pageNumber: pageIndex,
        title: `Daily Gratitude & Reflection`,
        layoutType: 'custom',
        elements: [
          {
            id: `el_grat_head_${i}`,
            type: 'header',
            title: 'DAILY GRATITUDE & PEACE',
            text: 'Date: ____________________',
            x: 5,
            y: 5,
            width: 90,
            height: 8,
            fontSize: 14,
          },
          {
            id: `el_grat_three_${i}`,
            type: 'checklist',
            title: '3 THINGS I AM DEEPLY THANKFUL FOR',
            items: ['1. ________________________', '2. ________________________', '3. ________________________'],
            x: 5,
            y: 15,
            width: 90,
            height: 20,
          },
          {
            id: `el_grat_moments_${i}`,
            type: 'lines',
            title: 'A MOMENT THAT BROUGHT ME JOY TODAY',
            rowCount: 6,
            x: 5,
            y: 38,
            width: 90,
            height: 25,
          },
          {
            id: `el_grat_affirm_${i}`,
            type: 'box',
            title: 'DAILY AFFIRMATION: "I am grounded, capable, and at peace."',
            x: 5,
            y: 67,
            width: 90,
            height: 12,
          },
          {
            id: `el_grat_evening_${i}`,
            type: 'lines',
            title: 'EVENING UNWIND & TOMORROW INTENTION',
            rowCount: 4,
            x: 5,
            y: 82,
            width: 90,
            height: 14,
          },
        ],
      };
    } else {
      // General weekly/monthly
      if (i % 5 === 0) {
        newPage = createWeeklySpreadPage(Math.floor(i / 5) + 1);
      } else {
        newPage = createLinedNotesPage(`Weekly Action Items & Brainstorm`);
      }
    }

    newPage.id = `page_${pageIndex}`;
    newPage.pageNumber = pageIndex;
    pages.push(newPage);
  }

  // Ensure page numbers are continuous
  return pages.map((p, idx) => ({
    ...p,
    pageNumber: idx + 1,
    id: p.id || `page_${idx + 1}`,
  }));
}
