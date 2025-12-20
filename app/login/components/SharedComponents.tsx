import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold mb-2 text-base-content">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        <TextInput
          className={`flex-1 rounded-btn px-4 py-3.5 text-base bg-base-200 text-base-content ${
            rightComponent ? "" : ""
          }`}
          placeholder={placeholder}
          placeholderTextColor="rgb(156 163 175)"
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
  return (
    <TouchableOpacity
      className="flex-row items-center mb-4 disabled:opacity-50"
      onPress={onPress}
      disabled={disabled}
    >
      <View
        className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
          checked
            ? "bg-primary border-primary"
            : "bg-transparent border-base-300"
        }`}
      >
        {checked && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
      </View>
      <Text className="text-sm flex-1 text-base-content">{label}</Text>
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
  return (
    <TouchableOpacity
      className="flex-row items-center mb-3 disabled:opacity-50"
      onPress={onPress}
      disabled={disabled}
    >
      <View className="w-5 h-5 rounded-full border-2 mr-2 items-center justify-center border-base-300">
        {selected && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </View>
      <Text className="text-sm text-base-content">{label}</Text>
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
  const isDisabled = countdown > 0 || disabled;
  return (
    <TouchableOpacity
      className={`px-4 py-3.5 rounded-btn min-w-[100px] items-center ${
        isDisabled ? "bg-base-300" : "bg-primary"
      }`}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        className={`text-sm font-semibold ${
          isDisabled ? "text-base-content/50" : "text-primary-content"
        }`}
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
  return (
    <TouchableOpacity
      className="border border-primary rounded-btn py-3 px-4 items-center mb-4 bg-base-100 disabled:opacity-50"
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-sm font-semibold text-primary">{text}</Text>
    </TouchableOpacity>
  );
};

export const Separator: React.FC = () => {
  return (
    <View className="flex-row items-center mb-6">
      <View className="flex-1 h-px bg-base-300" />
      <Text className="mx-4 text-xs font-semibold text-base-content/60">
        OR
      </Text>
      <View className="flex-1 h-px bg-base-300" />
    </View>
  );
};
