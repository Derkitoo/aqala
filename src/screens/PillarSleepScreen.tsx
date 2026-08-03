import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import {
  TARWIH_CATEGORIES, TARWIH_GUIDE_INTRO, pickTarwihSuggestions,
  type TarwihCategory, type TarwihSuggestion,
} from '../constants/pillars';
import { computeSleepBalance } from '../engine/trends';
import { useDayStore } from '../store/useDayStore';
import { useAppStore } from '../store/useAppStore';
import { FocusTimer } from '../components/FocusTimer';
import {
  Book, Footprints, MessageCircle, Palette, Music, Play, ChevronRight,
  Shuffle, Lightbulb, CalendarRange,
} from 'lucide-react-native';

type Phase = 'overview' | 'tarwih_select' | 'tarwih_guide' | 'tarwih_timer' | 'done';

const TARWIH_ICONS: Record<TarwihCategory, any> = {
  reading: Book,
  walk: Footprints,
  conversation: MessageCircle,
  art: Palette,
  nasheed: Music,
};

function computeInitialElapsed(startedAt: string | null): number {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export function PillarSleepScreen() {
  const { today, history, startTarwih, cancelTarwih, completeTarwih, setBedtime, setNightSas, setQiyam } = useDayStore();
  const { nightMode } = useAppStore();
  const sl = today.sleep;
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  const [phase, setPhase] = useState<Phase>(
    sl.tarwihCompleted ? 'done' :
    sl.tarwihStartedAt ? 'tarwih_timer' :
    'overview',
  );
  const [selectedTarwih, setSelectedTarwih] = useState<TarwihCategory | null>(sl.tarwihCategory);

  const balance = useMemo(() => computeSleepBalance(today, history), [today, history]);

  const handleTarwihSelect = (cat: TarwihCategory) => {
    setSelectedTarwih(cat);
    setPhase('tarwih_guide');
  };

  const handleStartTarwih = () => {
    if (!selectedTarwih) return;
    startTarwih(selectedTarwih);
    setPhase('tarwih_timer');
  };

  const handleCancelTarwih = () => {
    cancelTarwih();
    setSelectedTarwih(null);
    setPhase('tarwih_select');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌙 Pilier Sommeil & Détente</Text>
        <Text style={styles.subtitle}>الترويح — Al-Tarwih</Text>

        {/* Overview */}
        {(phase === 'overview' || phase === 'done') && (
          <>
            <SleepBalanceCard balance={balance} Colors={Colors} />

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
              const TypeIcon = TARWIH_ICONS[cat];

              return (
                <Pressable
                  key={cat}
                  style={styles.tarwihCard}
                  onPress={() => handleTarwihSelect(cat)}
                >
                  <View style={styles.tarwihIconBadge}>
                    <TypeIcon size={22} color={Colors.pillar.sleep} />
                  </View>
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

        {/* Tarwih guide — suggestions before starting the timer */}
        {phase === 'tarwih_guide' && selectedTarwih && (
          <TarwihGuide
            category={selectedTarwih}
            onStart={handleStartTarwih}
            onBack={() => setPhase('tarwih_select')}
            Colors={Colors}
          />
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
              initialElapsedSeconds={computeInitialElapsed(sl.tarwihStartedAt)}
              onComplete={dur => {
                completeTarwih(selectedTarwih, dur);
                setPhase('done');
              }}
              onCancel={handleCancelTarwih}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SleepBalanceCard({ balance, Colors }: { balance: ReturnType<typeof computeSleepBalance>; Colors: ThemeColors }) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeaderRow}>
        <CalendarRange size={16} color={Colors.text.secondary} />
        <Text style={styles.balanceTitle}>Cette semaine</Text>
      </View>
      <View style={styles.balanceRow}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.tarwihCompletedDays}/{balance.windowDays}</Text>
          <Text style={styles.balanceLabel}>Tarwih</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.bedtimeBefore23Days}/{balance.windowDays}</Text>
          <Text style={styles.balanceLabel}>Coucher {'<'} 23h</Text>
        </View>
      </View>
    </View>
  );
}

function TarwihGuide({ category, onStart, onBack, Colors }: {
  category: TarwihCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  const [suggestions, setSuggestions] = useState<TarwihSuggestion[]>(() => pickTarwihSuggestions(category));
  const TypeIcon = TARWIH_ICONS[category];

  return (
    <View>
      <View style={styles.tarwihBadge}>
        <TypeIcon size={16} color={Colors.pillar.sleep} />
        <Text style={styles.tarwihBadgeText}>{TARWIH_CATEGORIES[category].label}</Text>
      </View>

      <Text style={styles.guideIntro}>{TARWIH_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.phaseLabel}>Quelques pistes</Text>
        <Pressable style={styles.shuffleBtn} onPress={() => setSuggestions(pickTarwihSuggestions(category))}>
          <Shuffle size={14} color={Colors.pillar.sleep} />
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
  balanceCount: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy, color: Colors.pillar.sleep },
  balanceLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },

  sasCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.pillar.sleep + '0d', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.pillar.sleep + '22',
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
    backgroundColor: Colors.pillar.sleep + '0d', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.pillar.sleep + '22',
  },
  sleepBlockDone: { borderColor: Colors.success, backgroundColor: Colors.success + '0d' },
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.pillar.sleep + '0d', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.pillar.sleep + '22',
  },
  tarwihIconBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.pillar.sleep + '22',
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
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
  shuffleBtnText: { fontSize: Typography.sizes.xs, color: Colors.pillar.sleep, fontWeight: Typography.weights.semibold },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  suggestionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  suggestionDesc: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2, lineHeight: 17 },
  guideActions: { gap: Spacing.sm, marginTop: Spacing.md },
  guideStartBtn: {
    backgroundColor: Colors.pillar.sleep, borderRadius: Radius.md,
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
