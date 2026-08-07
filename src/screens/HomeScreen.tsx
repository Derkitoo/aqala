import React, { useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flame, Settings, Sun, Moon, TrendingDown, Clock, ChevronRight } from 'lucide-react-native';
import { useScaledTheme, type TypographyShape, type SpacingShape, type RadiusShape, ThemeColors } from '../constants/theme';
import { PILLARS } from '../constants/pillars';
import { BarakaScoreBlock } from '../components/BarakaScoreBlock';
import { PillarCard } from '../components/PillarCard';
import { useDayStore } from '../store/useDayStore';
import { useStreakStore } from '../store/useStreakStore';
import { useAppStore } from '../store/useAppStore';
import { isDayComplete, isStrictMinimumMet } from '../engine/barakaScoring';
import { computeTrends } from '../engine/trends';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { today, history, currentScore, refreshDay, recomputeScore } = useDayStore();
  const { currentStreak, currentMaqam } = useStreakStore();
  const { isGoldenMomentActive, goldenMomentType, theme, setTheme } = useAppStore();
  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

  const trends = useMemo(() => computeTrends(today, history), [today, history]);

  useEffect(() => {
    refreshDay();
    recomputeScore();
  }, []);

  // Redirect to Golden Moment screen if it's active
  useEffect(() => {
    if (isGoldenMomentActive) {
      navigation.navigate('GoldenMoment', { type: goldenMomentType });
    }
  }, [isGoldenMomentActive]);

  // Only the weekday is capitalised ("Mercredi 5 août"). CSS `capitalize`
  // would also raise the month, which the design shows lowercase.
  const rawLabel = format(new Date(), 'EEEE d MMMM', { locale: fr });
  const todayLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
  const strictMinMet = currentScore ? isStrictMinimumMet(currentScore) : false;
  const dayComplete  = currentScore ? isDayComplete(currentScore) : false;

  const emptyScore = {
    spiritual: 0, knowledge: 0, physical: 0, social: 0, sleep: 0,
    rawTotal: 0, streak: 0, multiplier: 1, finalScore: 0, percentage: 0,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={recomputeScore} tintColor={Colors.gold} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateLabel}>{todayLabel}</Text>
            <Text style={styles.greeting}>Bismillah</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setTheme(theme === 'light' ? 'premium' : 'light')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={6}
            >
              {Colors.isDark
                ? <Sun color={Colors.text.primary} size={18} strokeWidth={1.8} />
                : <Moon color={Colors.text.primary} size={18} strokeWidth={1.8} />}
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={6}
            >
              <Settings color={Colors.text.primary} size={18} strokeWidth={1.8} />
            </Pressable>
          </View>
        </View>

        {/* Baraka score card — rank folded into the header row */}
        <BarakaScoreBlock
          breakdown={currentScore ?? emptyScore}
          maqamName={currentMaqam.nameFr}
          onPressMaqam={() => navigation.navigate('WeeklyReport')}
        />

        {(currentStreak > 0 || dayComplete || strictMinMet) && (
          <View style={styles.statusRow}>
            {currentStreak > 0 && (
              <View style={styles.streakChip}>
                <Flame color={Colors.gold} size={14} strokeWidth={2} />
                <Text style={styles.streakText}>
                  {currentStreak} jour{currentStreak > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {dayComplete && <Text style={styles.stateText}>✓ Baraka complète</Text>}
            {!dayComplete && strictMinMet && <Text style={styles.stateText}>✓ Strict minimum accompli</Text>}
          </View>
        )}

        {/* Golden Moment CTA */}
        {!today.spiritual.goldenMomentCompleted ? (
          <Pressable
            style={({ pressed }) => [styles.ctaCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate('GoldenMoment')}
          >
            <View style={styles.ctaIconBadge}>
              <Clock color={Colors.gold} size={20} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Moment d'Or</Text>
              <Text style={styles.ctaSubtitle}>15 minutes d'Adhkâr — verrouillé</Text>
            </View>
            <ChevronRight color={Colors.text.muted} size={16} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.ctaCard}>
            <Text style={styles.goldenDone}>✓ Moment d'Or accompli</Text>
          </View>
        )}

        {/* Trend insight */}
        {trends.sampleSize >= 3 && trends.weakestPillar && (
          <Pressable
            style={({ pressed }) => [styles.ctaCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate('WeeklyReport')}
          >
            <View style={styles.ctaIconBadge}>
              <TrendingDown color={Colors.warning} size={20} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Pilier à surveiller</Text>
              <Text style={styles.ctaSubtitle}>
                <Text style={styles.trendName}>{trends.weakestPillar.nameFr}</Text>
                {' '}— {trends.weakestPillar.avgPct}% en moyenne
              </Text>
            </View>
            <ChevronRight color={Colors.text.muted} size={16} strokeWidth={2} />
          </Pressable>
        )}

        {/* Pillar grid */}
        <Text style={styles.sectionKicker}>MES 5 PILIERS</Text>
        <View style={styles.grid}>
          <PillarCard
            pillar={PILLARS.spiritual}
            pointsEarned={currentScore?.spiritual ?? 0}
            completed={(currentScore?.spiritual ?? 0) >= PILLARS.spiritual.maxPoints * 0.8}
            onPress={() => navigation.navigate('PillarSpiritual')}
          />
          <PillarCard
            pillar={PILLARS.knowledge}
            pointsEarned={currentScore?.knowledge ?? 0}
            completed={(currentScore?.knowledge ?? 0) >= PILLARS.knowledge.maxPoints * 0.8}
            onPress={() => navigation.navigate('PillarKnowledge')}
          />
          <PillarCard
            pillar={PILLARS.physical}
            pointsEarned={currentScore?.physical ?? 0}
            completed={(currentScore?.physical ?? 0) >= PILLARS.physical.maxPoints * 0.8}
            onPress={() => navigation.navigate('PillarPhysical')}
          />
          <PillarCard
            pillar={PILLARS.social}
            pointsEarned={currentScore?.social ?? 0}
            completed={(currentScore?.social ?? 0) >= PILLARS.social.maxPoints * 0.8}
            onPress={() => navigation.navigate('PillarSocial')}
          />
          <PillarCard
            pillar={PILLARS.sleep}
            pointsEarned={currentScore?.sleep ?? 0}
            completed={(currentScore?.sleep ?? 0) >= PILLARS.sleep.maxPoints * 0.8}
            onPress={() => navigation.navigate('PillarSleep')}
            wide
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xs, paddingBottom: 120 },

  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },
  greeting: {
    fontSize: Typography.sizes.lg + 2,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.primary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.card,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.secondary,
  },
  stateText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
  },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    // Literal, not Radius.lg — theme.ts zeroes Radius.sm/md/lg by design for
    // the rest of the app's square "Modernist" look; this card intentionally
    // breaks from that.
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ctaIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gold + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.primary,
  },
  ctaSubtitle: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  trendName: { fontFamily: Typography.fonts.semibold, color: Colors.text.primary },
  goldenDone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semibold,
    color: Colors.gold,
  },

  sectionKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.semibold,
    color: Colors.text.muted,
    letterSpacing: Typography.sizes.xs * 0.1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
