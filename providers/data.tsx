import { CONSTANTS, DEFAULT_APP_CONFIG } from "@/constants/constants";
import { IAPIClients, useAPI } from "@/hooks/api/useAPI";
import { useAuth } from "@/hooks/auth/useAuth";
import { IAuthSession } from "@/types/auth.js";
import { IAPPConfig } from "@/types/storage.js";
import { LOG } from "@/utils/logger/logger.js";
import { storage } from "@/utils/mmkv/mmkv.js";
import { produce } from "immer";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useSystem } from "./system";

/**
 * 全局数据 Context
 * 集成所有全局状态：认证、配置、设置等
 */
interface DataContextType {
  currentAuthSession: IAuthSession | null;
  updateAppConfig: (updater: (draft: IAPPConfig) => void) => void;
  apiClients: IAPIClients;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}
const log = LOG.extend("DataProvider");
/**
 * 全局数据 Provider
 * 集中管理所有全局状态
 */
const DataProvider = ({ children }: DataProviderProps) => {
  const { initAppConfig } = useSystem();
  const [appConfig, setAppConfig] = React.useState<IAPPConfig>(
    initAppConfig ?? DEFAULT_APP_CONFIG,
  );
  const authState = useAuth({
    credentialList: appConfig.credentialRecord,
    currentCredentialUUID: appConfig.currentCredentialUUID,
  });

  const apiClients = useAPI({
    serviceConfigs: appConfig.apiConfigs.serviceConfigs,
    authSession: authState.currentAuthSession,
    setAuthSession: function (session: IAuthSession): void {
      // Update app config with new auth session
      setAppConfig((currentConfig) =>
        produce(currentConfig, (draft) => {
          if (session.payload?.uuid) {
            draft.credentialRecord[session.payload.uuid] = session;
            draft.currentCredentialUUID = session.payload.uuid;
          }
        }),
      );
    },
  });

  useEffect(() => {
    storage.setObject(CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY, appConfig);
  }, [appConfig]);

  // use immer to update app config
  const updateAppConfig = useCallback(
    (updater: (draft: IAPPConfig) => void) => {
      log.info("Updating app config");
      setAppConfig((currentConfig) => produce(currentConfig, updater));
    },
    [],
  );

  log.info("DataProvider initialized with config", appConfig);

  const currentAuthSession = useMemo(() => {
    if (appConfig.currentCredentialUUID) {
      return (
        appConfig.credentialRecord[appConfig.currentCredentialUUID] || null
      );
    }
    return null;
  }, [appConfig]);

  useEffect(() => {
    log.info("appconfig changed: ", appConfig);
  }, [appConfig]);

  const values: DataContextType = {
    currentAuthSession,
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
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export { DataProvider, useData };
