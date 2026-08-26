import { Slot } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import { useGameAccountsQuery } from '@/features/dashboard';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

export default function DashboardLayout() {
  const gameAccountsQuery = useGameAccountsQuery();
  const gameAccounts = gameAccountsQuery.data ?? [];

  let content = <Slot />;
  if (gameAccountsQuery.isPending) content = <DashboardState label="LOADING ARKHOST DATA" />;
  else if (gameAccountsQuery.isError) content = <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  else if (gameAccounts.length === 0) content = <DashboardState label="NO GAME ACCOUNTS" />;

  return content;
}
