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
import { MenuView } from '@expo/ui/community/menu';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  colorScheme as nativeWindColorScheme,
  useColorScheme,
} from 'nativewind';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const UNIT_OPTIONS: { label: string; value: WeightUnit }[] = [
  { label: 'kg', value: 'kg' },
  { label: 'lbs', value: 'lb' },
];

function SettingPicker<T extends string>({
  colorScheme,
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  colorScheme: 'dark' | 'light';
  disabled: boolean;
  label: string;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  value: T;
}) {
  if (Platform.OS === 'web') {
    return (
      <Host colorScheme={colorScheme} matchContents={{ vertical: true }} style={{ width: 80 }}>
        <Picker<T> enabled={!disabled} selectedValue={value} onValueChange={onChange}>
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </Host>
    );
  }

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <MenuView
      actions={options.map((option) => ({
        attributes: { disabled },
        id: option.value,
        title: option.label,
      }))}
      colorScheme={colorScheme}
      style={{ width: 80 }}
      onPressAction={({ nativeEvent }) => onChange(nativeEvent.event as T)}>
      <View
        accessible
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityRole="button"
        className="w-full flex-row items-center justify-end gap-1 py-2"
        style={{ opacity: disabled ? 0.5 : 1 }}>
        <Text className="text-muted-foreground text-sm font-medium">{selectedLabel}</Text>
        <SymbolView
          name={{ android: 'arrow_drop_down', ios: 'chevron.down', web: 'arrow_drop_down' }}
          size={14}
          tintColor={THEME[colorScheme].mutedForeground}
        />
      </View>
    </MenuView>
  );
}

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
    if (nextUnit === weightUnit) return;

    try {
      await savePreference('weightUnit', nextUnit);
      setWeightUnit(nextUnit);
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

        <View className="border-border flex-row items-center gap-4 border-b py-4">
          <Text className="flex-1 font-semibold">Theme</Text>
          <SettingPicker
            colorScheme={colorScheme ?? 'light'}
            disabled={isLoading}
            label="Theme"
            options={THEME_OPTIONS}
            value={themeMode}
            onChange={(value) => void changeTheme(value)}
          />
        </View>

        <View className="border-border flex-row items-center gap-4 border-b py-4">
          <Text className="flex-1 font-semibold">Weight unit</Text>
          <SettingPicker
            colorScheme={colorScheme ?? 'light'}
            disabled={isLoading}
            label="Weight unit"
            options={UNIT_OPTIONS}
            value={weightUnit}
            onChange={(value) => void changeWeightUnit(value)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
