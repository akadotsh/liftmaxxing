import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { displayDate } from '@/lib/date';
import {
  initializeDatabase,
  loadExerciseHistory,
  type PersonalRecord,
} from '@/lib/storage';
import { THEME } from '@/lib/theme';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExerciseHistory() {
  const params = useLocalSearchParams<{ exercise?: string | string[] }>();
  const exercise = Array.isArray(params.exercise) ? params.exercise[0] : (params.exercise ?? '');
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? 'light'];
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!exercise) {
        setError('Exercise not found.');
        setIsLoading(false);
        return;
      }

      try {
        await initializeDatabase();
        const history = await loadExerciseHistory(exercise);
        if (isMounted) setRecords(history);
      } catch {
        if (isMounted) setError('Could not load exercise history.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [exercise]);

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
        <View className="flex-1">
          <Text variant="large" numberOfLines={1}>
            {exercise || 'Exercise history'}
          </Text>
          {!isLoading && !error && (
            <Text variant="muted">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 p-5"
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text variant="muted">Loading history…</Text>
        ) : error ? (
          <Text className="text-destructive">{error}</Text>
        ) : records.length === 0 ? (
          <Text variant="muted">No history found for this exercise.</Text>
        ) : (
          records.map((record) => (
            <Card key={record.id} className="gap-3 p-4">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="font-medium">{displayDate(record.performedOn)}</Text>
                <Text variant="muted">{record.workoutType}</Text>
              </View>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-2xl font-bold">{record.weight} kg</Text>
                <Text variant="muted">{record.reps} reps</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
