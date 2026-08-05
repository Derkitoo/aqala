import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import {
  PILLARS, TARWIH_CATEGORIES, TARWIH_GUIDE_INTRO, pickTarwihSuggestions,
  type TarwihCategory, type TarwihSuggestion,
} from '../constants/pillars';
import { computeSleepBalance } from '../engine/trends';
import { useDayStore } from '../store/useDayStore';
import { useAppStore } from '../store/useAppStore';
import { FocusTimer } from '../components/FocusTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  Book, Footprints, MessageCircle, Palette, Music, Play, ChevronRight,
  Shuffle, Check, Moon, Star,
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
  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

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
        <ScreenHeader
          kicker={`PILIER · ${PILLARS.sleep.numeral}`}
          title="Pilier Sommeil & Détente"
          subtitle="الترويح — Al-Tarwih"
        />

        {/* Overview */}
        {(phase === 'overview' || phase === 'done') && (
          <>
            <SleepBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} />

            <Text style={styles.sectionKicker}>CE SOIR</Text>
            <View style={styles.hr} />

            {/* Night Sas — flush row with a square switch */}
            <Pressable
              style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}
              onPress={() => setNightSas(!sl.nightSasActivated)}
            >
              <Moon size={18} strokeWidth={1.7} color={sl.nightSasActivated ? Colors.gold : Colors.text.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, sl.nightSasActivated && styles.taskTitleDone]}>Sas de Nuit</Text>
                <Text style={styles.taskSubtitle}>
                  {sl.nightSasActivated ? 'Activé — écran posé ✓' : 'Poser le téléphone après Maghrib/Isha'}
                </Text>
              </View>
              <View style={[styles.switchTrack, sl.nightSasActivated && styles.switchTrackOn]}>
                <View style={styles.switchThumb} />
              </View>
            </Pressable>

            <TaskRow
              IconComponent={Play}
              title="Tarwih — Détente de l'Âme"
              subtitle={sl.tarwihCompleted
                ? `${TARWIH_CATEGORIES[sl.tarwihCategory!].label} • ${Math.round(sl.tarwihDurationSeconds / 60)} min ✓`
                : '20 min d\'activité saine hors scroll passif'
              }
              done={sl.tarwihCompleted}
              onPress={() => setPhase('tarwih_select')}
              points="5 pts"
              Colors={Colors} Typography={Typography} Spacing={Spacing}
            />

            <TaskRow
              IconComponent={Moon}
              title="Coucher enregistré"
              subtitle={sl.bedtimeHour !== null
                ? `Couché à ${sl.bedtimeHour}h${sl.bedtimeHour < 23 ? ' — Avant minuit ✓' : ''}`
                : 'Enregistre ton heure de coucher'
              }
              done={sl.bedtimeHour !== null}
              onPress={setBedtime}
              points="5 pts"
              Colors={Colors} Typography={Typography} Spacing={Spacing}
            />

            {/* Qiyam (Night-mode only) */}
            {nightMode === 'global' && (
              <Pressable
                style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}
                onPress={() => setQiyam(!sl.qiyamDone)}
              >
                <Star size={18} strokeWidth={1.7} color={sl.qiyamDone ? Colors.gold : Colors.text.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, sl.qiyamDone && styles.taskTitleDone]}>Qiyam al-Layl</Text>
                  <Text style={styles.taskSubtitle}>Prière nocturne — 2 à 8 rak'ât dans le dernier tiers</Text>
                </View>
                <View style={[styles.checkbox, sl.qiyamDone && styles.checkboxDone]}>
                  {sl.qiyamDone && <Check size={12} color={Colors.bg.primary} strokeWidth={2.4} />}
                </View>
              </Pressable>
            )}

            {/* Architecture guide */}
            <Text style={styles.sectionKicker}>ARCHITECTURE DU SOMMEIL PROPHÉTIQUE</Text>
            <View style={styles.hr} />
            {nightMode === 'standard' ? (
              <>
                <GuideRow time="22h30" label="Coucher" Colors={Colors} Typography={Typography} Spacing={Spacing} />
                <GuideRow time="04h00" label="Réveil pré-Fajr" Colors={Colors} Typography={Typography} Spacing={Spacing} />
                <GuideRow time="04h45" label="Fajr" Colors={Colors} Typography={Typography} Spacing={Spacing} />
              </>
            ) : (
              <>
                <GuideRow time="22h00" label="Phase 1 — Sommeil" Colors={Colors} Typography={Typography} Spacing={Spacing} />
                <GuideRow time="02h00" label="Réveil Qiyam (2–4 rak'ât)" Colors={Colors} Typography={Typography} Spacing={Spacing} />
                <GuideRow time="02h30" label="Retour au sommeil" Colors={Colors} Typography={Typography} Spacing={Spacing} />
                <GuideRow time="04h30" label="Réveil pré-Fajr" Colors={Colors} Typography={Typography} Spacing={Spacing} />
              </>
            )}
          </>
        )}

        {/* Tarwih select — segmented buttons */}
        {phase === 'tarwih_select' && (
          <>
            <Text style={styles.sectionKickerTop}>DÉTENTE DU SOIR · TARWIH</Text>
            <View style={styles.hr} />
            <View style={styles.segRow}>
              {(Object.keys(TARWIH_CATEGORIES) as TarwihCategory[]).map(cat => {
                const active = selectedTarwih === cat;
                const TypeIcon = TARWIH_ICONS[cat];
                return (
                  <Pressable
                    key={cat}
                    style={({ pressed }) => [styles.seg, active && styles.segActive, pressed && styles.pressed]}
                    onPress={() => handleTarwihSelect(cat)}
                  >
                    <TypeIcon size={13} strokeWidth={1.8} color={active ? Colors.bg.primary : Colors.text.primary} />
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {TARWIH_CATEGORIES[cat].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.introText}>Hors réseaux sociaux et séries passives</Text>
            <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} onPress={() => setPhase('overview')}>
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
            Colors={Colors} Typography={Typography} Spacing={Spacing}
          />
        )}

        {/* Tarwih timer */}
        {phase === 'tarwih_timer' && selectedTarwih && (
          <>
            <Text style={styles.categoryTag}>{TARWIH_CATEGORIES[selectedTarwih].label}</Text>
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

function SleepBalanceCard({ balance, Colors, Typography, Spacing }: {
  balance: ReturnType<typeof computeSleepBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceKicker}>CETTE SEMAINE</Text>
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

function TarwihGuide({ category, onStart, onBack, Colors, Typography, Spacing }: {
  category: TarwihCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const [suggestions, setSuggestions] = useState<TarwihSuggestion[]>(() => pickTarwihSuggestions(category));

  return (
    <View>
      <Text style={styles.categoryTag}>{TARWIH_CATEGORIES[category].label}</Text>

      <Text style={styles.introText}>{TARWIH_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.sectionKickerFlush}>PISTES SUGGÉRÉES</Text>
        <Pressable
          style={({ pressed }) => [styles.shuffleBtn, pressed && styles.pressed]}
          onPress={() => setSuggestions(pickTarwihSuggestions(category))}
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

function TaskRow({ IconComponent, title, subtitle, done, onPress, points, Colors, Typography, Spacing }: {
  IconComponent: any; title: string; subtitle: string;
  done: boolean; onPress: () => void; points: string; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <Pressable
      style={({ pressed }) => [styles.taskRow, pressed && !done && styles.pressed]}
      onPress={done ? undefined : onPress}
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

function GuideRow({ time, label, Colors, Typography, Spacing }: {
  time: string; label: string; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.guideRow}>
      <Text style={styles.guideTime}>{time}</Text>
      <View style={styles.guideTick} />
      <Text style={styles.guideLabel}>{label}</Text>
    </View>
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

  balanceCard: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.md,
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
  balanceItem: { alignItems: 'center', flex: 1 },
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

  // Square track, square thumb — no rounded switch.
  switchTrack: {
    width: 42, height: 24,
    backgroundColor: Colors.border,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  switchTrackOn: { backgroundColor: Colors.gold, alignItems: 'flex-end' },
  switchThumb: { width: 18, height: 18, backgroundColor: Colors.white },

  checkbox: {
    width: 20, height: 20,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.gold, borderColor: Colors.gold },

  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guideTime: {
    width: 52,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  guideTick: { width: 8, height: 2, backgroundColor: Colors.gold },
  guideLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },

  introText: {
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.sm + 0.5) * 1.55,
  },

  segRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  segActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  segText: {
    fontSize: Typography.sizes.xs,
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
