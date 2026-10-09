import { prisma } from './db';
import { AuditAction, Prisma } from '@prisma/client';

export interface AuditLogParams {
  tableName: string;
  recordId: string;
  action: AuditAction;
  userId?: string | null;
  oldData?: Prisma.InputJsonValue | null;
  newData?: Prisma.InputJsonValue | null;
}

/**
 * Creates an audit log record for data mutations
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        tableName: params.tableName,
        recordId: params.recordId,
        action: params.action,
        userId: params.userId || null,
        oldData: params.oldData ?? undefined,
        newData: params.newData ?? undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Don't fail the primary transaction if logging encounters an issue
    return null;
  }
}
