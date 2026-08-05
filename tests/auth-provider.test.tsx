import { fireEvent, render } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/features/session';

const observeAuthStatus = jest.fn();

function AuthProbe() {
  const { authState, signIn, signOut } = useAuth();
  observeAuthStatus(authState.status);

  return (
    <View>
      <Text>{authState.status}</Text>
      <Button title="Sign in" onPress={signIn} />
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    observeAuthStatus.mockClear();
  });

  it('owns the in-memory authentication lifecycle', async () => {
    const screen = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('unauthenticated')).toBeTruthy();
    expect(observeAuthStatus).toHaveBeenCalledWith('checking');
    expect(observeAuthStatus).toHaveBeenLastCalledWith('unauthenticated');

    await fireEvent.press(screen.getByText('Sign in'));
    expect(screen.getByText('authenticated')).toBeTruthy();

    await fireEvent.press(screen.getByText('Sign out'));
    expect(screen.getByText('unauthenticated')).toBeTruthy();
  });

  it('requires an AuthProvider boundary', async () => {
    await expect(render(<AuthProbe />)).rejects.toThrow('useAuth must be used within an AuthProvider.');
  });
});
