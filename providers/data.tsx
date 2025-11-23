import { CONSTANTS, DEFAULT_APP_CONFIG } from '@/constants/constants';
import { IAPIClients, useAPI } from '@/hooks/api/useAPI';
import { useAuth } from '@/hooks/auth/useAuth';
import { IAuthSession } from '@/types/auth';
import { IAPPConfig } from '@/types/storage';
import { LOG } from '@/utils/logger/logger';
import { storage } from '@/utils/mmkv/mmkv';
import { produce } from 'immer';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useSystem } from './system';

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface DataContextType {
  // 在这里可以添加其他全局数据类型
  // 例如：
  // config: ConfigState;
  // settings: SettingsState;
  updateAppConfig: (updater: (draft: IAPPConfig) => void) => void;
  apiClients: IAPIClients;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}
const log = LOG.extend('DataProvider');
/**
 * 全局数据 Provider
 * 集中管理所有全局状态
 */
const DataProvider = ({ children }: DataProviderProps) => {

  const { initAppConfig } = useSystem();
  const [appConfig, setAppConfig] = React.useState<IAPPConfig>(initAppConfig ?? DEFAULT_APP_CONFIG);
  const authState = useAuth({
    credentialList: appConfig.credentialRecord,
    currentCredentialUUID: appConfig.currentCredentialUUID,
  });


  const apiClients = useAPI({
    serviceConfigs: appConfig.apiConfigs.serviceConfigs,
    authSession: authState.currentAuthSession,
    setAuthSession: function (session: IAuthSession): void {
      throw new Error('Function not implemented.');
    }
  })

  useEffect(() => {
    storage.setObject(CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY, appConfig);
  }, [appConfig]);

// use immer to update app config
const updateAppConfig = (updater: (draft: IAPPConfig) => void) => {
  setAppConfig((currentConfig) => produce(currentConfig, updater));
};

log.info('DataProvider initialized with config', appConfig);

const values: DataContextType = {
  updateAppConfig,
  apiClients,
};
return <DataContext.Provider value={values}>{children}</DataContext.Provider>;
};

/**
 * 使用全局数据的 Hook
 */
const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataProvider, useData };
