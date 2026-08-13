import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';

import { TerminalMarquee } from '@/components';
import type { GameAccount } from '@/schemas/game-account';
import { GameAccountSwitcher } from './dashboard-navigation';

const dashboardMarqueeMessages = [
  { id: 'network', translationKey: 'marquee.network', tone: 'accent' },
  { id: 'navigation', translationKey: 'marquee.navigation', tone: 'default' },
  { id: 'account', translationKey: 'marquee.account', tone: 'warning' },
  { id: 'sync', translationKey: 'marquee.sync', tone: 'success' },
] as const;

export type DashboardSecondaryHeaderProps = {
  activeGameAccountId: string;
  gameAccounts: readonly GameAccount[];
  onSelectGameAccount: (gameAccountId: string) => void;
};

export function DashboardSecondaryHeader({
  activeGameAccountId,
  gameAccounts,
  onSelectGameAccount,
}: DashboardSecondaryHeaderProps) {
  const { t } = useTranslation('navigation');
  return (
    <YStack testID="dashboard-secondary-header" shrink={0}>
      <TerminalMarquee items={dashboardMarqueeMessages.map((message) => ({
        id: message.id,
        label: t(message.translationKey),
        tone: message.tone,
      }))} />
      <YStack bg="$appSurface">
        <YStack px="$3.5" py="$3" $md={{ px: '$5' }}>
          <GameAccountSwitcher
            gameAccounts={gameAccounts}
            activeGameAccountId={activeGameAccountId}
            onSelectGameAccount={onSelectGameAccount}
          />
        </YStack>
      </YStack>
    </YStack>
  );
}
