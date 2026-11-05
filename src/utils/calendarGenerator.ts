export interface MonthInfo {
  year: number;
  monthIndex: number; // 0-11
  monthName: string;
  daysInMonth: number;
  weeks: (number | null)[][]; // 7 days per week
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAYS_SUN_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_MON_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const FULL_DAYS_SUN_START = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const FULL_DAYS_MON_START = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Checks if a year is a leap year (Gregorian calendar rules)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns exact days in a given month (0-indexed month)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Generates an accurate 7-column calendar matrix for a single month.
 * startDayOfWeek: 0 for Sunday, 1 for Monday.
 */
export function generateMonthMatrix(
  year: number,
  monthIndex: number,
  startDayOfWeek: 0 | 1 = 1
): MonthInfo {
  const daysCount = getDaysInMonth(year, monthIndex);
  const firstDayObj = new Date(year, monthIndex, 1);
  const rawDayOfWeek = firstDayObj.getDay(); // 0 is Sunday, 1 is Monday...

  // Calculate offset based on startDayOfWeek
  // If startDayOfWeek = 0 (Sunday): Sun=0, Mon=1, ..., Sat=6
  // If startDayOfWeek = 1 (Monday): Mon=0, Tue=1, ..., Sun=6
  let firstDayCol = rawDayOfWeek;
  if (startDayOfWeek === 1) {
    firstDayCol = (rawDayOfWeek + 6) % 7;
  }

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill empty spaces before day 1
  for (let i = 0; i < firstDayCol; i++) {
    currentWeek.push(null);
  }

  // Fill in days
  for (let day = 1; day <= daysCount; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill empty spaces after last day
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return {
    year,
    monthIndex,
    monthName: MONTH_NAMES[monthIndex],
    daysInMonth: daysCount,
    weeks,
  };
}

/**
 * Generates all 12 months for an entire year
 */
export function generateYearCalendar(year: number, startDayOfWeek: 0 | 1 = 1): MonthInfo[] {
  return Array.from({ length: 12 }, (_, i) => generateMonthMatrix(year, i, startDayOfWeek));
}

/**
 * Returns formatted weekly date range
 */
export function getWeekDays(
  year: number,
  weekNumber: number,
  startDayOfWeek: 0 | 1 = 1
): { dayName: string; dateNum: number; monthName: string }[] {
  // Approximate starting date of week in year
  const firstDay = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const days = [];
  const dayNames = startDayOfWeek === 1 ? FULL_DAYS_MON_START : FULL_DAYS_SUN_START;

  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    days.push({
      dayName: dayNames[i],
      dateNum: d.getDate(),
      monthName: MONTH_NAMES[d.getMonth()].slice(0, 3),
    });
  }

  return days;
}
