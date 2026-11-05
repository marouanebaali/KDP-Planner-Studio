import { TrimSizeKey, PaperType, TrimDimension } from '../types/planner';

export const TRIM_PRESETS: Record<TrimSizeKey, TrimDimension> = {
  '6x9': {
    key: '6x9',
    label: '6" x 9" (US Trade)',
    widthInches: 6.0,
    heightInches: 9.0,
    widthPt: 432,
    heightPt: 648,
    description: 'Most popular paperback size for journals, daily planners, and novels.',
  },
  '7x10': {
    key: '7x10',
    label: '7" x 10" (Executive)',
    widthInches: 7.0,
    heightInches: 10.0,
    widthPt: 504,
    heightPt: 720,
    description: 'Great balance of spacious writing area and portability.',
  },
  '8x10': {
    key: '8x10',
    label: '8" x 10" (Standard Large)',
    widthInches: 8.0,
    heightInches: 10.0,
    widthPt: 576,
    heightPt: 720,
    description: 'Ideal for workbooks, budget books, and student planners.',
  },
  '8.5x11': {
    key: '8.5x11',
    label: '8.5" x 11" (Letter Size)',
    widthInches: 8.5,
    heightInches: 11.0,
    widthPt: 612,
    heightPt: 792,
    description: 'Maximum writing space for comprehensive business, teacher, and meal planners.',
  },
  'custom': {
    key: 'custom',
    label: 'Custom Dimensions',
    widthInches: 6.0,
    heightInches: 9.0,
    widthPt: 432,
    heightPt: 648,
    description: 'Custom dimensions configured by user.',
  },
};

/**
 * Amazon KDP Spine Multipliers (in inches per page)
 */
export const SPINE_MULTIPLIERS: Record<PaperType, number> = {
  white: 0.002252, // White paper (B&W or standard color)
  cream: 0.0025,   // Cream paper (B&W)
  color: 0.002347, // Premium color paper
};

/**
 * Calculates the exact spine thickness in inches based on KDP formulas
 */
export function calculateSpineWidthInches(pageCount: number, paperType: PaperType): number {
  const multiplier = SPINE_MULTIPLIERS[paperType] || SPINE_MULTIPLIERS.white;
  const width = pageCount * multiplier;
  return Math.round(width * 10000) / 10000;
}

/**
 * Minimum spine width to support readable spine text according to KDP rules:
 * KDP requires at least 79 pages for spine text.
 */
export function isSpineTextAllowed(pageCount: number): boolean {
  return pageCount >= 79;
}

/**
 * Official Amazon KDP inside margin (gutter) based on page count
 */
export function calculateGutterMarginInches(pageCount: number): number {
  if (pageCount <= 150) return 0.375; // 3/8"
  if (pageCount <= 300) return 0.500; // 1/2"
  if (pageCount <= 500) return 0.625; // 5/8"
  if (pageCount <= 700) return 0.750; // 3/4"
  return 0.875; // 7/8"
}

/**
 * Recommended outside/top/bottom margin
 */
export function calculateOutsideMarginInches(hasBleed: boolean): number {
  return hasBleed ? 0.375 : 0.25;
}

/**
 * Calculates the full paperback cover spread dimensions including bleed and spine
 */
export function calculateCoverDimensions({
  trimWidthInches,
  trimHeightInches,
  pageCount,
  paperType,
}: {
  trimWidthInches: number;
  trimHeightInches: number;
  pageCount: number;
  paperType: PaperType;
}) {
  const bleedInches = 0.125; // standard KDP cover bleed
  const spineWidth = calculateSpineWidthInches(pageCount, paperType);

  // Total Cover Width = Bleed + Back Cover + Spine + Front Cover + Bleed
  const totalWidthInches = bleedInches + trimWidthInches + spineWidth + trimWidthInches + bleedInches;
  // Total Cover Height = Bleed + Trim Height + Bleed
  const totalHeightInches = bleedInches + trimHeightInches + bleedInches;

  // In points (72 points = 1 inch)
  const totalWidthPt = totalWidthInches * 72;
  const totalHeightPt = totalHeightInches * 72;
  const spineWidthPt = spineWidth * 72;
  const bleedPt = bleedInches * 72;
  const trimWidthPt = trimWidthInches * 72;
  const trimHeightPt = trimHeightInches * 72;

  // Key horizontal coordinates on cover spread (from left to right in points)
  const backCoverLeftPt = bleedPt;
  const backCoverRightPt = bleedPt + trimWidthPt;
  const spineLeftPt = backCoverRightPt;
  const spineRightPt = spineLeftPt + spineWidthPt;
  const frontCoverLeftPt = spineRightPt;
  const frontCoverRightPt = frontCoverLeftPt + trimWidthPt;

  // Barcode area placement (Standard KDP: 2" wide x 1.2" high, on back cover lower right)
  const barcodeWidthPt = 2.0 * 72; // 144 pt
  const barcodeHeightPt = 1.2 * 72; // 86.4 pt
  // Place on back cover 0.375" from spine, 0.375" from bottom
  const barcodeXPt = spineLeftPt - barcodeWidthPt - 27;
  const barcodeYPt = bleedPt + 27;

  return {
    spineWidthInches: spineWidth,
    totalWidthInches: Math.round(totalWidthInches * 1000) / 1000,
    totalHeightInches: Math.round(totalHeightInches * 1000) / 1000,
    totalWidthPt,
    totalHeightPt,
    spineWidthPt,
    bleedPt,
    trimWidthPt,
    trimHeightPt,
    backCoverLeftPt,
    spineLeftPt,
    spineRightPt,
    frontCoverLeftPt,
    barcodeXPt,
    barcodeYPt,
    barcodeWidthPt,
    barcodeHeightPt,
  };
}

/**
 * Calculates interior page layout dimensions (with or without bleed)
 */
export function calculateInteriorDimensions({
  trimWidthInches,
  trimHeightInches,
  hasBleed,
  pageCount,
  isEvenPage,
}: {
  trimWidthInches: number;
  trimHeightInches: number;
  hasBleed: boolean;
  pageCount: number;
  isEvenPage: boolean;
}) {
  const bleedOffsetInches = hasBleed ? 0.125 : 0;
  const bleedOffsetPt = bleedOffsetInches * 72;

  // Interior page total size
  const pageTotalWidthInches = hasBleed ? trimWidthInches + 0.125 : trimWidthInches;
  const pageTotalHeightInches = hasBleed ? trimHeightInches + 0.25 : trimHeightInches;

  const pageTotalWidthPt = pageTotalWidthInches * 72;
  const pageTotalHeightPt = pageTotalHeightInches * 72;

  const gutterInches = calculateGutterMarginInches(pageCount);
  const outerInches = calculateOutsideMarginInches(hasBleed);

  const gutterPt = gutterInches * 72;
  const outerPt = outerInches * 72;
  const topPt = outerPt;
  const bottomPt = outerPt;

  // In double-sided books:
  // Odd pages (Right side): Gutter is on the LEFT, Outer is on the RIGHT.
  // Even pages (Left side): Outer is on the LEFT, Gutter is on the RIGHT.
  const marginLeftPt = isEvenPage ? outerPt : gutterPt;
  const marginRightPt = isEvenPage ? gutterPt : outerPt;

  const printableWidthPt = pageTotalWidthPt - (marginLeftPt + marginRightPt);
  const printableHeightPt = pageTotalHeightPt - (topPt + bottomPt);

  return {
    pageTotalWidthPt,
    pageTotalHeightPt,
    pageTotalWidthInches,
    pageTotalHeightInches,
    marginLeftPt,
    marginRightPt,
    marginTopPt: topPt,
    marginBottomPt: bottomPt,
    printableWidthPt,
    printableHeightPt,
    gutterInches,
    outerInches,
    bleedOffsetPt,
  };
}
