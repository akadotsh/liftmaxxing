import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NewPrBadge } from '@/components/new-pr-badge';
import { Text } from '@/components/ui/text';
import { displayDate } from '@/lib/date';
import { getNewPrIds } from '@/lib/pr';
import {
  initializeDatabase,
  loadAppData,
  type PersonalRecord,
  type WeightUnit,
} from '@/lib/storage';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { displayWeight } from '@/lib/weight';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_WORKOUTS = 'All';

export default function History() {
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? 'light'];
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [selectedType, setSelectedType] = useState(ALL_WORKOUTS);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await initializeDatabase();
        const data = await loadAppData();
        if (isMounted) {
          setRecords(data.personalRecords);
          setWeightUnit(data.preferences.weightUnit);
        }
      } catch {
        if (isMounted) setError('Could not load your PR history.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const workoutTypes = useMemo(
    () => [ALL_WORKOUTS, ...new Set(records.map(({ workoutType }) => workoutType))],
    [records]
  );
  const newPrIds = useMemo(() => getNewPrIds(records), [records]);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter(
      ({ exercise, workoutType }) =>
        (selectedType === ALL_WORKOUTS || workoutType === selectedType) &&
        (!query || exercise.toLowerCase().includes(query))
    );
  }, [records, search, selectedType]);

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
          <Text variant="h3">History</Text>
          {!isLoading && !error && (
            <Text variant="muted">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </Text>
          )}
        </View>
      </View>

      <View className="gap-3 px-5 pt-4 pb-3">
        <Input
          accessibilityLabel="Search exercises"
          placeholder="Search exercises"
          returnKeyType="search"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-5">
            {workoutTypes.map((type) => {
              const isSelected = type === selectedType;

              return (
                <Button
                  key={type}
                  accessibilityState={{ selected: isSelected }}
                  className="rounded-2xl px-3"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onPress={() => setSelectedType(type)}>
                  <Text>{type}</Text>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text variant="muted">Loading history…</Text>
        </View>
      ) : error ? (
        <View className="px-5 py-4">
          <Text className="text-destructive">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          contentContainerClassName={cn('gap-3 px-5 pb-5', filteredRecords.length === 0 && 'flex-1')}
          keyExtractor={({ id }) => String(id)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-1 px-6">
              <Text variant="large">No matching PRs</Text>
              <Text className="text-muted-foreground text-center">
                Try another workout type or exercise name.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityHint="Opens exercise history"
              accessibilityLabel={`${item.exercise} history`}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/exercise/[exercise]',
                  params: { exercise: item.exercise },
                })
              }>
              <Card className="gap-3 p-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="font-semibold" numberOfLines={1}>
                      {item.exercise}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-muted-foreground text-xs">
                        {displayDate(item.performedOn)}
                      </Text>
                      {newPrIds.has(item.id) && <NewPrBadge />}
                    </View>
                  </View>
                  {selectedType === ALL_WORKOUTS && (
                    <Text variant="muted">{item.workoutType}</Text>
                  )}
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold">
                    {displayWeight(item.weight, weightUnit)} {weightUnit}
                  </Text>
                  <Text variant="muted">{item.reps} reps</Text>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
