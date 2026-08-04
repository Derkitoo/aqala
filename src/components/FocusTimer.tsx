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

const getTimerConfigs = (Colors: ThemeColors): Record<TimerMode, TimerConfig> => ({
  focus: {
    label: 'Session Focus',
    icon: (c) => <Book size={48} color={c} />,
    color: Colors.pillar.knowledge,
    minSeconds: 15 * 60,
    maxSeconds: null,
    completionMessage: 'Minimum atteint — écris ta ligne !',
  },
  qaylulah: {
    label: 'Qaylulah',
    icon: (c) => <Moon size={48} color={c} />,
    color: Colors.pillar.physical,
    minSeconds: 20 * 60,
    maxSeconds: 30 * 60,
    completionMessage: 'Qaylulah accomplie — réveille-toi',
  },
  activity: {
    label: 'Activité physique',
    icon: (c) => <Activity size={48} color={c} />,
    color: Colors.pillar.physical,
    minSeconds: 20 * 60,
    maxSeconds: null,
    completionMessage: 'Objectif atteint — Alhamdulillah !',
  },
  social: {
    label: 'Interaction réelle',
    icon: (c) => <Users size={48} color={c} />,
    color: Colors.pillar.social,
    minSeconds: 20 * 60,
    maxSeconds: null,
    completionMessage: '20 minutes de présence accomplie',
  },
  tarwih: {
    label: 'Tarwih',
    icon: (c) => <Wind size={48} color={c} />,
    color: Colors.pillar.sleep,
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
  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
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
            {
              width: `${Math.min((elapsed / config.minSeconds) * 100, 100)}%` as any,
              backgroundColor: minReached ? Colors.success : config.color,
            },
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
          ? { borderColor: color, borderWidth: 1.5, backgroundColor: 'transparent' }
          : { backgroundColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.actionBtnText, secondary && { color }]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 64,
    fontWeight: Typography.weights.heavy,
    color: Colors.text.primary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -Spacing.sm,
  },
  track: {
    width: '80%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  milestone: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    fontWeight: Typography.weights.semibold,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    minWidth: 130,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.bg.primary,
  },
  cancelBtn: {
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
  },
});
