import { fireEvent, render } from '@testing-library/react-native';
import { Grid2X2, UsersRound } from 'lucide-react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { DesktopNavigationSidebar } from './components/desktop-navigation-sidebar';

async function renderSidebar(scope: 'dashboard' | 'settings' = 'dashboard') {
  const onLogout = jest.fn();
  const onSelect = jest.fn();
  const onToggleScope = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <DesktopNavigationSidebar
          activeId="overview"
          items={[
            { id: 'overview', icon: Grid2X2, label: 'Overview' },
            { id: 'operators', icon: UsersRound, label: 'Operators' },
          ]}
          onLogout={onLogout}
          onSelect={onSelect}
          onToggleScope={onToggleScope}
          scope={scope}
        />
      </I18nextProvider>
    </TamaguiProvider>,
  );

  return { onLogout, onSelect, onToggleScope, screen };
}

describe('DesktopNavigationSidebar', () => {
  it('renders one supplied navigation list and reports selections', async () => {
    const { onSelect, screen } = await renderSidebar();

    expect(screen.getByText('Overview', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('Operators', { includeHiddenElements: true })).toBeTruthy();

    await fireEvent.press(screen.getByText('Operators', { includeHiddenElements: true }));
    expect(onSelect).toHaveBeenCalledWith('operators');
  });

  it('delegates scope changes and logout', async () => {
    const { onLogout, onToggleScope, screen } = await renderSidebar('settings');

    await fireEvent.press(screen.getByLabelText(
      i18n.t('navigation:scopeSwitcher.returnToDashboard'),
      { includeHiddenElements: true },
    ));
    await fireEvent.press(screen.getByText(
      i18n.t('common:actions.logout'),
      { includeHiddenElements: true },
    ));

    expect(onToggleScope).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
