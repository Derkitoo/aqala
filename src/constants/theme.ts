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
