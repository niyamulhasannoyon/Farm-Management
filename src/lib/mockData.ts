import { WeeklyInputData, calculateLiveAtWeekEnd } from './calculations';

export interface MockFlock {
  id: string;
  flockNo: string;
  shedNo: string;
  breed: string;
  unit: string;
  housingDate: string;
  status: 'ACTIVE' | 'CLOSED';
}

export const INITIAL_FLOCKS: MockFlock[] = [
  {
    id: 'flock-2866',
    flockNo: '2866',
    shedNo: '01',
    breed: 'Ross',
    unit: 'B',
    housingDate: '2025-07-05',
    status: 'ACTIVE',
  },
  {
    id: 'flock-2867',
    flockNo: '2867',
    shedNo: '02',
    breed: 'Ross',
    unit: 'B',
    housingDate: '2025-07-12',
    status: 'ACTIVE',
  },
  {
    id: 'flock-2868',
    flockNo: '2868',
    shedNo: '03',
    breed: 'IR',
    unit: 'B',
    housingDate: '2025-08-01',
    status: 'ACTIVE',
  },
];

export const ROSS_STANDARD_CURVE: Record<number, { f: number; m: number }> = {
  1: { f: 115, m: 125 },
  2: { f: 215, m: 235 },
  3: { f: 335, m: 370 },
  4: { f: 465, m: 515 },
  5: { f: 585, m: 650 },
  6: { f: 695, m: 775 },
  7: { f: 795, m: 890 },
  8: { f: 895, m: 1000 },
  9: { f: 995, m: 1115 },
  10: { f: 1095, m: 1230 },
  11: { f: 1195, m: 1345 },
  12: { f: 1295, m: 1460 },
  13: { f: 1395, m: 1575 },
  14: { f: 1495, m: 1690 },
  15: { f: 1595, m: 1805 },
  16: { f: 1705, m: 1925 },
  17: { f: 1825, m: 2050 },
  18: { f: 1950, m: 2180 },
  19: { f: 2085, m: 2320 },
  20: { f: 2225, m: 2470 },
  21: { f: 2370, m: 2630 },
  22: { f: 2520, m: 2800 },
};

// Seed data provided in prompt for Flock 2866, Shed 01, Ross
export const INITIAL_RECORDS_2866: WeeklyInputData[] = [
  { weekEndDate: '2025-07-12', ageWeeks: 1, housedF: 9211, housedM: 1340, mortalityF: 280, mortalityM: 53, soldF: 0, soldM: 0, stdWeightF: 115, actualWeightF: 161, stdWeightM: 125, actualWeightM: null, uniformityF: 82, uniformityM: null, feedGPerBirdF: 24, feedGPerBirdM: null },
  { weekEndDate: '2025-07-19', ageWeeks: 2, housedF: 8931, housedM: 1287, mortalityF: 118, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 215, actualWeightF: 314, stdWeightM: 235, actualWeightM: null, uniformityF: 83, uniformityM: null, feedGPerBirdF: 32, feedGPerBirdM: null },
  { weekEndDate: '2025-07-26', ageWeeks: 3, housedF: 8813, housedM: 1225, mortalityF: 125, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 335, actualWeightF: 444, stdWeightM: 370, actualWeightM: null, uniformityF: 84, uniformityM: null, feedGPerBirdF: 40, feedGPerBirdM: null },
  { weekEndDate: '2025-08-02', ageWeeks: 4, housedF: 8688, housedM: 1163, mortalityF: 17, mortalityM: 33, soldF: 0, soldM: 0, stdWeightF: 465, actualWeightF: 556, stdWeightM: 515, actualWeightM: null, uniformityF: 85, uniformityM: null, feedGPerBirdF: 48, feedGPerBirdM: null },
  { weekEndDate: '2025-08-09', ageWeeks: 5, housedF: 8671, housedM: 1130, mortalityF: 4, mortalityM: 15, soldF: 0, soldM: 8, stdWeightF: 585, actualWeightF: 590, stdWeightM: 650, actualWeightM: null, uniformityF: 85, uniformityM: null, feedGPerBirdF: 54, feedGPerBirdM: null },
  { weekEndDate: '2025-08-16', ageWeeks: 6, housedF: 8667, housedM: 1107, mortalityF: 3, mortalityM: 1, soldF: 0, soldM: 46, stdWeightF: 695, actualWeightF: 706, stdWeightM: 775, actualWeightM: null, uniformityF: 86, uniformityM: null, feedGPerBirdF: 60, feedGPerBirdM: null },
  { weekEndDate: '2025-08-23', ageWeeks: 7, housedF: 8664, housedM: 1060, mortalityF: 4, mortalityM: 0, soldF: 4, soldM: 12, stdWeightF: 795, actualWeightF: 816, stdWeightM: 890, actualWeightM: null, uniformityF: 86, uniformityM: null, feedGPerBirdF: 66, feedGPerBirdM: null },
  { weekEndDate: '2025-08-30', ageWeeks: 8, housedF: 8656, housedM: 1048, mortalityF: 6, mortalityM: 0, soldF: 9, soldM: 10, stdWeightF: 895, actualWeightF: 873, stdWeightM: 1000, actualWeightM: null, uniformityF: 87, uniformityM: null, feedGPerBirdF: 72, feedGPerBirdM: null },
  { weekEndDate: '2025-09-06', ageWeeks: 9, housedF: 8641, housedM: 1038, mortalityF: 4, mortalityM: 0, soldF: 0, soldM: 1, stdWeightF: 995, actualWeightF: 1012, stdWeightM: 1115, actualWeightM: null, uniformityF: 88, uniformityM: null, feedGPerBirdF: 78, feedGPerBirdM: null },
  { weekEndDate: '2025-09-13', ageWeeks: 10, housedF: 8637, housedM: 1037, mortalityF: 1, mortalityM: 0, soldF: 0, soldM: 5, stdWeightF: 1095, actualWeightF: 1134, stdWeightM: 1230, actualWeightM: null, uniformityF: 88, uniformityM: null, feedGPerBirdF: 83, feedGPerBirdM: null },
  { weekEndDate: '2025-09-20', ageWeeks: 11, housedF: 8636, housedM: 1032, mortalityF: 2, mortalityM: 1, soldF: 2, soldM: 10, stdWeightF: 1195, actualWeightF: 1240, stdWeightM: 1345, actualWeightM: null, uniformityF: 89, uniformityM: null, feedGPerBirdF: 88, feedGPerBirdM: null },
  { weekEndDate: '2025-09-27', ageWeeks: 12, housedF: 8632, housedM: 1021, mortalityF: 5, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1295, actualWeightF: 1346, stdWeightM: 1460, actualWeightM: null, uniformityF: 89, uniformityM: null, feedGPerBirdF: 93, feedGPerBirdM: null },
  { weekEndDate: '2025-10-04', ageWeeks: 13, housedF: 8627, housedM: 1020, mortalityF: 0, mortalityM: 5, soldF: 0, soldM: 2, stdWeightF: 1395, actualWeightF: 1457, stdWeightM: 1575, actualWeightM: null, uniformityF: 89, uniformityM: null, feedGPerBirdF: 98, feedGPerBirdM: null },
  { weekEndDate: '2025-10-11', ageWeeks: 14, housedF: 8627, housedM: 1013, mortalityF: 1, mortalityM: 6, soldF: 0, soldM: 42, stdWeightF: 1495, actualWeightF: 1574, stdWeightM: 1690, actualWeightM: null, uniformityF: 90, uniformityM: null, feedGPerBirdF: 102, feedGPerBirdM: null },
  { weekEndDate: '2025-10-18', ageWeeks: 15, housedF: 8626, housedM: 965, mortalityF: 7, mortalityM: 5, soldF: 26, soldM: 6, stdWeightF: 1595, actualWeightF: 1687, stdWeightM: 1805, actualWeightM: null, uniformityF: 90, uniformityM: null, feedGPerBirdF: 106, feedGPerBirdM: null },
  { weekEndDate: '2025-10-25', ageWeeks: 16, housedF: 8593, housedM: 954, mortalityF: 6, mortalityM: 2, soldF: 50, soldM: 0, stdWeightF: 1705, actualWeightF: 1838, stdWeightM: 1925, actualWeightM: null, uniformityF: 91, uniformityM: null, feedGPerBirdF: 110, feedGPerBirdM: null },
  { weekEndDate: '2025-11-01', ageWeeks: 17, housedF: 8537, housedM: 952, mortalityF: 7, mortalityM: 6, soldF: 3, soldM: 10, stdWeightF: 1825, actualWeightF: 1939, stdWeightM: 2050, actualWeightM: null, uniformityF: 91, uniformityM: null, feedGPerBirdF: 114, feedGPerBirdM: null },
  { weekEndDate: '2025-11-08', ageWeeks: 18, housedF: 8527, housedM: 936, mortalityF: 1, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1950, actualWeightF: 2074, stdWeightM: 2180, actualWeightM: null, uniformityF: 92, uniformityM: null, feedGPerBirdF: 118, feedGPerBirdM: null },
  { weekEndDate: '2025-11-15', ageWeeks: 19, housedF: 8526, housedM: 935, mortalityF: 5, mortalityM: 7, soldF: 0, soldM: 0, stdWeightF: 2085, actualWeightF: 2224, stdWeightM: 2320, actualWeightM: null, uniformityF: 92, uniformityM: null, feedGPerBirdF: 122, feedGPerBirdM: null },
];

/**
 * Gets flock records from storage (or initializes with Flock 2866 seed)
 */
export function getStoredFlockRecords(flockId: string): WeeklyInputData[] {
  if (typeof window === 'undefined') {
    return flockId === 'flock-2866' ? INITIAL_RECORDS_2866 : [];
  }

  const key = `rbcl_flock_records_${flockId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // parse error, fallback
    }
  }

  if (flockId === 'flock-2866') {
    localStorage.setItem(key, JSON.stringify(INITIAL_RECORDS_2866));
    return INITIAL_RECORDS_2866;
  }

  if (flockId === 'flock-2867') {
    // Shed 02: Ross breed, 18 weeks, slightly better depletion
    const records2867: WeeklyInputData[] = INITIAL_RECORDS_2866.slice(0, 18).map((r) => ({
      ...r,
      mortalityF: Math.max(1, Math.round(r.mortalityF * 0.85)),
      mortalityM: Math.max(1, Math.round(r.mortalityM * 0.8)),
      actualWeightF: r.actualWeightF ? Math.round(r.actualWeightF * 0.98) : null,
    }));
    localStorage.setItem(key, JSON.stringify(records2867));
    return records2867;
  }

  if (flockId === 'flock-2868') {
    // Shed 03: IR breed, 16 weeks
    const records2868: WeeklyInputData[] = INITIAL_RECORDS_2866.slice(0, 16).map((r) => ({
      ...r,
      mortalityF: Math.max(1, Math.round(r.mortalityF * 1.1)),
      mortalityM: Math.max(1, Math.round(r.mortalityM * 1.05)),
      actualWeightF: r.actualWeightF ? Math.round(r.actualWeightF * 1.02) : null,
    }));
    localStorage.setItem(key, JSON.stringify(records2868));
    return records2868;
  }

  return [];
}

/**
 * Saves flock records into localStorage
 */
export function saveStoredFlockRecords(flockId: string, records: WeeklyInputData[]) {
  if (typeof window === 'undefined') return;
  const key = `rbcl_flock_records_${flockId}`;
  localStorage.setItem(key, JSON.stringify(records));
}

/**
 * Computes prefill values for next week's entry form:
 * - age_weeks = latest_age + 1
 * - week_end_date = latest_date + 7 days
 * - housed_f = previous week's live_at_week_end_f
 * - housed_m = previous week's live_at_week_end_m
 * - std_weight_f / std_weight_m auto-filled from breed curve!
 */
export function getNextWeekPrefill(flockId: string, breed: string = 'Ross') {
  const records = getStoredFlockRecords(flockId);
  if (records.length === 0) {
    return {
      ageWeeks: 1,
      weekEndDate: new Date().toISOString().split('T')[0],
      housedF: 9000,
      housedM: 1300,
      stdWeightF: ROSS_STANDARD_CURVE[1]?.f || 115,
      stdWeightM: ROSS_STANDARD_CURVE[1]?.m || 125,
    };
  }

  const latest = [...records].sort((a, b) => b.ageWeeks - a.ageWeeks)[0];
  const nextAge = latest.ageWeeks + 1;

  // Add 7 days to previous week_end_date
  const prevDate = new Date(latest.weekEndDate);
  prevDate.setDate(prevDate.getDate() + 7);
  const nextDateStr = prevDate.toISOString().split('T')[0];

  const prevLiveF = calculateLiveAtWeekEnd(latest.housedF, latest.mortalityF, latest.soldF);
  const prevLiveM = calculateLiveAtWeekEnd(latest.housedM, latest.mortalityM, latest.soldM);

  const stdCurve = ROSS_STANDARD_CURVE[nextAge] || { f: null, m: null };

  return {
    ageWeeks: nextAge,
    weekEndDate: nextDateStr,
    housedF: prevLiveF,
    housedM: prevLiveM,
    stdWeightF: stdCurve.f,
    stdWeightM: stdCurve.m,
  };
}
