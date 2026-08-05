import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Home, BarChart2 } from 'lucide-react-native';
import { useScaledTheme, ThemeColors } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { BackButton } from '../components/BackButton';

// Required for React Navigation performance & stability (native only)
if (Platform.OS !== 'web') {
  enableScreens();
}

// Screens
import { OnboardingScreen }        from '../screens/OnboardingScreen';
import { HomeScreen }              from '../screens/HomeScreen';
import { GoldenMomentScreen }      from '../screens/GoldenMomentScreen';
import { PillarSpiritualScreen }   from '../screens/PillarSpiritualScreen';
import { PillarKnowledgeScreen }   from '../screens/PillarKnowledgeScreen';
import { PillarPhysicalScreen }    from '../screens/PillarPhysicalScreen';
import { PillarSocialScreen }      from '../screens/PillarSocialScreen';
import { PillarSleepScreen }       from '../screens/PillarSleepScreen';
import { WeeklyReportScreen }      from '../screens/WeeklyReportScreen';
import { SettingsScreen }          from '../screens/SettingsScreen';

// ─── Route types ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding:      undefined;
  Tabs:            undefined;
  GoldenMoment:    { type?: 'morning' | 'evening' } | undefined;
  PillarSpiritual: undefined;
  PillarKnowledge: undefined;
  PillarPhysical:  undefined;
  PillarSocial:    undefined;
  PillarSleep:     undefined;
  WeeklyReport:    undefined;
  Settings:        undefined;
};

export type TabParamList = {
  Home:    undefined;
  Report:  undefined;
};

// ─── Navigators ───────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function TabIcon({ Icon, focused, Colors }: { Icon: any; focused: boolean; Colors: ThemeColors }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.15 : 1, { damping: 10 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        color={focused ? Colors.gold : Colors.text.muted}
        size={24}
        strokeWidth={focused ? 2.5 : 2}
      />
    </Animated.View>
  );
}

function TabNavigator() {
  const { Colors, Typography } = useScaledTheme();
  const insets = useSafeAreaInsets();
  // Floats above the home indicator / gesture bar instead of a fixed offset
  // that only happened to look right without one (e.g. standalone PWA on
  // a notched phone, where env(safe-area-inset-bottom) is no longer 0).
  const bottomOffset = Math.max(25, insets.bottom + 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: 20,
          right: 20,
          backgroundColor: Colors.bg.card,
          borderRadius: 30,
          height: 65,
          borderWidth: 1,
          borderColor: Colors.bg.cardBorder,
          borderTopColor: Colors.bg.cardBorder, // override default RN border
          elevation: 5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontFamily: Typography.fonts.semibold,
          marginTop: -5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Aujourd'hui",
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} Colors={Colors} />,
        }}
      />
      <Tab.Screen
        name="Report"
        component={WeeklyReportScreen}
        options={{
          title: 'Rapport',
          tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart2} focused={focused} Colors={Colors} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const { onboardingComplete } = useAppStore();
  const { Colors, Typography } = useScaledTheme();

  const screenOptions = {
    headerStyle:      { backgroundColor: Colors.bg.primary },
    headerShadowVisible: false,
    headerTintColor:  Colors.text.primary,
    headerTitleAlign: 'center' as const,
    headerTitleStyle: { fontWeight: Typography.weights.bold as any },
    headerBackVisible: false,
    headerLeft:       ({ canGoBack }: { canGoBack?: boolean }) =>
      canGoBack ? <BackButton /> : null,
    contentStyle:     { backgroundColor: Colors.bg.primary },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={screenOptions}
      >
        {!onboardingComplete ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false, animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />

            {/* Golden Moment — full screen lock */}
            <Stack.Screen
              name="GoldenMoment"
              component={GoldenMomentScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'fade',
              }}
            />

            {/* Pillar screens.
                headerShown: false — each of these screens renders its own
                <ScreenHeader/> (square back button + accent kicker + title),
                which is the header the design reference specifies. Keeping the
                native header as well would stack two titles on every screen.
                Routes and params are unchanged. */}
            <Stack.Screen name="PillarSpiritual" component={PillarSpiritualScreen}
              options={{ title: 'Pilier Spirituel', headerShown: false }} />
            <Stack.Screen name="PillarKnowledge" component={PillarKnowledgeScreen}
              options={{ title: 'Pilier du Savoir', headerShown: false }} />
            <Stack.Screen name="PillarPhysical"  component={PillarPhysicalScreen}
              options={{ title: 'Pilier Physique', headerShown: false }} />
            <Stack.Screen name="PillarSocial"    component={PillarSocialScreen}
              options={{ title: 'Pilier Social', headerShown: false }} />
            <Stack.Screen name="PillarSleep"     component={PillarSleepScreen}
              options={{ title: 'Pilier Sommeil', headerShown: false }} />
            <Stack.Screen name="WeeklyReport"    component={WeeklyReportScreen}
              options={{ title: 'Rapport Hebdomadaire', headerShown: false }} />
            <Stack.Screen name="Settings"        component={SettingsScreen}
              options={{ title: 'Paramètres', headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
