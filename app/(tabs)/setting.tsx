import { StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/setting.tsx" />
      <TouchableOpacity
        onPress={() => router.push("/modal")}
        style={styles.linkButton}
      >
        <Text style={styles.link}>Open modal</Text>
      </TouchableOpacity>
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
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
  linkButton: {
    paddingTop: 20,
  },
});
