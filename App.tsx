// Must be first import
import 'react-native-gesture-handler';

import React, { Component, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';

import { Colors } from './src/constants/theme';

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
// Catches any React rendering error and displays it on screen
// instead of showing a blank white page.

interface EBState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1a0a0a', padding: 20 }}>
          <Text style={{ color: '#ff4444', fontSize: 22, fontWeight: 'bold', marginTop: 40 }}>
            ❌ Erreur de rendu
          </Text>
          <Text style={{ color: '#ff8888', fontSize: 14, marginTop: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
            {this.state.error?.message}
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
            {this.state.error?.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// ─── Lazy loaded app content ──────────────────────────────────────────────────
// We lazy-import ALL the heavy modules so that if any native module crashes,
// the ErrorBoundary can catch and display the error instead of white screen.

function AppContent() {
  const [ready, setReady] = useState(false);
  const [modules, setModules] = useState<{
    useAppStore: any;
    useDayStore: any;
    useStreakStore: any;
    RootNavigator: any;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        // Import stores and navigator dynamically to catch import-time errors
        const appStore = await import('./src/store/useAppStore');
        const dayStore = await import('./src/store/useDayStore');
        const streakStore = await import('./src/store/useStreakStore');
        const nav = await import('./src/navigation/RootNavigator');

        setModules({
          useAppStore: appStore.useAppStore,
          useDayStore: dayStore.useDayStore,
          useStreakStore: streakStore.useStreakStore,
          RootNavigator: nav.RootNavigator,
        });
      } catch (e: any) {
        console.error('[module load error]', e);
        setLoadError(e?.message || String(e));
      }
    }
    loadModules();
  }, []);

  if (loadError) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#1a0a0a', padding: 20 }}>
        <Text style={{ color: '#ff4444', fontSize: 22, fontWeight: 'bold', marginTop: 40 }}>
          ❌ Erreur au chargement des modules
        </Text>
        <Text style={{ color: '#ff8888', fontSize: 14, marginTop: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }}>
          {loadError}
        </Text>
      </ScrollView>
    );
  }

  if (!modules) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={{ color: Colors.text?.secondary || '#888', marginTop: 16, fontSize: 14 }}>
          Chargement des modules...
        </Text>
      </View>
    );
  }

  return <HydratedApp modules={modules} />;
}

// ─── Hydrated App ─────────────────────────────────────────────────────────────

function HydratedApp({ modules }: { modules: any }) {
  const { useAppStore, useDayStore, useStreakStore, RootNavigator } = modules;

  const _hasHydrated = useAppStore((s: any) => s._hasHydrated);
  const setHasHydrated = useAppStore((s: any) => s.setHasHydrated);
  const setLocation = useAppStore((s: any) => s.setLocation);
  const setPermissions = useAppStore((s: any) => s.setPermissions);
  const latitude = useAppStore((s: any) => s.latitude);
  const longitude = useAppStore((s: any) => s.longitude);
  const calculationMethod = useAppStore((s: any) => s.calculationMethod);
  const madhab = useAppStore((s: any) => s.madhab);
  const refreshDay = useDayStore((s: any) => s.refreshDay);
  const currentStreak = useStreakStore((s: any) => s.currentStreak);

  useEffect(() => {
    // Fallback timer — force hydration on web where AsyncStorage callback may stall
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [setHasHydrated]);

  useEffect(() => {
    if (_hasHydrated) {
      bootstrapApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  async function bootstrapApp() {
    try {
      refreshDay();
    } catch (e) {
      console.warn('[bootstrap refreshDay]', e);
    }

    // Skip all native-only operations on web
    if (Platform.OS === 'web') {
      setPermissions(false, false);
      return;
    }

    try {
      const Location = await import('expo-location');
      let currentLat = latitude;
      let currentLon = longitude;

      const { status } = await Location.requestForegroundPermissionsAsync();
      const locGranted = status === 'granted';

      if (locGranted) {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          currentLat = loc.coords.latitude;
          currentLon = loc.coords.longitude;
          setLocation(currentLat, currentLon);
        } catch (locErr) {
          console.warn('[bootstrap location]', locErr);
        }
      }

      const { requestNotificationPermission, scheduleDailyPrayerNotifications,
              scheduleKnowledgeReminder, scheduleActivityReminder,
              scheduleSocialReminder, scheduleBedtimeReminder,
              scheduleMobilityBreaks, sendStreakMilestone } =
        await import('./src/services/notifications');
      const { getPrayerSchedule } = await import('./src/services/prayerTimes');
      const { isStreakMilestone } = await import('./src/engine/streakManager');

      const notifGranted = await requestNotificationPermission();
      setPermissions(locGranted, notifGranted);

      if (locGranted && notifGranted && currentLat !== null && currentLon !== null) {
        const schedule = getPrayerSchedule(currentLat, currentLon, new Date(), calculationMethod, madhab);
        await scheduleDailyPrayerNotifications(schedule);
        await scheduleKnowledgeReminder(schedule.maghrib);
        await scheduleActivityReminder(schedule.maghrib);
        await scheduleSocialReminder();
        await scheduleBedtimeReminder();
        await scheduleMobilityBreaks();
      }

      const milestone = isStreakMilestone(currentStreak);
      if (milestone) await sendStreakMilestone(milestone);
    } catch (e) {
      console.warn('[bootstrap]', e);
    }
  }

  if (!_hasHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={{ color: Colors.text?.secondary || '#888', marginTop: 16, fontSize: 14 }}>
          Hydratation du store...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg.primary }} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    ...(Platform.OS === 'web'
      ? { minHeight: '100vh' as any, minWidth: '100vw' as any }
      : {}),
  },
  splash: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...(Platform.OS === 'web'
      ? { minHeight: '100vh' as any, minWidth: '100vw' as any }
      : {}),
  },
});
