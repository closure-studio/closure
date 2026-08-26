import { NetworkSettingsScreen, useApiNodesQuery } from '@/features/settings';
import { useAppStore } from '@/store';

export default function SettingsNetworkRoute() {
  const apiNodesQuery = useApiNodesQuery();
  const selectedApiNodeId = useAppStore((state) => state.selectedApiNodeId);
  const selectApiNode = useAppStore((state) => state.selectApiNode);

  return (
    <NetworkSettingsScreen
      nodes={apiNodesQuery.data ?? []}
      onRefresh={() => apiNodesQuery.refetch().then(() => undefined)}
      onSelectApiNode={selectApiNode}
      queryError={apiNodesQuery.error ?? null}
      queryStatus={apiNodesQuery.status}
      selectedApiNodeId={selectedApiNodeId}
    />
  );
}
