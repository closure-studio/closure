import { LOG } from '@/utils/logger/logger';
import { STORAGE_KEYS, storageUtils } from '@/utils/storage';
import React, { createContext, ReactNode, useContext } from 'react';


interface SystemContextType {
  config: any;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface SystemProviderProps {
  children: ReactNode;
}

// 直接从 MMKV 读取持久化数据（同步操作）
const config = storageUtils.getObject(STORAGE_KEYS.SERVICE_CONFIGS) || { aa: 'bb' };

/**
 * 全局数据 Provider
 * 提供系统级别的全局状态
 */
const SystemProvider = ({ children }: SystemProviderProps) => {
  const log = LOG.extend('SystemProvider');


  const values: SystemContextType = {
    // 展开所有认证相关字段
    config,
    // 这里可以添加其他全局数据
    // settings,
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
