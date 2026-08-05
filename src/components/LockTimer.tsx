import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, BackHandler, Pressable,
  StatusBar, Vibration, Platform,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { GOLDEN_MOMENT_DURATION_SECONDS } from '../constants/pillars';
import { formatCountdown } from '../services/prayerTimes';

interface Props {
  totalSeconds?: number;
  onComplete: () => void;
  onCancel?: () => void; // optional — should be hard to trigger
  content?: React.ReactNode; // Adhkar content to display
  title?: string;
  subtitle?: string;
}

export function LockTimer({
  totalSeconds = GOLDEN_MOMENT_DURATION_SECONDS,
  onComplete,
  onCancel,
  content,
  title = "Moment d'Or",
  subtitle = 'Le téléphone attend. Toi, tu restes là.',
}: Props) {
  const { Colors, Typography, Spacing, scale } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, scale), [Colors, Typography, Spacing, scale]);

  // prevent screen sleep during Golden Moment (native only)
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeepAwake();
  }

  const [remaining, setRemaining] = useState(totalSeconds);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Block hardware back button (native only)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCompleted(true);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (completed) {
      onComplete();
    }
  }, [completed, onComplete]);

  const progress = 1 - remaining / totalSeconds;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle={Colors.isDark ? "light-content" : "dark-content"} backgroundColor={Colors.bg.primary} />

      <View style={styles.header}>
        <Lock color={Colors.gold} size={40} strokeWidth={1.5} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Circular countdown */}
      <View style={styles.timerContainer}>
        <Text style={styles.countdownText}>{formatCountdown(remaining)}</Text>
        <Text style={styles.countdownLabel}>
          {completed ? 'Accompli ✓' : 'restantes'}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      {/* Adhkar content */}
      {content && (
        <View style={styles.contentContainer}>
          {content}
        </View>
      )}

      {/* Completion CTA */}
      {completed && (
        <Pressable style={styles.completeButton} onPress={onComplete}>
          <Text style={styles.completeButtonText}>Alhamdulillah — Continuer</Text>
        </Pressable>
      )}

      {/* Emergency exit — tap once to arm, tap again within 3s to confirm.
          A press-and-hold gesture was here before, but on real touchscreens
          any tiny finger movement during the hold cancels the RN Pressable
          responder, so it silently never reached 100% — a tap-twice pattern
          has no such failure mode. */}
      {!completed && onCancel && (
        <EmergencyCancel onCancel={onCancel} Colors={Colors} Typography={Typography} Spacing={Spacing} scale={scale} />
      )}
    </View>
  );
}

function EmergencyCancel({ onCancel, Colors, Typography, Spacing, scale }: { onCancel: () => void; Colors: ThemeColors; Typography: TypographyShape; Spacing: SpacingShape; scale: number }) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, scale), [Colors, Typography, Spacing, scale]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handlePress = useCallback(() => {
    if (confirming) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onCancel();
      return;
    }
    setConfirming(true);
    timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
  }, [confirming, onCancel]);

  return (
    <Pressable
      style={[styles.emergencyButton, confirming && styles.emergencyButtonConfirming]}
      onPress={handlePress}
      hitSlop={12}
    >
      <Text style={[styles.emergencyText, confirming && styles.emergencyTextConfirming]}>
        {confirming ? 'Appuie encore pour quitter' : 'Urgence — Quitter'}
      </Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, scale: number) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.gold,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countdownText: {
    fontSize: Math.round(72 * scale),
    fontWeight: Typography.weights.heavy,
    color: Colors.text.primary,
    letterSpacing: -2,
  },
  countdownLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    marginTop: Spacing.lg,
  },
  completeButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.bg.primary,
  },
  emergencyButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  emergencyButtonConfirming: {
    backgroundColor: Colors.danger + '22',
  },
  emergencyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
  },
  emergencyTextConfirming: {
    color: Colors.danger,
    fontWeight: Typography.weights.bold,
  },
});
