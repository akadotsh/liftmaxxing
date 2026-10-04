import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  initializeDatabase,
  loadPreferences,
  savePreference,
  type ThemeMode,
  type WeightUnit,
} from '@/lib/storage';
import { THEME } from '@/lib/theme';
import { Host, Picker } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  colorScheme as nativeWindColorScheme,
  useColorScheme,
} from 'nativewind';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const UNIT_OPTIONS: { label: string; value: WeightUnit }[] = [
  { label: 'Kilograms', value: 'kg' },
  { label: 'Pounds', value: 'lb' },
];

export default function Settings() {
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? 'light'];
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const load = async () => {
      try {
        await initializeDatabase();
        const preferences = await loadPreferences();
        setThemeMode(preferences.themeMode);
        setWeightUnit(preferences.weightUnit);
      } catch {
        setError('Could not load your preferences.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const changeTheme = async (nextTheme: ThemeMode) => {
    setThemeMode(nextTheme);
    nativeWindColorScheme.set(nextTheme);
    try {
      await savePreference('themeMode', nextTheme);
      setError(undefined);
    } catch {
      setError('Could not save your theme.');
    }
  };

  const changeWeightUnit = async (nextUnit: WeightUnit) => {
    setWeightUnit(nextUnit);
    try {
      await savePreference('weightUnit', nextUnit);
      setError(undefined);
    } catch {
      setError('Could not save your weight unit.');
    }
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <View className="border-border flex-row items-center gap-3 border-b px-4 py-3">
        <Button accessibilityLabel="Go back" size="icon" variant="ghost" onPress={router.back}>
          <SymbolView
            name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }}
            size={20}
            tintColor={colors.foreground}
          />
        </Button>
        <Text variant="h3">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        showsVerticalScrollIndicator={false}>
        {error && <Text className="text-destructive py-4 text-sm">{error}</Text>}

        <View className="border-border flex-row items-center gap-4 border-b py-5">
          <View className="flex-1 gap-1">
            <Text className="font-semibold">Theme</Text>
            <Text variant="muted">Choose how liftmaxxing looks.</Text>
          </View>
          <Host
            colorScheme={colorScheme ?? 'light'}
            matchContents={{ vertical: true }}
            style={{ width: 110 }}>
            <Picker<ThemeMode>
              enabled={!isLoading}
              selectedValue={themeMode}
              onValueChange={(value) => void changeTheme(value)}>
              {THEME_OPTIONS.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </Host>
        </View>

        <View className="border-border flex-row items-center gap-4 border-b py-5">
          <View className="flex-1 gap-1">
            <Text className="font-semibold">Weight unit</Text>
            <Text variant="muted">Your saved data stays accurate when switching units.</Text>
          </View>
          <Host
            colorScheme={colorScheme ?? 'light'}
            matchContents={{ vertical: true }}
            style={{ width: 110 }}>
            <Picker<WeightUnit>
              enabled={!isLoading}
              selectedValue={weightUnit}
              onValueChange={(value) => void changeWeightUnit(value)}>
              {UNIT_OPTIONS.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </Host>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
