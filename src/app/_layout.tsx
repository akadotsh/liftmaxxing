import '../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { colorScheme as nativeWindColorScheme, useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';

import { initializeDatabase, loadPreferences } from '@/lib/storage';
import { NAV_THEME } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        await initializeDatabase();
        const { themeMode } = await loadPreferences();
        nativeWindColorScheme.set(themeMode);
      } catch {
        // The dashboard reports storage errors; keep the system theme as a safe fallback.
      } finally {
        setIsReady(true);
      }
    };

    void loadTheme();
  }, []);

  useEffect(() => {
    if (isReady) SplashScreen.hide();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      />
      <PortalHost />
    </ThemeProvider>
  );
}
