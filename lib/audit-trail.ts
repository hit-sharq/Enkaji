import { prisma } from "@/lib/db"

// Audit event types for comprehensive logging
export enum AuditEventType {
  // User events
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTER = "USER_REGISTER",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",

  // Product events
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  PRODUCT_APPROVED = "PRODUCT_APPROVED",
  PRODUCT_REJECTED = "PRODUCT_REJECTED",

  // Order events
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_UPDATED = "ORDER_UPDATED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  ORDER_COMPLETED = "ORDER_COMPLETED",

  // Payment events
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",

  // Review events
  REVIEW_CREATED = "REVIEW_CREATED",
  REVIEW_UPDATED = "REVIEW_UPDATED",
  REVIEW_DELETED = "REVIEW_DELETED",
  REVIEW_MODERATED = "REVIEW_MODERATED",

  // Admin events
  ADMIN_LOGIN = "ADMIN_LOGIN",
  USER_SUSPENDED = "USER_SUSPENDED",
  USER_UNSUSPENDED = "USER_UNSUSPENDED",
  CONTENT_MODERATED = "CONTENT_MODERATED",

  // Security events
  SECURITY_VIOLATION = "SECURITY_VIOLATION",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CSRF_VIOLATION = "CSRF_VIOLATION",
}

// Severity levels for audit events
export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string
  userId?: string
  eventType: AuditEventType
  resourceType: string
  resourceId?: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity: AuditSeverity
  timestamp: Date
  success: boolean
  errorMessage?: string
}

// Audit trail service for comprehensive logging
export class AuditTrailService {
  private static instance: AuditTrailService

  private constructor() {}

  public static getInstance(): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService()
    }
    return AuditTrailService.instance
  }

  // Log an audit event
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      }

      // Log to console for development
      console.log(`[AUDIT] ${auditEntry.eventType}: ${auditEntry.action}`, {
        userId: auditEntry.userId,
        resourceType: auditEntry.resourceType,
        resourceId: auditEntry.resourceId,
        severity: auditEntry.severity,
        success: auditEntry.success,
        ipAddress: auditEntry.ipAddress,
        timestamp: auditEntry.timestamp,
      })

      // TODO: Store in database when audit table is created
      // await prisma.auditLog.create({ data: auditEntry })

    } catch (error) {
      console.error("Failed to log audit event:", error)
    }
  }

  // Log security violation
  async logSecurityViolation(
    eventType: AuditEventType,
    details: Record<string, any>,
    ipAddress?: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      resourceType: "security",
      action: "Security violation detected",
      details,
      ipAddress,
      severity: AuditSeverity.HIGH,
      success: false,
    })
  }

  // Log user action
  async logUserAction(
    userId: string,
    eventType: AuditEventType,
    resourceType: string,
    resourceId: string,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      resourceType,
      resourceId,
      action,
      details,
      ipAddress,
      severity: AuditSeverity.LOW,
      success: true,
    })
  }

  // Log order event
  async logOrderEvent(
    userId: string,
    orderId: string,
    eventType: AuditEventType,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      resourceType: "order",
      resourceId: orderId,
      action,
      details,
      ipAddress,
      severity: AuditSeverity.LOW,
      success: true,
    })
  }

  // Log payment event
  async logPaymentEvent(
    userId: string,
    paymentId: string,
    eventType: AuditEventType,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType,
      resourceType: "payment",
      resourceId: paymentId,
      action,
      details,
      ipAddress,
      severity: AuditSeverity.MEDIUM,
      success: true,
    })
  }

  // Log admin action
  async logAdminAction(
    adminId: string,
    eventType: AuditEventType,
    resourceType: string,
    resourceId: string,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.logEvent({
      userId: adminId,
      eventType,
      resourceType,
      resourceId,
      action,
      details,
      ipAddress,
      severity: AuditSeverity.MEDIUM,
      success: true,
    })
  }

  // Log suspicious activity
  async logSuspiciousActivity(
    details: Record<string, any>,
    ipAddress?: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      resourceType: "security",
      action: "Suspicious activity detected",
      details,
      ipAddress,
      severity: AuditSeverity.HIGH,
      success: false,
    })
  }
}

// Export singleton instance
export const auditTrail = AuditTrailService.getInstance()
