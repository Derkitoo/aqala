import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { useAppStore, type AppMode, type NightMode, type MadhabType } from '../store/useAppStore';
import { requestNotificationPermission } from '../services/notifications';
import { showConfirm, showAlert } from '../utils/confirm';
import { Settings, RefreshCw, Sun, Moon } from 'lucide-react-native';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Ligue Islamique Mondiale (MWL)' },
  { id: 'Egyptian',           name: 'Autorité Égyptienne (ESA)' },
  { id: 'UmmAlQura',          name: 'Umm Al-Qura (Makkah)' },
  { id: 'NorthAmerica',       name: 'ISNA (Amérique du Nord)' },
  { id: 'Dubai',              name: 'Dubaï (EAU)' },
  { id: 'Karachi',            name: 'Université des Sciences Islamiques, Karachi' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
  { id: 'Turkey',             name: 'Diyanet (Turquie)' },
  { id: 'France',             name: 'France (12° / 15° MWL standard)' },
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

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

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
        <View style={styles.headerRow}>
          <Settings color={Colors.text.primary} size={28} />
          <Text style={styles.title}>Paramètres</Text>
        </View>
        <Text style={styles.subtitle}>Personnalise ton expérience</Text>

        {/* Theme Settings */}
        <SectionHeader title="Apparence" Colors={Colors} />
        <View style={styles.card}>
          <View style={styles.rowBtnGroup}>
            <Pressable
              style={[styles.segmentBtn, theme === 'light' && styles.segmentBtnActive]}
              onPress={() => setTheme('light')}
            >
              <Sun color={theme === 'light' ? Colors.gold : Colors.text.secondary} size={18} />
              <Text style={[styles.segmentText, theme === 'light' && styles.segmentTextActive]}>
                Clair
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, theme === 'premium' && styles.segmentBtnActive]}
              onPress={() => setTheme('premium')}
            >
              <Moon color={theme === 'premium' ? Colors.gold : Colors.text.secondary} size={18} />
              <Text style={[styles.segmentText, theme === 'premium' && styles.segmentTextActive]}>
                Premium
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Prayer Settings */}
        <SectionHeader title="Calcul des Prières" Colors={Colors} />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Méthode de calcul</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {CALCULATION_METHODS.map(m => (
              <Pressable
                key={m.id}
                style={[
                  styles.chip,
                  calculationMethod === m.id && styles.chipActive,
                ]}
                onPress={() => setCalculationMethod(m.id)}
              >
                <Text style={[styles.chipText, calculationMethod === m.id && styles.chipTextActive]}>
                  {m.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          <Text style={styles.cardLabel}>École de Jurisprudence (Asr)</Text>
          <View style={styles.rowBtnGroup}>
            <Pressable
              style={[styles.segmentBtn, madhab === 'shafi' && styles.segmentBtnActive]}
              onPress={() => setMadhab('shafi')}
            >
              <Text style={[styles.segmentText, madhab === 'shafi' && styles.segmentTextActive]}>
                Standard (Shafi'i, Maliki, Hanbali)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, madhab === 'hanafi' && styles.segmentBtnActive]}
              onPress={() => setMadhab('hanafi')}
            >
              <Text style={[styles.segmentText, madhab === 'hanafi' && styles.segmentTextActive]}>
                Hanafi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Location & Permissions */}
        <SectionHeader title="Localisation & Notifications" Colors={Colors} />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GPS Position :</Text>
            <Text style={styles.infoValue}>
              {latitude && longitude
                ? `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
                : 'Non détectée'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permission GPS :</Text>
            <Text style={[styles.infoValue, { color: locationGranted ? Colors.success : Colors.warning }]}>
              {locationGranted ? 'Accordée ✓' : 'Non accordée'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rappels Push :</Text>
            <Text style={[styles.infoValue, { color: notificationsGranted ? Colors.success : Colors.warning }]}>
              {notificationsGranted ? 'Activés ✓' : 'Inactifs'}
            </Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={handleRefreshLocation}>
            <RefreshCw color={Colors.gold} size={16} />
            <Text style={styles.refreshBtnText}>Actualiser la localisation</Text>
          </Pressable>
        </View>

        {/* App Mode */}
        <SectionHeader title="Mode d'Accompagnement" Colors={Colors} />
        <View style={styles.card}>
          <ModeOption
            title="Débutant"
            subtitle="Priorité absolue au Fajr & Moment d'Or"
            active={appMode === 'beginner'}
            onSelect={() => setAppMode('beginner')}
            Colors={Colors}
          />
          <View style={styles.divider} />
          <ModeOption
            title="Intermédiaire"
            subtitle="Intégration du Savoir et de l'Activité Physique"
            active={appMode === 'intermediate'}
            onSelect={() => setAppMode('intermediate')}
            Colors={Colors}
          />
          <View style={styles.divider} />
          <ModeOption
            title="Avancé"
            subtitle="5 piliers complets + Qiyam al-Layl"
            active={appMode === 'advanced'}
            onSelect={() => setAppMode('advanced')}
            Colors={Colors}
          />
        </View>

        {/* Night Mode */}
        <SectionHeader title="Routine de Nuit" Colors={Colors} />
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Qiyam al-Layl (Nuit Globale)</Text>
              <Text style={styles.toggleDesc}>Incorpore l'éveil du dernier tiers de la nuit</Text>
            </View>
            <Pressable
              style={[styles.switchTrack, nightMode === 'global' && styles.switchTrackOn]}
              onPress={() => setNightMode(nightMode === 'global' ? 'standard' : 'global')}
            >
              <View style={[styles.switchThumb, nightMode === 'global' && styles.switchThumbOn]} />
            </Pressable>
          </View>
        </View>

        {/* App Reset */}
        <SectionHeader title="Application" Colors={Colors} />
        <Pressable style={styles.resetBtn} onPress={handleResetOnboarding}>
          <Text style={styles.resetBtnText}>Relancer l'Onboarding</Text>
        </Pressable>

        <Text style={styles.versionText}>Aqal Al-Qalil • Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, Colors }: { title: string; Colors: ThemeColors }) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ModeOption({ title, subtitle, active, onSelect, Colors }: {
  title: string; subtitle: string; active: boolean; onSelect: () => void; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  return (
    <Pressable style={styles.modeOption} onPress={onSelect}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.modeTitle, active && { color: Colors.gold }]}>{title}</Text>
        <Text style={styles.modeSub}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.white,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },

  sectionHeader: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },

  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },

  pickerScroll: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.gold + '22',
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  rowBtnGroup: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.bg.primary, // minimalist, don't color background
  },
  segmentText: {
    fontSize: Typography.sizes.sm, // larger
    color: Colors.text.secondary,
  },
  segmentTextActive: {
    color: Colors.gold,
    fontWeight: Typography.weights.bold,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  infoLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary },
  infoValue: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: Colors.white },

  refreshBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  refreshBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.gold,
  },

  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  modeTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  modeSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  toggleDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    padding: 2,
  },
  switchTrackOn: {
    backgroundColor: Colors.gold,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },

  resetBtn: {
    backgroundColor: Colors.danger + '22',
    borderColor: Colors.danger,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resetBtnText: {
    color: Colors.danger,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },

  versionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
