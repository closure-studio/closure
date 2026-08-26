import { Slot } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import { DashboardRouteProvider, useDashboardRoute } from '@/features/dashboard';
import { NavigationLayout } from '@/features/navigation';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

function DashboardContent() {
  const { gameAccount, gameAccounts, gameAccountsQuery } = useDashboardRoute();

  let content = <Slot />;

  if (gameAccountsQuery.isPending) content = <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) content = <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) content = <DashboardState label="NO GAME ACCOUNTS" />;

  return (
    <NavigationLayout gameAccount={gameAccount} scope="dashboard">
      {content}
    </NavigationLayout>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardRouteProvider>
      <DashboardContent />
    </DashboardRouteProvider>
  );
}
