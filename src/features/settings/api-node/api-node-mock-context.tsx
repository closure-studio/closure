import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { ApiNodeId } from '@/schemas/api-node';

const DEFAULT_API_NODE_ID = 'domestic' satisfies ApiNodeId;

type ApiNodeMockContextValue = {
  selectApiNode: (apiNodeId: ApiNodeId) => void;
  selectedApiNodeId: ApiNodeId;
};

const ApiNodeMockContext = createContext<ApiNodeMockContextValue | null>(null);

export function ApiNodeMockProvider({ children }: PropsWithChildren) {
  const [selectedApiNodeId, setSelectedApiNodeId] = useState<ApiNodeId>(DEFAULT_API_NODE_ID);
  const selectApiNode = useCallback((apiNodeId: ApiNodeId) => {
    setSelectedApiNodeId(apiNodeId);
  }, []);
  const contextValue = useMemo(
    () => ({ selectApiNode, selectedApiNodeId }),
    [selectApiNode, selectedApiNodeId],
  );

  return (
    <ApiNodeMockContext.Provider value={contextValue}>
      {children}
    </ApiNodeMockContext.Provider>
  );
}

export function useApiNodeMockState() {
  const apiNodeMockState = useContext(ApiNodeMockContext);
  if (!apiNodeMockState) {
    throw new Error('useApiNodeMockState must be used within an ApiNodeMockProvider.');
  }

  return apiNodeMockState;
}
