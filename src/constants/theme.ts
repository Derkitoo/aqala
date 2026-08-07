import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';

// ─── Modernist palette ──────────────────────────────────────────────────────
//
// Flat, architectural, red-on-paper. Light = ink on paper, dark = paper on ink
// (a literal inversion — no new hues are invented for the dark pair).
//
// There is a SINGLE accent for the whole app. The old per-pillar palette
// (blue/green/orange/pink/purple) is gone: pillars are told apart by icon +
// numeral (01–05) + name, never by colour. The `gold` role is kept as the
// name of that single accent so every existing `Colors.gold` consumer keeps
// working; `success` collapses onto it too (an affirmative state is accent,
// not green), and `warning`/`danger` share one "warn" red per theme.

const ACCENT = '#ec3013';
const ACCENT_HOVER_LIGHT = '#dd2b0f';
const ACCENT_HOVER_DARK  = '#ff9783';

// A named palette (not just five hardcoded hexes inline) so a future
// "choose your palette" setting only has to swap this object out, rather
// than hunting down every place a pillar colour is used. Chosen to read
// clearly against both bg.card fills and stay distinct from the single red
// ACCENT above, so pillar tiles don't all collapse into "the same colour".
export const PILLAR_PALETTE = {
  spiritual: '#E8A33D',
  knowledge: '#3FA796',
  physical: '#5B8DEF',
  social: '#D46FB3',
  sleep: '#8B7CD9',
} as const;

export const PremiumColors = {
  isDark: true,
  gold: ACCENT,              // the single accent
  goldDim: '#ffc4b8',        // accent-on-tint text
  accentHover: ACCENT_HOVER_DARK,
  accentTint: '#4d170e',     // faint accent fill (partial states, tags)
  success: ACCENT,
  warning: '#ff9783',
  danger: '#ff9783',
  bg: {
    primary: '#201e1d',
    secondary: '#2d2b2b',
    card: '#2d2b2b',         // flat "surface" fill — never shadowed
    cardBorder: 'rgba(248, 244, 244, 0.28)',
    overlay: 'rgba(32, 30, 29, 0.7)',
    gradient: ['#201e1d', '#201e1d'] as [string, string],
  },
  white: '#FFFFFF',
  text: {
    primary: '#f8f4f4',
    secondary: 'rgba(248, 244, 244, 0.60)',
    muted: 'rgba(248, 244, 244, 0.36)',
  },
  border: 'rgba(248, 244, 244, 0.28)', // the 2px "divider" rule colour
};

export const LightColors: typeof PremiumColors = {
  isDark: false,
  gold: ACCENT,
  goldDim: '#7c1405',
  accentHover: ACCENT_HOVER_LIGHT,
  accentTint: '#fff2ef',
  success: ACCENT,
  warning: '#ae1800',
  danger: '#ae1800',
  bg: {
    primary: '#f3f2f2',
    secondary: '#eae9e9',
    card: '#eae9e9',
    cardBorder: 'rgba(32, 30, 29, 0.40)',
    overlay: 'rgba(32, 30, 29, 0.7)',
    gradient: ['#f3f2f2', '#f3f2f2'] as [string, string],
  },
  white: '#FFFFFF',
  text: {
    primary: '#201e1d',
    secondary: 'rgba(32, 30, 29, 0.58)',
    muted: 'rgba(32, 30, 29, 0.38)',
  },
  border: 'rgba(32, 30, 29, 0.40)',
};

export type ThemeColors = typeof PremiumColors;

/**
 * Pass `forceDark` to pin a screen to the dark pair regardless of the user's
 * Appearance setting — the Golden Moment is always contemplative/locked and
 * renders dark even in light mode.
 */
export function useTheme(forceDark = false): ThemeColors {
  const theme = useAppStore(state => state.theme);
  if (forceDark) return PremiumColors;
  return theme === 'light' ? LightColors : PremiumColors;
}

// Fallback for non-React contexts if needed (default to Premium)
export const Colors = PremiumColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Modernist has no rounding: cards, chips, buttons, checkboxes, avatars and
// calendar cells are all square. `full` survives only for the native-style
// radio dots (Settings / Onboarding mode pickers), which stay circular.
export const Radius = {
  sm: 0,
  md: 0,
  lg: 0,
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
    regular: 'Archivo_400Regular',
    medium: 'Archivo_500Medium',
    semibold: 'Archivo_600SemiBold',
    bold: 'Archivo_700Bold',
    heavy: 'Archivo_800ExtraBold', // all headings
  },
} as const;

// ─── Responsive scaling ─────────────────────────────────────────────────────
//
// Typography/Spacing above are fixed px values tuned for the ~360–430
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
 *
 * `forceDark` pins the colour pair to dark — see useTheme().
 */
export function useScaledTheme(forceDark = false): ScaledTheme {
  const Colors = useTheme(forceDark);
  const { width } = useWindowDimensions();
  const scale = useMemo(() => computeScale(width), [width]);

  return useMemo(
    () => ({
      Colors,
      Typography: scale === 1 ? Typography : { ...Typography, sizes: scaleRecord(Typography.sizes, scale) },
      Spacing: scale === 1 ? Spacing : scaleRecord(Spacing, scale),
      Radius,
      scale,
    }),
    [Colors, scale],
  );
}
