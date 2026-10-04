import '../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { NAV_THEME } from '@/lib/theme';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];

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
