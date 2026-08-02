import { Redirect } from 'expo-router';

import { settingsNavigation } from '@/features/navigation';

export default function SettingsIndexRoute() {
  return <Redirect href={settingsNavigation.defaultPage.route} />;
}
