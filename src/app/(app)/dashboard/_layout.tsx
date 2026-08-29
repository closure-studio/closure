import { Slot } from 'expo-router';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardAccountProvider,
  useDashboardAccount,
} from '@/features/dashboard';
import { DashboardFrame, DashboardScope } from '@/features/navigation';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

function DashboardContent() {
  const { gameAccountsQuery } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  return (
    <DashboardFrame>
      <Slot />
    </DashboardFrame>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardAccountProvider>
      <DashboardScope>
        <DashboardContent />
      </DashboardScope>
    </DashboardAccountProvider>
  );
}
