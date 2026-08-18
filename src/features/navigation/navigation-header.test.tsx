import { fireEvent, render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { NavigationHeader } from './components/navigation-header';

const TEST_AVATAR_URL = 'https://avatars.githubusercontent.com/u/1?v=4';

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

async function renderHeader() {
  const onSettingsPress = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <NavigationHeader
        avatarLabel="Doctor profile"
        avatarUrl={TEST_AVATAR_URL}
        isSettingsActive={false}
        onSettingsPress={onSettingsPress}
        settingsLabel="Open settings"
        title="Overview"
      />
    </TamaguiProvider>,
  );

  return { onSettingsPress, screen };
}

describe('NavigationHeader profile avatar', () => {
  it('renders one network avatar with the shared alpha treatment', async () => {
    const { screen } = await renderHeader();

    expect(screen.getByLabelText('Doctor profile')).toBeTruthy();
    expect(screen.getAllByTestId('avatar')).toHaveLength(1);
    expect(screen.getByTestId('avatar-svg')).toBeTruthy();
    expect(screen.getByTestId('avatar-mask')).toBeTruthy();
    expect(screen.getByTestId('avatar-mask-svg')).toBeTruthy();
    expect(screen.getByTestId('avatar-fallback-image')).toBeTruthy();
    expect(screen.getByTestId('avatar-source-image').props.src).toEqual({ uri: TEST_AVATAR_URL });

    const avatar = screen.getByTestId('avatar');
    expect(avatar.props.style).toEqual(expect.objectContaining({ width: 52, height: 52 }));

    const frame = screen.getByTestId('avatar-frame');
    expect(frame.props.style).not.toHaveProperty('borderWidth');
  });

  it('preserves the settings button interaction', async () => {
    const { onSettingsPress, screen } = await renderHeader();

    await fireEvent.press(screen.getByLabelText('Open settings'));

    expect(onSettingsPress).toHaveBeenCalledTimes(1);
  });

  it('renders the settings icon at the enlarged header size', async () => {
    const { screen } = await renderHeader();
    const settingsButton = screen.getByLabelText('Open settings');
    const settingsIcons = settingsButton.queryAll((instance) => (
      instance.type === 'RNSVGSvgView'
      && instance.props.width === 24
      && instance.props.height === 24
    ));

    expect(settingsIcons).toHaveLength(1);
    expect(settingsIcons[0]?.props).toEqual(expect.objectContaining({ width: 24, height: 24 }));
  });
});
