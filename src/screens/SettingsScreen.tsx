import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { requestNotificationPermission } from '../services/notifications';
import { showConfirm, showAlert } from '../utils/confirm';
import { ScreenHeader } from '../components/ScreenHeader';
import { RefreshCw, Sun, Moon } from 'lucide-react-native';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'MWL' },
  { id: 'Egyptian',           name: 'Égyptienne' },
  { id: 'UmmAlQura',          name: 'Umm Al-Qura' },
  { id: 'NorthAmerica',       name: 'ISNA' },
  { id: 'Dubai',              name: 'Dubaï' },
  { id: 'Karachi',            name: 'Karachi' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting' },
  { id: 'Turkey',             name: 'Diyanet' },
  { id: 'France',             name: 'France' },
];

export function SettingsScreen() {
  const navigation = useNavigation();
  const {
    appMode,
    nightMode,
    calculationMethod,
    madhab,
    locationGranted,
    notificationsGranted,
    latitude,
    longitude,
    theme,
    setTheme,
    setAppMode,
    setNightMode,
    setCalculationMethod,
    setMadhab,
    setLocation,
    setPermissions,
    resetOnboarding,
  } = useAppStore();

  const { Colors, Typography, Spacing, scale } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const { width, height } = useWindowDimensions();

  const handleRefreshLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const notifGranted = await requestNotificationPermission();
      const locGranted = status === 'granted';

      if (locGranted) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc.coords.latitude, loc.coords.longitude);
      }
      setPermissions(locGranted, notifGranted);

      showAlert('Succès', 'Localisation et permissions mises à jour.');
    } catch (e) {
      showAlert('Erreur', 'Impossible de récupérer la géolocalisation.');
    }
  };

  const handleResetOnboarding = () => {
    showConfirm(
      'Réinitialiser l\'onboarding',
      'Souhaitez-vous reconfigurer votre profil et vos objectifs d\'onboarding ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            navigation.navigate('Onboarding' as never);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Paramètres" subtitle="Personnalise ton expérience" />

        {/* Appearance — segmented, solid accent fill on the active option */}
        <Text style={styles.sectionKicker}>APPARENCE</Text>
        <View style={styles.hr} />
        <View style={styles.segRow}>
          <Pressable
            style={({ pressed }) => [styles.segFlex, theme === 'light' && styles.segActive, pressed && styles.pressed]}
            onPress={() => setTheme('light')}
          >
            <Sun size={14} strokeWidth={1.8} color={theme === 'light' ? Colors.bg.primary : Colors.text.primary} />
            <Text style={[styles.segText, theme === 'light' && styles.segTextActive]}>Clair</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.segFlex, theme === 'premium' && styles.segActive, pressed && styles.pressed]}
            onPress={() => setTheme('premium')}
          >
            <Moon size={14} strokeWidth={1.8} color={theme === 'premium' ? Colors.bg.primary : Colors.text.primary} />
            <Text style={[styles.segText, theme === 'premium' && styles.segTextActive]}>Sombre</Text>
          </Pressable>
        </View>

        {/* Prayer calculation */}
        <Text style={styles.sectionKicker}>CALCUL DES PRIÈRES</Text>
        <View style={styles.hr} />
        <View style={styles.chipsWrap}>
          {CALCULATION_METHODS.map(m => {
            const active = calculationMethod === m.id;
            return (
              <Pressable
                key={m.id}
                style={({ pressed }) => [styles.chip, active && styles.segActive, pressed && styles.pressed]}
                onPress={() => setCalculationMethod(m.id)}
              >
                <Text style={[styles.chipText, active && styles.segTextActive]}>{m.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>École de Jurisprudence (Asr)</Text>
        <View style={styles.segRow}>
          <Pressable
            style={({ pressed }) => [styles.segFlex, madhab === 'shafi' && styles.segActive, pressed && styles.pressed]}
            onPress={() => setMadhab('shafi')}
          >
            <Text style={[styles.segText, madhab === 'shafi' && styles.segTextActive]}>Standard</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.segFlex, madhab === 'hanafi' && styles.segActive, pressed && styles.pressed]}
            onPress={() => setMadhab('hanafi')}
          >
            <Text style={[styles.segText, madhab === 'hanafi' && styles.segTextActive]}>Hanafi</Text>
          </Pressable>
        </View>

        {/* Location & Permissions */}
        <Text style={styles.sectionKicker}>LOCALISATION & NOTIFICATIONS</Text>
        <View style={styles.hr} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>GPS Position</Text>
          <Text style={styles.infoValue}>
            {latitude && longitude
              ? `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
              : 'Non détectée'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Permission GPS</Text>
          <Text style={[styles.infoValue, locationGranted && styles.infoValueGranted]}>
            {locationGranted ? 'Accordée ✓' : 'Non accordée'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rappels Push</Text>
          <Text style={[styles.infoValue, notificationsGranted && styles.infoValueGranted]}>
            {notificationsGranted ? 'Activés ✓' : 'Inactifs'}
          </Text>
        </View>
        <Pressable style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]} onPress={handleRefreshLocation}>
          <RefreshCw color={Colors.gold} size={14} strokeWidth={1.8} />
          <Text style={styles.outlineBtnText}>Actualiser la localisation</Text>
        </Pressable>

        {/* App Mode */}
        <Text style={styles.sectionKicker}>MODE D'ACCOMPAGNEMENT</Text>
        <View style={styles.hr} />
        <ModeOption
          title="Débutant"
          subtitle="Priorité absolue au Fajr & Moment d'Or"
          active={appMode === 'beginner'}
          onSelect={() => setAppMode('beginner')}
          Colors={Colors} Typography={Typography} Spacing={Spacing}
        />
        <ModeOption
          title="Intermédiaire"
          subtitle="Intégration du Savoir et de l'Activité Physique"
          active={appMode === 'intermediate'}
          onSelect={() => setAppMode('intermediate')}
          Colors={Colors} Typography={Typography} Spacing={Spacing}
        />
        <ModeOption
          title="Avancé"
          subtitle="5 piliers complets + Qiyam al-Layl"
          active={appMode === 'advanced'}
          onSelect={() => setAppMode('advanced')}
          Colors={Colors} Typography={Typography} Spacing={Spacing}
        />

        {/* Night Mode — square track, square thumb */}
        <Text style={styles.sectionKicker}>ROUTINE DE NUIT</Text>
        <View style={styles.hr} />
        <View style={styles.nightRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nightTitle}>Qiyam al-Layl (Nuit Globale)</Text>
            <Text style={styles.nightDesc}>Incorpore l'éveil du dernier tiers de la nuit</Text>
          </View>
          <Pressable
            style={[styles.switchTrack, nightMode === 'global' && styles.switchTrackOn]}
            onPress={() => setNightMode(nightMode === 'global' ? 'standard' : 'global')}
          >
            <View style={styles.switchThumb} />
          </Pressable>
        </View>

        {/* App Reset */}
        <Text style={styles.sectionKicker}>APPLICATION</Text>
        <View style={styles.hr} />
        <Pressable style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]} onPress={handleResetOnboarding}>
          <Text style={styles.resetBtnText}>Relancer l'Onboarding</Text>
        </Pressable>

        <Text style={styles.versionText}>Aqal Al-Qalil · Version 1.0.0</Text>
        <Text style={styles.versionText}>
          Écran : {Math.round(width)}×{Math.round(height)}px · Échelle texte : ×{scale.toFixed(2)}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeOption({ title, subtitle, active, onSelect, Colors, Typography, Spacing }: {
  title: string; subtitle: string; active: boolean; onSelect: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <Pressable style={({ pressed }) => [styles.modeOption, pressed && styles.pressed]} onPress={onSelect}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{title}</Text>
        <Text style={styles.modeSub}>{subtitle}</Text>
      </View>
      {/* Native-style radio dot — the one shape that stays circular. */}
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
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
  hr: { height: 2, backgroundColor: Colors.border, marginBottom: 14 },

  // Segmented controls: 1px border, solid accent fill + inverse text active.
  segRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 18 },
  segFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  segActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  segText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  segTextActive: { color: Colors.bg.primary },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 18 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
  },

  fieldLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  infoValueGranted: { color: Colors.gold },

  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    marginTop: 12,
  },
  outlineBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },

  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 13,
  },
  modeTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  modeTitleActive: { color: Colors.gold },
  modeSub: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radio: {
    width: 18, height: 18, borderRadius: 999,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.gold },
  radioDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: Colors.gold },

  nightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.sm },
  nightTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  nightDesc: {
    fontSize: Typography.sizes.xs + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  switchTrack: {
    width: 42, height: 24,
    backgroundColor: Colors.border,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  switchTrackOn: { backgroundColor: Colors.gold, alignItems: 'flex-end' },
  switchThumb: { width: 18, height: 18, backgroundColor: Colors.white },

  resetBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resetBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.danger,
  },

  versionText: {
    fontSize: Typography.sizes.xs - 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: 10,
  },
});
