import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseBreederSpreadsheet, cleanNumber, extractFlockMetadata } from './excel-importer';

describe('Spreadsheet Importer Module', () => {
  it('correctly cleans thousand separators, strings and percents', () => {
    expect(cleanNumber('8,931')).toBe(8931);
    expect(cleanNumber(' 9,211 ')).toBe(9211);
    expect(cleanNumber('3.04%')).toBe(3.04);
    expect(cleanNumber(null)).toBe(null);
    expect(cleanNumber('')).toBe(null);
  });

  it('extracts flock metadata from sheet name', () => {
    const meta = extractFlockMetadata('1.F-2866. (Ross)', []);
    expect(meta.flockNo).toBe('2866');
    expect(meta.shedNo).toBe('01');
    expect(meta.breed).toBe('Ross');
  });

  it('parses a multi-sheet workbook, skips non-flock sheets, and recomputes depletion', () => {
    const wb = XLSX.utils.book_new();

    // Flock Sheet
    const flockSheetData = [
      ['UNIT-B FLOCK RECORD'],
      ['Shed No-01', 'Flock No-2866.', 'Breed: Ross'],
      [],
      [
        'Date end of week', 'Age in week',
        'Housing Birds F', 'Housing Birds M',
        'Weekly Mortality F', 'Weekly Mortality M',
        'Weekly Sold F', 'Weekly Sold M',
        'Derived Dep F %', 'Derived Cum Dep F %', // Ignored!
        'Std Weight F', 'Actual Weight F'
      ],
      // Row 1: Week 1
      ['2025-07-12', 1, '9,211', '1,340', 280, 53, 0, 0, '99.9%', '99.9%', 115, 161],
      // Row 2: Week 2
      ['2025-07-19', 2, '8,931', '1,287', 118, 62, 0, 0, '99.9%', '99.9%', 215, 314],
    ];
    const wsFlock = XLSX.utils.aoa_to_sheet(flockSheetData);
    XLSX.utils.book_append_sheet(wb, wsFlock, '1.F-2866. (Ross)');

    // Summary Sheet (Non-flock)
    const wsSummary = XLSX.utils.aoa_to_sheet([['Summary Sheet'], ['Total Sheds: 10']]);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const report = parseBreederSpreadsheet(buffer, 'test.xlsx');

    expect(report.totalSheets).toBe(2);
    expect(report.validFlockSheets).toBe(1);
    expect(report.skippedSheets).toBe(1);

    const flock = report.flocks.find((f) => f.flockNo === '2866');
    expect(flock).toBeDefined();
    expect(flock?.records.length).toBe(2);

    // Verify derived values were recomputed rather than using sheet's dummy '99.9%'
    const week1Computed = flock?.computedRecords[0];
    expect(week1Computed?.display.weeklyDepletionPctF).toBe('3.04%');
    expect(week1Computed?.display.weeklyDepletionPctM).toBe('3.96%');
    expect(week1Computed?.display.weightDeviationGF).toBe('+46');
  });
});
