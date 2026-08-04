import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import {
  ACTIVITY_TYPES, ACTIVITY_GUIDE_INTRO, pickActivitySuggestions, QAYLULAH_TIPS,
  type ActivityType, type ActivitySuggestion,
} from '../constants/pillars';
import { computePhysicalBalance } from '../engine/trends';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import {
  Activity, Moon, ChevronRight, AlertCircle, Dumbbell, Zap, Footprints,
  Shuffle, Lightbulb, CalendarRange,
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

  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

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
        <Text style={styles.title}>🏃 Pilier Physique</Text>
        <Text style={styles.subtitle}>الأمانة الجسدية — Entretien du corps</Text>

        {/* Overview */}
        {phase === 'overview' && (
          <>
            <View style={styles.hadithBox}>
              <Text style={styles.hadithText}>
                "Ton corps a un droit sur toi."
              </Text>
              <Text style={styles.hadithRef}>— Sahih Bukhari</Text>
            </View>

            <PhysicalBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} Radius={Radius} />

            {/* Activity block */}
            <SectionCard
              IconComponent={Activity}
              title="Activité physique"
              subtitle={activityDone
                ? `${ACTIVITY_TYPES[p.activityType!].label} — ${Math.round(p.activityDurationSeconds / 60)} min ✓`
                : 'Objectif : 20 min minimum'
              }
              done={activityDone}
              points="10 pts"
              onPress={() => setPhase('activity_select')}
              Colors={Colors}
            Typography={Typography}
            Spacing={Spacing}
            Radius={Radius}
            />

            {/* Qaylulah block */}
            <SectionCard
              IconComponent={Moon}
              title="Qaylulah (Micro-Sieste)"
              subtitle={qaylulahDone
                ? `${Math.round(p.qaylulahDurationSeconds / 60)} min accomplie ✓`
                : 'Timer 20–30 min — Post-Dhouhr idéal'
              }
              done={qaylulahDone}
              points="5–7 pts"
              onPress={() => setPhase('qaylulah_guide')}
              Colors={Colors}
            Typography={Typography}
            Spacing={Spacing}
            Radius={Radius}
            />

            {/* Tips */}
            <View style={styles.tipsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm }}>
                <AlertCircle size={16} color={Colors.text.primary} />
                <Text style={styles.tipsTitle}>Rappels</Text>
              </View>
              <Text style={styles.tip}>• Fenêtre idéale : avant Maghrib (lumière naturelle)</Text>
              <Text style={styles.tip}>• Qaylulah avant 14h = bonus Baraka (+2 pts)</Text>
              <Text style={styles.tip}>• Même 20 min de marche compte — commence petit</Text>
            </View>
          </>
        )}

        {/* Activity select */}
        {phase === 'activity_select' && (
          <>
            <Text style={styles.phaseLabel}>Quel type d'activité ?</Text>
            {(Object.keys(ACTIVITY_TYPES) as ActivityType[]).map(type => {
              const { label } = ACTIVITY_TYPES[type];
              const TypeIcon = ACTIVITY_ICONS[type];

              return (
                <Pressable
                  key={type}
                  style={styles.activityCard}
                  onPress={() => handleActivitySelect(type)}
                >
                  <View style={styles.activityIconBadge}>
                    <TypeIcon size={22} color={Colors.pillar.physical} />
                  </View>
                  <Text style={styles.activityLabel}>{label}</Text>
                  <ChevronRight size={20} color={Colors.text.muted} />
                </Pressable>
              );
            })}
            <Pressable onPress={() => setPhase('overview')} style={styles.backBtn}>
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
            Colors={Colors}
            Typography={Typography}
            Spacing={Spacing}
            Radius={Radius}
          />
        )}

        {/* Activity timer */}
        {phase === 'activity_timer' && selectedActivity && (
          <>
            <View style={styles.activityBadge}>
              <Activity size={16} color={Colors.pillar.physical} />
              <Text style={styles.activityBadgeText}>{ACTIVITY_TYPES[selectedActivity].label}</Text>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md }}>
              <Moon size={24} color={Colors.text.primary} />
              <Text style={styles.phaseLabel}>Qaylulah</Text>
            </View>
            {QAYLULAH_TIPS.map((tip, i) => (
              <View key={i} style={styles.suggestionCard}>
                <Lightbulb size={20} color={Colors.gold} />
                <Text style={styles.suggestionDesc}>{tip}</Text>
              </View>
            ))}
            <View style={styles.guideActions}>
              <Pressable style={styles.backBtn} onPress={() => setPhase('overview')}>
                <Text style={styles.backText}>← Retour</Text>
              </Pressable>
              <Pressable style={styles.guideStartBtn} onPress={handleStartQaylulah}>
                <Text style={styles.guideStartBtnText}>C'est parti — Lancer la Qaylulah</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Qaylulah timer */}
        {phase === 'qaylulah_timer' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
              <Moon size={24} color={Colors.text.primary} />
              <Text style={styles.phaseLabel}>Qaylulah</Text>
            </View>
            <Text style={styles.phaseSubLabel}>
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

function PhysicalBalanceCard({ balance, Colors, Typography, Spacing, Radius }: {
  balance: ReturnType<typeof computePhysicalBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeaderRow}>
        <CalendarRange size={16} color={Colors.text.secondary} />
        <Text style={styles.balanceTitle}>Cette semaine</Text>
      </View>
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

function ActivityGuide({ type, onStart, onBack, Colors, Typography, Spacing, Radius }: {
  type: ActivityType; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>(() => pickActivitySuggestions(type));
  const TypeIcon = ACTIVITY_ICONS[type];

  return (
    <View>
      <View style={styles.activityBadge}>
        <TypeIcon size={16} color={Colors.pillar.physical} />
        <Text style={styles.activityBadgeText}>{ACTIVITY_TYPES[type].label}</Text>
      </View>

      <Text style={styles.guideIntro}>{ACTIVITY_GUIDE_INTRO[type]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.phaseLabel}>Quelques pistes</Text>
        <Pressable style={styles.shuffleBtn} onPress={() => setSuggestions(pickActivitySuggestions(type))}>
          <Shuffle size={14} color={Colors.pillar.physical} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>

      {suggestions.map((sug, i) => (
        <View key={i} style={styles.suggestionCard}>
          <Lightbulb size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitle}>{sug.title}</Text>
            <Text style={styles.suggestionDesc}>{sug.description}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.rule}>
        Libre à toi de suivre ton propre sujet — ces pistes sont là pour t'aider à démarrer.
      </Text>

      <View style={styles.guideActions}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Pressable style={styles.guideStartBtn} onPress={onStart}>
          <Text style={styles.guideStartBtnText}>C'est parti — Lancer le chronomètre</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionCard({ IconComponent, title, subtitle, done, points, onPress, Colors, Typography, Spacing, Radius }: {
  IconComponent: any; title: string; subtitle: string;
  done: boolean; points: string; onPress: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  return (
    <Pressable
      style={[styles.sectionCard, done && styles.sectionCardDone]}
      onPress={onPress}
      disabled={done}
    >
      <IconComponent color={done ? Colors.success : Colors.text.primary} size={26} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={[styles.sectionTitle2, done && { color: Colors.success }]}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.pointsBadge}>{points}</Text>
      {!done && <ChevronRight size={20} color={Colors.text.muted} />}
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.pillar.physical,
    marginBottom: 4,
  },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.lg },

  hadithBox: {
    backgroundColor: Colors.pillar.physical + '12',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.pillar.physical + '33',
  },
  hadithText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  hadithRef: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 4 },

  balanceCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  balanceTitle: {
    fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold,
    color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceItem: { alignItems: 'center' },
  balanceCount: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy, color: Colors.pillar.physical },
  balanceLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },

  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.pillar.physical + '0d',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.pillar.physical + '22',
  },
  sectionCardDone: { borderColor: Colors.success, backgroundColor: Colors.success + '0d' },
  sectionTitle2: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  sectionSubtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginTop: 2 },
  pointsBadge: { fontSize: Typography.sizes.xs, color: Colors.gold },
  arrow: { fontSize: Typography.sizes.xl, color: Colors.text.muted },

  tipsBox: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  tip: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: 4, lineHeight: 18 },

  phaseLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  phaseSubLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pillar.physical + '0d',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.pillar.physical + '22',
  },
  activityIconBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.pillar.physical + '22',
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  activityLabel: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.pillar.physical + '22',
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  activityBadgeIcon: { fontSize: 16 },
  activityBadgeText: { fontSize: Typography.sizes.sm, color: Colors.pillar.physical, fontWeight: Typography.weights.semibold },
  backBtn: { alignSelf: 'center', paddingVertical: Spacing.sm },
  backText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },

  guideIntro: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shuffleBtnText: { fontSize: Typography.sizes.xs, color: Colors.pillar.physical, fontWeight: Typography.weights.semibold },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  suggestionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  suggestionDesc: { flex: 1, fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2, lineHeight: 17 },
  guideActions: { gap: Spacing.sm, marginTop: Spacing.md },
  guideStartBtn: {
    backgroundColor: Colors.pillar.physical, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  guideStartBtnText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.white },

  rule: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
