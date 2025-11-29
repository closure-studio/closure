import { TextStyle } from "react-native";
import Toast, { ToastShowParams } from "react-native-toast-message";

// 自定义样式配置，字体足够大
const defaultTextStyle: TextStyle = {
  fontSize: 18,
  fontWeight: "500",
};

const defaultText1Style: TextStyle = {
  fontSize: 20,
  fontWeight: "600",
};

/**
 * Toast方法类型，支持多态：可以接受string或完整的ToastShowParams
 */
type ToastMethod = {
  (message: string): void;
  (params: ToastShowParams): void;
};

/**
 * Toast工具类，提供info、warning、error、success四个方法
 * 支持多态：可以接受string或完整的ToastShowParams
 */
export interface ToastMethods {
  info: ToastMethod;
  warning: ToastMethod;
  error: ToastMethod;
  success: ToastMethod;
}

/**
 * 创建Toast方法，支持多态参数
 */
const createToastMethod = (
  type: "info" | "error" | "warning" | "success",
): ToastMethod => {
  const toastMethod = (messageOrParams: string | ToastShowParams) => {
    if (typeof messageOrParams === "string") {
      // 如果传入的是字符串，使用默认配置
      Toast.show({
        type: type === "warning" ? "warning" : type, // warning使用自定义warning类型
        text1: messageOrParams,
        text1Style: defaultText1Style,
        text2Style: defaultTextStyle,
        visibilityTime: 2000,
      });
    } else {
      // 如果传入的是完整参数，合并默认样式
      Toast.show({
        type: type === "warning" ? "warning" : type,
        text1Style: [defaultText1Style, messageOrParams.text1Style],
        text2Style: [defaultTextStyle, messageOrParams.text2Style],
        visibilityTime: 2000,
        ...messageOrParams,
      });
    }
  };
  return toastMethod as ToastMethod;
};

/**
 * 自定义Toast Hook
 * 提供info、warning、error、success四个方法，支持多态参数
 */
export const useToast = (): ToastMethods => {
  return {
    info: createToastMethod("info"),
    warning: createToastMethod("warning"),
    error: createToastMethod("error"),
    success: createToastMethod("success"),
  };
};
