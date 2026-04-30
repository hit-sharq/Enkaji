import { UserRole } from '@/types'

export interface RBACRules {
  canAccess: boolean
  message: string
}

export class RBAC {
  static canAccessSeller(role: UserRole | null, isApproved: boolean): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (role === 'BUYER') {
      return { canAccess: false, message: 'Only sellers can access this section' }
    }
    if (role === 'SELLER' && !isApproved) {
      return { canAccess: false, message: 'Your seller account is pending approval. Check back soon!' }
    }
    if (role === 'SELLER' || role === 'ADMIN') {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'You do not have permission to access this' }
  }

  static canAccessArtisan(role: UserRole | null, isApproved: boolean): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (role === 'BUYER') {
      return { canAccess: false, message: 'Only artisans can access this section' }
    }
    if (role === 'ARTISAN' && !isApproved) {
      return { canAccess: false, message: 'Your artisan profile is pending approval. Check back soon!' }
    }
    if (role === 'ARTISAN' || role === 'ADMIN') {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'You do not have permission to access this' }
  }

  static canAccessAdmin(role: UserRole | null): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (role !== 'ADMIN') {
      return { canAccess: false, message: 'Admin access only' }
    }
    return { canAccess: true, message: '' }
  }

  static canManageSellers(role: UserRole | null): RBACRules {
    return this.canAccessAdmin(role)
  }

  static canViewAnalytics(role: UserRole | null): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (['SELLER', 'ARTISAN', 'ADMIN', 'FINANCE_MANAGER', 'REGIONAL_MANAGER'].includes(role)) {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'You do not have permission to view analytics' }
  }

  static canProcessPayments(role: UserRole | null): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (['FINANCE_MANAGER', 'ADMIN'].includes(role)) {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'Only finance managers can process payments' }
  }

  static canModerateContent(role: UserRole | null): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (['MODERATOR', 'CONTENT_MANAGER', 'ADMIN'].includes(role)) {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'You do not have permission to moderate content' }
  }

  static canEditProfile(role: UserRole | null, isOwnProfile: boolean): RBACRules {
    if (!role) {
      return { canAccess: false, message: 'Please log in first' }
    }
    if (isOwnProfile || role === 'ADMIN') {
      return { canAccess: true, message: '' }
    }
    return { canAccess: false, message: 'You can only edit your own profile' }
  }
}

// Helper hook for components
import { useAuthStore } from './store'

export function useRBAC() {
  const { user, isSellerApproved, isArtisanApproved } = useAuthStore()

  return {
    canAccessSeller: () => RBAC.canAccessSeller(user?.role || null, isSellerApproved),
    canAccessArtisan: () => RBAC.canAccessArtisan(user?.role || null, isArtisanApproved),
    canAccessAdmin: () => RBAC.canAccessAdmin(user?.role || null),
    canViewAnalytics: () => RBAC.canViewAnalytics(user?.role || null),
    canProcessPayments: () => RBAC.canProcessPayments(user?.role || null),
    canModerateContent: () => RBAC.canModerateContent(user?.role || null),
    canEditProfile: (isOwnProfile: boolean) => RBAC.canEditProfile(user?.role || null, isOwnProfile),
    userRole: user?.role,
    isApproved: {
      seller: isSellerApproved,
      artisan: isArtisanApproved,
    },
  }
}