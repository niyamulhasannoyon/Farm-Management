import { ComputedWeeklyRecord } from './calculations';

export type AlertSeverity = 'warn' | 'critical';

export interface AlertFlag {
  id: string;
  ageWeeks: number;
  date: string | Date;
  metric: string;
  value: string;
  threshold: string;
  severity: AlertSeverity;
  gender: 'Female' | 'Male' | 'Both';
  message: string;
}

export interface ThresholdConfig {
  weeklyMortalityPct: number; // default 1.0%
  weightDevPct: number;       // default 10.0%
  minAgeForWeight: number;    // default 4
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  weeklyMortalityPct: 1.0,
  weightDevPct: 10.0,
  minAgeForWeight: 4,
};

/**
 * Evaluates weekly records and identifies breaches
 * Severity:
 * - warn at 1x threshold
 * - critical at 2x threshold
 */
export function evaluateFlockAlerts(
  records: ComputedWeeklyRecord[],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): AlertFlag[] {
  const flags: AlertFlag[] = [];

  for (const record of records) {
    // 1. Weekly Mortality - Female
    if (record.weeklyMortalityPctF >= thresholds.weeklyMortalityPct) {
      const isCritical = record.weeklyMortalityPctF >= thresholds.weeklyMortalityPct * 2;
      flags.push({
        id: `mort-f-${record.ageWeeks}`,
        ageWeeks: record.ageWeeks,
        date: record.weekEndDate,
        metric: 'Female Mortality',
        value: `${record.weeklyMortalityPctF.toFixed(2)}%`,
        threshold: `${thresholds.weeklyMortalityPct.toFixed(1)}%`,
        severity: isCritical ? 'critical' : 'warn',
        gender: 'Female',
        message: `Female mortality reached ${record.weeklyMortalityPctF.toFixed(2)}% in Week ${record.ageWeeks} (${record.mortalityF} birds).`,
      });
    }

    // 2. Weekly Mortality - Male
    if (record.weeklyMortalityPctM >= thresholds.weeklyMortalityPct) {
      const isCritical = record.weeklyMortalityPctM >= thresholds.weeklyMortalityPct * 2;
      flags.push({
        id: `mort-m-${record.ageWeeks}`,
        ageWeeks: record.ageWeeks,
        date: record.weekEndDate,
        metric: 'Male Mortality',
        value: `${record.weeklyMortalityPctM.toFixed(2)}%`,
        threshold: `${thresholds.weeklyMortalityPct.toFixed(1)}%`,
        severity: isCritical ? 'critical' : 'warn',
        gender: 'Male',
        message: `Male mortality reached ${record.weeklyMortalityPctM.toFixed(2)}% in Week ${record.ageWeeks} (${record.mortalityM} birds).`,
      });
    }

    // 3. Weight Deviation - Female (evaluated from minAgeForWeight, e.g. week 4)
    if (
      record.ageWeeks >= thresholds.minAgeForWeight &&
      record.weightDeviationPctF !== null
    ) {
      const absDev = Math.abs(record.weightDeviationPctF);
      if (absDev >= thresholds.weightDevPct) {
        const isCritical = absDev >= thresholds.weightDevPct * 2;
        const dir = record.weightDeviationPctF > 0 ? 'above' : 'below';
        flags.push({
          id: `wt-f-${record.ageWeeks}`,
          ageWeeks: record.ageWeeks,
          date: record.weekEndDate,
          metric: 'Female Weight Dev.',
          value: `${record.weightDeviationPctF > 0 ? '+' : ''}${record.weightDeviationPctF.toFixed(1)}%`,
          threshold: `±${thresholds.weightDevPct.toFixed(0)}%`,
          severity: isCritical ? 'critical' : 'warn',
          gender: 'Female',
          message: `Female weight is ${absDev.toFixed(1)}% ${dir} breed standard in Week ${record.ageWeeks} (${record.actualWeightF}g vs ${record.stdWeightF}g).`,
        });
      }
    }

    // 4. Weight Deviation - Male
    if (
      record.ageWeeks >= thresholds.minAgeForWeight &&
      record.weightDeviationPctM !== null
    ) {
      const absDev = Math.abs(record.weightDeviationPctM);
      if (absDev >= thresholds.weightDevPct) {
        const isCritical = absDev >= thresholds.weightDevPct * 2;
        const dir = record.weightDeviationPctM > 0 ? 'above' : 'below';
        flags.push({
          id: `wt-m-${record.ageWeeks}`,
          ageWeeks: record.ageWeeks,
          date: record.weekEndDate,
          metric: 'Male Weight Dev.',
          value: `${record.weightDeviationPctM > 0 ? '+' : ''}${record.weightDeviationPctM.toFixed(1)}%`,
          threshold: `±${thresholds.weightDevPct.toFixed(0)}%`,
          severity: isCritical ? 'critical' : 'warn',
          gender: 'Male',
          message: `Male weight is ${absDev.toFixed(1)}% ${dir} breed standard in Week ${record.ageWeeks}.`,
        });
      }
    }
  }

  // Return flags sorted with most recent age and critical first
  return flags.sort((a, b) => {
    if (b.ageWeeks !== a.ageWeeks) return b.ageWeeks - a.ageWeeks;
    return a.severity === 'critical' ? -1 : 1;
  });
}
