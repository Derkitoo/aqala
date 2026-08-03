import { Platform } from 'react-native';

// Health integration is platform-specific.
// On iOS: HealthKit via a native module (expo-health or react-native-health).
// On Android: Google Fit / Health Connect.
// This service provides a unified interface with graceful fallback.

export interface ActivitySummary {
  stepCount: number;
  activeMinutes: number;
  distanceKm: number;
}

export type HealthPermissionStatus = 'granted' | 'denied' | 'unavailable';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestHealthPermission(): Promise<HealthPermissionStatus> {
  // Stub — replace with actual native module when integrating:
  // iOS:     import AppleHealthKit from 'react-native-health'
  // Android: import GoogleFit from 'react-native-google-fit'
  if (Platform.OS === 'ios') {
    return 'granted'; // placeholder
  }
  if (Platform.OS === 'android') {
    return 'granted'; // placeholder
  }
  return 'unavailable';
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

export async function getTodayActivitySummary(): Promise<ActivitySummary | null> {
  // Stub — integrate with HealthKit/Google Fit here.
  // For MVP, users log activity manually via the app.
  return null;
}

export async function getStepsForDate(date: Date): Promise<number> {
  return 0; // stub
}

// ─── Manual override ─────────────────────────────────────────────────────────

/**
 * When health data is unavailable, the app falls back to manual timer-based logging.
 * This function converts a timed activity to a rough step estimate.
 */
export function estimateStepsFromDuration(durationSeconds: number, activityType: 'walk' | 'sport' | 'stretching'): number {
  const stepsPerMinute: Record<string, number> = {
    walk:       100,
    sport:      150,
    stretching: 30,
  };
  const minutes = durationSeconds / 60;
  return Math.round(minutes * (stepsPerMinute[activityType] ?? 80));
}
