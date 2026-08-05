import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { useScaledTheme, ThemeColors, type TypographyShape, type SpacingShape } from '../constants/theme';
import {
  PILLARS, KNOWLEDGE_CATEGORIES, KNOWLEDGE_GUIDE_INTRO, pickKnowledgeSuggestions,
  type KnowledgeCategory, type KnowledgeSuggestion,
} from '../constants/pillars';
import { FocusTimer } from '../components/FocusTimer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useDayStore } from '../store/useDayStore';
import { Check, Shuffle } from 'lucide-react-native';

type Phase = 'select' | 'guide' | 'focus' | 'note' | 'done';

export function PillarKnowledgeScreen() {
  const { today, startKnowledgeSession, cancelKnowledgeSession, completeKnowledgeSession } = useDayStore();
  const k = today.knowledge;

  const [phase, setPhase] = useState<Phase>(
    k.sessionCompletedAt ? 'done' :
    k.sessionStartedAt   ? 'focus' :
    'select',
  );
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(k.category);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [note, setNote] = useState(k.noteText);

  useEffect(() => {
    if (k.sessionCompletedAt) {
      setPhase('done');
      setNote(k.noteText || '');
    }
  }, [k.sessionCompletedAt, k.noteText]);

  const { Colors, Typography, Spacing } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);

  const handleCategorySelect = (cat: KnowledgeCategory) => {
    setSelectedCategory(cat);
    setPhase('guide');
  };

  const handleStartFocus = () => {
    if (!selectedCategory) return;
    startKnowledgeSession(selectedCategory);
    setPhase('focus');
  };

  const handleSessionComplete = (durationSeconds: number) => {
    setSessionDuration(durationSeconds);
    setPhase('note');
  };

  const handleNoteSubmit = () => {
    if (!note.trim()) return;
    completeKnowledgeSession(sessionDuration, note.trim());
    setPhase('done');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            kicker={`PILIER · ${PILLARS.knowledge.numeral}`}
            title="Pilier du Savoir"
            subtitle="طلب العلم — Talab al-'Ilm"
          />

          {/* PHASE: Select category — segmented buttons, not cards */}
          {phase === 'select' && (
            <View>
              <Text style={styles.introText}>Quel type de savoir aujourd'hui ?</Text>
              <View style={styles.segRow}>
                {(Object.keys(KNOWLEDGE_CATEGORIES) as KnowledgeCategory[]).map(cat => {
                  const active = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={({ pressed }) => [styles.seg, active && styles.segActive, pressed && styles.pressed]}
                      onPress={() => handleCategorySelect(cat)}
                    >
                      <Text style={[styles.segText, active && styles.segTextActive]}>
                        {KNOWLEDGE_CATEGORIES[cat].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {(Object.keys(KNOWLEDGE_CATEGORIES) as KnowledgeCategory[]).some(c => KNOWLEDGE_CATEGORIES[c].bonusPoints > 0) && (
                <Text style={styles.bonusNote}>
                  Savoir de la Révélation : +{KNOWLEDGE_CATEGORIES.revelation.bonusPoints} pts bonus
                </Text>
              )}
              <Text style={styles.rule}>
                Minimum : 15 minutes • Une ligne de résumé obligatoire
              </Text>
            </View>
          )}

          {/* PHASE: Guide — suggestions before starting the timer */}
          {phase === 'guide' && selectedCategory && (
            <KnowledgeGuide
              category={selectedCategory}
              onStart={handleStartFocus}
              onBack={() => setPhase('select')}
              Colors={Colors}
              Typography={Typography}
              Spacing={Spacing}
            />
          )}

          {/* PHASE: Focus timer */}
          {phase === 'focus' && selectedCategory && (
            <View>
              <Text style={styles.categoryTag}>{KNOWLEDGE_CATEGORIES[selectedCategory].label}</Text>
              <FocusTimer
                mode="focus"
                onComplete={handleSessionComplete}
                onCancel={() => { cancelKnowledgeSession(); setSelectedCategory(null); setPhase('select'); }}
              />
            </View>
          )}

          {/* PHASE: Write note */}
          {phase === 'note' && (
            <View>
              <Text style={styles.sectionKicker}>QU'AS-TU APPRIS ?</Text>
              <View style={styles.hr} />
              <Text style={styles.introText}>
                Écris une seule ligne. Sois concis — la synthèse, c'est déjà du savoir.
              </Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Ta nouvelle information du jour..."
                placeholderTextColor={Colors.text.muted}
                value={note}
                onChangeText={setNote}
                multiline={false}
                maxLength={200}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleNoteSubmit}
              />
              <Text style={styles.noteCounter}>{note.length}/200</Text>
              <Text style={styles.noteHint}>Durée : {Math.round(sessionDuration / 60)} min</Text>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, !note.trim() && styles.disabled, pressed && styles.pressed]}
                onPress={handleNoteSubmit}
                disabled={!note.trim()}
              >
                <Text style={styles.primaryBtnText}>Valider ✓</Text>
              </Pressable>
            </View>
          )}

          {/* PHASE: Done */}
          {phase === 'done' && (
            <View style={styles.doneBlock}>
              <View style={styles.doneHeaderRow}>
                <Check size={18} color={Colors.gold} strokeWidth={2.4} />
                <Text style={styles.doneTitle}>Session validée</Text>
              </View>
              <Text style={styles.doneSession}>
                {Math.round(k.sessionDurationSeconds / 60)} min • {KNOWLEDGE_CATEGORIES[k.category ?? 'estikhlaf'].label}
              </Text>
              <Text style={styles.doneNoteLabel}>TA LEÇON DU JOUR</Text>
              <Text style={styles.doneNoteText}>"{k.noteText}"</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function KnowledgeGuide({ category, onStart, onBack, Colors, Typography, Spacing }: {
  category: KnowledgeCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing), [Colors, Typography, Spacing]);
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>(() => pickKnowledgeSuggestions(category));

  return (
    <View>
      <Text style={styles.categoryTag}>{KNOWLEDGE_CATEGORIES[category].label}</Text>

      <Text style={styles.introText}>{KNOWLEDGE_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.sectionKickerFlush}>PISTES SUGGÉRÉES</Text>
        <Pressable
          style={({ pressed }) => [styles.shuffleBtn, pressed && styles.pressed]}
          onPress={() => setSuggestions(pickKnowledgeSuggestions(category))}
        >
          <Shuffle size={14} color={Colors.gold} strokeWidth={1.8} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>
      <View style={styles.hr} />

      {suggestions.map((s, i) => (
        <View key={i} style={styles.suggestionRow}>
          <Text style={styles.suggestionTitle}>{s.title}</Text>
          <Text style={styles.suggestionDesc}>{s.description}</Text>
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

  sectionKicker: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    textTransform: 'uppercase',
    marginTop: 28,
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

  introText: {
    fontSize: Typography.sizes.sm + 0.5,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    lineHeight: (Typography.sizes.sm + 0.5) * 1.55,
    marginBottom: 18,
  },

  // Segmented buttons: 1px border, solid accent fill + inverse text when active.
  segRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.xs },
  seg: {
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

  // Square solid-accent tag — replaces the old rounded tinted pill badge.
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
  bonusNote: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.gold,
    marginTop: Spacing.sm,
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
  noteCounter: {
    textAlign: 'right',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  noteHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
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
  doneSession: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  doneNoteLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.heavy,
    color: Colors.text.secondary,
    letterSpacing: Typography.sizes.xs * 0.12,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  doneNoteText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.md * 1.5,
  },
});
