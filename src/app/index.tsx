import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [workoutTypes, setWorkoutTypes] = useState(['Chest', 'Legs']);
  const [selectedType, setSelectedType] = useState('Chest');
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState('');

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

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="gap-6 px-5 py-6">
          <View className="gap-1">
            <Text variant="h3">liftmaxxing</Text>
            <Text variant="muted">Track every personal record.</Text>
          </View>

          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
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

              <Button
                className="rounded-xl"
                size="sm"
                variant="outline"
                onPress={() => setIsAddingType(true)}>
                <Text>+ Add workout</Text>
              </Button>
            </View>

            {isAddingType && (
              <View className="flex-row gap-2">
                <Input
                  autoFocus
                  className="flex-1 rounded-xl"
                  placeholder="Workout name"
                  returnKeyType="done"
                  value={newType}
                  onChangeText={setNewType}
                  onSubmitEditing={addWorkoutType}
                />
                <Button
                  className="rounded-xl"
                  disabled={!newType.trim()}
                  onPress={addWorkoutType}>
                  <Text>Add</Text>
                </Button>
              </View>
            )}
          </View>

          <Card>
            <CardHeader>
              <CardDescription>Today&apos;s best</CardDescription>
              <CardTitle className="text-2xl">Bench press</CardTitle>
            </CardHeader>
            <CardContent className="flex-row items-end justify-between">
              <View>
                <Text className="text-4xl font-bold">100 kg</Text>
                <Text variant="muted">5 reps</Text>
              </View>
              <Text className="text-emerald-600 font-semibold">New PR</Text>
            </CardContent>
          </Card>

          <View className="gap-3">
            <Text variant="large">Recent PRs</Text>

            <Card className="gap-0 py-0">
              <CardContent className="flex-row items-center justify-between py-4">
                <View className="gap-1">
                  <Text className="font-semibold">Incline dumbbell press</Text>
                  <Text variant="muted">Chest · Yesterday</Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold">32.5 kg</Text>
                  <Text variant="muted">8 reps</Text>
                </View>
              </CardContent>

              <View className="bg-border mx-6 h-px" />

              <CardContent className="flex-row items-center justify-between py-4">
                <View className="gap-1">
                  <Text className="font-semibold">Back squat</Text>
                  <Text variant="muted">Legs · 28 Sep</Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold">140 kg</Text>
                  <Text variant="muted">3 reps</Text>
                </View>
              </CardContent>
            </Card>
          </View>

          <Button size="lg">
            <Text>Log a PR</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
