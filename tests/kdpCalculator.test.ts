import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  calculateSpineWidthInches,
  isSpineTextAllowed,
  calculateGutterMarginInches,
  calculateOutsideMarginInches,
  calculateCoverDimensions,
  calculateInteriorDimensions,
} from '../src/utils/kdpCalculator';
import {
  isLeapYear,
  getDaysInMonth,
  generateMonthMatrix,
} from '../src/utils/calendarGenerator';
import { runKdpPreflightCheck } from '../src/utils/kdpValidator';
import { createDefaultProject } from '../src/utils/storage';

describe('Amazon KDP Mathematics & Specs', () => {
  test('Spine calculation follows official KDP multipliers', () => {
    // 100 pages white paper = 100 * 0.002252 = 0.2252 in
    const whiteSpine = calculateSpineWidthInches(100, 'white');
    assert.strictEqual(whiteSpine, 0.2252);

    // 100 pages cream paper = 100 * 0.0025 = 0.25 in
    const creamSpine = calculateSpineWidthInches(100, 'cream');
    assert.strictEqual(creamSpine, 0.25);

    // 100 pages color paper = 100 * 0.002347 = 0.2347 in
    const colorSpine = calculateSpineWidthInches(100, 'color');
    assert.strictEqual(colorSpine, 0.2347);
  });

  test('Spine text rule strictly enforces 79 page KDP threshold', () => {
    assert.strictEqual(isSpineTextAllowed(78), false);
    assert.strictEqual(isSpineTextAllowed(79), true);
    assert.strictEqual(isSpineTextAllowed(120), true);
  });

  test('Gutter margins scale appropriately with page count', () => {
    assert.strictEqual(calculateGutterMarginInches(50), 0.375);
    assert.strictEqual(calculateGutterMarginInches(150), 0.375);
    assert.strictEqual(calculateGutterMarginInches(151), 0.500);
    assert.strictEqual(calculateGutterMarginInches(300), 0.500);
    assert.strictEqual(calculateGutterMarginInches(350), 0.625);
  });

  test('Cover dimensions spread includes 0.125" bleed and spine', () => {
    const dims = calculateCoverDimensions({
      trimWidthInches: 6.0,
      trimHeightInches: 9.0,
      pageCount: 100,
      paperType: 'white',
    });
    // Total Width = 0.125 + 6.0 + 0.2252 + 6.0 + 0.125 = 12.4752 -> approx 12.475
    assert.strictEqual(dims.totalWidthInches, 12.475);
    // Total Height = 0.125 + 9.0 + 0.125 = 9.25
    assert.strictEqual(dims.totalHeightInches, 9.25);
  });

  test('Interior dimensions alternate margins for even and odd pages', () => {
    const evenPage = calculateInteriorDimensions({
      trimWidthInches: 6.0,
      trimHeightInches: 9.0,
      hasBleed: false,
      pageCount: 100,
      isEvenPage: true,
    });
    // Even page (Left page): Margin Left is Outer (18pt), Margin Right is Gutter (27pt)
    assert.strictEqual(evenPage.marginLeftPt, 18);
    assert.strictEqual(evenPage.marginRightPt, 27);

    const oddPage = calculateInteriorDimensions({
      trimWidthInches: 6.0,
      trimHeightInches: 9.0,
      hasBleed: false,
      pageCount: 100,
      isEvenPage: false,
    });
    // Odd page (Right page): Margin Left is Gutter (27pt), Margin Right is Outer (18pt)
    assert.strictEqual(oddPage.marginLeftPt, 27);
    assert.strictEqual(oddPage.marginRightPt, 18);
  });
});

describe('Accurate Calendar Math', () => {
  test('Leap year detection is accurate', () => {
    assert.strictEqual(isLeapYear(2024), true);
    assert.strictEqual(isLeapYear(2026), false);
    assert.strictEqual(isLeapYear(2028), true);
    assert.strictEqual(isLeapYear(2100), false);
    assert.strictEqual(isLeapYear(2000), true);
  });

  test('Days in month are exact', () => {
    assert.strictEqual(getDaysInMonth(2026, 0), 31); // Jan 2026
    assert.strictEqual(getDaysInMonth(2026, 1), 28); // Feb 2026
    assert.strictEqual(getDaysInMonth(2028, 1), 29); // Feb 2028 leap year
    assert.strictEqual(getDaysInMonth(2026, 3), 30); // Apr 2026
  });

  test('7-column matrix aligns weekday columns', () => {
    const month = generateMonthMatrix(2026, 0, 1); // Jan 2026, Monday start
    assert.strictEqual(month.monthName, 'January');
    assert.strictEqual(month.daysInMonth, 31);
    assert.strictEqual(month.weeks[0].length, 7);
  });
});

describe('KDP Preflight Validator', () => {
  test('Default project passes preflight validation', () => {
    const project = createDefaultProject('Weekly Planner', 80);
    const report = runKdpPreflightCheck(project);
    assert.strictEqual(report.overallStatus, 'PASS');
    assert.strictEqual(report.spineTextAllowed, true);
  });
});
