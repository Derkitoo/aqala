import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { useScaledTheme, usePillarColors, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import type { PillarDefinition } from '../constants/pillars';

interface Props {
  pillar: PillarDefinition;
  pointsEarned: number;
  completed: boolean;
  onPress?: () => void;
  /** Spans the full row instead of sitting in the 2-column grid — used for
   * the trailing 5th pillar so the grid reads as 2+2+1, not an awkward gap. */
  wide?: boolean;
}

export function PillarCard({ pillar, pointsEarned, completed, onPress, wide = false }: Props) {
  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  const pillarColors = usePillarColors();

  const fillPct = Math.min((pointsEarned / pillar.maxPoints) * 100, 100);
  const Icon = pillar.icon;
  const accent = pillarColors[pillar.id];

  if (wide) {
    return (
      <Pressable
        style={({ pressed }) => [styles.tile, styles.tileWide, pressed && styles.tilePressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.iconBadge, { backgroundColor: accent + '1F' }]}>
          <Icon color={accent} size={18} strokeWidth={1.8} />
        </View>
        <View style={styles.wideNames}>
          <Text style={[styles.nameFr, styles.nameFrWide]} numberOfLines={1}>{pillar.nameFr}</Text>
          <Text style={styles.nameAr} numberOfLines={1}>{pillar.nameAr}</Text>
        </View>
        <Text style={[styles.score, styles.scoreWide]}>{pointsEarned}<Text style={styles.scoreMax}>/{pillar.maxPoints}</Text></Text>
        {completed
          ? <Check color={Colors.gold} size={16} strokeWidth={2.4} />
          : onPress ? <ChevronRight color={Colors.text.muted} size={16} strokeWidth={2} /> : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBadge, { backgroundColor: accent + '1F' }]}>
        <Icon color={accent} size={18} strokeWidth={1.8} />
      </View>
      <Text style={styles.nameFr} numberOfLines={1}>{pillar.nameFr}</Text>
      <Text style={styles.score}>{pointsEarned}<Text style={styles.scoreMax}>/{pillar.maxPoints}</Text></Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${fillPct}%` as any, backgroundColor: accent }]} />
      </View>
    </Pressable>
  );
}

// This card grid deliberately breaks from the rest of the app's square
// "Modernist" system (theme.ts's Radius.sm/md/lg are 0 by design there) —
// it needs its own literal radius values, not the shared (zeroed) tokens.
const TILE_RADIUS = 16;
const BADGE_RADIUS = 10;

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: TILE_RADIUS,
    padding: Spacing.md - 2,
  },
  tileWide: {
    flexBasis: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tilePressed: {
    opacity: 0.7,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: BADGE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideNames: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  nameFr: {
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.primary,
    marginTop: 10,
  },
  nameFrWide: {
    marginTop: 0,
  },
  nameAr: {
    fontSize: Typography.sizes.xs - 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: 1,
  },
  score: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: 2,
  },
  scoreWide: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.primary,
    marginTop: 0,
  },
  scoreMax: {
    color: Colors.text.muted,
  },
  barTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
