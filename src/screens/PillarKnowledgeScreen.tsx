import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScaledTheme, cardShadow, ThemeColors, type TypographyShape, type SpacingShape, type RadiusShape } from '../constants/theme';
import {
  KNOWLEDGE_CATEGORIES, KNOWLEDGE_GUIDE_INTRO, pickKnowledgeSuggestions,
  type KnowledgeCategory, type KnowledgeSuggestion,
} from '../constants/pillars';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import { BookOpen, CheckCircle, ChevronRight, Info, Shuffle, Lightbulb } from 'lucide-react-native';

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

  const { Colors, Typography, Spacing, Radius } = useScaledTheme();
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);

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
          <Text style={styles.title}>📖 Pilier du Savoir</Text>
          <Text style={styles.subtitle}>طلب العلم — Talab al-'Ilm</Text>

          {/* PHASE: Select category */}
          {phase === 'select' && (
            <View>
              <Text style={styles.phaseLabel}>Quel type de savoir aujourd'hui ?</Text>
              {(Object.keys(KNOWLEDGE_CATEGORIES) as KnowledgeCategory[]).map(cat => {
                const { label, bonusPoints } = KNOWLEDGE_CATEGORIES[cat];
                return (
                  <CategoryCard
                    key={cat}
                    icon={<BookOpen size={28} color={Colors.text.primary} />}
                    label={label}
                    bonus={bonusPoints > 0 ? `+${bonusPoints} pts bonus` : undefined}
                    onPress={() => handleCategorySelect(cat)}
                    Colors={Colors}
                    Typography={Typography}
                    Spacing={Spacing}
                    Radius={Radius}
                  />
                );
              })}
              <Text style={styles.rule}>
                <Info size={14} color={Colors.text.muted} style={{marginRight: 4}} /> Minimum : 15 minutes • Une ligne de résumé obligatoire
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
              Radius={Radius}
            />
          )}

          {/* PHASE: Focus timer */}
          {phase === 'focus' && selectedCategory && (
            <View>
              <View style={styles.categoryBadge}>
                <BookOpen size={16} color={Colors.pillar.knowledge} />
                <Text style={styles.categoryBadgeText}>{KNOWLEDGE_CATEGORIES[selectedCategory].label}</Text>
              </View>
              <FocusTimer
                mode="focus"
                onComplete={handleSessionComplete}
                onCancel={() => { cancelKnowledgeSession(); setSelectedCategory(null); setPhase('select'); }}
              />
            </View>
          )}

          {/* PHASE: Write note */}
          {phase === 'note' && (
            <View style={styles.notePhase}>
              <Text style={styles.phaseLabel}>Qu'as-tu appris ?</Text>
              <Text style={styles.noteInstruction}>
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
              <View style={styles.noteSubmitRow}>
                <Text style={styles.noteHint}>• Durée : {Math.round(sessionDuration / 60)} min</Text>
                <CategoryButton
                  label="Valider ✓"
                  onPress={handleNoteSubmit}
                  disabled={!note.trim()}
                  styles={styles}
                />
              </View>
            </View>
          )}

          {/* PHASE: Done */}
          {phase === 'done' && (
            <View style={styles.doneCard}>
              <CheckCircle size={48} color={Colors.success} />
              <Text style={styles.doneTitle}>Session validée</Text>
              <Text style={styles.doneSession}>
                {Math.round(k.sessionDurationSeconds / 60)} min • {KNOWLEDGE_CATEGORIES[k.category ?? 'estikhlaf'].label}
              </Text>
              <View style={styles.doneNoteBox}>
                <Text style={styles.doneNoteLabel}>Ta leçon du jour :</Text>
                <Text style={styles.doneNoteText}>"{k.noteText}"</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CategoryCard({ icon, label, bonus, onPress, Colors, Typography, Spacing, Radius }: {
  icon: React.ReactNode; label: string; bonus?: string; onPress: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  return (
    <Pressable style={styles.catCard} onPress={onPress}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={styles.catLabel}>{label}</Text>
        {bonus && <Text style={styles.catBonus}>{bonus}</Text>}
      </View>
      <ChevronRight size={24} color={Colors.text.muted} />
    </Pressable>
  );
}

function KnowledgeGuide({ category, onStart, onBack, Colors, Typography, Spacing, Radius }: {
  category: KnowledgeCategory; onStart: () => void; onBack: () => void; Colors: ThemeColors;
  Typography: TypographyShape; Spacing: SpacingShape; Radius: RadiusShape;
}) {
  const styles = React.useMemo(() => createStyles(Colors, Typography, Spacing, Radius), [Colors, Typography, Spacing, Radius]);
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>(() => pickKnowledgeSuggestions(category));

  return (
    <View>
      <View style={styles.categoryBadge}>
        <BookOpen size={16} color={Colors.pillar.knowledge} />
        <Text style={styles.categoryBadgeText}>{KNOWLEDGE_CATEGORIES[category].label}</Text>
      </View>

      <Text style={styles.guideIntro}>{KNOWLEDGE_GUIDE_INTRO[category]}</Text>

      <View style={styles.guideHeaderRow}>
        <Text style={styles.phaseLabel}>Quelques pistes</Text>
        <Pressable style={styles.shuffleBtn} onPress={() => setSuggestions(pickKnowledgeSuggestions(category))}>
          <Shuffle size={14} color={Colors.pillar.knowledge} />
          <Text style={styles.shuffleBtnText}>Autres pistes</Text>
        </Pressable>
      </View>

      {suggestions.map((s, i) => (
        <View key={i} style={styles.suggestionCard}>
          <Lightbulb size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestionTitle}>{s.title}</Text>
            <Text style={styles.suggestionDesc}>{s.description}</Text>
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
        <CategoryButton label="C'est parti — Lancer le chronomètre" onPress={onStart} styles={styles} />
      </View>
    </View>
  );
}

function CategoryButton({ label, onPress, disabled, styles }: {
  label: string; onPress: () => void; disabled?: boolean; styles: any;
}) {
  return (
    <Pressable
      style={[styles.submitBtn, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.submitBtnText}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: ThemeColors, Typography: TypographyShape, Spacing: SpacingShape, Radius: RadiusShape) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },

  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: Colors.pillar.knowledge,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  phaseLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...cardShadow(Colors),
  },
  catLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  catBonus: { fontSize: Typography.sizes.xs, color: Colors.gold, marginTop: 2 },

  rule: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.pillar.knowledge + '22',
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryBadgeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.pillar.knowledge,
    fontWeight: Typography.weights.semibold,
  },

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
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shuffleBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.pillar.knowledge,
    fontWeight: Typography.weights.semibold,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...cardShadow(Colors),
  },
  suggestionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  suggestionDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 17,
  },
  guideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  backBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  backText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },

  notePhase: { marginTop: Spacing.md },
  noteInstruction: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  noteInput: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
  },
  noteCounter: {
    textAlign: 'right',
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    marginTop: 4,
  },
  noteSubmitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  noteHint: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  submitBtn: {
    backgroundColor: Colors.pillar.knowledge,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  submitBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.bg.primary,
  },

  doneCard: {
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...cardShadow(Colors),
  },
  doneTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    color: Colors.success,
  },
  doneSession: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  doneNoteBox: {
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
    marginTop: Spacing.sm,
  },
  doneNoteLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  doneNoteText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
