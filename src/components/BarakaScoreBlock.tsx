import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { PILLARS, type PillarId } from '../constants/pillars';
import type { BarakaScoreBreakdown } from '../engine/barakaScoring';

interface Props {
  breakdown: BarakaScoreBreakdown;
}

const ORDER: PillarId[] = ['spiritual', 'knowledge', 'physical', 'social', 'sleep'];

/**
 * The Baraka score as a flat block, framed by 2px rules top and bottom:
 * kicker → big numeral + /100 + multiplier → a 5-segment horizontal bar.
 *
 * Each segment is as wide as that pillar's weight in the score (35/25/15/15/10)
 * and fills to that pillar's completion %, so the bar reads as the score's
 * actual composition. Replaces the old animated SVG ring — same data, drawn as
 * rectangles.
 */
export function BarakaScoreBlock({ breakdown }: Props) {
  const { Colors, Typography, Spacing, scale } = useScaledTheme();
  const styles = React.useMemo(
    () => createStyles(Colors, Typography, Spacing, scale),
    [Colors, Typography, Spacing, scale],
  );

  return (
    <View style={styles.block}>
      <Text style={styles.kicker}>BARAKA</Text>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{breakdown.finalScore}</Text>
        <Text style={styles.scoreMax}>/100</Text>
        {breakdown.multiplier > 1 && (
          <Text style={styles.multiplier}>×{breakdown.multiplier.toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.barTrack}>
        {ORDER.map(id => {
          const pillar = PILLARS[id];
          const pct = Math.min(breakdown[id] / pillar.maxPoints, 1) * 100;
          return (
            <View key={id} style={[styles.segment, { flex: pillar.weight * 100 }]}>
              <View style={[styles.segmentFill, { width: `${pct}%` as any }]} />
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        {ORDER.map(id => (
          <Text key={id} style={[styles.legendLabel, { flex: PILLARS[id].weight * 100 }]}>
            {PILLARS[id].short}
          </Text>
        ))}
      </View>
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, scale: number) => StyleSheet.create({
  block: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.lg - Spacing.xs,
    marginBottom: Spacing.lg - Spacing.xs,
  },
  kicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: Spacing.xs,
    marginBottom: 14,
  },
  score: {
    fontSize: Math.round(56 * scale),
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    lineHeight: Math.round(56 * scale),
  },
  scoreMax: {
    fontSize: Typography.sizes.md + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },
  multiplier: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    marginLeft: 'auto',
  },

  barTrack: {
    flexDirection: 'row',
    gap: 2,
    height: 10,
  },
  segment: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
  },
  legendLabel: {
    fontSize: 9 * scale,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
