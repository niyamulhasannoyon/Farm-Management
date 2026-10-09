import * as XLSX from 'xlsx';
import { WeeklyInputData, computeFlockRecords, ComputedWeeklyRecord } from './calculations';

export interface ParsedSheetFlock {
  sheetName: string;
  isFlockSheet: boolean;
  skipReason?: string;
  flockNo: string;
  shedNo: string;
  breed: string;
  records: WeeklyInputData[];
  computedRecords: ComputedWeeklyRecord[];
  warnings: string[];
  errors: string[];
}

export interface ImportReport {
  fileName: string;
  totalSheets: number;
  validFlockSheets: number;
  skippedSheets: number;
  flocks: ParsedSheetFlock[];
  totalRecords: number;
}

/**
 * Sanitizes numeric cells: strips thousand separators ('8,931' -> 8931), quotes, % signs
 */
export function cleanNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parses date cells from Excel/LibreOffice
 */
export function parseExcelDate(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    // Excel serial date to JS Date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return str;
}

/**
 * Extracts metadata from sheet name or top header cells:
 * e.g. Sheet name "1.F-2866. (Ross)" -> Shed 01, Flock 2866, Breed Ross
 */
export function extractFlockMetadata(sheetName: string, rawHeaderRows: unknown[][]) {
  let flockNo = '';
  let shedNo = '01';
  let breed = 'Ross';

  // 1. Check sheet name
  const flockMatch = sheetName.match(/(\d{4})/);
  if (flockMatch) {
    flockNo = flockMatch[1];
  }

  const shedMatch = sheetName.match(/^(\d+)\./);
  if (shedMatch) {
    shedNo = shedMatch[1].padStart(2, '0');
  }

  if (sheetName.toLowerCase().includes('ross')) breed = 'Ross';
  else if (sheetName.toLowerCase().includes('ir')) breed = 'IR';
  else if (sheetName.toLowerCase().includes('sasso')) breed = 'SASSO';

  // 2. Scan top header cells for explicit text like "Shed No-01" or "Flock No-2866."
  for (const row of rawHeaderRows.slice(0, 10)) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (!cell) continue;
      const str = String(cell);
      const shedCellMatch = str.match(/Shed\s*No[-\s:]*(\d+)/i);
      if (shedCellMatch) {
        shedNo = shedCellMatch[1].padStart(2, '0');
      }
      const flockCellMatch = str.match(/Flock\s*No[-\s:]*(\d+)/i);
      if (flockCellMatch) {
        flockNo = flockCellMatch[1];
      }
      if (/ross/i.test(str)) breed = 'Ross';
      if (/sasso/i.test(str)) breed = 'SASSO';
      if (/\bir\b/i.test(str)) breed = 'IR';
    }
  }

  return { flockNo, shedNo, breed };
}

/**
 * Parses a buffer of .ods or .xlsx
 */
export function parseBreederSpreadsheet(buffer: ArrayBuffer | Uint8Array, fileName: string): ImportReport {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const flocks: ParsedSheetFlock[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Convert sheet to 2D array of rows
    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rawRows.length < 4) {
      flocks.push({
        sheetName,
        isFlockSheet: false,
        skipReason: 'Empty or insufficient rows',
        flockNo: '',
        shedNo: '',
        breed: '',
        records: [],
        computedRecords: [],
        warnings: [],
        errors: [],
      });
      continue;
    }

    const { flockNo, shedNo, breed } = extractFlockMetadata(sheetName, rawRows);

    if (!flockNo) {
      // Non-flock sheet (e.g. Summary or Instructions)
      flocks.push({
        sheetName,
        isFlockSheet: false,
        skipReason: 'No flock number found (non-flock sheet)',
        flockNo: '',
        shedNo: '',
        breed: '',
        records: [],
        computedRecords: [],
        warnings: [],
        errors: [],
      });
      continue;
    }

    // Find the starting row of weekly data.
    // Data starts after the two-row grouped header, where column for Age is a number (1, 2, 3...)
    let dataStartRowIndex = -1;
    for (let r = 0; r < rawRows.length; r++) {
      const row = rawRows[r];
      // Check if row has an Age cell that equals 1
      const ageCell = cleanNumber(row[1]);
      if (ageCell === 1) {
        dataStartRowIndex = r;
        break;
      }
    }

    // Fallback search: look for row where Date column has a date or Age is 1
    if (dataStartRowIndex === -1) {
      for (let r = 0; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (cleanNumber(row[0]) === 1 || cleanNumber(row[1]) === 1) {
          dataStartRowIndex = r;
          break;
        }
      }
    }

    if (dataStartRowIndex === -1) {
      flocks.push({
        sheetName,
        isFlockSheet: true,
        skipReason: 'Could not detect weekly data rows (age 1 not found)',
        flockNo,
        shedNo,
        breed,
        records: [],
        computedRecords: [],
        warnings: ['Failed to locate starting row with Age 1'],
        errors: ['Invalid sheet format'],
      });
      continue;
    }

    const parsedRecords: WeeklyInputData[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (let r = dataStartRowIndex; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const dateVal = parseExcelDate(row[0]);
      const ageVal = cleanNumber(row[1]);

      if (!ageVal || isNaN(ageVal)) {
        // End of data rows
        break;
      }

      // Column order in LibreOffice sheet:
      // 0: Date end of week
      // 1: Age in week
      // 2: Housing Birds F
      // 3: Housing Birds M (or combined housed)
      // 4: Weekly Mortality F
      // 5: Weekly Mortality M
      // 6: Weekly Sold F
      // 7: Weekly Sold M
      // (Columns 8, 9, 10 are derived depletion % in spreadsheet -> WE IGNORE THEM!)
      // Then weights blocks:
      // 11: Std Wt F, 12: Actual Wt F
      // 13: Std Wt M, 14: Actual Wt M
      // 15: Uniformity F
      // 16: Feed g/bird F

      const housedF = cleanNumber(row[2]) || 0;
      const housedM = cleanNumber(row[3]) || 0;
      const mortF = cleanNumber(row[4]) || 0;
      const mortM = cleanNumber(row[5]) || 0;
      const soldF = cleanNumber(row[6]) || 0;
      const soldM = cleanNumber(row[7]) || 0;

      // Extract weights (looking through columns 10-18)
      const stdWtF = cleanNumber(row[10]) ?? cleanNumber(row[11]);
      const actWtF = cleanNumber(row[11]) ?? cleanNumber(row[12]);
      const stdWtM = cleanNumber(row[13]) ?? cleanNumber(row[14]);
      const actWtM = cleanNumber(row[14]) ?? cleanNumber(row[15]);

      const unifF = cleanNumber(row[16]);
      const feedF = cleanNumber(row[17]);

      if (mortF + soldF > housedF && housedF > 0) {
        warnings.push(`Week ${ageVal}: Female depletion (${mortF + soldF}) exceeds housed (${housedF}).`);
      }

      parsedRecords.push({
        ageWeeks: ageVal,
        weekEndDate: dateVal || `Week-${ageVal}`,
        housedF,
        housedM,
        mortalityF: mortF,
        mortalityM: mortM,
        soldF,
        soldM,
        stdWeightF: stdWtF,
        actualWeightF: actWtF,
        stdWeightM: stdWtM,
        actualWeightM: actWtM,
        uniformityF: unifF,
        uniformityM: null,
        feedGPerBirdF: feedF,
        feedGPerBirdM: null,
      });
    }

    // Recompute all derived columns dynamically using formula engine!
    const computed = computeFlockRecords(parsedRecords);

    flocks.push({
      sheetName,
      isFlockSheet: true,
      flockNo,
      shedNo,
      breed,
      records: parsedRecords,
      computedRecords: computed,
      warnings,
      errors,
    });
  }

  const validFlocks = flocks.filter((f) => f.isFlockSheet && f.records.length > 0);

  return {
    fileName,
    totalSheets: workbook.SheetNames.length,
    validFlockSheets: validFlocks.length,
    skippedSheets: workbook.SheetNames.length - validFlocks.length,
    flocks,
    totalRecords: validFlocks.reduce((sum, f) => sum + f.records.length, 0),
  };
}
