import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, BackHandler, Pressable,
  StatusBar, Platform,
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
  // forceDark: the Golden Moment is always the dark pair, whatever the user's
  // Appearance setting is — the screen is a contemplative lock, not a page.
  const { Colors, Typography, Spacing, scale } = useScaledTheme(true);
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

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      <View style={styles.top}>
        <Lock color={Colors.gold} size={30} strokeWidth={1.6} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>
      <Text style={styles.countdownLabel}>{completed ? 'Accompli ✓' : 'restantes'}</Text>

      {/* 2px flat progress rule, accent fill */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      {/* Adhkar content */}
      {content && <View style={styles.contentContainer}>{content}</View>}

      <View style={styles.actionsRow}>
        {/* Emergency exit — tap once to arm, tap again within 3s to confirm.
            A press-and-hold gesture was here before, but on real touchscreens
            any tiny finger movement during the hold cancels the RN Pressable
            responder, so it silently never reached 100% — a tap-twice pattern
            has no such failure mode. */}
        {!completed && onCancel && (
          <EmergencyCancel onCancel={onCancel} Colors={Colors} Typography={Typography} Spacing={Spacing} scale={scale} />
        )}

        {completed && (
          <Pressable style={({ pressed }) => [styles.completeBtn, pressed && styles.pressed]} onPress={onComplete}>
            <Text style={styles.completeBtnText}>Alhamdulillah — Continuer</Text>
          </Pressable>
        )}
      </View>
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
      style={({ pressed }) => [styles.cancelBtn, confirming && styles.cancelBtnConfirming, pressed && styles.pressed]}
      onPress={handlePress}
      hitSlop={12}
    >
      <Text style={[styles.cancelBtnText, confirming && styles.cancelBtnTextConfirming]}>
        {confirming ? 'Appuie encore pour quitter' : 'Urgence — Quitter'}
      </Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, scale: number) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  pressed: { opacity: 0.55 },

  top: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  title: {
    fontSize: Typography.sizes.xxl - 4,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.4,
    marginTop: -4,
  },

  countdown: {
    fontSize: Math.round(48 * scale),
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: Typography.sizes.xs * 0.12,
    marginTop: Spacing.xs,
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 26,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },

  contentContainer: {
    flex: 1,
    width: '100%',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnConfirming: {
    borderColor: Colors.danger,
  },
  cancelBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
  },
  cancelBtnTextConfirming: {
    color: Colors.danger,
  },
  completeBtn: {
    flex: 1,
    backgroundColor: Colors.gold,
    paddingVertical: 13,
    alignItems: 'center',
  },
  completeBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
  },
});
