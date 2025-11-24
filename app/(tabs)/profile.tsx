import { Text, View } from "@/components/Themed";
import { useData } from "@/providers/data";
import { useClosure } from "@/providers/services/useClosure";
import { UUID } from "@/types/auth";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { currentAuthSession } = useData();
  const { logout } = useClosure();

  const handleLogout = (uuid: UUID) => {
    Alert.alert("确认登出", "你确定要退出登录吗？", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确认",
        style: "destructive",
        onPress: async () => {
          await logout(uuid);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>个人中心</Text>
      </View>

      {currentAuthSession && (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>邮箱:</Text>
            <Text style={styles.value}>
              {currentAuthSession.payload?.email ?? ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>UUID:</Text>
            <Text style={styles.value}>
              {currentAuthSession.payload?.uuid ?? ""}
            </Text>
          </View>
          {/* 
          <View style={styles.infoRow}>
            <Text style={styles.label}>权限:</Text>
            <Text style={styles.value}>
              {authInfo.isAdmin ? '管理员' : '普通用户'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>状态:</Text>
            <Text style={styles.value}>
              {authInfo.status === 1 ? '正常' : '异常'}
            </Text>
          </View> */}
        </View>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        disabled={!currentAuthSession?.payload?.uuid}
        onPress={() => {
          handleLogout(currentAuthSession?.payload?.uuid || "");
        }}
      >
        <Text style={styles.logoutButtonText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 20,
    backgroundColor: "transparent",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    width: 100,
    color: "#666",
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
