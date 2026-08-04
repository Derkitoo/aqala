import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useScaledTheme, cardShadow, type ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import {
  SOCIAL_CATEGORIES, SOCIAL_GUIDE_INTRO, pickSocialSuggestions,
  type SocialCategory, type SocialSuggestion,
} from '../constants/pillars';
import { computeSocialBalance } from '../engine/trends';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import {
  Users, Heart, MessageCircle, ChevronRight, CheckCircle, Handshake,
  Shuffle, Lightbulb, CalendarRange,
} from 'lucide-react-native';

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

  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

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
          <Text style={styles.title}>👥 Pilier Social</Text>
          <Text style={styles.subtitle}>العمل الاجتماعي — Al-'Amal al-Ijtima'i</Text>

          {/* Rule box — always visible */}
          <View style={styles.ruleBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm }}>
              <Handshake size={20} color={Colors.pillar.social} />
              <Text style={styles.ruleTitleText}>Règle d'or du Lien Social</Text>
            </View>
            <Text style={styles.ruleBody}>
              "Celui qui ne remercie pas les gens ne remercie pas Allah." (Tirmidhi)
            </Text>
            <Text style={[styles.ruleBody, { marginTop: Spacing.sm, fontWeight: 'bold' }]}>
              Ta présence physique est la seule unité de mesure valable.
            </Text>
          </View>

          {/* Overview */}
          {phase === 'overview' && (
            <>
              <SocialBalanceCard balance={balance} Colors={Colors} Typography={Typography} Spacing={Spacing} Radius={Radius} />
              <Pressable style={styles.startBtn} onPress={() => setPhase('select')}>
                <Text style={styles.startBtnText}>Commencer l'interaction réelle</Text>
                <Text style={styles.startBtnSub}>20 minutes minimum • Face-à-face uniquement</Text>
              </Pressable>
            </>
          )}

          {/* Category select */}
          {phase === 'select' && (
            <>
              <Text style={styles.phaseLabel}>Avec qui ? Dans quel cadre ?</Text>
              {(Object.keys(SOCIAL_CATEGORIES) as SocialCategory[]).map(cat => {
                const { label, description } = SOCIAL_CATEGORIES[cat];
                const TypeIcon = CATEGORY_ICONS[cat];

                return (
                  <Pressable
                    key={cat}
                    style={styles.catCard}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <View style={styles.catIconBadge}>
                      <TypeIcon size={22} color={Colors.pillar.social} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={styles.catLabel}>{label}</Text>
                      <Text style={styles.catDesc}>{description}</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.text.muted} />
                  </Pressable>
                );
              })}
            </>
          )}

          {/* Guide — suggestions before starting the timer */}
          {phase === 'guide' && selectedCategory && (
            <SocialGuide
              category={selectedCategory}
              onStart={handleStartTimer}
              onBack={() => setPhase('select')}
              Colors={Colors}
              Typography={Typography}
              Spacing={Spacing}
              Radius={Radius}
            />
          )}

          {/* Timer */}
          {phase === 'timer' && selectedCategory && (
            <>
              <View style={styles.categoryBadge}>
                <Users size={16} color={Colors.pillar.social} />
                <Text style={styles.categoryBadgeText}>{SOCIAL_CATEGORIES[selectedCategory].label}</Text>
              </View>
              <Text style={styles.timerNote}>
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
            <View style={styles.notePhase}>
              <Text style={styles.phaseLabel}>Avec qui ? Qu'as-tu fait ?</Text>
              <Text style={styles.noteHint}>Une ligne — pour ancrer la mémoire de ce moment.</Text>
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
                style={[styles.submitBtn, !note.trim() && { opacity: 0.4 }]}
                onPress={handleSubmit}
                disabled={!note.trim()}
              >
                <Text style={styles.submitBtnText}>Valider l'interaction ✓</Text>
              </Pressable>
            </View>
          )}

          {/* Done */}
          {phase === 'done' && (
            <View style={styles.doneCard}>
              <CheckCircle size={48} color={Colors.success} />
              <Text style={styles.doneTitle}>Interaction validée</Text>
              <Text style={styles.doneSub}>
                {SOCIAL_CATEGORIES[s.category ?? 'family'].label} •{' '}
                {Math.round(s.interactionDurationSeconds / 60)} min
              </Text>
              <View style={styles.doneNoteBox}>
                <Text style={styles.doneNoteText}>"{s.noteText}"</Text>
              </View>
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

function SocialBalanceCard({ balance, Colors, Typography, Spacing, Radius }: {
  balance: ReturnType<typeof computeSocialBalance>; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeaderRow}>
        <CalendarRange size={16} color={Colors.text.secondary} />
        <Text style={styles.balanceTitle}>Cette semaine</Text>
      </View>
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
          Tu n'as pas encore fait de <Text style={{ fontWeight: 'bold' }}>{balance.neglectedCategory.label}</Text> cette semaine.
        </Text>
      )}
    </View>
  );
}

function SocialGuide({ category, onStart, onBack, Colors, Typography, Spacing, Radius }: {
  category: SocialCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  const [suggestions, setSuggestions] = useState<SocialSuggestion[]>(() => pickSocialSuggestions(category));
  const TypeIcon = CATEGORY_ICONS[category];

  return (
    <View>
      <View style={styles.categoryBadge}>
        <TypeIcon size={16} color={Colors.pillar.social} />
        <Text style={styles.categoryBadgeText}>{SOCIAL_CATEGORIES[category].label}</Text>
      </View>

      <Text style={styles.guideIntro}>{SOCIAL_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.phaseLabel}>Quelques pistes</Text>
        <Pressable style={styles.shuffleBtn} onPress={() => setSuggestions(pickSocialSuggestions(category))}>
          <Shuffle size={14} color={Colors.pillar.social} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>

      {suggestions.map((sug, i) => (
        <View key={i} style={styles.suggestionCard}>
          <Lightbulb size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitle}>{sug.title}</Text>
            <Text style={styles.suggestionDesc}>{sug.description}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.rule}>
        Libre à toi de suivre ton propre sujet — ces pistes sont là pour t'aider à démarrer.
      </Text>

      <View style={styles.guideActions}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Pressable style={styles.guideStartBtn} onPress={onStart}>
          <Text style={styles.guideStartBtnText}>C'est parti — Lancer le chronomètre</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },
  title: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.heavy, color: Colors.pillar.social, marginBottom: 4 },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.lg },

  ruleBox: {
    backgroundColor: Colors.pillar.social + '12',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...cardShadow(Colors),
  },
  ruleTitleText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  ruleBody: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20 },

  balanceCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...cardShadow(Colors),
  },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  balanceTitle: {
    fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold,
    color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceItem: { alignItems: 'center' },
  balanceCount: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.heavy, color: Colors.pillar.social },
  balanceLabel: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  balanceNudge: {
    fontSize: Typography.sizes.xs, color: Colors.text.muted,
    marginTop: Spacing.sm, fontStyle: 'italic', textAlign: 'center',
  },

  startBtn: {
    backgroundColor: Colors.pillar.social,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  startBtnText: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.white },
  startBtnSub: { fontSize: Typography.sizes.xs, color: Colors.white + 'aa', marginTop: 4 },

  phaseLabel: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: Spacing.md },
  catCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.pillar.social + '0d', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    ...cardShadow(Colors),
  },
  catIconBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.pillar.social + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  catLabel: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  catDesc: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2 },
  arrow: { fontSize: Typography.sizes.xl, color: Colors.text.muted },

  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.pillar.social + '22', borderRadius: Radius.full,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start', marginBottom: Spacing.md,
  },
  categoryBadgeIcon: { fontSize: 16 },
  categoryBadgeText: { fontSize: Typography.sizes.sm, color: Colors.pillar.social, fontWeight: Typography.weights.semibold },

  guideIntro: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shuffleBtnText: { fontSize: Typography.sizes.xs, color: Colors.pillar.social, fontWeight: Typography.weights.semibold },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    ...cardShadow(Colors),
  },
  suggestionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: Colors.text.primary },
  suggestionDesc: { fontSize: Typography.sizes.xs, color: Colors.text.secondary, marginTop: 2, lineHeight: 17 },
  guideActions: { gap: Spacing.sm, marginTop: Spacing.md },
  backBtn: { alignSelf: 'center', paddingVertical: Spacing.sm },
  backText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  guideStartBtn: {
    backgroundColor: Colors.pillar.social, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  guideStartBtnText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.white },

  timerNote: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.md, fontStyle: 'italic' },

  rule: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  notePhase: { gap: Spacing.md },
  noteHint: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  noteInput: {
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, fontSize: Typography.sizes.md, color: Colors.text.primary,
    borderWidth: 1, borderColor: Colors.border, minHeight: 60,
  },
  submitBtn: {
    backgroundColor: Colors.pillar.social, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  submitBtnText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.bg.primary },

  doneCard: { alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.xl, ...cardShadow(Colors) },
  doneTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy, color: Colors.success },
  doneSub: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  doneNoteBox: { backgroundColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, width: '100%' },
  doneNoteText: { fontSize: Typography.sizes.md, color: Colors.text.primary, fontStyle: 'italic' },
  doneQuote: { fontSize: Typography.sizes.xs, color: Colors.gold, textAlign: 'center', fontStyle: 'italic', marginTop: Spacing.sm },
});
