import React, { useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Flame, Settings, Sun, Moon, TrendingDown, ChevronRight } from 'lucide-react-native';
import { useScaledTheme, type TypographyShape, type SpacingShape, ThemeColors } from '../constants/theme';
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
  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

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
        {/* Header — brand kicker + date flush left, square icon buttons right */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandKicker}>AQAL AL-QALIL</Text>
            <Text style={styles.dateLabel}>{todayLabel}</Text>
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
              <Settings color={Colors.text.primary} size={19} strokeWidth={1.8} />
            </Pressable>
          </View>
        </View>

        {/* Maqam — plain label, no badge chrome */}
        <Pressable
          onPress={() => navigation.navigate('WeeklyReport')}
          style={({ pressed }) => [styles.maqamRow, pressed && styles.pressed]}
        >
          <Text style={styles.maqamName}>{currentMaqam.nameFr}</Text>
          <ChevronRight color={Colors.text.secondary} size={14} strokeWidth={2} />
        </Pressable>

        {/* Baraka score — flat block + 5-segment weighted bar */}
        <BarakaScoreBlock breakdown={currentScore ?? emptyScore} />

        {currentStreak > 0 && (
          <View style={styles.streakRow}>
            <Flame color={Colors.gold} size={16} strokeWidth={1.8} />
            <Text style={styles.streakText}>
              {currentStreak} jour{currentStreak > 1 ? 's' : ''} de constance
            </Text>
          </View>
        )}

        {dayComplete && <Text style={styles.stateText}>✓ Baraka complète</Text>}
        {!dayComplete && strictMinMet && <Text style={styles.stateText}>✓ Strict minimum accompli</Text>}

        {/* Pillar rows */}
        <Text style={styles.sectionKicker}>MES 5 PILIERS</Text>
        <View style={styles.rule} />

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

        {/* Trend insight — border-top block, no card */}
        {trends.sampleSize >= 3 && trends.weakestPillar && (
          <Pressable
            style={({ pressed }) => [styles.trendBlock, pressed && styles.pressed]}
            onPress={() => navigation.navigate('WeeklyReport')}
          >
            <TrendingDown color={Colors.warning} size={18} strokeWidth={1.8} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trendKicker}>PILIER À SURVEILLER CETTE SEMAINE</Text>
              <Text style={styles.trendText}>
                <Text style={styles.trendName}>{trends.weakestPillar.nameFr}</Text>
                {' '}— {trends.weakestPillar.avgPct}% en moyenne
              </Text>
            </View>
            <ChevronRight color={Colors.text.secondary} size={14} strokeWidth={2} />
          </Pressable>
        )}

        {/* Golden Moment CTA — left accent rule, no fill */}
        {!today.spiritual.goldenMomentCompleted ? (
          <Pressable
            style={({ pressed }) => [styles.goldenCTA, pressed && styles.pressed]}
            onPress={() => navigation.navigate('GoldenMoment')}
          >
            <Text style={styles.goldenCTAKicker}>MOMENT D'OR</Text>
            <Text style={styles.goldenCTATitle}>15 minutes d'Adhkâr — verrouillé</Text>
          </Pressable>
        ) : (
          <Text style={styles.goldenDone}>✓ Moment d'Or accompli</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md + 4, paddingTop: Spacing.xs, paddingBottom: 120 },

  pressed: { opacity: 0.55 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: Typography.sizes.sm - 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },

  maqamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg - Spacing.xs,
  },
  maqamName: {
    fontSize: Typography.sizes.sm - 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: (Typography.sizes.sm - 1) * 0.04,
  },

  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  streakText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  stateText: {
    fontSize: Typography.sizes.sm - 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },

  sectionKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginTop: Spacing.lg + Spacing.xs,
    marginBottom: 10,
  },
  rule: {
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },

  trendBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  trendKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  trendText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  trendName: { fontFamily: Typography.fonts.heavy },

  goldenCTA: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    paddingVertical: 14,
    paddingLeft: 14,
    marginTop: Spacing.md,
  },
  goldenCTAKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  goldenCTATitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  goldenDone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    marginTop: Spacing.md,
  },
});
