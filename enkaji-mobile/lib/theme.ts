/**
 * Enkaji Brand Theme Constants
 * Matching the web app's styling (app/globals.css)
 * Professional marketplace styling with Kenyan-inspired colors
 */

// Enkaji Brand Colors from web app
const ENKAJI_COLORS = {
  // Primary brand colors matching web app
  primary: '#8B2635',      // Enkaji Maroon
  primaryLight: '#A53E4D',
  primaryDark: '#6B1D29',
  secondary: '#F1F5F9',
  accent: '#EAB308',      // Gold for ratings/features
  gold: '#EAB308',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundLight: '#F1F5F9',
  
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    tertiary: '#64748B',
    white: '#FFFFFF',
    muted: '#94A3B8',
  },
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
}

// Gradient definitions matching web app style
export const Gradients = {
  primary: ['#8B2635', '#A53E4D'],
  surface: ['#FFFFFF', '#F8FAFC'],
  hero: ['#8B2635', '#6B1D29'],
}

// Placeholder image
export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/F5F5DC/8B2635?text=Enkaji'

export const Colors = ENKAJI_COLORS

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 40,
}

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  title: 32,
  hero: 36,
}

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
}

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#8B2635',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
}

// Common styles for reuse - Professional marketplace look
export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  
  screenPadding: {
    paddingHorizontal: Spacing.md,
  },
  
  // Card with Enkaji styling - cream background with shadow
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  // Enkaji branded card with subtle border
  enkajiCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Primary button with Enkaji gradient look
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.full,
  },
  
  primaryButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
  
  // Secondary button
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.full,
  },
  
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
  
  // Price styling
  priceText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  comparePriceText: {
    fontSize: FontSizes.sm,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  
  // Rating stars
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  
  // Category card
  categoryCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  
  // Product card
  productCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
}

export default {
  Colors,
  Gradients,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  CommonStyles,
  PLACEHOLDER_IMAGE,
}

