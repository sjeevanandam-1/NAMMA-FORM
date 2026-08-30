import { prisma } from '../config/prisma.js';

export class AuditService {
  static async log(params: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Remove any sensitive keys if accidentally present
      const sanitizedDetails = { ...params.details };
      delete sanitizedDetails.password;
      delete sanitizedDetails.passwordHash;
      delete sanitizedDetails.token;
      delete sanitizedDetails.refreshToken;

      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          details: JSON.stringify(sanitizedDetails),
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error) {
      console.error('[Audit Log Error]:', error);
      // Non-blocking: audit log failure should not break user operations
    }
  }
}
