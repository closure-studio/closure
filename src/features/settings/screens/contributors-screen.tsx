import { useTranslation } from 'react-i18next';
import { YStack, useMedia } from 'tamagui';

import { MonoText, SectionPageHeader } from '@/components';
import { ContributorsOperationsRoster } from '../components/contributors-operations-roster';
import { ContributorsTribute } from '../components/contributors-tribute';
import { SettingsPage } from '../components/settings-page';
import { mockContributors } from '../mocks/settings-mocks';

export function ContributorsScreen() {
  const { t } = useTranslation('settings');
  const media = useMedia();
  const isDesktop = Boolean(media.md);
  const operationsTeam = mockContributors.operationsTeam.map((member) => ({
    ...member,
    description: t(`contributors.contributors.${member.id}`),
  }));

  return (
    <SettingsPage>
      {isDesktop ? (
        <SectionPageHeader
          code={t('contributors.code')}
          description={t('contributors.description')}
          eyebrow={t('contributors.eyebrow')}
          status={t('contributors.status')}
          title={t('contributors.title')}
        />
      ) : null}

      <YStack gap="$3" $md={{ gap: '$5' }}>
        {!isDesktop ? (
          <MonoText size="$2" lineHeight="$3" color="$appText" select="text">
            {t('contributors.description')}
          </MonoText>
        ) : null}

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
