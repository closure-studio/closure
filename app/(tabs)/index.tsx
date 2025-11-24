import { StyleSheet, Text, View } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <View className="flex-1 items-center justify-center bg-red">
        <Text className="text-xl font-bold text-blue-500">
          Welcome to Nativewind!
        </Text>
      </View>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
