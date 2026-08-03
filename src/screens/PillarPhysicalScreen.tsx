import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { ACTIVITY_TYPES, type ActivityType } from '../constants/pillars';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import { Activity, Moon, ChevronRight, AlertCircle, Dumbbell, Zap, Footprints } from 'lucide-react-native';

type Phase = 'overview' | 'activity_select' | 'activity_timer' | 'qaylulah_timer';

export function PillarPhysicalScreen() {
  const { today, completeActivity, completeQaylulah } = useDayStore();
  const p = today.physical;
  const [phase, setPhase] = useState<Phase>('overview');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const activityDone = p.activityCompletedAt !== null;
  const qaylulahDone = p.qaylulahCompletedAt !== null;

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

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
              onPress={() => setPhase('qaylulah_timer')}
              Colors={Colors}
            />

            {/* Tips */}
            <View style={styles.tipsBox}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm}}>
                <AlertCircle size={16} color={Colors.white} />
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
              // mapping legacy emoji constants to Lucide just for this selector (since they are in constants)
              let TypeIcon = Activity;
              if (type === 'cardio') TypeIcon = Zap;
              if (type === 'strength') TypeIcon = Dumbbell;
              if (type === 'flexibility') TypeIcon = Footprints;

              return (
                <Pressable
                  key={type}
                  style={styles.activityCard}
                  onPress={() => { setSelectedActivity(type); setPhase('activity_timer'); }}
                >
                  <TypeIcon size={24} color={Colors.text.primary} />
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

        {/* Activity timer */}
        {phase === 'activity_timer' && selectedActivity && (
          <>
            <View style={styles.activityBadge}>
              <Activity size={16} color={Colors.pillar.physical} />
              <Text style={styles.activityBadgeText}>{ACTIVITY_TYPES[selectedActivity].label}</Text>
            </View>
            <FocusTimer
              mode="activity"
              onComplete={dur => {
                completeActivity(selectedActivity, dur);
                setPhase('overview');
              }}
              onCancel={() => setPhase('activity_select')}
            />
          </>
        )}

        {/* Qaylulah timer */}
        {phase === 'qaylulah_timer' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm}}>
              <Moon size={24} color={Colors.white} />
              <Text style={styles.phaseLabel}>Qaylulah</Text>
            </View>
            <Text style={styles.phaseSubLabel}>
              Compte à rebours de 20 minutes. Alarme douce à la fin.
            </Text>
            <FocusTimer
              mode="qaylulah"
              autoStart
              onComplete={dur => {
                completeQaylulah(dur);
                setPhase('overview');
              }}
              onCancel={() => setPhase('overview')}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ IconComponent, title, subtitle, done, points, onPress, Colors }: {
  IconComponent: any; title: string; subtitle: string;
  done: boolean; points: string; onPress: () => void; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
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

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.pillar.physical,
  },
  hadithText: {
    fontSize: Typography.sizes.md,
    color: Colors.white,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  hadithRef: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 4 },

  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionCardDone: { borderColor: Colors.success },
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
    gap: Spacing.md,
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
  backBtn: { marginTop: Spacing.md },
  backText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
});
