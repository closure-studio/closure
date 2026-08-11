import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { SettingsSwipeProvider } from './settings-swipe-context';
import { mockContributors } from './mocks/settings-mocks';
import { ContributorsScreen } from './screens/contributors-screen';

jest.mock('@/providers/ui-settings-provider', () => ({
  useUiSettings: () => ({ layoutSize: 'small' }),
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

async function renderContributors() {
  return await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <SettingsSwipeProvider enabled onSwipe={jest.fn()}>
          <ContributorsScreen />
        </SettingsSwipeProvider>
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('ContributorsScreen', () => {
  it('renders every operations team member without the removed credits section', async () => {
    const screen = await renderContributors();

    expect(screen.getByTestId('contributors-tribute')).toBeTruthy();
    expect(screen.queryByText('记录共同维护 可露希尔 的贡献者。')).toBeNull();
    expect(screen.queryByText('A record of the contributors who keep Closure moving.')).toBeNull();
    expect(screen.queryByTestId('contributors-tribute-bottom-accent')).toBeNull();
    expect(screen.getByTestId('contributors-tribute-recipient-title')).toHaveTextContent(
      i18n.t('contributors.recipientTitle', { ns: 'settings' }),
    );
    expect(screen.getByTestId('contributors-tribute-recipient-prefix')).toHaveTextContent(
      i18n.t('contributors.recipientPrefix', { ns: 'settings' }),
    );
    expect(screen.getByTestId('contributors-tribute-recipient-callsign')).toHaveTextContent(
      mockContributors.recipient.callsign,
    );
    expect(screen.getByTestId('contributors-tribute-body')).toHaveTextContent(
      i18n.t('contributors.intro', { ns: 'settings' }),
    );
    expect(screen.getByTestId('contributors-operations-panel')).toBeTruthy();
    expect(screen.getByTestId('contributors-team-description')).toHaveTextContent(
      i18n.t('contributors.teamDescription', { ns: 'settings' }),
    );
    expect(screen.getAllByTestId(/contributors-roster-row-/)).toHaveLength(
      mockContributors.operationsTeam.length,
    );
    for (const [index, member] of mockContributors.operationsTeam.entries()) {
      expect(screen.getByTestId(`contributors-roster-name-${member.id}`)).toHaveTextContent(
        member.name,
      );
      expect(screen.getByTestId(`contributors-roster-avatar-${member.id}`)).toHaveStyle({
        width: 52,
        height: 52,
      });
      expect(screen.getByTestId(`contributors-roster-name-${member.id}`)).toHaveStyle({
        fontSize: 16,
        lineHeight: 24,
      });
      expect(
        screen.getByText(i18n.t(`contributors.contributors.${member.id}`, { ns: 'settings' })),
      ).toBeTruthy();
      expect(screen.queryByText(String(index + 1).padStart(2, '0'))).toBeNull();
    }
    expect(screen.queryByText('Special Thanks')).toBeNull();
    expect(screen.queryByText('特别鸣谢')).toBeNull();
  });
});
