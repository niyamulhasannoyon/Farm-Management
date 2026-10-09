import { describe, it, expect } from 'vitest';
import {
  calculateLiveAtWeekEnd,
  calculateWeeklyDepletionPct,
  calculateWeeklyMortalityPct,
  calculateWeightDeviationG,
  calculateWeightDeviationPct,
  calculateSingleWeekPreview,
  computeFlockRecords,
  validateWeeklyRecordInputs,
  round,
  WeeklyInputData,
} from './calculations';

describe('RBCL Flock Monitor Calculations Engine', () => {
  // Real seed data from prompt for Flock 2866, Shed 01, Ross
  const flock2866Seed: WeeklyInputData[] = [
    { weekEndDate: '2025-07-12', ageWeeks: 1, housedF: 9211, housedM: 1340, mortalityF: 280, mortalityM: 53, soldF: 0, soldM: 0, stdWeightF: 115, actualWeightF: 161 },
    { weekEndDate: '2025-07-19', ageWeeks: 2, housedF: 8931, housedM: 1287, mortalityF: 118, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 215, actualWeightF: 314 },
    { weekEndDate: '2025-07-26', ageWeeks: 3, housedF: 8813, housedM: 1225, mortalityF: 125, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 335, actualWeightF: 444 },
    { weekEndDate: '2025-08-02', ageWeeks: 4, housedF: 8688, housedM: 1163, mortalityF: 17, mortalityM: 33, soldF: 0, soldM: 0, stdWeightF: 465, actualWeightF: 556 },
    { weekEndDate: '2025-08-09', ageWeeks: 5, housedF: 8671, housedM: 1130, mortalityF: 4, mortalityM: 15, soldF: 0, soldM: 8, stdWeightF: 585, actualWeightF: 590 },
    { weekEndDate: '2025-08-16', ageWeeks: 6, housedF: 8667, housedM: 1107, mortalityF: 3, mortalityM: 1, soldF: 0, soldM: 46, stdWeightF: 695, actualWeightF: 706 },
    { weekEndDate: '2025-08-23', ageWeeks: 7, housedF: 8664, housedM: 1060, mortalityF: 4, mortalityM: 0, soldF: 4, soldM: 12, stdWeightF: 795, actualWeightF: 816 },
    { weekEndDate: '2025-08-30', ageWeeks: 8, housedF: 8656, housedM: 1048, mortalityF: 6, mortalityM: 0, soldF: 9, soldM: 10, stdWeightF: 895, actualWeightF: 873 },
    { weekEndDate: '2025-09-06', ageWeeks: 9, housedF: 8641, housedM: 1038, mortalityF: 4, mortalityM: 0, soldF: 0, soldM: 1, stdWeightF: 995, actualWeightF: 1012 },
    { weekEndDate: '2025-09-13', ageWeeks: 10, housedF: 8637, housedM: 1037, mortalityF: 1, mortalityM: 0, soldF: 0, soldM: 5, stdWeightF: 1095, actualWeightF: 1134 },
    { weekEndDate: '2025-09-20', ageWeeks: 11, housedF: 8636, housedM: 1032, mortalityF: 2, mortalityM: 1, soldF: 2, soldM: 10, stdWeightF: 1195, actualWeightF: 1240 },
    { weekEndDate: '2025-09-27', ageWeeks: 12, housedF: 8632, housedM: 1021, mortalityF: 5, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1295, actualWeightF: 1346 },
    { weekEndDate: '2025-10-04', ageWeeks: 13, housedF: 8627, housedM: 1020, mortalityF: 0, mortalityM: 5, soldF: 0, soldM: 2, stdWeightF: 1395, actualWeightF: 1457 },
    { weekEndDate: '2025-10-11', ageWeeks: 14, housedF: 8627, housedM: 1013, mortalityF: 1, mortalityM: 6, soldF: 0, soldM: 42, stdWeightF: 1495, actualWeightF: 1574 },
    { weekEndDate: '2025-10-18', ageWeeks: 15, housedF: 8626, housedM: 965, mortalityF: 7, mortalityM: 5, soldF: 26, soldM: 6, stdWeightF: 1595, actualWeightF: 1687 },
    { weekEndDate: '2025-10-25', ageWeeks: 16, housedF: 8593, housedM: 954, mortalityF: 6, mortalityM: 2, soldF: 50, soldM: 0, stdWeightF: 1705, actualWeightF: 1838 },
    { weekEndDate: '2025-11-01', ageWeeks: 17, housedF: 8537, housedM: 952, mortalityF: 7, mortalityM: 6, soldF: 3, soldM: 10, stdWeightF: 1825, actualWeightF: 1939 },
    { weekEndDate: '2025-11-08', ageWeeks: 18, housedF: 8527, housedM: 936, mortalityF: 1, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1950, actualWeightF: 2074 },
    { weekEndDate: '2025-11-15', ageWeeks: 19, housedF: 8526, housedM: 935, mortalityF: 5, mortalityM: 7, soldF: 0, soldM: 0, stdWeightF: 2085, actualWeightF: 2224 },
  ];

  describe('Prompt Required Validation: Flock 2866, Week 1', () => {
    const week1 = flock2866Seed[0];

    it('calculates live at week end: F 8931, M 1287', () => {
      const liveF = calculateLiveAtWeekEnd(week1.housedF, week1.mortalityF, week1.soldF);
      const liveM = calculateLiveAtWeekEnd(week1.housedM, week1.mortalityM, week1.soldM);

      expect(liveF).toBe(8931);
      expect(liveM).toBe(1287);
    });

    it('calculates weekly depletion: F 3.04%, M 3.96%', () => {
      const depF = calculateWeeklyDepletionPct(week1.housedF, week1.mortalityF, week1.soldF);
      const depM = calculateWeeklyDepletionPct(week1.housedM, week1.mortalityM, week1.soldM);

      expect(round(depF, 2)).toBe(3.04);
      expect(round(depM, 2)).toBe(3.96);
    });

    it('calculates weight deviation: std 115g, actual 161g => +46g', () => {
      const devG = calculateWeightDeviationG(week1.actualWeightF, week1.stdWeightF);
      expect(devG).toBe(46);
    });

    it('calculates weight deviation %: (161 - 115) / 115 * 100 => 40.0%', () => {
      const devPct = calculateWeightDeviationPct(week1.actualWeightF, week1.stdWeightF);
      expect(round(devPct!, 1)).toBe(40.0);
    });
  });

  describe('Prompt Required Validation: Flock 2866, Week 5 Cumulative Depletion', () => {
    it('calculates Week 5 cumulative depletion: F 6.02%, M 18.71%', () => {
      const computed = computeFlockRecords(flock2866Seed.slice(0, 5));
      const week5 = computed[4];

      expect(round(week5.cumulativeDepletionPctF, 2)).toBe(6.02);
      expect(round(week5.cumulativeDepletionPctM, 2)).toBe(18.71);
    });
  });

  describe('Housed Continuity Check across Weeks', () => {
    it('prefills next week housed with previous week live count', () => {
      const computed = computeFlockRecords(flock2866Seed);
      for (let i = 0; i < computed.length - 1; i++) {
        const currentLiveF = computed[i].liveAtWeekEndF;
        const currentLiveM = computed[i].liveAtWeekEndM;
        const nextActualHousedF = computed[i + 1].housedF;
        const nextActualHousedM = computed[i + 1].housedM;

        // In real data, next housed should match previous live count
        expect(nextActualHousedF).toBe(currentLiveF);
        expect(nextActualHousedM).toBe(currentLiveM);
      }
    });
  });

  describe('Live Single Week Preview (for mobile entry form)', () => {
    it('accurately computes live calculations and formats display values', () => {
      const preview = calculateSingleWeekPreview(
        {
          ageWeeks: 1,
          weekEndDate: '2025-07-12',
          housedF: 9211,
          housedM: 1340,
          mortalityF: 280,
          mortalityM: 53,
          soldF: 0,
          soldM: 0,
          stdWeightF: 115,
          actualWeightF: 161,
        },
        0,
        0
      );

      expect(preview.liveAtWeekEndF).toBe(8931);
      expect(preview.liveAtWeekEndM).toBe(1287);
      expect(preview.display.weeklyDepletionPctF).toBe('3.04%');
      expect(preview.display.weeklyDepletionPctM).toBe('3.96%');
      expect(preview.display.weightDeviationGF).toBe('+46');
    });
  });

  describe('Validation Rules for Input Data', () => {
    it('rejects when mortality + sold exceeds housed', () => {
      const validation = validateWeeklyRecordInputs({
        ageWeeks: 2,
        housedF: 1000,
        housedM: 100,
        mortalityF: 900,
        soldF: 200, // 900 + 200 = 1100 > 1000
        mortalityM: 10,
        soldM: 10,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Female depletion (1100) exceeds housed count (1000).');
    });

    it('rejects weight 0 or negative', () => {
      const validation = validateWeeklyRecordInputs({
        ageWeeks: 2,
        housedF: 1000,
        housedM: 100,
        mortalityF: 10,
        soldF: 0,
        mortalityM: 2,
        soldM: 0,
        actualWeightF: 0,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Female actual weight must be greater than 0.');
    });

    it('rejects duplicate age in the same flock', () => {
      const validation = validateWeeklyRecordInputs({
        ageWeeks: 5,
        housedF: 1000,
        housedM: 100,
        mortalityF: 10,
        soldF: 0,
        mortalityM: 2,
        soldM: 0,
        existingAges: [1, 2, 3, 4, 5],
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('A weekly record for Age 5 weeks already exists in this flock.');
    });

    it('passes for valid input and returns proper structure', () => {
      const validation = validateWeeklyRecordInputs({
        ageWeeks: 6,
        housedF: 1000,
        housedM: 100,
        mortalityF: 5,
        soldF: 10,
        mortalityM: 1,
        soldM: 2,
        actualWeightF: 700,
        existingAges: [1, 2, 3, 4, 5],
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});
