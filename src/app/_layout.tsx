import '../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { colorScheme as nativeWindColorScheme, useColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { initializeDatabase, loadPreferences } from '@/lib/storage';
import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];

  useEffect(() => {
    const loadTheme = async () => {
      try {
        await initializeDatabase();
        const { themeMode } = await loadPreferences();
        nativeWindColorScheme.set(themeMode);
      } catch {
        // The dashboard reports storage errors; keep the system theme as a safe fallback.
      }
    };

    void loadTheme();
  }, []);

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
