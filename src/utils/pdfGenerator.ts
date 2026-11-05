import { PDFDocument, rgb, StandardFonts, PDFPage, degrees } from 'pdf-lib';
import {
  PlannerProject,
  PageElement,
  PlannerPage,
} from '../types/planner';
import {
  TRIM_PRESETS,
  calculateCoverDimensions,
  calculateInteriorDimensions,
} from './kdpCalculator';

// Helper to convert hex color to pdf-lib rgb (0-1)
function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
}

/**
 * Generate Print-Ready Amazon KDP Interior PDF
 */
export async function generateInteriorPdf(
  project: PlannerProject,
  onProgress?: (progress: number, message: string) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidthInches = project.customDimensions?.width || trim.widthInches;
  const trimHeightInches = project.customDimensions?.height || trim.heightInches;
  const pagesList = project.pages;
  const totalPages = pagesList.length;

  for (let i = 0; i < totalPages; i++) {
    const pageData = pagesList[i];
    const pageNum = i + 1;
    const isEven = pageNum % 2 === 0;

    if (onProgress) {
      onProgress(Math.round((i / totalPages) * 100), `Rendering interior page ${pageNum} of ${totalPages}...`);
    }

    const dims = calculateInteriorDimensions({
      trimWidthInches,
      trimHeightInches,
      hasBleed: project.hasBleed,
      pageCount: totalPages,
      isEvenPage: isEven,
    });

    // Create page with exact point dimensions
    const pdfPage = pdfDoc.addPage([dims.pageTotalWidthPt, dims.pageTotalHeightPt]);

    // Margins origin: pdf-lib uses (0,0) at bottom-left!
    const printableLeft = dims.marginLeftPt;
    const printableBottom = dims.marginBottomPt;
    const printableTop = dims.pageTotalHeightPt - dims.marginTopPt;
    const printableWidth = dims.printableWidthPt;
    const printableHeight = dims.printableHeightPt;

    // Render Page Elements inside printable area
    for (const el of pageData.elements) {
      renderElementOnPdf(
        pdfPage,
        el,
        printableLeft,
        printableBottom,
        printableWidth,
        printableHeight,
        fontRegular,
        fontBold,
        fontOblique,
        project.interiorStyle
      );
    }

    // Render Page Number (KDP recommendation: bottom margin center or outer side, except on title/copyright page)
    if (pageData.layoutType !== 'title_page' && pageData.layoutType !== 'copyright') {
      const pageNumStr = `${pageNum}`;
      const numWidth = fontRegular.widthOfTextAtSize(pageNumStr, 9);
      // Place page number at outer margin or centered
      const numX = isEven
        ? printableLeft + 10 // left aligned on even page outer margin
        : printableLeft + printableWidth - numWidth - 10; // right aligned on odd page outer margin
      const numY = dims.marginBottomPt / 2;

      pdfPage.drawText(pageNumStr, {
        x: numX,
        y: numY,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  if (onProgress) {
    onProgress(100, 'Saving Interior PDF...');
  }

  return await pdfDoc.save();
}

/**
 * Render individual vector elements on PDF
 */
function renderElementOnPdf(
  page: PDFPage,
  el: PageElement,
  pLeft: number,
  pBottom: number,
  pWidth: number,
  pHeight: number,
  fontRegular: any,
  fontBold: any,
  fontOblique: any,
  style: string
) {
  // Translate element coordinates from top-left percentage to bottom-left pt
  const elX = pLeft + (el.x / 100) * pWidth;
  const elW = (el.width / 100) * pWidth;
  const elH = (el.height / 100) * pHeight;
  // Convert Y from top-down to bottom-up
  const elTop = pBottom + pHeight - (el.y / 100) * pHeight;
  const elBottom = elTop - elH;

  const isBw = style === 'black_and_white' || style === 'minimal_ink' || style === 'grayscale';
  const strokeColor = isBw ? rgb(0.2, 0.2, 0.2) : rgb(0.15, 0.2, 0.3);
  const lightStroke = isBw ? rgb(0.8, 0.8, 0.8) : rgb(0.78, 0.82, 0.88);
  const textColor = rgb(0.1, 0.1, 0.1);
  const subtextColor = rgb(0.4, 0.4, 0.4);

  switch (el.type) {
    case 'header': {
      const title = el.title || 'Section Header';
      const fontSize = el.fontSize || 16;
      const textWidth = fontBold.widthOfTextAtSize(title, fontSize);
      let textX = elX;
      if (el.textAlign === 'center') textX = elX + (elW - textWidth) / 2;
      if (el.textAlign === 'right') textX = elX + elW - textWidth;

      page.drawText(title, {
        x: Math.max(pLeft, textX),
        y: elTop - fontSize,
        size: fontSize,
        font: fontBold,
        color: textColor,
      });

      if (el.text) {
        page.drawText(el.text, {
          x: elX,
          y: elTop - fontSize - 12,
          size: 9,
          font: fontOblique,
          color: subtextColor,
        });
      }

      // Decorative underline
      page.drawLine({
        start: { x: elX, y: elTop - fontSize - 16 },
        end: { x: elX + elW, y: elTop - fontSize - 16 },
        thickness: 0.75,
        color: lightStroke,
      });
      break;
    }

    case 'lines': {
      // Writing lines for notes, journaling, or logs
      if (el.title) {
        page.drawText(el.title, {
          x: elX,
          y: elTop - 12,
          size: 11,
          font: fontBold,
          color: textColor,
        });
      }
      const lineCount = el.rowCount || 12;
      const startY = el.title ? elTop - 24 : elTop - 10;
      const availableH = startY - elBottom;
      const step = availableH / lineCount;

      for (let r = 0; r < lineCount; r++) {
        const y = startY - r * step;
        page.drawLine({
          start: { x: elX, y },
          end: { x: elX + elW, y },
          thickness: 0.5,
          color: lightStroke,
        });
      }
      break;
    }

    case 'checklist': {
      if (el.title) {
        page.drawText(el.title, {
          x: elX,
          y: elTop - 12,
          size: 11,
          font: fontBold,
          color: textColor,
        });
      }
      const items = el.items && el.items.length > 0
        ? el.items
        : Array.from({ length: el.rowCount || 8 }, (_, idx) => `Item ${idx + 1}`);

      const startY = el.title ? elTop - 24 : elTop - 10;
      const step = (startY - elBottom) / items.length;

      items.forEach((itemText, idx) => {
        const y = startY - idx * step;
        // Checkbox square (7x7 pt)
        page.drawRectangle({
          x: elX,
          y: y - 2,
          width: 8,
          height: 8,
          borderWidth: 0.75,
          borderColor: strokeColor,
          color: rgb(1, 1, 1),
        });

        // Label line
        page.drawText(itemText, {
          x: elX + 16,
          y,
          size: 9,
          font: fontRegular,
          color: textColor,
        });

        // Dotted or faint guide line to the right
        page.drawLine({
          start: { x: elX + 16 + fontRegular.widthOfTextAtSize(itemText, 9) + 8, y },
          end: { x: elX + elW, y },
          thickness: 0.5,
          color: lightStroke,
        });
      });
      break;
    }

    case 'table': {
      if (el.title) {
        page.drawText(el.title, {
          x: elX,
          y: elTop - 12,
          size: 11,
          font: fontBold,
          color: textColor,
        });
      }
      const headers = el.headers || ['Category', 'Description', 'Amount', 'Status'];
      const rows = el.rowCount || 6;
      const colW = elW / headers.length;
      const tableTop = el.title ? elTop - 20 : elTop;
      const rowH = (tableTop - elBottom) / (rows + 1);

      // Header row background & border
      page.drawRectangle({
        x: elX,
        y: tableTop - rowH,
        width: elW,
        height: rowH,
        color: rgb(0.95, 0.95, 0.95),
        borderWidth: 0.75,
        borderColor: strokeColor,
      });

      // Headers text
      headers.forEach((h, cIdx) => {
        const textX = elX + cIdx * colW + 6;
        page.drawText(h, {
          x: textX,
          y: tableTop - rowH + (rowH - 9) / 2,
          size: 8,
          font: fontBold,
          color: textColor,
        });
      });

      // Table data rows
      for (let r = 0; r < rows; r++) {
        const y = tableTop - (r + 2) * rowH;
        page.drawRectangle({
          x: elX,
          y,
          width: elW,
          height: rowH,
          borderWidth: 0.5,
          borderColor: lightStroke,
        });

        // Vertical column dividers
        for (let c = 1; c < headers.length; c++) {
          page.drawLine({
            start: { x: elX + c * colW, y },
            end: { x: elX + c * colW, y: y + rowH },
            thickness: 0.5,
            color: lightStroke,
          });
        }
      }
      break;
    }

    case 'habit_matrix': {
      if (el.title) {
        page.drawText(el.title, {
          x: elX,
          y: elTop - 12,
          size: 11,
          font: fontBold,
          color: textColor,
        });
      }
      const habits = el.items || ['Morning Routine', 'Hydration 2L', 'Reading 20m', 'Exercise', 'Meditation'];
      const daysCount = el.columnCount || 31;
      const labelW = 100;
      const dayW = Math.max(6, (elW - labelW) / daysCount);
      const startY = el.title ? elTop - 24 : elTop - 10;
      const rowH = (startY - elBottom) / (habits.length + 1);

      // Days Header
      for (let d = 1; d <= daysCount; d++) {
        const dX = elX + labelW + (d - 1) * dayW;
        page.drawText(`${d}`, {
          x: dX + (dayW > 10 ? (dayW - 6) / 2 : 1),
          y: startY - 8,
          size: 6,
          font: fontRegular,
          color: subtextColor,
        });
      }

      habits.forEach((habit, hIdx) => {
        const y = startY - (hIdx + 1) * rowH;
        page.drawText(habit, {
          x: elX,
          y: y + 4,
          size: 8,
          font: fontRegular,
          color: textColor,
        });

        // Day checkboxes
        for (let d = 1; d <= daysCount; d++) {
          const dX = elX + labelW + (d - 1) * dayW;
          page.drawRectangle({
            x: dX + 1,
            y: y + 2,
            width: dayW - 2,
            height: rowH - 4,
            borderWidth: 0.5,
            borderColor: lightStroke,
          });
        }
      });
      break;
    }

    case 'calendar_month': {
      const monthTitle = el.title || 'Monthly Calendar';
      page.drawText(monthTitle, {
        x: elX,
        y: elTop - 14,
        size: 12,
        font: fontBold,
        color: textColor,
      });

      const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const calTop = elTop - 26;
      const cellW = elW / 7;
      const cellH = (calTop - elBottom) / 6;

      // Day of week headers
      dayHeaders.forEach((dh, dIdx) => {
        page.drawText(dh, {
          x: elX + dIdx * cellW + (cellW - 7) / 2,
          y: calTop - 10,
          size: 8,
          font: fontBold,
          color: subtextColor,
        });
      });

      // Calendar grid (5 weeks)
      for (let w = 0; w < 5; w++) {
        const rowY = calTop - 16 - (w + 1) * cellH;
        for (let col = 0; col < 7; col++) {
          const cX = elX + col * cellW;
          page.drawRectangle({
            x: cX,
            y: rowY,
            width: cellW,
            height: cellH,
            borderWidth: 0.5,
            borderColor: lightStroke,
          });
        }
      }
      break;
    }

    case 'box': {
      page.drawRectangle({
        x: elX,
        y: elBottom,
        width: elW,
        height: elH,
        borderWidth: 0.75,
        borderColor: strokeColor,
      });
      if (el.title) {
        // Tag badge
        const titleW = fontBold.widthOfTextAtSize(el.title, 9);
        page.drawRectangle({
          x: elX + 10,
          y: elTop - 8,
          width: titleW + 12,
          height: 14,
          color: rgb(1, 1, 1),
        });
        page.drawText(el.title, {
          x: elX + 16,
          y: elTop - 6,
          size: 8,
          font: fontBold,
          color: textColor,
        });
      }
      break;
    }

    case 'dot_grid': {
      // Bullet journal dot grid (5mm / ~14.17 pt spacing)
      const dotSpacing = 14;
      for (let x = elX; x <= elX + elW; x += dotSpacing) {
        for (let y = elBottom; y <= elTop; y += dotSpacing) {
          page.drawCircle({
            x,
            y,
            size: 0.75,
            color: lightStroke,
          });
        }
      }
      break;
    }

    case 'quote': {
      const quoteText = el.text || '"The secret of getting ahead is getting started."';
      page.drawText(quoteText, {
        x: elX,
        y: elTop - 10,
        size: 9,
        font: fontOblique,
        color: subtextColor,
      });
      break;
    }

    case 'divider': {
      page.drawLine({
        start: { x: elX, y: elTop - elH / 2 },
        end: { x: elX + elW, y: elTop - elH / 2 },
        thickness: 0.75,
        color: lightStroke,
      });
      break;
    }

    default: {
      if (el.title) {
        page.drawText(el.title, {
          x: elX,
          y: elTop - 12,
          size: 10,
          font: fontBold,
          color: textColor,
        });
      }
      break;
    }
  }
}

/**
 * Generate Full Amazon KDP Paperback Cover PDF Spread
 * (Back Cover + Spine + Front Cover with 0.125" Bleed and Barcode Safe Zone)
 */
export async function generateCoverPdf(
  project: PlannerProject,
  onProgress?: (progress: number, message: string) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const trim = TRIM_PRESETS[project.trimSize];
  const trimWidthInches = project.customDimensions?.width || trim.widthInches;
  const trimHeightInches = project.customDimensions?.height || trim.heightInches;
  const pageCount = project.pages.length || project.pageCount;

  if (onProgress) {
    onProgress(20, 'Calculating exact Amazon KDP cover spread geometry...');
  }

  const coverDims = calculateCoverDimensions({
    trimWidthInches,
    trimHeightInches,
    pageCount,
    paperType: project.paperType,
  });

  const pdfPage = pdfDoc.addPage([coverDims.totalWidthPt, coverDims.totalHeightPt]);

  const cover = project.cover;
  const primaryColor = hexToRgb(cover.primaryColor || '#1e293b');
  const secondaryColor = hexToRgb(cover.secondaryColor || '#334155');
  const textColor = hexToRgb(cover.textColor || '#ffffff');
  const accentColor = hexToRgb(cover.accentColor || '#d97706');

  // 1. Draw Full Background Spread
  pdfPage.drawRectangle({
    x: 0,
    y: 0,
    width: coverDims.totalWidthPt,
    height: coverDims.totalHeightPt,
    color: primaryColor,
  });

  // 2. Draw Decorative Theme Frame on Front Cover
  const frontX = coverDims.frontCoverLeftPt;
  const frontW = coverDims.trimWidthPt;
  const frontH = coverDims.trimHeightPt;
  const frontBottom = coverDims.bleedPt;
  const frontTop = frontBottom + frontH;

  // Front Cover Margin Inset Frame
  const frameInset = 28;
  pdfPage.drawRectangle({
    x: frontX + frameInset,
    y: frontBottom + frameInset,
    width: frontW - frameInset * 2,
    height: frontH - frameInset * 2,
    borderWidth: 1.5,
    borderColor: accentColor,
  });

  // Decorative Inner Corners
  const cornerSize = 10;
  pdfPage.drawLine({
    start: { x: frontX + frameInset + cornerSize, y: frontBottom + frameInset },
    end: { x: frontX + frameInset, y: frontBottom + frameInset + cornerSize },
    thickness: 1,
    color: accentColor,
  });

  // 3. FRONT COVER TYPOGRAPHY
  const bookTitle = cover.title || project.title || 'MY PLANNER';
  const bookSubtitle = cover.subtitle || project.subtitle || '';
  const authorName = cover.author || project.author || 'Author Name';

  // Front Title
  const titleFontSize = Math.min(32, Math.floor(frontW / 12));
  const titleWidth = fontBold.widthOfTextAtSize(bookTitle, titleFontSize);
  pdfPage.drawText(bookTitle, {
    x: frontX + (frontW - titleWidth) / 2,
    y: frontTop - frontH * 0.35,
    size: titleFontSize,
    font: fontBold,
    color: textColor,
  });

  // Front Subtitle
  if (bookSubtitle) {
    const subtitleFontSize = 12;
    const subWidth = fontRegular.widthOfTextAtSize(bookSubtitle, subtitleFontSize);
    pdfPage.drawText(bookSubtitle, {
      x: frontX + (frontW - subWidth) / 2,
      y: frontTop - frontH * 0.35 - titleFontSize - 16,
      size: subtitleFontSize,
      font: fontRegular,
      color: textColor,
    });
  }

  // Front Category Badge or Year
  const yearText = `${project.year || 2026}`;
  const yearWidth = fontBold.widthOfTextAtSize(yearText, 14);
  pdfPage.drawText(yearText, {
    x: frontX + (frontW - yearWidth) / 2,
    y: frontTop - frontH * 0.22,
    size: 14,
    font: fontBold,
    color: accentColor,
  });

  // Front Author Name (Bottom)
  const authorFontSize = 12;
  const authorWidth = fontRegular.widthOfTextAtSize(authorName, authorFontSize);
  pdfPage.drawText(authorName, {
    x: frontX + (frontW - authorWidth) / 2,
    y: frontBottom + frameInset + 30,
    size: authorFontSize,
    font: fontRegular,
    color: textColor,
  });

  // 4. BACK COVER CONTENT
  const backX = coverDims.backCoverLeftPt;
  const backW = coverDims.trimWidthPt;
  const backBottom = coverDims.bleedPt;
  const backTop = backBottom + coverDims.trimHeightPt;

  // Back Cover Heading
  const backHeading = 'ABOUT THIS PLANNER';
  pdfPage.drawText(backHeading, {
    x: backX + frameInset,
    y: backTop - frameInset - 30,
    size: 12,
    font: fontBold,
    color: accentColor,
  });

  // Back Cover Blurb text
  const blurbText =
    cover.backCoverBlurb ||
    'Designed specifically for effortless daily productivity, focus, and intentional living. Printed on premium paper stock optimized for Amazon KDP physical paperback distribution.';
  
  // Simple word-wrap for blurb
  const words = blurbText.split(' ');
  let line = '';
  let lineY = backTop - frameInset - 50;
  const maxLineWidth = backW - frameInset * 2 - 20;

  for (const w of words) {
    const testLine = line + (line ? ' ' : '') + w;
    const testW = fontRegular.widthOfTextAtSize(testLine, 9);
    if (testW > maxLineWidth) {
      pdfPage.drawText(line, {
        x: backX + frameInset,
        y: lineY,
        size: 9,
        font: fontRegular,
        color: textColor,
      });
      line = w;
      lineY -= 14;
    } else {
      line = testLine;
    }
  }
  if (line) {
    pdfPage.drawText(line, {
      x: backX + frameInset,
      y: lineY,
      size: 9,
      font: fontRegular,
      color: textColor,
    });
  }

  // 5. BARCODE RESERVED SAFE AREA (Amazon KDP Back Cover Requirement)
  // Amazon strictly requires this 2" x 1.2" rectangle to remain unobstructed
  pdfPage.drawRectangle({
    x: coverDims.barcodeXPt,
    y: coverDims.barcodeYPt,
    width: coverDims.barcodeWidthPt,
    height: coverDims.barcodeHeightPt,
    color: rgb(1, 1, 1),
    borderWidth: 0.5,
    borderColor: rgb(0.8, 0.8, 0.8),
  });

  // Faint label indicating KDP Barcode Location
  const barcodeLabel = 'KDP BARCODE RESERVED ZONE';
  const bLabelW = fontRegular.widthOfTextAtSize(barcodeLabel, 7);
  pdfPage.drawText(barcodeLabel, {
    x: coverDims.barcodeXPt + (coverDims.barcodeWidthPt - bLabelW) / 2,
    y: coverDims.barcodeYPt + coverDims.barcodeHeightPt / 2 - 3,
    size: 7,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  // 6. SPINE RENDERING & SPINE TEXT
  // KDP Spine boundary guides (faint folding fold lines)
  pdfPage.drawLine({
    start: { x: coverDims.spineLeftPt, y: 0 },
    end: { x: coverDims.spineLeftPt, y: coverDims.totalHeightPt },
    thickness: 0.5,
    color: rgb(0.1, 0.1, 0.1),
  });
  pdfPage.drawLine({
    start: { x: coverDims.spineRightPt, y: 0 },
    end: { x: coverDims.spineRightPt, y: coverDims.totalHeightPt },
    thickness: 0.5,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Spine Text (Only if page count >= 79)
  if (pageCount >= 79 && cover.spineText) {
    const spineFontSize = Math.min(10, Math.max(7, Math.floor(coverDims.spineWidthPt * 0.7)));
    const spineText = cover.spineText;
    const textWidth = fontBold.widthOfTextAtSize(spineText, spineFontSize);

    // Render rotated text down the spine (Standard Western book binding: title reads top to bottom)
    const spineCenterX = coverDims.spineLeftPt + coverDims.spineWidthPt / 2;
    const spineCenterY = coverDims.totalHeightPt / 2;

    // In PDF standard rotation, 270 deg (or -90 deg) or standard vertical layout
    pdfPage.drawText(spineText, {
      x: spineCenterX + spineFontSize / 3,
      y: spineCenterY + textWidth / 2,
      size: spineFontSize,
      font: fontBold,
      rotate: degrees(-90),
      color: textColor,
    });
  }

  if (onProgress) {
    onProgress(100, 'Saving Full Cover Spread PDF...');
  }

  return await pdfDoc.save();
}
