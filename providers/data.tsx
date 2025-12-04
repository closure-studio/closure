import { CONSTANTS, DEFAULT_APP_STATES } from "@/constants/constants";
import { IAPIClients, useAPI } from "@/hooks/api/useAPI";
import { useAuth } from "@/hooks/auth/useAuth";
import { IAuthSession } from "@/types/auth";
import { IAPPStates } from "@/types/storage";
import { LOG } from "@/utils/logger/logger";
import { storage } from "@/utils/mmkv/mmkv";
import { produce } from "immer";
import React, {
  createContext,
  ReactNode,
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
  appStates: IAPPStates;
  updateAppStates: (updater: (draft: IAPPStates) => void) => void;
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
  const { initAppStates } = useSystem();
  const [appStates, setAppStates] = React.useState<IAPPStates>(
    initAppStates ?? DEFAULT_APP_STATES,
  );
  const authState = useAuth({
    credentialList: appStates.credentialRecord,
    currentCredentialUUID: appStates.currentCredentialUUID,
  });

  const apiClients = useAPI({
    serviceConfigs: appStates.apiConfigs.serviceConfigs,
    authSession: authState.currentAuthSession,
    setAuthSession: function (session: IAuthSession): void {
      // Update app config with new auth session
      setAppStates((currentStates) =>
        produce(currentStates, (draft) => {
          if (session.payload?.uuid) {
            draft.credentialRecord[session.payload.uuid] = session;
            draft.currentCredentialUUID = session.payload.uuid;
          }
        }),
      );
    },
  });

  useEffect(() => {
    storage.setObject(CONSTANTS.STORAGE_KEYS.DEFAULT_STORAGE_KEY, appStates);
  }, [appStates]);

  // use immer to update app states
  const updateAppStates = (updater: (draft: IAPPStates) => void) => {
    setAppStates((currentStates) => produce(currentStates, updater));
  };

  const currentAuthSession = useMemo(() => {
    if (appStates.currentCredentialUUID) {
      return (
        appStates.credentialRecord[appStates.currentCredentialUUID] || null
      );
    }
    return null;
  }, [appStates]);

  const values: DataContextType = {
    currentAuthSession,
    appStates,
    updateAppStates,
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
