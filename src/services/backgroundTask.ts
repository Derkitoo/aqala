// Background fetch not available in Expo Go — stub for Expo Go compatibility.
// Install expo-background-fetch + expo-task-manager for production builds.

export const BACKGROUND_TASK_NAME = 'aqal-daily-refresh';

export async function registerBackgroundTask(): Promise<void> {
  // no-op in Expo Go
}

export async function unregisterBackgroundTask(): Promise<void> {
  // no-op in Expo Go
}
