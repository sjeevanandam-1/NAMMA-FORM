"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class AuditService {
    static async log(params) {
        try {
            // Remove any sensitive keys if accidentally present
            const sanitizedDetails = { ...params.details };
            delete sanitizedDetails.password;
            delete sanitizedDetails.passwordHash;
            delete sanitizedDetails.token;
            delete sanitizedDetails.refreshToken;
            await prisma_js_1.prisma.auditLog.create({
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
        }
        catch (error) {
            console.error('[Audit Log Error]:', error);
            // Non-blocking: audit log failure should not break user operations
        }
    }
}
exports.AuditService = AuditService;
