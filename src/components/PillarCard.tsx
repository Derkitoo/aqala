import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import type { PillarDefinition } from '../constants/pillars';

interface Props {
  pillar: PillarDefinition;
  pointsEarned: number;
  completed: boolean;
  onPress?: () => void;
  compact?: boolean;
}

/**
 * A pillar as a flush modular-grid row, not a card:
 *
 *   01  ♥  Pilier Spirituel / الروحانية        18/35  ›
 *   ────────────────────────────────────────────────── 2px accent progress
 *
 * No background fill, no radius, no shadow — rows are separated by a 1px rule.
 * The progress rule is accent-only: there is no per-pillar colour and no
 * second "at minimum" colour.
 */
export function PillarCard({ pillar, pointsEarned, completed, onPress, compact = false }: Props) {
  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  const fillPct = Math.min((pointsEarned / pillar.maxPoints) * 100, 100);
  const Icon = pillar.icon;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, compact && styles.rowCompact, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.numeral}>{pillar.numeral}</Text>
        <Icon color={Colors.text.primary} size={20} strokeWidth={1.6} />
        <View style={styles.names}>
          <Text style={styles.nameFr}>{pillar.nameFr}</Text>
          {!compact && <Text style={styles.nameAr}>{pillar.nameAr}</Text>}
        </View>
        <View style={styles.scoreWrap}>
          <Text style={styles.score}>{pointsEarned}</Text>
          <Text style={styles.scoreMax}>/{pillar.maxPoints}</Text>
        </View>
        {completed
          ? <Check color={Colors.gold} size={14} strokeWidth={2.4} />
          : onPress ? <ChevronRight color={Colors.text.secondary} size={14} strokeWidth={2} /> : null}
      </View>

      {!compact && (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${fillPct}%` as any }]} />
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape) => StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 14,
  },
  rowCompact: {
    paddingVertical: Spacing.sm,
  },
  rowPressed: {
    opacity: 0.55,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numeral: {
    width: 16,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.muted,
  },
  names: {
    flex: 1,
  },
  nameFr: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  nameAr: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: Typography.sizes.md + 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  scoreMax: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },
  barTrack: {
    height: 2,
    backgroundColor: Colors.border,
    marginTop: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
});
