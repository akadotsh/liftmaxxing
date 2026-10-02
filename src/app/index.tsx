import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="gap-6 px-5 py-6">
          <View className="gap-1">
            <Text variant="h3">liftmaxxing</Text>
            <Text variant="muted">Track every personal record.</Text>
          </View>

          <View className="flex-row gap-2">
            <Button size="sm">
              <Text>Chest</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>Legs</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>Full body</Text>
            </Button>
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
