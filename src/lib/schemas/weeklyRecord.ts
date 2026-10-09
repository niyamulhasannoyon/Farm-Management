import { z } from 'zod';

export const weeklyRecordSchema = z
  .object({
    flockId: z.string().min(1, 'Flock selection is required'),
    ageWeeks: z.coerce.number().int().min(1, 'Age must be at least 1 week').max(100, 'Age must be 100 weeks or less'),
    weekEndDate: z.string().min(1, 'Week end date is required'),

    // Starting birds in week
    housedF: z.coerce.number().int().min(0, 'Female housed count cannot be negative'),
    housedM: z.coerce.number().int().min(0, 'Male housed count cannot be negative'),

    // Weekly losses
    mortalityF: z.coerce.number().int().min(0, 'Female mortality cannot be negative').default(0),
    mortalityM: z.coerce.number().int().min(0, 'Male mortality cannot be negative').default(0),
    soldF: z.coerce.number().int().min(0, 'Female sold count cannot be negative').default(0),
    soldM: z.coerce.number().int().min(0, 'Male sold count cannot be negative').default(0),

    // Weights (grams)
    stdWeightF: z.coerce.number().positive('Standard weight must be > 0').nullable().optional(),
    actualWeightF: z.coerce.number().positive('Actual weight must be > 0').nullable().optional(),
    stdWeightM: z.coerce.number().positive('Standard weight must be > 0').nullable().optional(),
    actualWeightM: z.coerce.number().positive('Actual weight must be > 0').nullable().optional(),

    // Uniformity (%)
    uniformityF: z.coerce.number().min(0).max(100).nullable().optional(),
    uniformityM: z.coerce.number().min(0).max(100).nullable().optional(),

    // Feed (g / bird)
    feedGPerBirdF: z.coerce.number().min(0).nullable().optional(),
    feedGPerBirdM: z.coerce.number().min(0).nullable().optional(),
  })
  .refine(
    (data) => (data.mortalityF || 0) + (data.soldF || 0) <= data.housedF,
    {
      message: 'Female depletion (mortality + sold) cannot exceed housed count',
      path: ['mortalityF'],
    }
  )
  .refine(
    (data) => (data.mortalityM || 0) + (data.soldM || 0) <= data.housedM,
    {
      message: 'Male depletion (mortality + sold) cannot exceed housed count',
      path: ['mortalityM'],
    }
  );

export type WeeklyRecordFormData = z.infer<typeof weeklyRecordSchema>;
