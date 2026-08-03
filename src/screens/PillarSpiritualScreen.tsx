import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, type ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { useDayStore } from '../store/useDayStore';
import { PRAYERS } from '../constants/pillars';
import type { PrayerName, PrayerStatus } from '../store/useDayStore';
import { Check, Moon, Sun, Sparkles } from 'lucide-react-native';

const getStatusLabels = (Colors: ThemeColors): Record<PrayerStatus, { label: string; color: string }> => ({
  pending: { label: 'En attente',  color: Colors.text.muted },
  onTime:  { label: 'À l\'heure ✓', color: Colors.success },
  late:    { label: 'En retard',   color: Colors.warning },
  missed:  { label: 'Manquée',    color: Colors.danger },
});

export function PillarSpiritualScreen() {
  const navigation = useNavigation();
  const { today, validatePrayer, setRawatibFajr, setDuha, setWitr, setAdhkarEvening } = useDayStore();
  const s = today.spiritual;

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  const STATUS_LABELS = React.useMemo(() => getStatusLabels(Colors), [Colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>Pilier Spirituel</Text>
        <Text style={styles.subtitle}>الصلاة نور — La Routine de la Baraka</Text>

        {/* Prayers */}
        <SectionHeader title="Prières obligatoires" styles={styles} />
        {PRAYERS.map(p => {
          const status = s.prayers[p.id as PrayerName];
          const { label, color } = STATUS_LABELS[status];
          return (
            <View key={p.id} style={styles.prayerRow}>
              <Text style={styles.prayerIcon}>{p.icon}</Text>
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerName}>{p.nameFr}</Text>
                <Text style={[styles.prayerStatus, { color }]}>{label}</Text>
              </View>
              {status === 'pending' && (
                <View style={styles.prayerActions}>
                  <ActionChip
                    label="À l'heure"
                    color={Colors.success}
                    onPress={() => validatePrayer(p.id as PrayerName, 'onTime')}
                    styles={styles}
                  />
                  <ActionChip
                    label="En retard"
                    color={Colors.warning}
                    onPress={() => validatePrayer(p.id as PrayerName, 'late')}
                    styles={styles}
                  />
                </View>
              )}
              {status !== 'pending' && (
                <Pressable onPress={() => validatePrayer(p.id as PrayerName, 'pending')} style={styles.undoBtn}>
                  <Text style={styles.undoText}>Modifier</Text>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Sunnah actions */}
        <SectionHeader title="Sunnah & Extras" styles={styles} />

        <ToggleRow
          label="Rawatib du Fajr (2 rak'ât)"
          IconComponent={Sparkles}
          value={s.rawatibFajr}
          onToggle={v => setRawatibFajr(v)}
          points="+4 pts"
          Colors={Colors}
        />
        <ToggleRow
          label="Prière du Duha"
          IconComponent={Sun}
          value={s.duhaDone}
          onToggle={v => setDuha(v)}
          points="+3 pts"
          Colors={Colors}
        />
        <ToggleRow
          label="Witr accompli"
          IconComponent={Moon}
          value={s.witrDone}
          onToggle={v => setWitr(v)}
          points="+2 pts"
          Colors={Colors}
        />
        <ToggleRow
          label="Adhkâr du soir"
          IconComponent={Moon}
          value={s.adhkarEveningDone}
          onToggle={v => setAdhkarEvening(v)}
          points=""
          Colors={Colors}
        />

        {/* Golden Moment shortcut */}
        {!s.goldenMomentCompleted && (
          <Pressable
            style={styles.goldenBtn}
            onPress={() => navigation.navigate('GoldenMoment' as never)}
          >
            <Text style={styles.goldenBtnText}>✨ Lancer le Moment d'Or</Text>
            <Text style={styles.goldenBtnSub}>Adhkâr du matin — 15 min verrouillé (+6 pts)</Text>
          </Pressable>
        )}
        {s.goldenMomentCompleted && (
          <View style={styles.goldenDone}>
            <Text style={styles.goldenDoneText}>✓ Moment d'Or accompli</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, styles }: { title: string; styles: any }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ToggleRow({
  label, IconComponent, value, onToggle, points, Colors
}: {
  label: string; IconComponent: any; value: boolean;
  onToggle: (v: boolean) => void; points: string; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <Pressable style={styles.toggleRow} onPress={() => onToggle(!value)}>
      <IconComponent size={20} color={value ? Colors.success : Colors.text.primary} />
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={styles.toggleRight}>
        {points ? <Text style={styles.togglePoints}>{points}</Text> : null}
        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
          {value && <Check color={Colors.bg.primary} size={14} strokeWidth={3} />}
        </View>
      </View>
    </Pressable>
  );
}

function ActionChip({ label, color, onPress, styles }: { label: string; color: string; onPress: () => void; styles: any }) {
  return (
    <Pressable
      style={[styles.chip, { borderColor: color }]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },

  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.pillar.spiritual,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },

  sectionHeader: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginVertical: Spacing.md,
  },

  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prayerIcon: { fontSize: 22 },
  prayerInfo: { flex: 1, marginLeft: Spacing.sm },
  prayerName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  prayerStatus: { fontSize: Typography.sizes.sm, marginTop: 2 },
  prayerActions: { flexDirection: 'row', gap: Spacing.xs },
  undoBtn: { paddingHorizontal: Spacing.sm },
  undoText: { fontSize: Typography.sizes.xs, color: Colors.text.muted },

  chip: {
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  chipText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleLabel: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.text.primary, marginLeft: Spacing.sm },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  togglePoints: { fontSize: Typography.sizes.xs, color: Colors.gold },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.success, borderColor: Colors.success },

  goldenBtn: {
    backgroundColor: Colors.goldDim + '22',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  goldenBtnText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },
  goldenBtnSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  goldenDone: {
    backgroundColor: Colors.success + '22',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  goldenDoneText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
});
