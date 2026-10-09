/**
 * RBCL Flock Monitor - Business Logic & Calculations Engine
 * 
 * Rules:
 * - Never store derived values in the database.
 * - Compute derived values dynamically.
 * - Formulas match the existing LibreOffice spreadsheet exactly.
 */

export interface WeeklyInputData {
  ageWeeks: number;
  weekEndDate: string | Date;
  housedF: number;
  housedM: number;
  mortalityF: number;
  mortalityM: number;
  soldF: number;
  soldM: number;
  stdWeightF?: number | null;
  actualWeightF?: number | null;
  stdWeightM?: number | null;
  actualWeightM?: number | null;
  uniformityF?: number | null;
  uniformityM?: number | null;
  feedGPerBirdF?: number | null;
  feedGPerBirdM?: number | null;
}

export interface ComputedWeeklyRecord extends WeeklyInputData {
  // Live counts at end of week
  liveAtWeekEndF: number;
  liveAtWeekEndM: number;
  liveAtWeekEndTotal: number;

  // Next week recommended housed prefill
  nextHousedPrefillF: number;
  nextHousedPrefillM: number;

  // Depletion % (mortality + sold) / housed * 100
  weeklyDepletionPctF: number;
  weeklyDepletionPctM: number;
  weeklyDepletionPctTotal: number;

  // Cumulative depletion % (running sum of weekly_depletion_pct)
  cumulativeDepletionPctF: number;
  cumulativeDepletionPctM: number;
  cumulativeDepletionPctTotal: number;

  // Mortality % mortality / housed * 100
  weeklyMortalityPctF: number;
  weeklyMortalityPctM: number;
  weeklyMortalityPctTotal: number;

  // Cumulative mortality % (running sum)
  cumulativeMortalityPctF: number;
  cumulativeMortalityPctM: number;

  // Weight deviations (grams)
  weightDeviationGF: number | null;
  weightDeviationGM: number | null;

  // Weight deviations (% of standard)
  weightDeviationPctF: number | null;
  weightDeviationPctM: number | null;

  // Formatted display values (2 decimal places)
  display: {
    weeklyDepletionPctF: string;
    weeklyDepletionPctM: string;
    cumulativeDepletionPctF: string;
    cumulativeDepletionPctM: string;
    weeklyMortalityPctF: string;
    weeklyMortalityPctM: string;
    weightDeviationGF: string;
    weightDeviationGM: string;
    weightDeviationPctF: string;
    weightDeviationPctM: string;
  };
}

/**
 * Rounds a number to a specified number of decimal places (default 2)
 */
export function round(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Live birds at week end: housed - mortality - sold
 */
export function calculateLiveAtWeekEnd(housed: number, mortality: number = 0, sold: number = 0): number {
  return Math.max(0, housed - (mortality || 0) - (sold || 0));
}

/**
 * Weekly depletion %: (mortality + sold) / housed * 100
 */
export function calculateWeeklyDepletionPct(housed: number, mortality: number = 0, sold: number = 0): number {
  if (!housed || housed <= 0) return 0;
  const totalLost = (mortality || 0) + (sold || 0);
  return (totalLost / housed) * 100;
}

/**
 * Weekly mortality %: mortality / housed * 100
 */
export function calculateWeeklyMortalityPct(housed: number, mortality: number = 0): number {
  if (!housed || housed <= 0) return 0;
  return ((mortality || 0) / housed) * 100;
}

/**
 * Weight deviation in grams: actual_weight - std_weight
 */
export function calculateWeightDeviationG(actualWeight: number | null | undefined, stdWeight: number | null | undefined): number | null {
  if (actualWeight === null || actualWeight === undefined || stdWeight === null || stdWeight === undefined) {
    return null;
  }
  return actualWeight - stdWeight;
}

/**
 * Weight deviation as % of standard: (actual_weight - std_weight) / std_weight * 100
 */
export function calculateWeightDeviationPct(actualWeight: number | null | undefined, stdWeight: number | null | undefined): number | null {
  if (actualWeight === null || actualWeight === undefined || !stdWeight || stdWeight <= 0) {
    return null;
  }
  return ((actualWeight - stdWeight) / stdWeight) * 100;
}

/**
 * Computes live single-row calculations (used for mobile entry form preview while typing)
 * Note: cumulative depletion requires running sum from prior weeks; pass previousCumulativeDepletion if available.
 */
export function calculateSingleWeekPreview(
  input: WeeklyInputData,
  prevCumulativeDepletionF: number = 0,
  prevCumulativeDepletionM: number = 0
): Omit<ComputedWeeklyRecord, 'cumulativeMortalityPctF' | 'cumulativeMortalityPctM'> {
  const liveF = calculateLiveAtWeekEnd(input.housedF, input.mortalityF, input.soldF);
  const liveM = calculateLiveAtWeekEnd(input.housedM, input.mortalityM, input.soldM);

  const weeklyDepF = calculateWeeklyDepletionPct(input.housedF, input.mortalityF, input.soldF);
  const weeklyDepM = calculateWeeklyDepletionPct(input.housedM, input.mortalityM, input.soldM);

  const totalHoused = (input.housedF || 0) + (input.housedM || 0);
  const totalMort = (input.mortalityF || 0) + (input.mortalityM || 0);
  const totalSold = (input.soldF || 0) + (input.soldM || 0);
  const weeklyDepTotal = totalHoused > 0 ? ((totalMort + totalSold) / totalHoused) * 100 : 0;

  const cumDepF = prevCumulativeDepletionF + weeklyDepF;
  const cumDepM = prevCumulativeDepletionM + weeklyDepM;

  const weeklyMortF = calculateWeeklyMortalityPct(input.housedF, input.mortalityF);
  const weeklyMortM = calculateWeeklyMortalityPct(input.housedM, input.mortalityM);
  const weeklyMortTotal = totalHoused > 0 ? (totalMort / totalHoused) * 100 : 0;

  const devGF = calculateWeightDeviationG(input.actualWeightF, input.stdWeightF);
  const devGM = calculateWeightDeviationG(input.actualWeightM, input.stdWeightM);

  const devPctF = calculateWeightDeviationPct(input.actualWeightF, input.stdWeightF);
  const devPctM = calculateWeightDeviationPct(input.actualWeightM, input.stdWeightM);

  return {
    ...input,
    liveAtWeekEndF: liveF,
    liveAtWeekEndM: liveM,
    liveAtWeekEndTotal: liveF + liveM,
    nextHousedPrefillF: liveF,
    nextHousedPrefillM: liveM,
    weeklyDepletionPctF: weeklyDepF,
    weeklyDepletionPctM: weeklyDepM,
    weeklyDepletionPctTotal: weeklyDepTotal,
    cumulativeDepletionPctF: cumDepF,
    cumulativeDepletionPctM: cumDepM,
    cumulativeDepletionPctTotal: cumDepF + cumDepM, // Total running context
    weeklyMortalityPctF: weeklyMortF,
    weeklyMortalityPctM: weeklyMortM,
    weeklyMortalityPctTotal: weeklyMortTotal,
    weightDeviationGF: devGF,
    weightDeviationGM: devGM,
    weightDeviationPctF: devPctF,
    weightDeviationPctM: devPctM,
    display: {
      weeklyDepletionPctF: round(weeklyDepF).toFixed(2) + '%',
      weeklyDepletionPctM: round(weeklyDepM).toFixed(2) + '%',
      cumulativeDepletionPctF: round(cumDepF).toFixed(2) + '%',
      cumulativeDepletionPctM: round(cumDepM).toFixed(2) + '%',
      weeklyMortalityPctF: round(weeklyMortF).toFixed(2) + '%',
      weeklyMortalityPctM: round(weeklyMortM).toFixed(2) + '%',
      weightDeviationGF: devGF !== null ? (devGF > 0 ? `+${round(devGF, 1)}` : `${round(devGF, 1)}`) : '—',
      weightDeviationGM: devGM !== null ? (devGM > 0 ? `+${round(devGM, 1)}` : `${round(devGM, 1)}`) : '—',
      weightDeviationPctF: devPctF !== null ? (devPctF > 0 ? `+${round(devPctF).toFixed(2)}%` : `${round(devPctF).toFixed(2)}%`) : '—',
      weightDeviationPctM: devPctM !== null ? (devPctM > 0 ? `+${round(devPctM).toFixed(2)}%` : `${round(devPctM).toFixed(2)}%`) : '—',
    }
  };
}

/**
 * Computes all derived metrics for a flock's complete history sorted by ageWeeks ascending.
 * Running sums are accurately accumulated week by week.
 */
export function computeFlockRecords(records: WeeklyInputData[]): ComputedWeeklyRecord[] {
  // Sort by age in weeks ascending
  const sorted = [...records].sort((a, b) => a.ageWeeks - b.ageWeeks);

  let runningCumDepF = 0;
  let runningCumDepM = 0;
  let runningCumMortF = 0;
  let runningCumMortM = 0;

  return sorted.map((record) => {
    const liveF = calculateLiveAtWeekEnd(record.housedF, record.mortalityF, record.soldF);
    const liveM = calculateLiveAtWeekEnd(record.housedM, record.mortalityM, record.soldM);

    const weeklyDepF = calculateWeeklyDepletionPct(record.housedF, record.mortalityF, record.soldF);
    const weeklyDepM = calculateWeeklyDepletionPct(record.housedM, record.mortalityM, record.soldM);

    const totalHoused = (record.housedF || 0) + (record.housedM || 0);
    const totalMort = (record.mortalityF || 0) + (record.mortalityM || 0);
    const totalSold = (record.soldF || 0) + (record.soldM || 0);
    const weeklyDepTotal = totalHoused > 0 ? ((totalMort + totalSold) / totalHoused) * 100 : 0;

    runningCumDepF += weeklyDepF;
    runningCumDepM += weeklyDepM;

    const weeklyMortF = calculateWeeklyMortalityPct(record.housedF, record.mortalityF);
    const weeklyMortM = calculateWeeklyMortalityPct(record.housedM, record.mortalityM);
    const weeklyMortTotal = totalHoused > 0 ? (totalMort / totalHoused) * 100 : 0;

    runningCumMortF += weeklyMortF;
    runningCumMortM += weeklyMortM;

    const devGF = calculateWeightDeviationG(record.actualWeightF, record.stdWeightF);
    const devGM = calculateWeightDeviationG(record.actualWeightM, record.stdWeightM);

    const devPctF = calculateWeightDeviationPct(record.actualWeightF, record.stdWeightF);
    const devPctM = calculateWeightDeviationPct(record.actualWeightM, record.stdWeightM);

    return {
      ...record,
      liveAtWeekEndF: liveF,
      liveAtWeekEndM: liveM,
      liveAtWeekEndTotal: liveF + liveM,
      nextHousedPrefillF: liveF,
      nextHousedPrefillM: liveM,
      weeklyDepletionPctF: weeklyDepF,
      weeklyDepletionPctM: weeklyDepM,
      weeklyDepletionPctTotal: weeklyDepTotal,
      cumulativeDepletionPctF: runningCumDepF,
      cumulativeDepletionPctM: runningCumDepM,
      cumulativeDepletionPctTotal: runningCumDepF + runningCumDepM,
      weeklyMortalityPctF: weeklyMortF,
      weeklyMortalityPctM: weeklyMortM,
      weeklyMortalityPctTotal: weeklyMortTotal,
      cumulativeMortalityPctF: runningCumMortF,
      cumulativeMortalityPctM: runningCumMortM,
      weightDeviationGF: devGF,
      weightDeviationGM: devGM,
      weightDeviationPctF: devPctF,
      weightDeviationPctM: devPctM,
      display: {
        weeklyDepletionPctF: round(weeklyDepF).toFixed(2) + '%',
        weeklyDepletionPctM: round(weeklyDepM).toFixed(2) + '%',
        cumulativeDepletionPctF: round(runningCumDepF).toFixed(2) + '%',
        cumulativeDepletionPctM: round(runningCumDepM).toFixed(2) + '%',
        weeklyMortalityPctF: round(weeklyMortF).toFixed(2) + '%',
        weeklyMortalityPctM: round(weeklyMortM).toFixed(2) + '%',
        weightDeviationGF: devGF !== null ? (devGF > 0 ? `+${round(devGF, 1)}` : `${round(devGF, 1)}`) : '—',
        weightDeviationGM: devGM !== null ? (devGM > 0 ? `+${round(devGM, 1)}` : `${round(devGM, 1)}`) : '—',
        weightDeviationPctF: devPctF !== null ? (devPctF > 0 ? `+${round(devPctF).toFixed(2)}%` : `${round(devPctF).toFixed(2)}%`) : '—',
        weightDeviationPctM: devPctM !== null ? (devPctM > 0 ? `+${round(devPctM).toFixed(2)}%` : `${round(devPctM).toFixed(2)}%`) : '—',
      }
    };
  });
}

/**
 * Validates weekly inputs and returns warnings/errors
 */
export function validateWeeklyRecordInputs(input: {
  housedF: number;
  housedM: number;
  mortalityF: number;
  mortalityM: number;
  soldF: number;
  soldM: number;
  actualWeightF?: number | null;
  actualWeightM?: number | null;
  existingAges?: number[];
  ageWeeks: number;
}) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Mortality + Sold cannot exceed housed
  if (input.mortalityF + input.soldF > input.housedF) {
    errors.push(`Female depletion (${input.mortalityF + input.soldF}) exceeds housed count (${input.housedF}).`);
  }
  if (input.mortalityM + input.soldM > input.housedM) {
    errors.push(`Male depletion (${input.mortalityM + input.soldM}) exceeds housed count (${input.housedM}).`);
  }

  // 2. Weight 0 or negative
  if (input.actualWeightF !== null && input.actualWeightF !== undefined && input.actualWeightF <= 0) {
    errors.push('Female actual weight must be greater than 0.');
  }
  if (input.actualWeightM !== null && input.actualWeightM !== undefined && input.actualWeightM <= 0) {
    errors.push('Male actual weight must be greater than 0.');
  }

  // 3. Duplicate age check
  if (input.existingAges && input.existingAges.includes(input.ageWeeks)) {
    errors.push(`A weekly record for Age ${input.ageWeeks} weeks already exists in this flock.`);
  }

  // 4. Sanity warnings
  if (input.housedF <= 0) {
    warnings.push('Housed female bird count is 0.');
  }
  if (input.housedM <= 0) {
    warnings.push('Housed male bird count is 0.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
