import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import type { PillarDefinition } from '../constants/pillars';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  pillar: PillarDefinition;
  pointsEarned: number;
  completed: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export function PillarCard({ pillar, pointsEarned, completed, onPress, compact = false }: Props) {
  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

  const fillPct = Math.min((pointsEarned / pillar.maxPoints) * 100, 100);
  const isAtMinimum = pointsEarned >= pillar.maxPoints * 0.5;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 12, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 400 });
  };

  const Icon = pillar.icon;

  return (
    <AnimatedPressable
      style={[
        styles.card,
        compact && styles.cardCompact,
        animatedStyle,
      ]}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Icon color={pillar.color} size={24} strokeWidth={2.5} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.nameFr, { color: pillar.color }]}>{pillar.nameFr}</Text>
          {!compact && (
            <Text style={styles.nameAr}>{pillar.nameAr}</Text>
          )}
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, completed && { color: Colors.success }]}>
            {pointsEarned}
          </Text>
          <Text style={styles.scoreMax}>/{pillar.maxPoints}</Text>
        </View>
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Progress bar */}
      {!compact && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPct}%` as any,
                backgroundColor: isAtMinimum ? Colors.success : pillar.color,
              },
            ]}
          />
        </View>
      )}

      {/* Arrow indicator */}
      {onPress && (
        <Text style={styles.arrow}>›</Text>
      )}
    </AnimatedPressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.bg.cardBorder,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  cardCompact: {
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    padding: Spacing.xs,
    backgroundColor: 'transparent',
    borderRadius: Radius.sm,
  },
  headerText: {
    flex: 1,
  },
  nameFr: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.white,
  },
  nameAr: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heavy,
    color: Colors.white,
  },
  scoreMax: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
    color: Colors.text.muted,
  },
  checkmark: {
    fontSize: Typography.sizes.lg,
    color: Colors.success,
    marginLeft: Spacing.xs,
  },
  progressTrack: {
    marginTop: Spacing.sm,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  arrow: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    fontSize: Typography.sizes.xl,
    color: Colors.text.muted,
  },
});
