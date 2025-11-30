import { useColorScheme } from "@/components/useColorScheme";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  rightComponent?: React.ReactNode;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  rightComponent,
  editable = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: isDark ? "#D1D5DB" : "#374151" }]}>
        {label}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            rightComponent ? styles.inputWithButton : null,
            {
              backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
              color: isDark ? "#ffffff" : "#111827",
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType || "default"}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
        {rightComponent}
      </View>
    </View>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          checked && {
            backgroundColor: "#9333EA",
            borderColor: "#9333EA",
          },
          { borderColor: isDark ? "#4B5563" : "#D1D5DB" },
        ]}
      >
        {checked && <Text style={styles.checkboxCheck}>✓</Text>}
      </View>
      <Text
        style={[
          styles.checkboxLabel,
          { color: isDark ? "#D1D5DB" : "#374151" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface RadioButtonProps {
  label: string;
  value: "official" | "bilibili";
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.radioOuter,
          { borderColor: isDark ? "#4B5563" : "#D1D5DB" },
        ]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text
        style={[styles.radioLabel, { color: isDark ? "#D1D5DB" : "#374151" }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface CodeButtonProps {
  countdown: number;
  onPress: () => void;
  disabled?: boolean;
}

export const CodeButton: React.FC<CodeButtonProps> = ({
  countdown,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.codeButton,
        countdown > 0 ? styles.codeButtonDisabled : null,
      ]}
      onPress={onPress}
      disabled={countdown > 0 || disabled}
    >
      <Text
        style={[
          styles.codeButtonText,
          countdown > 0 ? styles.codeButtonTextDisabled : null,
        ]}
      >
        {countdown > 0 ? `${countdown}秒` : "获取验证码"}
      </Text>
    </TouchableOpacity>
  );
};

interface TopButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

export const TopButton: React.FC<TopButtonProps> = ({
  text,
  onPress,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      style={[
        styles.topButton,
        {
          borderColor: isDark ? "#9333EA" : "#9333EA",
          backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.topButtonText,
          { color: isDark ? "#9333EA" : "#9333EA" },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export const Separator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.separatorContainer}>
      <View
        style={[
          styles.separatorLine,
          { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
        ]}
      />
      <Text
        style={[
          styles.separatorText,
          { color: isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        OR
      </Text>
      <View
        style={[
          styles.separatorLine,
          { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithButton: {
    flex: 1,
  },
  codeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#9333EA",
    minWidth: 100,
    alignItems: "center",
  },
  codeButtonDisabled: {
    backgroundColor: "#6B7280",
  },
  codeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  codeButtonTextDisabled: {
    color: "#E5E7EB",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCheck: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9333EA",
  },
  radioLabel: {
    fontSize: 14,
  },
  topButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  topButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
});

