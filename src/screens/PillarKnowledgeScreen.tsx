import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from '../constants/pillars';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import { BookOpen, CheckCircle, ChevronRight, Info } from 'lucide-react-native';

type Phase = 'select' | 'focus' | 'note' | 'done';

export function PillarKnowledgeScreen() {
  const { today, startKnowledgeSession, completeKnowledgeSession } = useDayStore();
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

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  const handleCategorySelect = (cat: KnowledgeCategory) => {
    setSelectedCategory(cat);
    startKnowledgeSession(cat);
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
                    icon={<BookOpen size={28} color={Colors.white} />}
                    label={label}
                    bonus={bonusPoints > 0 ? `+${bonusPoints} pts bonus` : undefined}
                    onPress={() => handleCategorySelect(cat)}
                    Colors={Colors}
                  />
                );
              })}
              <Text style={styles.rule}>
                <Info size={14} color={Colors.text.muted} style={{marginRight: 4}} /> Minimum : 15 minutes • Une ligne de résumé obligatoire
              </Text>
            </View>
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
                onCancel={() => setPhase('select')}
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

function CategoryCard({ icon, label, bonus, onPress, Colors }: {
  icon: React.ReactNode; label: string; bonus?: string; onPress: () => void; Colors: ThemeColors;
}) {
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
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

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
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
