import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, Easing } from 'react-native-reanimated';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { LockTimer } from '../components/LockTimer';
import { useTheme, ThemeColors, Typography, Spacing } from '../constants/theme';
import { useDayStore } from '../store/useDayStore';
import { useAppStore } from '../store/useAppStore';
import { GOLDEN_MOMENT_DURATION_SECONDS } from '../constants/pillars';
import type { RootStackParamList } from '../navigation/RootNavigator';

interface Dhikr {
  text: string;
  transliteration: string;
  translation: string;
  count: number;
}

// Adhkar du matin — Hisn al-Muslim (rite complet). Les formules propres au
// matin ("Asbahna...") sont volontairement placées en tête du carrousel :
// les récitations communes au matin ET au soir (Ayat al-Kursi, les Quls...)
// arrivaient sinon en premier, donnant l'impression trompeuse que les
// adhkar du matin et du soir étaient identiques.
const MORNING_ADHKAR: Dhikr[] = [
  {
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal mulku lillahi walhamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    translation: 'Nous sommes au matin et le Royaume appartient à Allah. Louange à Allah, il n\'y a de divinité qu\'Allah l\'Unique sans associé.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan nushur',
    translation: 'Ô Allah ! C\'est par Toi que nous nous retrouvons au matin, par Toi au soir, par Toi nous vivons, par Toi nous mourons et vers Toi est la résurrection.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    transliteration: 'Allahumma ma asbaha bi min ni\'matin aw bi ahadin min khalqika faminka wahdaka la sharika lak, falakal hamdu wa lakash shukr',
    translation: 'Ô Allah ! Le bienfait qui m\'est parvenu ce matin, ou qui est parvenu à l\'une de Tes créatures, vient de Toi Seul, sans associé. À Toi la louange et à Toi la reconnaissance.',
    count: 1,
  },
  {
    text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
    transliteration: 'Asbahna \'ala fitratil-islam, wa \'ala kalimatil-ikhlas, wa \'ala dini nabiyyina Muhammadin sallallahu \'alayhi wa sallam',
    translation: 'Nous voici au matin sur la nature de l\'Islam, sur la parole de la sincérité, et sur la religion de notre Prophète Muhammad ﷺ.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
    transliteration: 'Allahumma inni asbahtu ush-hiduka wa ush-hidu hamalata \'arshik, wa mala\'ikatak, wa jami\'a khalqik, annaka antallahu la ilaha illa anta wahdaka la sharika lak, wa anna Muhammadan \'abduka wa rasuluk',
    translation: 'Ô Allah ! Je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toute Ta création, que Tu es Allah, qu\'il n\'y a de divinité que Toi, l\'Unique sans associé, et que Muhammad est Ton serviteur et Ton messager.',
    count: 4,
  },
  {
    text: 'اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ ۚ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...',
    transliteration: 'Ayat al-Kursi (Al-Baqara, 2:255)',
    translation: 'Allah — il n\'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent...',
    count: 1,
  },
  {
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Sourate Al-Ikhlas (112)',
    translation: 'Dis : "Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n\'a jamais engendré, n\'a pas été engendré non plus. Et nul n\'est égal à Lui."',
    count: 3,
  },
  {
    text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Sourate Al-Falaq (113)',
    translation: 'Dis : "Je cherche protection auprès du Seigneur de l\'aube naissante, contre le mal des êtres qu\'Il a créés, contre le mal de l\'obscurité quand elle s\'approfondit, contre le mal des souffleuses sur les nœuds, et contre le mal de l\'envieux quand il envie."',
    count: 3,
  },
  {
    text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Sourate An-Nas (114)',
    translation: 'Dis : "Je cherche protection auprès du Seigneur des hommes, Roi des hommes, Dieu des hommes, contre le mal du mauvais conseiller, furtif, qui souffle le mal dans les poitrines des hommes, qu\'il soit djinn ou homme."',
    count: 3,
  },
  {
    text: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: 'Hasbiyallahu la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul \'arshil \'azim',
    translation: 'Allah me suffit, il n\'y a de divinité que Lui. En Lui je place ma confiance, Il est le Seigneur du Trône immense.',
    count: 7,
  },
  {
    text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladhi la yadhurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa huwas-sami\'ul \'alim',
    translation: 'Au nom d\'Allah, avec le nom Duquel rien ne peut nuire sur terre ni dans le ciel. Il est L\'Audient, L\'Omniscient.',
    count: 3,
  },
  {
    text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: 'Radhitu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin sallallahu \'alayhi wa sallama nabiyya',
    translation: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion, et Muhammad ﷺ comme Prophète.',
    count: 3,
  },
  {
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...',
    transliteration: 'Sayyid al-Istighfar — Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana \'abduk...',
    translation: 'Ô Allah ! Tu es mon Seigneur, il n\'y a de divinité que Toi. Tu m\'as créé et je suis Ton serviteur, je m\'en tiens à Ton pacte et à Ta promesse autant que je le peux...',
    count: 1,
  },
  {
    text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration: 'Ya Hayyu ya Qayyumu bi-rahmatika astagheeth, aslih li sha\'ni kullahu wa la takilni ila nafsi tarfata \'ayn',
    translation: 'Ô Vivant, Ô Subsistant par Soi-même, par Ta miséricorde je demande secours. Améliore toute ma situation et ne m\'abandonne pas à moi-même le temps d\'un clin d\'œil.',
    count: 1,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    transliteration: 'Subhanallahi wa bihamdih: \'adada khalqih, wa rida nafsih, wa zinata \'arshih, wa midada kalimatih',
    translation: 'Gloire et louange à Allah, autant de fois que le nombre de Ses créatures, selon Son bon plaisir, le poids de Son Trône et l\'encre de Ses paroles.',
    count: 3,
  },
  {
    text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa \'ala kulli shay\'in qadir',
    translation: 'Nulle divinité qu\'Allah, l\'Unique sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose.',
    count: 10,
  },
  {
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    translation: 'Je demande pardon à Allah et je me repens à Lui.',
    count: 100,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdih',
    translation: 'Gloire et louange à Allah.',
    count: 100,
  },
];

// Adhkar du soir — même socle, formulé au soir (Hisn al-Muslim). Même
// réordonnancement que le matin, pour la même raison : les formules
// propres au soir doivent apparaître avant les récitations partagées.
const EVENING_ADHKAR: Dhikr[] = [
  {
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Amsayna wa amsal mulku lillahi walhamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    translation: 'Nous voici au soir et le Royaume appartient à Allah. Louange à Allah, il n\'y a de divinité qu\'Allah l\'Unique sans associé.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal masir',
    translation: 'Ô Allah ! C\'est par Toi que nous nous retrouvons au soir, par Toi au matin, par Toi nous vivons, par Toi nous mourons et vers Toi est la destination finale.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
    transliteration: 'Allahumma ma amsa bi min ni\'matin aw bi ahadin min khalqika faminka wahdaka la sharika lak, falakal hamdu wa lakash shukr',
    translation: 'Ô Allah ! Le bienfait qui m\'est parvenu ce soir, ou qui est parvenu à l\'une de Tes créatures, vient de Toi Seul, sans associé. À Toi la louange et à Toi la reconnaissance.',
    count: 1,
  },
  {
    text: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
    transliteration: 'Amsayna \'ala fitratil-islam, wa \'ala kalimatil-ikhlas, wa \'ala dini nabiyyina Muhammadin sallallahu \'alayhi wa sallam',
    translation: 'Nous voici au soir sur la nature de l\'Islam, sur la parole de la sincérité, et sur la religion de notre Prophète Muhammad ﷺ.',
    count: 1,
  },
  {
    text: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
    transliteration: 'Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata \'arshik, wa mala\'ikatak, wa jami\'a khalqik, annaka antallahu la ilaha illa anta wahdaka la sharika lak, wa anna Muhammadan \'abduka wa rasuluk',
    translation: 'Ô Allah ! Je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toute Ta création, que Tu es Allah, qu\'il n\'y a de divinité que Toi, l\'Unique sans associé, et que Muhammad est Ton serviteur et Ton messager.',
    count: 4,
  },
  {
    text: 'اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ ۚ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...',
    transliteration: 'Ayat al-Kursi (Al-Baqara, 2:255)',
    translation: 'Allah — il n\'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent...',
    count: 1,
  },
  {
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Sourate Al-Ikhlas (112)',
    translation: 'Dis : "Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n\'a jamais engendré, n\'a pas été engendré non plus. Et nul n\'est égal à Lui."',
    count: 3,
  },
  {
    text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Sourate Al-Falaq (113)',
    translation: 'Dis : "Je cherche protection auprès du Seigneur de l\'aube naissante, contre le mal des êtres qu\'Il a créés, contre le mal de l\'obscurité quand elle s\'approfondit, contre le mal des souffleuses sur les nœuds, et contre le mal de l\'envieux quand il envie."',
    count: 3,
  },
  {
    text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Sourate An-Nas (114)',
    translation: 'Dis : "Je cherche protection auprès du Seigneur des hommes, Roi des hommes, Dieu des hommes, contre le mal du mauvais conseiller, furtif, qui souffle le mal dans les poitrines des hommes, qu\'il soit djinn ou homme."',
    count: 3,
  },
  {
    text: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: 'Hasbiyallahu la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul \'arshil \'azim',
    translation: 'Allah me suffit, il n\'y a de divinité que Lui. En Lui je place ma confiance, Il est le Seigneur du Trône immense.',
    count: 7,
  },
  {
    text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladhi la yadhurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa huwas-sami\'ul \'alim',
    translation: 'Au nom d\'Allah, avec le nom Duquel rien ne peut nuire sur terre ni dans le ciel. Il est L\'Audient, L\'Omniscient.',
    count: 3,
  },
  {
    text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: 'Radhitu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin sallallahu \'alayhi wa sallama nabiyya',
    translation: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion, et Muhammad ﷺ comme Prophète.',
    count: 3,
  },
  {
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...',
    transliteration: 'Sayyid al-Istighfar (soir) — Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana \'abduk...',
    translation: 'Ô Allah ! Tu es mon Seigneur, il n\'y a de divinité que Toi. Tu m\'as créé et je suis Ton serviteur, je m\'en tiens à Ton pacte et à Ta promesse autant que je le peux...',
    count: 1,
  },
  {
    text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration: 'Ya Hayyu ya Qayyumu bi-rahmatika astagheeth, aslih li sha\'ni kullahu wa la takilni ila nafsi tarfata \'ayn',
    translation: 'Ô Vivant, Ô Subsistant par Soi-même, par Ta miséricorde je demande secours. Améliore toute ma situation et ne m\'abandonne pas à moi-même le temps d\'un clin d\'œil.',
    count: 1,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    transliteration: 'Subhanallahi wa bihamdih: \'adada khalqih, wa rida nafsih, wa zinata \'arshih, wa midada kalimatih',
    translation: 'Gloire et louange à Allah, autant de fois que le nombre de Ses créatures, selon Son bon plaisir, le poids de Son Trône et l\'encre de Ses paroles.',
    count: 3,
  },
  {
    text: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa \'ala kulli shay\'in qadir',
    translation: 'Nulle divinité qu\'Allah, l\'Unique sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose.',
    count: 10,
  },
  {
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    translation: 'Je demande pardon à Allah et je me repens à Lui.',
    count: 100,
  },
  {
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdih',
    translation: 'Gloire et louange à Allah.',
    count: 100,
  },
];

function FadingDhikrCarousel({ items }: { items: Dhikr[] }) {
  const [index, setIndex] = useState(0);
  const Colors = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 12000); // Change every 12 seconds for slow meditation
    return () => clearInterval(interval);
  }, [items]);

  const dhikr = items[index];

  return (
    <View style={styles.carouselContainer}>
      <Animated.View
        key={index}
        entering={FadeIn.duration(3000).easing(Easing.inOut(Easing.ease))}
        exiting={FadeOut.duration(2000).easing(Easing.inOut(Easing.ease))}
        style={styles.animatedDhikr}
      >
        <Text style={styles.dhikrTextArabic}>{dhikr.text}</Text>
        <Text style={styles.dhikrTranslitBig}>{dhikr.transliteration}</Text>
        {dhikr.translation && (
          <Text style={styles.dhikrTranslationBig}>{dhikr.translation}</Text>
        )}
        {dhikr.count > 1 && (
          <Text style={styles.dhikrCountBadge}>À répéter {dhikr.count} fois</Text>
        )}
      </Animated.View>
    </View>
  );
}

type GoldenMomentRoute = RouteProp<RootStackParamList, 'GoldenMoment'>;

export function GoldenMomentScreen() {
  const navigation = useNavigation();
  const route = useRoute<GoldenMomentRoute>();
  const isEvening = route.params?.type === 'evening';
  const { completeGoldenMoment, setAdhkarEvening, startGoldenMoment, today } = useDayStore();
  const { setGoldenMomentActive } = useAppStore();

  const adhkarItems = useMemo(() => (isEvening ? EVENING_ADHKAR : MORNING_ADHKAR), [isEvening]);

  // Start tracking on mount
  React.useEffect(() => {
    if (!isEvening) startGoldenMoment();
    setGoldenMomentActive(true, isEvening ? 'evening' : 'morning');
  }, []);

  const handleComplete = useCallback(() => {
    if (isEvening) {
      setAdhkarEvening(true);
    } else {
      completeGoldenMoment();
    }
    setGoldenMomentActive(false);
    navigation.goBack();
  }, [isEvening, completeGoldenMoment, setAdhkarEvening, setGoldenMomentActive, navigation]);

  const handleCancel = useCallback(() => {
    setGoldenMomentActive(false);
    navigation.goBack();
  }, [setGoldenMomentActive, navigation]);

  return (
    <LockTimer
      totalSeconds={GOLDEN_MOMENT_DURATION_SECONDS}
      onComplete={handleComplete}
      onCancel={handleCancel}
      title={isEvening ? 'Adhkâr du Soir' : "Moment d'Or"}
      subtitle={isEvening
        ? 'La nuit tombe. Recueille-toi avant le repos.'
        : 'Le téléphone attend. Toi, tu restes là.'}
      content={<FadingDhikrCarousel items={adhkarItems} />}
    />
  );
}

const createStyles = (Colors: ThemeColors) => StyleSheet.create({
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  animatedDhikr: {
    alignItems: 'center',
    width: '100%',
  },
  dhikrTextArabic: {
    fontSize: 32,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: Spacing.md,
  },
  dhikrTranslitBig: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  dhikrTranslationBig: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  dhikrCountBadge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
    color: Colors.bg.primary,
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
});
