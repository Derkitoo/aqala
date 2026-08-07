import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import { PILLARS, type PillarId } from '../constants/pillars';
import type { BarakaScoreBreakdown } from '../engine/barakaScoring';

interface Props {
  breakdown: BarakaScoreBreakdown;
  maqamName: string;
  onPressMaqam?: () => void;
}

const ORDER: PillarId[] = ['spiritual', 'knowledge', 'physical', 'social', 'sleep'];

/**
 * The Baraka score as a rounded card: kicker + rank in the header row, a big
 * numeral, and a 5-segment bar sized to each pillar's weight and filled to
 * its completion % — so the bar reads as the score's actual composition.
 */
export function BarakaScoreBlock({ breakdown, maqamName, onPressMaqam }: Props) {
  const { Colors, Typography, Spacing, Radius, scale } = useScaledTheme();
  const styles = React.useMemo(
    () => createStyles(Colors, Typography, Spacing, Radius, scale),
    [Colors, Typography, Spacing, Radius, scale],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>BARAKA DU JOUR</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{breakdown.finalScore}</Text>
            {breakdown.multiplier > 1 && (
              <Text style={styles.multiplier}>×{breakdown.multiplier.toFixed(2)}</Text>
            )}
          </View>
        </View>
        <Pressable onPress={onPressMaqam} disabled={!onPressMaqam} style={styles.rankWrap}>
          <Text style={styles.rankKicker}>RANG</Text>
          <Text style={styles.rankName} numberOfLines={1}>{maqamName}</Text>
        </Pressable>
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
    </View>
  );
}

// Deliberately breaks from the rest of the app's square "Modernist" system
// (theme.ts's Radius.lg is 0 by design there) — this card needs its own
// literal radius, not the shared (zeroed) token.
const CARD_RADIUS = 20;

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape, scale: number) => StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: CARD_RADIUS,
    padding: Spacing.md + 2,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  kicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.muted,
    letterSpacing: Typography.sizes.xs * 0.1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  score: {
    fontSize: Math.round(40 * scale),
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    lineHeight: Math.round(40 * scale),
  },
  multiplier: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  rankWrap: {
    alignItems: 'flex-end',
  },
  rankKicker: {
    fontSize: Typography.sizes.xs - 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },
  rankName: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.primary,
    marginTop: 2,
  },

  barTrack: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  segment: {
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
});
