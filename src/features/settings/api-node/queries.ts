import { useQuery } from '@tanstack/react-query';

import { apiNodeApi } from './api';
import { unwrapResult } from '@/utils/failure-error';
import type { ApiNode } from '@/schemas/api-node';
import type { ApiNodeFailure } from './api';
import { useAppStore } from '@/store';

export function useNetworkSettings() {
  const query = useApiNodesQuery();
  const selectedApiNodeId = useAppStore((state) => state.selectedApiNodeId);
  const onSelectApiNode = useAppStore((state) => state.selectApiNode);
  return {
    nodes: query.data ?? [], selectedApiNodeId, onSelectApiNode,
    onRefresh: () => query.refetch().then(() => undefined),
    queryError: query.error ?? null, queryStatus: query.status,
  };
}

export function useApiNodesQuery() {
  return useQuery<ApiNode[], ApiNodeFailure>({
    queryKey: ['api-nodes'],
    staleTime: Infinity,
    queryFn: async ({ signal }) => unwrapResult(await apiNodeApi.queryNodes(signal)),
  });
}
