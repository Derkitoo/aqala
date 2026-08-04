import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const commonColors = {
  pillar: {
    spiritual: '#4A90D9',
    spiritualLight: '#EEF4FF',
    knowledge: '#2D6A4F',
    knowledgeLight: '#E8F5E9',
    physical: '#E07B39',
    physicalLight: '#FFF3E0',
    social: '#C0405A',
    socialLight: '#FCE4EC',
    sleep: '#6C3483',
    sleepLight: '#EDE7F6',
  },
  gold: '#F5C842',
  goldDim: '#A88A1A',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
};

export const PremiumColors = {
  ...commonColors,
  isDark: true,
  bg: {
    primary: '#000000',
    secondary: '#0A0A0A',
    card: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    overlay: 'rgba(0,0,0,0.85)',
    gradient: ['#000000', '#050505'] as [string, string],
  },
  white: '#FFFFFF', // pure white used occasionally
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.65)',
    muted: 'rgba(255, 255, 255, 0.4)',
  },
  border: 'rgba(255, 255, 255, 0.12)',
};

export const LightColors = {
  ...commonColors,
  // Bright gold reads well on black but fails contrast on a white/light
  // background — darkened specifically for this theme (same hue family,
  // still reads as "gold"). Backgrounds/tints using Colors.gold + alpha
  // (badges, progress bars) are unaffected in spirit, just a shade deeper.
  gold: '#A87B0A',
  goldDim: '#7A5A08',
  isDark: false,
  bg: {
    primary: '#F9FAFB', // Très doux
    secondary: '#F3F4F6',
    card: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0,0,0,0.4)',
    gradient: ['#F9FAFB', '#F3F4F6'] as [string, string],
  },
  white: '#FFFFFF',
  text: {
    primary: '#111827', // Presque noir
    secondary: '#4B5563', // Gris anthracite
    muted: '#9CA3AF',
  },
  border: 'rgba(0, 0, 0, 0.1)',
};

export type ThemeColors = typeof PremiumColors;

export function useTheme(): ThemeColors {
  const theme = useAppStore(state => state.theme);
  return theme === 'light' ? LightColors : PremiumColors;
}

// Fallback for non-React contexts if needed (default to Premium)
export const Colors = PremiumColors;

// Shared elevation used for every "floating" card across the app, replacing
// the old 1px border look. Shadow opacity is tuned per theme: a visible dark
// shadow reads on the near-black dark background, but the same opacity would
// look muddy on a white card, hence the lighter value for light theme.
export function cardShadow(Colors: ThemeColors) {
  return {
    shadowColor: Colors.isDark ? '#000000' : '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Colors.isDark ? 0.25 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  } as const;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  fonts: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
    heavy: 'Outfit_800ExtraBold',
  },
} as const;

// ─── Responsive scaling ─────────────────────────────────────────────────────
//
// Typography/Spacing/Radius above are fixed px values tuned for the ~360–430
// logical-px range that covers virtually every phone in portrait. Unusual
// form factors (a folded Galaxy Z Fold's cover screen, tablets) can report a
// logical width well outside that band, making fixed px sizes look tiny or
// oversized relative to the space actually available. useScaledTheme()
// derives a scale factor from the live window width — it's a no-op (scale
// exactly 1) inside the standard phone band, so ordinary phones render
// pixel-identical to before; only outlier widths are adjusted, and only
// moderately (capped) so nothing balloons on a tablet.

const STANDARD_MIN = 360;   // narrowest mainstream phone (e.g. older compact Android)
const STANDARD_MAX = 430;   // widest mainstream "plus/max" phone
const MIN_SCALE = 0.92;
const MAX_SCALE = 1.8;
// How fast the scale ramps up past STANDARD_MAX — every this-many px of extra
// width adds +1.0x scale. Smaller = more aggressive. 200 reaches the 1.8x cap
// by ~600px wide, which is generous enough for outlier widths (a folded
// foldable's cover screen, a tablet) without needing to know the exact number.
const RAMP_PX_PER_SCALE_UNIT = 200;

function computeScale(width: number): number {
  if (width >= STANDARD_MIN && width <= STANDARD_MAX) return 1;
  if (width < STANDARD_MIN) return Math.max(width / STANDARD_MIN, MIN_SCALE);
  const raw = 1 + (width - STANDARD_MAX) / RAMP_PX_PER_SCALE_UNIT;
  return Math.min(raw, MAX_SCALE);
}

function scaleRecord<T extends Record<string, number>>(obj: T, scale: number): T {
  const out = {} as T;
  (Object.keys(obj) as (keyof T)[]).forEach(key => {
    out[key] = Math.round(obj[key] * scale) as T[keyof T];
  });
  return out;
}

export type TypographyShape = typeof Typography;
export type SpacingShape = typeof Spacing;
export type RadiusShape = typeof Radius;

export interface ScaledTheme {
  Colors: ThemeColors;
  Typography: TypographyShape;
  Spacing: SpacingShape;
  Radius: RadiusShape;
  scale: number;
}

/**
 * Combined theme hook: Colors (dark/light) + Typography/Spacing/Radius
 * scaled to the current window width. Use this instead of the static
 * Typography/Spacing/Radius exports in any component that renders text or
 * sized layout, so it adapts on outlier screen widths (and re-adapts live
 * if a foldable is unfolded mid-session).
 */
export function useScaledTheme(): ScaledTheme {
  const Colors = useTheme();
  const { width } = useWindowDimensions();
  const scale = useMemo(() => computeScale(width), [width]);

  return useMemo(
    () => ({
      Colors,
      Typography: scale === 1 ? Typography : { ...Typography, sizes: scaleRecord(Typography.sizes, scale) },
      Spacing: scale === 1 ? Spacing : scaleRecord(Spacing, scale),
      Radius: scale === 1 ? Radius : { ...scaleRecord({ sm: Radius.sm, md: Radius.md, lg: Radius.lg }, scale), full: Radius.full },
      scale,
    }),
    [Colors, scale],
  );
}
