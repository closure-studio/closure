import feAmeLoxAvatar from '@/assets/images/contributors/fe-ame-lox.jpg';
import gkAvatar from '@/assets/images/contributors/gk.jpg';
import kriptoAvatar from '@/assets/images/contributors/kripto.jpg';
import outdatedAvatar from '@/assets/images/contributors/ooooooutdated.jpg';
import skadiAvatar from '@/assets/images/contributors/skadi.jpg';
import { Image } from 'expo-image';
import { Heart, Radio } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens, useMedia } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalText,
} from '@/components';
import type { ContributorAvatarKey } from '@/schemas/contributor';
import { SettingsPage } from '../components/settings-page';
import { mockContributors } from '../mocks/settings-mocks';

const contributorAvatars = {
  'ooooooutdated': outdatedAvatar,
  'fe-ame-lox': feAmeLoxAvatar,
  'kripto': kriptoAvatar,
  'skadi': skadiAvatar,
  'gk': gkAvatar,
} satisfies Record<ContributorAvatarKey, number>;

function ContributorsSectionHeading({ code, title }: { code: string; title: string }) {
  return (
    <XStack grow={1} shrink={1} items="baseline" justify="space-between" gap="$3" minW={0}>
      <MonoText size="$2.5" color="$appAccent" shrink={0}>
        {code}
      </MonoText>
      <TerminalText
        size="$3"
        text="right"
        fontWeight="700"
        letterSpacing={2.8}
        textTransform="uppercase"
        shrink={1}
      >
        {title}
      </TerminalText>
    </XStack>
  );
}

function ContributorRosterRow({
  description,
  imageSource,
  index,
  isLast,
  name,
}: {
  description: string;
  imageSource: number;
  index: number;
  isLast: boolean;
  name: string;
}) {
  return (
    <XStack
      testID={`contributors-roster-row-${index}`}
      minW={0}
      items="center"
      gap="$3"
      pt="$3"
      pb={isLast ? '$1' : '$3'}
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="$appBorder"
    >
      <MonoText width="$3" size="$1" color="$appAccent" shrink={0}>
        {String(index + 1).padStart(2, '0')}
      </MonoText>
      <YStack
        width="$5"
        height="$5"
        shrink={0}
        overflow="hidden"
        borderWidth={1}
        borderColor="$appAccentBorder"
        bg="$appSurfaceRaisedTranslucent"
      >
        <Image
          source={imageSource}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={name}
        />
      </YStack>
      <YStack grow={1} minW={0} gap="$1">
        <TerminalText size="$3" fontWeight="700" select="text">
          {name}
        </TerminalText>
        <MonoText size="$2" lineHeight="$3">
          {description}
        </MonoText>
      </YStack>
    </XStack>
  );
}

export function ContributorsScreen() {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;
  const media = useMedia();
  const isDesktop = Boolean(media.md);

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

        <TerminalPanel p="$3.5" gap="$4" tone="cyan" cornerBrackets $md={{ p: '$5' }}>
          <XStack items="flex-start" gap="$3">
            <Heart size={21} color={colors.appAccent.val} fill={colors.appAccentSoft.val} />
            <MonoText grow={1} size="$3" lineHeight="$4" color="$appText">{t('contributors.intro')}</MonoText>
          </XStack>

          <XStack
            flexDirection="column"
            gap="$4"
            $md={{ flexDirection: 'row', items: 'center' }}
          >
            <YStack
              width="$7"
              height="$7"
              shrink={0}
              items="center"
              justify="center"
              borderWidth={1}
              borderColor="$appWarningBorder"
              bg="$appWarningSoft"
            >
              <TerminalText size="$7" lineHeight="$7" fontWeight="800" color="$appWarning">
                {mockContributors.recipient.avatarInitial}
              </TerminalText>
            </YStack>
            <YStack grow={1} minW={0} gap="$2">
              <ContributorsSectionHeading
                code={t('contributors.recipientCode')}
                title={t('contributors.recipientTitle')}
              />
              <TerminalText size="$6" fontWeight="800" color="$appWarning" select="text">
                {t('contributors.recipientName', { callsign: mockContributors.recipient.callsign })}
              </TerminalText>
              <MonoText size="$2.5" lineHeight="$3">
                {t('contributors.recipientDescription', { callsign: mockContributors.recipient.callsign })}
              </MonoText>
            </YStack>
            <XStack self="flex-end" $md={{ self: 'auto' }}>
              <Radio size={28} color={colors.appWarning.val} />
            </XStack>
          </XStack>
        </TerminalPanel>

        <TerminalPanel
          testID="contributors-operations-panel"
          p="$3.5"
          gap="$4"
          $md={{ p: '$5' }}
        >
          <XStack
            flexDirection="column"
            gap="$2"
            $sm={{ flexDirection: 'row', items: 'flex-end', justify: 'space-between' }}
          >
            <ContributorsSectionHeading
              code={t('contributors.teamCode')}
              title={t('contributors.teamTitle')}
            />
            <MonoText size="$2" maxW={420}>{t('contributors.teamDescription')}</MonoText>
          </XStack>

          <YStack>
            {mockContributors.operationsTeam.map((member, index) => (
              <ContributorRosterRow
                key={member.id}
                description={t(`contributors.contributors.${member.id}`)}
                imageSource={contributorAvatars[member.avatarKey]}
                index={index}
                isLast={index === mockContributors.operationsTeam.length - 1}
                name={member.name}
              />
            ))}
          </YStack>
        </TerminalPanel>
      </YStack>
    </SettingsPage>
  );
}
