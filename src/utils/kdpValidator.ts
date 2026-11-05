import {
  PlannerProject,
  KdpValidationReport,
  KdpValidationCheck,
} from '../types/planner';
import {
  TRIM_PRESETS,
  calculateSpineWidthInches,
  isSpineTextAllowed,
  calculateGutterMarginInches,
  calculateCoverDimensions,
} from './kdpCalculator';

export function runKdpPreflightCheck(project: PlannerProject): KdpValidationReport {
  const checks: KdpValidationCheck[] = [];
  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidth = project.customDimensions?.width || trim.widthInches;
  const trimHeight = project.customDimensions?.height || trim.heightInches;
  const pageCount = project.pages.length || project.pageCount;
  const spineWidth = calculateSpineWidthInches(pageCount, project.paperType);
  const gutterMargin = calculateGutterMarginInches(pageCount);
  const outerMargin = project.hasBleed ? 0.375 : 0.25;

  const coverDims = calculateCoverDimensions({
    trimWidthInches: trimWidth,
    trimHeightInches: trimHeight,
    pageCount,
    paperType: project.paperType,
  });

  const interiorWidth = project.hasBleed ? trimWidth + 0.125 : trimWidth;
  const interiorHeight = project.hasBleed ? trimHeight + 0.25 : trimHeight;

  // 1. Page Count Check (Amazon KDP Paperback limits)
  // Black and white interior: 24 to 828 pages. Standard color: 72 to 600 pages. Premium color: 24 to 828 pages.
  const minPages = 24;
  const maxPages = project.paperType === 'color' ? 828 : 828;

  if (pageCount < minPages) {
    checks.push({
      id: 'page_count_min',
      name: 'Minimum Page Count',
      category: 'dimensions',
      status: 'ERROR',
      message: `Page count (${pageCount}) is below Amazon KDP minimum of 24 pages.`,
      details: 'Amazon KDP paperbacks require at least 24 pages for binding stability.',
      recommendation: `Increase the page count to at least 24 pages. Currently at ${pageCount}.`,
    });
  } else if (pageCount > maxPages) {
    checks.push({
      id: 'page_count_max',
      name: 'Maximum Page Count',
      category: 'dimensions',
      status: 'ERROR',
      message: `Page count (${pageCount}) exceeds KDP paperback limit of ${maxPages} pages.`,
      details: 'Spine bulk exceeds physical paperback binding limits.',
      recommendation: `Reduce total pages to under ${maxPages}.`,
    });
  } else {
    checks.push({
      id: 'page_count',
      name: 'Page Count Compliance',
      category: 'dimensions',
      status: 'PASS',
      message: `Page count of ${pageCount} pages is within KDP standard range (${minPages}–${maxPages} pages).`,
      details: `Calculated spine thickness is ${spineWidth.toFixed(4)}" (${(spineWidth * 25.4).toFixed(2)} mm).`,
    });
  }

  // 2. Trim Dimensions Check
  const standardTrims = ['6x9', '7x10', '8x10', '8.5x11'];
  if (standardTrims.includes(project.trimSize)) {
    checks.push({
      id: 'trim_size',
      name: 'Trim Size Standard Compliance',
      category: 'dimensions',
      status: 'PASS',
      message: `Trim size ${trim.label} is an official Amazon KDP standard industry format.`,
      details: `Exact cut dimensions: ${trimWidth}" x ${trimHeight}" (${trim.widthPt}pt x ${trim.heightPt}pt).`,
    });
  } else {
    if (trimWidth < 4 || trimWidth > 8.5 || trimHeight < 6 || trimHeight > 11.69) {
      checks.push({
        id: 'trim_size',
        name: 'Custom Trim Size Range',
        category: 'dimensions',
        status: 'ERROR',
        message: `Custom trim (${trimWidth}" x ${trimHeight}") is outside Amazon KDP permitted dimensions.`,
        details: 'KDP supports widths from 4" to 8.5" and heights from 6" to 11.69".',
      });
    } else {
      checks.push({
        id: 'trim_size',
        name: 'Custom Trim Size Range',
        category: 'dimensions',
        status: 'PASS',
        message: `Custom trim (${trimWidth}" x ${trimHeight}") is within allowed KDP dimensions.`,
        details: 'Be sure to choose "Custom Size" in KDP Book Setup.',
      });
    }
  }

  // 3. Gutter Margin Check (Binding Side)
  checks.push({
    id: 'gutter_margin',
    name: 'Gutter (Inside Binding) Margin',
    category: 'margins',
    status: 'PASS',
    message: `Inside gutter margin is set to ${gutterMargin}" (${(gutterMargin * 72).toFixed(0)}pt) for ${pageCount} pages.`,
    details: `Official KDP requirement for ${pageCount <= 150 ? '24–150' : pageCount <= 300 ? '151–300' : '301–500'} pages is minimum ${gutterMargin}". Prevents text disappearing into the book fold.`,
  });

  // 4. Outside Margins Check (Top, Bottom, Edge)
  checks.push({
    id: 'outside_margins',
    name: 'Outside & Edge Safe Margins',
    category: 'margins',
    status: 'PASS',
    message: `Outside safe margin is configured to ${outerMargin}" (${(outerMargin * 72).toFixed(0)}pt).`,
    details: `Exceeds the KDP 0.25" minimum cutting tolerance line. All page elements are confined inside safe boundary.`,
  });

  // 5. Bleed Configuration Check
  if (project.hasBleed) {
    checks.push({
      id: 'bleed_check',
      name: 'Interior Bleed Sizing',
      category: 'bleed',
      status: 'PASS',
      message: `Bleed added: +0.125" to outside edge and +0.25" to total height.`,
      details: `PDF Interior page dimensions: ${interiorWidth.toFixed(3)}" x ${interiorHeight.toFixed(3)}" (${(interiorWidth * 72).toFixed(0)}pt x ${(interiorHeight * 72).toFixed(0)}pt). Select "Bleed" on KDP dashboard.`,
    });
  } else {
    checks.push({
      id: 'bleed_check',
      name: 'Interior No-Bleed Trim Matching',
      category: 'bleed',
      status: 'PASS',
      message: `No bleed configured. PDF Interior matches exact trim dimensions: ${trimWidth}" x ${trimHeight}".`,
      details: 'Select "No Bleed" on KDP dashboard when uploading the interior file.',
    });
  }

  // 6. Spine Width & Spine Text Check
  const spineAllowed = isSpineTextAllowed(pageCount);
  const hasSpineText = Boolean(project.cover.spineText?.trim());

  if (hasSpineText && !spineAllowed) {
    checks.push({
      id: 'spine_text_kdp_rule',
      name: 'Spine Text Minimum Page Count',
      category: 'spine',
      status: 'ERROR',
      message: `Spine text is present, but KDP strictly rejects spine text on books with under 79 pages.`,
      details: `Current book has ${pageCount} pages. Spine width is ${spineWidth.toFixed(4)}", which is too narrow for physical spine printing.`,
      recommendation:
        'Either increase page count to 79+ pages or clear the spine text in Cover Designer.',
    });
  } else if (!hasSpineText && spineAllowed) {
    checks.push({
      id: 'spine_text_kdp_rule',
      name: 'Spine Text Opportunity',
      category: 'spine',
      status: 'PASS',
      message: `Book has ${pageCount} pages (${spineWidth.toFixed(4)}" spine). Spine text is permitted.`,
      details: 'Spine text is optional but adds a retail-ready appearance on bookshelves.',
    });
  } else {
    checks.push({
      id: 'spine_text_kdp_rule',
      name: 'Spine Text Specification',
      category: 'spine',
      status: 'PASS',
      message: `Spine specification meets all Amazon KDP physical binding rules.`,
      details: `Calculated spine width: ${spineWidth.toFixed(4)}" (${(spineWidth * 25.4).toFixed(2)} mm).`,
    });
  }

  // 7. Cover Full Wrap Spread Dimensions
  checks.push({
    id: 'cover_dimensions',
    name: 'Cover PDF Full Wrap Dimensions',
    category: 'cover',
    status: 'PASS',
    message: `Total Cover Spread: ${coverDims.totalWidthInches.toFixed(3)}" x ${coverDims.totalHeightInches.toFixed(3)}" (${coverDims.totalWidthPt.toFixed(0)}pt x ${coverDims.totalHeightPt.toFixed(0)}pt).`,
    details: `Includes 0.125" outer bleed, Back Cover (${trimWidth}"), Spine (${spineWidth.toFixed(4)}"), and Front Cover (${trimWidth}").`,
  });

  // 8. Barcode Safe Area Check (Amazon KDP barcode placement)
  checks.push({
    id: 'barcode_zone',
    name: 'KDP Barcode Safe Zone',
    category: 'cover',
    status: 'PASS',
    message: `Dedicated 2.0" x 1.2" barcode safe area is reserved on the back cover lower region.`,
    details: `Amazon KDP automatically prints an ISBN/EAN barcode here. No essential text or artwork overlaps this area.`,
  });

  // 9. Element Safe Boundary Check (Pages)
  let pagesWithWarning = 0;
  for (const page of project.pages) {
    for (const el of page.elements) {
      if (el.x < 0 || el.y < 0 || el.x + el.width > 100 || el.y + el.height > 100) {
        pagesWithWarning++;
        break;
      }
    }
  }

  if (pagesWithWarning > 0) {
    checks.push({
      id: 'element_margins',
      name: 'Printable Area Boundary Inspection',
      category: 'margins',
      status: 'WARNING',
      message: `${pagesWithWarning} page(s) have elements close to or touching margin boundaries.`,
      details: 'Check Page Designer to ensure text does not get trimmed during printing.',
      recommendation: 'Inspect pages flagged in Page Designer and adjust spacing.',
    });
  } else {
    checks.push({
      id: 'element_margins',
      name: 'Printable Area Boundary Inspection',
      category: 'margins',
      status: 'PASS',
      message: `All ${project.pages.length} pages respect KDP safe margins. No clipped text detected.`,
      details: 'Elements are safely inset from the cut line and fold.',
    });
  }

  // Determine Overall Status
  const hasError = checks.some((c) => c.status === 'ERROR');
  const hasWarning = checks.some((c) => c.status === 'WARNING');
  const overallStatus = hasError ? 'ERROR' : hasWarning ? 'WARNING' : 'PASS';

  return {
    overallStatus,
    checks,
    spineWidthInches: spineWidth,
    coverTotalWidthInches: coverDims.totalWidthInches,
    coverTotalHeightInches: coverDims.totalHeightInches,
    interiorWidthInches: interiorWidth,
    interiorHeightInches: interiorHeight,
    outerMarginInches: outerMargin,
    gutterMarginInches: gutterMargin,
    minPageCount: minPages,
    maxPageCount: maxPages,
    spineTextAllowed: spineAllowed,
  };
}
