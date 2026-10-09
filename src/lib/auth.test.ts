import { describe, it, expect } from 'vitest';
import { canEditWeeklyRecord, canManageFlocks, canManageSettings } from './auth';
import { Role } from '@prisma/client';

describe('Role-Based Authorization & RLS Guards', () => {
  const currentMaxAge = 19; // Flock 2866 is currently at Week 19

  describe('Data Entry Role (Field Staff)', () => {
    it('allows editing week 19 (current latest week)', () => {
      const res = canEditWeeklyRecord(Role.DATA_ENTRY, 19, currentMaxAge);
      expect(res.allowed).toBe(true);
    });

    it('allows editing week 18 (previous week - within 2 weeks window)', () => {
      const res = canEditWeeklyRecord(Role.DATA_ENTRY, 18, currentMaxAge);
      expect(res.allowed).toBe(true);
    });

    it('blocks editing week 17 (older than 2 weeks window)', () => {
      const res = canEditWeeklyRecord(Role.DATA_ENTRY, 17, currentMaxAge);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('can only edit the latest 2 weeks');
    });

    it('blocks editing week 1 (historical seed data)', () => {
      const res = canEditWeeklyRecord(Role.DATA_ENTRY, 1, currentMaxAge);
      expect(res.allowed).toBe(false);
    });

    it('cannot manage flocks or change alert thresholds', () => {
      expect(canManageFlocks(Role.DATA_ENTRY)).toBe(false);
      expect(canManageSettings(Role.DATA_ENTRY)).toBe(false);
    });
  });

  describe('Admin Role', () => {
    it('can edit any week regardless of age (week 1, 10, 19)', () => {
      expect(canEditWeeklyRecord(Role.ADMIN, 1, currentMaxAge).allowed).toBe(true);
      expect(canEditWeeklyRecord(Role.ADMIN, 10, currentMaxAge).allowed).toBe(true);
      expect(canEditWeeklyRecord(Role.ADMIN, 19, currentMaxAge).allowed).toBe(true);
    });

    it('can manage flocks and settings', () => {
      expect(canManageFlocks(Role.ADMIN)).toBe(true);
      expect(canManageSettings(Role.ADMIN)).toBe(true);
    });
  });

  describe('Manager Role', () => {
    it('can edit any week (week 1, 10, 19)', () => {
      expect(canEditWeeklyRecord(Role.MANAGER, 1, currentMaxAge).allowed).toBe(true);
      expect(canEditWeeklyRecord(Role.MANAGER, 19, currentMaxAge).allowed).toBe(true);
    });

    it('can manage flocks and settings', () => {
      expect(canManageFlocks(Role.MANAGER)).toBe(true);
      expect(canManageSettings(Role.MANAGER)).toBe(true);
    });
  });

  describe('Viewer Role (External Auditor)', () => {
    it('is blocked from editing any weekly record', () => {
      expect(canEditWeeklyRecord(Role.VIEWER, 19, currentMaxAge).allowed).toBe(false);
      expect(canEditWeeklyRecord(Role.VIEWER, 1, currentMaxAge).allowed).toBe(false);
    });

    it('cannot manage flocks or settings', () => {
      expect(canManageFlocks(Role.VIEWER)).toBe(false);
      expect(canManageSettings(Role.VIEWER)).toBe(false);
    });
  });
});
