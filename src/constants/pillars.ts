import { Colors } from './theme';
import { Heart, BookOpen, Activity, Users, Moon } from 'lucide-react-native';

export type PillarId = 'spiritual' | 'knowledge' | 'physical' | 'social' | 'sleep';

export interface PillarDefinition {
  id: PillarId;
  nameAr: string;
  nameFr: string;
  icon: any; // Lucide component
  color: string;
  colorLight: string;
  weight: number; // % of total Baraka score
  maxPoints: number;
}

export const PILLARS: Record<PillarId, PillarDefinition> = {
  spiritual: {
    id: 'spiritual',
    nameAr: 'الروحانية',
    nameFr: 'Pilier Spirituel',
    icon: Heart,
    color: Colors.pillar.spiritual,
    colorLight: Colors.pillar.spiritualLight,
    weight: 0.35,
    maxPoints: 35,
  },
  knowledge: {
    id: 'knowledge',
    nameAr: 'طلب العلم',
    nameFr: 'Pilier du Savoir',
    icon: BookOpen,
    color: Colors.pillar.knowledge,
    colorLight: Colors.pillar.knowledgeLight,
    weight: 0.25,
    maxPoints: 25,
  },
  physical: {
    id: 'physical',
    nameAr: 'الأمانة الجسدية',
    nameFr: 'Pilier Physique',
    icon: Activity,
    color: Colors.pillar.physical,
    colorLight: Colors.pillar.physicalLight,
    weight: 0.15,
    maxPoints: 15,
  },
  social: {
    id: 'social',
    nameAr: 'العمل الاجتماعي',
    nameFr: 'Pilier Social',
    icon: Users,
    color: Colors.pillar.social,
    colorLight: Colors.pillar.socialLight,
    weight: 0.15,
    maxPoints: 15,
  },
  sleep: {
    id: 'sleep',
    nameAr: 'الترويح',
    nameFr: 'Pilier Sommeil',
    icon: Moon,
    color: Colors.pillar.sleep,
    colorLight: Colors.pillar.sleepLight,
    weight: 0.10,
    maxPoints: 10,
  },
};

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYERS: { id: PrayerName; nameFr: string; nameAr: string; icon: string }[] = [
  { id: 'fajr',    nameFr: 'Fajr',    nameAr: 'الفجر',   icon: '🌟' },
  { id: 'dhuhr',   nameFr: 'Dhouhr',  nameAr: 'الظهر',   icon: '☀️' },
  { id: 'asr',     nameFr: 'Asr',     nameAr: 'العصر',   icon: '🌤' },
  { id: 'maghrib', nameFr: 'Maghrib', nameAr: 'المغرب',  icon: '🌅' },
  { id: 'isha',    nameFr: 'Isha',    nameAr: 'العشاء',  icon: '🌙' },
];

export const PRAYER_WINDOW_MINUTES: Record<PrayerName, number> = {
  fajr:    20,
  dhuhr:   60,
  asr:     60,
  maghrib: 15,
  isha:    120,
};

export type KnowledgeCategory = 'revelation' | 'estikhlaf';
export type ActivityType = 'walk' | 'sport' | 'stretching';
export type SocialCategory = 'family' | 'service' | 'community';
export type TarwihCategory = 'reading' | 'walk' | 'conversation' | 'art' | 'nasheed';

export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategory, { label: string; icon: string; bonusPoints: number }> = {
  revelation:  { label: 'Savoir de la Révélation',  icon: '📿', bonusPoints: 3 },
  estikhlaf:   { label: 'Savoir de l\'Estikhlaf',   icon: '💼', bonusPoints: 0 },
};

export const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: string }> = {
  walk:       { label: 'Marche',      icon: '🚶' },
  sport:      { label: 'Sport',       icon: '💪' },
  stretching: { label: 'Étirements', icon: '🧘' },
};

export const SOCIAL_CATEGORIES: Record<SocialCategory, { label: string; icon: string; description: string }> = {
  family:    { label: 'Famille',      icon: '🏠', description: 'Parents, conjoint, enfants — sans écran' },
  service:   { label: 'Service',      icon: '🤝', description: 'Rangement, aide, Mihnat ahlihi' },
  community: { label: 'Communauté',  icon: '🕌', description: 'Action associative ou locale' },
};

export const TARWIH_CATEGORIES: Record<TarwihCategory, { label: string; icon: string }> = {
  reading:      { label: 'Lecture',      icon: '📚' },
  walk:         { label: 'Promenade',    icon: '🌿' },
  conversation: { label: 'Conversation', icon: '💬' },
  art:          { label: 'Créativité',   icon: '🎨' },
  nasheed:      { label: 'Nasheeds',     icon: '🎵' },
};

export const GOLDEN_MOMENT_DURATION_SECONDS = 15 * 60; // 15 minutes
export const QAYLULAH_MAX_SECONDS = 30 * 60;           // 30 minutes max
export const QAYLULAH_DEFAULT_SECONDS = 20 * 60;       // 20 minutes default
export const FOCUS_MIN_SECONDS = 15 * 60;              // 15 minutes minimum
export const SOCIAL_MIN_SECONDS = 20 * 60;             // 20 minutes minimum
export const ACTIVITY_MIN_SECONDS = 20 * 60;           // 20 minutes minimum
export const TARWIH_MIN_SECONDS = 20 * 60;             // 20 minutes minimum
