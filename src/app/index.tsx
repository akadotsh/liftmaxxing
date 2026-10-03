import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import {
  deletePersonalRecord,
  deleteWorkoutType,
  initializeDatabase,
  insertPersonalRecord,
  insertWorkoutType,
  loadAppData,
  type PersonalRecord,
  saveSelectedWorkoutType,
  saveWorkoutSetup,
  updatePersonalRecord,
} from '@/lib/storage';
import { cn } from '@/lib/utils';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROUTINES = [
  { name: 'Full body', schedule: '2–3 days per week', types: ['Full body'] },
  { name: 'Upper / Lower', schedule: '4 days per week', types: ['Upper', 'Lower'] },
  {
    name: 'Push / Pull / Legs',
    schedule: '3–6 days per week',
    types: ['Push', 'Pull', 'Legs'],
  },
  {
    name: 'Muscle groups',
    schedule: 'Usually 5 days per week',
    types: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'],
  },
  { name: 'Custom', schedule: 'Build your own split', types: [] },
] as const;

type Routine = (typeof ROUTINES)[number];

function RoutineOption({
  index,
  isSelected,
  onPress,
  routine,
}: {
  index: number;
  isSelected: boolean;
  onPress: () => void;
  routine: Routine;
}) {
  const scale = useSharedValue(isSelected ? 1.01 : 1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.01 : 1, { damping: 18, stiffness: 220 });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 45).duration(250)}
      style={animatedStyle}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        onPress={onPress}>
        <Card
          className={cn(
            'gap-0 py-0',
            isSelected && 'border-primary bg-primary/5'
          )}>
          <CardContent className="flex-row items-center gap-3 p-4">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold">{routine.name}</Text>
              <Text variant="muted">{routine.schedule}</Text>
              {routine.types.length > 0 && (
                <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                  {routine.types.join(' · ')}
                </Text>
              )}
            </View>
          </CardContent>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

export default function Index() {
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChangingRoutine, setIsChangingRoutine] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<string>();
  const [configuredRoutine, setConfiguredRoutine] = useState<string>();
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState('');
  const [isLoggingPr, setIsLoggingPr] = useState(false);
  const [isSavingPr, setIsSavingPr] = useState(false);
  const [editingPrId, setEditingPrId] = useState<number>();
  const [draftPr, setDraftPr] = useState({ exercise: '', reps: '', weight: '' });
  const [draftWorkoutType, setDraftWorkoutType] = useState('');
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [storageError, setStorageError] = useState<string>();
  const visibleRecords = personalRecords.filter(
    ({ workoutType }) => workoutType === selectedType
  );
  const canSavePr = Boolean(
    draftWorkoutType &&
    draftPr.exercise.trim() &&
    Number(draftPr.weight) > 0 &&
    Number.isInteger(Number(draftPr.reps)) &&
    Number(draftPr.reps) > 0
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        await initializeDatabase();
        const data = await loadAppData();
        if (!isMounted) return;

        setConfiguredRoutine(data.configuredRoutine);
        setSelectedRoutine(data.configuredRoutine);
        setWorkoutTypes(data.workoutTypes);
        setSelectedType(data.selectedType);
        setPersonalRecords(data.personalRecords);
        setIsConfigured(Boolean(data.configuredRoutine));
      } catch {
        if (isMounted) setStorageError('Could not load your saved data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine.name);
  };

  const confirmRoutine = async () => {
    const routine = ROUTINES.find(({ name }) => name === selectedRoutine);
    if (!routine) return;

    const types = [...routine.types];
    const firstType = types[0] ?? '';

    try {
      await saveWorkoutSetup(routine.name, types, firstType);
      setWorkoutTypes(types);
      setSelectedType(firstType);
      setConfiguredRoutine(routine.name);
      setIsChangingRoutine(false);
      setIsConfigured(true);
      setStorageError(undefined);
    } catch {
      setStorageError('Could not save your workout routine.');
    }
  };

  const addWorkoutType = async () => {
    const name = newType.trim();

    if (!name || workoutTypes.some((type) => type.toLowerCase() === name.toLowerCase())) return;

    try {
      await insertWorkoutType(name, workoutTypes.length);
      setWorkoutTypes([...workoutTypes, name]);
      setSelectedType(name);
      setNewType('');
      setIsAddingType(false);
      setStorageError(undefined);
    } catch {
      setStorageError('Could not save that workout type.');
    }
  };

  const removeWorkoutType = async (name: string) => {
    const remainingTypes = workoutTypes.filter((type) => type !== name);
    const nextSelectedType = selectedType === name ? (remainingTypes[0] ?? '') : selectedType;

    try {
      await deleteWorkoutType(name, nextSelectedType);
      setWorkoutTypes(remainingTypes);
      setSelectedType(nextSelectedType);
      if (draftWorkoutType === name) setDraftWorkoutType(nextSelectedType);
      setStorageError(undefined);
    } catch {
      setStorageError('Could not delete that workout type.');
    }
  };

  const chooseWorkoutType = async (workoutType: string) => {
    try {
      await saveSelectedWorkoutType(workoutType);
      setSelectedType(workoutType);
      if (isLoggingPr) setDraftWorkoutType(workoutType);
      setStorageError(undefined);
    } catch {
      setStorageError('Could not save your selected workout type.');
    }
  };

  const closePrForm = () => {
    setDraftPr({ exercise: '', reps: '', weight: '' });
    setDraftWorkoutType('');
    setEditingPrId(undefined);
    setIsLoggingPr(false);
  };

  const startNewPr = () => {
    setDraftPr({ exercise: '', reps: '', weight: '' });
    setDraftWorkoutType(selectedType);
    setEditingPrId(undefined);
    setIsLoggingPr(true);
  };

  const startEditingPr = (record: PersonalRecord) => {
    setDraftPr({
      exercise: record.exercise,
      reps: String(record.reps),
      weight: String(record.weight),
    });
    setDraftWorkoutType(record.workoutType);
    setEditingPrId(record.id);
    setIsLoggingPr(true);
  };

  const savePr = async () => {
    const exercise = draftPr.exercise.trim();
    if (!canSavePr || isSavingPr) return;

    setIsSavingPr(true);
    try {
      const values = {
        exercise,
        reps: Number(draftPr.reps),
        weight: Number(draftPr.weight),
        workoutType: draftWorkoutType,
      };

      if (editingPrId) {
        const currentRecord = personalRecords.find(({ id }) => id === editingPrId);
        if (!currentRecord) return;

        const updatedRecord = { ...currentRecord, ...values };
        await updatePersonalRecord(updatedRecord);
        setPersonalRecords((records) =>
          records.map((record) => (record.id === editingPrId ? updatedRecord : record))
        );
      } else {
        const record = await insertPersonalRecord(values);
        setPersonalRecords((records) => [record, ...records]);
      }

      closePrForm();
      setStorageError(undefined);
    } catch {
      setStorageError('Could not save that PR.');
    } finally {
      setIsSavingPr(false);
    }
  };

  const removePr = (record: PersonalRecord) => {
    Alert.alert('Delete PR?', `${record.exercise} will be permanently removed.`, [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Delete',
        onPress: async () => {
          try {
            await deletePersonalRecord(record.id);
            setPersonalRecords((records) => records.filter(({ id }) => id !== record.id));
            setStorageError(undefined);
          } catch {
            setStorageError('Could not delete that PR.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 items-center justify-center">
          <Text variant="h3">liftmaxxing</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConfigured) {
    return (
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1">
          <View className="gap-2 px-5 pt-5 pb-3">
            {isChangingRoutine && (
              <Button
                className="-ml-3 self-start"
                size="sm"
                variant="ghost"
                onPress={() => {
                  setSelectedRoutine(configuredRoutine);
                  setIsChangingRoutine(false);
                  setIsConfigured(true);
                }}>
                <Text>Cancel</Text>
              </Button>
            )}
            <Text variant="h3">How do you train?</Text>
            <Text className="text-muted-foreground leading-6">
              Pick a starting split. You can change every workout type later.
            </Text>
            {storageError && <Text className="text-destructive text-sm">{storageError}</Text>}
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="gap-2.5 px-5 pb-4">
              {ROUTINES.map((routine, index) => (
                <RoutineOption
                  key={routine.name}
                  index={index}
                  isSelected={selectedRoutine === routine.name}
                  routine={routine}
                  onPress={() => selectRoutine(routine)}
                />
              ))}
            </View>
          </ScrollView>

          <Animated.View entering={FadeInDown.delay(180).duration(250)}>
            <View className="border-border bg-background border-t px-5 pt-3 pb-2">
              <Button
                disabled={!selectedRoutine}
                size="lg"
                onPress={confirmRoutine}>
                <Text>Continue</Text>
              </Button>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
        <View className="gap-6 px-5 pt-6 pb-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-1">
                <Text variant="h3">liftmaxxing</Text>
                <Text variant="muted">Track every personal record.</Text>
                {storageError && <Text className="text-destructive text-sm">{storageError}</Text>}
              </View>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  closePrForm();
                  setIsChangingRoutine(true);
                  setIsConfigured(false);
                }}>
                <Text>Change split</Text>
              </Button>
            </View>

            <View className="gap-3">
              <View className="relative">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2 pr-8">
                    {workoutTypes.map((type) => {
                      const isSelected = (isLoggingPr ? draftWorkoutType : selectedType) === type;

                      return (
                        <View
                          key={type}
                          className={cn(
                            'border-border bg-background flex-row items-center rounded-xl border',
                            isSelected && 'border-primary bg-primary'
                          )}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            className="py-2 pr-2 pl-3"
                            onPress={() => void chooseWorkoutType(type)}>
                            <Text
                              className={cn(
                                'text-sm font-medium',
                                isSelected && 'text-primary-foreground'
                              )}>
                              {type}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={`Delete ${type}`}
                            accessibilityRole="button"
                            className="py-2 pr-3"
                            hitSlop={8}
                            onPress={() => void removeWorkoutType(type)}>
                            <Text
                              className={cn(
                                'text-muted-foreground text-base leading-4',
                                isSelected && 'text-primary-foreground'
                              )}>
                              ×
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}

                    <Button size="sm" variant="outline" onPress={() => setIsAddingType(true)}>
                      <Text>+ Add workout</Text>
                    </Button>
                  </View>
                </ScrollView>
                <View
                  pointerEvents="none"
                  className="bg-background absolute top-0 right-0 bottom-0 w-2 shadow-lg shadow-black/30"
                />
              </View>

              {isAddingType && (
                <View className="flex-row gap-2">
                  <Input
                    autoFocus
                    className="flex-1"
                    placeholder="Workout name"
                    returnKeyType="done"
                    value={newType}
                    onChangeText={setNewType}
                    onSubmitEditing={addWorkoutType}
                  />
                  <Button disabled={!newType.trim()} onPress={addWorkoutType}>
                    <Text>Add</Text>
                  </Button>
                </View>
              )}
            </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="px-5 py-2 pb-4">
            {isLoggingPr ? (
              <Animated.View entering={FadeInDown.duration(200)}>
                <Card className="gap-4 p-5">
                  <View className="flex-row items-center justify-between">
                    <View className="gap-1">
                      <Text variant="large">{editingPrId ? 'Edit PR' : 'Log a PR'}</Text>
                      <Text variant="muted">
                        {draftWorkoutType || 'Add a workout type above first'}
                      </Text>
                    </View>
                    <Button size="sm" variant="ghost" onPress={closePrForm}>
                      <Text>Cancel</Text>
                    </Button>
                  </View>

                  <View className="gap-1.5">
                    <Text className="text-sm font-medium">Exercise</Text>
                    <Input
                      autoFocus
                      placeholder="e.g. Bench press"
                      value={draftPr.exercise}
                      onChangeText={(exercise) => setDraftPr((pr) => ({ ...pr, exercise }))}
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 gap-1.5">
                      <Text className="text-sm font-medium">Weight (kg)</Text>
                      <Input
                        keyboardType="decimal-pad"
                        placeholder="100"
                        value={draftPr.weight}
                        onChangeText={(weight) => setDraftPr((pr) => ({ ...pr, weight }))}
                      />
                    </View>
                    <View className="flex-1 gap-1.5">
                      <Text className="text-sm font-medium">Reps</Text>
                      <Input
                        keyboardType="number-pad"
                        placeholder="5"
                        value={draftPr.reps}
                        onChangeText={(reps) => setDraftPr((pr) => ({ ...pr, reps }))}
                      />
                    </View>
                  </View>

                </Card>
              </Animated.View>
            ) : visibleRecords.length === 0 ? (
              <Card className="items-center gap-5 px-6 py-10">
                <View className="h-20 w-20 items-center justify-center rounded-3xl bg-black">
                  <Image
                    className="h-10 w-10"
                    resizeMode="contain"
                    source={require('../../assets/images/expo-logo.png')}
                  />
                </View>
                <View className="items-center gap-1.5">
                  <Text variant="large">
                    {selectedType ? `No ${selectedType} PRs yet` : 'No PRs yet'}
                  </Text>
                  <Text className="text-muted-foreground text-center leading-6">
                    {selectedType
                      ? `Log your first ${selectedType.toLowerCase()} lift to start tracking progress.`
                      : 'Add a workout type above to start tracking progress.'}
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="gap-3">
                <Text variant="large">Recent {selectedType} PRs</Text>
                {visibleRecords.map((record) => (
                  <Card key={record.id} className="gap-4 p-5">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="font-semibold">{record.exercise}</Text>
                        <Text variant="muted">{record.workoutType}</Text>
                      </View>
                      <View className="flex-row gap-1">
                        <Button
                          accessibilityLabel={`Edit ${record.exercise}`}
                          className="h-9 w-9"
                          size="icon"
                          variant="ghost"
                          onPress={() => startEditingPr(record)}>
                          <SymbolView
                            name={{ android: 'edit', ios: 'pencil', web: 'edit' }}
                            size={18}
                            tintColor={colors.mutedForeground}
                          />
                        </Button>
                        <Button
                          accessibilityLabel={`Delete ${record.exercise}`}
                          className="h-9 w-9"
                          size="icon"
                          variant="ghost"
                          onPress={() => removePr(record)}>
                          <SymbolView
                            name={{ android: 'delete', ios: 'trash', web: 'delete' }}
                            size={18}
                            tintColor={colors.destructive}
                          />
                        </Button>
                      </View>
                    </View>
                    <View className="flex-row items-baseline gap-2">
                      <Text className="text-2xl font-bold">{record.weight} kg</Text>
                      <Text variant="muted">{record.reps} reps</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View className="border-border bg-background border-t px-5 pt-3 pb-2">
          {isLoggingPr ? (
            <Button
              disabled={!canSavePr || isSavingPr}
              size="lg"
              onPress={savePr}>
              <Text>{isSavingPr ? 'Saving…' : editingPrId ? 'Update PR' : 'Save PR'}</Text>
            </Button>
          ) : (
            <Button disabled={!selectedType} size="lg" onPress={startNewPr}>
              <Text>{visibleRecords.length === 0 ? 'Log a PR' : 'Log another PR'}</Text>
            </Button>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
