import { Redirect } from 'expo-router';

import { settingsDefaultPage } from '@/features/navigation';

export default function SettingsIndexRoute() {
  return <Redirect href={settingsDefaultPage.route} />;
}
