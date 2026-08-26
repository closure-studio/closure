import { Slot } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import { useDashboardRoute } from '@/features/dashboard';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

export default function DashboardLayout() {
  const { gameAccounts, gameAccountsQuery } = useDashboardRoute();

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  return <Slot />;
}
