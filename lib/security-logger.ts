import { auditTrail, AuditEventType } from './audit-trail'

// Security event types
export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SUSPICIOUS_IP = 'SUSPICIOUS_IP',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  API_ABUSE = 'API_ABUSE',
  FILE_UPLOAD_VIOLATION = 'FILE_UPLOAD_VIOLATION'
}

// Security logger class
export class SecurityLogger {
  private static instance: SecurityLogger
  private blockedIPs: Set<string> = new Set()
  private suspiciousActivities: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger()
    }
    return SecurityLogger.instance
  }

  // Log authentication failures
  async logAuthFailure(
    identifier: string, // email, username, or IP
    reason: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.warn(`[SECURITY] Authentication failure for ${identifier}: ${reason}`, {
      identifier,
      reason,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    // Track failed attempts for brute force detection
    this.trackFailedAttempt(identifier)

    // Log to audit trail
    await auditTrail.logSecurityViolation(
      AuditEventType.SECURITY_VIOLATION,
      { identifier, reason, ...details },
      ipAddress
    )
  }

  // Log rate limit violations
  async logRateLimitExceeded(
    identifier: string,
    endpoint: string,
    limit: number,
    windowMs: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.warn(`[SECURITY] Rate limit exceeded for ${identifier} on ${endpoint}`, {
      identifier,
      endpoint,
      limit,
      windowMs,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      { identifier, endpoint, limit, windowMs },
      ipAddress
    )
  }

  // Log CSRF violations
  async logCSRFViolation(
    userId: string | null,
    endpoint: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.error(`[SECURITY] CSRF violation detected`, {
      userId,
      endpoint,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.CSRF_VIOLATION,
      { endpoint, ...details },
      ipAddress,
      userId || undefined
    )
  }

  // Log potential injection attempts
  async logInjectionAttempt(
    type: 'SQL' | 'XSS' | 'COMMAND',
    input: string,
    endpoint: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.error(`[SECURITY] Potential ${type} injection attempt`, {
      type,
      input: input.substring(0, 100), // Truncate for security
      endpoint,
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.SECURITY_VIOLATION,
      { type: `${type.toLowerCase()}_injection`, input: input.substring(0, 100), endpoint },
      ipAddress,
      userId
    )
  }

  // Log brute force attempts
  async logBruteForceAttempt(
    identifier: string,
    attempts: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.error(`[SECURITY] Brute force attempt detected`, {
      identifier,
      attempts,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.SECURITY_VIOLATION,
      { identifier, attempts, type: 'brute_force' },
      ipAddress
    )
  }

  // Log unauthorized access attempts
  async logUnauthorizedAccess(
    userId: string | null,
    resource: string,
    action: string,
    requiredRole?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.warn(`[SECURITY] Unauthorized access attempt`, {
      userId,
      resource,
      action,
      requiredRole,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.SECURITY_VIOLATION,
      { resource, action, requiredRole, type: 'unauthorized_access' },
      ipAddress,
      userId || undefined
    )
  }

  // Log suspicious IP activity
  async logSuspiciousIP(
    ipAddress: string,
    reason: string,
    details: Record<string, any> = {},
    userAgent?: string
  ): Promise<void> {
    console.warn(`[SECURITY] Suspicious IP activity: ${ipAddress}`, {
      ipAddress,
      reason,
      details,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSuspiciousActivity(
      { ipAddress, reason, ...details },
      ipAddress
    )
  }

  // Log API abuse
  async logAPIAbuse(
    userId: string | null,
    endpoint: string,
    pattern: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.warn(`[SECURITY] API abuse detected`, {
      userId,
      endpoint,
      pattern,
      ipAddress,
      userAgent,
      timestamp: new Date()
    })

    await auditTrail.logSecurityViolation(
      AuditEventType.SECURITY_VIOLATION,
      { endpoint, pattern, type: 'api_abuse' },
      ipAddress,
      userId || undefined
    )
  }

  // Track failed authentication attempts
  private trackFailedAttempt(identifier: string): void {
    const key = `auth_fail_${identifier}`
    const current = this.suspiciousActivities.get(key) || 0
    this.suspiciousActivities.set(key, current + 1)

    // Check for brute force pattern
    if (current + 1 >= 5) { // 5 failed attempts
      this.logBruteForceAttempt(identifier, current + 1)
    }
  }

  // Check if IP is blocked
  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress)
  }

  // Block an IP address
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress)
    console.warn(`[SECURITY] IP blocked: ${ipAddress} - ${reason}`)

    // In a real implementation, you'd persist this to a database
    // and potentially integrate with a firewall or WAF
  }

  // Unblock an IP address
  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress)
    console.info(`[SECURITY] IP unblocked: ${ipAddress}`)
  }

  // Get security statistics
  getSecurityStats(): {
    blockedIPs: number
    suspiciousActivities: number
    recentViolations: number
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities: this.suspiciousActivities.size,
      recentViolations: 0 // Would need database integration
    }
  }

  // Analyze request for suspicious patterns
  analyzeRequest(
    request: Request,
    userId?: string
  ): {
    isSuspicious: boolean
    reasons: string[]
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  } {
    const reasons: string[] = []
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

    const url = new URL(request.url)
    const userAgent = request.headers.get('user-agent') || ''
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check for SQL injection patterns
    const sqlPatterns = /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i
    if (sqlPatterns.test(url.search) || sqlPatterns.test(url.pathname)) {
      reasons.push('Potential SQL injection')
      riskLevel = 'HIGH'
    }

    // Check for XSS patterns
    const xssPatterns = /(<script|<iframe|<object|<embed|javascript:|vbscript:|onload=|onerror=)/i
    if (xssPatterns.test(url.search) || xssPatterns.test(url.pathname)) {
      reasons.push('Potential XSS attempt')
      riskLevel = 'HIGH'
    }

    // Check for suspicious user agents
    const suspiciousUAs = /(sqlmap|nikto|dirbuster|gobuster|masscan|nmap|acunetix|openvas)/i
    if (suspiciousUAs.test(userAgent)) {
      reasons.push('Suspicious user agent')
      riskLevel = 'HIGH'
    }

    // Check for directory traversal
    if (url.pathname.includes('../') || url.pathname.includes('..\\')) {
      reasons.push('Directory traversal attempt')
      riskLevel = 'HIGH'
    }

    // Check for command injection
    const cmdPatterns = /(\||;|`|\$\(|\$\{)/
    if (cmdPatterns.test(url.search)) {
      reasons.push('Potential command injection')
      riskLevel = 'HIGH'
    }

    // Check for unusual request patterns
    if (request.method === 'POST' && !request.headers.get('content-type')?.includes('application/json')) {
      reasons.push('Missing content-type header')
      riskLevel = 'MEDIUM'
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      riskLevel
    }
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance()

// Utility functions for common security logging
export const security = {
  // Authentication
  authFailure: (identifier: string, reason: string, details?: Record<string, any>, ipAddress?: string, userAgent?: string) =>
    securityLogger.logAuthFailure(identifier, reason, details, ipAddress, userAgent),

  // Rate limiting
  rateLimitExceeded: (identifier: string, endpoint: string, limit: number, windowMs: number, ipAddress?: string, userAgent?: string) =>
    securityLogger.logRateLimitExceeded(identifier, endpoint, limit, windowMs, ipAddress, userAgent),

  // CSRF
  csrfViolation: (userId: string | null, endpoint: string, details?: Record<string, any>, ipAddress?: string, userAgent?: string) =>
    securityLogger.logCSRFViolation(userId, endpoint, details, ipAddress, userAgent),

  // Injection attempts
  injectionAttempt: (type: 'SQL' | 'XSS' | 'COMMAND', input: string, endpoint: string, userId?: string, ipAddress?: string, userAgent?: string) =>
    securityLogger.logInjectionAttempt(type, input, endpoint, userId, ipAddress, userAgent),

  // Unauthorized access
  unauthorizedAccess: (userId: string | null, resource: string, action: string, requiredRole?: string, ipAddress?: string, userAgent?: string) =>
    securityLogger.logUnauthorizedAccess(userId, resource, action, requiredRole, ipAddress, userAgent),

  // Suspicious activity
  suspiciousIP: (ipAddress: string, reason: string, details?: Record<string, any>, userAgent?: string) =>
    securityLogger.logSuspiciousIP(ipAddress, reason, details, userAgent),

  // API abuse
  apiAbuse: (userId: string | null, endpoint: string, pattern: string, ipAddress?: string, userAgent?: string) =>
    securityLogger.logAPIAbuse(userId, endpoint, pattern, ipAddress, userAgent),

  // Request analysis
  analyzeRequest: (request: Request, userId?: string) =>
    securityLogger.analyzeRequest(request, userId),

  // IP management
  blockIP: (ipAddress: string, reason: string) =>
    securityLogger.blockIP(ipAddress, reason),

  unblockIP: (ipAddress: string) =>
    securityLogger.unblockIP(ipAddress),

  isIPBlocked: (ipAddress: string) =>
    securityLogger.isIPBlocked(ipAddress),

  // Statistics
  getStats: () =>
    securityLogger.getSecurityStats()
}
