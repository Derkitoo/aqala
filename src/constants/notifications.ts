// Rotating pool of notification messages per slot.
// The service picks a random index each time to avoid habituation.

export const NotificationPool = {

  // ─── PILIER SPIRITUEL ────────────────────────────────────────────────────

  preWakeup: [
    { title: '🌟 L\'aube t\'appartient',         body: 'Avant que le monde se réveille, tu es déjà debout. Lance le timer.' },
    { title: '⚡ La garde commence maintenant',  body: 'Ton adversaire dans le ring, c\'est le temps. Reprends la garde — Fajr arrive.' },
    { title: '🌙 Le dernier tiers est à toi',    body: 'Les anges descendent encore. Lève-toi avant que la fenêtre se ferme.' },
    { title: '🕌 L\'heure des champions',        body: 'Pendant que la ville dort, toi tu construis. Réveille-toi.' },
    { title: '🌙 Pré-Fajr — C\'est maintenant', body: 'Chaque matin recommencé est un cadeau renouvelé. Saisis-le.' },
  ],

  fajrApproaching: [
    { title: '🕌 Fajr dans 10 minutes',         body: 'Pose tout. Cette prière est la clé de ta journée — tout le reste découlera d\'elle.' },
    { title: '⏰ La fenêtre de Fajr s\'ouvre',   body: '10 minutes. L\'adhan va appeler. Sois prêt avant lui.' },
    { title: '🌟 Fajr — 10 min',                body: 'Le Prophète ﷺ était debout à cette heure. Rejoins la file.' },
    { title: '⏳ La porte s\'ouvre',             body: 'Fajr arrive. Wudhu, rawatib, puis la prière. Dans cet ordre.' },
  ],

  fajrMissing: [
    { title: '🚨 Fajr — Fenêtre qui se ferme',  body: 'Il reste quelques minutes. Chaque prière à l\'heure compte.' },
    { title: '⚠️ Fajr — Rattrape le maintenant', body: 'La fenêtre se réduit. Prie maintenant — même si tu es en retard.' },
  ],

  goldenMoment: [
    { title: '🔒 Mode Doré activé',              body: 'Ces 15 minutes sont inviolables. L\'app attend. Toi, tu restes là.' },
    { title: '✨ Rien n\'est plus urgent que ça', body: 'Les invocations du matin protègent la journée. Timer lancé — reste là.' },
    { title: '⏳ Moment d\'Or — 15 minutes',     body: 'Le scroll peut attendre. Tes Adhkâr, non.' },
    { title: '🌟 Adhkâr du matin',              body: 'Ibn al-Qayyim disait : les Adhkâr sont les murs de ta journée. Construis-les.' },
  ],

  duha: [
    { title: '☀️ La Duha est ouverte',           body: '2 minutes pour une Sadaqa universelle. Chaque articulation remerciée.' },
    { title: '🌤 Fenêtre Duha — N\'attends pas', body: 'La prière du milieu de matinée est un trésor discret. Ouvre le timer.' },
    { title: '☀️ Duha — Le bonus de la matinée', body: 'Le Prophète ﷺ ne la lâchait pas. Toi non plus.' },
  ],

  asrCritical: [
    { title: '🚨 Asr — Fenêtre critique',        body: 'Ne rate pas la prière du milieu. Tout peut attendre — ça, non.' },
    { title: '⚠️ 15 minutes avant la fin d\'Asr', body: '"Gardez les prières, surtout la prière du milieu." (Coran 2:238)' },
    { title: '⏰ Asr — Agis maintenant',          body: 'Fenêtre critique. Lève-toi — 5 minutes et tu restes dans les règles.' },
  ],

  maghrib: [
    { title: '🌅 Maghrib',                       body: 'La journée a rendu ses comptes. Pose l\'écran — tu as mieux à faire ce soir.' },
    { title: '🌅 Maghrib + Adhkâr du soir',      body: 'Scelle la journée avec les invocations du soir. Mode Sas de Nuit activé.' },
    { title: '🌙 Maghrib arrive',                body: 'Une journée de plus. Comment s\'est passé ce pilier social ?' },
  ],

  isha: [
    { title: '🌙 Isha + Witr — Scelle ce jour',  body: 'Isha et Witr — scelle cette journée avec ce que tu as de mieux. Demain recommence propre.' },
    { title: '🌙 Isha',                          body: 'La dernière prière de la journée. Fais-la avec présence — pas en automatique.' },
    { title: '🕌 Isha + Witr',                   body: 'Witr est le cachet de ta journée. Ne dors pas sans lui.' },
  ],

  // ─── PILIER SAVOIR ───────────────────────────────────────────────────────

  knowledgeStart: [
    { title: '📖 15 minutes pour changer ta trajectoire', body: 'Ne vends pas ton temps pour rien — investis-le. Ouvre le timer.' },
    { title: '🧠 L\'info d\'aujourd\'hui t\'appartient',  body: 'Une seule ligne à retenir. Un seul focus. C\'est tout ce qu\'il faut. Commence.' },
    { title: '📚 L\'ignorance ne se bat pas en scrollant', body: '15 minutes de savoir réel. Coupe le bruit — ouvre le timer.' },
    { title: '📖 Talab al-\'Ilm',                        body: 'Le savoir est une obligation. 15 minutes — c\'est le minimum non négociable.' },
  ],

  knowledgeLate: [
    { title: '⏳ Le savoir d\'aujourd\'hui attend encore', body: 'La journée n\'est pas finie. 15 minutes avant Isha — c\'est encore jouable.' },
    { title: '📖 Un seul regret possible ce soir',        body: 'Ne pas avoir appris quelque chose. Il reste du temps — lance la session.' },
    { title: '📚 Savoir — Dernier rappel',                body: 'Une ligne d\'apprentissage par jour fait 365 leçons par an. Lance-toi.' },
  ],

  knowledgeNote: [
    { title: '✅ Écris ta ligne du jour',                 body: 'Qu\'est-ce que tu retiens de cette session ? Une ligne. C\'est ta victoire.' },
    { title: '📝 Note ta nouvelle info',                  body: 'Ce que tu n\'écris pas, tu l\'oublies. Une ligne — et c\'est validé.' },
  ],

  // ─── PILIER PHYSIQUE ─────────────────────────────────────────────────────

  activityReminder: [
    { title: '🏃 L\'heure dorée avant Maghrib',          body: 'Sors marcher — ce corps est une Amana. Entretiens-le.' },
    { title: '💪 La sédentarité, c\'est une dette',      body: '20 minutes de mouvement. Tes articulations te remercieront demain matin.' },
    { title: '🌿 Debout — le corps a son droit sur toi', body: '"Ton corps a un droit sur toi." (Hadith) — Marche, sport ou étirements.' },
    { title: '🏃 Entretiens l\'Amana',                   body: 'Le corps qu\'on t\'a confié mérite mieux que d\'être assis toute la journée.' },
  ],

  qaylulahStart: [
    { title: '😴 Qaylulah — Le vol légal de l\'énergie', body: '20 minutes maintenant = 2 heures de productivité récupérées. C\'est du pur profit.' },
    { title: '🔋 Recharge avant la seconde mi-temps',    body: 'Le Prophète ﷺ faisait la sieste méridienne. Active le timer — 20 min max.' },
    { title: '😴 Qaylulah — Maintenant',                 body: 'Post-Dhouhr : c\'est la fenêtre optimale. 20 minutes et tu repartes fort.' },
  ],

  mobilityBreak: [
    { title: '⚡ 90 min statique — brise le cycle',      body: '2 minutes de marche. Réoxyg ton cerveau. Puis on repart plus fort.' },
    { title: '🚶 Debout — pause mobilité',               body: 'Ton cerveau tourne à vide passé 90 minutes. 2 min de mouvement — maintenant.' },
    { title: '💧 Eau + mobilité',                        body: 'Lève-toi, bois de l\'eau, fais 20 pas. Ton prochain bloc sera meilleur.' },
  ],

  // ─── PILIER SOCIAL ───────────────────────────────────────────────────────

  socialReminder: [
    { title: '👥 Qui mérite ta présence ce soir ?',      body: 'Pose le téléphone et lève les yeux — c\'est ça l\'investissement réel.' },
    { title: '🏠 Ta famille ou ta to-do list ?',         body: 'S\'asseoir sans écran avec les tiens compte dans ta balance. Choisis bien.' },
    { title: '🤝 L\'écran peut attendre, eux non',       body: 'Une interaction réelle, présentielle. Pas un message — ta présence physique.' },
    { title: '👥 Lien réel — Action requise',            body: '20 minutes en face-à-face. Pas un appel, pas un SMS — toi, présent.' },
  ],

  socialLate: [
    { title: '⚠️ Interaction réelle — toujours en attente', body: 'Il reste du temps. Assois-toi avec quelqu\'un qui compte. Sans téléphone.' },
    { title: '🏠 Pilier Social — Non validé',            body: 'Avant Isha : 20 minutes avec ta famille ou ton entourage, en présence réelle.' },
  ],

  // ─── PILIER SOMMEIL ──────────────────────────────────────────────────────

  nightSas: [
    { title: '🌙 Sas de Nuit activé',                    body: 'La journée a rendu ses comptes. Pose l\'écran — tu as mieux à faire.' },
    { title: '📵 Mode Famille — Écran en pause',          body: 'Maghrib a sonné. Le scroll peut attendre jusqu\'à demain. Ta famille, non.' },
    { title: '🌿 Coupure digitale',                       body: 'Ce soir : présence réelle, repos de l\'âme, Adhkâr du soir. Pose le téléphone.' },
  ],

  tarwihReminder: [
    { title: '🌿 Ton âme mérite du repos',               body: 'Pas du scroll — du vrai repos. Lecture, promenade, conversation.' },
    { title: '🎨 Détente active — pas passive',           body: 'Ce soir : quelque chose qui te fait du bien sans te vider.' },
    { title: '📚 Tarwih de l\'âme',                      body: 'Ibn al-Qayyim disait que l\'âme a besoin de récréation pour mieux revenir. Offre-lui ça.' },
  ],

  bedtime: [
    { title: '🛌 Il est temps de ranger la journée',     body: 'Ibn Mas\'oud dormait tôt pour se lever fort. Couche-toi.' },
    { title: '🌙 Le lendemain se prépare cette nuit',    body: 'Ton Fajr de demain dépend de ton coucher de ce soir. Bonne nuit.' },
    { title: '🛌 Coucher précoce — Sunnah vivante',      body: 'Pose le téléphone. Les Duâs du coucher. Le sommeil. Dans cet ordre.' },
    { title: '🌙 C\'est l\'heure',                       body: 'Demain appartient à ceux qui dorment maintenant. Bonne nuit.' },
  ],

  qiyam: [
    { title: '🌟 Le tiers de la nuit — Lève-toi',       body: 'La nuit est encore longue et silencieuse. C\'est ton moment — personne ne te voit sauf Lui.' },
    { title: '🕌 Qiyam al-Layl',                        body: 'Allah descend au ciel inférieur. C\'est la heure des demandes. Lève-toi.' },
  ],

  // ─── SCORE & GAMIFICATION ────────────────────────────────────────────────

  streakMilestone7: [
    { title: '🔥 7 jours de constance',                  body: 'Tu viens de valider une semaine complète. Le Prophète ﷺ aimait les actes constants. Continue.' },
  ],
  streakMilestone21: [
    { title: '⚡ 21 jours — L\'habitude s\'installe',    body: 'Trois semaines de constance. Ce n\'est plus un effort — c\'est qui tu es.' },
  ],
  streakMilestone40: [
    { title: '🌟 40 jours — Maqam de la Constance',      body: 'Arba\'in accompli. Ton rapport de transformation est prêt. Regarde ce que tu es devenu.' },
  ],

} as const;

export type NotificationSlot = keyof typeof NotificationPool;

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
