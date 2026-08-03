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

export interface KnowledgeSuggestion {
  title: string;
  description: string;
}

export const KNOWLEDGE_GUIDE_INTRO: Record<KnowledgeCategory, string> = {
  revelation:
    "Le Savoir de la Révélation nourrit le cœur : Coran, Sunna, Fiqh, croyance. Choisis une piste ci-dessous ou suis la tienne — l'essentiel est d'en ressortir avec une leçon claire.",
  estikhlaf:
    "Le Savoir de l'Estikhlaf te rend utile sur terre : métier, santé, gestion, compétences. Choisis une piste ci-dessous ou suis la tienne — l'important est d'apprendre quelque chose d'actionnable.",
};

export const KNOWLEDGE_SUGGESTIONS: Record<KnowledgeCategory, KnowledgeSuggestion[]> = {
  revelation: [
    { title: 'Tafsir d\'un verset', description: 'Choisis un verset court et lis son explication (tafsir) dans un recueil ou une application fiable.' },
    { title: 'Un hadith à fond', description: 'Mémorise un hadith authentique et son sens précis, pas seulement sa traduction littérale.' },
    { title: 'Fiqh du quotidien', description: 'Étudie une règle pratique : purification, prière, jeûne — quelque chose que tu appliques déjà.' },
    { title: 'Sîra du Prophète ﷺ', description: 'Lis un épisode de sa vie et demande-toi ce qu\'il t\'enseigne concrètement aujourd\'hui.' },
    { title: 'Révision de mémorisation', description: 'Repasse une sourate ou un passage déjà mémorisé, à voix haute si possible.' },
    { title: 'Les Noms d\'Allah', description: 'Étudie un des 99 Noms : son sens, et comment il devrait transformer ton comportement.' },
    { title: 'Aqida de base', description: 'Reprends un pilier de la croyance (tawhid, anges, prédestination...) à partir des fondamentaux.' },
    { title: 'Histoire d\'un Sahabi', description: 'Lis un récit de la vie d\'un compagnon et note la qualité qui t\'a le plus marqué.' },
  ],
  estikhlaf: [
    { title: 'Approfondis ton métier', description: 'Lis un article, un chapitre ou une documentation directement utile à ton travail actuel.' },
    { title: 'Compétence pratique', description: 'Apprends une notion concrète : premiers secours, bricolage, cuisine, informatique de base.' },
    { title: 'Finance personnelle', description: 'Étudie une notion de gestion d\'argent ou d\'épargne conforme à tes principes.' },
    { title: 'Tutoriel ciblé', description: 'Suis un tutoriel court sur un outil ou logiciel que tu utilises déjà, pour mieux le maîtriser.' },
    { title: 'Veille de ton secteur', description: 'Lis une actualité sérieuse (économie, science, technique) liée à ton domaine.' },
    { title: 'Langue étrangère', description: 'Apprends 5 mots ou une règle de grammaire dans une langue que tu étudies.' },
    { title: 'Gestion du temps', description: 'Lis une méthode de productivité et identifie une chose à appliquer dès demain.' },
    { title: 'Santé & corps', description: 'Renseigne-toi sur la nutrition, le sommeil ou l\'exercice — une chose factuelle et vérifiable.' },
  ],
};

export function pickKnowledgeSuggestions(category: KnowledgeCategory, count = 3): KnowledgeSuggestion[] {
  const pool = [...KNOWLEDGE_SUGGESTIONS[category]];
  const picked: KnowledgeSuggestion[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

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

export interface SocialSuggestion {
  title: string;
  description: string;
}

export const SOCIAL_GUIDE_INTRO: Record<SocialCategory, string> = {
  family:
    "Ta présence physique, sans écran, est la seule unité de mesure valable. Choisis une piste ou invente la tienne — l'important est d'être vraiment là.",
  service:
    "Le service rendu sans qu'on le demande (Mihnat ahlihi) est l'une des actions les plus aimées. Choisis une piste ou repère un besoin réel autour de toi.",
  community:
    "Ta présence utile au-delà du foyer construit le tissu social. Choisis une piste ou rejoins une action déjà en cours près de chez toi.",
};

export const SOCIAL_SUGGESTIONS: Record<SocialCategory, SocialSuggestion[]> = {
  family: [
    { title: 'Repas préparé ensemble', description: 'Cuisine avec un proche, sans écran, en discutant simplement de la journée.' },
    { title: 'Jeu de société', description: 'Un jeu de cartes ou de plateau en famille — la légèreté crée du lien.' },
    { title: 'Promenade à deux', description: 'Marche avec ton conjoint, un parent ou un enfant, dehors si possible.' },
    { title: 'Écoute pleine', description: 'Assieds-toi avec quelqu\'un et écoute-le sans interrompre ni regarder ton téléphone.' },
    { title: 'Aide aux devoirs', description: 'Accompagne un enfant dans son travail scolaire, avec patience.' },
    { title: 'Histoire du soir', description: 'Raconte ou lis une histoire — un moment simple qui marque durablement.' },
  ],
  service: [
    { title: 'Rendre service sans qu\'on demande', description: 'Repère une tâche que quelqu\'un chez toi n\'a pas eu le temps de faire, et fais-la.' },
    { title: 'Ranger un espace commun', description: 'Nettoie ou range un lieu partagé — cuisine, salon, voiture familiale.' },
    { title: 'Un repas pour quelqu\'un', description: 'Prépare ou apporte un repas à un proche, un voisin, ou une personne dans le besoin.' },
    { title: 'Réparer ou dépanner', description: 'Aide un proche sur quelque chose de concret : un objet, une démarche, un trajet.' },
    { title: 'Prendre des nouvelles', description: 'Appelle ou rends visite à quelqu\'un que tu as délaissé ces derniers temps.' },
  ],
  community: [
    { title: 'Action associative', description: 'Rejoins ou propose ton aide à une association locale, même pour une heure.' },
    { title: 'Visite à un isolé', description: 'Rends visite à une personne malade, âgée ou isolée près de chez toi.' },
    { title: 'Aide au lieu de culte', description: 'Propose ton aide pour l\'organisation ou l\'entretien de la mosquée/du centre communautaire.' },
    { title: 'Coup de main ponctuel', description: 'Aide à un événement local : collecte, déménagement, organisation.' },
    { title: 'Partage de compétence', description: 'Transmets gratuitement une compétence que tu maîtrises à quelqu\'un qui en a besoin.' },
  ],
};

export function pickSocialSuggestions(category: SocialCategory, count = 3): SocialSuggestion[] {
  const pool = [...SOCIAL_SUGGESTIONS[category]];
  const picked: SocialSuggestion[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

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
