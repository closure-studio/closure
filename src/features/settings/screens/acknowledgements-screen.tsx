import feAmeLoxAvatar from '@/assets/images/acknowledgements/fe-ame-lox.jpg';
import gkAvatar from '@/assets/images/acknowledgements/gk.jpg';
import kriptoAvatar from '@/assets/images/acknowledgements/kripto.jpg';
import outdatedAvatar from '@/assets/images/acknowledgements/ooooooutdated.jpg';
import skadiAvatar from '@/assets/images/acknowledgements/skadi.jpg';
import { Image } from 'expo-image';
import { Heart, Radio, Sparkles, UsersRound } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SectionPageHeader,
  TerminalPanel,
  TerminalSectionHeading,
  TerminalText,
} from '@/components';
import type { AcknowledgementAvatarKey } from '@/schemas/acknowledgement';
import { SettingsPage } from '../components/settings-page';
import { mockAcknowledgements } from '../mocks/settings-mocks';

const contributorAvatars = {
  'ooooooutdated': outdatedAvatar,
  'fe-ame-lox': feAmeLoxAvatar,
  'kripto': kriptoAvatar,
  'skadi': skadiAvatar,
  'gk': gkAvatar,
} satisfies Record<AcknowledgementAvatarKey, number>;

export function AcknowledgementsScreen() {
  const { t } = useTranslation('settings');
  const colors = getTokens().color;

  return (
    <SettingsPage>
      <SectionPageHeader
        code={t('acknowledgements.code')}
        description={t('acknowledgements.description')}
        eyebrow={t('acknowledgements.eyebrow')}
        status={t('acknowledgements.status')}
        title={t('acknowledgements.title')}
      />

      <TerminalPanel p="$3.5" gap="$4" tone="cyan" cornerBrackets $md={{ p: '$5' }}>
        <XStack items="flex-start" gap="$3">
          <Heart size={21} color={colors.terminalCyan.val} fill={colors.terminalCyanSoft.val} />
          <MonoText grow={1} size="$3" lineHeight="$4" color="$terminalText">{t('acknowledgements.intro')}</MonoText>
        </XStack>

        <XStack flexDirection="column" gap="$4" $md={{ flexDirection: 'row', items: 'center' }}>
          <YStack
            width="$7"
            height="$7"
            shrink={0}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor="$terminalWarningBorder"
            bg="$terminalWarningSoft"
          >
            <TerminalText size="$7" lineHeight="$7" fontWeight="800" color="$terminalWarning">
              {mockAcknowledgements.recipient.avatarInitial}
            </TerminalText>
          </YStack>
          <YStack grow={1} minW={0} gap="$2">
            <TerminalSectionHeading code={t('acknowledgements.recipientCode')} title={t('acknowledgements.recipientTitle')} />
            <TerminalText size="$6" fontWeight="800" color="$terminalWarning" select="text">
              {t('acknowledgements.recipientName', { callsign: mockAcknowledgements.recipient.callsign })}
            </TerminalText>
            <MonoText size="$2.5" lineHeight="$3">
              {t('acknowledgements.recipientDescription', { callsign: mockAcknowledgements.recipient.callsign })}
            </MonoText>
          </YStack>
          <Radio size={28} color={colors.terminalWarning.val} />
        </XStack>
      </TerminalPanel>

      <TerminalPanel p="$3.5" gap="$4" $md={{ p: '$5' }}>
        <XStack flexDirection="column" gap="$2" $sm={{ flexDirection: 'row', items: 'flex-end', justify: 'space-between' }}>
          <TerminalSectionHeading code={t('acknowledgements.teamCode')} title={t('acknowledgements.teamTitle')} />
          <MonoText size="$2" maxW={420}>{t('acknowledgements.teamDescription')}</MonoText>
        </XStack>

        <XStack flexDirection="column" flexWrap="wrap" gap="$3" $lg={{ flexDirection: 'row' }}>
          {mockAcknowledgements.operationsTeam.map((member, index) => (
            <XStack
              key={member.id}
              width="100%"
              minH="$7"
              p="$3"
              items="center"
              gap="$3"
              borderWidth={1}
              borderColor="$terminalBorder"
              bg="$terminalRaisedTranslucent"
              $lg={{ width: '48.5%', grow: 1 }}
            >
              <YStack width="$5" height="$5" shrink={0} overflow="hidden" borderWidth={1} borderColor="$terminalCyanBorder" bg="$terminalBg">
                <Image
                  source={contributorAvatars[member.avatarKey]}
                  contentFit="cover"
                  style={{ width: '100%', height: '100%' }}
                  accessibilityLabel={member.name}
                />
              </YStack>
              <YStack grow={1} minW={0} gap="$1">
                <TerminalText size="$3" fontWeight="700" select="text">{member.name}</TerminalText>
                <MonoText size="$2" lineHeight="$3">{t(`acknowledgements.contributors.${member.id}`)}</MonoText>
              </YStack>
              <MonoText size="$1">{String(index + 1).padStart(2, '0')}</MonoText>
            </XStack>
          ))}
        </XStack>
      </TerminalPanel>

      <TerminalPanel p="$3.5" gap="$4" tone="warning" $md={{ p: '$5' }}>
        <TerminalSectionHeading code={t('acknowledgements.specialCode')} title={t('acknowledgements.specialTitle')} />
        <XStack flexDirection="column" gap="$3" $sm={{ flexDirection: 'row' }}>
          {mockAcknowledgements.specialThanks.map((credit) => (
            <XStack
              key={credit.id}
              grow={1}
              minH="$5"
              p="$3"
              items="center"
              gap="$3"
              borderWidth={1}
              borderColor="$terminalWarningBorder"
              bg="$terminalBg"
            >
              {credit.id === 'design'
                ? <Sparkles size={19} color={colors.terminalWarning.val} />
                : <UsersRound size={19} color={colors.terminalWarning.val} />}
              <YStack grow={1} minW={0} gap="$1">
                <MonoText size="$1" color="$terminalWarning">{t(`acknowledgements.credits.${credit.id}`)}</MonoText>
                <TerminalText size="$3" fontWeight="700" select="text">{credit.name}</TerminalText>
              </YStack>
            </XStack>
          ))}
        </XStack>
      </TerminalPanel>
    </SettingsPage>
  );
}
