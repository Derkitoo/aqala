import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Modal } from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { PILLARS } from '../constants/pillars';
import { ScreenHeader } from '../components/ScreenHeader';
import { useStreakStore } from '../store/useStreakStore';
import { useDayStore } from '../store/useDayStore';
import { getStreakLabel } from '../engine/streakManager';
import { computeTrends } from '../engine/trends';
import { Star, TrendingDown } from 'lucide-react-native';

const GUIDE_DETAILS: Record<string, string> = {
  'Présentation des 5 piliers':
    `Les 5 piliers d'Aqal Al-Qalil (Spirituel, Savoir, Physique, Social, Sommeil) s'inspirent de la tradition prophétique. L'objectif n'est pas la quantité extrême, mais la constance absolue (أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ).`,
  'Guide du Mode Débutant':
    `En mode Débutant, concentre 100% de tes efforts sur le Fajr à l'heure et le Moment d'Or (15 minutes d'Adhkâr sans écran après le Fajr). Une fois ce pilier ancré, les 4 autres piliers s'alignent naturellement.`,
  'Les 5 habitudes des Sahaba au lever':
    `1. Évoquer Allah dès le réveil (Adhkâr du réveil).\n2. Faire l'ablution avec présence du cœur.\n3. Utiliser le Siwak.\n4. Accomplir les 2 Rak'ât Sunnah avant le Fajr (Rawatib).\n5. Rester à sa place d'invocation jusqu'au lever du soleil (Moment d'Or).`,
  "Le programme de la semaine d'Ibn al-Qayyim":
    `Structure tes journées selon la règle du tiers : un tiers pour la dévotion spirituelle, un tiers pour l'apprentissage utile (Estikhlaf), et un tiers pour le repos et les droits de ta famille.`,
  'Mode Intermédiaire débloqué':
    `Félicitations pour ta régularité ! Tu peux désormais ajouter des sessions d'apprentissage de 15 min (Savoir de la Révélation ou de l'Estikhlaf) et une activité physique quotidienne de 20 min.`,
  'La gestion du temps des grands Ulémas':
    `Les savants préservaient les premières heures du matin comme du trésor absolu. Quelques minutes consacrées chaque matin à la même heure déplacent des montagnes au bout d'un an.`,
  'Mode Avancé (Qiyam al-Layl) débloqué':
    `Mode complet débloqué : tu peux désormais activer le suivi du Qiyam al-Layl (prière de nuit) et la routine de Nuit Globale.`,
  'Rapport des 40 jours disponible':
    `L'habitude est désormais ancrée (Arba'in). Ton esprit et ton corps sont alignés sur la routine de la Baraka.`,
};

export function WeeklyReportScreen() {
  const [selectedGuide, setSelectedGuide] = useState<{ title: string; content: string } | null>(null);

  const {
    currentStreak,
    longestStreak,
    sevenDayAverage,
    currentMaqam,
    nextMaqam,
    progressToNext,
    calendarDots,
  } = useStreakStore();

  const { today, history } = useDayStore();
  const trends = useMemo(() => computeTrends(today, history), [today, history]);

  // Last 7 days calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
    return { key, day, status: calendarDots[key] ?? 'missed' };
  });

  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Rapport Hebdomadaire" size="md" />

        {/* Maqam — left accent rule, no fill, no shadow */}
        <View style={styles.maqamCard}>
          <Text style={styles.maqamName}>{currentMaqam.nameFr}</Text>
          <Text style={styles.maqamAr}>{currentMaqam.nameAr}</Text>
          <Text style={styles.maqamDesc}>{currentMaqam.description}</Text>
        </View>

        {/* Stats — one flush row framed by 2px rules, split by 1px verticals */}
        <View style={styles.statsRow}>
          <StatBox label="Streak actuel" value={`${currentStreak}j`} index={0} Colors={Colors} Typography={Typography} Spacing={Spacing} />
          <StatBox label="Plus long streak" value={`${longestStreak}j`} index={1} Colors={Colors} Typography={Typography} Spacing={Spacing} />
          <StatBox label="Moyenne 7j" value={`${sevenDayAverage}/100`} index={2} Colors={Colors} Typography={Typography} Spacing={Spacing} />
        </View>

        <Text style={styles.streakLabel}>{getStreakLabel(currentStreak)}</Text>

        {/* 7-day calendar — 28×28 squares */}
        <Text style={styles.sectionKicker}>LES 7 DERNIERS JOURS</Text>
        <View style={styles.hr} />
        <View style={styles.calendarRow}>
          {last7.map(({ key, day, status }) => (
            <View key={key} style={styles.calDay}>
              <Text style={styles.calDayLabel}>{day}</Text>
              <View style={[
                styles.calSquare,
                status === 'complete' && styles.calSquareComplete,
                status === 'partial'  && styles.calSquarePartial,
              ]} />
            </View>
          ))}
        </View>
        <View style={styles.calLegend}>
          <LegendItem variant="complete" label="Baraka complète" Colors={Colors} Typography={Typography} Spacing={Spacing} />
          <LegendItem variant="partial"   label="Partiel"        Colors={Colors} Typography={Typography} Spacing={Spacing} />
          <LegendItem variant="missed"    label="Non validé"     Colors={Colors} Typography={Typography} Spacing={Spacing} />
        </View>

        {/* Trends */}
        <Text style={styles.sectionKicker}>
          TENDANCES PAR PILIER
          {trends.sampleSize >= 3 ? ` · ${trends.sampleSize}J` : ''}
        </Text>
        <View style={styles.hr} />
        {trends.sampleSize < 3 ? (
          <Text style={styles.emptyText}>
            Reviens dans quelques jours — les tendances se construisent à partir de ton historique.
          </Text>
        ) : (
          <>
            {trends.pillars.map(p => (
              <BarRow key={p.id} name={p.nameFr.replace('Pilier ', '').replace('du ', '')} pct={p.avgPct} Colors={Colors} Typography={Typography} Spacing={Spacing} />
            ))}

            {trends.weakestPillar && (
              <View style={styles.insightRow}>
                <TrendingDown color={Colors.warning} size={18} strokeWidth={1.8} />
                <Text style={styles.insightText}>
                  Pilier le plus fragile : <Text style={styles.insightStrong}>{trends.weakestPillar.nameFr}</Text> ({trends.weakestPillar.avgPct}%)
                </Text>
              </View>
            )}

            {trends.bestWeekday && (
              <View style={styles.insightRow}>
                <Star color={Colors.gold} size={16} strokeWidth={1.6} />
                <Text style={styles.insightText}>
                  Meilleur jour : <Text style={styles.insightStrong}>{trends.bestWeekday.label}</Text> ({trends.bestWeekday.avgPct}%)
                  {trends.worstWeekday && (
                    <> — le plus dur : <Text style={styles.insightStrong}>{trends.worstWeekday.label}</Text> ({trends.worstWeekday.avgPct}%)</>
                  )}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Next Maqam progress */}
        {nextMaqam && (
          <>
            <Text style={styles.sectionKicker}>PROCHAIN RANG — {nextMaqam.nameFr}</Text>
            <View style={styles.hr} />
            <View style={styles.nextMaqamTrack}>
              <View style={[styles.nextMaqamFill, { width: `${progressToNext}%` as any }]} />
            </View>
            <Text style={styles.nextMaqamPct}>{progressToNext}% accompli</Text>
            <Text style={styles.nextMaqamReqs}>
              Requis : score moyen ≥ {nextMaqam.minAvgScore} · Streak ≥ {nextMaqam.minStreak}j
            </Text>
          </>
        )}

        {/* Unlocked content */}
        {currentMaqam.unlockedContent.length > 0 && (
          <>
            <Text style={styles.sectionKicker}>CONTENU DÉBLOQUÉ</Text>
            <View style={styles.hr} />
            {currentMaqam.unlockedContent.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.contentItem, pressed && styles.pressed]}
                onPress={() => setSelectedGuide({ title: item, content: GUIDE_DETAILS[item] ?? 'Guide d\'accompagnement disponible dans votre Maqam.' })}
              >
                <Star color={Colors.gold} size={16} strokeWidth={1.6} />
                <Text style={styles.contentText}>{item}</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* Pillar weighting */}
        <Text style={styles.sectionKicker}>PONDÉRATION DES PILIERS</Text>
        <View style={styles.hr} />
        {Object.values(PILLARS).map(p => (
          <BarRow
            key={p.id}
            name={p.nameFr.replace('Pilier ', '').replace('du ', '')}
            pct={Math.round(p.weight * 100)}
            Colors={Colors} Typography={Typography} Spacing={Spacing}
          />
        ))}

        {/* Modal Guide Detail — flat top-accent sheet */}
        {selectedGuide && (
          <Modal
            transparent
            animationType="fade"
            visible={!!selectedGuide}
            onRequestClose={() => setSelectedGuide(null)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setSelectedGuide(null)}>
              <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                <Text style={styles.modalTitle}>{selectedGuide.title}</Text>
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalBody}>{selectedGuide.content}</Text>
                </ScrollView>
                <Pressable
                  style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
                  onPress={() => setSelectedGuide(null)}
                >
                  <Text style={styles.modalCloseText}>Fermer</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, index, Colors, Typography, Spacing }: {
  label: string; value: string; index: number; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={[styles.statBox, index > 0 && styles.statBoxDivided]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarRow({ name, pct, Colors, Typography, Spacing }: {
  name: string; pct: number; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.barRow}>
      <Text style={styles.barName}>{name}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={styles.barPct}>{pct}%</Text>
    </View>
  );
}

function LegendItem({ variant, label, Colors, Typography, Spacing }: {
  variant: 'complete' | 'partial' | 'missed'; label: string; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.legendItem}>
      <View style={[
        styles.legendSwatch,
        variant === 'complete' && styles.legendSwatchComplete,
        variant === 'partial'  && styles.legendSwatchPartial,
      ]} />
      <Text style={styles.legendText}>{label}</Text>
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
  hr: { height: 2, backgroundColor: Colors.border, marginBottom: 14 },

  maqamCard: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    paddingLeft: 14,
    paddingVertical: Spacing.xs,
    marginBottom: 18,
  },
  maqamName: {
    fontSize: Typography.sizes.lg + 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  maqamAr: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  maqamDesc: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 6,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
  },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
    marginBottom: 10,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBoxDivided: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  statValue: {
    fontSize: Typography.sizes.lg + 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  statLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  streakLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  calDay: { alignItems: 'center', flex: 1 },
  calDayLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  // Squares, not circles: solid accent = complete, accent-tint outline =
  // partial, outline only = missed.
  calSquare: {
    width: 28, height: 28,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calSquareComplete: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  calSquarePartial:  { backgroundColor: Colors.accentTint, borderColor: Colors.gold },

  calLegend: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginBottom: Spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: {
    width: 8, height: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendSwatchComplete: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  legendSwatchPartial:  { backgroundColor: Colors.accentTint, borderColor: Colors.gold },
  legendText: {
    fontSize: Typography.sizes.xs - 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },

  emptyText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.sm * 1.5,
  },

  // 5px flat rules, accent fill, square ends.
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barName: {
    width: 92,
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },
  barTrack: { flex: 1, height: 5, backgroundColor: Colors.border },
  barFill: { height: '100%', backgroundColor: Colors.gold },
  barPct: {
    width: 34,
    textAlign: 'right',
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  insightText: {
    flex: 1,
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
  },
  insightStrong: { fontFamily: Typography.fonts.heavy, color: Colors.text.primary },

  nextMaqamTrack: { height: 6, backgroundColor: Colors.border, marginBottom: Spacing.sm },
  nextMaqamFill: { height: '100%', backgroundColor: Colors.gold },
  nextMaqamPct: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  nextMaqamReqs: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },

  contentItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  contentText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.bg.primary,
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
    padding: Spacing.lg,
    width: '100%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: Typography.sizes.md + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    marginBottom: Spacing.md,
  },
  modalScroll: { marginBottom: Spacing.md },
  modalBody: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.sm * 1.6,
  },
  modalCloseBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  modalCloseText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
  },
});
