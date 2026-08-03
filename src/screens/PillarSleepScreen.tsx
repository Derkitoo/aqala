import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { TARWIH_CATEGORIES, type TarwihCategory } from '../constants/pillars';
import { useDayStore } from '../store/useDayStore';
import { useAppStore } from '../store/useAppStore';
import { FocusTimer } from '../components/FocusTimer';
import { Book, Footprints, MessageCircle, Palette, Music, Play, ChevronRight } from 'lucide-react-native';

type Phase = 'overview' | 'tarwih_select' | 'tarwih_timer' | 'done';

export function PillarSleepScreen() {
  const { today, completeTarwih, setBedtime, setNightSas, setQiyam } = useDayStore();
  const { nightMode } = useAppStore();
  const sl = today.sleep;
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  const [phase, setPhase] = useState<Phase>(sl.tarwihCompleted ? 'done' : 'overview');
  const [selectedTarwih, setSelectedTarwih] = useState<TarwihCategory | null>(sl.tarwihCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌙 Pilier Sommeil & Détente</Text>
        <Text style={styles.subtitle}>الترويح — Al-Tarwih</Text>

        {/* Overview */}
        {(phase === 'overview' || phase === 'done') && (
          <>
            {/* Night Sas */}
            <Pressable
              style={[styles.sasCard, sl.nightSasActivated && styles.sasCardActive]}
              onPress={() => setNightSas(!sl.nightSasActivated)}
            >
              <Text style={styles.sasIcon}>📵</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.sasTitle}>Sas de Nuit</Text>
                <Text style={styles.sasSub}>
                  {sl.nightSasActivated ? 'Activé — écran posé ✓' : 'Poser le téléphone après Maghrib/Isha'}
                </Text>
              </View>
              <View style={[styles.toggle, sl.nightSasActivated && styles.toggleOn]}>
                <View style={[styles.toggleThumb, sl.nightSasActivated && styles.toggleThumbOn]} />
              </View>
            </Pressable>

            {/* Tarwih */}
            <SleepBlock
              IconComponent={Play}
              title="Tarwih — Détente de l'Âme"
              subtitle={sl.tarwihCompleted
                ? `${TARWIH_CATEGORIES[sl.tarwihCategory!].label} • ${Math.round(sl.tarwihDurationSeconds / 60)} min ✓`
                : '20 min d\'activité saine hors scroll passif'
              }
              done={sl.tarwihCompleted}
              onPress={() => setPhase('tarwih_select')}
              points="5 pts"
              Colors={Colors}
            />

            {/* Bedtime */}
            <SleepBlock
              IconComponent={Play}
              title="Coucher enregistré"
              subtitle={sl.bedtimeHour !== null
                ? `Couché à ${sl.bedtimeHour}h${sl.bedtimeHour < 23 ? ' — Avant minuit ✓' : ''}`
                : 'Enregistre ton heure de coucher'
              }
              done={sl.bedtimeHour !== null}
              onPress={setBedtime}
              points="5 pts"
              Colors={Colors}
            />

            {/* Qiyam (Advanced mode only) */}
            {nightMode === 'global' && (
              <Pressable
                style={[styles.qiyamCard, sl.qiyamDone && styles.qiyamCardDone]}
                onPress={() => setQiyam(!sl.qiyamDone)}
              >
                <Text style={styles.qiyamIcon}>🌟</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qiyamTitle}>Qiyam al-Layl</Text>
                  <Text style={styles.qiyamSub}>Prière nocturne — 2 à 8 rak'ât dans le dernier tiers</Text>
                </View>
                <View style={[styles.checkbox, sl.qiyamDone && styles.checkboxDone]}>
                  {sl.qiyamDone && <Text style={styles.checkTick}>✓</Text>}
                </View>
              </Pressable>
            )}

            {/* Architecture guide */}
            <View style={styles.guideBox}>
              <Text style={styles.guideTitle}>🌙 Architecture du Sommeil Prophétique</Text>
              {nightMode === 'standard' ? (
                <>
                  <GuideRow time="22h30" label="Coucher" Colors={Colors} />
                  <GuideRow time="04h00" label="Réveil pré-Fajr" Colors={Colors} />
                  <GuideRow time="04h45" label="Fajr" Colors={Colors} />
                </>
              ) : (
                <>
                  <GuideRow time="22h00" label="Phase 1 — Sommeil" Colors={Colors} />
                  <GuideRow time="02h00" label="Réveil Qiyam (2–4 rak'ât)" Colors={Colors} />
                  <GuideRow time="02h30" label="Retour au sommeil" Colors={Colors} />
                  <GuideRow time="04h30" label="Réveil pré-Fajr" Colors={Colors} />
                </>
              )}
            </View>
          </>
        )}

        {/* Tarwih select */}
        {phase === 'tarwih_select' && (
          <>
            <Text style={styles.phaseLabel}>Quelle détente ce soir ?</Text>
            <Text style={styles.phaseSub}>Hors réseaux sociaux et séries passives</Text>
            {(Object.keys(TARWIH_CATEGORIES) as TarwihCategory[]).map(cat => {
              const { label } = TARWIH_CATEGORIES[cat];
              // mapping legacy emoji constants to Lucide just for this selector (since they are in constants)
              let TypeIcon = Play;
              if (cat === 'reading') TypeIcon = Book;
              if (cat === 'walk') TypeIcon = Footprints;
              if (cat === 'conversation') TypeIcon = MessageCircle;
              if (cat === 'art') TypeIcon = Palette;
              if (cat === 'nasheed') TypeIcon = Music;

              return (
                <Pressable
                  key={cat}
                  style={styles.tarwihCard}
                  onPress={() => { setSelectedTarwih(cat); setPhase('tarwih_timer'); }}
                >
                  <TypeIcon size={24} color={Colors.text.primary} />
                  <Text style={styles.tarwihLabel}>{label}</Text>
                  <ChevronRight size={20} color={Colors.text.muted} />
                </Pressable>
              );
            })}
            <Pressable onPress={() => setPhase('overview')} style={styles.backBtn}>
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </>
        )}

        {/* Tarwih timer */}
        {phase === 'tarwih_timer' && selectedTarwih && (
          <>
            <View style={styles.tarwihBadge}>
              <Play size={16} color={Colors.pillar.sleep} />
              <Text style={styles.tarwihBadgeText}>{TARWIH_CATEGORIES[selectedTarwih].label}</Text>
            </View>
            <FocusTimer
              mode="tarwih"
              onComplete={dur => {
                completeTarwih(selectedTarwih, dur);
                setPhase('done');
              }}
              onCancel={() => setPhase('tarwih_select')}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SleepBlock({ IconComponent, title, subtitle, done, onPress, points, Colors }: {
  IconComponent: any; title: string; subtitle: string;
  done: boolean; onPress: () => void; points: string; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <Pressable
      style={[styles.sleepBlock, done && styles.sleepBlockDone]}
      onPress={done ? undefined : onPress}
      disabled={done}
    >
      <IconComponent color={done ? Colors.success : Colors.text.primary} size={24} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={[styles.sleepBlockTitle, done && { color: Colors.success }]}>{title}</Text>
        <Text style={styles.sleepBlockSub}>{subtitle}</Text>
      </View>
      <Text style={styles.pointsBadge}>{points}</Text>
      {!done && <ChevronRight size={20} color={Colors.text.muted} />}
    </Pressable>
  );
}

function GuideRow({ time, label, Colors }: { time: string; label: string; Colors: ThemeColors }) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <View style={styles.guideRow}>
      <Text style={styles.guideTime}>{time}</Text>
      <View style={styles.guideDot} />
      <Text style={styles.guideLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },
  title: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.heavy, color: Colors.pillar.sleep, marginBottom: 4 },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.lg },

  sasCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  sasCardActive: { borderColor: Colors.pillar.sleep },
  sasIcon: { fontSize: 22 },
  sasTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text.primary },
  sasSub: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: Colors.pillar.sleep },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },

  sleepBlock: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  sleepBlockDone: { borderColor: Colors.success },
  sleepBlockTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text.primary },
  sleepBlockSub: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  pointsBadge: { fontSize: Typography.sizes.xs, color: Colors.gold },
  arrow: { fontSize: Typography.sizes.xl, color: Colors.text.muted },

  qiyamCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.gold + '44',
  },
  qiyamCardDone: { borderColor: Colors.success },
  qiyamIcon: { fontSize: 22 },
  qiyamTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.gold },
  qiyamSub: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkTick: { fontSize: 14, color: Colors.bg.primary, fontWeight: Typography.weights.bold as any },

  guideBox: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  guideTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: Spacing.md },
  guideRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  guideTime: { fontSize: Typography.sizes.sm, color: Colors.gold, fontWeight: Typography.weights.bold, width: 48 },
  guideDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pillar.sleep },
  guideLabel: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },

  phaseLabel: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: 4 },
  phaseSub: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.md },
  tarwihCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  tarwihLabel: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  tarwihBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.pillar.sleep + '22', borderRadius: Radius.full,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start', marginBottom: Spacing.md,
  },
  tarwihBadgeIcon: { fontSize: 16 },
  tarwihBadgeText: { fontSize: Typography.sizes.sm, color: Colors.pillar.sleep, fontWeight: Typography.weights.semibold },
  backBtn: { marginTop: Spacing.md },
  backText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
});
