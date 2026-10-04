import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function NewPrBadge() {
  return (
    <View className="bg-primary shrink-0 rounded-lg px-2 py-0.5">
      <Text className="text-primary-foreground text-[10px] font-bold uppercase">New PR</Text>
    </View>
  );
}
