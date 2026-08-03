import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addMinutes, setHours, setMinutes, setSeconds } from 'date-fns';
import { NotificationPool, pickRandom, type NotificationSlot } from '../constants/notifications';
import type { DailyPrayerSchedule } from './prayerTimes';

const IS_WEB = Platform.OS === 'web';

// ─── Setup ────────────────────────────────────────────────────────────────────

if (!IS_WEB) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('[notifications setup]', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (IS_WEB) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
}

// ─── Generic send ─────────────────────────────────────────────────────────────

export async function sendImmediateNotification(slot: NotificationSlot): Promise<void> {
  if (IS_WEB) return;
  try {
    const pool = NotificationPool[slot] as readonly { title: string; body: string }[];
    const { title, body } = pickRandom(pool);

    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // immediate
    });
  } catch (e) {}
}

export async function scheduleNotification(
  slot: NotificationSlot,
  triggerDate: Date,
  identifier?: string,
): Promise<string> {
  if (IS_WEB) return '';
  try {
    const pool = NotificationPool[slot] as readonly { title: string; body: string }[];
    const { title, body } = pickRandom(pool);

    return await Notifications.scheduleNotificationAsync({
      identifier,
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  } catch (e) {
    return '';
  }
}

export async function cancelNotification(identifier: string): Promise<void> {
  if (IS_WEB) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (e) {}
}

export async function cancelAllNotifications(): Promise<void> {
  if (IS_WEB) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
}

// ─── Daily prayer schedule notifications ─────────────────────────────────────

export async function scheduleDailyPrayerNotifications(
  schedule: DailyPrayerSchedule,
): Promise<void> {
  if (IS_WEB) return;
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const prayerIds = existing
      .filter(n => n.identifier.startsWith('prayer-'))
      .map(n => n.identifier);

    await Promise.all(prayerIds.map(id => cancelNotification(id)));

    const slots: { slot: NotificationSlot; time: Date; id: string; offset: number }[] = [
      { slot: 'preWakeup',       time: schedule.fajr,    id: 'prayer-prewakeup',  offset: -45 },
      { slot: 'fajrApproaching', time: schedule.fajr,    id: 'prayer-fajr-10',    offset: -10 },
      { slot: 'goldenMoment',    time: schedule.fajr,    id: 'prayer-golden',     offset: 3   },
      { slot: 'duha',            time: schedule.duhaStart, id: 'prayer-duha',     offset: 0   },
      { slot: 'asrCritical',     time: schedule.asr,     id: 'prayer-asr',        offset: -15 },
      { slot: 'maghrib',         time: schedule.maghrib, id: 'prayer-maghrib',    offset: 0   },
      { slot: 'isha',            time: schedule.isha,    id: 'prayer-isha',       offset: 0   },
      { slot: 'qaylulahStart',   time: schedule.qaylulahWindow, id: 'prayer-qaylulah', offset: 0 },
      { slot: 'nightSas',        time: schedule.maghrib, id: 'prayer-nightsas',   offset: 10  },
    ];

    await Promise.all(
      slots.map(({ slot, time, id, offset }) => {
        const triggerDate = addMinutes(time, offset);
        if (triggerDate > new Date()) {
          return scheduleNotification(slot, triggerDate, id);
        }
        return Promise.resolve('');
      }),
    );
  } catch (e) {}
}

// ─── One-off reminders ────────────────────────────────────────────────────────

export async function scheduleKnowledgeReminder(maghribTime: Date): Promise<void> {
  if (IS_WEB) return;
  const reminder = addMinutes(maghribTime, -60);
  if (reminder > new Date()) {
    await scheduleNotification('knowledgeLate', reminder, 'reminder-knowledge');
  }
}

export async function scheduleActivityReminder(maghribTime: Date): Promise<void> {
  if (IS_WEB) return;
  const reminder = addMinutes(maghribTime, -90);
  if (reminder > new Date()) {
    await scheduleNotification('activityReminder', reminder, 'reminder-activity');
  }
}

export async function scheduleSocialReminder(): Promise<void> {
  if (IS_WEB) return;
  const today = new Date();
  const reminder = setSeconds(setMinutes(setHours(today, 18), 0), 0);
  if (reminder > today) {
    await scheduleNotification('socialReminder', reminder, 'reminder-social');
  }
}

export async function scheduleBedtimeReminder(): Promise<void> {
  if (IS_WEB) return;
  const today = new Date();
  const reminder = setSeconds(setMinutes(setHours(today, 22), 30), 0);
  if (reminder > today) {
    await scheduleNotification('bedtime', reminder, 'reminder-bedtime');
  }
}

export async function scheduleMobilityBreaks(): Promise<void> {
  if (IS_WEB) return;
  const today = new Date();
  const breaks = [
    setSeconds(setMinutes(setHours(today, 9), 30), 0),
    setSeconds(setMinutes(setHours(today, 11), 0), 0),
    setSeconds(setMinutes(setHours(today, 14), 30), 0),
    setSeconds(setMinutes(setHours(today, 16), 0), 0),
  ];

  await Promise.all(
    breaks.map((t, i) => {
      if (t > today) {
        return scheduleNotification('mobilityBreak', t, `mobility-${i}`);
      }
      return Promise.resolve('');
    }),
  );
}

// ─── Streak milestone ─────────────────────────────────────────────────────────

export async function sendStreakMilestone(streak: number): Promise<void> {
  if (IS_WEB) return;
  const slotMap: Record<number, NotificationSlot> = {
    7:  'streakMilestone7',
    21: 'streakMilestone21',
    40: 'streakMilestone40',
  };

  const slot = slotMap[streak];
  if (slot) {
    await sendImmediateNotification(slot);
  }
}
