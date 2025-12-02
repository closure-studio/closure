import { CONSTANTS, DEFAULT_APP_STATES } from "@/constants/constants";
import { useOTA } from "@/hooks/ota/useOTA";
import { ToastMethods, useToast } from "@/hooks/useToast";
import { IAPPStates } from "@/types/storage";
import { LOG } from "@/utils/logger/logger";
import { storage } from "@/utils/mmkv/mmkv";
import { merge } from "es-toolkit";
import React, { createContext, ReactNode, useContext } from "react";

interface SystemContextType {
  initAppStates: IAPPStates | null;
  toast: ToastMethods;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface SystemProviderProps {
  children: ReactNode;
}
// 直接从 MMKV 读取持久化数据（同步操作）
const init = (): IAPPStates => {
  const initAppStates = storage.getObject<IAPPStates>(
    CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY,
  );
  // 如果没有数据，直接返回默认值
  if (!initAppStates) {
    return DEFAULT_APP_STATES;
  }

  // 使用 merge 深度合并，initAppStates 会覆盖 DEFAULT_APP_STATES
  // 但 undefined 的字段会从 DEFAULT_APP_STATES 补全
  return merge(DEFAULT_APP_STATES, initAppStates);
};

const initAppStates = init();
const log = LOG.extend("SystemProvider");
/**
 * 全局数据 Provider
 * 提供系统级别的全局状态
 */
const SystemProvider = ({ children }: SystemProviderProps) => {
  // 处理 OTA 更新
  useOTA();
  const toast = useToast();
  const values: SystemContextType = {
    initAppStates,
    toast,
  };
  log.info("SystemProvider initialized");
  return (
    <SystemContext.Provider value={values}>{children}</SystemContext.Provider>
  );
};

/**
 * 使用全局数据的 Hook
 */
const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
};

export { SystemProvider, useSystem };
