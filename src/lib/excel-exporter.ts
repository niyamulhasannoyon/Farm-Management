import * as XLSX from 'xlsx';
import { ComputedWeeklyRecord, computeFlockRecords } from './calculations';
import { MockFlock, getStoredFlockRecords, INITIAL_FLOCKS } from './mockData';

/**
 * Exports a single flock's complete history to an Excel (.xlsx) file
 */
export function exportSingleFlockExcel(flock: MockFlock, records: ComputedWeeklyRecord[]) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [`RBCL UNIT-${flock.unit} POULTRY BREEDER FARM - FLOCK GROWING RECORD`],
    [`Flock No: ${flock.flockNo}`, `Shed No: ${flock.shedNo}`, `Breed: ${flock.breed}`, `Housing Date: ${flock.housingDate}`],
    [],
    [
      // Tier 1 Header
      'Week Timeline', '',
      'Female Birds Block (মাদি)', '', '', '', '', '', '', '', '', '',
      'Male Birds Block (মোরগ)', '', '', '', '', '', '', '', '', ''
    ],
    [
      // Tier 2 Column Names
      'Date End', 'Age (Wk)',
      'Housed F', 'Mort F', 'Sold F', 'Depletion F %', 'Cum Dep F %', 'Std Wt F (g)', 'Actual Wt F (g)', 'Dev F (g)', 'Uniformity F %', 'Feed F (g/bird)',
      'Housed M', 'Mort M', 'Sold M', 'Depletion M %', 'Cum Dep M %', 'Std Wt M (g)', 'Actual Wt M (g)', 'Dev M (g)', 'Uniformity M %', 'Feed M (g/bird)'
    ]
  ];

  const dataRows = records.map((r) => [
    r.weekEndDate,
    r.ageWeeks,
    r.housedF,
    r.mortalityF,
    r.soldF,
    r.display.weeklyDepletionPctF,
    r.display.cumulativeDepletionPctF,
    r.stdWeightF ?? '',
    r.actualWeightF ?? '',
    r.display.weightDeviationGF,
    r.uniformityF ?? '',
    r.feedGPerBirdF ?? '',
    r.housedM,
    r.mortalityM,
    r.soldM,
    r.display.weeklyDepletionPctM,
    r.display.cumulativeDepletionPctM,
    r.stdWeightM ?? '',
    r.actualWeightM ?? '',
    r.display.weightDeviationGM,
    r.uniformityM ?? '',
    r.feedGPerBirdM ?? ''
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);

  // Set column widths for clean readability
  ws['!cols'] = [
    { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
  ];

  const sheetName = `${flock.shedNo}.F-${flock.flockNo}. (${flock.breed})`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, `RBCL_Flock_${flock.flockNo}_Shed_${flock.shedNo}.xlsx`);
}

/**
 * Exports all active flocks in a multi-sheet Excel workbook + Summary sheet
 */
export function exportAllFlocksExcel(flocks: MockFlock[]) {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeader = [
    ['RBCL UNIT-B POULTRY BREEDER FARM - ALL ACTIVE FLOCKS SUMMARY'],
    [`Generated: ${new Date().toISOString().split('T')[0]}`],
    [],
    ['Shed No', 'Flock No', 'Breed', 'Housing Date', 'Current Age (Wks)', 'Live Birds F', 'Live Birds M', 'Cum. Depletion F %', 'Actual Wt F (g)', 'Std Wt F (g)', 'Dev F (g)']
  ];

  const summaryRows = flocks.map((flock) => {
    const raw = getStoredFlockRecords(flock.id);
    const computed = computeFlockRecords(raw);
    const latest = computed[computed.length - 1];

    return [
      flock.shedNo,
      flock.flockNo,
      flock.breed,
      flock.housingDate,
      latest ? latest.ageWeeks : 0,
      latest ? latest.liveAtWeekEndF : 0,
      latest ? latest.liveAtWeekEndM : 0,
      latest ? latest.display.cumulativeDepletionPctF : '—',
      latest ? (latest.actualWeightF ?? '—') : '—',
      latest ? (latest.stdWeightF ?? '—') : '—',
      latest ? latest.display.weightDeviationGF : '—',
    ];
  });

  const wsSummary = XLSX.utils.aoa_to_sheet([...summaryHeader, ...summaryRows]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Unit-B Summary');

  // 2. Individual Flock Sheets
  for (const flock of flocks) {
    const raw = getStoredFlockRecords(flock.id);
    const computed = computeFlockRecords(raw);

    const titleRows = [
      [`Flock ${flock.flockNo} - Shed ${flock.shedNo} (${flock.breed})`],
      [],
      [
        'Date End', 'Age (Wk)',
        'Housed F', 'Mort F', 'Sold F', 'Depletion F %', 'Cum Dep F %', 'Actual Wt F (g)', 'Std Wt F (g)', 'Dev F (g)',
        'Housed M', 'Mort M', 'Sold M', 'Depletion M %', 'Cum Dep M %', 'Actual Wt M (g)'
      ]
    ];

    const dataRows = computed.map((r) => [
      r.weekEndDate,
      r.ageWeeks,
      r.housedF,
      r.mortalityF,
      r.soldF,
      r.display.weeklyDepletionPctF,
      r.display.cumulativeDepletionPctF,
      r.actualWeightF ?? '',
      r.stdWeightF ?? '',
      r.display.weightDeviationGF,
      r.housedM,
      r.mortalityM,
      r.soldM,
      r.display.weeklyDepletionPctM,
      r.display.cumulativeDepletionPctM,
      r.actualWeightM ?? '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);
    const sheetName = `${flock.shedNo}.F-${flock.flockNo}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `RBCL_Unit_B_All_Flocks_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
