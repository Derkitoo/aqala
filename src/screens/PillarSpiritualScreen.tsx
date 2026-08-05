import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useScaledTheme, type ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { useDayStore } from '../store/useDayStore';
import { PILLARS, PRAYERS } from '../constants/pillars';
import { ScreenHeader } from '../components/ScreenHeader';
import type { PrayerName, PrayerStatus } from '../store/useDayStore';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { computeSpiritualBalance } from '../engine/trends';
import { Check, Moon, Sun, Sparkles, AlertTriangle } from 'lucide-react-native';

const getStatusLabels = (Colors: ThemeColors): Record<PrayerStatus, { label: string; color: string }> => ({
  pending: { label: 'En attente',  color: Colors.text.muted },
  onTime:  { label: 'À l\'heure ✓', color: Colors.gold },
  late:    { label: 'En retard',   color: Colors.warning },
  missed:  { label: 'Manquée',    color: Colors.danger },
});

export function PillarSpiritualScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { today, history, validatePrayer, setRawatibFajr, setDuha, setWitr } = useDayStore();
  const s = today.spiritual;

  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const STATUS_LABELS = React.useMemo(() => getStatusLabels(Colors), [Colors]);
  const balance = useMemo(() => computeSpiritualBalance(today, history), [today, history]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <ScreenHeader
          kicker={`PILIER · ${PILLARS.spiritual.numeral}`}
          title="Pilier Spirituel"
          subtitle="الصلاة نور — La Routine de la Baraka"
        />

        <SpiritualBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} />

        {/* Prayers */}
        <Text style={styles.sectionKicker}>PRIÈRES OBLIGATOIRES</Text>
        <View style={styles.rule} />
        {PRAYERS.map(p => {
          const status = s.prayers[p.id as PrayerName];
          const { label, color } = STATUS_LABELS[status];
          return (
            <View key={p.id} style={styles.prayerRow}>
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerName}>{p.nameFr}</Text>
                <Text style={[styles.prayerStatus, { color }]}>{label}</Text>
              </View>
              {status === 'pending' && (
                <View style={styles.prayerActions}>
                  <Pressable
                    style={({ pressed }) => [styles.chip, styles.chipAffirm, pressed && styles.pressed]}
                    onPress={() => validatePrayer(p.id as PrayerName, 'onTime')}
                  >
                    <Text style={[styles.chipText, styles.chipTextAffirm]}>À l'heure</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                    onPress={() => validatePrayer(p.id as PrayerName, 'late')}
                  >
                    <Text style={styles.chipText}>En retard</Text>
                  </Pressable>
                </View>
              )}
              {status !== 'pending' && (
                <Pressable
                  onPress={() => validatePrayer(p.id as PrayerName, 'pending')}
                  style={({ pressed }) => [styles.undoBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.undoText}>Modifier</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Sunnah actions */}
        <Text style={styles.sectionKicker}>SUNNAH & EXTRAS</Text>
        <View style={styles.rule} />

        <ToggleRow
          label="Rawatib du Fajr (2 rak'ât)"
          IconComponent={Sparkles}
          value={s.rawatibFajr}
          onToggle={v => setRawatibFajr(v)}
          points="+4 pts"
          Colors={Colors}
          Typography={Typography}
          Spacing={Spacing}
        />
        <ToggleRow
          label="Prière du Duha"
          IconComponent={Sun}
          value={s.duhaDone}
          onToggle={v => setDuha(v)}
          points="+3 pts"
          Colors={Colors}
          Typography={Typography}
          Spacing={Spacing}
        />
        <ToggleRow
          label="Witr accompli"
          IconComponent={Moon}
          value={s.witrDone}
          onToggle={v => setWitr(v)}
          points="+2 pts"
          Colors={Colors}
          Typography={Typography}
          Spacing={Spacing}
        />

        {/* Golden Moment shortcut */}
        {!s.goldenMomentCompleted && (
          <Pressable
            style={({ pressed }) => [styles.goldenBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('GoldenMoment', { type: 'morning' })}
          >
            <Text style={styles.goldenBtnText}>Lancer le Moment d'Or</Text>
            <Text style={styles.goldenBtnSub}>Adhkâr du matin — 15 min verrouillé (+6 pts)</Text>
          </Pressable>
        )}
        {s.goldenMomentCompleted && (
          <Text style={styles.goldenDone}>✓ Moment d'Or accompli</Text>
        )}

        {/* Evening Adhkar shortcut */}
        {!s.adhkarEveningDone && (
          <Pressable
            style={({ pressed }) => [styles.goldenBtn, styles.goldenBtnAlt, pressed && styles.pressed]}
            onPress={() => navigation.navigate('GoldenMoment', { type: 'evening' })}
          >
            <Text style={styles.goldenBtnText}>Lancer les Adhkâr du Soir</Text>
            <Text style={styles.goldenBtnSub}>Récitation complète — 15 min verrouillé</Text>
          </Pressable>
        )}
        {s.adhkarEveningDone && (
          <Text style={styles.goldenDone}>✓ Adhkâr du soir accomplis</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SpiritualBalanceCard({ balance, Colors, Typography, Spacing }: {
  balance: ReturnType<typeof computeSpiritualBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  if (balance.sampleSize < 3) return null;

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceKicker}>CETTE SEMAINE</Text>
      <View style={styles.balanceRow}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.prayersOnTimePct}%</Text>
          <Text style={styles.balanceLabel}>Prières à l'heure</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.goldenMomentDays}/{balance.windowDays}</Text>
          <Text style={styles.balanceLabel}>Moment d'Or</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceCount}>{balance.adhkarEveningDays}/{balance.windowDays}</Text>
          <Text style={styles.balanceLabel}>Adhkâr soir</Text>
        </View>
      </View>
      {balance.mostMissedPrayer && (
        <View style={styles.balanceNudgeRow}>
          <AlertTriangle size={14} color={Colors.warning} strokeWidth={1.8} />
          <Text style={styles.balanceNudge}>
            <Text style={styles.balanceNudgeStrong}>{balance.mostMissedPrayer.nameFr}</Text> est la prière la plus souvent en retard ou manquée cette semaine.
          </Text>
        </View>
      )}
    </View>
  );
}

function ToggleRow({
  label, IconComponent, value, onToggle, points, Colors, Typography, Spacing
}: {
  label: string; IconComponent: any; value: boolean;
  onToggle: (v: boolean) => void; points: string; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <Pressable
      style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
      onPress={() => onToggle(!value)}
    >
      <IconComponent size={18} strokeWidth={1.7} color={value ? Colors.gold : Colors.text.primary} />
      <Text style={styles.toggleLabel}>{label}</Text>
      {points ? <Text style={styles.togglePoints}>{points}</Text> : null}
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Check color={Colors.bg.primary} size={12} strokeWidth={2.4} />}
      </View>
    </Pressable>
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
  rule: { height: 2, backgroundColor: Colors.border, marginBottom: 14 },

  // Flat surface fill — no radius, no shadow, no dividers between the stats.
  balanceCard: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.md,
    marginBottom: 6,
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
  balanceItem: { alignItems: 'center' },
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
    textAlign: 'center',
  },
  balanceNudgeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: Spacing.sm, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  balanceNudge: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.xs * 1.5,
  },
  balanceNudgeStrong: { fontFamily: Typography.fonts.heavy },

  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 13,
  },
  prayerInfo: { flex: 1 },
  prayerName: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  prayerStatus: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  prayerActions: { flexDirection: 'row', gap: 6 },
  undoBtn: { paddingHorizontal: Spacing.sm },
  undoText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
  },

  // 1px outline, no fill. Accent border + text marks the affirmative action.
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  chipAffirm: { borderColor: Colors.gold },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
  },
  chipTextAffirm: { color: Colors.gold },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 13,
  },
  toggleLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
  },
  togglePoints: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
    marginRight: 10,
  },
  checkbox: {
    width: 20, height: 20,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.gold, borderColor: Colors.gold },

  goldenBtn: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    paddingVertical: 14,
    paddingLeft: 14,
    marginTop: 18,
  },
  goldenBtnAlt: {
    borderLeftColor: Colors.border,
    marginTop: 10,
  },
  goldenBtnText: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  goldenBtnSub: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  goldenDone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
    paddingVertical: 14,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
