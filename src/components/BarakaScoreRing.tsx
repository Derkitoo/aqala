import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useScaledTheme, ThemeColors, type TypographyShape } from '../constants/theme';
import type { BarakaScoreBreakdown } from '../engine/barakaScoring';

interface Props {
  breakdown: BarakaScoreBreakdown;
  size?: number;
  showLabel?: boolean;
}

const STROKE_WIDTH = 14;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BarakaScoreRing({ breakdown, size = 180, showLabel = true }: Props) {
  const { finalScore } = breakdown;
  const radius = (size - STROKE_WIDTH * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const { Colors, Typography } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography), [Colors, Typography]);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: finalScore,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [finalScore]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const ringColor =
    finalScore >= 90 ? Colors.gold :
    finalScore >= 70 ? Colors.pillar.spiritual :
    finalScore >= 50 ? Colors.pillar.knowledge :
    Colors.text.muted;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Score arc */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, styles.centerContent]}>
        <Text style={[styles.scoreText, { color: ringColor }]}>{finalScore}</Text>
        {showLabel && (
          <Text style={styles.scoreLabel}>Baraka</Text>
        )}
        {breakdown.multiplier > 1 && (
          <Text style={styles.multiplierBadge}>×{breakdown.multiplier.toFixed(2)}</Text>
        )}
      </View>

      {/* Pillar dots row */}
      <View style={styles.pillarsRow}>
        <PillarDot color={Colors.pillar.spiritual} value={breakdown.spiritual} max={35} Colors={Colors} Typography={Typography} />
        <PillarDot color={Colors.pillar.knowledge} value={breakdown.knowledge} max={25} Colors={Colors} Typography={Typography} />
        <PillarDot color={Colors.pillar.physical}  value={breakdown.physical}  max={15} Colors={Colors} Typography={Typography} />
        <PillarDot color={Colors.pillar.social}    value={breakdown.social}    max={15} Colors={Colors} Typography={Typography} />
        <PillarDot color={Colors.pillar.sleep}     value={breakdown.sleep}     max={10} Colors={Colors} Typography={Typography} />
      </View>
    </View>
  );
}

function PillarDot({ color, value, max, Colors, Typography }: { color: string; value: number; max: number; Colors: ThemeColors; Typography: TypographyShape }) {
  const filled = value >= max * 0.5;
  const styles = React.useMemo(() => createStyles(Colors, Typography), [Colors, Typography]);
  return (
    <View style={[styles.dot, { backgroundColor: filled ? color : Colors.border }]} />
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape) => StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.heavy,
    lineHeight: Typography.sizes.hero * 1.1,
  },
  scoreLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  multiplierBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
