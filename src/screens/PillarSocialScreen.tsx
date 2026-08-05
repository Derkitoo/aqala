import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useScaledTheme, type ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import {
  PILLARS, SOCIAL_CATEGORIES, SOCIAL_GUIDE_INTRO, pickSocialSuggestions,
  type SocialCategory, type SocialSuggestion,
} from '../constants/pillars';
import { computeSocialBalance } from '../engine/trends';
import { FocusTimer } from '../components/FocusTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useDayStore } from '../store/useDayStore';
import { Heart, MessageCircle, Handshake, Shuffle, Check } from 'lucide-react-native';

type Phase = 'overview' | 'select' | 'guide' | 'timer' | 'note' | 'done';

const CATEGORY_ICONS: Record<SocialCategory, any> = {
  family: Heart,
  service: Handshake,
  community: MessageCircle,
};

function computeInitialElapsed(startedAt: string | null): number {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export function PillarSocialScreen() {
  const { today, history, startSocialInteraction, cancelSocialInteraction, completeSocialInteraction } = useDayStore();
  const s = today.social;

  const [phase, setPhase] = useState<Phase>(
    s.completedAt ? 'done' :
    s.interactionStartedAt ? 'timer' :
    'overview',
  );
  const [selectedCategory, setSelectedCategory] = useState<SocialCategory | null>(s.category);
  const [duration, setDuration] = useState(0);
  const [note, setNote] = useState(s.noteText ?? '');

  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  const balance = useMemo(() => computeSocialBalance(today, history), [today, history]);

  const handleCategorySelect = (cat: SocialCategory) => {
    setSelectedCategory(cat);
    setPhase('guide');
  };

  const handleStartTimer = () => {
    if (!selectedCategory) return;
    startSocialInteraction(selectedCategory);
    setPhase('timer');
  };

  const handleCancelTimer = () => {
    cancelSocialInteraction();
    setSelectedCategory(null);
    setPhase('select');
  };

  const handleTimerComplete = (durationSeconds: number) => {
    setDuration(durationSeconds);
    setPhase('note');
  };

  const handleSubmit = () => {
    if (!selectedCategory) return;
    completeSocialInteraction(selectedCategory, duration, note.trim());
    setPhase('done');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            kicker={`PILIER · ${PILLARS.social.numeral}`}
            title="Pilier Social"
            subtitle="العمل الاجتماعي — Al-'Amal al-Ijtima'i"
          />

          {/* Rule block — always visible, left accent rule */}
          <View style={styles.ruleBox}>
            <Text style={styles.ruleTitleText}>Règle d'or du Lien Social</Text>
            <Text style={styles.ruleBody}>
              "Celui qui ne remercie pas les gens ne remercie pas Allah." (Tirmidhi)
            </Text>
            <Text style={styles.ruleBodyStrong}>
              Ta présence physique est la seule unité de mesure valable.
            </Text>
          </View>

          {/* Overview */}
          {phase === 'overview' && (
            <>
              <SocialBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} />
              <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => setPhase('select')}>
                <Text style={styles.primaryBtnText}>Commencer l'interaction réelle</Text>
                <Text style={styles.primaryBtnSub}>20 minutes minimum • Face-à-face uniquement</Text>
              </Pressable>
            </>
          )}

          {/* Category select — segmented buttons */}
          {phase === 'select' && (
            <>
              <Text style={styles.introText}>Avec qui ? Dans quel cadre ?</Text>
              <View style={styles.segRow}>
                {(Object.keys(SOCIAL_CATEGORIES) as SocialCategory[]).map(cat => {
                  const active = selectedCategory === cat;
                  const TypeIcon = CATEGORY_ICONS[cat];
                  return (
                    <Pressable
                      key={cat}
                      style={({ pressed }) => [styles.seg, active && styles.segActive, pressed && styles.pressed]}
                      onPress={() => handleCategorySelect(cat)}
                    >
                      <TypeIcon size={14} strokeWidth={1.8} color={active ? Colors.bg.primary : Colors.text.primary} />
                      <Text style={[styles.segText, active && styles.segTextActive]}>
                        {SOCIAL_CATEGORIES[cat].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {(Object.keys(SOCIAL_CATEGORIES) as SocialCategory[]).map(cat => (
                <Text key={cat} style={styles.catDescRow}>
                  <Text style={styles.catDescName}>{SOCIAL_CATEGORIES[cat].label}</Text>
                  {' — '}{SOCIAL_CATEGORIES[cat].description}
                </Text>
              ))}
            </>
          )}

          {/* Guide — suggestions before starting the timer */}
          {phase === 'guide' && selectedCategory && (
            <SocialGuide
              category={selectedCategory}
              onStart={handleStartTimer}
              onBack={() => setPhase('select')}
              Colors={Colors} Typography={Typography} Spacing={Spacing}
            />
          )}

          {/* Timer */}
          {phase === 'timer' && selectedCategory && (
            <>
              <Text style={styles.categoryTag}>{SOCIAL_CATEGORIES[selectedCategory].label}</Text>
              <Text style={styles.introText}>
                Pose le téléphone maintenant. Reviens valider quand tu as terminé.
              </Text>
              <FocusTimer
                mode="social"
                initialElapsedSeconds={computeInitialElapsed(s.interactionStartedAt)}
                onComplete={handleTimerComplete}
                onCancel={handleCancelTimer}
              />
            </>
          )}

          {/* Note */}
          {phase === 'note' && (
            <View>
              <Text style={styles.sectionKickerTop}>AVEC QUI ? QU'AS-TU FAIT ?</Text>
              <View style={styles.hr} />
              <Text style={styles.introText}>Une ligne — pour ancrer la mémoire de ce moment.</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Ex : Assis avec ma mère, lui ai cuisiné le repas..."
                placeholderTextColor={Colors.text.muted}
                value={note}
                onChangeText={setNote}
                multiline={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, !note.trim() && styles.disabled, pressed && styles.pressed]}
                onPress={handleSubmit}
                disabled={!note.trim()}
              >
                <Text style={styles.primaryBtnText}>Valider l'interaction ✓</Text>
              </Pressable>
            </View>
          )}

          {/* Done */}
          {phase === 'done' && (
            <View style={styles.doneBlock}>
              <View style={styles.doneHeaderRow}>
                <Check size={18} color={Colors.gold} strokeWidth={2.4} />
                <Text style={styles.doneTitle}>Interaction validée</Text>
              </View>
              <Text style={styles.doneSub}>
                {SOCIAL_CATEGORIES[s.category ?? 'family'].label} •{' '}
                {Math.round(s.interactionDurationSeconds / 60)} min
              </Text>
              <Text style={styles.doneNoteText}>"{s.noteText}"</Text>
              <Text style={styles.doneQuote}>
                "Le meilleur des hommes est celui qui est le plus utile aux autres."
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialBalanceCard({ balance, Colors, Typography, Spacing }: {
  balance: ReturnType<typeof computeSocialBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceKicker}>CETTE SEMAINE</Text>
      <View style={styles.balanceRow}>
        {balance.entries.map(e => (
          <View key={e.category} style={styles.balanceItem}>
            <Text style={styles.balanceCount}>{e.count}</Text>
            <Text style={styles.balanceLabel}>{e.label}</Text>
          </View>
        ))}
      </View>
      {balance.neglectedCategory && (
        <Text style={styles.balanceNudge}>
          Tu n'as pas encore fait de <Text style={styles.balanceNudgeStrong}>{balance.neglectedCategory.label}</Text> cette semaine.
        </Text>
      )}
    </View>
  );
}

function SocialGuide({ category, onStart, onBack, Colors, Typography, Spacing }: {
  category: SocialCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const [suggestions, setSuggestions] = useState<SocialSuggestion[]>(() => pickSocialSuggestions(category));

  return (
    <View>
      <Text style={styles.categoryTag}>{SOCIAL_CATEGORIES[category].label}</Text>

      <Text style={styles.introText}>{SOCIAL_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.sectionKickerFlush}>PISTES SUGGÉRÉES</Text>
        <Pressable
          style={({ pressed }) => [styles.shuffleBtn, pressed && styles.pressed]}
          onPress={() => setSuggestions(pickSocialSuggestions(category))}
        >
          <Shuffle size={14} color={Colors.gold} strokeWidth={1.8} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>
      <View style={styles.hr} />

      {suggestions.map((sug, i) => (
        <View key={i} style={styles.suggestionRow}>
          <Text style={styles.suggestionTitle}>{sug.title}</Text>
          <Text style={styles.suggestionDesc}>{sug.description}</Text>
        </View>
      ))}

      <Text style={styles.rule}>
        Libre à toi de suivre ton propre sujet — ces pistes sont là pour t'aider à démarrer.
      </Text>

      <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={onStart}>
        <Text style={styles.primaryBtnText}>C'est parti — Lancer le chronomètre</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]} onPress={onBack}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: Spacing.md + 4, paddingTop: Spacing.sm, paddingBottom: 120 },

  pressed: { opacity: 0.55 },
  disabled: { opacity: 0.35 },

  sectionKickerTop: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionKickerFlush: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
  },
  hr: { height: 2, backgroundColor: Colors.border, marginBottom: 14 },

  ruleBox: {
    backgroundColor: Colors.bg.card,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
    padding: Spacing.md,
    marginBottom: 6,
  },
  ruleTitleText: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  ruleBody: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.sm * 1.5,
    fontStyle: 'italic',
  },
  ruleBodyStrong: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
    lineHeight: Typography.sizes.sm * 1.5,
    marginTop: Spacing.sm,
  },

  balanceCard: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.md,
    marginTop: 6,
    marginBottom: Spacing.xs,
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
  },
  balanceNudge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    lineHeight: Typography.sizes.xs * 1.5,
  },
  balanceNudgeStrong: { fontFamily: Typography.fonts.heavy },

  introText: {
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.sm + 0.5) * 1.55,
    marginBottom: 18,
  },

  segRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: 14 },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  segActive: { borderColor: Colors.gold, backgroundColor: Colors.gold },
  segText: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  segTextActive: { color: Colors.bg.primary },

  catDescRow: {
    fontSize: Typography.sizes.xs + 1,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    lineHeight: (Typography.sizes.xs + 1) * 1.5,
  },
  catDescName: { fontFamily: Typography.fonts.heavy, color: Colors.text.primary },

  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },

  guideHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 10,
  },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shuffleBtnText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },

  suggestionRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 14,
  },
  suggestionTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.primary,
  },
  suggestionDesc: {
    fontSize: Typography.sizes.xs + 1.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    lineHeight: (Typography.sizes.xs + 1.5) * 1.5,
  },

  rule: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    lineHeight: Typography.sizes.xs * 1.5,
  },

  noteInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    minHeight: 56,
  },

  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    paddingHorizontal: 18,
    marginTop: Spacing.md,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heavy,
    color: Colors.bg.primary,
  },
  primaryBtnSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.bg.primary,
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  backBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  backText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
  },

  doneBlock: {
    borderTopWidth: 2,
    borderTopColor: Colors.gold,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  doneHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heavy,
    color: Colors.gold,
  },
  doneSub: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  doneNoteText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.md * 1.5,
    marginTop: Spacing.md,
  },
  doneQuote: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    lineHeight: Typography.sizes.xs * 1.5,
  },
});
