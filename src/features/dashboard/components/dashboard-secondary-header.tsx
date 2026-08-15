import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';

import { TerminalMarquee } from '@/components';

const dashboardMarqueeMessages = [
  { id: 'network', translationKey: 'marquee.network', tone: 'accent' },
  { id: 'navigation', translationKey: 'marquee.navigation', tone: 'default' },
  { id: 'account', translationKey: 'marquee.account', tone: 'warning' },
  { id: 'sync', translationKey: 'marquee.sync', tone: 'success' },
] as const;

export function DashboardSecondaryHeader() {
  const { t } = useTranslation('navigation');
  return (
    <YStack testID="dashboard-secondary-header" shrink={0}>
      <TerminalMarquee items={dashboardMarqueeMessages.map((message) => ({
        id: message.id,
        label: t(message.translationKey),
        tone: message.tone,
      }))} />
    </YStack>
  );
}
