import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { HorizontalSwipeProvider } from '@/components';
import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { mockContributors } from './mocks/settings-mocks';
import { ContributorsScreen } from './screens/contributors-screen';

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
        <HorizontalSwipeProvider>
          <ContributorsScreen />
        </HorizontalSwipeProvider>
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('ContributorsScreen', () => {
  it('renders every operations team member without the removed credits section', async () => {
    const screen = await renderContributors();

    expect(screen.getByTestId('contributors-operations-panel')).toBeTruthy();
    expect(screen.getAllByTestId(/contributors-roster-row-/)).toHaveLength(
      mockContributors.operationsTeam.length,
    );
    expect(screen.queryByText('Special Thanks')).toBeNull();
    expect(screen.queryByText('特别鸣谢')).toBeNull();
  });
});
