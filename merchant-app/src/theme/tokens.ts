/** OpenMarket merchant tokens — OKLCH intent, hex for RN runtime */
export const colors = {
  bg: '#FFFFFF',
  surface: '#F3F5F7',
  ink: '#141A24',
  muted: '#4B5568',
  primary: '#1B5E3B',
  primaryPressed: '#144A2E',
  accent: '#C9A227',
  brandGold: '#D4AF37',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  success: '#15803D',
  successBg: '#DCFCE7',
  pending: '#A16207',
  pendingBg: '#FEF9C3',
  error: '#B91C1C',
  errorBg: '#FEE2E2',
  border: '#E2E6EB',
  subsidy: '#065F46',
  subsidyBg: '#D1FAE5',
  onPrimary: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const touch = {
  minTarget: 48,
  stepper: 52,
} as const;

export const typography = {
  family: undefined as string | undefined,
  title: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  account: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 2, lineHeight: 34 },
} as const;
