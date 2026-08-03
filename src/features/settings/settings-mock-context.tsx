import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { ApiNodeId } from '@/schemas/api-node';

const DEFAULT_API_NODE_ID = 'domestic' satisfies ApiNodeId;

type SettingsMockContextValue = {
  selectApiNode: (apiNodeId: ApiNodeId) => void;
  selectedApiNodeId: ApiNodeId;
};

const SettingsMockContext = createContext<SettingsMockContextValue | null>(null);

export function SettingsMockProvider({ children }: PropsWithChildren) {
  const [selectedApiNodeId, setSelectedApiNodeId] = useState<ApiNodeId>(DEFAULT_API_NODE_ID);
  const selectApiNode = useCallback((apiNodeId: ApiNodeId) => {
    setSelectedApiNodeId(apiNodeId);
  }, []);
  const contextValue = useMemo(
    () => ({ selectApiNode, selectedApiNodeId }),
    [selectApiNode, selectedApiNodeId],
  );

  return (
    <SettingsMockContext.Provider value={contextValue}>
      {children}
    </SettingsMockContext.Provider>
  );
}

export function useSettingsMockState() {
  const settingsMockState = useContext(SettingsMockContext);
  if (!settingsMockState) {
    throw new Error('useSettingsMockState must be used within a SettingsMockProvider.');
  }

  return settingsMockState;
}
