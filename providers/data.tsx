import { LOG } from '@/utils/logger/logger';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { AuthState } from './auth';
import { useSystem } from './system';

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface DataContextType extends AuthState {
  // 在这里可以添加其他全局数据类型
  // 例如：
  // config: ConfigState;
  // settings: SettingsState;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

/**
 * 全局数据 Provider
 * 集中管理所有全局状态
 */
const DataProvider = ({ children }: DataProviderProps) => {
  const log = LOG.extend('DataProvider');
  // 使用认证 hook
  // const auth = useAuthState();

  // 这里可以添加其他全局状态 hooks
  // const config = useConfigState();
  // const settings = useSettingsState();
  const { config } = useSystem();
  log.info('DataProvider initialized with config', config);

  const values: DataContextType = useMemo(() => ({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    login: function (email: string, password: string): Promise<void> {
      throw new Error('Function not implemented.');
    },
    logout: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    refreshUserInfo: function (): Promise<void> {
      throw new Error('Function not implemented.');
    }
  }), [config]);

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
