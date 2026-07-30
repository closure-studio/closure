import { useRouter } from 'expo-router';

import { SettingsScreen } from '@/features/settings';

export default function SettingsRoute() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return <SettingsScreen onBack={handleBack} />;
}
