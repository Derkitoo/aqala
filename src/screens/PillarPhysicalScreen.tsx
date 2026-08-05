import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import {
  PILLARS, ACTIVITY_TYPES, ACTIVITY_GUIDE_INTRO, pickActivitySuggestions, QAYLULAH_TIPS,
  type ActivityType, type ActivitySuggestion,
} from '../constants/pillars';
import { computePhysicalBalance } from '../engine/trends';
import { FocusTimer } from '../components/FocusTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useDayStore } from '../store/useDayStore';
import {
  Activity, Moon, ChevronRight, Dumbbell, Zap, Footprints, Shuffle, Check,
} from 'lucide-react-native';

type Phase = 'overview' | 'activity_select' | 'activity_guide' | 'activity_timer' | 'qaylulah_guide' | 'qaylulah_timer';

const ACTIVITY_ICONS: Record<ActivityType, any> = {
  walk: Footprints,
  sport: Dumbbell,
  stretching: Zap,
};

function computeInitialElapsed(startedAt: string | null): number {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export function PillarPhysicalScreen() {
  const {
    today, history, startActivity, cancelActivity, completeActivity,
    startQaylulah, cancelQaylulah, completeQaylulah,
  } = useDayStore();
  const p = today.physical;

  const [phase, setPhase] = useState<Phase>(
    p.activityStartedAt ? 'activity_timer' :
    p.qaylulahStartedAt ? 'qaylulah_timer' :
    'overview',
  );
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(p.activityType);

  const activityDone = p.activityCompletedAt !== null;
  const qaylulahDone = p.qaylulahCompletedAt !== null;

  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  const balance = useMemo(() => computePhysicalBalance(today, history), [today, history]);

  const handleActivitySelect = (type: ActivityType) => {
    setSelectedActivity(type);
    setPhase('activity_guide');
  };

  const handleStartActivity = () => {
    if (!selectedActivity) return;
    startActivity(selectedActivity);
    setPhase('activity_timer');
  };

  const handleCancelActivity = () => {
    cancelActivity();
    setSelectedActivity(null);
    setPhase('activity_select');
  };

  const handleStartQaylulah = () => {
    startQaylulah();
    setPhase('qaylulah_timer');
  };

  const handleCancelQaylulah = () => {
    cancelQaylulah();
    setPhase('overview');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          kicker={`PILIER · ${PILLARS.physical.numeral}`}
          title="Pilier Physique"
          subtitle="الأمانة الجسدية — Entretien du corps"
        />

        {/* Overview */}
        {phase === 'overview' && (
          <>
            <View style={styles.hadithBox}>
              <Text style={styles.hadithText}>"Ton corps a un droit sur toi."</Text>
              <Text style={styles.hadithRef}>— Sahih Bukhari</Text>
            </View>

            <PhysicalBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} />

            <Text style={styles.sectionKicker}>OBJECTIFS DU JOUR</Text>
            <View style={styles.hr} />

            <TaskRow
              IconComponent={Activity}
              title="Activité physique"
              subtitle={activityDone
                ? `${ACTIVITY_TYPES[p.activityType!].label} — ${Math.round(p.activityDurationSeconds / 60)} min ✓`
                : 'Objectif : 20 min minimum'
              }
              done={activityDone}
              points="10 pts"
              onPress={() => setPhase('activity_select')}
              Colors={Colors} Typography={Typography} Spacing={Spacing}
            />

            <TaskRow
              IconComponent={Moon}
              title="Qaylulah (Micro-Sieste)"
              subtitle={qaylulahDone
                ? `${Math.round(p.qaylulahDurationSeconds / 60)} min accomplie ✓`
                : 'Timer 20–30 min — Post-Dhouhr idéal'
              }
              done={qaylulahDone}
              points="5–7 pts"
              onPress={() => setPhase('qaylulah_guide')}
              Colors={Colors} Typography={Typography} Spacing={Spacing}
            />

            <Text style={styles.sectionKicker}>RAPPELS</Text>
            <View style={styles.hr} />
            <Text style={styles.tip}>— Fenêtre idéale : avant Maghrib (lumière naturelle)</Text>
            <Text style={styles.tip}>— Qaylulah avant 14h = bonus Baraka (+2 pts)</Text>
            <Text style={styles.tip}>— Même 20 min de marche compte — commence petit</Text>
          </>
        )}

        {/* Activity select — segmented buttons */}
        {phase === 'activity_select' && (
          <>
            <Text style={styles.introText}>Quel type d'activité ?</Text>
            <View style={styles.segRow}>
              {(Object.keys(ACTIVITY_TYPES) as ActivityType[]).map(type => {
                const active = selectedActivity === type;
                const TypeIcon = ACTIVITY_ICONS[type];
                return (
                  <Pressable
                    key={type}
                    style={({ pressed }) => [styles.seg, active && styles.segActive, pressed && styles.pressed]}
                    onPress={() => handleActivitySelect(type)}
                  >
                    <TypeIcon size={14} strokeWidth={1.8} color={active ? Colors.bg.primary : Colors.text.primary} />
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {ACTIVITY_TYPES[type].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} onPress={() => setPhase('overview')}>
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </>
        )}

        {/* Activity guide — suggestions before starting the timer */}
        {phase === 'activity_guide' && selectedActivity && (
          <ActivityGuide
            type={selectedActivity}
            onStart={handleStartActivity}
            onBack={() => setPhase('activity_select')}
            Colors={Colors} Typography={Typography} Spacing={Spacing}
          />
        )}

        {/* Activity timer */}
        {phase === 'activity_timer' && selectedActivity && (
          <>
            <Text style={styles.categoryTag}>{ACTIVITY_TYPES[selectedActivity].label}</Text>
            <FocusTimer
              mode="activity"
              initialElapsedSeconds={computeInitialElapsed(p.activityStartedAt)}
              onComplete={dur => {
                completeActivity(selectedActivity, dur);
                setPhase('overview');
              }}
              onCancel={handleCancelActivity}
            />
          </>
        )}

        {/* Qaylulah guide */}
        {phase === 'qaylulah_guide' && (
          <View>
            <Text style={styles.sectionKickerTop}>QAYLULAH</Text>
            <View style={styles.hr} />
            <View style={styles.qaylulahBox}>
              <Text style={styles.qaylulahTime}>
                20 min <Text style={styles.qaylulahMax}>(30 min max)</Text>
              </Text>
              {QAYLULAH_TIPS.map((tip, i) => (
                <Text key={i} style={styles.tipRow}>— {tip}</Text>
              ))}
            </View>
            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={handleStartQaylulah}>
              <Text style={styles.primaryBtnText}>C'est parti — Lancer la Qaylulah</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} onPress={() => setPhase('overview')}>
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </View>
        )}

        {/* Qaylulah timer */}
        {phase === 'qaylulah_timer' && (
          <>
            <Text style={styles.categoryTag}>Qaylulah</Text>
            <Text style={styles.introText}>
              Compte à rebours de 20 minutes. Alarme douce à la fin.
            </Text>
            <FocusTimer
              mode="qaylulah"
              autoStart
              initialElapsedSeconds={computeInitialElapsed(p.qaylulahStartedAt)}
              onComplete={dur => {
                completeQaylulah(dur);
                setPhase('overview');
              }}
              onCancel={handleCancelQaylulah}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PhysicalBalanceCard({ balance, Colors, Typography, Spacing }: {
  balance: ReturnType<typeof computePhysicalBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceKicker}>CETTE SEMAINE</Text>
      <View style={styles.balanceRow}>
        {balance.activityEntries.map(e => (
          <View key={e.type} style={styles.balanceItem}>
            <Text style={styles.balanceCount}>{e.count}</Text>
            <Text style={styles.balanceLabel}>{e.label}</Text>
          </View>
        ))}
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.qaylulahCompletedDays}/{balance.windowDays}</Text>
          <Text style={styles.balanceLabel}>Qaylulah</Text>
        </View>
      </View>
    </View>
  );
}

function ActivityGuide({ type, onStart, onBack, Colors, Typography, Spacing }: {
  type: ActivityType; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>(() => pickActivitySuggestions(type));

  return (
    <View>
      <Text style={styles.categoryTag}>{ACTIVITY_TYPES[type].label}</Text>

      <Text style={styles.introText}>{ACTIVITY_GUIDE_INTRO[type]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.sectionKickerFlush}>PISTES SUGGÉRÉES</Text>
        <Pressable
          style={({ pressed }) => [styles.shuffleBtn, pressed && styles.pressed]}
          onPress={() => setSuggestions(pickActivitySuggestions(type))}
        >
          <Shuffle size={14} color={Colors.gold} strokeWidth={1.8} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>
      <View style={styles.hr} />

      {suggestions.map((sug, i) => (
        <View key={i} style={styles.suggestionRow}>
          <Text style={styles.suggestionTitle}>{sug.title}</Text>
          <Text style={styles.suggestionDesc}>{sug.description}</Text>
        </View>
      ))}

      <Text style={styles.rule}>
        Libre à toi de suivre ton propre sujet — ces pistes sont là pour t'aider à démarrer.
      </Text>

      <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={onStart}>
        <Text style={styles.primaryBtnText}>C'est parti — Lancer le chronomètre</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} onPress={onBack}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>
    </View>
  );
}

function TaskRow({ IconComponent, title, subtitle, done, points, onPress, Colors, Typography, Spacing }: {
  IconComponent: any; title: string; subtitle: string;
  done: boolean; points: string; onPress: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <Pressable
      style={({ pressed }) => [styles.taskRow, pressed && !done && styles.pressed]}
      onPress={onPress}
      disabled={done}
    >
      <IconComponent color={done ? Colors.gold : Colors.text.primary} size={18} strokeWidth={1.7} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>{title}</Text>
        <Text style={styles.taskSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.pointsBadge}>{points}</Text>
      {done
        ? <Check size={14} color={Colors.gold} strokeWidth={2.4} />
        : <ChevronRight size={14} color={Colors.text.secondary} strokeWidth={2} />}
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: Spacing.md + 4, paddingTop: Spacing.sm, paddingBottom: 120 },

  pressed: { opacity: 0.55 },

  sectionKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 10,
  },
  sectionKickerTop: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionKickerFlush: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  hr: { height: 2, backgroundColor: Colors.border, marginBottom: 14 },

  // Left accent rule, no fill — the Modernist "quote block".
  hadithBox: {
    backgroundColor: Colors.bg.card,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    padding: Spacing.md,
    marginBottom: 6,
  },
  hadithText: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: (Typography.sizes.sm + 1) * 1.5,
  },
  hadithRef: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
  },

  balanceCard: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.md,
    marginTop: 6,
  },
  balanceKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceItem: { alignItems: 'center' },
  balanceCount: {
    fontSize: Typography.sizes.lg + 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  balanceLabel: {
    fontSize: Typography.sizes.xs - 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 13,
  },
  taskTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  taskTitleDone: { color: Colors.gold },
  taskSubtitle: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  pointsBadge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
  },

  tip: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
    marginBottom: 6,
  },

  introText: {
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.sm + 0.5) * 1.55,
    marginBottom: 18,
  },

  segRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.xs },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  segActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  segText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  segTextActive: { color: Colors.bg.primary },

  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },

  qaylulahBox: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  qaylulahTime: {
    fontSize: Typography.sizes.lg + 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    marginBottom: 10,
  },
  qaylulahMax: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },
  tipRow: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
    marginBottom: 6,
  },

  guideHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 10,
  },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shuffleBtnText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },

  suggestionRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 14,
  },
  suggestionTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  suggestionDesc: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
  },

  rule: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    lineHeight: Typography.sizes.xs * 1.5,
  },

  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    paddingHorizontal: 18,
    marginTop: Spacing.md,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
  },
  backBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  backText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },
});
