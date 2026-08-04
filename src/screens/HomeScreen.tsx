import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flame, Settings, Clock, TrendingDown, ChevronRight } from 'lucide-react-native';
import { useScaledTheme, type TypographyShape, type SpacingShape, type RadiusShape, ThemeColors } from '../constants/theme';
import { PILLARS } from '../constants/pillars';
import { BarakaScoreRing } from '../components/BarakaScoreRing';
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
  const { isGoldenMomentActive, goldenMomentType } = useAppStore();
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

  const todayLabel = format(new Date(), 'EEEE d MMMM', { locale: fr });
  const strictMinMet = currentScore ? isStrictMinimumMet(currentScore) : false;
  const dayComplete  = currentScore ? isDayComplete(currentScore) : false;

  const emptyScore = {
    spiritual: 0, knowledge: 0, physical: 0, social: 0, sleep: 0,
    rawTotal: 0, streak: 0, multiplier: 1, finalScore: 0, percentage: 0,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={Colors.bg.gradient}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={recomputeScore} tintColor={Colors.gold} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bismillah</Text>
            <Text style={styles.dateLabel}>{todayLabel}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate('WeeklyReport')} style={styles.maqamBadge}>
              <Text style={styles.maqamIcon}>{currentMaqam.icon}</Text>
              <Text style={styles.maqamName}>{currentMaqam.nameFr}</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
              <Settings color={Colors.text.secondary} size={20} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Baraka Score Ring */}
        <View style={styles.ringSection}>
          <BarakaScoreRing breakdown={currentScore ?? emptyScore} size={200} />

          {currentStreak > 0 && (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.streakRow}>
              <Flame color={Colors.gold} size={16} />
              <Text style={styles.streakText}>
                {currentStreak} jour{currentStreak > 1 ? 's' : ''} de constance
              </Text>
            </Animated.View>
          )}

          {dayComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>✨ Baraka Complète</Text>
            </View>
          )}
          {!dayComplete && strictMinMet && (
            <Text style={styles.minMetText}>✓ Strict minimum accompli</Text>
          )}
        </View>

        {/* Pillar cards */}
        <Text style={styles.sectionTitle}>Mes 5 Piliers</Text>

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
        />

        {/* Trend insight — built from history already collected */}
        {trends.sampleSize >= 3 && trends.weakestPillar && (
          <Pressable
            style={[styles.trendCard, { borderLeftWidth: 3, borderLeftColor: trends.weakestPillar.color }]}
            onPress={() => navigation.navigate('WeeklyReport')}
          >
            <TrendingDown color={trends.weakestPillar.color} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trendLabel}>Pilier à surveiller cette semaine</Text>
              <Text style={styles.trendText}>
                <Text style={{ fontWeight: 'bold', color: trends.weakestPillar.color }}>
                  {trends.weakestPillar.nameFr}
                </Text>
                {' '}— {trends.weakestPillar.avgPct}% en moyenne
              </Text>
            </View>
            <ChevronRight color={Colors.text.muted} size={18} />
          </Pressable>
        )}

        {/* Quick CTA if Golden Moment not done */}
        {!today.spiritual.goldenMomentCompleted && (
          <Pressable
            style={styles.goldenCTA}
            onPress={() => navigation.navigate('GoldenMoment')}
          >
            <View style={styles.goldenCTAIcon}>
              <Clock color={Colors.gold} size={28} />
            </View>
            <View>
              <Text style={styles.goldenCTATitle}>Moment d'Or</Text>
              <Text style={styles.goldenCTABody}>15 minutes d'Adhkâr — verrouillé</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  dateLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  maqamBadge: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  maqamIcon: { fontSize: 20 },
  maqamName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  settingsBtn: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  streakText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semibold,
    color: Colors.gold,
  },

  ringSection: { alignItems: 'center', marginVertical: Spacing.xl },
  completeBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.gold + '22',
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  completeBadgeText: {
    color: Colors.gold,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bold,
  },
  minMetText: {
    marginTop: Spacing.sm,
    color: Colors.success,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
  },

  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.isDark ? '#000000' : '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Colors.isDark ? 0.25 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  trendLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },

  goldenCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    shadowColor: Colors.isDark ? '#000000' : '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Colors.isDark ? 0.25 : 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goldenCTAIcon: { 
    padding: Spacing.xs,
  },
  goldenCTATitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.text.primary,
  },
  goldenCTABody: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },
});
