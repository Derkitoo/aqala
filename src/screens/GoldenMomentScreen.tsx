import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, Easing } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LockTimer } from '../components/LockTimer';
import { useTheme, ThemeColors, Typography, Spacing } from '../constants/theme';
import { useDayStore } from '../store/useDayStore';
import { useAppStore } from '../store/useAppStore';
import { GOLDEN_MOMENT_DURATION_SECONDS } from '../constants/pillars';

// Adhkar content displayed during the lock
const MORNING_ADHKAR = [
  {
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal mulku lillahi walhamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    translation: 'Nous sommes au matin et le Royaume appartient à Allah. Louange à Allah, il n\'y a de divinité qu\'Allah l\'Unique sans associé.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan nushur',
    translation: 'Ô Allah ! C\'est par Toi que nous nous retrouvons au matin, par Toi au soir, par Toi nous vivons, par Toi nous mourons et vers Toi est la résurrection.',
    count: 1,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    transliteration: 'Subhanallahi wa bihamdih: \'adada khalqih, wa rida nafsih, wa zinata \'arshih, wa midada kalimatih',
    translation: 'Gloire et louange à Allah, autant de fois que le nombre de Ses créatures, selon Son bon plaisir, le poids de Son Trône et l\'encre de Ses paroles.',
    count: 3,
  },
  {
    text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration: 'Ya Hayyu ya Qayyumu bi-rahmatika astagheeth, aslih li sha\'ni kullahu wa la takilni ila nafsi tarfata \'ayn',
    translation: 'Ô Vivant, Ô Subsistant par Soi-même, par Ta miséricorde je demande secours. Améliore toute ma situation et ne me abandonne pas à moi-même le temps d\'un clin d\'œil.',
    count: 1,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdih',
    translation: 'Gloire et louange à Allah.',
    count: 100,
  },
];

function FadingDhikrCarousel() {
  const [index, setIndex] = useState(0);
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MORNING_ADHKAR.length);
    }, 12000); // Change every 12 seconds for slow meditation
    return () => clearInterval(interval);
  }, []);

  const dhikr = MORNING_ADHKAR[index];

  return (
    <View style={styles.carouselContainer}>
      <Animated.View
        key={index}
        entering={FadeIn.duration(3000).easing(Easing.inOut(Easing.ease))}
        exiting={FadeOut.duration(2000).easing(Easing.inOut(Easing.ease))}
        style={styles.animatedDhikr}
      >
        <Text style={styles.dhikrTextArabic}>{dhikr.text}</Text>
        <Text style={styles.dhikrTranslitBig}>{dhikr.transliteration}</Text>
        {dhikr.translation && (
          <Text style={styles.dhikrTranslationBig}>{dhikr.translation}</Text>
        )}
        {dhikr.count > 1 && (
          <Text style={styles.dhikrCountBadge}>À répéter {dhikr.count} fois</Text>
        )}
      </Animated.View>
    </View>
  );
}

export function GoldenMomentScreen() {
  const navigation = useNavigation();
  const { completeGoldenMoment, startGoldenMoment, today } = useDayStore();
  const { setGoldenMomentActive } = useAppStore();

  // Start tracking on mount
  React.useEffect(() => {
    startGoldenMoment();
    setGoldenMomentActive(true);
  }, []);

  const handleComplete = useCallback(() => {
    completeGoldenMoment();
    setGoldenMomentActive(false);
    navigation.goBack();
  }, [completeGoldenMoment, setGoldenMomentActive, navigation]);

  const handleCancel = useCallback(() => {
    setGoldenMomentActive(false);
    navigation.goBack();
  }, [setGoldenMomentActive, navigation]);

  return (
    <LockTimer
      totalSeconds={GOLDEN_MOMENT_DURATION_SECONDS}
      onComplete={handleComplete}
      onCancel={handleCancel}
      content={<FadingDhikrCarousel />}
    />
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  animatedDhikr: {
    alignItems: 'center',
    width: '100%',
  },
  dhikrTextArabic: {
    fontSize: 32,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: Spacing.md,
  },
  dhikrTranslitBig: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  dhikrTranslationBig: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  dhikrCountBadge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.bg.primary,
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
});
