import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import { formatCountdown } from '../services/prayerTimes';
import { Book, Moon, Activity, Users, Wind } from 'lucide-react-native';

export type TimerMode = 'focus' | 'qaylulah' | 'activity' | 'social' | 'tarwih';

interface TimerConfig {
  label: string;
  icon: (color: string) => React.ReactNode;
  color: string;
  minSeconds: number;
  maxSeconds: number | null;
  completionMessage: string;
}

// Mono-accent: every mode uses the single accent — the icon and label already
// tell the modes apart, so there is no per-pillar colour left to vary.
const getTimerConfigs = (Colors: ThemeColors): Record<TimerMode, TimerConfig> => ({
  focus: {
    label: 'Session Focus',
    icon: (c) => <Book size={44} color={c} strokeWidth={1.4} />,
    color: Colors.gold,
    minSeconds: 15 * 60,
    maxSeconds: null,
    completionMessage: 'Minimum atteint — écris ta ligne !',
  },
  qaylulah: {
    label: 'Qaylulah',
    icon: (c) => <Moon size={44} color={c} strokeWidth={1.4} />,
    color: Colors.gold,
    minSeconds: 20 * 60,
    maxSeconds: 30 * 60,
    completionMessage: 'Qaylulah accomplie — réveille-toi',
  },
  activity: {
    label: 'Activité physique',
    icon: (c) => <Activity size={44} color={c} strokeWidth={1.4} />,
    color: Colors.gold,
    minSeconds: 20 * 60,
    maxSeconds: null,
    completionMessage: 'Objectif atteint — Alhamdulillah !',
  },
  social: {
    label: 'Interaction réelle',
    icon: (c) => <Users size={44} color={c} strokeWidth={1.4} />,
    color: Colors.gold,
    minSeconds: 20 * 60,
    maxSeconds: null,
    completionMessage: '20 minutes de présence accomplie',
  },
  tarwih: {
    label: 'Tarwih',
    icon: (c) => <Wind size={44} color={c} strokeWidth={1.4} />,
    color: Colors.gold,
    minSeconds: 20 * 60,
    maxSeconds: null,
    completionMessage: 'Âme ressourcée — bonne nuit',
  },
});

interface Props {
  mode: TimerMode;
  onComplete: (durationSeconds: number) => void;
  onCancel?: () => void;
  autoStart?: boolean;
  initialElapsedSeconds?: number;
}

type TimerState = 'idle' | 'running' | 'paused' | 'min_reached' | 'max_reached';

export function FocusTimer({ mode, onComplete, onCancel, autoStart = false, initialElapsedSeconds = 0 }: Props) {
  const { Colors, Typography, Spacing, Radius, scale } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius, scale), [Colors, Typography, Spacing, Radius, scale]);
  const TIMER_CONFIGS = React.useMemo(() => getTimerConfigs(Colors), [Colors]);
  const config = TIMER_CONFIGS[mode];
  const [elapsed, setElapsed] = useState(initialElapsedSeconds);
  const [timerState, setTimerState] = useState<TimerState>(autoStart || initialElapsedSeconds > 0 ? 'running' : 'idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minReached = elapsed >= config.minSeconds;
  const maxReached = config.maxSeconds !== null && elapsed >= config.maxSeconds;

  // Note: reaching the minimum no longer force-stops the timer — it just
  // unlocks the "Valider" button while the timer keeps running, so sessions
  // that go past the minimum (e.g. a 45-min social interaction bonus) are
  // still tracked accurately instead of freezing at the minimum.
  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 1;
      if (config.maxSeconds && next >= config.maxSeconds) {
        // Hard auto-stop at max (Qaylulah)
        clearInterval(intervalRef.current!);
        setTimerState('max_reached');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } else if (next === config.minSeconds && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return next;
    });
  }, [config.maxSeconds, config.minSeconds]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, tick]);

  const handleStart = () => setTimerState('running');
  const handlePause = () => setTimerState('paused');
  const handleResume = () => setTimerState('running');
  const handleStop = () => {
    setTimerState('idle');
    onComplete(elapsed);
  };

  // Qaylulah counts down to the 20-min target, then counts up as overtime
  // (still capped at 30 min by the hard auto-stop above).
  const qaylulahOvertime = mode === 'qaylulah' && elapsed >= config.minSeconds;
  const displayTime = mode === 'qaylulah'
    ? (qaylulahOvertime ? elapsed - config.minSeconds : config.minSeconds - elapsed)
    : elapsed;

  return (
    <View style={styles.container}>
      {config.icon(config.color)}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>

      <Text style={styles.time}>{formatCountdown(displayTime)}</Text>
      {qaylulahOvertime && (
        <Text style={styles.countdownLabel}>temps supplémentaire</Text>
      )}

      {/* Progress bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min((elapsed / config.minSeconds) * 100, 100)}%` as any },
          ]}
        />
      </View>

      {minReached && (
        <Text style={styles.milestone}>{config.completionMessage}</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {timerState === 'idle' && (
          <ActionButton label="Démarrer" color={config.color} onPress={handleStart} styles={styles} />
        )}
        {timerState === 'running' && (
          <>
            <ActionButton label="Pause" color={Colors.warning} onPress={handlePause} secondary styles={styles} />
            {minReached && (
              <ActionButton label="Valider" color={Colors.success} onPress={handleStop} styles={styles} />
            )}
          </>
        )}
        {timerState === 'paused' && (
          <>
            <ActionButton label="Reprendre" color={config.color} onPress={handleResume} styles={styles} />
            {minReached && (
              <ActionButton label="Valider" color={Colors.success} onPress={handleStop} styles={styles} />
            )}
          </>
        )}
        {(timerState === 'min_reached' || timerState === 'max_reached') && (
          <ActionButton label="Valider la session" color={Colors.success} onPress={handleStop} styles={styles} />
        )}
      </View>

      {onCancel && (
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      )}
    </View>
  );
}

function ActionButton({
  label, color, onPress, secondary = false, styles
}: {
  label: string; color: string; onPress: () => void; secondary?: boolean; styles: any;
}) {
  return (
    <Pressable
      style={[
        styles.actionBtn,
        secondary
          ? { borderColor: color, borderWidth: 1, backgroundColor: 'transparent' }
          : { backgroundColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.actionBtnText, secondary && { color }]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape, scale: number) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    textTransform: 'uppercase',
    letterSpacing: Typography.sizes.xs * 0.12,
  },
  time: {
    fontSize: Math.round(56 * scale),
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: Typography.sizes.xs * 0.12,
    marginTop: -Spacing.sm,
  },
  track: {
    width: '100%',
    height: 5,
    backgroundColor: Colors.border,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
  milestone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
  },
  cancelBtn: {
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },
});
