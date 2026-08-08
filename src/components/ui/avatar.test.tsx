import { render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { Avatar, type AvatarProps } from './avatar';

const TEST_AVATAR_URL = 'https://avatars.githubusercontent.com/u/1?v=4';

async function renderAvatar(props?: Partial<AvatarProps>) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Avatar
        accessibilityLabel="Operator avatar"
        source={TEST_AVATAR_URL}
        {...props}
      />
    </TamaguiProvider>,
  );
}

describe('Avatar', () => {
  it('renders a remote source above the bundled fallback', async () => {
    const screen = await renderAvatar();

    expect(screen.getByLabelText('Operator avatar')).toBeTruthy();
    expect(screen.getByTestId('avatar-mask')).toBeTruthy();
    expect(screen.getByTestId('avatar-fallback-image')).toBeTruthy();
    expect(screen.getByTestId('avatar-source-image').props.src).toEqual({ uri: TEST_AVATAR_URL });
    expect(screen.getByTestId('avatar').props.style).toEqual(
      expect.objectContaining({ width: 52, height: 52 }),
    );
  });

  it('keeps the bundled fallback when the source is missing', async () => {
    const screen = await renderAvatar({ size: 40, source: undefined });

    expect(screen.getByTestId('avatar-fallback-image')).toBeTruthy();
    expect(screen.queryByTestId('avatar-source-image')).toBeNull();
    expect(screen.getByTestId('avatar').props.style).toEqual(
      expect.objectContaining({ width: 40, height: 40 }),
    );
  });
});
