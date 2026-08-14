import { NetworkSettingsScreen, useApiNodesQuery } from '@/features/settings';
import { useAppStore } from '@/store';

type OperationStatus = 'failed' | 'idle' | 'pending' | 'succeeded';

export default function SettingsNetworkRoute() {
  const apiNodesQuery = useApiNodesQuery();
  const selectedApiNodeId = useAppStore((state) => state.selectedApiNodeId);
  const selectApiNode = useAppStore((state) => state.selectApiNode);

  const queryStatus: OperationStatus = apiNodesQuery.isPending
    ? 'pending'
    : apiNodesQuery.isError
      ? 'failed'
      : apiNodesQuery.data
        ? 'succeeded'
        : 'idle';

  return (
    <NetworkSettingsScreen
      nodes={apiNodesQuery.data ?? []}
      onRefresh={() => apiNodesQuery.refetch().then(() => undefined)}
      onSelectApiNode={selectApiNode}
      queryError={apiNodesQuery.error ?? null}
      queryStatus={queryStatus}
      selectedApiNodeId={selectedApiNodeId}
    />
  );
}