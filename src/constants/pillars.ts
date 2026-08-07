import { PILLAR_PALETTE } from './theme';
import { Heart, BookOpen, Activity, Users, Moon } from 'lucide-react-native';

export type PillarId = 'spiritual' | 'knowledge' | 'physical' | 'social' | 'sleep';

export interface PillarDefinition {
  id: PillarId;
  nameAr: string;
  nameFr: string;
  icon: any; // Lucide component
  /** Two-digit ordinal ("01"–"05") — how pillars are told apart, with the icon. */
  numeral: string;
  /** Two-letter tag used on the Baraka segment bar. */
  short: string;
  /** Pillar's colour from PILLAR_PALETTE (theme.ts) — distinct per pillar, so
   * KPI tiles/badges read at a glance instead of all sharing one grey/accent
   * colour. Swapping palettes later only means editing PILLAR_PALETTE. */
  color: string;
  weight: number; // % of total Baraka score
  maxPoints: number;
}

export const PILLARS: Record<PillarId, PillarDefinition> = {
  spiritual: {
    id: 'spiritual',
    nameAr: 'الروحانية',
    nameFr: 'Pilier Spirituel',
    icon: Heart,
    numeral: '01',
    short: 'SP',
    color: PILLAR_PALETTE.spiritual,
    weight: 0.35,
    maxPoints: 35,
  },
  knowledge: {
    id: 'knowledge',
    nameAr: 'طلب العلم',
    nameFr: 'Pilier du Savoir',
    icon: BookOpen,
    numeral: '02',
    short: 'SA',
    color: PILLAR_PALETTE.knowledge,
    weight: 0.25,
    maxPoints: 25,
  },
  physical: {
    id: 'physical',
    nameAr: 'الأمانة الجسدية',
    nameFr: 'Pilier Physique',
    icon: Activity,
    numeral: '03',
    short: 'PH',
    color: PILLAR_PALETTE.physical,
    weight: 0.15,
    maxPoints: 15,
  },
  social: {
    id: 'social',
    nameAr: 'العمل الاجتماعي',
    nameFr: 'Pilier Social',
    icon: Users,
    numeral: '04',
    short: 'SO',
    color: PILLAR_PALETTE.social,
    weight: 0.15,
    maxPoints: 15,
  },
  sleep: {
    id: 'sleep',
    nameAr: 'الترويح',
    nameFr: 'Pilier Sommeil',
    icon: Moon,
    numeral: '05',
    short: 'SM',
    color: PILLAR_PALETTE.sleep,
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

export interface ActivitySuggestion {
  title: string;
  description: string;
}

export const ACTIVITY_GUIDE_INTRO: Record<ActivityType, string> = {
  walk: "La marche est l'activité la plus accessible et la plus soutenue par la Sunna. Choisis une piste ou marche simplement, dehors si possible.",
  sport: "20 minutes suffisent pour respecter le droit de ton corps sur toi. Choisis une piste adaptée à ton niveau — la régularité prime sur l'intensité.",
  stretching: "Les étirements relâchent les tensions accumulées et préparent le corps à la prière. Prends ton temps, respire, ne force pas.",
};

export const ACTIVITY_SUGGESTIONS: Record<ActivityType, ActivitySuggestion[]> = {
  walk: [
    { title: 'Marche rapide dehors', description: 'Profite de la lumière naturelle si possible — avant Maghrib est idéal.' },
    { title: 'Marche + rappel audio', description: 'Écoute un rappel ou une récitation pendant que tu marches.' },
    { title: 'Marche accompagnée', description: 'Invite un proche à marcher avec toi — ça compte double : physique et social.' },
    { title: 'Trajet à pied', description: 'Remplace un trajet court en voiture par la marche aujourd\'hui.' },
    { title: 'Marche digestive', description: 'Une marche tranquille après un repas, pour la santé et la légèreté.' },
  ],
  sport: [
    { title: 'Circuit rapide à la maison', description: 'Squats, pompes, gainage — 20 minutes sans matériel.' },
    { title: 'Cardio simple', description: 'Corde à sauter, jumping jacks, montées de genoux.' },
    { title: 'Course ou vélo', description: 'Une sortie à ton rythme, dehors ou sur machine.' },
    { title: 'Musculation ciblée', description: 'Travaille un groupe musculaire précis avec ou sans matériel.' },
    { title: 'Sport collectif', description: 'Rejoins une activité avec d\'autres — utile pour le corps et le lien social.' },
  ],
  stretching: [
    { title: 'Étirements complets', description: 'Une routine du haut vers le bas du corps, 20 minutes sans précipitation.' },
    { title: 'Mobilité articulaire', description: 'Fais tourner et mobiliser chaque articulation en douceur.' },
    { title: 'Zone tendue ciblée', description: 'Concentre-toi sur la zone la plus raide : dos, épaules, nuque.' },
    { title: 'Respiration + étirement', description: 'Associe respiration profonde et étirements doux façon relaxation.' },
  ],
};

export function pickActivitySuggestions(type: ActivityType, count = 3): ActivitySuggestion[] {
  const pool = [...ACTIVITY_SUGGESTIONS[type]];
  const picked: ActivitySuggestion[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export const QAYLULAH_TIPS: string[] = [
  'Position semi-allongée, pas totalement couché — pour éviter le sommeil profond.',
  'Coupe les notifications et pose une alarme douce (déjà prévue par le chronomètre).',
  'Fenêtre idéale : juste après Dhouhr, avant 14h — bonus Baraka inclus.',
  'Même 10-15 min suffisent à couper la fatigue de l\'après-midi.',
];

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

export interface TarwihSuggestion {
  title: string;
  description: string;
}

export const TARWIH_GUIDE_INTRO: Record<TarwihCategory, string> = {
  reading: "La lecture détend l'esprit sans le vider — choisis quelque chose de léger, loin des écrans qui excitent l'attention.",
  walk: "Une promenade en soirée calme le corps et l'esprit avant le sommeil. Sors si possible, même quelques minutes.",
  conversation: "Un vrai échange, en face-à-face, nourrit l'âme bien plus qu'un fil de discussion sans fin.",
  art: "Créer sans objectif de performance — juste pour le plaisir — est un vrai repos mental.",
  nasheed: "La bonne musique nourrit l'âme sans l'agiter. Privilégie des nasheeds calmes plutôt qu'entraînants avant de dormir.",
};

export const TARWIH_SUGGESTIONS: Record<TarwihCategory, TarwihSuggestion[]> = {
  reading: [
    { title: 'Roman ou récit léger', description: 'Une fiction qui te change les idées, sans lien avec le travail ou les études.' },
    { title: 'Biographie inspirante', description: 'La vie d\'une personnalité qui te motive, en dehors du cadre religieux du Savoir.' },
    { title: 'Magazine ou revue', description: 'Quelques pages sur un sujet qui te passionne, sans pression de tout finir.' },
  ],
  walk: [
    { title: 'Promenade sans but', description: 'Marche sans destination précise, juste pour observer et respirer.' },
    { title: 'Balade en famille', description: 'Une sortie tranquille avec un proche, sans écran.' },
    { title: 'Nature ou parc', description: 'Privilégie un espace vert si tu en as un à proximité.' },
  ],
  conversation: [
    { title: 'Appel à un proche éloigné', description: 'Prends des nouvelles de quelqu\'un que tu n\'as pas appelé depuis longtemps.' },
    { title: 'Discussion en famille', description: 'Un moment d\'échange sans écran, autour d\'un thé par exemple.' },
    { title: 'Retrouvailles avec un ami', description: 'Un café ou une visite, en présentiel de préférence.' },
  ],
  art: [
    { title: 'Dessin ou peinture libre', description: 'Sans objectif de résultat — juste pour le plaisir du geste.' },
    { title: 'Écriture personnelle', description: 'Un journal, un poème, ou simplement mettre des mots sur ta journée.' },
    { title: 'Musique ou calligraphie', description: 'Pratique un instrument ou essaie la calligraphie arabe.' },
  ],
  nasheed: [
    { title: 'Nasheeds calmes', description: 'Une sélection de nasheeds apaisants, sans instruments percutants.' },
    { title: 'Récitation coranique douce', description: 'Écoute une récitation apaisante avant le sommeil.' },
    { title: 'Playlist de fin de journée', description: 'Prépare une sélection dédiée à ce moment précis de la soirée.' },
  ],
};

export function pickTarwihSuggestions(category: TarwihCategory, count = 3): TarwihSuggestion[] {
  const pool = [...TARWIH_SUGGESTIONS[category]];
  const picked: TarwihSuggestion[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export const GOLDEN_MOMENT_DURATION_SECONDS = 15 * 60; // 15 minutes
export const QAYLULAH_MAX_SECONDS = 30 * 60;           // 30 minutes max
export const QAYLULAH_DEFAULT_SECONDS = 20 * 60;       // 20 minutes default
export const FOCUS_MIN_SECONDS = 15 * 60;              // 15 minutes minimum
export const SOCIAL_MIN_SECONDS = 20 * 60;             // 20 minutes minimum
export const ACTIVITY_MIN_SECONDS = 20 * 60;           // 20 minutes minimum
export const TARWIH_MIN_SECONDS = 20 * 60;             // 20 minutes minimum
