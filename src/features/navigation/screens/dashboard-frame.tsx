import { type PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { getTokens, YStack } from 'tamagui';

import {
  DashboardShell,
  getGameAvatarImageUrl,
  selectBackdropTint,
  useDashboardAccount,
} from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';
import { NavigationFrame } from '../components/navigation-frame';
import { NavigationHeader } from '../components/navigation-header';
import {
  dashboardDefaultPage,
  dashboardPagesList,
  dashboardPageHref,
  getDashboardPageId,
  settingsDefaultPage,
} from '../navigation-config';
import { useAppLogout } from '../navigation-actions';

export function DashboardFrame({ children }: PropsWithChildren) {
  const colors = getTokens().color;
  const { t } = useTranslation('navigation');
  const { t: tDashboard } = useTranslation('dashboard');
  const pathname = usePathname();
  const router = useRouter();
  const onLogout = useAppLogout();
  const { setBackdropTint } = useSessionBackdrop();
  const {
    gameAccountsQuery,
    selectedGameAccount,
    selectGameAccount,
  } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];
  const backdropTint = selectBackdropTint(selectedGameAccount, {
    primary: colors.appAccent.val,
    warning: colors.appWarning.val,
    muted: colors.appMuted.val,
  });
  const activePageId = getDashboardPageId(pathname) ?? dashboardDefaultPage.id;
  const items = dashboardPagesList.map((page) => ({
    icon: page.icon,
    id: page.id,
    label: tDashboard(`navigation.sections.${page.id}.label`),
  }));

  useEffect(() => {
    setBackdropTint(backdropTint);
  }, [backdropTint, setBackdropTint]);

  const handleSelect = (pageId: string) => {
    const page = dashboardPagesList.find((candidate) => candidate.id === pageId);
    if (!page || !selectedGameAccount || page.id === activePageId) return;
    router.replace(dashboardPageHref(page.id, selectedGameAccount.account));
  };

  const handleOpenSettings = () => {
    router.push(settingsDefaultPage.route);
  };

  return (
    <NavigationFrame
      activeId={activePageId}
      header={(
        <YStack shrink={0} borderBottomWidth={1} borderColor="$appBorder">
          <NavigationHeader
            avatarLabel={t('smallScreen.avatarLabel')}
            avatarUrl={getGameAvatarImageUrl(selectedGameAccount?.avatar)}
            isSettingsActive={false}
            onSettingsPress={handleOpenSettings}
            settingsLabel={t('scopeSwitcher.openSettings')}
            title={selectedGameAccount?.nickname ?? ''}
          />
        </YStack>
      )}
      items={items}
      onLogout={onLogout}
      onSelect={handleSelect}
      onToggleScope={handleOpenSettings}
      scope="dashboard"
      smallScreenEdges={[]}
    >
      <DashboardShell
        gameAccounts={gameAccounts}
        onSelectGameAccount={selectGameAccount}
        selectedGameAccountId={selectedGameAccount?.account ?? ''}
      >
        {children}
      </DashboardShell>
    </NavigationFrame>
  );
}
