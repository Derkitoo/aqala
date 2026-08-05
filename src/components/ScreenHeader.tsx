import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';

interface Props {
  /** Small accent kicker above the title, e.g. "PILIER · 01". */
  kicker?: string;
  title: string;
  subtitle?: string;
  /** Report title is a notch smaller than a pillar title in the design. */
  size?: 'lg' | 'md';
}

/**
 * The single header every detail screen uses: a square outlined back button,
 * then an accent kicker → title → subtitle block, flush left. Replaces the
 * native stack header (turned off for these routes) so the screens match the
 * design reference instead of stacking two titles.
 */
export function ScreenHeader({ kicker, title, subtitle, size = 'lg' }: Props) {
  const navigation = useNavigation();
  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  return (
    <View style={styles.row}>
      {navigation.canGoBack() && (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ChevronLeft color={Colors.text.primary} size={20} strokeWidth={2} />
        </Pressable>
      )}
      <View style={styles.textWrap}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={[styles.title, size === 'md' && styles.titleMd]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.lg - Spacing.xs,
  },
  pressed: { opacity: 0.55 },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  kicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.sizes.xxl - 4,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  titleMd: {
    fontSize: Typography.sizes.xl,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
