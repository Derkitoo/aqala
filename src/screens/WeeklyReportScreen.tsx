import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, Modal } from 'react-native';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { PILLARS } from '../constants/pillars';
import { useStreakStore } from '../store/useStreakStore';
import { useDayStore } from '../store/useDayStore';
import { getStreakLabel } from '../engine/streakManager';
import { computeTrends } from '../engine/trends';
import { BarChart2, Star, Target, TrendingDown } from 'lucide-react-native';

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

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BarChart2 color={Colors.text.primary} size={28} />
          <Text style={styles.title}>Rapport Hebdomadaire</Text>
        </View>

        {/* Maqam card */}
        <View style={[styles.maqamCard, { borderColor: currentMaqam.color }]}>
          <Text style={styles.maqamIcon}>{currentMaqam.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.maqamName, { color: currentMaqam.color }]}>
              {currentMaqam.nameFr}
            </Text>
            <Text style={styles.maqamAr}>{currentMaqam.nameAr}</Text>
            <Text style={styles.maqamDesc}>{currentMaqam.description}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="Streak actuel" value={`${currentStreak}j`} color={Colors.gold} Colors={Colors} />
          <StatBox label="Plus long streak" value={`${longestStreak}j`} color={Colors.pillar.spiritual} Colors={Colors} />
          <StatBox label="Moyenne 7j" value={`${sevenDayAverage}/100`} color={Colors.pillar.knowledge} Colors={Colors} />
        </View>

        <Text style={styles.streakLabel}>{getStreakLabel(currentStreak)}</Text>

        {/* 7-day calendar */}
        <Text style={styles.sectionTitle}>Les 7 derniers jours</Text>
        <View style={styles.calendarRow}>
          {last7.map(({ key, day, status }) => (
            <View key={key} style={styles.calDay}>
              <Text style={styles.calDayLabel}>{day}</Text>
              <View style={[
                styles.calDot,
                status === 'complete' && styles.calDotComplete,
                status === 'partial'  && styles.calDotPartial,
                status === 'missed'   && styles.calDotMissed,
              ]} />
            </View>
          ))}
        </View>
        <View style={styles.calLegend}>
          <LegendItem color={Colors.gold} label="Baraka Complète" Colors={Colors} />
          <LegendItem color={Colors.pillar.knowledge} label="Partiel" Colors={Colors} />
          <LegendItem color={Colors.border} label="Non validé" Colors={Colors} />
        </View>

        {/* Trends — built from history already collected day-to-day */}
        <Text style={styles.sectionTitle}>Tendances par pilier</Text>
        {trends.sampleSize < 3 ? (
          <View style={styles.trendsEmptyBox}>
            <Text style={styles.trendsEmptyText}>
              Reviens dans quelques jours — les tendances se construisent à partir de ton historique.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.trendsSubtitle}>Moyenne sur {trends.sampleSize} jour{trends.sampleSize > 1 ? 's' : ''}</Text>
            {trends.pillars.map(p => (
              <View key={p.id} style={styles.pillarRow}>
                <Text style={styles.pillarName}>{p.nameFr}</Text>
                <View style={styles.weightBar}>
                  <View style={[styles.weightFill, { width: `${p.avgPct}%` as any, backgroundColor: p.color }]} />
                </View>
                <Text style={[styles.weightPct, { color: p.color }]}>{p.avgPct}%</Text>
              </View>
            ))}

            {trends.weakestPillar && (
              <View style={styles.insightBox}>
                <TrendingDown color={Colors.warning} size={18} />
                <Text style={styles.insightText}>
                  Ton pilier le plus fragile en ce moment : <Text style={{ fontWeight: 'bold', color: Colors.warning }}>{trends.weakestPillar.nameFr}</Text> ({trends.weakestPillar.avgPct}%)
                </Text>
              </View>
            )}

            {trends.bestWeekday && (
              <View style={styles.insightBox}>
                <Star color={Colors.gold} size={18} />
                <Text style={styles.insightText}>
                  Ton meilleur jour de la semaine : <Text style={{ fontWeight: 'bold', color: Colors.gold }}>{trends.bestWeekday.label}</Text> ({trends.bestWeekday.avgPct}% en moyenne)
                  {trends.worstWeekday && (
                    <> — le plus dur : <Text style={{ fontWeight: 'bold' }}>{trends.worstWeekday.label}</Text> ({trends.worstWeekday.avgPct}%)</>
                  )}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Next Maqam progress */}
        {nextMaqam && (
          <View style={styles.nextMaqamCard}>
            <Text style={styles.nextMaqamTitle}>Prochain rang — {nextMaqam.nameFr} {nextMaqam.icon}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${progressToNext}%` as any,
                backgroundColor: nextMaqam.color,
              }]} />
            </View>
            <Text style={styles.nextMaqamPct}>{progressToNext}% accompli</Text>
            <Text style={styles.nextMaqamReqs}>
              Requis : score moyen ≥ {nextMaqam.minAvgScore} • Streak ≥ {nextMaqam.minStreak}j
            </Text>
          </View>
        )}

        {/* Unlocked content */}
        {currentMaqam.unlockedContent.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Contenu débloqué (Appuyez pour lire)</Text>
            {currentMaqam.unlockedContent.map((item, i) => (
              <Pressable
                key={i}
                style={styles.contentItem}
                onPress={() => setSelectedGuide({ title: item, content: GUIDE_DETAILS[item] ?? 'Guide d\'accompagnement disponible dans votre Maqam.' })}
              >
                <Star color={Colors.gold} size={16} />
                <Text style={styles.contentText}>{item}</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* Modal Guide Detail */}
        {selectedGuide && (
          <Modal
            transparent
            animationType="fade"
            visible={!!selectedGuide}
            onRequestClose={() => setSelectedGuide(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedGuide.title}</Text>
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalBody}>{selectedGuide.content}</Text>
                </ScrollView>
                <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedGuide(null)}>
                  <Text style={styles.modalCloseText}>Fermer</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {/* Pillars summary */}
        <Text style={styles.sectionTitle}>Pondération des Piliers</Text>
        {(Object.values(PILLARS)).map(p => {
          const Icon = p.icon;
          return (
            <View key={p.id} style={styles.pillarRow}>
              <View style={styles.pillarIconWrapper}>
                <Icon color={p.color} size={16} />
              </View>
              <Text style={styles.pillarName}>{p.nameFr}</Text>
              <View style={styles.weightBar}>
                <View style={[styles.weightFill, {
                  width: `${p.weight * 100}%` as any,
                  backgroundColor: p.color,
                }]} />
              </View>
              <Text style={[styles.weightPct, { color: p.color }]}>{Math.round(p.weight * 100)}%</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, Colors }: { label: string; value: string; color: string; Colors: ThemeColors }) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LegendItem({ color, label, Colors }: { color: string; label: string; Colors: ThemeColors }) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.heavy, color: Colors.white },

  maqamCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bg.card, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1.5,
  },
  maqamIcon: { fontSize: 40 },
  maqamName: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy },
  maqamAr: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  maqamDesc: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginTop: 4, lineHeight: 18 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  statBox: {
    flex: 1, backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  statValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy },
  statLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2, textAlign: 'center' },

  streakLabel: {
    fontSize: Typography.sizes.sm, color: Colors.gold,
    textAlign: 'center', marginBottom: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold,
    color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1,
    marginVertical: Spacing.md,
  },

  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  calDay: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  calDayLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, textTransform: 'capitalize' },
  calDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border },
  calDotComplete: { backgroundColor: Colors.gold },
  calDotPartial:  { backgroundColor: Colors.pillar.knowledge },
  calDotMissed:   { backgroundColor: Colors.border },
  calLegend: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap', marginBottom: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: Typography.sizes.xs, color: Colors.text.secondary },

  trendsEmptyBox: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  trendsEmptyText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20, fontStyle: 'italic' },
  trendsSubtitle: { fontSize: Typography.sizes.xs, color: Colors.text.muted, marginBottom: Spacing.sm },
  insightBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  insightText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20 },

  nextMaqamCard: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  nextMaqamTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.white },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  nextMaqamPct: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  nextMaqamReqs: { fontSize: Typography.sizes.xs, color: Colors.text.muted, fontStyle: 'italic' },

  contentItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.xs,
  },
  contentText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.text.primary, fontWeight: Typography.weights.semibold },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.lg,
    padding: Spacing.lg, width: '100%', maxHeight: '80%',
    borderWidth: 1, borderColor: Colors.gold,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold,
    color: Colors.gold, marginBottom: Spacing.md, textAlign: 'center',
  },
  modalScroll: { marginBottom: Spacing.md },
  modalBody: {
    fontSize: Typography.sizes.sm, color: Colors.text.primary,
    lineHeight: 22,
  },
  modalCloseBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
  },
  modalCloseText: {
    fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold,
    color: Colors.bg.primary,
  },

  pillarRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  pillarIconWrapper: { width: 24, alignItems: 'center' },
  pillarName: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, width: 120 },
  weightBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  weightFill: { height: '100%', borderRadius: 3 },
  weightPct: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, width: 36, textAlign: 'right' },
});
