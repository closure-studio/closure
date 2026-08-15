import { useTranslation } from 'react-i18next';
import { YStack } from 'tamagui';

import { SectionPageHeader } from '@/components';
import { SettingsPage } from '../../components/settings-page';
import { ContributorsOperationsRoster } from '../components/contributors-operations-roster';
import { ContributorsTribute } from '../components/contributors-tribute';
import { contributorsContent } from '../contributors-content';

export function ContributorsScreen() {
  const { t } = useTranslation('settings');
  const operationsTeam = contributorsContent.operationsTeam.map((member) => ({
    ...member,
    description: t(`contributors.contributors.${member.id}`),
  }));

  return (
    <SettingsPage
      header={(
        <SectionPageHeader
          code={t('contributors.code')}
          eyebrow={t('contributors.eyebrow')}
          status={t('contributors.status')}
          title={t('contributors.title')}
        />
      )}
    >
      <YStack gap="$3" $md={{ gap: '$5' }}>
        <ContributorsTribute
          body={t('contributors.intro')}
          recipientCode={t('contributors.recipientCode')}
          recipientCallsign={contributorsContent.recipient.callsign}
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
