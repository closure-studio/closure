import { Text, View } from "@/components/Themed";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

function Header() {
  console.log("✨ ReactCompilerTest Header rendered");
  return <Text style={styles.title}>React Compiler 测试</Text>;
}

export default function ReactCompilerTest() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.card}>
        <Text style={styles.label}>点击次数：{count}</Text>
        <Text style={styles.info}>
          {count > 0
            ? "✅ React Compiler 正在优化此组件"
            : "👆 点击按钮开始测试"}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button]}
        onPress={() => setCount((c) => c + 1)}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>增加计数 (+1)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={() => setCount(0)}
      >
        <Text style={styles.buttonText}>重置</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "rgba(100, 100, 100, 0.1)",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
  },
  info: {
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
  },
  button: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: "#FF5722",
    opacity: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    width: "100%",
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
