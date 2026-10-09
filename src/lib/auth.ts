import { Role } from '@prisma/client';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export const DEMO_USERS: Record<string, UserSession> = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@rbcl.farm',
    fullName: 'System Administrator',
    role: Role.ADMIN,
  },
  manager: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'manager@rbcl.farm',
    fullName: 'Farm Manager (Unit-B)',
    role: Role.MANAGER,
  },
  data_entry: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'staff@rbcl.farm',
    fullName: 'Shed Staff (Data Entry)',
    role: Role.DATA_ENTRY,
  },
  viewer: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'viewer@rbcl.farm',
    fullName: 'External Auditor (Viewer)',
    role: Role.VIEWER,
  },
};

/**
 * Checks if a user role can edit a weekly record given its age in weeks and the flock's max age
 * Rule: DATA_ENTRY users can only edit the last 2 weeks (ageWeeks >= maxAgeWeeks - 1). ADMIN & MANAGER can edit anything.
 */
export function canEditWeeklyRecord(
  role: Role,
  recordAgeWeeks: number,
  maxFlockAgeWeeks: number | null | undefined
): { allowed: boolean; reason?: string } {
  if (role === Role.ADMIN || role === Role.MANAGER) {
    return { allowed: true };
  }

  if (role === Role.VIEWER) {
    return {
      allowed: false,
      reason: 'Read-only viewer account cannot modify records.',
    };
  }

  if (role === Role.DATA_ENTRY) {
    if (!maxFlockAgeWeeks || maxFlockAgeWeeks <= 0) {
      // First records of flock
      return { allowed: true };
    }

    const minEditableWeek = maxFlockAgeWeeks - 1;
    if (recordAgeWeeks >= minEditableWeek) {
      return { allowed: true };
    } else {
      return {
        allowed: false,
        reason: `Field staff (data entry) can only edit the latest 2 weeks (Weeks ${minEditableWeek} and ${maxFlockAgeWeeks}). Week ${recordAgeWeeks} is locked. Contact an admin or manager to edit older weeks.`,
      };
    }
  }

  return { allowed: false, reason: 'Unauthorized role.' };
}

/**
 * Checks if a user has permission to create or close flocks
 */
export function canManageFlocks(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER;
}

/**
 * Checks if a user has permission to modify alert thresholds & system settings
 */
export function canManageSettings(role: Role): boolean {
  return role === Role.ADMIN || role === Role.MANAGER;
}
