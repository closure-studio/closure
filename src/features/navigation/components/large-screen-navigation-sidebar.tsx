import { ChevronLeft, LogOut, Orbit } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, MonoText, TerminalText } from '@/components';
import type { NavigationScope } from '../navigation-config';

export type DesktopNavigationItem = {
  icon: LucideIcon;
  id: string;
  label: string;
};

type LargeScreenNavigationSidebarProps = {
  activeId: string;
  items: readonly DesktopNavigationItem[];
  onLogout: () => void;
  onSelect: (itemId: string) => void;
  onToggleScope: () => void;
  scope: NavigationScope;
};

export function LargeScreenNavigationSidebar({
  activeId,
  items,
  onLogout,
  onSelect,
  onToggleScope,
  scope,
}: LargeScreenNavigationSidebarProps) {
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;
  const isSettings = scope === 'settings';

  return (
    <YStack
      display="none"
      width={224}
      shrink={0}
      borderRightWidth={1}
      borderColor="$appBorder"
      bg="$appSurface"
      $large={{ display: 'flex', width: 256 }}
    >
      <YStack px="$4.5" py="$4.5" gap="$2" borderBottomWidth={1} borderColor="$appBorder">
        <TerminalText size="$5" fontWeight="800" letterSpacing={2.8}>
          {tDashboard('navigation.brandTitle')}
        </TerminalText>
        <MonoText size="$1">{tDashboard('navigation.brandSubtitle')}</MonoText>
        <YStack mt="$1">
          <DecorativeBarcode />
        </YStack>
      </YStack>

      <YStack grow={1} minH={0} px="$3" py="$4" gap="$1.5" overflow="hidden">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              unstyled
              minH={isSettings ? '$5' : '$4.5'}
              px="$3"
              py="$2"
              flexDirection="row"
              items="center"
              justify="flex-start"
              gap="$3"
              borderWidth={1}
              borderColor={isActive ? '$appAccentBorder' : 'transparent'}
              bg={isActive ? '$appAccentSoft' : 'transparent'}
              hoverStyle={{
                borderColor: isSettings ? '$appAccentBorder' : '$appBorder',
                bg: '$appSurfaceRaised',
              }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onSelect(item.id)}
              aria-pressed={isActive}
              $platform-web={{
                clipPath: isSettings
                  ? 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))'
                  : 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              <Icon
                size={isSettings ? 19 : 18}
                color={isActive ? colors.appAccent.val : colors.appMuted.val}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <TerminalText
                size="$3"
                fontWeight={isActive ? '700' : '500'}
                color={isActive ? '$appAccent' : '$appMuted'}
                numberOfLines={1}
              >
                {item.label}
              </TerminalText>
            </Button>
          );
        })}
      </YStack>

      <YStack px="$3" pb="$3">
        <Button
          unstyled
          minH="$5"
          px="$3"
          flexDirection="row"
          items="center"
          justify="flex-start"
          borderWidth={1}
          borderColor={isSettings ? '$appAccentBorder' : '$appBorder'}
          bg={isSettings ? '$appAccentSoft' : '$appSurfaceRaisedTranslucent'}
          hoverStyle={{ borderColor: '$appAccentBorder', bg: '$appAccentSoft' }}
          pressStyle={{ opacity: 0.7 }}
          onPress={onToggleScope}
          aria-label={t(isSettings ? 'scopeSwitcher.returnToDashboard' : 'scopeSwitcher.openSettings')}
          $platform-web={{
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
        >
          <XStack items="center" gap="$2.5">
            {isSettings
              ? <ChevronLeft size={16} color={colors.appAccent.val} />
              : <Orbit size={17} color={colors.appAccent.val} />}
            <TerminalText size="$2.5" color="$appAccent" fontWeight="700">
              {t(isSettings ? 'scopeSwitcher.dashboard' : 'scopeSwitcher.settings')}
            </TerminalText>
          </XStack>
        </Button>
      </YStack>

      <YStack px="$4.5" py="$4" borderTopWidth={1} borderColor="$appBorder">
        <Button
          unstyled
          height="$4"
          px="$3"
          flexDirection="row"
          items="center"
          justify="center"
          gap="$2"
          borderWidth={1}
          borderColor="$appBorder"
          hoverStyle={{ borderColor: '$appWarningBorder', bg: '$appWarningSoft' }}
          pressStyle={{ opacity: 0.7 }}
          onPress={onLogout}
        >
          <LogOut size={14} color={colors.appMuted.val} />
          <MonoText size="$2">{tCommon('actions.logout')}</MonoText>
        </Button>
      </YStack>
    </YStack>
  );
}
