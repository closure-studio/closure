import { useRouter } from "expo-router";
import { useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import PagerView from "react-native-pager-view";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

export default function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  // 第一个View - 主页
  const HomeView = () => (
    <View style={styles.pageContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <EditScreenInfo path="app/(tabs)/home.tsx" />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/modal")}
        >
          <Text style={styles.buttonText}>打开 Modal</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>向下滑动查看详细内容</Text>
      </View>
    </View>
  );

  // 第二个View - 具体内容
  const ContentView = () => (
    <View style={styles.pageContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>详细内容</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <Text style={styles.contentText}>
          这是详细内容页面。您可以在这里显示更多信息。
        </Text>
        <Text style={styles.hintText}>向上滑动返回主页</Text>
      </View>
    </View>
  );

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pagerView}
      initialPage={0}
      orientation="vertical"
    >
      <View key="0">
        <HomeView />
      </View>
      <View key="1">
        <ContentView />
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  contentText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    marginTop: 30,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
