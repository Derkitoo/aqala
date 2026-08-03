import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme, type ThemeColors, Typography, Spacing, Radius } from '../constants/theme';
import { SOCIAL_CATEGORIES, type SocialCategory } from '../constants/pillars';
import { FocusTimer } from '../components/FocusTimer';
import { useDayStore } from '../store/useDayStore';
import { Users, Heart, MessageCircle, ChevronRight, CheckCircle, Handshake } from 'lucide-react-native';

type Phase = 'overview' | 'select' | 'timer' | 'note' | 'done';

export function PillarSocialScreen() {
  const { today, completeSocialInteraction } = useDayStore();
  const s = today.social;

  const [phase, setPhase] = useState<Phase>(s.completedAt ? 'done' : 'overview');
  const [selectedCategory, setSelectedCategory] = useState<SocialCategory | null>(s.category);
  const [duration, setDuration] = useState(0);
  const [note, setNote] = useState(s.noteText ?? '');

  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

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
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm}}>
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
            <Pressable style={styles.startBtn} onPress={() => setPhase('select')}>
              <Text style={styles.startBtnText}>Commencer l'interaction réelle</Text>
              <Text style={styles.startBtnSub}>20 minutes minimum • Face-à-face uniquement</Text>
            </Pressable>
          )}

          {/* Category select */}
          {phase === 'select' && (
            <>
              <Text style={styles.phaseLabel}>Avec qui ? Dans quel cadre ?</Text>
              {(Object.keys(SOCIAL_CATEGORIES) as SocialCategory[]).map(cat => {
                const { label, description } = SOCIAL_CATEGORIES[cat];
                let TypeIcon = Users;
                if (cat === 'family') TypeIcon = Heart;
                if (cat === 'service') TypeIcon = Handshake;
                if (cat === 'community') TypeIcon = MessageCircle;

                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.catCard,
                      selectedCategory === cat && { borderColor: Colors.pillar.social },
                    ]}
                    onPress={() => { setSelectedCategory(cat); setPhase('timer'); }}
                  >
                    <TypeIcon size={24} color={Colors.text.primary} />
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

          {/* Timer */}
          {phase === 'timer' && (
            <>
              <View style={styles.categoryBadge}>
                <Users size={16} color={Colors.pillar.social} />
                <Text style={styles.categoryBadgeText}>{SOCIAL_CATEGORIES[selectedCategory!].label}</Text>
              </View>
              <Text style={styles.timerNote}>
                Pose le téléphone maintenant. Reviens valider quand tu as terminé.
              </Text>
              <FocusTimer
                mode="social"
                onComplete={handleTimerComplete}
                onCancel={() => setPhase('select')}
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

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 100 },
  title: { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.heavy, color: Colors.pillar.social, marginBottom: 4 },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.lg },

  ruleBox: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.pillar.social,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ruleTitleText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: Spacing.sm },
  ruleBody: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, lineHeight: 20 },

  startBtn: {
    backgroundColor: Colors.pillar.social,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  startBtnText: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.white },
  startBtnSub: { fontSize: Typography.sizes.xs, color: Colors.white + 'aa', marginTop: 4 },

  phaseLabel: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text.primary, marginBottom: Spacing.md },
  catCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'transparent', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
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

  timerNote: { fontSize: Typography.sizes.sm, color: Colors.text.secondary, marginBottom: Spacing.md, fontStyle: 'italic' },

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

  doneCard: { alignItems: 'center', gap: Spacing.sm, backgroundColor: 'transparent', borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  doneTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.heavy, color: Colors.success },
  doneSub: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  doneNoteBox: { backgroundColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, width: '100%' },
  doneNoteText: { fontSize: Typography.sizes.md, color: Colors.text.primary, fontStyle: 'italic' },
  doneQuote: { fontSize: Typography.sizes.xs, color: Colors.gold, textAlign: 'center', fontStyle: 'italic', marginTop: Spacing.sm },
});
