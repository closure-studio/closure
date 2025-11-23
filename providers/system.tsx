import { CONSTANTS } from '@/constants/constants';
import { IAPPConfig } from '@/types/storage';
import { LOG } from '@/utils/logger/logger';
import { storage } from '@/utils/mmkv/mmkv';
import React, { createContext, ReactNode, useContext } from 'react';


interface SystemContextType {
  initAppConfig: IAPPConfig | null;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface SystemProviderProps {
  children: ReactNode;
}

// 直接从 MMKV 读取持久化数据（同步操作）
const initAppConfig = storage.getObject<IAPPConfig>(CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY);

/**
 * 全局数据 Provider
 * 提供系统级别的全局状态
 */
const SystemProvider = ({ children }: SystemProviderProps) => {
  const log = LOG.extend('SystemProvider');


  const values: SystemContextType = {
    initAppConfig,
  }
  return <SystemContext.Provider value={values}>{children}</SystemContext.Provider>;
};

/**
 * 使用全局数据的 Hook
 */
const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export { SystemProvider, useSystem };
