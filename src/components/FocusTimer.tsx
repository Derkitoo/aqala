import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
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
}

type TimerState = 'idle' | 'running' | 'paused' | 'min_reached' | 'max_reached';

export function FocusTimer({ mode, onComplete, onCancel, autoStart = false }: Props) {
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  const TIMER_CONFIGS = React.useMemo(() => getTimerConfigs(Colors), [Colors]);
  const config = TIMER_CONFIGS[mode];
  const [elapsed, setElapsed] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>(autoStart ? 'running' : 'idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minReached = elapsed >= config.minSeconds;
  const maxReached = config.maxSeconds !== null && elapsed >= config.maxSeconds;

  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 1;
      if (config.maxSeconds && next >= config.maxSeconds) {
        // Auto-stop at max (Qaylulah)
        clearInterval(intervalRef.current!);
        setTimerState('max_reached');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } else if (next === config.minSeconds) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setTimerState('min_reached');
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

  const displayTime = mode === 'qaylulah' && config.maxSeconds
    ? config.maxSeconds - elapsed  // countdown for Qaylulah
    : elapsed;                     // count-up for everything else

  return (
    <View style={styles.container}>
      {config.icon(config.color)}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>

      <Text style={styles.time}>{formatCountdown(displayTime)}</Text>

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

      {onCancel && timerState === 'idle' && (
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

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    color: Colors.white,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
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
