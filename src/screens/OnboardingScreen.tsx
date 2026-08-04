import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Animated,
} from 'react-native';
import * as Location from 'expo-location';
import { useScaledTheme, Colors as StaticColors, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
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
  color: string;
}

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
    color: StaticColors.pillar.knowledge,
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
    color: StaticColors.pillar.spiritual,
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
    color: '#F5C842', // gold
  },
];

export function OnboardingScreen() {
  const { completeOnboarding, setLocation, setPermissions } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedMode, setSelectedMode] = useState<AppMode>('beginner');
  const [locGranted, setLocGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>

        {/* ── STEP: WELCOME ─────────────────────────────── */}
        {step === 'welcome' && (
          <View style={styles.stepContainer}>
            <View style={{ alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.md }}>
              <Moon color={Colors.gold} size={64} strokeWidth={1} />
            </View>
            <Text style={styles.heroTitle}>Aqal al-Qalil</Text>
            <Text style={styles.heroAr}>أقل القليل</Text>
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

            <Pressable style={styles.primaryBtn} onPress={() => setStep('mode')}>
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

            {MODES.map(mode => (
              <Pressable
                key={mode.id}
                style={[
                  styles.modeCard,
                  selectedMode === mode.id && { borderColor: mode.color },
                ]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <View style={styles.modeHeader}>
                  <mode.IconComponent color={mode.color} size={28} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[styles.modeTitle, selectedMode === mode.id && { color: mode.color }]}>
                      {mode.title}
                    </Text>
                    <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    selectedMode === mode.id && { borderColor: mode.color },
                  ]}>
                    {selectedMode === mode.id && (
                      <View style={[styles.radioInner, { backgroundColor: mode.color }]} />
                    )}
                  </View>
                </View>

                {selectedMode === mode.id && (
                  <View style={styles.habitsList}>
                    {mode.habits.map((h, i) => (
                      <Text key={i} style={styles.habitItem}>✓ {h}</Text>
                    ))}
                  </View>
                )}
              </Pressable>
            ))}

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: MODES.find(m => m.id === selectedMode)!.color }]}
              onPress={() => setStep('permissions')}
            >
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
              Colors={Colors}
              Typography={Typography}
              Spacing={Spacing}
              Radius={Radius}
            />
            <PermissionRow
              IconComponent={Bell}
              title="Notifications"
              description="Rappels de prières, Moment d'Or, et incitations bienveillantes."
              granted={notifGranted}
              onRequest={handleRequestNotifications}
              Colors={Colors}
              Typography={Typography}
              Spacing={Spacing}
              Radius={Radius}
            />

            <View style={styles.skipNote}>
              <Text style={styles.skipNoteText}>
                Ces autorisations sont recommandées mais pas obligatoires.
                Tu peux les activer plus tard dans les réglages.
              </Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => setStep('ready')}>
              <Text style={styles.primaryBtnText}>
                {locGranted && notifGranted ? 'Tout est prêt →' : 'Passer →'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP: READY ───────────────────────────────── */}
        {step === 'ready' && (
          <View style={styles.stepContainer}>
            <View style={{ alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.md }}>
              <Zap color={Colors.gold} size={64} strokeWidth={1} />
            </View>
            <Text style={styles.heroTitle}>Prêt.</Text>
            <Text style={styles.readyBody}>
              Ta première journée commence maintenant.{'\n\n'}
              Le Strict Minimum n'est pas un plafond — c'est le sol.
              Ce que tu bâtis au-dessus appartient à ta volonté.
            </Text>

            <View style={styles.summaryBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, justifyContent: 'center' }}>
                {React.createElement(MODES.find(m => m.id === selectedMode)!.IconComponent, { color: Colors.gold, size: 24 })}
                <Text style={styles.summaryTitle}>
                  {MODES.find(m => m.id === selectedMode)!.title}
                </Text>
              </View>
              <Text style={styles.summarySubtitle}>
                {MODES.find(m => m.id === selectedMode)!.subtitle}
              </Text>
            </View>

            <Pressable style={[styles.primaryBtn, { backgroundColor: Colors.gold }]} onPress={handleFinish}>
              <Text style={[styles.primaryBtnText, { color: Colors.bg.primary }]}>
                Bismillah — Commencer
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Step indicator */}
      <View style={styles.stepDots}>
        {(['welcome', 'mode', 'permissions', 'ready'] as Step[]).map(s => (
          <View
            key={s}
            style={[styles.dot, step === s && styles.dotActive]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}


function PermissionRow({ IconComponent, title, description, granted, onRequest, Colors, Typography, Spacing, Radius }: {
  IconComponent: any; title: string; description: string;
  granted: boolean; onRequest: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  return (
    <View style={styles.permRow}>
      <IconComponent color={Colors.text.primary} size={26} />
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{description}</Text>
      </View>
      {granted ? (
        <Text style={styles.permGranted}>✓ Accordé</Text>
      ) : (
        <Pressable style={styles.permBtn} onPress={onRequest}>
          <Text style={styles.permBtnText}>Autoriser</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flexGrow: 1, padding: Spacing.lg, paddingBottom: 80 },

  stepContainer: { flex: 1, gap: Spacing.md },

  heroTitle: {
    fontSize: 40, fontWeight: Typography.weights.heavy,
    color: Colors.text.primary, textAlign: 'center',
  },
  heroAr: {
    fontSize: Typography.sizes.xxl, color: Colors.gold,
    textAlign: 'center', marginTop: -Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.lg, color: Colors.text.secondary,
    textAlign: 'center', lineHeight: 26, marginTop: Spacing.sm,
  },
  principleBox: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    marginTop: Spacing.sm,
  },
  principleText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  principleRef: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },

  stepTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },

  modeCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  modeHeader: { flexDirection: 'row', alignItems: 'center' },
  modeTitle: {
    fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  modeSubtitle: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  habitsList: { marginTop: Spacing.md, gap: Spacing.xs, paddingLeft: Spacing.sm },
  habitItem: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20 },

  primaryBtn: {
    backgroundColor: Colors.pillar.spiritual,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },

  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  permTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  permDesc: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2, lineHeight: 16 },
  permGranted: { fontSize: Typography.sizes.sm, color: Colors.success, fontWeight: Typography.weights.bold },
  permBtn: {
    backgroundColor: Colors.pillar.spiritual + '33',
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.pillar.spiritual,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm,
  },
  permBtnText: { fontSize: Typography.sizes.xs, color: Colors.pillar.spiritual, fontWeight: Typography.weights.bold },
  skipNote: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  skipNoteText: { fontSize: Typography.sizes.xs, color: Colors.text.muted, lineHeight: 18 },

  readyBody: {
    fontSize: Typography.sizes.md, color: Colors.text.secondary,
    lineHeight: 24, textAlign: 'center', marginTop: Spacing.md,
  },
  summaryBox: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', gap: Spacing.xs,
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  summaryTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.gold },
  summarySubtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, textAlign: 'center' },

  stepDots: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.gold, width: 20 },
});
