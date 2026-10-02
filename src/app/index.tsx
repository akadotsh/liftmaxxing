import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
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
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChangingRoutine, setIsChangingRoutine] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<string>();
  const [configuredRoutine, setConfiguredRoutine] = useState<string>();
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState('');

  const selectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine.name);
  };

  const confirmRoutine = () => {
    const routine = ROUTINES.find(({ name }) => name === selectedRoutine);
    if (!routine) return;

    const types = [...routine.types];
    setWorkoutTypes(types);
    setSelectedType(types[0] ?? '');
    setConfiguredRoutine(routine.name);
    setIsChangingRoutine(false);
    setIsConfigured(true);
  };

  const addWorkoutType = () => {
    const name = newType.trim();

    if (!name || workoutTypes.some((type) => type.toLowerCase() === name.toLowerCase())) return;

    setWorkoutTypes([...workoutTypes, name]);
    setSelectedType(name);
    setNewType('');
    setIsAddingType(false);
  };

  const removeWorkoutType = (name: string) => {
    const remainingTypes = workoutTypes.filter((type) => type !== name);
    setWorkoutTypes(remainingTypes);

    if (selectedType === name) setSelectedType(remainingTypes[0] ?? '');
  };

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
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View className="gap-6 px-5 py-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-1">
                <Text variant="h3">liftmaxxing</Text>
                <Text variant="muted">Track every personal record.</Text>
              </View>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
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
                      const isSelected = selectedType === type;

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
                            onPress={() => setSelectedType(type)}>
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
                            onPress={() => removeWorkoutType(type)}>
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

            <Card className="items-center gap-5 px-6 py-10">
              <View className="h-20 w-20 items-center justify-center rounded-3xl bg-black">
                <Image
                  className="h-10 w-10"
                  resizeMode="contain"
                  source={require('../../assets/images/expo-logo.png')}
                />
              </View>
              <View className="items-center gap-1.5">
                <Text variant="large">No PRs yet</Text>
                <Text className="text-muted-foreground text-center leading-6">
                  Log your first lift to start tracking your progress.
                </Text>
              </View>
              <Button size="lg">
                <Text>Log your first PR</Text>
              </Button>
            </Card>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
