import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';

import { SectionPageHeader } from '@/components';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { SettingsPage } from '../../components/settings-page';
import { useSettingsSwipe } from '../../settings-swipe-context';
import { ContributorsOperationsRoster } from '../components/contributors-operations-roster';
import { ContributorsTribute } from '../components/contributors-tribute';
import { mockContributors } from '../mocks/contributors-fixture';

export function ContributorsScreen() {
  const settingsSwipe = useSettingsSwipe();
  const { t } = useTranslation('settings');
  const layoutSize = useLayoutSize();
  const operationsTeam = mockContributors.operationsTeam.map((member) => ({
    ...member,
    description: t(`contributors.contributors.${member.id}`),
  }));

  return (
    <SettingsPage
      isSwipeEnabled={settingsSwipe.enabled}
      onSwipe={settingsSwipe.onSwipe}
    >
      {layoutSize === 'large' ? (
        <SectionPageHeader
          code={t('contributors.code')}
          eyebrow={t('contributors.eyebrow')}
          status={t('contributors.status')}
          title={t('contributors.title')}
        />
      ) : null}

      <YStack gap="$3" $md={{ gap: '$5' }}>
        <ContributorsTribute
          body={t('contributors.intro')}
          recipientCode={t('contributors.recipientCode')}
          recipientCallsign={mockContributors.recipient.callsign}
          recipientPrefix={t('contributors.recipientPrefix')}
          recipientTitle={t('contributors.recipientTitle')}
        />

        <ContributorsOperationsRoster
          description={t('contributors.teamDescription')}
          members={operationsTeam}
        />
      </YStack>
    </SettingsPage>
  );
}
