import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import { useAppStore, type AppMode } from '../store/useAppStore';
import { requestNotificationPermission } from '../services/notifications';
import { Moon, Leaf, Shield, Sparkles, MapPin, Bell, Zap } from 'lucide-react-native';

type Step = 'welcome' | 'mode' | 'permissions' | 'ready';

interface ModeOption {
  id: AppMode;
  IconComponent: any;
  title: string;
  subtitle: string;
  habits: string[];
}

// Mono-accent: modes are distinguished by icon + title, not colour.
const MODES: ModeOption[] = [
  {
    id: 'beginner',
    IconComponent: Leaf,
    title: 'Mode Débutant',
    subtitle: 'Le Strict Minimum — 5 habitudes, 15 min chacune',
    habits: [
      '1 prière validée à l\'heure',
      '15 min de savoir + 1 note',
      '20 min d\'activité physique',
      '1 interaction sociale réelle',
      'Coucher avant 23h30',
    ],
  },
  {
    id: 'intermediate',
    IconComponent: Shield,
    title: 'Mode Intermédiaire',
    subtitle: 'Toutes les prières + Moment d\'Or + Qaylulah',
    habits: [
      'Les 5 prières obligatoires trackées',
      'Moment d\'Or (Adhkâr 15 min verrouillé)',
      'Qaylulah post-Dhouhr',
      'Savoir + Social + Sommeil',
      'Witr et Adhkâr du soir',
    ],
  },
  {
    id: 'advanced',
    IconComponent: Sparkles,
    title: 'Mode Avancé',
    subtitle: 'Routine complète 24h avec Qiyam al-Layl',
    habits: [
      'Tout le mode Intermédiaire',
      'Rawatib et Duha trackés',
      'Wird quotidien (compteur)',
      'Mode Nuit Globale (Qiyam al-Layl)',
      'Sommeil fractionné prophétique',
    ],
  },
];

export function OnboardingScreen() {
  const { completeOnboarding, setLocation, setPermissions } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedMode, setSelectedMode] = useState<AppMode>('beginner');
  const [locGranted, setLocGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  const { Colors, Typography, Spacing, scale } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, scale), [Colors, Typography, Spacing, scale]);

  const handleRequestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords.latitude, loc.coords.longitude);
      setLocGranted(true);
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const handleFinish = () => {
    setPermissions(locGranted, notifGranted);
    completeOnboarding(selectedMode);
  };

  const selectedModeObj = MODES.find(m => m.id === selectedMode)!;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>

        {/* ── STEP: WELCOME ─────────────────────────────── */}
        {step === 'welcome' && (
          <View style={styles.stepContainer}>
            <View style={styles.brandIconWrap}>
              <Moon color={Colors.gold} size={46} strokeWidth={1.2} />
            </View>
            <Text style={styles.brandTitle}>Aqal al-Qalil</Text>
            <Text style={styles.brandArabic}>أقل القليل</Text>
            <Text style={styles.heroSubtitle}>
              La productivité du croyant.{'\n'}
              5 piliers. 24 heures. Une constance.
            </Text>

            <View style={styles.principleBox}>
              <Text style={styles.principleText}>
                "Les actes les plus aimés d'Allah sont les plus constants,
                même s'ils sont peu nombreux."
              </Text>
              <Text style={styles.principleRef}>— Sahih Bukhari & Muslim</Text>
            </View>

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => setStep('mode')}>
              <Text style={styles.primaryBtnText}>Commencer →</Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP: MODE SELECTION ──────────────────────── */}
        {step === 'mode' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choisis ton niveau</Text>
            <Text style={styles.stepSubtitle}>
              Tu pourras changer à tout moment dans les réglages.
            </Text>

            {MODES.map(mode => {
              const active = selectedMode === mode.id;
              return (
                <Pressable
                  key={mode.id}
                  style={({ pressed }) => [styles.modeRow, pressed && styles.pressed]}
                  onPress={() => setSelectedMode(mode.id)}
                >
                  <View style={styles.modeHeader}>
                    <mode.IconComponent color={active ? Colors.gold : Colors.text.primary} size={24} strokeWidth={1.6} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>
                        {mode.title}
                      </Text>
                      <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                    </View>
                    {/* Native-style radio dot — stays circular. */}
                    <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </View>

                  {active && (
                    <View style={styles.habitsList}>
                      {mode.habits.map((h, i) => (
                        <Text key={i} style={styles.habitItem}>— {h}</Text>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => setStep('permissions')}>
              <Text style={styles.primaryBtnText}>Continuer →</Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP: PERMISSIONS ─────────────────────────── */}
        {step === 'permissions' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Autorisations</Text>
            <Text style={styles.stepSubtitle}>
              Pour calculer les horaires de prière et envoyer des rappels fraternels.
            </Text>

            <PermissionRow
              IconComponent={MapPin}
              title="Localisation"
              description="Calcule les horaires de prière précis selon ta position."
              granted={locGranted}
              onRequest={handleRequestLocation}
              Colors={Colors} Typography={Typography} Spacing={Spacing} scale={scale}
            />
            <PermissionRow
              IconComponent={Bell}
              title="Notifications"
              description="Rappels de prières, Moment d'Or, et incitations bienveillantes."
              granted={notifGranted}
              onRequest={handleRequestNotifications}
              Colors={Colors} Typography={Typography} Spacing={Spacing} scale={scale}
            />

            <Text style={styles.skipNoteText}>
              Ces autorisations sont recommandées mais pas obligatoires.
              Tu peux les activer plus tard dans les réglages.
            </Text>

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => setStep('ready')}>
              <Text style={styles.primaryBtnText}>
                {locGranted && notifGranted ? 'Tout est prêt →' : 'Passer →'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP: READY ───────────────────────────────── */}
        {step === 'ready' && (
          <View style={styles.stepContainer}>
            <View style={styles.brandIconWrap}>
              <Zap color={Colors.gold} size={46} strokeWidth={1.2} />
            </View>
            <Text style={styles.brandTitle}>Prêt.</Text>
            <Text style={styles.readyBody}>
              Ta première journée commence maintenant.{'\n\n'}
              Le Strict Minimum n'est pas un plafond — c'est le sol.
              Ce que tu bâtis au-dessus appartient à ta volonté.
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>{selectedModeObj.title}</Text>
              <Text style={styles.summarySubtitle}>{selectedModeObj.subtitle}</Text>
            </View>

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={handleFinish}>
              <Text style={styles.primaryBtnText}>Bismillah — Commencer</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Step indicator — square bars, the active one wider */}
      <View style={styles.stepDots}>
        {(['welcome', 'mode', 'permissions', 'ready'] as Step[]).map(s => (
          <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}


function PermissionRow({ IconComponent, title, description, granted, onRequest, Colors, Typography, Spacing, scale }: {
  IconComponent: any; title: string; description: string;
  granted: boolean; onRequest: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; scale: number;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, scale), [Colors, Typography, Spacing, scale]);
  return (
    <View style={styles.permRow}>
      <IconComponent color={Colors.text.primary} size={22} strokeWidth={1.7} />
      <View style={{ flex: 1 }}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{description}</Text>
      </View>
      {granted ? (
        <Text style={styles.permGranted}>✓ Accordé</Text>
      ) : (
        <Pressable style={({ pressed }) => [styles.permBtn, pressed && styles.pressed]} onPress={onRequest}>
          <Text style={styles.permBtnText}>Autoriser</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, scale: number) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 60 },

  pressed: { opacity: 0.55 },

  stepContainer: { flex: 1, justifyContent: 'center' },

  brandIconWrap: { alignItems: 'center', marginBottom: 18 },
  brandTitle: {
    fontSize: Math.round(34 * scale),
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  brandArabic: {
    fontSize: Typography.sizes.lg + 2,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: 22,
  },

  // Flat surface + 2px left accent rule.
  principleBox: {
    backgroundColor: Colors.bg.card,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    padding: Spacing.md,
  },
  principleText: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: (Typography.sizes.sm + 1) * 1.5,
  },
  principleRef: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
  },

  stepTitle: {
    fontSize: Typography.sizes.xxl - 2,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    marginTop: 10,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.sm + 1) * 1.4,
    marginTop: 6,
    marginBottom: 18,
  },

  modeRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  modeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeTitle: {
    fontSize: Typography.sizes.md + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  modeTitleActive: { color: Colors.gold },
  modeSubtitle: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 999,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.gold },
  radioInner: { width: 9, height: 9, borderRadius: 999, backgroundColor: Colors.gold },
  habitsList: { marginTop: 12, paddingLeft: 36, gap: 5 },
  habitItem: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.4,
  },

  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  permTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  permDesc: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: (Typography.sizes.xs + 1) * 1.4,
  },
  permGranted: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  permBtn: {
    borderWidth: 1, borderColor: Colors.gold,
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm, paddingHorizontal: 12,
  },
  permBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  skipNoteText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    lineHeight: (Typography.sizes.xs + 1) * 1.5,
    marginTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 14,
  },

  readyBody: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.md * 1.6,
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: Colors.bg.card,
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: Typography.sizes.md + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  summarySubtitle: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Full-width solid accent block, label flush left.
  primaryBtn: {
    backgroundColor: Colors.gold,
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: 18,
    marginTop: Spacing.md,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
    textAlign: 'left',
  },

  stepDots: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.gold, width: 18 },
});
