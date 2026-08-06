import feAmeLoxAvatar from '@/assets/images/contributors/fe-ame-lox.jpg';
import gkAvatar from '@/assets/images/contributors/gk.jpg';
import kriptoAvatar from '@/assets/images/contributors/kripto.jpg';
import outdatedAvatar from '@/assets/images/contributors/ooooooutdated.jpg';
import skadiAvatar from '@/assets/images/contributors/skadi.jpg';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';
import { XStack, YStack, styled } from 'tamagui';

import { MonoText, TerminalText } from '@/components';
import type { ContributorAvatarKey, Contributors } from '@/schemas/contributor';

const ROW_REVEAL_STAGGER_MS = 45;
const ROW_REVEAL_DURATION_MS = 420;

const contributorAvatars = {
  'ooooooutdated': outdatedAvatar,
  'fe-ame-lox': feAmeLoxAvatar,
  'kripto': kriptoAvatar,
  'skadi': skadiAvatar,
  'gk': gkAvatar,
} satisfies Record<ContributorAvatarKey, number>;

type OperationsTeamMember = Contributors['operationsTeam'][number] & {
  description: string;
};

type ContributorsOperationsRosterProps = {
  description: string;
  members: readonly OperationsTeamMember[];
};

const RosterFrame = styled(YStack, {
  name: 'ContributorsOperationsRoster',
  position: 'relative',
  overflow: 'hidden',
  bg: '$appSurface',
  borderWidth: 1,
  borderColor: '$appBorder',
  borderTopColor: '$appAccentBorder',
  borderBottomColor: '$appAccentBorder',
  rounded: '$0',
});

const RosterRowFrame = styled(XStack, {
  name: 'ContributorsOperationsRosterRow',
  position: 'relative',
  overflow: 'hidden',
  minW: 0,
  items: 'center',
  gap: '$3',
  px: '$3',
  py: '$2',
  bg: '$appSurface',
  borderBottomWidth: 1,
  borderColor: '$appBorder',
  transition: '100ms',
  hoverStyle: {
    bg: '$appAccentSoft',
  },
  $xs: {
    px: '$3.5',
  },
  $md: {
    px: '$4',
  },

  variants: {
    last: {
      true: {
        borderBottomWidth: 0,
      },
    },
  } as const,
});

const PortraitFrame = styled(YStack, {
  name: 'ContributorsOperationsPortrait',
  position: 'relative',
  width: '$5',
  height: '$5',
  shrink: 0,
  overflow: 'hidden',
  bg: '$appSurfaceRaisedTranslucent',
  '$platform-web': {
    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
  },
});

function ContributorRosterRow({
  index,
  isLast,
  member,
  reducedMotion,
}: {
  index: number;
  isLast: boolean;
  member: OperationsTeamMember;
  reducedMotion: boolean;
}) {
  const entering = reducedMotion
    ? undefined
    : FadeInRight
      .duration(ROW_REVEAL_DURATION_MS)
      .delay(index * ROW_REVEAL_STAGGER_MS);

  return (
    <Animated.View
      {...(entering ? { entering } : {})}
      style={styles.animatedRow}
    >
      <RosterRowFrame
        testID={`contributors-roster-row-${member.id}`}
        last={isLast}
      >
        <PortraitFrame testID={`contributors-roster-avatar-${member.id}`}>
          <Image
            source={contributorAvatars[member.avatarKey]}
            contentFit="cover"
            style={styles.portrait}
            accessibilityLabel={member.name}
          />
        </PortraitFrame>

        <YStack
          grow={1}
          minW={0}
          shrink={1}
          justify="center"
          gap="$1"
          $xs={{ flexDirection: 'row', items: 'center', gap: '$3' }}
        >
          <TerminalText
            testID={`contributors-roster-name-${member.id}`}
            width="100%"
            minW={0}
            shrink={0}
            size="$3"
            lineHeight="$4"
            fontWeight="800"
            letterSpacing={-0.7}
            color="$appText"
            select="text"
            $xs={{ width: '$8', ml: '$-1.5' }}
            $lg={{ width: '$12', size: '$4' }}
          >
            {member.name}
          </TerminalText>

          <MonoText
            grow={1}
            minW={0}
            shrink={1}
            size="$2"
            lineHeight="$3"
            color="$appMuted"
            select="text"
          >
            {member.description}
          </MonoText>
        </YStack>
      </RosterRowFrame>
    </Animated.View>
  );
}

export function ContributorsOperationsRoster({
  description,
  members,
}: ContributorsOperationsRosterProps) {
  const reducedMotion = useReducedMotion();

  return (
    <YStack testID="contributors-operations-panel" gap="$3">
      <MonoText
        testID="contributors-team-description"
        size="$2"
        lineHeight="$3"
        color="$appText"
        select="text"
      >
        {description}
      </MonoText>

      <RosterFrame>
        {members.map((member, index) => (
          <ContributorRosterRow
            key={member.id}
            index={index}
            isLast={index === members.length - 1}
            member={member}
            reducedMotion={reducedMotion}
          />
        ))}
      </RosterFrame>
    </YStack>
  );
}

const styles = StyleSheet.create({
  animatedRow: {
    width: '100%',
  },
  portrait: {
    height: '100%',
    width: '100%',
  },
});
