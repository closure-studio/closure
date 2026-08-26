import { Slot } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import { useDashboardRoute } from '@/features/dashboard';
import { DashboardFrame } from '@/features/navigation';

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

  let content = <Slot />;
  if (gameAccountsQuery.isPending) content = <DashboardState label="LOADING ARKHOST DATA" />;
  else if (gameAccountsQuery.isError) content = <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  else if (gameAccounts.length === 0) content = <DashboardState label="NO GAME ACCOUNTS" />;

  return <DashboardFrame>{content}</DashboardFrame>;
}
