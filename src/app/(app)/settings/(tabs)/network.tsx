import { NetworkSettingsScreen, useNetworkSettings } from '@/features/settings';

export default function SettingsNetworkRoute() {
  const screen = useNetworkSettings();
  return <NetworkSettingsScreen {...screen} />;
}
