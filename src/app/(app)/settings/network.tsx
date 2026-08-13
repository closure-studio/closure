import { NetworkSettingsScreen } from '@/features/settings';
import { useEffect } from 'react';
import { useAppStore } from '@/store';

export default function SettingsNetworkRoute() {
  const nodes = useAppStore((state) => state.network.nodes);
  const queryError = useAppStore((state) => state.network.queryError);
  const queryStatus = useAppStore((state) => state.network.queryStatus);
  const selectedApiNodeId = useAppStore((state) => state.network.selectedApiNodeId);
  const initializeApiNodes = useAppStore((state) => state.initializeApiNodes);
  const refreshApiNodes = useAppStore((state) => state.refreshApiNodes);
  const selectApiNode = useAppStore((state) => state.selectApiNode);

  useEffect(() => {
    initializeApiNodes().catch((error: unknown) => {
      console.error('Unable to load API Nodes.', error);
    });
  }, [initializeApiNodes]);

  return (
    <NetworkSettingsScreen
      nodes={nodes}
      onRefresh={refreshApiNodes}
      onSelectApiNode={selectApiNode}
      queryError={queryError}
      queryStatus={queryStatus}
      selectedApiNodeId={selectedApiNodeId}
    />
  );
}
