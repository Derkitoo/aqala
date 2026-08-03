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
import { useTheme, Typography, Spacing, Radius, ThemeColors } from '../constants/theme';
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
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

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
              <Settings color={Colors.text.primary} size={20} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Streak banner */}
        {currentStreak > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.streakBanner}>
            <Flame color={Colors.gold} size={18} />
            <Text style={styles.streakText}>
              {currentStreak} jour{currentStreak > 1 ? 's' : ''} de constance
            </Text>
          </Animated.View>
        )}

        {/* Baraka Score Ring */}
        <View style={styles.ringSection}>
          <BarakaScoreRing breakdown={currentScore ?? emptyScore} size={200} />

          {dayComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>✨ Baraka Complète</Text>
            </View>
          )}
          {!dayComplete && strictMinMet && (
            <Text style={styles.minMetText}>✓ Strict minimum accompli</Text>
          )}
        </View>

        {/* Trend insight — built from history already collected */}
        {trends.sampleSize >= 3 && trends.weakestPillar && (
          <Pressable
            style={[styles.trendCard, { borderColor: trends.weakestPillar.color + '44' }]}
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

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.heavy,
    color: Colors.white,
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
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.bg.cardBorder,
  },
  maqamIcon: { fontSize: 20 },
  maqamName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  settingsBtn: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.bg.cardBorder,
  },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.cardBorder,
  },
  streakText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semibold,
    color: Colors.gold,
  },

  ringSection: { alignItems: 'center', marginVertical: Spacing.lg },
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
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
    color: Colors.white,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  goldenCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.md,
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
